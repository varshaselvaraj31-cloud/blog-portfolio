import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace state={{ message: "Please log in to access this page." }} />;
  }

  // Requires admin but user is not admin
  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-xl max-w-lg shadow-sm">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold mb-2">Access Denied (Admin Only)</h2>
          <p className="text-gray-600 mb-6">
            You are logged in as <span className="font-semibold text-gray-800">{user.email}</span>, 
            which does not have administrator privileges.
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/home" 
              className="bg-gray-700 text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition"
            >
              Go to Home
            </a>
            <a 
              href="/login" 
              className="bg-orange-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition"
            >
              Login as Admin
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
