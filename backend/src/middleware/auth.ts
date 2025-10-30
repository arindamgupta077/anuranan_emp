import { Request, Response, NextFunction } from 'express';
import { supabase, getEmployeeByAuthId } from '../lib/supabase';

export interface AuthRequest extends Request {
  user?: {
    auth: any;
    employee: any;
  };
}

export const verifySupabaseAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT using Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get employee record with role
    try {
      const employee = await getEmployeeByAuthId(data.user.id);
      
      req.user = {
        auth: data.user,
        employee
      };
      
      next();
    } catch (empError) {
      return res.status(403).json({ 
        error: 'User not found in employee records or account is inactive' 
      });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const employee = req.user?.employee;
    
    if (!employee) {
      return res.status(403).json({ error: 'No employee data found' });
    }

    const roleName = employee.roles?.name;
    
    if (!roleName || !allowedRoles.includes(roleName)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: roleName 
      });
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return next();
  }

  try {
    await verifySupabaseAuth(req, res, next);
  } catch (err) {
    // If optional auth fails, continue without user
    next();
  }
};
