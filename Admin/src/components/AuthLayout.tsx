import React from 'react';
import '../assets/styles/auth.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-layout">
      {/* Organic background blobs */}
      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />
      <div className="auth-blob auth-blob--3" />
      <div className="auth-blob auth-blob--4" />
      <div className="auth-blob auth-blob--5" />

      {/* Glassmorphism card */}
      <div className="auth-card">
        {/* Budgetly logo */}
        <div className="auth-logo">
          <div className="auth-logo__icon">B</div>
          <span className="auth-logo__text">Budgetly</span>
        </div>

        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
