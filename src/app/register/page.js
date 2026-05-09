'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { md5 } from 'js-md5';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchCaptcha = async () => {
    const res = await fetch('/api/captcha');
    const data = await res.json();
    setCaptchaSvg(data.image);
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...formData, captcha: captchaInput }),
    });

    if (res.ok) {
      router.push('/posts');
    } else {
      const data = await res.json();
      setError(data.error || '注册失败');
      fetchCaptcha();
    }

    if (res.ok) {
      router.push('/profile');
    } else {
      const data = await res.json();
      setError(data.error);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 card p-4">
        <h2 className="mb-4">注册 PalAbroad</h2>
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
             { captchaSvg !== "" && <img src={captchaSvg} onClick={fetchCaptcha} style={{ cursor: 'pointer' }} /> }
            <input type="text" className="form-control mt-2" placeholder="输入验证码" required
              onChange={(e) => setCaptchaInput(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary w-100">注册并填写资料</button>
        </form>
      </div>
    </div>
  );
}
