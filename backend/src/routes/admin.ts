import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { verifySupabaseAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/admin/employees
 * List all employees
 * Accessible by: CEO only
 */
router.get('/employees', verifySupabaseAuth, requireRole(['CEO']), async (req: AuthRequest, res) => {
  try {
    const { active, role_id } = req.query;

    let query = supabase
      .from('employees')
      .select(`
        *,
        roles (
          id,
          name
        )
      `);

    if (active !== undefined) {
      query = query.eq('active', active === 'true');
    }

    if (role_id) {
      query = query.eq('role_id', Number(role_id));
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    res.json({ employees: data || [] });
  } catch (error: any) {
    console.error('List employees error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch employees' });
  }
});

/**
 * GET /api/admin/roles
 * List all available roles
 * Accessible by: CEO only
 */
router.get('/roles', verifySupabaseAuth, requireRole(['CEO']), async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    res.json({ roles: data || [] });
  } catch (error: any) {
    console.error('List roles error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch roles' });
  }
});

/**
 * POST /api/admin/employees
 * Create a new employee with Supabase auth account
 * Accessible by: CEO only
 */
router.post('/employees', verifySupabaseAuth, requireRole(['CEO']), async (req: AuthRequest, res) => {
  try {
    const { email, full_name, role_id, password } = req.body;

    if (!email || !full_name || !role_id || !password) {
      return res.status(400).json({ 
        error: 'email, full_name, role_id, and password are required' 
      });
    }

    // Create Supabase auth user (admin API)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    // Create employee record
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .insert([{
        auth_user_id: authData.user.id,
        full_name,
        email,
        role_id,
        active: true
      }])
      .select(`
        *,
        roles (
          id,
          name
        )
      `)
      .single();

    if (empError) {
      // Rollback: delete auth user if employee creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw empError;
    }

    res.status(201).json({ 
      employee,
      message: 'Employee created successfully' 
    });
  } catch (error: any) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: error.message || 'Failed to create employee' });
  }
});

/**
 * PATCH /api/admin/employees/:id
 * Update an employee
 * Accessible by: CEO only
 */
router.patch('/employees/:id', verifySupabaseAuth, requireRole(['CEO']), async (req: AuthRequest, res) => {
  try {
    const employeeId = req.params.id;
    const { full_name, role_id, active } = req.body;

    const updates: any = {};
    if (full_name) updates.full_name = full_name;
    if (role_id) updates.role_id = role_id;
    if (typeof active === 'boolean') updates.active = active;

    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', employeeId)
      .select(`
        *,
        roles (
          id,
          name
        )
      `)
      .single();

    if (error) throw error;

    res.json({ employee: data });
  } catch (error: any) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: error.message || 'Failed to update employee' });
  }
});

/**
 * DELETE /api/admin/employees/:id
 * Deactivate an employee (soft delete)
 * Accessible by: CEO only
 */
router.delete('/employees/:id', verifySupabaseAuth, requireRole(['CEO']), async (req: AuthRequest, res) => {
  try {
    const employeeId = req.params.id;

    // Soft delete - set active to false
    const { data, error } = await supabase
      .from('employees')
      .update({ active: false })
      .eq('id', employeeId)
      .select()
      .single();

    if (error) throw error;

    // Optionally disable the auth account too
    if (data.auth_user_id) {
      await supabase.auth.admin.updateUserById(data.auth_user_id, {
        ban_duration: '876000h' // ~100 years effectively banned
      });
    }

    res.json({ success: true, message: 'Employee deactivated' });
  } catch (error: any) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete employee' });
  }
});

/**
 * POST /api/admin/employees/:id/reset-password
 * Reset employee password
 * Accessible by: CEO only
 */
router.post('/employees/:id/reset-password', verifySupabaseAuth, requireRole(['CEO']), async (req: AuthRequest, res) => {
  try {
    const employeeId = req.params.id;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Get employee
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('auth_user_id')
      .eq('id', employeeId)
      .single();

    if (empError || !employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (!employee.auth_user_id) {
      return res.status(400).json({ error: 'Employee has no auth account' });
    }

    // Update password
    const { error: authError } = await supabase.auth.admin.updateUserById(
      employee.auth_user_id,
      { password: new_password }
    );

    if (authError) throw authError;

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: error.message || 'Failed to reset password' });
  }
});

export default router;
