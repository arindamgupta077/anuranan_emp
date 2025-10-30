import cron from 'node-cron';
import { supabase } from '../lib/supabase';

/**
 * Recurring Tasks Job
 * Runs daily to spawn tasks from recurring task rules
 */
export const startRecurringJob = () => {
  const schedule = process.env.CRON_SCHEDULE || '0 2 * * *'; // Default: 2 AM UTC daily

  console.log(`Starting recurring tasks job with schedule: ${schedule}`);

  cron.schedule(schedule, async () => {
    console.log('[CRON] Running recurring tasks spawn job...');
    
    try {
      // Get all active recurring tasks
      const { data: recurringTasks, error } = await supabase
        .from('recurring_tasks')
        .select('*')
        .or('end_date.is.null,end_date.gte.now()'); // Only active rules

      if (error) {
        console.error('[CRON] Error fetching recurring tasks:', error);
        return;
      }

      if (!recurringTasks || recurringTasks.length === 0) {
        console.log('[CRON] No recurring tasks to process');
        return;
      }

      const today = new Date();
      const currentDayOfWeek = today.getUTCDay(); // 0-6 (Sunday-Saturday)
      const currentDayOfMonth = today.getUTCDate(); // 1-31

      let spawned = 0;
      let skipped = 0;

      for (const rule of recurringTasks) {
        let shouldSpawn = false;

        // Check if it's time to spawn based on recurrence type
        if (rule.recurrence_type === 'WEEKLY') {
          shouldSpawn = rule.day_of_week === currentDayOfWeek;
        } else if (rule.recurrence_type === 'MONTHLY') {
          shouldSpawn = rule.day_of_month === currentDayOfMonth;
        }

        // Check if we already spawned today
        if (shouldSpawn && rule.last_spawned) {
          const lastSpawnedDate = new Date(rule.last_spawned);
          const todayDate = today.toISOString().split('T')[0];
          const lastSpawnedDateStr = lastSpawnedDate.toISOString().split('T')[0];

          if (todayDate === lastSpawnedDateStr) {
            shouldSpawn = false; // Already spawned today
            skipped++;
          }
        }

        if (shouldSpawn) {
          try {
            // Calculate due date (7 days from now as default)
            const dueDate = new Date(today);
            dueDate.setDate(dueDate.getDate() + 7);

            // Spawn the task using the stored procedure
            const { error: spawnError } = await supabase.rpc('spawn_task_from_recurring', {
              rec_id: rule.id
            });

            if (spawnError) {
              console.error(`[CRON] Error spawning task for rule ${rule.id}:`, spawnError);
            } else {
              spawned++;
              console.log(`[CRON] Spawned task from rule ${rule.id}: ${rule.title}`);
            }
          } catch (err) {
            console.error(`[CRON] Exception spawning task for rule ${rule.id}:`, err);
          }
        }
      }

      console.log(`[CRON] Job completed. Spawned: ${spawned}, Skipped: ${skipped}, Total rules: ${recurringTasks.length}`);
    } catch (err) {
      console.error('[CRON] Fatal error in recurring tasks job:', err);
    }
  });

  console.log('Recurring tasks job scheduled successfully');
};

/**
 * Manual trigger for testing (can be called from API endpoint)
 */
export const triggerRecurringJobManually = async () => {
  console.log('Manually triggering recurring tasks job...');
  // Run the same logic as the cron job
  // This is useful for testing without waiting for the cron schedule
};
