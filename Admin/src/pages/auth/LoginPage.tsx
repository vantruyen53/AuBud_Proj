import React, { useState } from "react";
// import { Link } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import AuthLayout from "../../components/AuthLayout";
import { loginService } from "../../services/auth/loginService";
import { useAuth } from "../../hooks/useContext";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAllowed, setIsAllowed] = useState(true)
  const [loginResult, setLoginResult] = useState({status: false, message:''})

  const {signIn} = useAuth()
  const navigation = useNavigate()

  const validateEmail = (email:string):boolean=>{
    const allowedDomains = ["aubud.com",];

    const parts = email.split('@');

    if (parts.length !== 2 || parts[1].length === 0) {
        return false;
    }

    return allowedDomains.includes(parts[1])
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setIsAllowed(false); 
      return;             
    }
    setIsAllowed(true);

    const result = await loginService(email, password);

    if (!result.status) {
      setLoginResult({ status: false, message: result.message });
      return; 
    }

    if(result.data){
      signIn(result.data.accessToken, result.data.email);
      navigation('/dashboard');
    } else{
      setLoginResult({ status: false, message: "Lỗi trong việc tải dữ liệu" });
    }
  };

  return (
    <AuthLayout>
      <h1 className="auth-heading">Welcome back</h1>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-input-wrapper">
          <input
            id="email"
            type="email"
            className="auth-input"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          {!isAllowed && <label className="warning-email">This email has domain that not allowed</label>}
        </div>

        <div className="auth-input-wrapper">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className="auth-input auth-input--has-icon"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
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

        {/* <div className="auth-forgot">
          <a href="#">Forgot password?</a>
        </div> */}

        <button 
          type="submit" 
          className={`auth-submit ${(email ==="" || password==="")?"auth-submit-not-allowrd":""}`} 
          id="login-button"
          disabled={email ==="" || password===""}
        >
          Login
        </button>
        {!loginResult.status && <p className="auth-login-result">{loginResult.message}</p>}
      </form>

      {/* <p className="auth-footer">
        Don't have an account? <Link to="/register">Sign up</Link>
      </p> */}
    </AuthLayout>
  );
};

export default LoginPage;
