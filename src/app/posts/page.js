'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import CommentModal from '@/components/CommentModal';
import PostModal from '@/components/PostModal';
import { MessageSquare } from 'lucide-react';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  const fetchPosts = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/posts?${query}`);
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchPosts();
    fetch('/api/user/profile').then(res => res.json()).then(setUser);
  }, []);

  const applySearch = () => {
    fetchPosts({ search, tag: activeTag });
  };

  const quickFilter = (tag) => {
    setActiveTag(tag);
    fetchPosts({ tag, search });
  };

  const handleCommentAdded = (postId, newComment) => {
    setPosts(posts.map(post => {
      if (post._id === postId) {
        return {
          ...post,
          comments: [...(post.comments || []), newComment]
        };
      }
      return post;
    }));
  };

  return (
    <div className="row">
      <div className="col-md-8">
        <div className="input-group mb-4 shadow-sm">
          <input type="text" className="form-control" placeholder="搜索内容或标签..." 
            value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-primary" onClick={applySearch}>搜索</button>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <button className={`btn btn-sm me-2 ${!activeTag ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => quickFilter('')}>全部</button>
            {['签证', '住宿', '找室友', '出国搭子'].map(t => (
              <button key={t} className={`btn btn-sm me-2 ${activeTag === t ? 'btn-primary' : 'btn-outline-primary'}`} 
                onClick={() => quickFilter(t)}>{t}</button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowPostModal(true)}>发布新动态</button>
        </div>

        {posts.map(post => (
          <div key={post._id} className="card p-4 mb-3 shadow-sm border-0">
            <div className="d-flex align-items-center mb-3">
              <img src={post.author?.avatar || '/uploads/akari.jpeg'} className="rounded-circle me-3" style={{width:'50px', height:'50px', objectFit:'cover'}} alt="avatar" />
              <div>
                <div className="fw-bold">{post.author?.username}</div>
                <div className="text-muted small">
                   {post.author?.highSchool} ✈️ {post.author?.targetUniv}
                </div>
              </div>
            </div>
            <div className="post-content mb-2" dangerouslySetInnerHTML={{ __html: post.content }}></div>
            {post.images?.[0] && (
              <div className="mb-3 text-center">
                <img src={post.images[0]} className="img-fluid rounded shadow-sm" style={{maxHeight:'500px'}} alt="post" />
              </div>
            )}
            <div className="mb-2">
              {post.tags.map(t => <span key={t} className="badge bg-light text-primary me-2 fw-normal p-2">#{t}</span>)}
            </div>
            <div className="text-muted mt-3 pt-2 border-top small d-flex justify-content-between align-items-center">
              <div>
                <span>{new Date(post.createdAt).toLocaleString()}</span>
                <span className="ms-3">{post.author?.currentCity}</span>
              </div>
              <button className="btn btn-link btn-sm text-decoration-none p-0 d-flex align-items-center" onClick={() => setSelectedPostId(post._id)}>
                <MessageSquare size={16} className="me-1" />
                <span>评论 ({post.comments?.length || 0})</span>
              </button>
            </div>

            {post.comments && post.comments.length > 0 && (
              <div className="mt-3 ps-3 border-start">
                {post.comments.map((comment, idx) => (
                  <div key={idx} className="mb-2 p-2 bg-light rounded small">
                    <div className="d-flex align-items-center mb-1">
                      <img src={comment.author?.avatar || '/uploads/akari.jpeg'} className="rounded-circle me-2" style={{width:'24px', height:'24px', objectFit:'cover'}} alt="c-avatar" />
                      <span className="fw-bold">{comment.author?.username}</span>
                      <span className="text-muted ms-2" style={{fontSize: '10px'}}>{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: comment.content }}></div>
                    {comment.images?.[0] && (
                      <div className="mt-1">
                        <img src={comment.images[0]} className="img-fluid rounded" style={{maxHeight:'100px'}} alt="c-img" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="col-md-4">
        <div className="card p-4 shadow-sm border-0 bg-white mb-4">
          <h5 className="text-primary mb-3">社区指南</h5>
          <ul className="small text-muted ps-3">
            <li>严禁发布虚假中介信息。</li>
            <li>分享住宿信息请备注大致地段。</li>
            <li>找出国搭子请务必注意线下安全。</li>
            <li>保持社区友善，严禁非法内容。</li>
          </ul>
        </div>
        {(typeof user?.username !== 'undefined') && (
           <div className="card p-4 shadow-sm border-0 text-center">
             <img src={user.avatar} className="rounded-circle mx-auto mb-3" style={{width:'80px', height:'80px', objectFit:'cover'}} alt="my-avatar" />
             <h6>{user.username}</h6>
             <p className="small text-muted">{user.targetUniv}</p>
             <a href="/profile" className="btn btn-sm btn-outline-primary w-100">管理我的帖子</a>
           </div>
        )}
      </div>

      {showPostModal && (
        <PostModal 
          onClose={() => setShowPostModal(false)} 
          onPostAdded={() => {
            fetchPosts();
          }}
        />
      )}

      {selectedPostId && (
        <CommentModal 
          postId={selectedPostId} 
          onClose={() => setSelectedPostId(null)} 
          onCommentAdded={(newComment) => handleCommentAdded(selectedPostId, newComment)}
        />
      )}
    </div>
  );
}
