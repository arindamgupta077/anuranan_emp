import Head from 'next/head';

export default function Offline() {
  return (
    <>
      <Head>
        <title>Offline - Anuranan Employee Portal</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="text-center px-4">
          <div className="mb-8">
            <svg
              className="w-24 h-24 mx-auto text-teal-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            You're Offline
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            It looks like you've lost your internet connection. Please check your network and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    </>
  );
}
