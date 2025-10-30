import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Get employee details
    const { data: employee } = await supabase
      .from('employees')
      .select(`
        *,
        roles (
          id,
          name
        )
      `)
      .eq('auth_user_id', data.user.id)
      .eq('active', true)
      .single();

    if (!employee) {
      return res.status(403).json({ error: 'Employee account not found or inactive' });
    }

    res.json({
      user: data.user,
      session: data.session,
      employee
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      await supabase.auth.signOut();
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: error.message || 'Logout failed' });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get employee details
    const { data: employee } = await supabase
      .from('employees')
      .select(`
        *,
        roles (
          id,
          name
        )
      `)
      .eq('auth_user_id', data.user.id)
      .eq('active', true)
      .single();

    if (!employee) {
      return res.status(403).json({ error: 'Employee account not found or inactive' });
    }

    res.json({
      user: data.user,
      employee
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message || 'Failed to get user' });
  }
});

export default router;
