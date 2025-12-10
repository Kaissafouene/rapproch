import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  requiredRole?: string;
  userRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  isAuthenticated, 
  requiredRole, 
  userRole 
}) => {
  if (!isAuthenticated) {
    return null; // Will show login instead
  }

  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;