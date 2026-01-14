import React, { useState, useEffect } from 'react';
import { GameIdea, QuestionExample } from '../types';
import { X, ChevronRight, ChevronLeft, Trophy, Star, HelpCircle, PartyPopper, Box, CheckCircle2, RotateCw, Flower, Apple, Edit, Plus, Trash2, Save, Sparkles, Image as ImageIcon } from 'lucide-react';
import { generateGameIllustration } from '../services/gemini';

interface PresentationViewProps {
  idea: GameIdea;
  onClose: () => void;
  apiKey: string;
}

// Helper to format answers with new lines
const FormattedAnswer: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/;|\n/).filter(p => p.trim() !== '');
  
  if (parts.length > 1) {
    return (
      <div className="text-left inline-block w-full max-w-lg">
        <ul className="space-y-2 text-sm md:text-base">
          {parts.map((p, i) => (
            <li key={i} className="bg-white/10 rounded-lg px-3 py-1.5 border border-white/20 backdrop-blur-sm">
              {p.trim()}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  
  return <span className="block leading-snug">{text}</span>;
};

// Realistic SVG Growth Tree Visualizer
const GrowthTree: React.FC<{ steps: number; currentStep: number }> = ({ steps, currentStep }) => {
  const totalSteps = Math.max(steps, 1);
  const safeCurrentStep = Math.min(Math.max(0, currentStep), totalSteps - 1);
  
  // Progress Logic (0 to 1)
  const progress = (safeCurrentStep + 1) / totalSteps;
  // Scale Logic: Tree grows from 60% size to 100% size
  const scale = 0.6 + (progress * 0.4);

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-end bg-gradient-to-b from-sky-200 via-blue-50 to-green-50 rounded-3xl border-4 border-white shadow-inner">
       {/* Ambient Background Elements */}
       <div className="absolute top-8 right-8 animate-pulse z-0">
          <div className="w-20 h-20 bg-yellow-300 rounded-full blur-xl opacity-60"></div>
          <div className="absolute inset-0 bg-yellow-400 rounded-full shadow-lg shadow-yellow-200 opacity-90"></div>
       </div>
       
       {/* Floating Clouds */}
       <div className="absolute top-12 left-10 text-white opacity-80 animate-float" style={{animationDuration: '10s'}}>
         <svg width="100" height="60" viewBox="0 0 100 60" fill="currentColor">
            <path d="M10,40 Q20,20 40,40 T80,40 T100,60 H0 Z" />
            <circle cx="30" cy="35" r="20" />
            <circle cx="60" cy="25" r="25" />
         </svg>
       </div>
       <div className="absolute top-24 right-20 text-white opacity-60 animate-float" style={{animationDuration: '14s', animationDelay: '2s'}}>
         <svg width="80" height="50" viewBox="0 0 100 60" fill="currentColor">
            <path d="M10,40 Q20,20 40,40 T80,40 T100,60 H0 Z" />
            <circle cx="30" cy="35" r="20" />
         </svg>
       </div>

       {/* Main Tree SVG Scene */}
       <svg viewBox="0 0 400 400" className="w-full h-full max-h-[600px] z-10" style={{ overflow: 'visible' }}>
          <defs>
            {/* Gradients for realistic look */}
            <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5D4037" />
              <stop offset="40%" stopColor="#8D6E63" />
              <stop offset="100%" stopColor="#4E342E" />
            </linearGradient>
            <radialGradient id="leafGradient" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#86EFAC" />
              <stop offset="100%" stopColor="#15803D" />
            </radialGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="2" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.2"/>
              </feComponentTransfer>
              <feMerge> 
                <feMergeNode in="offsetblur"/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          </defs>

          {/* Grassy Hill */}
          <path d="M-100,400 Q200,360 500,400 L500,450 L-100,450 Z" fill="#65A30D" />
          <path d="M-50,400 Q200,380 450,400 Z" fill="#84CC16" opacity="0.8" />

          {/* THE TREE GROUP - Scales with progress */}
          <g transform={`translate(200, 400) scale(${scale})`}>
             {/* Trunk: Tapered organic shape */}
             <path 
               d="M-20,0 Q-15,-100 -5,-200 Q0,-220 5,-200 Q15,-100 20,0 Q0,10 -20,0 Z" 
               fill="url(#trunkGradient)" 
               className="transition-all duration-1000 ease-out origin-bottom"
             />
             
             {/* Branches & Leaves Generator */}
             {Array.from({ length: totalSteps }).map((_, idx) => {
               const isVisible = idx <= safeCurrentStep;
               // Calculate position: Distribute branches from bottom-up or random
               // Logic: Higher index = Higher on tree
               const heightPercent = 0.3 + (idx / totalSteps) * 0.7; // Start at 30% height
               const yPos = -200 * heightPercent; 
               const side = idx % 2 === 0 ? -1 : 1; // Alternate left/right
               const angle = side * (25 + (idx * 15) % 30); // Randomize angle slightly
               const branchLen = 40 + (idx % 3) * 10;
               const leafSize = 25 + (idx % 2) * 5;

               return (
                 <g 
                   key={idx} 
                   transform={`translate(0, ${yPos})`} // Move up trunk
                   className={`transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)`}
                   style={{ 
                     opacity: isVisible ? 1 : 0, 
                     transform: `translate(0px, ${yPos}px) scale(${isVisible ? 1 : 0})` // Pop-in effect
                   }}
                 >
                    {/* Branch Stem */}
                    <path 
                      d={`M0,0 Q${side * 10},-10 ${side * branchLen},-${15 + (idx%2)*5}`} 
                      stroke="#5D4037" 
                      strokeWidth="5" 
                      strokeLinecap="round"
                      fill="none"
                    />
                    
                    {/* Leaf Cluster Group attached to branch end */}
                    <g transform={`translate(${side * branchLen}, -${15 + (idx%2)*5})`}>
                       {/* Main Leaf Cloud */}
                       <circle r={leafSize} fill="url(#leafGradient)" filter="url(#softShadow)" />
                       <circle cx={-leafSize*0.6} cy={-leafSize*0.4} r={leafSize*0.7} fill="url(#leafGradient)" opacity="0.9" />
                       <circle cx={leafSize*0.6} cy={-leafSize*0.4} r={leafSize*0.7} fill="url(#leafGradient)" opacity="0.9" />

                       {/* Fruit - Appears if step completed */}
                       <g className="animate-bounce" style={{ animationDuration: '3s', animationDelay: `${idx * 0.3}s` }}>
                          <circle cx="0" cy={leafSize*0.2} r="7" fill="#EF4444" stroke="#991B1B" strokeWidth="1"/>
                          <path d="M0, -5 Q3,-10 6,-5" stroke="#4ADE80" strokeWidth="2" fill="none" />
                       </g>
                    </g>
                 </g>
               );
             })}
          </g>
       </svg>

       {/* Progress HUD */}
       <div className="absolute bottom-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-green-200 z-20 flex items-center gap-2">
         <Flower size={18} className="text-pink-500 animate-spin-slow" />
         <span className="font-bold text-green-800 text-sm">
           Giai đoạn: {safeCurrentStep + 1} / {totalSteps}
         </span>
       </div>
    </div>
  );
};

export const PresentationView: React.FC<PresentationViewProps> = ({ idea, onClose, apiKey }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // State for dynamic questions management
  const [questions, setQuestions] = useState<QuestionExample[]>(idea.quizExamples || []);
  const [isEditing, setIsEditing] = useState(false);

  const quizLength = questions.length;
  const totalSlides = 4 + quizLength + 1; // +1 for Victory slide

  // Lazy loading images state
  const [generatingImages, setGeneratingImages] = useState<Record<number, boolean>>({});

  // Reset states when changing slides
  useEffect(() => {
    setIsFlipped(false);
  }, [currentSlide]);

  // Effect to generate image for current question if missing
  useEffect(() => {
    const questionIndex = currentSlide - 4;
    // Check if we are on a question slide
    if (questionIndex >= 0 && questionIndex < quizLength) {
      const currentQuestion = questions[questionIndex];
      
      // If there is an image description but no URL, and we aren't already generating
      if (currentQuestion.imageDescription && !currentQuestion.imageUrl && !generatingImages[questionIndex] && apiKey) {
        
        setGeneratingImages(prev => ({ ...prev, [questionIndex]: true }));
        
        generateGameIllustration("Minh họa câu hỏi", currentQuestion.imageDescription, apiKey)
          .then(url => {
            if (url) {
              const newQuestions = [...questions];
              newQuestions[questionIndex] = { ...newQuestions[questionIndex], imageUrl: url };
              setQuestions(newQuestions);
            }
          })
          .finally(() => {
            setGeneratingImages(prev => ({ ...prev, [questionIndex]: false }));
          });
      }
    }
  }, [currentSlide, questions, quizLength, apiKey]);

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) setCurrentSlide(c => c + 1);
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(c => c - 1);
  };

  // Question Editing Handlers
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { type: 'Câu hỏi mới', question: 'Nhập nội dung câu hỏi...', answer: 'Nhập đáp án...', imageDescription: 'Hình ảnh minh họa' }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    // Adjust slide if we were on the deleted slide
    if (currentSlide >= 4 + newQuestions.length) {
      setCurrentSlide(4 + newQuestions.length); // Move to victory or last question
    }
  };

  const handleUpdateQuestion = (index: number, field: keyof QuestionExample, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  // CSS for 3D effects injected directly
  const styles = `
    .perspective-1000 { perspective: 1000px; }
    .transform-style-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; }
    .rotate-y-180 { transform: rotateY(180deg); }
    .rotate-y-0 { transform: rotateY(0deg); }
    
    @keyframes float {
      0% { transform: translateY(0px) rotate3d(1, 1, 1, 2deg); }
      50% { transform: translateY(-15px) rotate3d(1, 1, 1, -2deg); }
      100% { transform: translateY(0px) rotate3d(1, 1, 1, 2deg); }
    }
    .animate-float { animation: float 4s ease-in-out infinite; }
    
    @keyframes popIn {
      0% { opacity: 0; transform: scale(0.5) translateY(50px); }
      70% { transform: scale(1.1); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-pop-in { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  `;

  // Render Editor Modal
  const renderEditor = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-pop-in">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Edit className="text-blue-500" size={20} /> Chỉnh sửa bộ câu hỏi
          </h3>
          <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-200 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {questions.map((q, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
               <div className="absolute top-2 right-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                   onClick={() => handleRemoveQuestion(idx)}
                   className="p-2 bg-white text-red-500 border border-red-100 rounded-lg hover:bg-red-50 shadow-sm"
                   title="Xóa câu hỏi này"
                 >
                   <Trash2 size={16} />
                 </button>
               </div>
               
               <div className="grid gap-3">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Loại câu</label>
                      <input 
                        value={q.type}
                        onChange={(e) => handleUpdateQuestion(idx, 'type', e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-200 text-sm font-medium focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-xs font-bold text-gray-400 uppercase">Câu hỏi</label>
                      <input 
                        value={q.question}
                        onChange={(e) => handleUpdateQuestion(idx, 'question', e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-800 focus:border-blue-500 outline-none"
                      />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Mô tả hình ảnh (AI tạo)</label>
                    <input 
                      value={q.imageDescription || ''}
                      onChange={(e) => handleUpdateQuestion(idx, 'imageDescription', e.target.value)}
                      placeholder="VD: 3 quả táo đỏ"
                      className="w-full p-2 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-blue-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Đáp án</label>
                    <textarea 
                      value={q.answer}
                      onChange={(e) => handleUpdateQuestion(idx, 'answer', e.target.value)}
                      rows={2}
                      className="w-full p-2 rounded-lg border border-gray-200 text-sm text-green-700 bg-green-50 focus:border-green-500 outline-none resize-none"
                    />
                 </div>
               </div>
            </div>
          ))}

          <button 
            onClick={handleAddQuestion}
            className="w-full py-4 rounded-xl border-2 border-dashed border-blue-200 text-blue-500 font-bold hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Thêm câu hỏi mới
          </button>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end">
          <button 
            onClick={() => setIsEditing(false)}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2"
          >
            <Save size={18} /> Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );

  // Render specific slide content
  const renderSlideContent = () => {
    // SLIDE 0: TITLE & INTRO
    if (currentSlide === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
          <div className="bg-blue-100 text-blue-600 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider shadow-sm animate-pop-in">
            Hoạt động khởi động
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-blue-900 leading-tight drop-shadow-sm animate-float">
            {idea.title}
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl italic animate-pop-in" style={{animationDelay: '0.2s'}}>
            "{idea.description}"
          </p>
          <div className="flex gap-4 mt-8 animate-pop-in" style={{animationDelay: '0.4s'}}>
            <div className="bg-white border-b-4 border-blue-400 px-8 py-4 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-transform">
              <span className="block text-gray-500 text-sm font-bold uppercase">Thời gian</span>
              <span className="text-3xl font-bold text-blue-600">{idea.duration}</span>
            </div>
            <div className="bg-white border-b-4 border-orange-400 px-8 py-4 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-transform">
              <span className="block text-gray-500 text-sm font-bold uppercase">Yếu tố vui</span>
              <span className="text-3xl font-bold text-orange-500">{idea.funFactor}</span>
            </div>
          </div>
        </div>
      );
    }

    // SLIDE 1: PREPARATION
    if (currentSlide === 1) {
      return (
        <div className="h-full flex flex-col justify-center max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-purple-700 mb-12 flex items-center justify-center gap-3 animate-float">
            <Box size={48} /> Chuẩn Bị Dụng Cụ
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {idea.preparation.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white p-6 rounded-3xl shadow-lg border-b-8 border-purple-300 flex items-center gap-4 animate-pop-in transform transition-transform hover:scale-105"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                 <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                    <CheckCircle2 size={32} />
                 </div>
                 <span className="text-2xl font-bold text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // SLIDE 2: REWARDS & GOALS
    if (currentSlide === 2) {
      return (
        <div className="h-full flex flex-col justify-center max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-yellow-600 mb-12 flex items-center justify-center gap-3 animate-float">
            <Trophy size={48} /> Phần Thưởng & Mục Tiêu
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-yellow-200 perspective-1000 animate-pop-in">
              <div className="transform transition-transform hover:rotate-2">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Star className="text-yellow-500 fill-yellow-500" size={28} /> Cách tính điểm
                </h3>
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  {idea.rewardDetails.mechanic}
                </p>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200 text-center">
                  <span className="font-bold text-yellow-800 block mb-2 text-sm uppercase tracking-widest">Danh hiệu đạt được</span>
                  <span className="text-3xl font-black text-yellow-600 drop-shadow-sm">{idea.rewardDetails.badges}</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-green-200 animate-pop-in" style={{animationDelay: '0.2s'}}>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <PartyPopper className="text-green-500" size={28} /> Mục tiêu bài học
              </h3>
              <p className="text-xl text-gray-700 leading-relaxed">
                {idea.learningGoal}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // SLIDE 3: RULES / STEPS
    if (currentSlide === 3) {
      return (
        <div className="h-full flex flex-col justify-center max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-blue-800 mb-10 animate-float">
            Cách Chơi
          </h2>
          <div className="space-y-4">
            {idea.steps.map((step, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-6 bg-white p-5 rounded-2xl shadow-md border-b-4 border-blue-200 transition-all hover:scale-[1.02] hover:bg-blue-50 animate-pop-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-lg transform rotate-3">
                  {idx + 1}
                </div>
                <p className="text-xl text-gray-800 font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // LAST SLIDE: VICTORY
    if (currentSlide === totalSlides - 1) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center animate-pop-in">
           <div className="mb-8 relative">
              <div className="absolute inset-0 bg-yellow-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <Trophy size={150} className="text-yellow-500 relative z-10 animate-float drop-shadow-xl" />
           </div>
           <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 mb-6 drop-shadow-sm">
             HOÀN THÀNH!
           </h1>
           <p className="text-3xl text-gray-600 font-bold mb-12">
             Các bạn đã làm rất tốt!
           </p>
           <button 
             onClick={onClose}
             className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors hover:scale-105"
           >
             Kết thúc
           </button>
        </div>
      );
    }

    // QUESTION SLIDES - SPLIT SCREEN MODE
    const questionIndex = currentSlide - 4;
    const question = questions[questionIndex];
    const isGenerating = generatingImages[questionIndex];

    if (question) {
      return (
        <div className="h-full flex flex-col justify-center max-w-7xl mx-auto">
          {/* Header for Question Slide */}
          <div className="mb-4 flex justify-between items-center animate-pop-in">
             <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full font-bold uppercase tracking-wide shadow-sm text-sm">
                Câu hỏi {questionIndex + 1}
             </span>
             <div className="text-gray-500 text-sm italic font-medium">
                {question.type}
             </div>
          </div>

          <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">
             
             {/* LEFT SIDE: QUESTION CARD (INTERACTIVE) */}
             <div className="perspective-1000 h-full max-h-[500px] lg:max-h-none flex flex-col" onClick={() => setIsFlipped(!isFlipped)}>
                <div className={`relative w-full h-full flex-grow transition-all duration-700 transform-style-3d cursor-pointer group ${isFlipped ? 'rotate-y-180' : 'rotate-y-0'}`}>
                   
                   {/* FRONT */}
                   <div className="absolute inset-0 w-full h-full backface-hidden">
                      <div className="w-full h-full bg-white rounded-3xl shadow-xl border-l-8 border-blue-500 p-8 flex flex-col items-center justify-center text-center hover:bg-blue-50 transition-colors">
                         
                         {/* Dynamic Image Container */}
                         <div className="mb-6 relative w-48 h-48 flex-shrink-0">
                            {question.imageUrl ? (
                              <img 
                                src={question.imageUrl} 
                                alt="Minh họa" 
                                className="w-full h-full object-contain rounded-xl animate-pop-in drop-shadow-md"
                              />
                            ) : (
                              <div className="w-full h-full bg-blue-100 rounded-2xl flex items-center justify-center border-4 border-blue-200 border-dashed">
                                {isGenerating ? (
                                  <div className="flex flex-col items-center gap-2 text-blue-400">
                                    <Sparkles className="animate-spin" size={32} />
                                    <span className="text-xs font-bold">Đang vẽ...</span>
                                  </div>
                                ) : (
                                  <HelpCircle size={64} className="text-blue-300" />
                                )}
                              </div>
                            )}
                         </div>

                         <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
                           {question.question}
                         </h2>
                         <div className="mt-auto pt-4 flex items-center gap-2 text-blue-500 font-bold animate-pulse text-sm">
                            <RotateCw size={16} />
                            Nhấn để xem đáp án
                         </div>
                      </div>
                   </div>

                   {/* BACK */}
                   <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                      <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center text-center text-white">
                         <div className="mb-4 bg-white/20 p-3 rounded-full">
                           <CheckCircle2 size={40} />
                         </div>
                         <p className="text-sm font-bold uppercase tracking-widest opacity-90 mb-4">Đáp án chính xác</p>
                         
                         <div className="text-2xl md:text-4xl font-black drop-shadow-md mb-8 w-full overflow-y-auto max-h-[60%]">
                           <FormattedAnswer text={question.answer} />
                         </div>
                         
                         <div className="mt-auto flex items-center gap-2 text-white/80 font-bold text-sm">
                             <RotateCw size={16} />
                             Xem lại câu hỏi
                         </div>
                      </div>
                   </div>

                </div>
             </div>

             {/* RIGHT SIDE: GAME WORLD (VISUALIZER) */}
             <div className="h-full bg-white/50 backdrop-blur-sm rounded-3xl shadow-inner relative overflow-hidden hidden lg:block p-2">
                 <GrowthTree steps={quizLength} currentStep={questionIndex} />
             </div>

             {/* Mobile View for Tree */}
             <div className="lg:hidden h-32 rounded-2xl relative overflow-hidden bg-white/50 backdrop-blur-sm p-1">
                 <GrowthTree steps={quizLength} currentStep={questionIndex} />
             </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-[#f8fafc] z-[100] flex flex-col font-sans">
      <style>{styles}</style>
      
      {/* Editor Modal */}
      {isEditing && renderEditor()}
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
      </div>

      {/* Header Controls */}
      <div className="bg-white/90 backdrop-blur-sm px-6 py-3 shadow-sm flex justify-between items-center z-10 border-b border-gray-200">
        <div className="flex items-center gap-4">
           <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
             <X size={28} className="text-gray-600" />
           </button>
           <span className="font-bold text-gray-800 text-lg hidden md:inline truncate max-w-xs">{idea.title}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
          >
            <Edit size={16} /> <span className="hidden sm:inline">Sửa câu hỏi</span> ({quizLength})
          </button>
          
          <div className="h-6 w-px bg-gray-300"></div>

          <div className="flex gap-2">
            <button 
              onClick={handlePrev} 
              disabled={currentSlide === 0}
              className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
                currentSlide === 0 
                ? 'border-gray-100 text-gray-300 cursor-not-allowed' 
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={handleNext} 
              disabled={currentSlide === totalSlides - 1}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all text-sm ${
                currentSlide === totalSlides - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
              }`}
            >
              {currentSlide === totalSlides - 2 ? 'Hoàn thành' : 'Tiếp theo'} <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Content */}
      <div className="flex-grow p-4 md:p-6 overflow-hidden relative z-0">
        {renderSlideContent()}
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-100 w-full">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};