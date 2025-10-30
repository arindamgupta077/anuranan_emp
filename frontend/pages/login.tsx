import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user && data.session) {
        // Wait a moment for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Fetch employee data with the authenticated session
        const { data: employee, error: empError } = await supabase
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

        if (empError || !employee) {
          console.error('Employee fetch error:', empError);
          console.error('Auth user ID:', data.user.id);
          console.error('Employee data:', employee);
          console.error('Session:', data.session);
          toast.error(`Employee account not found or inactive. Error: ${empError?.message || 'No data'}`);
          await supabase.auth.signOut();
          return;
        }

        setAuth(data.user, employee);
        toast.success('Login successful!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Anuranan Employee Portal</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-3 sm:px-4 py-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-700 mb-2">
              Anuranan
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Bengali Recitation Training Institute
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
              Employee Portal
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  placeholder="your.email@anuranan.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="w-full btn btn-primary py-3 text-sm sm:text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="loading-spinner mr-2"></span>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
              <p>Need help? Contact your administrator</p>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 text-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} Anuranan. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
}
