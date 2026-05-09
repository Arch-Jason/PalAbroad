'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in by calling profile API
    fetch('/api/user/profile').then(res => {
      if (res.ok) {
        res.json().then(setUser);
      } else {
        setUser(null);
      }
    });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white mb-4 shadow-sm py-3">
      <div className="container">
        <a className="navbar-brand fw-bold text-primary fs-4" href="/">PalAbroad</a>
        <div className="navbar-nav ms-auto align-items-center">
          <a className="nav-link px-3" href="/posts">广场</a>
          {user ? (
            <>
              <a className="nav-link px-3 d-flex align-items-center" href="/profile">
                <img src={user.avatar} className="rounded-circle me-2" style={{width:'24px', height:'24px', objectFit:'cover'}} alt="avatar" />
                个人中心
              </a>
              <button className="btn btn-outline-danger btn-sm ms-2" onClick={handleLogout}>退出登录</button>
            </>
          ) : (
            <a className="text-white px-3 btn btn-primary btn-sm" href="/login">登录 / 注册</a>
          )}
        </div>
      </div>
    </nav>
  );
}
