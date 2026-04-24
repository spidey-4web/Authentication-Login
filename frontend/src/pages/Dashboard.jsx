import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'User' };
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="auth-container" style={{ maxWidth: '440px' }}>
      <div className="auth-header-line"></div>
      <h1>{getGreeting()}</h1>
      <p className="subtitle">Welcome back, <strong style={{ fontWeight: 600 }}>{user.username}</strong></p>

      <div className="dashboard-info">
        <div className="dashboard-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <p className="dashboard-date">{formattedDate}</p>
        <p className="dashboard-welcome-msg">
          Great to see you again! Your dashboard is ready.
        </p>
      </div>

      <button onClick={onLogout} className="btn-outline">
        Sign Out
      </button>
    </div>
  );
};

export default Dashboard;

