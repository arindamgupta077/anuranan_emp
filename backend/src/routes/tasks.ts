import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { verifySupabaseAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/tasks
 * List tasks with filtering and pagination
 * 
 * AUTHORIZATION:
 * - Regular employees: Can ONLY view tasks assigned to them
 * - CEO/Admin: Can view ALL tasks assigned to all employees
 */
router.get('/', verifySupabaseAuth, async (req: AuthRequest, res) => {
  try {
    const { 
      status, 
      assigned_to, 
      page = '1', 
      per_page = '20',
      search 
    } = req.query;

    const pageNum = Math.max(1, Number(page));
    const perPage = Math.min(100, Math.max(1, Number(per_page)));
    const offset = (pageNum - 1) * perPage;

    const employee = req.user!.employee;
    const isCEO = employee.roles?.name === 'CEO';

    // Build query
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_employee:employees!tasks_assigned_to_fkey (
          id,
          full_name,
          email
        ),
        creator:employees!tasks_created_by_fkey (
          id,
          full_name
        )
      `, { count: 'exact' });

    // AUTHORIZATION FILTER: Non-CEO users can only see their own assigned tasks
    if (!isCEO) {
      query = query.eq('assigned_to', employee.id);
    } else if (assigned_to) {
      // CEO can filter by specific employee
      query = query.eq('assigned_to', assigned_to);
    }

    // Status filter - default to OPEN and IN_PROGRESS
    if (status) {
      const statuses = (status as string).split(',');
      query = query.in('status', statuses);
    } else {
      query = query.in('status', ['OPEN', 'IN_PROGRESS']);
    }

    // Search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,details.ilike.%${search}%`);
    }

    // Pagination and ordering
    query = query
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      tasks: data || [],
      pagination: {
        page: pageNum,
        per_page: perPage,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / perPage)
      }
    });
  } catch (error: any) {
    console.error('List tasks error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tasks' });
  }
});

/**
 * POST /api/tasks
 * Create a new task
 * Accessible by: CEO only
 */
router.post('/', verifySupabaseAuth, requireRole(['CEO']), async (req: AuthRequest, res) => {
  try {
    const { title, details, assigned_to, due_date, recurring } = req.body;

    if (!title || !assigned_to) {
      return res.status(400).json({ error: 'Title and assigned_to are required' });
    }

    const employee = req.user!.employee;

    // Create the task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert([{
        title,
        details,
        assigned_to,
        created_by: employee.id,
        due_date,
        status: 'OPEN'
      }])
      .select(`
        *,
        assigned_employee:employees!tasks_assigned_to_fkey (
          id,
          full_name,
          email
        )
      `)
      .single();

    if (taskError) throw taskError;

    // Handle recurring task if specified
    if (recurring?.type) {
      const { type, day_of_week, day_of_month, start_date, end_date } = recurring;

      if (!['WEEKLY', 'MONTHLY'].includes(type)) {
        return res.status(400).json({ error: 'Invalid recurrence type' });
      }

      const { error: recurError } = await supabase
        .from('recurring_tasks')
        .insert([{
          title,
          details,
          created_by: employee.id,
          assigned_to,
          recurrence_type: type,
          day_of_week: type === 'WEEKLY' ? day_of_week : null,
          day_of_month: type === 'MONTHLY' ? day_of_month : null,
          start_date: start_date || new Date().toISOString().split('T')[0],
          end_date: end_date || null
        }]);

      if (recurError) {
        console.error('Failed to create recurring task:', recurError);
      }
    }

    res.status(201).json({ task });
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(500).json({ error: error.message || 'Failed to create task' });
  }
});

/**
 * PATCH /api/tasks/:id/status
 * Update task status
 * 
 * AUTHORIZATION:
 * - Employees: Can ONLY update status of tasks assigned to them
 * - CEO/Admin: Can update status of ANY task
 */
router.patch('/:id/status', verifySupabaseAuth, async (req: AuthRequest, res) => {
  try {
    const taskId = Number(req.params.id);
    const { status } = req.body;

    if (!['OPEN', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const employee = req.user!.employee;
    const isCEO = employee.roles?.name === 'CEO';

    // Fetch the task
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (fetchError || !task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // AUTHORIZATION CHECK: Only assigned employee or CEO can update
    if (!isCEO && task.assigned_to !== employee.id) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    // Update the task
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId);

    if (updateError) throw updateError;

    // Log status change in history
    await supabase
      .from('task_history')
      .insert([{
        task_id: taskId,
        changed_by: employee.id,
        old_status: task.status,
        new_status: status,
        note: `Status changed from ${task.status} to ${status}`
      }]);

    res.json({ success: true, task: { ...task, status } });
  } catch (error: any) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: error.message || 'Failed to update task status' });
  }
});

/**
 * GET /api/tasks/:id
 * Get task details with history
 * 
 * AUTHORIZATION:
 * - Employees: Can ONLY view details of tasks assigned to them
 * - CEO/Admin: Can view details of ANY task
 */
router.get('/:id', verifySupabaseAuth, async (req: AuthRequest, res) => {
  try {
    const taskId = Number(req.params.id);
    const employee = req.user!.employee;
    const isCEO = employee.roles?.name === 'CEO';

    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_employee:employees!tasks_assigned_to_fkey (
          id,
          full_name,
          email
        ),
        creator:employees!tasks_created_by_fkey (
          id,
          full_name
        ),
        history:task_history (
          id,
          old_status,
          new_status,
          changed_at,
          note,
          changer:employees (
            id,
            full_name
          )
        )
      `)
      .eq('id', taskId)
      .single();

    if (error || !task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // AUTHORIZATION CHECK: Only assigned employee or CEO can view details
    if (!isCEO && task.assigned_to !== employee.id) {
      return res.status(403).json({ error: 'Not authorized to view this task' });
    }

    res.json({ task });
  } catch (error: any) {
    console.error('Get task error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch task' });
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 * Accessible by: CEO only
 */
router.delete('/:id', verifySupabaseAuth, requireRole(['CEO']), async (req: AuthRequest, res) => {
  try {
    const taskId = Number(req.params.id);

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete task' });
  }
});

export default router;
