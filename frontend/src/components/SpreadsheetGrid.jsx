import React, { useState, useEffect, useRef } from 'react';

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const COL_NAMES = {
  A: 'Mã Dự Án',
  B: 'Mã Nhân Viên',
  C: 'Mô tả Công việc / Ghi chú Log',
  D: 'Trạng thái',
  E: 'Mức ưu tiên',
  F: 'Ngân sách',
  G: 'Người phụ trách',
  H: 'Ngày cập nhật'
};

const COL_WIDTHS = {
  A: 110,
  B: 110,
  C: 500, // Generous width for novel reading!
  D: 130,
  E: 120,
  F: 120,
  G: 150,
  H: 120
};

export default function SpreadsheetGrid({
  rows,
  selectedCell,
  setSelectedCell,
  isPanic,
  onCellUpdate
}) {
  const tableContainerRef = useRef(null);
  const activeRowRef = useRef(null);

  // Inline editing state
  const [editingCell, setEditingCell] = useState(null); // { row, col }
  const [editingValue, setEditingValue] = useState('');

  const getCellValue = (r, colKey) => {
    if (!r) return '';
    switch (colKey) {
      case 'A': return r.colA;
      case 'B': return r.colB;
      case 'C': return r.colC;
      case 'D': return r.colD;
      case 'E': return r.colE;
      case 'F': return r.colF;
      case 'G': return r.colG;
      case 'H': return r.colH;
      default: return '';
    }
  };

  const startEditing = (row, col, currentVal) => {
    setEditingCell({ row, col });
    setEditingValue(currentVal || '');
  };

  // Keyboard navigation & edit trigger handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing inside modal or another input
      const activeTag = document.activeElement?.tagName;
      if (['TEXTAREA', 'SELECT'].includes(activeTag) || (activeTag === 'INPUT' && !document.activeElement.classList.contains('cell-inline-input'))) {
        return;
      }

      // If currently editing inside grid, ignore grid navigation keys
      if (editingCell) return;

      const { row, col } = selectedCell;
      const colIndex = COLS.indexOf(col);
      const totalRows = rows.length;

      switch (e.key) {
        case 'Enter':
        case 'F2':
          e.preventDefault();
          startEditing(row, col, getCellValue(rows[row], col));
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (row < totalRows - 1) {
            setSelectedCell({ row: row + 1, col });
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (row > 0) {
            setSelectedCell({ row: row - 1, col });
          }
          break;
        case 'ArrowRight':
          if (!e.shiftKey) {
            e.preventDefault();
            if (colIndex < COLS.length - 1) {
              setSelectedCell({ row, col: COLS[colIndex + 1] });
            }
          }
          break;
        case 'ArrowLeft':
          if (!e.shiftKey) {
            e.preventDefault();
            if (colIndex > 0) {
              setSelectedCell({ row, col: COLS[colIndex - 1] });
            }
          }
          break;
        case 'PageDown':
          e.preventDefault();
          setSelectedCell({ row: Math.min(totalRows - 1, row + 8), col });
          break;
        case 'PageUp':
          e.preventDefault();
          setSelectedCell({ row: Math.max(0, row - 8), col });
          break;
        case 'Home':
          e.preventDefault();
          setSelectedCell({ row: 0, col: 'A' });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, rows, setSelectedCell, editingCell]);

  // Auto-scroll active row into view
  useEffect(() => {
    if (activeRowRef.current && !editingCell) {
      activeRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedCell.row, editingCell]);

  return (
    <div className="spreadsheet-container" ref={tableContainerRef} tabIndex={0}>
      <table className="sheets-table">
        <thead>
          <tr>
            {/* Top-left corner box */}
            <th className="corner-cell" />
            {COLS.map((colKey) => (
              <th
                key={colKey}
                className={`col-header ${selectedCell.col === colKey ? 'selected' : ''}`}
                style={{ width: `${COL_WIDTHS[colKey]}px`, minWidth: `${COL_WIDTHS[colKey]}px` }}
              >
                {colKey}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Sub-header row showing column business labels */}
          <tr style={{ background: '#f8f9fa' }}>
            <td className="row-header" style={{ height: '22px', fontSize: '11px', color: '#9aa0a6' }}>#</td>
            {COLS.map((colKey) => (
              <td
                key={`sub-${colKey}`}
                style={{
                  height: '22px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: colKey === 'C' ? '#0b8043' : '#5f6368',
                  background: colKey === 'C' ? '#e6f4ea' : '#f8f9fa',
                  textAlign: colKey === 'F' ? 'right' : 'left'
                }}
              >
                {COL_NAMES[colKey]}
              </td>
            ))}
          </tr>

          {/* Main Grid Rows */}
          {rows.map((rowItem, rIndex) => {
            const isRowFocused = selectedCell.row === rIndex;

            return (
              <tr
                key={rowItem.id}
                ref={isRowFocused ? activeRowRef : null}
              >
                {/* Row Header 1, 2, 3... */}
                <td
                  className={`row-header ${isRowFocused ? 'selected' : ''}`}
                  onClick={() => setSelectedCell({ row: rIndex, col: 'C' })}
                >
                  {rIndex + 1}
                </td>

                {/* Data Cells */}
                {COLS.map((colKey) => {
                  const isCellActive = selectedCell.row === rIndex && selectedCell.col === colKey;
                  const isEditingThisCell = editingCell && editingCell.row === rIndex && editingCell.col === colKey;
                  const cellValue = getCellValue(rowItem, colKey);
                  const isStoryCol = colKey === 'C';

                  return (
                    <td
                      key={`${rIndex}-${colKey}`}
                      className={`
                        data-cell 
                        ${isRowFocused ? 'focused-row' : ''} 
                        ${isCellActive ? 'active-cell' : ''} 
                        ${isStoryCol ? 'story-cell' : ''}
                        ${isPanic ? 'panic' : ''}
                      `}
                      onClick={() => setSelectedCell({ row: rIndex, col: colKey })}
                      onDoubleClick={() => startEditing(rIndex, colKey, cellValue)}
                      style={{
                        textAlign: colKey === 'F' ? 'right' : 'left',
                        fontWeight: isStoryCol && isRowFocused && !isPanic ? 500 : 400,
                        color: isStoryCol && isRowFocused && !isPanic ? '#0b8043' : undefined
                      }}
                      title={isStoryCol ? "Nhấp kép để sửa nội dung | Dùng ⬇️ ⬆️ để đọc" : "Nhấp kép chuột để sửa giá trị ô này"}
                    >
                      {isEditingThisCell ? (
                        <input
                          autoFocus
                          className="cell-inline-input"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              onCellUpdate && onCellUpdate(rIndex, colKey, editingValue);
                              setEditingCell(null);
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              setEditingCell(null);
                            }
                          }}
                          onBlur={() => {
                            onCellUpdate && onCellUpdate(rIndex, colKey, editingValue);
                            setEditingCell(null);
                          }}
                        />
                      ) : (
                        <>
                          {cellValue}
                          {isCellActive && <div className="active-cell-handle" />}
                        </>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

