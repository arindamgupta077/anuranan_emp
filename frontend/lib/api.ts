import { supabase } from './supabaseClient';
import { useAuthStore } from '@/store/authStore';

// Helper function to get current user and check if CEO
async function getCurrentUser() {
  console.log('[API] getCurrentUser called');
  
  // CRITICAL FIX: Use cached auth data from store to avoid hanging Supabase calls on reload
  const { user: cachedUser, employee: cachedEmployee, isCEO: cachedIsCEO, isAuthenticated } = useAuthStore.getState();
  
  console.log('[API] Checking cached auth:', {
    hasUser: !!cachedUser,
    hasEmployee: !!cachedEmployee,
    isAuthenticated,
    isCEO: cachedIsCEO
  });
  
  if (isAuthenticated && cachedUser && cachedEmployee) {
    console.log('[API] ✅ Using cached auth data (avoiding Supabase hang)');
    return {
      user: cachedUser,
      employee: cachedEmployee,
      isCEO: cachedIsCEO
    };
  }
  
  // Fallback: If no cached data, fetch from Supabase (only happens on fresh login)
  console.log('[API] ⚠️ No cached data, fetching from Supabase...');
  const startTime = Date.now();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  console.log('[API] Session retrieved:', {
    duration: `${Date.now() - startTime}ms`,
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    error: sessionError
  });
  
  if (!session?.user) {
    console.error('[API] ❌ Not authenticated - no session/user');
    throw new Error('Not authenticated');
  }

  console.log('[API] Fetching employee data...');
  const empStart = Date.now();
  const { data: employee, error } = await supabase
    .from('employees')
    .select(`
      *,
      roles (
        id,
        name
      )
    `)
    .eq('auth_user_id', session.user.id)
    .eq('active', true)
    .single();

  console.log('[API] Employee query result:', {
    duration: `${Date.now() - empStart}ms`,
    hasEmployee: !!employee,
    hasError: !!error,
    errorDetails: error,
    employeeId: employee?.id,
    employeeName: employee?.full_name
  });

  if (error || !employee) {
    console.error('[API] ❌ Employee not found:', { error, employee });
    throw new Error('Employee not found');
  }

  const result = {
    user: session.user,
    employee,
    isCEO: employee.roles?.name === 'CEO'
  };
  
  console.log('[API] ✅ getCurrentUser success:', {
    employeeId: employee.id,
    isCEO: result.isCEO
  });

  return result;
}

// API methods
export const authAPI = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return { data };
  },
  
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { data: { message: 'Logged out successfully' } };
  },
  
  getMe: async () => {
    const user = await getCurrentUser();
    return { data: { employee: user.employee } };
  },
};

export const tasksAPI = {
  list: async (params?: any) => {
    console.log('[API] tasksAPI.list called with params:', params);
    
    try {
      const { employee, isCEO } = await getCurrentUser();
      
      console.log('[API] Building tasks query for:', {
        employeeId: employee.id,
        isCEO,
        params
      });
      
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
        `)
        .order('created_at', { ascending: false });

      // Authorization: Non-CEO can only see their assigned tasks
      if (!isCEO) {
        query = query.eq('assigned_to', employee.id);
      }

      // Filter by status if provided
      if (params?.status) {
        const statuses = params.status.split(',');
        query = query.in('status', statuses);
      }

      console.log('[API] Executing tasks query...');
      const queryStart = Date.now();
      const { data: tasks, error } = await query;
      
      console.log('[API] Tasks query result:', {
        duration: `${Date.now() - queryStart}ms`,
        taskCount: tasks?.length || 0,
        hasError: !!error,
        errorDetails: error
      });
      
      if (error) {
        console.error('[API] ❌ Tasks query failed:', error);
        throw error;
      }
      
      return { data: { tasks: tasks || [] } };
    } catch (error) {
      console.error('[API] ❌ tasksAPI.list exception:', error);
      throw error;
    }
  },

  get: async (id: number) => {
    const { employee, isCEO } = await getCurrentUser();
    
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
      `)
      .eq('id', id);

    if (!isCEO) {
      query = query.eq('assigned_to', employee.id);
    }

    const { data: task, error } = await query.single();
    
    if (error) throw error;
    return { data: { task } };
  },

  create: async (data: any) => {
    const { employee, isCEO } = await getCurrentUser();
    
    if (!isCEO) {
      throw new Error('Only CEO can create tasks');
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        ...data,
        created_by: employee.id,
        status: 'OPEN'
      })
      .select()
      .single();

    if (error) throw error;
    return { data: { task, message: 'Task created successfully' } };
  },

  updateStatus: async (id: number, status: string) => {
    const { employee, isCEO } = await getCurrentUser();
    
    let query = supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    // Non-CEO can only update their own tasks
    if (!isCEO) {
      query = query.eq('assigned_to', employee.id);
    }

    const { data, error } = await query.select().single();
    
    if (error) throw error;
    return { data: { task: data, message: 'Task status updated successfully' } };
  },

  delete: async (id: number) => {
    const { isCEO } = await getCurrentUser();
    
    if (!isCEO) {
      throw new Error('Only CEO can delete tasks');
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: { message: 'Task deleted successfully' } };
  },
};

