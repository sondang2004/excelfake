import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import TopBar from './components/TopBar';
import Toolbar from './components/Toolbar';
import FormulaBar from './components/FormulaBar';
import SpreadsheetGrid from './components/SpreadsheetGrid';
import SecretModal from './components/SecretModal';
import StatusBar from './components/StatusBar';
import { generateInitialRows, DEFAULT_CORPORATE_FAKES } from './mockData';
import { BookOpen, AlertCircle, CheckCircle2, Loader2, Info } from 'lucide-react';

export default function App() {
  const [docTitle, setDocTitle] = useState('Báo_cáo_KPI_Dự_Án_Q3_2026.xlsx');
  const [isPanic, setIsPanic] = useState(false);
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 'C' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Story states
  const [storyChunks, setStoryChunks] = useState([]);
  const [activeStoryTitle, setActiveStoryTitle] = useState('');
  const [storyUrl, setStoryUrl] = useState('');
  const [nextChapterUrl, setNextChapterUrl] = useState('');
  const [prevChapterUrl, setPrevChapterUrl] = useState('');
  const [wordsPerChunk, setWordsPerChunk] = useState(20);
  const [loadingChapter, setLoadingChapter] = useState(false);

  // Customization & Persistence states
  const [customOverrides, setCustomOverrides] = useState({});
  const [customPanicLogs, setCustomPanicLogs] = useState([]);

  // Toast notification state: { text: string, type: 'info' | 'success' | 'error' }
  const [toast, setToast] = useState(null);

  const showToast = useCallback((text, type = 'info', duration = 3500) => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(prev => (prev && prev.text === text ? null : prev));
    }, duration);
  }, []);

  // Refs for keyboard listener
  const nextChapterUrlRef = useRef(nextChapterUrl);
  const prevChapterUrlRef = useRef(prevChapterUrl);
  const storyUrlRef = useRef(storyUrl);
  const wordsPerChunkRef = useRef(wordsPerChunk);
  const loadingChapterRef = useRef(loadingChapter);

  useEffect(() => {
    nextChapterUrlRef.current = nextChapterUrl;
    prevChapterUrlRef.current = prevChapterUrl;
    storyUrlRef.current = storyUrl;
    wordsPerChunkRef.current = wordsPerChunk;
    loadingChapterRef.current = loadingChapter;
  }, [nextChapterUrl, prevChapterUrl, storyUrl, wordsPerChunk, loadingChapter]);

  // Load reading progress, custom cell overrides, and custom panic logs on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('boss_key_story_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.storyChunks && parsed.storyChunks.length > 0) {
          setStoryChunks(parsed.storyChunks);
          setActiveStoryTitle(parsed.activeStoryTitle || '');
          setStoryUrl(parsed.storyUrl || '');
          setNextChapterUrl(parsed.nextChapterUrl || '');
          setPrevChapterUrl(parsed.prevChapterUrl || '');
          if (parsed.savedRow !== undefined) {
            setSelectedCell({ row: parsed.savedRow, col: 'C' });
          }
        }
      }

      // Load custom cell overrides from localStorage
      const savedOverrides = localStorage.getItem('boss_key_custom_overrides');
      if (savedOverrides) {
        setCustomOverrides(JSON.parse(savedOverrides));
      }

      // Load custom panic logs from localStorage
      const savedPanicLogs = localStorage.getItem('boss_key_custom_panic_logs');
      if (savedPanicLogs) {
        setCustomPanicLogs(JSON.parse(savedPanicLogs));
      }
    } catch (err) {
      console.log('Error reading localStorage:', err);
    }

    // Default load preset story "Tây Du Ký" if no story active
    const savedData = localStorage.getItem('boss_key_story_data');
    if (!savedData) {
      fetch('http://localhost:5000/api/presets/tay-du-ky-1')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStoryChunks(data.chunks);
            setActiveStoryTitle(data.title);
          }
        })
        .catch(err => console.log('Error fetching default preset:', err));
    }
  }, []);

  // Save reading progress to localStorage
  useEffect(() => {
    if (storyChunks.length > 0) {
      try {
        localStorage.setItem('boss_key_story_data', JSON.stringify({
          storyChunks,
          activeStoryTitle,
          storyUrl,
          nextChapterUrl,
          prevChapterUrl,
          savedRow: selectedCell.row
        }));
      } catch (err) {
        console.log('Error saving to localStorage:', err);
      }
    }
  }, [storyChunks, activeStoryTitle, storyUrl, nextChapterUrl, prevChapterUrl, selectedCell.row]);

  // Handle individual cell updates (manual user editing in Grid or FormulaBar)
  const handleCellUpdate = useCallback((rIndex, colKey, newValue) => {
    setCustomOverrides(prev => {
      const updated = { ...prev, [`${rIndex}_${colKey}`]: newValue };
      try {
        localStorage.setItem('boss_key_custom_overrides', JSON.stringify(updated));
      } catch (e) {
        console.log('LocalStorage save error:', e);
      }
      return updated;
    });

    // If editing Column C, update active storyChunks as well
    if (colKey === 'C' && !isPanic) {
      setStoryChunks(prev => {
        const nextChunks = [...prev];
        nextChunks[rIndex] = newValue;
        return nextChunks;
      });
    }
  }, [isPanic]);

  // Save customized panic log sentences
  const handleSavePanicLogs = useCallback((newLogs) => {
    setCustomPanicLogs(newLogs);
    try {
      localStorage.setItem('boss_key_custom_panic_logs', JSON.stringify(newLogs));
      showToast('🛡️ Đã lưu danh sách Log Ngụy Trang cá nhân hóa!', 'success');
    } catch (e) {
      console.log('LocalStorage panic logs save error:', e);
    }
  }, [showToast]);

  // Reset all custom edits and panic logs back to defaults
  const handleResetAllData = useCallback(() => {
    setCustomOverrides({});
    setCustomPanicLogs([]);
    try {
      localStorage.removeItem('boss_key_custom_overrides');
      localStorage.removeItem('boss_key_custom_panic_logs');
      showToast('🔄 Đã khôi phục toàn bộ bảng tính về dữ liệu mặc định!', 'info');
    } catch (e) {
      console.log('Error resetting localStorage:', e);
    }
  }, [showToast]);

  // Fetch chapter from URL (Next or Prev)
  const handleFetchChapter = useCallback(async (targetUrl, direction = 'next') => {
    if (!targetUrl || loadingChapterRef.current) return;
    setLoadingChapter(true);
    const dirLabel = direction === 'next' ? 'tiếp theo (Shift + ➡️)' : 'trước đó (Shift + ⬅️)';
    showToast(`⏳ Đang tải chương ${dirLabel}...`, 'info', 5000);

    try {
      const res = await fetch('http://localhost:5000/api/fetch-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          wordsPerChunk: wordsPerChunkRef.current
        })
      });

      const data = await res.json();
      if (data.success) {
        setActiveStoryTitle(data.title);
        setStoryChunks(data.chunks);
        setStoryUrl(targetUrl);
        setNextChapterUrl(data.nextChapterUrl || '');
        setPrevChapterUrl(data.prevChapterUrl || '');
        setSelectedCell({ row: 0, col: 'C' });
        setIsPanic(false);
        showToast(`📖 Đã chuyển: ${data.title}`, 'success', 3000);
      } else {
        showToast(`❌ Lỗi tải chương: ${data.message || 'Không tìm thấy nội dung'}`, 'error', 4000);
      }
    } catch (err) {
      showToast(`❌ Lỗi kết nối Backend: ${err.message}`, 'error', 4000);
    } finally {
      setLoadingChapter(false);
    }
  }, [showToast]);

  // Global Keyboard Event Listener for Shortcuts (Panic ESC, Secret Modal Ctrl+Shift+/, Next/Prev Shift+Right/Left)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ignore if focus is inside text input/textarea
      const activeEl = document.activeElement;
      const isInputActive = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT' ||
        activeEl.isContentEditable
      );

      // Shortcut Ctrl + Shift + / or Cmd + Shift + / to open secret modal
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === '/' || e.key === '?')) {
        e.preventDefault();
        setIsModalOpen(prev => !prev);
        return;
      }

      // Panic Key: ESC
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsPanic(prev => !prev);
        return;
      }

      // Next Chapter: Shift + ArrowRight
      if (e.shiftKey && e.key === 'ArrowRight' && !isInputActive) {
        e.preventDefault();
        const nextUrl = nextChapterUrlRef.current;
        if (nextUrl) {
          handleFetchChapter(nextUrl, 'next');
        } else if (storyUrlRef.current) {
          showToast('⚠️ Không tìm thấy liên kết chương tiếp theo.', 'error');
        } else {
          showToast('💡 Hãy dán/nạp URL truyện từ menu "Nhập Truyện" (Ctrl+Shift+/) để dùng phím Shift+➡️', 'info');
        }
        return;
      }

      // Prev Chapter: Shift + ArrowLeft
      if (e.shiftKey && e.key === 'ArrowLeft' && !isInputActive) {
        e.preventDefault();
        const prevUrl = prevChapterUrlRef.current;
        if (prevUrl) {
          handleFetchChapter(prevUrl, 'prev');
        } else if (storyUrlRef.current) {
          showToast('⚠️ Không tìm thấy liên kết chương trước.', 'error');
        } else {
          showToast('💡 Hãy dán/nạp URL truyện từ menu "Nhập Truyện" (Ctrl+Shift+/) để dùng phím Shift+⬅️', 'info');
        }
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleFetchChapter, showToast]);

  // Generate spreadsheet rows based on storyChunks, isPanic, customOverrides, and customPanicLogs
  const rows = useMemo(() => {
    const totalRowCount = Math.max(60, storyChunks.length + 10);
    return generateInitialRows(totalRowCount, storyChunks, isPanic, customOverrides, customPanicLogs);
  }, [storyChunks, isPanic, customOverrides, customPanicLogs]);

  // Active cell value calculation
  const activeCellValue = useMemo(() => {
    if (!rows || rows.length === 0) return '';
    const r = rows[selectedCell.row];
    if (!r) return '';
    const colKey = selectedCell.col;
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
  }, [rows, selectedCell]);

  // Handle formula bar edit (allows editing current selected cell value)
  const handleFormulaChange = (newValue) => {
    handleCellUpdate(selectedCell.row, selectedCell.col, newValue);
  };

  // Callback when story is loaded from modal
  const handleLoadStory = (title, chunks, url = '', nextUrl = '', prevUrl = '') => {
    setActiveStoryTitle(title);
    setStoryChunks(chunks);
    setStoryUrl(url);
    setNextChapterUrl(nextUrl || '');
    setPrevChapterUrl(prevUrl || '');
    setSelectedCell({ row: 0, col: 'C' });
    setIsPanic(false);
    showToast(`📖 Đã nạp thành công: ${title}`, 'success');
  };

  const activeAddress = `${selectedCell.col}${selectedCell.row + 1}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      {/* Toast Notification Banner */}
      {toast && (
        <div className="chapter-toast-container">
          <div className={`chapter-toast ${toast.type}`}>
            {toast.type === 'info' && <Info size={18} />}
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Top Bar Header */}
      <TopBar
        docTitle={docTitle}
        setDocTitle={setDocTitle}
        onOpenSecretModal={() => setIsModalOpen(true)}
        isPanic={isPanic}
        togglePanic={() => setIsPanic(p => !p)}
        activeStoryTitle={activeStoryTitle}
      />

      {/* Main Google Sheets Toolbar */}
      <Toolbar
        onOpenSecretModal={() => setIsModalOpen(true)}
        isPanic={isPanic}
        togglePanic={() => setIsPanic(p => !p)}
        prevChapterUrl={prevChapterUrl}
        nextChapterUrl={nextChapterUrl}
        onFetchChapter={handleFetchChapter}
        loadingChapter={loadingChapter}
      />

      {/* Formula Bar (fx) */}
      <FormulaBar
        activeCellAddress={activeAddress}
        activeCellValue={activeCellValue}
        onFormulaChange={handleFormulaChange}
      />

      {/* Main Grid Spreadsheet */}
      <SpreadsheetGrid
        rows={rows}
        selectedCell={selectedCell}
        setSelectedCell={setSelectedCell}
        isPanic={isPanic}
        onCellUpdate={handleCellUpdate}
      />

      {/* Bottom Status Bar */}
      <StatusBar
        totalRows={rows.length}
        selectedRowIndex={selectedCell.row}
      />

      {/* Secret Control Modal (Ctrl + Shift + /) */}
      <SecretModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLoadStory={handleLoadStory}
        wordsPerChunk={wordsPerChunk}
        setWordsPerChunk={setWordsPerChunk}
        customPanicLogs={customPanicLogs}
        onSavePanicLogs={handleSavePanicLogs}
        onResetAllData={handleResetAllData}
      />
    </div>
  );
}


