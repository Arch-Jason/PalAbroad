'use client';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';


const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="form-control" style={{height: '100px'}}>编辑器加载中...</div>
});

export default function CommentModal({ postId, onClose, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const fileInputRef = useRef(null);

  const fetchCaptcha = async () => {
    const res = await fetch('/api/captcha');
    const data = await res.json();
    setCaptchaSvg(data.image);
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleImageUpload = async (e) => {
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
        setImageUrl(data.url);
      } else {
        alert(data.error || '上传失败');
      }
    } catch (err) {
      alert('上传出错');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content || content === '<p><br></p>') {
      alert('评论内容不能为空');
      return;
    }

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        images: imageUrl ? [imageUrl] : [],
        captcha: captchaInput
      }),
    });

    if (res.ok) {
      const newComment = await res.json();
      onCommentAdded(newComment);
      onClose();
    } else {
      const err = await res.json();
      alert(err.error || '发布评论失败');
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">发表评论</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <ReactQuill theme="snow" value={content} onChange={setContent} placeholder="写下你的评论..." />
            </div>
            <div className="row g-2 align-items-center mb-3">
              <div className="col-md-6">
                <div className="input-group">
                  <input type="text" className="form-control" placeholder="图片 URL" 
                    value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                  <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleImageUpload} />
                  <button className="btn btn-outline-secondary" type="button" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                     {uploading ? '...' : '上传'}
                  </button>
                </div>
              </div>
              <div className="col-md-1">
                {imageUrl && <img src={imageUrl} style={{width:'38px', height:'38px', objectFit:'cover', borderRadius:'4px'}} alt="preview" />}
              </div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-md-6">
                { captchaSvg !== "" && <img src={captchaSvg} onClick={fetchCaptcha} style={{ cursor: 'pointer' }} /> }
                <input type="text" className="form-control" placeholder="输入验证码" 
                  value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>取消</button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>发布评论</button>
          </div>
        </div>
      </div>
    </div>
  );
}