export const selfTasksAPI = {
  list: async (params?: any) => {
    const { employee, isCEO } = await getCurrentUser();
    
    let query = supabase
      .from('self_tasks')
      .select(`
        *,
        employee:employees (
          id,
          full_name,
          email
        )
      `)
      .order('task_date', { ascending: false });

    // Authorization: Non-CEO can only see their own self tasks
    if (!isCEO) {
      query = query.eq('employee_id', employee.id);
    }

    const { data: self_tasks, error } = await query;
    
    if (error) throw error;
    return { data: { self_tasks: self_tasks || [] } };
  },

  create: async (data: any) => {
    const { employee } = await getCurrentUser();
    
    const { data: selfTask, error } = await supabase
      .from('self_tasks')
      .insert({
        ...data,
        employee_id: employee.id
      })
      .select()
      .single();

    if (error) throw error;
    return { data: { self_task: selfTask, message: 'Self task created successfully' } };
  },

  update: async (id: number, data: any) => {
    const { employee } = await getCurrentUser();
    
    const { data: selfTask, error } = await supabase
      .from('self_tasks')
      .update(data)
      .eq('id', id)
      .eq('employee_id', employee.id) // Can only update own tasks
      .select()
      .single();

    if (error) throw error;
    return { data: { self_task: selfTask, message: 'Self task updated successfully' } };
  },

  delete: async (id: number) => {
    const { employee } = await getCurrentUser();
    
    const { error } = await supabase
      .from('self_tasks')
      .delete()
      .eq('id', id)
      .eq('employee_id', employee.id); // Can only delete own tasks

    if (error) throw error;
    return { data: { message: 'Self task deleted successfully' } };
  },
};

