import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';

interface NavbarProps {
  title?: string;
  subtitle?: string;
  currentPage?: string;
}

export default function Navbar({ title, subtitle, currentPage }: NavbarProps) {
  const router = useRouter();
  const { employee, isCEO, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const { supabase } = await import('../lib/supabaseClient');
    await supabase.auth.signOut();
    clearAuth();
    router.push('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navigateTo = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-3 lg:py-4">
        <div className="flex justify-between items-center gap-2">
          {/* Left side - Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate leading-tight">
              {title || 'Anuranan Employee Portal'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate leading-tight">
              {subtitle || `Welcome, ${employee?.full_name}`}
              {isCEO && currentPage !== 'profile' && (
                <span className="ml-1 sm:ml-2 badge badge-primary text-xs">CEO</span>
              )}
            </p>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => navigateTo('/dashboard')}
              className={`btn ${isActive('/dashboard') ? 'btn-primary' : 'btn-secondary'} text-sm px-4 py-2`}
            >
              🏠 Dashboard
            </button>
            <button
              onClick={() => navigateTo('/tasks')}
              className={`btn ${isActive('/tasks') ? 'btn-primary' : 'btn-secondary'} text-sm px-4 py-2`}
            >
              📋 Tasks
            </button>
            <button
              onClick={() => navigateTo('/self-tasks')}
              className={`btn ${isActive('/self-tasks') ? 'btn-primary' : 'btn-secondary'} text-sm px-4 py-2`}
            >
              ✍️ Self Tasks
            </button>
            <button
              onClick={() => navigateTo('/leaves')}
              className={`btn ${isActive('/leaves') ? 'btn-primary' : 'btn-secondary'} text-sm px-4 py-2`}
            >
              🏖️ Leaves
            </button>
            {isCEO && (
              <button
                onClick={() => navigateTo('/admin')}
                className={`btn ${isActive('/admin') ? 'btn-primary' : 'btn-secondary'} text-sm px-4 py-2`}
              >
                ⚙️ Admin
              </button>
            )}
            <button
              onClick={() => navigateTo('/profile')}
              className={`btn ${isActive('/profile') ? 'btn-primary' : 'btn-secondary'} text-sm px-4 py-2`}
            >
              👤 Profile
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-secondary text-sm px-4 py-2"
            >
              🚪 Logout
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-1.5 sm:p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 active:bg-gray-200 touch-manipulation"
            aria-label="Toggle menu"
          >
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="lg:hidden fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    aria-label="Close menu"
                  >
                    <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 truncate">{employee?.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{employee?.email}</p>
                  {isCEO && (
                    <span className="inline-block mt-2 badge badge-primary text-xs">CEO</span>
                  )}
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  <button
                    onClick={() => navigateTo('/dashboard')}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-teal-50 text-teal-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">🏠</span>
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => navigateTo('/tasks')}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      isActive('/tasks')
                        ? 'bg-teal-50 text-teal-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">📋</span>
                    <span>Tasks</span>
                  </button>

                  <button
                    onClick={() => navigateTo('/self-tasks')}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      isActive('/self-tasks')
                        ? 'bg-teal-50 text-teal-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">✍️</span>
                    <span>Self Tasks</span>
                  </button>

                  <button
                    onClick={() => navigateTo('/leaves')}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      isActive('/leaves')
                        ? 'bg-teal-50 text-teal-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">🏖️</span>
                    <span>Leaves</span>
                  </button>

                  {isCEO && (
                    <button
                      onClick={() => navigateTo('/admin')}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                        isActive('/admin')
                          ? 'bg-teal-50 text-teal-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">⚙️</span>
                      <span>Admin Panel</span>
                    </button>
                  )}

                  <div className="my-3 border-t border-gray-200"></div>

                  <button
                    onClick={() => navigateTo('/profile')}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      isActive('/profile')
                        ? 'bg-teal-50 text-teal-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">👤</span>
                    <span>Profile</span>
                  </button>
                </div>
              </nav>

              {/* Footer - Logout */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full btn btn-secondary text-sm py-3 flex items-center justify-center gap-2"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
