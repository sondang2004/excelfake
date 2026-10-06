const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper function to split text into chunks of roughly N words
function chunkText(text, targetWords = 20) {
  if (!text) return [];
  
  // Clean whitespace
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return [];

  // Split into sentences first
  const sentenceRegex = /[^.!?]+[.!?]+["']?|[^.!?]+$/g;
  const rawSentences = cleanText.match(sentenceRegex) || [cleanText];

  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;

  for (const rawSentence of rawSentences) {
    const sentence = rawSentence.trim();
    if (!sentence) continue;
    
    const words = sentence.split(/\s+/);
    
    // If a single sentence is very long (> 35 words), split it into smaller sub-sentences
    if (words.length > targetWords * 1.8) {
      let subWordAcc = [];
      for (const w of words) {
        subWordAcc.push(w);
        if (subWordAcc.length >= targetWords) {
          if (currentChunk.length > 0) {
            chunks.push(currentChunk.join(' '));
            currentChunk = [];
            currentWordCount = 0;
          }
          chunks.push(subWordAcc.join(' '));
          subWordAcc = [];
        }
      }
      if (subWordAcc.length > 0) {
        currentChunk.push(...subWordAcc);
        currentWordCount += subWordAcc.length;
      }
    } else {
      if (currentWordCount + words.length > targetWords * 1.4 && currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
        currentChunk = [sentence];
        currentWordCount = words.length;
      } else {
        currentChunk.push(sentence);
        currentWordCount += words.length;
      }
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks.filter(c => c && c.trim().length > 0);
}

// Built-in sample presets for instant testing
const SAMPLE_PRESETS = [
  {
    id: 'tay-du-ky-1',
    title: 'Tây Du Ký - Chương 1: Đá thần sinh hầu vương',
    content: `Thế giới ban đầu vốn hỗn mang chưa phân định rõ ràng. Từ khi Bàn Cổ mở trời đất, chia làm bốn châu lớn: Đông Thắng Thần Châu, Tây Ngưu Hóa Châu, Nam Thiệm Bộ Châu, Bắc Câu Lô Châu. Ở Đông Thắng Thần Châu có một quốc gia tên là Hoa Quả Sơn.
    Trên đỉnh núi Hoa Quả có một hòn đá tiên. Hòn đá này thụ hưởng tinh hoa trời đất, nhật nguyệt lâu đời, chợt một ngày nọ bỗng nứt ra một quả trứng đá lớn bằng quả bóng. Qua một trận gió lớn, quả trứng đá hóa thành một con thạch hầu có đủ ngũ quan, tay chân linh hoạt.
    Con khỉ đá này biết đi đứng chạy nhảy, uống nước suối, ăn hoa quả, tìm bạn bầy hàng ngày. Một hôm trời nắng gắt, bầy khỉ rủ nhau đi tắm ở dòng suối trong. Chúng phát hiện ra một thác nước lớn đổ xuống như tấm rèm trắng xóa.
    Khỉ đá xung phong nhảy qua thác nước và phát hiện đằng sau thác là một động đá rộng lớn thanh tĩnh, đặt tên là Thủy Liêm Động. Bầy khỉ tôn khỉ đá lên làm Mỹ Hầu Vương.`
  },
  {
    id: 'tam-quoc-1',
    title: 'Tam Quốc Diễn Nghĩa - Chương 1: Tiệc vườn đào kết nghĩa',
    content: `Nói về thế đại hạ trong thiên hạ, hễ phân lâu rồi lại hợp, hợp lâu rồi lại phân. Cuối đời nhà Hán, thế nước suy yếu, các nơi nổi dậy hỗn loạn.
    Lúc bấy giờ tại quận Trác, có một người tên là Lưu Bị, tự là Huyền Đức, vốn là dòng dõi Tăng Vương nhà Hán. Lưu Bị tính tình khoan hòa, ít nói, chí khí lớn lao.
    Trong làng có hai người anh hùng khác: một người tên Quan Vũ tự Vân Trường, mặt đỏ như gấc, râu dài hai thước; một người tên Trương Phi tự Dực Đức, tiếng nói như sấm, sức địch muôn người.
    Ba người gặp nhau tại quán rượu, ý hợp tâm đầu, cùng rủ nhau đến vườn đào sau nhà Trương Phi làm lễ kết nghĩa anh em, nguyện cùng sống chết có nhau, phò vua giúp nước.`
  }
];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Presets list endpoint
app.get('/api/presets', (req, res) => {
  res.json({
    success: true,
    presets: SAMPLE_PRESETS.map(p => ({ id: p.id, title: p.title }))
  });
});

// Get preset detail endpoint
app.get('/api/presets/:id', (req, res) => {
  const preset = SAMPLE_PRESETS.find(p => p.id === req.params.id);
  if (!preset) {
    return res.status(404).json({ success: false, message: 'Preset not found' });
  }
  const chunks = chunkText(preset.content, 20);
  res.json({
    success: true,
    title: preset.title,
    totalChunks: chunks.length,
    chunks
  });
});

// Crawl web novel API endpoint
app.post('/api/fetch-story', async (req, res) => {
  try {
    const { url, selector, wordsPerChunk = 20 } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL là bắt buộc.' });
    }

    // Fetch raw HTML
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    const $ = cheerio.load(response.data);

    // Remove noise & unwanted elements
    $('script, style, iframe, nav, header, footer, .ads, .quang-cao, .author-note, .btn, .comments, #comments').remove();

    // Auto extract title
    let title = $('h1').first().text().trim() || 
                $('.chapter-title').first().text().trim() || 
                $('title').text().trim() || 
                'Chương truyện từ URL';

    let rawStoryText = '';

    if (selector && $(selector).length > 0) {
      rawStoryText = $(selector).text();
    } else {
      // Auto-detect common story content selectors
      const commonSelectors = [
        '.chapter-c',
        '.chr-c',
        '#chapter-content',
        '.reading-detail',
        '#content',
        '.box-chap',
        '.chap-content',
        '.content-chap',
        'article',
        '.entry-content',
        '.post-content'
      ];

      for (const sel of commonSelectors) {
        if ($(sel).length > 0) {
          rawStoryText = $(sel).text();
          break;
        }
      }

      // Fallback if no container matched: gather all <p> text inside body
      if (!rawStoryText.trim()) {
        const paragraphs = [];
        $('p').each((_, el) => {
          const pText = $(el).text().trim();
          if (pText.length > 20) { // filter out short nav items
            paragraphs.push(pText);
          }
        });
        rawStoryText = paragraphs.join('\n');
      }
    }

    if (!rawStoryText || rawStoryText.trim().length < 30) {
      return res.status(422).json({
        success: false,
        message: 'Không thể bóc tách nội dung truyện từ URL này. Vui lòng kiểm tra lại selector hoặc sử dụng tính năng "Dán văn bản thủ công".'
      });
    }

    const chunks = chunkText(rawStoryText, Number(wordsPerChunk) || 20);

    // Look for potential Next Chapter / Prev Chapter links
    let nextChapterUrl = null;
    let prevChapterUrl = null;
    $('a').each((_, el) => {
      const text = $(el).text().toLowerCase();
      const href = $(el).attr('href');
      if (!href) return;
      if ((text.includes('chương sau') || text.includes('tiếp') || text.includes('next')) && !nextChapterUrl) {
        nextChapterUrl = href.startsWith('http') ? href : new URL(href, url).href;
      }
      if ((text.includes('chương trước') || text.includes('trước') || text.includes('prev')) && !prevChapterUrl) {
        prevChapterUrl = href.startsWith('http') ? href : new URL(href, url).href;
      }
    });

    return res.json({
      success: true,
      title,
      totalChunks: chunks.length,
      chunks,
      nextChapterUrl,
      prevChapterUrl
    });

  } catch (err) {
    console.error('Error fetching story:', err.message);
    return res.status(500).json({
      success: false,
      message: `Lỗi khi tải URL truyện: ${err.message}. Bạn có thể thử dán trực tiếp nội dung vào mục "Dán văn bản thủ công".`
    });
  }
});

// Manual text parser API endpoint
app.post('/api/parse-text', (req, res) => {
  try {
    const { text, title = 'Văn bản thủ công', wordsPerChunk = 20 } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Văn bản không được để trống.' });
    }

    const chunks = chunkText(text, Number(wordsPerChunk) || 20);

    return res.json({
      success: true,
      title: title.trim(),
      totalChunks: chunks.length,
      chunks
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: `Lỗi xử lý văn bản: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
