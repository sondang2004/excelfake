import React from 'react';
import {
  Undo2, Redo2, Printer, Paintbrush, ZoomIn,
  DollarSign, Percent, ArrowLeftRight, Bold,
  Italic, Strikethrough, Baseline, PaintBucket,
  Grid, AlignLeft, AlignCenter, AlignRight,
  Link, MessageSquarePlus, Filter, Sigma, ShieldAlert, BookOpen,
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';

export default function Toolbar({
  onOpenSecretModal,
  isPanic,
  togglePanic,
  prevChapterUrl,
  nextChapterUrl,
  onFetchChapter,
  loadingChapter
}) {
  return (
    <div className="sheets-toolbar">
      <button className="tb-btn" title="Hoàn tác (Ctrl+Z)"><Undo2 size={15} /></button>
      <button className="tb-btn" title="Làm lại (Ctrl+Y)"><Redo2 size={15} /></button>
      <button className="tb-btn" title="In (Ctrl+P)"><Printer size={15} /></button>
      <button className="tb-btn" title="Sao chép định dạng"><Paintbrush size={15} /></button>
      <button className="tb-btn" title="Thu phóng">100%</button>

      <div className="tb-divider" />

      {/* Chapter Navigation Buttons */}
      <div className="chap-nav-group">
        <button
          className="chap-nav-btn"
          disabled={!prevChapterUrl || loadingChapter}
          onClick={() => onFetchChapter && onFetchChapter(prevChapterUrl, 'prev')}
          title="Lùi về chương trước (Phím tắt: Shift + Mũi tên trái ⬅️)"
        >
          {loadingChapter ? <Loader2 size={13} className="animate-spin" /> : <ChevronLeft size={14} />}
          Chương trước <span className="shortcut-tag">Shift+⬅️</span>
        </button>

        <button
          className="chap-nav-btn"
          disabled={!nextChapterUrl || loadingChapter}
          onClick={() => onFetchChapter && onFetchChapter(nextChapterUrl, 'next')}
          title="Nhảy sang chương kế tiếp (Phím tắt: Shift + Mũi tên phải ➡️)"
        >
          Chương sau {loadingChapter ? <Loader2 size={13} className="animate-spin" /> : <ChevronRight size={14} />}
          <span className="shortcut-tag">Shift+➡️</span>
        </button>
      </div>

      <div className="tb-divider" />

      <button className="tb-btn" title="Định dạng dưới dạng tiền tệ"><DollarSign size={15} /></button>
      <button className="tb-btn" title="Định dạng dưới dạng phần trăm"><Percent size={15} /></button>
      <button className="tb-btn" title="Giảm số chữ số thập phân">.0</button>
      <button className="tb-btn" title="Tăng số chữ số thập phân">.00</button>

      <div className="tb-divider" />

      <button className="tb-btn" style={{ fontWeight: 500 }} title="Phông chữ">Roboto</button>
      <button className="tb-btn" title="Kích thước phông chữ">10</button>

      <div className="tb-divider" />

      <button className="tb-btn" title="In đậm (Ctrl+B)"><Bold size={15} /></button>
      <button className="tb-btn" title="In nghiêng (Ctrl+I)"><Italic size={15} /></button>
      <button className="tb-btn" title="Gạch ngang"><Strikethrough size={15} /></button>
      <button className="tb-btn" title="Màu văn bản"><Baseline size={15} /></button>
      <button className="tb-btn" title="Màu tô"><PaintBucket size={15} /></button>

      <div className="tb-divider" />

      <button className="tb-btn" title="Viền ô"><Grid size={15} /></button>
      <button className="tb-btn" title="Căn trái"><AlignLeft size={15} /></button>
      <button className="tb-btn" title="Căn giữa"><AlignCenter size={15} /></button>
      <button className="tb-btn" title="Căn phải"><AlignRight size={15} /></button>

      <div className="tb-divider" />

      <button className="tb-btn" title="Chèn liên kết (Ctrl+K)"><Link size={15} /></button>
      <button className="tb-btn" title="Chèn nhận xét"><MessageSquarePlus size={15} /></button>
      <button className="tb-btn" title="Tạo bộ lọc"><Filter size={15} /></button>
      <button className="tb-btn" title="Hàm"><Sigma size={15} /></button>

      <div className="tb-divider" />

      {/* Secret Action Controls */}
      <button
        className="tb-btn"
        onClick={onOpenSecretModal}
        style={{ color: '#1a73e8', fontWeight: 600, display: 'flex', gap: '4px' }}
        title="Mở bảng dán/tải truyện (Phím tắt: Ctrl+Shift+/)"
      >
        <BookOpen size={15} /> Nhập Truyện
      </button>

      <button
        className={`tb-btn ${isPanic ? 'active' : ''}`}
        onClick={togglePanic}
        style={{
          color: isPanic ? '#c5221f' : '#b06000',
          backgroundColor: isPanic ? '#fce8e6' : '#feefc3',
          fontWeight: 600,
          display: 'flex',
          gap: '4px',
          marginLeft: 'auto'
        }}
        title="Bật/Tắt tức thì chế độ Panic Mode (Khẩn cấp)"
      >
        <ShieldAlert size={15} /> {isPanic ? 'NONE' : 'RED'}
      </button>
    </div>
  );
}

