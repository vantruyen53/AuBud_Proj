import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  HiOutlineHome, 
  HiOutlineUsers, 
  HiOutlinePresentationChartLine, // for logs, using presentation chart line as placeholder
  HiOutlineChatAlt2, 
  HiOutlineBell,
  // HiOutlineSearch,
  HiOutlineLogout
} from 'react-icons/hi';
import '../assets/styles/adminLayout.css';
import { useAuth } from '../hooks/useContext';
import { createIconAcc } from '../utils/helpers/IconText';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const {signOut, user}=useAuth()

  const iconText = createIconAcc(user?.name)

  const handleLogout = async () => {
    
    await signOut()

    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Header / Logo */}
        <div className="sidebar__header">
          <div className="sidebar__logo-icon">
            {/* Wallet icon representation */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 12C16 13.1046 15.1046 14 14 14C12.8954 14 12 13.1046 12 12C12 10.8954 12.8954 10 14 10C15.1046 10 16 10.8954 16 12Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="sidebar__logo-text">
            <span className="sidebar__logo-title">BudgetAdmin</span>
            <span className="sidebar__logo-subtitle">Management Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `sidebar__nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar__nav-icon"><HiOutlineHome /></span>
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/users" 
            className={({ isActive }) => `sidebar__nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar__nav-icon"><HiOutlineUsers /></span>
            Users
          </NavLink>

          <NavLink 
            to="/logs" 
            className={({ isActive }) => `sidebar__nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar__nav-icon"><HiOutlinePresentationChartLine /></span>
            System Log
          </NavLink>

          <NavLink 
            to="/feedback" 
            className={({ isActive }) => `sidebar__nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar__nav-icon"><HiOutlineChatAlt2 /></span>
            User Feedback
          </NavLink>

          <NavLink 
            to="/notifications" 
            className={({ isActive }) => `sidebar__nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar__nav-icon"><HiOutlineBell /></span>
            Notifications
          </NavLink>
        </nav>

        {/* Footer / User Profile */}
        <div className="sidebar__footer">
          <div className="sidebar__user-avatar">
            <span>{iconText}</span>
          </div>
          <div>
            <p className="sidebar__user-name">{user?.name}</p>
            <p className='sidebar__user-role'>{(user?.role)?.toUpperCase()} ROLE</p>
          </div>
          <button className="sidebar__logout-btn" onClick={handleLogout} title="Logout">
            <HiOutlineLogout />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-layout__content-wrap">
        {/* Top Header */}
        {/* <header className="admin-header">
          <div className="admin-header__search">
            <HiOutlineSearch className="admin-header__search-icon" />
            <input 
              type="text" 
              className="admin-header__search-input" 
              placeholder="Search data..." 
            />
          </div>
          <div className="admin-header__actions">
            <button className="admin-header__icon-btn">
              <HiOutlineBell />
              <div className="admin-header__badge"></div>
            </button>
            <div className="admin-header__avatar">
              <img src="https://i.pravatar.cc/150?u=123" alt="Profile" />
            </div>
          </div>
        </header> */}

        {/* Page Content */}
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
