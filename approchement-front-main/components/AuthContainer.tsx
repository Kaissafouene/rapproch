import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

interface AuthContainerProps {
  onAuth: (token: string, user: any) => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      {isLogin ? (
        <Login 
          onLogin={onAuth}
          onSwitchToRegister={() => setIsLogin(false)}
        />
      ) : (
        <Register 
          onRegister={onAuth}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </>
  );
};

export default AuthContainer;