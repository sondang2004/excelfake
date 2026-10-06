import React from 'react';
import { Star, Folder, CloudCheck, MessageSquare, Video, Share2, ShieldAlert, Eye, Lock } from 'lucide-react';

export default function TopBar({ 
  docTitle, 
  setDocTitle, 
  onOpenSecretModal, 
  isPanic, 
  togglePanic,
  activeStoryTitle
}) {
  return (
    <div className="sheets-topbar">
      <div className="sheets-title-container">
        {/* Google Sheets Green Icon */}
        <div className="sheets-logo" onClick={onOpenSecretModal} title="Click để mở Trình quản lý truyện bí mật">
          <svg viewBox="0 0 40 40" width="36" height="36">
            <rect width="40" height="40" rx="6" fill="#0f9d58" />
            <path d="M12 10h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z" fill="#ffffff" />
            <path d="M14 14h12v3H14zM14 19h12v3H14zM14 24h12v3H14z" fill="#0f9d58" />
          </svg>
        </div>

        <div className="sheets-title-section">
          <div className="sheets-doc-title-row">
            <input
              type="text"
              className="sheets-title-input"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              title="Đổi tên tệp bảng tính"
            />
            <Star size={16} className="text-gray-400 cursor-pointer hover:text-yellow-500" />
            <Folder size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
            <CloudCheck size={16} className="text-gray-400 cursor-pointer" title="Đã lưu vào Drive" />
            
            {/* Panic Mode Status Badge */}
            <span 
              className={`badge-panic ${isPanic ? 'active' : ''}`}
              onClick={togglePanic}
              title="Nhấn phím ESC / SPACE để bật/tắt chế độ hoảng loạn"
              style={{ cursor: 'pointer', marginLeft: '8px' }}
            >
              {isPanic ? <ShieldAlert size={12} /> : <Eye size={12} />}
              {isPanic ? 'PANIC: ON (Nội dung giả)' : 'BOSS KEY: STANDBY'}
            </span>
          </div>

          {/* Google Sheets Main Menu */}
          <div className="sheets-menu-bar">
            <span className="menu-item">Tệp</span>
            <span className="menu-item">Chỉnh sửa</span>
            <span className="menu-item">Xem</span>
            <span className="menu-item">Chèn</span>
            <span className="menu-item">Định dạng</span>
            <span className="menu-item" onClick={onOpenSecretModal} style={{ fontWeight: 600, color: '#1a73e8' }}>
              Dữ liệu (Secret Ctrl+Shift+/)
            </span>
            <span className="menu-item">Công cụ</span>
            <span className="menu-item">Tiện ích mở rộng</span>
            <span className="menu-item">Trợ giúp</span>
          </div>
        </div>
      </div>

      {/* Top Right Action Items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {activeStoryTitle && !isPanic && (
          <span style={{ fontSize: '11px', color: '#5f6368', background: '#e8f0fe', padding: '3px 8px', borderRadius: '4px' }}>
            📖 Đang đọc: {activeStoryTitle}
          </span>
        )}
        <MessageSquare size={18} className="text-gray-600 cursor-pointer" title="Lịch sử nhận xét" />
        <Video size={18} className="text-gray-600 cursor-pointer" title="Tham gia cuộc họp" />
        
        <button className="btn-primary" style={{ backgroundColor: '#c2e7ff', color: '#001d35', border: 'none' }}>
          <Lock size={14} /> Chia sẻ
        </button>

        {/* Realistic User Avatar */}
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '50%', 
          backgroundColor: '#1a73e8', 
          color: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: '13px'
        }}>
          NV
        </div>
      </div>
    </div>
  );
}
