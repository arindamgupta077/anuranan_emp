import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { verifySupabaseAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/self-tasks
 * List self-assigned tasks
 * 
 * AUTHORIZATION:
 * - Regular employees: Can ONLY view their own self-tasks
 * - CEO/Admin: Can view ALL self-tasks from all employees
 */
router.get('/', verifySupabaseAuth, async (req: AuthRequest, res) => {
  try {
    const { employee_id, start_date, end_date, page = '1', per_page = '30' } = req.query;

    const pageNum = Math.max(1, Number(page));
    const perPage = Math.min(100, Math.max(1, Number(per_page)));
    const offset = (pageNum - 1) * perPage;

    const employee = req.user!.employee;
    const isCEO = employee.roles?.name === 'CEO';

    let query = supabase
      .from('self_tasks')
      .select(`
        *,
        employee:employees (
          id,
          full_name,
          email
        )
      `, { count: 'exact' });

    // AUTHORIZATION FILTER: Non-CEO users can only see their own self tasks
    if (!isCEO) {
      query = query.eq('employee_id', employee.id);
    } else if (employee_id) {
      // CEO can filter by specific employee
      query = query.eq('employee_id', employee_id);
    }

    // Date range filter
    if (start_date) {
      query = query.gte('task_date', start_date);
    }
    if (end_date) {
      query = query.lte('task_date', end_date);
    }

    query = query
      .order('task_date', { ascending: false })
      .range(offset, offset + perPage - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      self_tasks: data || [],
      pagination: {
        page: pageNum,
        per_page: perPage,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / perPage)
      }
    });
  } catch (error: any) {
    console.error('List self tasks error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch self tasks' });
  }
});

/**
 * POST /api/self-tasks
 * Create a self-assigned task
 * Accessible by: All authenticated users
 */
router.post('/', verifySupabaseAuth, async (req: AuthRequest, res) => {
  try {
    const { task_date, details, is_private = false } = req.body;

    if (!task_date || !details) {
      return res.status(400).json({ error: 'task_date and details are required' });
    }

    const employee = req.user!.employee;

    const { data, error } = await supabase
      .from('self_tasks')
      .insert([{
        employee_id: employee.id,
        task_date,
        details,
        is_private
      }])
      .select(`
        *,
        employee:employees (
          id,
          full_name
        )
      `)
      .single();

    if (error) throw error;

    res.status(201).json({ self_task: data });
  } catch (error: any) {
    console.error('Create self task error:', error);
    res.status(500).json({ error: error.message || 'Failed to create self task' });
  }
});

/**
 * PATCH /api/self-tasks/:id
 * Update a self-assigned task
 * 
 * AUTHORIZATION:
 * - Employees: Can ONLY update their own self-tasks
 * - CEO/Admin: Can update ANY self-task
 */
router.patch('/:id', verifySupabaseAuth, async (req: AuthRequest, res) => {
  try {
    const taskId = Number(req.params.id);
    const { task_date, details, is_private } = req.body;

    const employee = req.user!.employee;
    const isCEO = employee.roles?.name === 'CEO';

    // Fetch the task
    const { data: task, error: fetchError } = await supabase
      .from('self_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (fetchError || !task) {
      return res.status(404).json({ error: 'Self task not found' });
    }

    // AUTHORIZATION CHECK: Only task owner or CEO can update
    if (!isCEO && task.employee_id !== employee.id) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    const updates: any = {};
    if (task_date) updates.task_date = task_date;
    if (details) updates.details = details;
    if (typeof is_private === 'boolean') updates.is_private = is_private;

    const { data, error } = await supabase
      .from('self_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;

    res.json({ self_task: data });
  } catch (error: any) {
    console.error('Update self task error:', error);
    res.status(500).json({ error: error.message || 'Failed to update self task' });
  }
});

/**
 * DELETE /api/self-tasks/:id
 * Delete a self-assigned task
 * 
 * AUTHORIZATION:
 * - Employees: Can ONLY delete their own self-tasks
 * - CEO/Admin: Can delete ANY self-task
 */
router.delete('/:id', verifySupabaseAuth, async (req: AuthRequest, res) => {
  try {
    const taskId = Number(req.params.id);
    const employee = req.user!.employee;
    const isCEO = employee.roles?.name === 'CEO';

    // Fetch the task
    const { data: task, error: fetchError } = await supabase
      .from('self_tasks')
      .select('employee_id')
      .eq('id', taskId)
      .single();

    if (fetchError || !task) {
      return res.status(404).json({ error: 'Self task not found' });
    }

    // AUTHORIZATION CHECK: Only task owner or CEO can delete
    if (!isCEO && task.employee_id !== employee.id) {
      return res.status(403).json({ error: 'Not authorized to delete this task' });
    }

    const { error } = await supabase
      .from('self_tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete self task error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete self task' });
  }
});

export default router;
