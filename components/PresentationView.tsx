import React, { useState, useEffect, useRef } from 'react';
import { GameIdea, QuestionExample } from '../types';
import { X, ChevronRight, ChevronLeft, Trophy, Star, HelpCircle, PartyPopper, Box, CheckCircle2, RotateCw, Flower, Apple, Edit, Plus, Trash2, Save, Sparkles, Image as ImageIcon, ArrowRight, Volume2, ThumbsUp, ThumbsDown, Play, Music, Pause, SkipForward, Disc, Eye, Grid } from 'lucide-react';
import { generateGameIllustration } from '../services/gemini';

interface PresentationViewProps {
  idea: GameIdea;
  onClose: () => void;
  apiKey: string;
}

// --- SOUND LIBRARY DATA ---
const MUSIC_LIBRARY = {
  "Vui nhộn & Sôi động": [
    { title: "Nhạc Sân Trường", url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=happy-kids-10906.mp3" },
    { title: "Tiết Tấu Nhanh", url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=good-time-11364.mp3" },
    { title: "Ukulele Vui Vẻ", url: "https://cdn.pixabay.com/download/audio/2020/09/23/audio_8227b20464.mp3?filename=ukulele-trip-1262.mp3" }
  ],
  "Lịch Sử & Hào Hùng": [
    { title: "Khí Thế Hào Hùng", url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=epic-cinematic-trailer-11537.mp3" },
    { title: "Trống Trận", url: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=action-drums-10875.mp3" }
  ],
  "Mỹ Thuật & Sáng Tạo": [
    { title: "Thư Giãn Lo-fi", url: "https://cdn.pixabay.com/download/audio/2022/05/05/audio_13b5674d86.mp3?filename=lofi-study-11219.mp3" },
    { title: "Piano Nhẹ Nhàng", url: "https://cdn.pixabay.com/download/audio/2021/11/20/audio_c3c3325c38.mp3?filename=piano-moment-9835.mp3" }
  ]
};

// --- SOUND UTILITIES (Using Web Audio API for performance & no assets) ---
const playSound = (type: 'correct' | 'wrong' | 'click' | 'victory') => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === 'correct') {
    // High pitched ding-dong
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc.start(now);
    osc.stop(now + 0.6);
  } else if (type === 'wrong') {
    // Low buzzer
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (type === 'click') {
    // Short pop
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'victory') {
    // Arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.2, now + i * 0.15);
      g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.5);
      o.start(now + i * 0.15);
      o.stop(now + i * 0.15 + 0.5);
    });
  }
};

const speakText = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.9;
    
    // Lấy danh sách giọng đọc
    let voices = window.speechSynthesis.getVoices();
    
    // Nếu danh sách rỗng (do browser chưa load kịp), thử load lại
    if (voices.length === 0) {
       // Note: getVoices() trả về mảng rỗng nếu chưa ready, 
       // nhưng trong ngữ cảnh click handler thường đã ready.
       // Ta không thể force sync wait ở đây.
    }

    // Ưu tiên:
    // 1. Microsoft HoaiMy (Giọng Nữ Bắc chuẩn trên Windows)
    // 2. Google Tiếng Việt (Giọng Nữ Bắc trên Chrome/Android)
    const preferredVoice = voices.find(v => 
      (v.lang.includes('vi') && v.name.includes('HoaiMy')) || 
      (v.lang.includes('vi') && v.name.includes('Google'))
    );
    
    const anyVietnameseVoice = voices.find(v => v.lang.includes('vi'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    } else if (anyVietnameseVoice) {
      utterance.voice = anyVietnameseVoice;
    }

    window.speechSynthesis.speak(utterance);
  }
};

// --- HELPER COMPONENTS ---

