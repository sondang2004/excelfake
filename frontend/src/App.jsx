import React, { useState, useEffect, useMemo } from 'react';
import TopBar from './components/TopBar';
import Toolbar from './components/Toolbar';
import FormulaBar from './components/FormulaBar';
import SpreadsheetGrid from './components/SpreadsheetGrid';
import SecretModal from './components/SecretModal';
import StatusBar from './components/StatusBar';
import { generateInitialRows } from './mockData';

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
  const [wordsPerChunk, setWordsPerChunk] = useState(20);

  // Load reading progress from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('boss_key_story_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.storyChunks && parsed.storyChunks.length > 0) {
          setStoryChunks(parsed.storyChunks);
          setActiveStoryTitle(parsed.activeStoryTitle || '');
          setStoryUrl(parsed.storyUrl || '');
          if (parsed.savedRow !== undefined) {
            setSelectedCell({ row: parsed.savedRow, col: 'C' });
          }
          return;
        }
      }
    } catch (err) {
      console.log('Error reading localStorage:', err);
    }

    // Default load preset story "Tây Du Ký" if nothing saved
    fetch('http://localhost:5000/api/presets/tay-du-ky-1')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStoryChunks(data.chunks);
          setActiveStoryTitle(data.title);
        }
      })
      .catch(err => console.log('Error fetching default preset:', err));
  }, []);

  // Save reading progress to localStorage
  useEffect(() => {
    if (storyChunks.length > 0) {
      try {
        localStorage.setItem('boss_key_story_data', JSON.stringify({
          storyChunks,
          activeStoryTitle,
          storyUrl,
          savedRow: selectedCell.row
        }));
      } catch (err) {
        console.log('Error saving to localStorage:', err);
      }
    }
  }, [storyChunks, activeStoryTitle, storyUrl, selectedCell.row]);

  // Global Keyboard Event Listener for Shortcuts (Panic ESC, Secret Modal Ctrl+Shift+/)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
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
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Generate spreadsheet rows based on storyChunks and isPanic state
  const rows = useMemo(() => {
    const totalRowCount = Math.max(60, storyChunks.length + 10);
    return generateInitialRows(totalRowCount, storyChunks, isPanic);
  }, [storyChunks, isPanic]);

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

  // Handle formula bar edit (allows editing current cell value)
  const handleFormulaChange = (newValue) => {
    if (selectedCell.col === 'C' && !isPanic) {
      const updated = [...storyChunks];
      updated[selectedCell.row] = newValue;
      setStoryChunks(updated);
    }
  };

  // Callback when story is loaded from modal
  const handleLoadStory = (title, chunks, url = '', nextUrl = '') => {
    setActiveStoryTitle(title);
    setStoryChunks(chunks);
    setStoryUrl(url);
    setNextChapterUrl(nextUrl);
    setSelectedCell({ row: 0, col: 'C' });
    setIsPanic(false);
  };

  const activeAddress = `${selectedCell.col}${selectedCell.row + 1}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
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
      />
    </div>
  );
}
