import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { verifySupabaseAuth, requireRole, AuthRequest } from '../middleware/auth';
import { stringify } from 'csv-stringify/sync';

const router = Router();

/**
 * GET /api/reports/performance
 * Get employee performance report
 * Accessible by: CEO only
 */
router.get('/performance', verifySupabaseAuth, requireRole(['CEO']), async (req: AuthRequest, res) => {
  try {
    const { employee_id, start_date, end_date, format } = req.query;

    const { data, error } = await supabase
      .from('employee_performance')
      .select('*');

    if (error) throw error;

    // Filter by employee if specified
    let report = data || [];
    if (employee_id) {
      report = report.filter(r => r.employee_id === employee_id);
    }

    // If CSV format requested
    if (format === 'csv') {
      const csv = stringify(report, {
        header: true,
        columns: [
          'employee_id',
          'full_name',
          'completed_tasks',
          'open_tasks',
          'total_assigned',
          'avg_hours_to_complete',
          'overdue_count'
        ]
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=performance-report.csv');
      return res.send(csv);
    }

    res.json({ report });
  } catch (error: any) {
    console.error('Performance report error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate performance report' });
  }
});

/**
 * GET /api/reports/tasks-summary
 * Get task completion summary with date filtering
 * Accessible by: CEO only
 */
router.get('/tasks-summary', verifySupabaseAuth, requireRole(['CEO']), async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date, employee_id } = req.query;

    let query = supabase
      .from('tasks')
      .select(`
        id,
        status,
        created_at,
        updated_at,
        due_date,
        assigned_to,
        employees!tasks_assigned_to_fkey (
          id,
          full_name
        )
      `);

    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }
    if (employee_id) {
      query = query.eq('assigned_to', employee_id);
    }

    const { data: tasks, error } = await query;

    if (error) throw error;

    // Calculate summary statistics
    const summary = {
      total_tasks: tasks?.length || 0,
      open: tasks?.filter(t => t.status === 'OPEN').length || 0,
      in_progress: tasks?.filter(t => t.status === 'IN_PROGRESS').length || 0,
      completed: tasks?.filter(t => t.status === 'COMPLETED').length || 0,
      overdue: tasks?.filter(t => 
        t.due_date && 
        new Date(t.due_date) < new Date() && 
        t.status !== 'COMPLETED'
      ).length || 0,
      completion_rate: tasks?.length ? 
        ((tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100).toFixed(2) : 
        '0.00'
    };

    // Group by employee
    const byEmployee = tasks?.reduce((acc: any, task: any) => {
      const empId = task.assigned_to;
      if (!acc[empId]) {
        acc[empId] = {
          employee_id: empId,
          employee_name: task.employees?.full_name || 'Unknown',
          total: 0,
          open: 0,
          in_progress: 0,
          completed: 0
        };
      }
      acc[empId].total++;
      acc[empId][task.status.toLowerCase()]++;
      return acc;
    }, {});

    res.json({
      summary,
      by_employee: Object.values(byEmployee || {})
    });
  } catch (error: any) {
    console.error('Tasks summary error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate tasks summary' });
  }
});

/**
 * GET /api/reports/recurring-tasks
 * Get recurring tasks performance
 * Accessible by: CEO only
 */
router.get('/recurring-tasks', verifySupabaseAuth, requireRole(['CEO']), async (req: AuthRequest, res) => {
  try {
    const { data: recurringTasks, error: recurError } = await supabase
      .from('recurring_tasks')
      .select(`
        *,
        employees!recurring_tasks_assigned_to_fkey (
          id,
          full_name
        )
      `);

    if (recurError) throw recurError;

    // For each recurring task, get spawned tasks
    const report = await Promise.all(
      (recurringTasks || []).map(async (rt) => {
        const { data: spawnedTasks } = await supabase
          .from('tasks')
          .select('id, status, created_at, due_date')
          .eq('recurring_id', rt.id);

        const completed = spawnedTasks?.filter(t => t.status === 'COMPLETED').length || 0;
        const total = spawnedTasks?.length || 0;

        return {
          recurring_task_id: rt.id,
          title: rt.title,
          assigned_to: rt.employees?.full_name,
          recurrence_type: rt.recurrence_type,
          total_spawned: total,
          completed: completed,
          completion_rate: total ? ((completed / total) * 100).toFixed(2) : '0.00',
          last_spawned: rt.last_spawned
        };
      })
    );

    res.json({ recurring_tasks_report: report });
  } catch (error: any) {
    console.error('Recurring tasks report error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate recurring tasks report' });
  }
});

/**
 * GET /api/reports/leaves-summary
 * Get leaves summary
 * Accessible by: CEO only
 */
router.get('/leaves-summary', verifySupabaseAuth, requireRole(['CEO']), async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = supabase
      .from('leaves')
      .select(`
        *,
        employees (
          id,
          full_name,
          roles (
            name
          )
        )
      `);

    if (start_date) {
      query = query.gte('start_date', start_date);
    }
    if (end_date) {
      query = query.lte('end_date', end_date);
    }

    const { data: leaves, error } = await query;

    if (error) throw error;

    // Calculate total leave days per employee
    const byEmployee = leaves?.reduce((acc: any, leave: any) => {
      const empId = leave.employee_id;
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (!acc[empId]) {
        acc[empId] = {
          employee_id: empId,
          employee_name: leave.employees?.full_name || 'Unknown',
          role: leave.employees?.roles?.name || 'Unknown',
          total_leaves: 0,
          total_days: 0
        };
      }
      acc[empId].total_leaves++;
      acc[empId].total_days += days;
      return acc;
    }, {});

    res.json({
      total_leave_requests: leaves?.length || 0,
      by_employee: Object.values(byEmployee || {})
    });
  } catch (error: any) {
    console.error('Leaves summary error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate leaves summary' });
  }
});

/**
 * GET /api/reports/dashboard
 * Get aggregated dashboard statistics
 * Accessible by: CEO only
 */
router.get('/dashboard', verifySupabaseAuth, requireRole(['CEO']), async (req: AuthRequest, res) => {
  try {
    // Get all key metrics in parallel
    const [
      tasksResult,
      employeesResult,
      leavesTodayResult,
      overdueTasksResult
    ] = await Promise.all([
      supabase.from('tasks').select('id, status, due_date'),
      supabase.from('employees').select('id, active'),
      supabase.from('leaves').select('id')
        .lte('start_date', new Date().toISOString().split('T')[0])
        .gte('end_date', new Date().toISOString().split('T')[0]),
      supabase.from('tasks').select('id')
        .neq('status', 'COMPLETED')
        .lt('due_date', new Date().toISOString().split('T')[0])
    ]);

    const tasks = tasksResult.data || [];
    const employees = employeesResult.data || [];

    const dashboard = {
      total_employees: employees.length,
      active_employees: employees.filter(e => e.active).length,
      total_tasks: tasks.length,
      open_tasks: tasks.filter(t => t.status === 'OPEN').length,
      in_progress_tasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed_tasks: tasks.filter(t => t.status === 'COMPLETED').length,
      overdue_tasks: overdueTasksResult.data?.length || 0,
      employees_on_leave_today: leavesTodayResult.data?.length || 0,
      completion_rate: tasks.length ? 
        ((tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100).toFixed(2) : 
        '0.00'
    };

    res.json({ dashboard });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate dashboard' });
  }
});

export default router;
