import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import AuthLayout from "../../components/AuthLayout";

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement registration logic
    console.log("Register:", { fullName, email, password, confirmPassword });
  };

  return (
    <AuthLayout>
      <h1 className="auth-heading">Create Account 🚀</h1>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-input-wrapper">
          <input
            id="fullname"
            type="text"
            className="auth-input"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>

        <div className="auth-input-wrapper">
          <input
            id="email"
            type="email"
            className="auth-input"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="auth-input-wrapper">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className="auth-input auth-input--has-icon"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <HiOutlineEye /> : <HiOutlineEyeOff />}
          </button>
        </div>

        <div className="auth-input-wrapper">
          <input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            className="auth-input auth-input--has-icon"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <HiOutlineEye /> : <HiOutlineEyeOff />}
          </button>
        </div>

        <button type="submit" className="auth-submit" id="register-button">
          Register
        </button>
      </form>

      <p className="auth-footer">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
