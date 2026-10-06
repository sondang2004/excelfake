import React from 'react';

export default function FormulaBar({ activeCellAddress, activeCellValue, onFormulaChange }) {
  return (
    <div className="sheets-formulabar">
      <div className="cell-address-box">
        {activeCellAddress || 'C1'}
      </div>
      <div className="fx-icon">fx</div>
      <input
        type="text"
        className="formula-input"
        value={activeCellValue || ''}
        onChange={(e) => onFormulaChange && onFormulaChange(e.target.value)}
        placeholder="Nhập công thức hoặc giá trị ô"
        title="Thanh công thức (Formula Bar) - Bạn có thể xem đoạn truyện mượt mà tại đây"
      />
    </div>
  );
}
