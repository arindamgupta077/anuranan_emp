import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { verifySupabaseAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/leaves
 * List leave requests
 * 
 * AUTHORIZATION:
 * - Regular employees: Can ONLY view their own leave requests
 * - CEO/Admin: Can view ALL leave requests from all employees
 */
router.get('/', verifySupabaseAuth, async (req: AuthRequest, res) => {
  try {
    const { employee_id, start_date, end_date } = req.query;

    const employee = req.user!.employee;
    const isCEO = employee.roles?.name === 'CEO';

    let query = supabase
      .from('leaves')
      .select(`
        *,
        employee:employee_id (
          id,
          full_name,
          email,
          roles (
            name
          )
        ),
        approver:approved_by (
          id,
          full_name
        )
      `);

    // AUTHORIZATION FILTER: Non-CEO users can only see their own leaves
    if (!isCEO) {
      query = query.eq('employee_id', employee.id);
    } else if (employee_id) {
      // CEO can filter by specific employee
      query = query.eq('employee_id', employee_id);
    }

    // Date filters
    if (start_date) {
      query = query.gte('start_date', start_date);
    }
    if (end_date) {
      query = query.lte('end_date', end_date);
    }

    query = query.order('start_date', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    res.json({ leaves: data || [] });
  } catch (error: any) {
    console.error('List leaves error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch leaves' });
  }
});

/**
 * POST /api/leaves
 * Create a leave request
 * Accessible by: All authenticated users
 */
router.post('/', verifySupabaseAuth, async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date, reason } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (startDate > endDate) {
      return res.status(400).json({ error: 'start_date must be before or equal to end_date' });
    }

    const employee = req.user!.employee;

    const { data, error } = await supabase
      .from('leaves')
      .insert([{
        employee_id: employee.id,
        start_date,
        end_date,
        reason,
        status: 'PENDING'
      }])
      .select(`
        *,
        employee:employee_id (
          id,
          full_name
        )
      `)
      .single();

    if (error) throw error;

    res.status(201).json({ leave: data });
  } catch (error: any) {
    console.error('Create leave error:', error);
    res.status(500).json({ error: error.message || 'Failed to create leave request' });
  }
});

/**
 * PATCH /api/leaves/:id
 * Update a leave request
 * Accessible by: Leave owner or CEO
 */
router.patch('/:id', verifySupabaseAuth, async (req: AuthRequest, res) => {
  try {
    const leaveId = Number(req.params.id);
    const { start_date, end_date, reason } = req.body;

    const employee = req.user!.employee;
    const isCEO = employee.roles?.name === 'CEO';

    // Fetch the leave
    const { data: leave, error: fetchError } = await supabase
      .from('leaves')
      .select('*')
      .eq('id', leaveId)
      .single();

    if (fetchError || !leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Check permissions
    if (!isCEO && leave.employee_id !== employee.id) {
      return res.status(403).json({ error: 'Not authorized to update this leave request' });
    }

    const updates: any = {};
    if (start_date) updates.start_date = start_date;
    if (end_date) updates.end_date = end_date;
    if (reason !== undefined) updates.reason = reason;

    const { data, error } = await supabase
      .from('leaves')
      .update(updates)
      .eq('id', leaveId)
      .select()
      .single();

    if (error) throw error;

    res.json({ leave: data });
  } catch (error: any) {
    console.error('Update leave error:', error);
    res.status(500).json({ error: error.message || 'Failed to update leave request' });
  }
});

/**
 * DELETE /api/leaves/:id
 * Delete a leave request
 * Accessible by: Leave owner or CEO
 */
router.delete('/:id', verifySupabaseAuth, async (req: AuthRequest, res) => {
  try {
    const leaveId = Number(req.params.id);
    const employee = req.user!.employee;
    const isCEO = employee.roles?.name === 'CEO';

    // Fetch the leave
    const { data: leave, error: fetchError } = await supabase
      .from('leaves')
      .select('employee_id')
      .eq('id', leaveId)
      .single();

    if (fetchError || !leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Check permissions
    if (!isCEO && leave.employee_id !== employee.id) {
      return res.status(403).json({ error: 'Not authorized to delete this leave request' });
    }

    const { error } = await supabase
      .from('leaves')
      .delete()
      .eq('id', leaveId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete leave error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete leave request' });
  }
});

/**
 * PATCH /api/leaves/:id/status
 * Approve or reject a leave request
 * 
 * AUTHORIZATION:
 * - CEO/Admin ONLY: Can approve or reject any leave request
 */
router.patch('/:id/status', verifySupabaseAuth, requireRole(['CEO']), async (req: AuthRequest, res) => {
  try {
    const leaveId = Number(req.params.id);
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
    }

    const employee = req.user!.employee;

    // Fetch the leave request
    const { data: leave, error: fetchError } = await supabase
      .from('leaves')
      .select('*')
      .eq('id', leaveId)
      .single();

    if (fetchError || !leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Update the leave status
    const { data, error } = await supabase
      .from('leaves')
      .update({
        status,
        approved_by: employee.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', leaveId)
      .select(`
        *,
        employee:employee_id (
          id,
          full_name,
          email
        ),
        approver:approved_by (
          id,
          full_name
        )
      `)
      .single();

    if (error) throw error;

    res.json({ leave: data });
  } catch (error: any) {
    console.error('Update leave status error:', error);
    res.status(500).json({ error: error.message || 'Failed to update leave status' });
  }
});

export default router;
