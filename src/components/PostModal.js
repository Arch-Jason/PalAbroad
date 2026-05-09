'use client';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha';

const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="form-control" style={{height: '150px'}}>编辑器加载中...</div>
});

export default function PostModal({ onClose, onPostAdded }) {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadCaptchaEnginge(6, 'transparent', 'black', 'small');
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
      alert('内容不能为空');
      return;
    }

    if (!validateCaptcha(captchaInput)) {
      alert('验证码错误');
      return;
    }

    const res = await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ 
        content, 
        tags: tags.split(' ').filter(t => t), 
        images: imageUrl ? [imageUrl] : [] 
      }),
    });
    
    if (res.ok) {
      onPostAdded();
      onClose();
    } else {
      const err = await res.json();
      alert(err.error || '发布失败');
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">发布新动态</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <ReactQuill theme="snow" value={content} onChange={setContent} placeholder="分享你的信息..." />
            </div>
            <div className="row g-2 align-items-center mb-3">
              <div className="col-md-6">
                <input type="text" className="form-control" placeholder="自定义标签 (空格隔开)" 
                  value={tags} onChange={e => setTags(e.target.value)} />
              </div>
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
            </div>
            <div className="row g-2 align-items-center mb-3">
              <div className="col-md-6">
                  <LoadCanvasTemplate />
              </div>
              <div className="col-md-6">
                  <input type="text" className="form-control" placeholder="输入验证码" 
                    value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>取消</button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>发布动态</button>
          </div>
        </div>
      </div>
    </div>
  );
}
