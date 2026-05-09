'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SchoolDropdown from '@/components/SchoolDropdown';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const fetchData = async () => {
    const profRes = await fetch('/api/user/profile');
    const profData = await profRes.json();
    if (profData.error) {
      router.push('/login');
      return;
    }
    setProfile(profData);

    const postRes = await fetch(`/api/posts?userId=${profData._id}`);
    const postData = await postRes.json();
    setMyPosts(postData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
    if (res.ok) alert('资料已更新');
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setProfile({ ...profile, avatar: data.url });
      } else {
        alert(data.error || '上传失败');
      }
    } catch (err) {
      alert('上传出错');
    } finally {
      setUploading(false);
    }
  };

  const deletePost = async (id) => {
    if (!confirm('确定删除这条动态吗？')) return;
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMyPosts(myPosts.filter(p => p._id !== id));
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div className="row">
      <div className="col-md-4">
        <div className="card p-4 shadow-sm text-center mb-4">
          <div className="position-relative d-inline-block mx-auto mb-3">
            <img 
              src={profile.avatar} 
              className="rounded-circle" 
              style={{width:'100px', height:'100px', objectFit:'cover'}} 
              alt="avatar" 
            />
            {uploading && (
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-circle bg-dark bg-opacity-50 text-white small">
                ...
              </div>
            )}
          </div>
          <h4>{profile.username}</h4>
          <p className="text-muted">{profile.bio || '还没有介绍...'}</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="d-none" 
            accept="image/*" 
            onChange={handleAvatarUpload} 
          />
          <button 
            className="btn btn-outline-primary btn-sm" 
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            {uploading ? '上传中...' : '上传新头像'}
          </button>
        </div>

        <div className="card p-4 shadow-sm">
          <h5>基本资料</h5>
          <form onSubmit={handleUpdate}>
            <div className="mb-2">
              <label className="small">高中</label>
              <SchoolDropdown 
                type="highschools" 
                value={profile.highSchool} 
                onChange={val => setProfile({...profile, highSchool: val})} 
                placeholder="搜索高中名称..." 
              />
            </div>
            <div className="mb-2">
              <label className="small">未来大学</label>
              <SchoolDropdown 
                type="universities" 
                value={profile.targetUniv} 
                onChange={val => setProfile({...profile, targetUniv: val})} 
                placeholder="搜索大学名称..." 
              />
            </div>
            <div className="mb-2"><label className="small">当前城市 (用英文填写)</label><input className="form-control" value={profile.currentCity} onChange={e => setProfile({...profile, currentCity: e.target.value})} /></div>
            <div className="mb-2"><label className="small">自我介绍</label><textarea className="form-control" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} /></div>
            <button type="submit" className="btn btn-primary w-100 mt-2">保存修改</button>
          </form>
        </div>
      </div>

      <div className="col-md-8">
        <h4 className="mb-4">我的动态 ({myPosts.length})</h4>
        {myPosts.length === 0 && <p className="text-muted">还没有发布过动态。</p>}
        {myPosts.map(post => (
          <div key={post._id} className="card p-3 mb-3 shadow-sm border-0">
            <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
            {post.images?.[0] && (
              <div className="mt-2">
                <img src={post.images[0]} className="img-fluid rounded" style={{maxHeight:'200px'}} alt="post" />
              </div>
            )}
            <div className="mt-2">
              {post.tags.map(t => <span key={t} className="badge bg-light text-dark me-1">#{t}</span>)}
            </div>
            <div className="d-flex justify-content-between mt-3 pt-2 border-top">
              <span className="text-muted small">{new Date(post.createdAt).toLocaleString()}</span>
              <button className="btn btn-sm btn-outline-danger" onClick={() => deletePost(post._id)}>删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