const FormattedAnswer: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/;|\n/).filter(p => p.trim() !== '');
  if (parts.length > 1) {
    return (
      <div className="text-left inline-block w-full max-w-lg">
        <ul className="space-y-2 text-sm md:text-base">
          {parts.map((p, i) => (
            <li key={i} className="bg-white/10 rounded-lg px-3 py-1.5 border border-white/20 backdrop-blur-sm shadow-sm">
              {p.trim()}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return <span className="block leading-snug">{text}</span>;
};

// Realistic SVG Growth Tree Visualizer (Compact Version)
const GrowthTree: React.FC<{ steps: number; currentStep: number }> = ({ steps, currentStep }) => {
  const totalSteps = Math.max(steps, 1);
  const safeCurrentStep = Math.min(Math.max(0, currentStep), totalSteps - 1);
  const progress = (safeCurrentStep + 1) / totalSteps;
  const scale = 0.7 + (progress * 0.3);

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-end rounded-2xl">
       <div className="absolute inset-0 bg-gradient-to-b from-blue-200 to-green-100 opacity-50"></div>
       <svg viewBox="0 0 400 400" className="w-full h-full z-10" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="trunkGradientCompact" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5D4037" />
              <stop offset="100%" stopColor="#4E342E" />
            </linearGradient>
            <radialGradient id="leafGradientCompact" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#86EFAC" />
              <stop offset="100%" stopColor="#15803D" />
            </radialGradient>
          </defs>
          <path d="M-50,400 Q200,380 450,400 Z" fill="#84CC16" />
          <g transform={`translate(200, 400) scale(${scale})`}>
             <path d="M-15,0 Q-10,-80 -5,-160 Q0,-180 5,-160 Q10,-80 15,0 Z" fill="url(#trunkGradientCompact)" />
             {Array.from({ length: totalSteps }).map((_, idx) => {
               const isVisible = idx <= safeCurrentStep;
               const heightPercent = 0.2 + (idx / totalSteps) * 0.7;
               const yPos = -160 * heightPercent; 
               const side = idx % 2 === 0 ? -1 : 1;
               const branchLen = 30;
               const leafSize = 20;
               return (
                 <g key={idx} transform={`translate(0, ${yPos}) scale(${isVisible ? 1 : 0})`} className="transition-all duration-500">
                    <path d={`M0,0 Q${side * 5},-5 ${side * branchLen},-10`} stroke="#5D4037" strokeWidth="3" fill="none" />
                    <g transform={`translate(${side * branchLen}, -10)`}>
                       <circle r={leafSize} fill="url(#leafGradientCompact)" />
                       {idx === safeCurrentStep && (
                         <circle r={5} fill="#EF4444" className="animate-ping" opacity="0.5" />
                       )}
                    </g>
                 </g>
               );
             })}
          </g>
       </svg>
       <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full shadow-sm border border-green-200 z-20 whitespace-nowrap">
         <span className="font-bold text-green-800 text-xs">
           {safeCurrentStep + 1}/{totalSteps}
         </span>
       </div>
    </div>
  );
};

export const PresentationView: React.FC<PresentationViewProps> = ({ idea, onClose, apiKey }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [questions, setQuestions] = useState<QuestionExample[]>(idea.quizExamples || []);
  const [isEditing, setIsEditing] = useState(false);

  // Background Music State
  const [activeTrack, setActiveTrack] = useState<{title: string, url: string} | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showMusicMenu, setShowMusicMenu] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Puzzle State
  const [revealedTiles, setRevealedTiles] = useState<boolean[]>([]);
  const [mainImageLoading, setMainImageLoading] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(idea.illustration || null);

  const quizLength = questions.length;
  const totalSlides = 4 + quizLength + 1; 

  // Initialize revealedTiles
  useEffect(() => {
    if (questions.length > 0 && revealedTiles.length === 0) {
      setRevealedTiles(new Array(questions.length).fill(false));
    }
  }, [questions]);

  // Handle Flip & Reveal Tile logic
  useEffect(() => {
    setIsFlipped(false);
    window.speechSynthesis.cancel();
    
    // Automatically reveal tile if going back to a previously answered question? 
    // Or just rely on isFlipped. 
    // Let's keep revealedTiles persistent.
  }, [currentSlide]);

  // When card is flipped (answered), reveal the tile
  useEffect(() => {
    if (isFlipped) {
      const questionIndex = currentSlide - 4;
      if (questionIndex >= 0 && questionIndex < quizLength) {
         setRevealedTiles(prev => {
           const newTiles = [...prev];
           newTiles[questionIndex] = true;
           return newTiles;
         });
      }
    }
  }, [isFlipped, currentSlide, quizLength]);

  // Audio Player Effect
  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch(e => {
          console.warn("Autoplay prevented:", e);
          setIsMusicPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying, activeTrack]);

  // Generate Main Puzzle Image if not exists (using Topic)
  useEffect(() => {
    if (!mainImageUrl && apiKey && !mainImageLoading) {
      setMainImageLoading(true);
      generateGameIllustration(`Hình ảnh chủ đề: ${idea.topic || idea.title}`, "Hình ảnh giáo dục, màu sắc tươi sáng, phù hợp học sinh tiểu học", apiKey)
        .then(url => {
            if (url) setMainImageUrl(url);
        })
        .finally(() => setMainImageLoading(false));
    }
  }, [mainImageUrl, apiKey, idea.title, idea.topic]);

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playSound('click');
    if (currentSlide < totalSlides - 1) setCurrentSlide(c => c + 1);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playSound('click');
    if (currentSlide > 0) setCurrentSlide(c => c - 1);
  };

  // Question Editing Handlers
  const handleAddQuestion = () => {
    setQuestions([...questions, { type: 'Câu hỏi mới', question: 'Nhập nội dung câu hỏi...', answer: 'Nhập đáp án...', imageDescription: 'Hình ảnh minh họa' }]);
    setRevealedTiles(prev => [...prev, false]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    setRevealedTiles(prev => prev.filter((_, i) => i !== index));
    if (currentSlide >= 4 + newQuestions.length) setCurrentSlide(4 + newQuestions.length);
  };

  const handleUpdateQuestion = (index: number, field: keyof QuestionExample, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  // Sound Controls
  const handleCorrect = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('correct');
  };

  const handleWrong = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('wrong');
  };

  const handleSpeak = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(text);
  };

  const handleRevealAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('victory');
    setRevealedTiles(new Array(questions.length).fill(true));
  };

  // Music Controls
  const handleSelectTrack = (track: {title: string, url: string}) => {
    setActiveTrack(track);
    setIsMusicPlaying(true);
    setShowMusicMenu(false);
  };

  const toggleMusic = () => {
    if (!activeTrack) {
      setShowMusicMenu(true);
      return;
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  // CSS for animations
  const styles = `
    .perspective-1000 { perspective: 1000px; }
    .transform-style-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; }
    .rotate-y-180 { transform: rotateY(180deg); }
    .rotate-y-0 { transform: rotateY(0deg); }
    @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
    .animate-float { animation: float 3s ease-in-out infinite; }
    @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .animate-spin-slow { animation: spin-slow 8s linear infinite; }
  `;

  const renderMusicMenu = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-pop-in">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Music className="text-pink-500" size={24} /> Kho Nhạc Nền
          </h3>
          <button onClick={() => setShowMusicMenu(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {Object.entries(MUSIC_LIBRARY).map(([category, tracks]) => (
            <div key={category} className="mb-6">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">{category}</h4>
              <div className="grid gap-2">
                {tracks.map((track, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectTrack(track)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      activeTrack?.url === track.url 
                        ? 'bg-pink-50 border-pink-200 text-pink-700' 
                        : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTrack?.url === track.url ? 'bg-pink-200 text-pink-600' : 'bg-gray-100 text-gray-400'}`}>
                        {activeTrack?.url === track.url && isMusicPlaying ? (
                           <div className="flex gap-0.5 items-end h-3">
                             <div className="w-0.5 bg-current h-full animate-pulse"></div>
                             <div className="w-0.5 bg-current h-2 animate-pulse" style={{animationDelay: '0.1s'}}></div>
                             <div className="w-0.5 bg-current h-3 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                           </div>
                        ) : (
                           <Play size={14} fill="currentColor" />
                        )}
                      </div>
                      <span className="font-bold">{track.title}</span>
                    </div>
                    {activeTrack?.url === track.url && <CheckCircle2 size={18} />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Edit className="text-blue-500" size={20} /> Chỉnh sửa bộ câu hỏi
          </h3>
          <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {questions.map((q, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
               <div className="absolute top-2 right-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => handleRemoveQuestion(idx)} className="p-2 bg-white text-red-500 border border-red-100 rounded-lg"><Trash2 size={16} /></button>
               </div>
               <div className="grid gap-3">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Loại câu</label>
                      <input value={q.type} onChange={(e) => handleUpdateQuestion(idx, 'type', e.target.value)} className="w-full p-2 rounded-lg border text-sm font-medium outline-none" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-xs font-bold text-gray-400 uppercase">Câu hỏi</label>
                      <input value={q.question} onChange={(e) => handleUpdateQuestion(idx, 'question', e.target.value)} className="w-full p-2 rounded-lg border text-sm font-bold outline-none" />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Mô tả hình ảnh (AI tạo)</label>
                    <input value={q.imageDescription || ''} onChange={(e) => handleUpdateQuestion(idx, 'imageDescription', e.target.value)} className="w-full p-2 rounded-lg border text-sm outline-none" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Đáp án</label>
                    <textarea value={q.answer} onChange={(e) => handleUpdateQuestion(idx, 'answer', e.target.value)} rows={2} className="w-full p-2 rounded-lg border text-sm bg-green-50 outline-none resize-none" />
                 </div>
               </div>
            </div>
          ))}
          <button onClick={handleAddQuestion} className="w-full py-4 rounded-xl border-2 border-dashed border-blue-200 text-blue-500 font-bold hover:bg-blue-50 flex items-center justify-center gap-2"><Plus size={20} /> Thêm câu hỏi mới</button>
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-end">
          <button onClick={() => setIsEditing(false)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2"><Save size={18} /> Hoàn tất</button>
        </div>
      </div>
    </div>
  );

  const renderSlideContent = () => {
    // INFO SLIDES (0-3) - (Same as before)
    if (currentSlide === 0) return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-float">
          <div className="bg-blue-100 text-blue-600 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider shadow-sm">Hoạt động khởi động</div>
          <h1 className="text-5xl md:text-7xl font-bold text-blue-900 leading-tight drop-shadow-sm">{idea.title}</h1>
          <p className="text-2xl text-gray-600 max-w-3xl italic">"{idea.description}"</p>
          <div className="flex gap-4 mt-8">
            <div className="bg-white border-b-4 border-blue-400 px-8 py-4 rounded-2xl shadow-lg">
              <span className="block text-gray-500 text-sm font-bold uppercase">Thời gian</span>
              <span className="text-3xl font-bold text-blue-600">{idea.duration}</span>
            </div>
            <div className="bg-white border-b-4 border-orange-400 px-8 py-4 rounded-2xl shadow-lg">
              <span className="block text-gray-500 text-sm font-bold uppercase">Yếu tố vui</span>
              <span className="text-3xl font-bold text-orange-500">{idea.funFactor}</span>
            </div>
          </div>
        </div>
    );

    if (currentSlide === 1) return (
      <div className="h-full flex flex-col justify-center max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-purple-700 mb-12 flex items-center justify-center gap-3"><Box size={48} /> Chuẩn Bị Dụng Cụ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {idea.preparation.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl shadow-lg border-b-8 border-purple-300 flex items-center gap-4">
                 <div className="bg-purple-100 p-3 rounded-full text-purple-600"><CheckCircle2 size={32} /></div>
                 <span className="text-2xl font-bold text-gray-700">{item}</span>
              </div>
            ))}
          </div>
      </div>
    );

    if (currentSlide === 2) return (
      <div className="h-full flex flex-col justify-center max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-yellow-600 mb-12 flex items-center justify-center gap-3"><Trophy size={48} /> Phần Thưởng & Mục Tiêu</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-yellow-200 transform rotate-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Star className="text-yellow-500 fill-yellow-500" size={28} /> Cách tính điểm</h3>
                <p className="text-xl text-gray-700 leading-relaxed mb-6">{idea.rewardDetails.mechanic}</p>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200 text-center">
                  <span className="font-bold text-yellow-800 block mb-2 text-sm uppercase tracking-widest">Danh hiệu đạt được</span>
                  <span className="text-3xl font-black text-yellow-600">{idea.rewardDetails.badges}</span>
                </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-green-200 transform -rotate-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><PartyPopper className="text-green-500" size={28} /> Mục tiêu bài học</h3>
              <p className="text-xl text-gray-700 leading-relaxed">{idea.learningGoal}</p>
            </div>
          </div>
      </div>
    );

    if (currentSlide === 3) return (
      <div className="h-full flex flex-col justify-center max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-blue-800 mb-10">Cách Chơi</h2>
          <div className="space-y-4">
            {idea.steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-6 bg-white p-5 rounded-2xl shadow-md border-b-4 border-blue-200">
                <div className="bg-blue-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-lg">{idx + 1}</div>
                <p className="text-xl text-gray-800 font-medium">{step}</p>
              </div>
            ))}
          </div>
      </div>
    );

    if (currentSlide === totalSlides - 1) return (
        <div className="h-full flex flex-col items-center justify-center text-center">
           <Trophy size={150} className="text-yellow-500 mb-6 animate-bounce" />
           <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500 mb-6">HOÀN THÀNH!</h1>
           <p className="text-3xl text-gray-600 font-bold mb-12">Các bạn đã làm rất tốt!</p>
           <button onClick={onClose} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors">Kết thúc</button>
        </div>
    );

    // QUESTION SLIDES WITH PUZZLE REVEAL
    const questionIndex = currentSlide - 4;
    const question = questions[questionIndex];
    
    // Grid Calculation
    const totalTiles = quizLength;
    const gridCols = Math.ceil(Math.sqrt(totalTiles)); // e.g., 4 items -> 2 cols. 5 items -> 3 cols.

    if (question) {
      return (
        <div className="h-full flex flex-col justify-center max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 flex justify-between items-center">
             <div className="flex gap-2 items-center">
                <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full font-bold uppercase tracking-wide shadow-sm text-sm">Câu {questionIndex + 1}</span>
                <span className="text-gray-500 font-bold bg-gray-100 px-3 py-1.5 rounded-full text-sm">{question.type}</span>
             </div>
             {/* Sound Board */}
             <div className="flex bg-white rounded-full p-1 shadow-sm border border-gray-200">
                <button onClick={(e) => handleSpeak(question.question, e)} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Đọc câu hỏi">
                    <Volume2 size={20} />
                </button>
                <div className="w-px h-8 bg-gray-200 mx-1"></div>
                <button onClick={handleCorrect} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors" title="Âm thanh Đúng">
                    <ThumbsUp size={20} />
                </button>
                <button onClick={handleWrong} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Âm thanh Sai">
                    <ThumbsDown size={20} />
                </button>
             </div>
          </div>

          <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">
             {/* LEFT: FLIP CARD */}
             <div className="perspective-1000 h-full max-h-[500px] lg:max-h-none flex flex-col" onClick={() => { setIsFlipped(!isFlipped); playSound('click'); }}>
                <div className={`relative w-full h-full flex-grow transition-all duration-700 transform-style-3d cursor-pointer group ${isFlipped ? 'rotate-y-180' : 'rotate-y-0'}`}>
                   {/* FRONT */}
                   <div className="absolute inset-0 w-full h-full backface-hidden">
                      <div className="w-full h-full bg-white rounded-3xl shadow-xl border-l-8 border-blue-500 p-8 flex flex-col items-center justify-center text-center hover:bg-blue-50 transition-colors">
                         <div className="flex-grow flex items-center justify-center">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-800 leading-tight">{question.question}</h2>
                         </div>
                         <div className="mt-auto pt-8 flex items-center gap-2 text-blue-500 font-bold animate-pulse text-sm">
                            <RotateCw size={16} /> Nhấn để xem đáp án
                         </div>
                      </div>
                   </div>
                   {/* BACK */}
                   <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                      <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center text-center text-white relative">
                         <div className="mb-6 bg-white/20 p-4 rounded-full shadow-inner"><CheckCircle2 size={48} /></div>
                         <p className="text-base font-bold uppercase tracking-widest opacity-90 mb-6">Đáp án chính xác</p>
                         <div className="text-3xl md:text-5xl font-black drop-shadow-md mb-8 w-full overflow-y-auto max-h-[50%]">
                           <FormattedAnswer text={question.answer} />
                         </div>
                         <div className="mt-auto flex flex-col gap-3 w-full">
                             <button onClick={(e) => handleNext(e)} className="w-full bg-white text-green-700 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-transform active:scale-95">Câu tiếp theo <ArrowRight size={20} /></button>
                             <div className="flex items-center justify-center gap-2 text-white/70 font-bold text-xs cursor-pointer hover:text-white" onClick={(e) => { e.stopPropagation(); handleSpeak(question.answer, e); }}>
                                 <Volume2 size={14} /> Đọc đáp án
                             </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* RIGHT: PUZZLE BOARD */}
             <div className="h-full bg-white/50 backdrop-blur-sm rounded-3xl shadow-inner relative overflow-hidden hidden lg:block border-4 border-white p-4">
                 <div className="absolute inset-0 pb-20 p-6 flex items-center justify-center">
                    {/* The Background Image (The Puzzle Target) */}
                    <div className="relative w-full h-full max-w-[600px] max-h-[600px] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl bg-white">
                        {mainImageUrl ? (
                           <img src={mainImageUrl} alt="Tranh chủ đề" className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center bg-gray-100">
                             {mainImageLoading ? <Sparkles className="animate-spin text-blue-500" size={48} /> : <ImageIcon size={48} className="text-gray-300" />}
                           </div>
                        )}

                        {/* The Overlay Grid (The Tiles) */}
                        <div className="absolute inset-0 grid gap-1 p-1 bg-white/10" style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
                          {revealedTiles.map((revealed, idx) => (
                             <div 
                               key={idx}
                               className={`
                                  relative flex items-center justify-center rounded-lg border-2 border-white/50 shadow-sm transition-all duration-700
                                  ${revealed ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'}
                                  ${idx === questionIndex ? 'bg-gradient-to-br from-blue-400 to-blue-600 z-10 scale-105 shadow-xl ring-4 ring-yellow-300' : 'bg-gradient-to-br from-indigo-300 to-indigo-500'}
                               `}
                             >
                                <span className="text-4xl font-black text-white drop-shadow-md">{idx + 1}</span>
                                {idx === questionIndex && (
                                   <div className="absolute inset-0 border-4 border-yellow-300 rounded-lg animate-pulse"></div>
                                )}
                             </div>
                          ))}
                        </div>
                    </div>
                 </div>

                 {/* Controls at bottom of Puzzle Area */}
                 <div className="absolute bottom-4 left-4 right-20 flex gap-4 items-center">
                    <button 
                      onClick={handleRevealAll}
                      className="flex-grow bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye size={20} />
                      Đoán Hình
                    </button>
                 </div>

                 {/* Compact Growth Tree - Bottom Right Corner */}
                 <div className="absolute bottom-4 right-4 w-16 h-16 bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden z-20 hover:scale-110 transition-transform cursor-help" title="Tiến độ cây tri thức">
                    <GrowthTree steps={quizLength} currentStep={questionIndex} />
                 </div>
             </div>

             {/* Mobile Image View (Simplified) */}
             <div className="lg:hidden h-48 rounded-2xl relative bg-white shadow-md border-2 border-gray-100 flex items-center justify-center p-2">
                 {mainImageUrl && <img src={mainImageUrl} alt="Minh họa" className="max-h-full object-contain" />}
                 <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold text-center p-4">
                    Nhấn vào máy tính để xem Lật Mảnh Ghép
                 </div>
             </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-[#f8fafc] z-[100] flex flex-col font-sans">
      <style>{styles}</style>
      
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={activeTrack?.url} loop />

      {isEditing && renderEditor()}
      {showMusicMenu && renderMusicMenu()}
      
      {/* Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm px-6 py-3 shadow-sm flex justify-between items-center z-10 border-b border-gray-200">
        <div className="flex items-center gap-4">
           <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"><X size={28} className="text-gray-600" /></button>
           <span className="font-bold text-gray-800 text-lg hidden md:inline truncate max-w-xs">{idea.title}</span>
        </div>

        {/* Music Player Control (Center-Left) */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 pl-3 pr-1 border border-gray-200 mx-2">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-600 max-w-[120px] md:max-w-[200px] truncate cursor-pointer" onClick={() => setShowMusicMenu(true)}>
               {activeTrack ? (
                 <>
                   <Disc className={`w-4 h-4 ${isMusicPlaying ? 'animate-spin-slow text-pink-500' : 'text-gray-400'}`} />
                   <span className="truncate">{activeTrack.title}</span>
                 </>
               ) : (
                 <>
                    <Music className="w-4 h-4 text-gray-400" />
                    <span>Chọn nhạc nền</span>
                 </>
               )}
            </div>
            {activeTrack && (
              <button 
                onClick={toggleMusic}
                className={`p-1.5 rounded-full text-white transition-colors shadow-sm ${isMusicPlaying ? 'bg-pink-500 hover:bg-pink-600' : 'bg-green-500 hover:bg-green-600'}`}
              >
                {isMusicPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
              </button>
            )}
            {!activeTrack && (
               <button onClick={() => setShowMusicMenu(true)} className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600">
                 <ChevronRight size={14} />
               </button>
            )}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"><Edit size={16} /> <span className="hidden sm:inline">Sửa</span></button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex gap-2">
            <button onClick={handlePrev} disabled={currentSlide === 0} className={`p-3 rounded-xl border flex items-center justify-center transition-all ${currentSlide === 0 ? 'border-gray-100 text-gray-300' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}><ChevronLeft size={20} /></button>
            <button onClick={handleNext} disabled={currentSlide === totalSlides - 1} className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all text-sm ${currentSlide === totalSlides - 1 ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white shadow-md hover:bg-blue-700'}`}>{currentSlide === totalSlides - 2 ? 'Hoàn thành' : 'Tiếp theo'} <ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      <div className="flex-grow p-4 md:p-6 overflow-hidden relative z-0">
        {renderSlideContent()}
      </div>

      <div className="h-2 bg-gray-100 w-full">
        <div className="h-full bg-blue-500 transition-all duration-500 ease-out" style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}></div>
      </div>
    </div>
  );
};