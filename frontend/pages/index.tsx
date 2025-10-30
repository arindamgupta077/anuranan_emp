import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, sessionReady } = useAuthStore();

  useEffect(() => {
    if (!isLoading && sessionReady) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, sessionReady, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
