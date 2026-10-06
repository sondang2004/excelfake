import React, { useState, useEffect } from 'react';
import { X, Globe, FileText, BookOpen, Settings, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function SecretModal({
  isOpen,
  onClose,
  onLoadStory,
  wordsPerChunk,
  setWordsPerChunk
}) {
  const [activeTab, setActiveTab] = useState('url');
  
  // URL tab states
  const [storyUrl, setStoryUrl] = useState('');
  const [cssSelector, setCssSelector] = useState('');
  
  // Manual text tab states
  const [manualTitle, setManualTitle] = useState('');
  const [manualText, setManualText] = useState('');

  // Presets states
  const [presets, setPresets] = useState([]);
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch presets on modal open
  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:5000/api/presets')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPresets(data.presets);
          }
        })
        .catch(err => console.log('Presets fetch error:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle URL crawling
  const handleFetchFromUrl = async (e) => {
    e.preventDefault();
    if (!storyUrl.trim()) {
      setErrorMsg('Vui lòng nhập URL truyện.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('http://localhost:5000/api/fetch-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: storyUrl.trim(),
          selector: cssSelector.trim(),
          wordsPerChunk
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Đã bóc tách thành công ${data.totalChunks} đoạn truyện!`);
        onLoadStory(data.title, data.chunks, storyUrl.trim(), data.nextChapterUrl);
        setTimeout(() => onClose(), 1200);
      } else {
        setErrorMsg(data.message || 'Lỗi bóc tách truyện.');
      }
    } catch (err) {
      setErrorMsg(`Lỗi kết nối Backend: ${err.message}. Vui lòng thử tính năng dán thủ công.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Manual Text Parse
  const handleParseManualText = async (e) => {
    e.preventDefault();
    if (!manualText.trim()) {
      setErrorMsg('Vui lòng dán nội dung văn bản.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('http://localhost:5000/api/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: manualText,
          title: manualTitle || 'Văn bản thủ công',
          wordsPerChunk
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Đã tạo thành công ${data.totalChunks} dòng truyện ngụy trang!`);
        onLoadStory(data.title, data.chunks, '');
        setTimeout(() => onClose(), 1000);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(`Lỗi xử lý văn bản: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Preset Selection
  const handleSelectPreset = async (presetId) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`http://localhost:5000/api/presets/${presetId}`);
      const data = await res.json();
      if (data.success) {
        onLoadStory(data.title, data.chunks, '');
        setSuccessMsg(`Đã tải truyện mẫu thành công!`);
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      setErrorMsg('Lỗi tải truyện mẫu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="secret-modal" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <BookOpen className="text-blue-600" size={20} />
            Quản lý Truyện Bí Mật (Boss Key Console)
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-tabs">
          <div 
            className={`modal-tab-item ${activeTab === 'url' ? 'active' : ''}`}
            onClick={() => setActiveTab('url')}
          >
            <Globe size={14} style={{ display: 'inline', marginRight: '4px' }} /> Tải từ URL
          </div>
          <div 
            className={`modal-tab-item ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            <FileText size={14} style={{ display: 'inline', marginRight: '4px' }} /> Dán thủ công
          </div>
          <div 
            className={`modal-tab-item ${activeTab === 'preset' ? 'active' : ''}`}
            onClick={() => setActiveTab('preset')}
          >
            <BookOpen size={14} style={{ display: 'inline', marginRight: '4px' }} /> Truyện Mẫu
          </div>
          <div 
            className={`modal-tab-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={14} style={{ display: 'inline', marginRight: '4px' }} /> Cài đặt & Phím tắt
          </div>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div style={{ margin: '12px 20px 0', padding: '8px 12px', background: '#fce8e6', color: '#c5221f', borderRadius: '4px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ margin: '12px 20px 0', padding: '8px 12px', background: '#e6f4ea', color: '#137333', borderRadius: '4px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {/* Modal Body */}
        <div className="modal-body">
          {/* TAB 1: URL Crawler */}
          {activeTab === 'url' && (
            <form onSubmit={handleFetchFromUrl} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">URL Trang Web Truyện:</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://truyenfull.io/ten-truyen/chuong-1/"
                  value={storyUrl}
                  onChange={e => setStoryUrl(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">CSS Selector bóc tách (Tùy chọn - Tự động nếu để trống):</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: .chapter-c, #chapter-content, article"
                  value={cssSelector}
                  onChange={e => setCssSelector(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số từ tối đa mỗi ô (Cell Chunk Size): {wordsPerChunk} từ</label>
                <input
                  type="range"
                  min="10"
                  max="40"
                  value={wordsPerChunk}
                  onChange={e => setWordsPerChunk(Number(e.target.value))}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Đang bóc tách...</> : 'Bóc Tách & Đổ Vào Bảng Tính'}
              </button>
            </form>
          )}

          {/* TAB 2: Manual Text Paste */}
          {activeTab === 'manual' && (
            <form onSubmit={handleParseManualText} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Tiêu đề chương / truyện:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Đấu La Đại Lục - Chương 45"
                  value={manualTitle}
                  onChange={e => setManualTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nội dung văn bản thô (Copy/Paste vào đây):</label>
                <textarea
                  className="form-textarea"
                  rows={8}
                  placeholder="Dán toàn bộ văn bản chương truyện vào đây..."
                  value={manualText}
                  onChange={e => setManualText(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Đang phân rã...</> : 'Tạo Bảng Tính Ngụy Trang'}
              </button>
            </form>
          )}

          {/* TAB 3: Presets */}
          {activeTab === 'preset' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: '#5f6368' }}>
                Chọn một truyện mẫu có sẵn dưới đây để trải nghiệm ngay lập tức không cần URL:
              </p>
              {presets.map(p => (
                <div 
                  key={p.id}
                  style={{
                    padding: '12px',
                    border: '1px solid #dadce0',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f8f9fa'
                  }}
                >
                  <span style={{ fontWeight: 500, color: '#202124' }}>{p.title}</span>
                  <button 
                    className="btn-secondary" 
                    onClick={() => handleSelectPreset(p.id)}
                    disabled={loading}
                  >
                    Tải Truyện Này
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Settings & Shortcut Guide */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#e8f0fe', padding: '12px', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 8px', color: '#1a73e8' }}>⌨️ Danh sách phím tắt sinh tồn:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li><strong>Ctrl + Shift + /</strong> (hoặc Cmd + Shift + /): Mở / Đóng bảng điều khiển này bất kỳ lúc nào.</li>
                  <li><strong>ESC</strong> hoặc <strong>SPACE</strong>: Kích hoạt <strong>Panic Mode</strong> (Đổi tức thì cột C thành log công việc giả).</li>
                  <li><strong>Mũi tên ⬇️ ⬆️</strong>: Điều hướng từng câu truyện row-by-row và đồng bộ lên thanh Formula Bar.</li>
                  <li><strong>PageDown / PageUp</strong>: Cuộn nhanh 8 dòng truyện.</li>
                </ul>
              </div>

              <div className="form-group">
                <label className="form-label">Độ dài cắt câu trung bình (Words per chunk):</label>
                <input
                  type="number"
                  className="form-input"
                  min="10"
                  max="50"
                  value={wordsPerChunk}
                  onChange={e => setWordsPerChunk(Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <span style={{ fontSize: '12px', color: '#70757a' }}>
            💡 Mẹo: Nhấp vào Icon Google Sheets ở góc trên bên trái bất kỳ lúc nào để mở lại menu này.
          </span>
          <button className="btn-secondary" onClick={onClose}>Thoát</button>
        </div>
      </div>
    </div>
  );
}
