import React from 'react';
import { Plus, Menu } from 'lucide-react';

export default function StatusBar({ totalRows, selectedRowIndex }) {
  return (
    <div className="sheets-statusbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button className="tb-btn" title="Tất cả các trang tính"><Menu size={14} /></button>
        <button className="tb-btn" title="Thêm trang tính mới"><Plus size={14} /></button>

        <div className="tab-list">
          <div className="tab-btn active">
            <span>📊 Báo cáo KPI Q3</span>
          </div>
          <div className="tab-btn">
            <span>📈 Audit Log Chi Tiết</span>
          </div>
          <div className="tab-btn">
            <span>⚙️ System Resources</span>
          </div>
        </div>
      </div>

      <div className="status-stats">
        <span>ĐANG ĐỌC: DÒNG {selectedRowIndex + 1} / {totalRows}</span>
        <span>ĐÃ CHỌN: 1 Ô</span>
        <span>TỔNG: $48,950.00</span>
        <span>TRUNG BÌNH: $3,263.33</span>
        <span>ĐẾM: {totalRows}</span>
      </div>
    </div>
  );
}