export const leavesAPI = {
  list: async (params?: any) => {
    const { employee, isCEO } = await getCurrentUser();
    
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
      `)
      .order('created_at', { ascending: false });

    // Authorization: Non-CEO can only see their own leaves
    if (!isCEO) {
      query = query.eq('employee_id', employee.id);
    }

    const { data: leaves, error } = await query;
    
    if (error) throw error;
    return { data: { leaves: leaves || [] } };
  },

  create: async (data: any) => {
    const { employee } = await getCurrentUser();
    
    const { data: leave, error } = await supabase
      .from('leaves')
      .insert({
        ...data,
        employee_id: employee.id,
        status: 'PENDING'
      })
      .select()
      .single();

    if (error) throw error;
    return { data: { leave, message: 'Leave request created successfully' } };
  },

  update: async (id: number, data: any) => {
    const { employee } = await getCurrentUser();
    
    // Check if leave is in PENDING status
    const { data: existingLeave } = await supabase
      .from('leaves')
      .select('status')
      .eq('id', id)
      .eq('employee_id', employee.id)
      .single();

    if (existingLeave?.status !== 'PENDING') {
      throw new Error('Can only edit pending leave requests');
    }

    const { data: leave, error } = await supabase
      .from('leaves')
      .update(data)
      .eq('id', id)
      .eq('employee_id', employee.id)
      .select()
      .single();

    if (error) throw error;
    return { data: { leave, message: 'Leave request updated successfully' } };
  },

  delete: async (id: number) => {
    const { employee } = await getCurrentUser();
    
    // Check if leave is in PENDING status
    const { data: existingLeave } = await supabase
      .from('leaves')
      .select('status')
      .eq('id', id)
      .eq('employee_id', employee.id)
      .single();

    if (existingLeave?.status !== 'PENDING') {
      throw new Error('Can only delete pending leave requests');
    }

    const { error } = await supabase
      .from('leaves')
      .delete()
      .eq('id', id)
      .eq('employee_id', employee.id);

    if (error) throw error;
    return { data: { message: 'Leave request deleted successfully' } };
  },

  updateStatus: async (id: number, status: 'APPROVED' | 'REJECTED') => {
    const { employee, isCEO } = await getCurrentUser();
    
    if (!isCEO) {
      throw new Error('Only CEO can approve/reject leave requests');
    }

    const { data: leave, error } = await supabase
      .from('leaves')
      .update({
        status,
        approved_by: employee.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data: { leave, message: `Leave request ${status.toLowerCase()} successfully` } };
  },
};

export const adminAPI = {
  listEmployees: async (params?: any) => {
    const { isCEO } = await getCurrentUser();
    
    if (!isCEO) {
      throw new Error('Only CEO can access employee list');
    }

    const { data: employees, error } = await supabase
      .from('employees')
      .select(`
        *,
        roles (
          id,
          name,
          description
        )
      `)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return { data: { employees: employees || [] } };
  },

  getRoles: async () => {
    const { isCEO } = await getCurrentUser();
    
    if (!isCEO) {
      throw new Error('Only CEO can access roles');
    }

    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { data: { roles: roles || [] } };
  },

  createEmployee: async (data: any) => {
    const { isCEO } = await getCurrentUser();
    
    if (!isCEO) {
      throw new Error('Only CEO can create employees');
    }

    // Create auth user first
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true
    });

    if (authError) throw authError;

    // Create employee record
    const { data: employee, error } = await supabase
      .from('employees')
      .insert({
        auth_user_id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        role_id: data.role_id,
        active: true
      })
      .select()
      .single();

    if (error) {
      // Rollback: delete auth user if employee creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw error;
    }

    return { data: { employee, message: 'Employee created successfully' } };
  },

  updateEmployee: async (id: string, data: any) => {
    const { isCEO } = await getCurrentUser();
    
    if (!isCEO) {
      throw new Error('Only CEO can update employees');
    }

    const { data: employee, error } = await supabase
      .from('employees')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data: { employee, message: 'Employee updated successfully' } };
  },

  deleteEmployee: async (id: string) => {
    const { isCEO } = await getCurrentUser();
    
    if (!isCEO) {
      throw new Error('Only CEO can deactivate employees');
    }

    const { data, error } = await supabase
      .from('employees')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data: { employee: data, message: 'Employee deactivated successfully' } };
  },

  resetPassword: async (id: string, newPassword: string) => {
    const { isCEO } = await getCurrentUser();
    
    if (!isCEO) {
      throw new Error('Only CEO can reset passwords');
    }

    // Get employee's auth_user_id
    const { data: employee } = await supabase
      .from('employees')
      .select('auth_user_id')
      .eq('id', id)
      .single();

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Update password using auth admin API
    const { error } = await supabase.auth.admin.updateUserById(
      employee.auth_user_id,
      { password: newPassword }
    );

    if (error) throw error;
    return { data: { message: 'Password reset successfully' } };
  },

  createRecurringTask: async (data: any) => {
    const { employee, isCEO } = await getCurrentUser();
    
    if (!isCEO) {
      throw new Error('Only CEO can create recurring tasks');
    }

    const { data: recurringTask, error } = await supabase
      .from('recurring_tasks')
      .insert({
        ...data,
        created_by: employee.id,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return { data: { recurring_task: recurringTask, message: 'Recurring task created successfully' } };
  },
};

export const reportsAPI = {
  getPerformance: async (params?: any) => {
    const { employee, isCEO } = await getCurrentUser();
    
    // Get task statistics
    let tasksQuery = supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    if (!isCEO) {
      tasksQuery = tasksQuery.eq('assigned_to', employee.id);
    }

    const [
      { count: totalTasks },
      { count: completedTasks },
      { count: openTasks },
      { count: inProgressTasks }
    ] = await Promise.all([
      tasksQuery,
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'OPEN'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'IN_PROGRESS')
    ]);

    return {
      data: {
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0,
        openTasks: openTasks || 0,
        inProgressTasks: inProgressTasks || 0,
        completionRate: totalTasks ? ((completedTasks || 0) / totalTasks * 100).toFixed(2) : 0
      }
    };
  },

  getTasksSummary: async (params?: any) => {
    const { employee, isCEO } = await getCurrentUser();
    
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_employee:employees!tasks_assigned_to_fkey (full_name)
      `);

    if (!isCEO) {
      query = query.eq('assigned_to', employee.id);
    }

    const { data: tasks, error } = await query;
    
    if (error) throw error;
    return { data: { tasks: tasks || [] } };
  },

  getRecurringTasks: async () => {
    const { isCEO } = await getCurrentUser();
    
    if (!isCEO) {
      throw new Error('Only CEO can view recurring tasks');
    }

    const { data: recurring_tasks, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: { recurring_tasks: recurring_tasks || [] } };
  },

  getLeavesSummary: async (params?: any) => {
    const { employee, isCEO } = await getCurrentUser();
    
    let query = supabase
      .from('leaves')
      .select(`
        *,
        employee:employee_id (full_name)
      `);

    if (!isCEO) {
      query = query.eq('employee_id', employee.id);
    }

    const { data: leaves, error } = await query;
    
    if (error) throw error;
    return { data: { leaves: leaves || [] } };
  },

  getDashboard: async () => {
    const { employee, isCEO } = await getCurrentUser();
    
    // Get various counts
    const queries = [
      supabase.from('tasks').select('*', { count: 'exact', head: true }),
      supabase.from('self_tasks').select('*', { count: 'exact', head: true }),
      supabase.from('leaves').select('*', { count: 'exact', head: true })
    ];

    // Apply authorization filters for non-CEO
    if (!isCEO) {
      queries[0] = supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('assigned_to', employee.id);
      queries[1] = supabase.from('self_tasks').select('*', { count: 'exact', head: true }).eq('employee_id', employee.id);
      queries[2] = supabase.from('leaves').select('*', { count: 'exact', head: true }).eq('employee_id', employee.id);
    }

    const [
      { count: tasksCount },
      { count: selfTasksCount },
      { count: leavesCount }
    ] = await Promise.all(queries);

    return {
      data: {
        tasks: tasksCount || 0,
        self_tasks: selfTasksCount || 0,
        leaves: leavesCount || 0
      }
    };
  },
};
