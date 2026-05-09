'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha';
import { md5 } from 'js-md5';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadCaptchaEnginge(6);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCaptcha(captchaInput)) {
      alert('验证码错误');
      return;
    }

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      router.push('/posts');
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5 card p-4">
        <h2 className="mb-4">登录 PalAbroad</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>用户名</label>
            <input type="text" className="form-control" required 
              onChange={(e) => setFormData({...formData, username: e.target.value})} />
          </div>
          <div className="mb-3">
            <label>密码</label>
            <input type="password" className="form-control" required
              onChange={(e) => setFormData({...formData, password: md5(e.target.value)})} />
          </div>
          <div className="mb-3">
            <LoadCanvasTemplate />
            <input type="text" className="form-control mt-2" placeholder="输入验证码" required
              onChange={(e) => setCaptchaInput(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary w-100">登录</button>
          <p className="mt-3 text-center">
            还没有账号？ <a href="/register">立即注册</a>
          </p>
        </form>
      </div>
    </div>
  );
}
