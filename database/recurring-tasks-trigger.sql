-- =====================================================
-- RECURRING TASKS AUTOMATION (Replaces Backend Cron)
-- =====================================================
-- This SQL creates a function and trigger to automatically
-- create tasks from recurring_tasks templates

-- Enable pg_cron extension (Supabase Pro feature)
-- For free tier, you'll need to manually trigger this function daily
-- or use Supabase Edge Functions with a scheduled invocation

-- Function to create tasks from recurring templates
CREATE OR REPLACE FUNCTION create_recurring_tasks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec RECORD;
  should_create BOOLEAN;
  task_date DATE;
BEGIN
  task_date := CURRENT_DATE;
  
  -- Loop through active recurring tasks
  FOR rec IN 
    SELECT rt.*, e.id as assigned_to_id
    FROM recurring_tasks rt
    JOIN employees e ON e.id = rt.assigned_to
    WHERE rt.is_active = TRUE
      AND (rt.end_date IS NULL OR rt.end_date >= task_date)
      AND (rt.start_date IS NULL OR rt.start_date <= task_date)
  LOOP
    should_create := FALSE;
    
    -- Check if task should be created based on recurrence type
    IF rec.recurrence_type = 'WEEKLY' THEN
      -- Check if today is the specified day of week (0=Sunday, 1=Monday, etc.)
      should_create := EXTRACT(DOW FROM task_date) = rec.day_of_week;
      
    ELSIF rec.recurrence_type = 'MONTHLY' THEN
      -- Check if today is the specified day of month
      should_create := EXTRACT(DAY FROM task_date) = rec.day_of_month;
    END IF;
    
    -- Create task if conditions are met and no task exists for today
    IF should_create THEN
      -- Check if task already exists for today
      IF NOT EXISTS (
        SELECT 1 FROM tasks 
        WHERE recurring_task_id = rec.id 
        AND DATE(created_at) = task_date
      ) THEN
        -- Create the task
        INSERT INTO tasks (
          task_number,
          title,
          details,
          status,
          due_date,
          assigned_to,
          created_by,
          recurring_task_id
        )
        VALUES (
          (SELECT COALESCE(MAX(task_number), 0) + 1 FROM tasks),
          rec.title,
          rec.details,
          'OPEN',
          task_date + INTERVAL '7 days', -- Default 7 days from creation
          rec.assigned_to_id,
          rec.created_by,
          rec.id
        );
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- =====================================================
-- OPTION 1: Manual Trigger (FREE TIER)
-- =====================================================
-- Run this query manually once per day at 2 AM (or via GitHub Actions)
-- SELECT create_recurring_tasks();

-- =====================================================
-- OPTION 2: Supabase Edge Function (FREE/PRO)
-- =====================================================
-- Create an edge function that calls this and schedule it
-- See: https://supabase.com/docs/guides/functions/schedule-functions

-- =====================================================
-- OPTION 3: pg_cron Extension (SUPABASE PRO ONLY)
-- =====================================================
-- Uncomment below if you have Supabase Pro plan

/*
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run daily at 2 AM
SELECT cron.schedule(
  'create-recurring-tasks',
  '0 2 * * *', -- Every day at 2 AM
  $$ SELECT create_recurring_tasks(); $$
);
*/

-- =====================================================
-- TESTING
-- =====================================================
-- Test the function manually:
-- SELECT create_recurring_tasks();

-- View scheduled jobs (pg_cron only):
-- SELECT * FROM cron.job;

-- =====================================================
-- GITHUB ACTIONS ALTERNATIVE (FREE)
-- =====================================================
-- Create a GitHub Action workflow that calls Supabase REST API:
-- 
-- name: Daily Recurring Tasks
-- on:
--   schedule:
--     - cron: '0 2 * * *'  # 2 AM UTC daily
-- jobs:
--   create_tasks:
--     runs-on: ubuntu-latest
--     steps:
--       - name: Call Supabase Function
--         run: |
--           curl -X POST \
--             'https://your-project.supabase.co/rest/v1/rpc/create_recurring_tasks' \
--             -H "apikey: ${{ secrets.SUPABASE_SERVICE_KEY }}" \
--             -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}"

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Free tier: Use GitHub Actions or manual trigger
-- 2. Pro tier: Use pg_cron extension (most reliable)
-- 3. Edge Functions: Use Supabase Cron (invoke scheduled function)
-- 4. The function is idempotent - safe to run multiple times per day
