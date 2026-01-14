import React, { useState, useEffect } from 'react';
import { GameIdea } from '../types';
import { Clock, CheckCircle2, ListOrdered, GraduationCap, Smile, Trophy, Star, HelpCircle, Medal, MonitorPlay, Save, Trash2, Check, Download, Sparkles, Image as ImageIcon } from 'lucide-react';
import { PresentationView } from './PresentationView';
import { generateGameIllustration } from '../services/gemini';

interface GameCardProps {
  idea: GameIdea;
  index: number;
  apiKey: string;
  onSave?: (idea: GameIdea) => void;
  onDelete?: () => void;
  onDownload?: () => void;
  isSaved?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ idea, index, apiKey, onSave, onDelete, onDownload, isSaved = false }) => {
  const [showPresentation, setShowPresentation] = useState(false);
  const [illustrationUrl, setIllustrationUrl] = useState<string | null>(idea.illustration || null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Enhanced Style Configuration
  const cardStyles = [
    {
      theme: 'red',
      wrapper: 'border-red-200 bg-white',
      header: 'bg-gradient-to-br from-rose-100 via-red-50 to-white border-red-100',
      title: 'text-rose-700',
      icon: 'text-rose-500',
      button: 'bg-rose-500 hover:bg-rose-600 shadow-rose-200',
      imageRing: 'ring-rose-200',
      accent: 'bg-rose-100 text-rose-600'
    },
    {
      theme: 'green',
      wrapper: 'border-emerald-200 bg-white',
      header: 'bg-gradient-to-br from-emerald-100 via-green-50 to-white border-emerald-100',
      title: 'text-emerald-700',
      icon: 'text-emerald-500',
      button: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200',
      imageRing: 'ring-emerald-200',
      accent: 'bg-emerald-100 text-emerald-600'
    },
    {
      theme: 'purple',
      wrapper: 'border-purple-200 bg-white',
      header: 'bg-gradient-to-br from-purple-100 via-fuchsia-50 to-white border-purple-100',
      title: 'text-purple-700',
      icon: 'text-purple-500',
      button: 'bg-purple-500 hover:bg-purple-600 shadow-purple-200',
      imageRing: 'ring-purple-200',
      accent: 'bg-purple-100 text-purple-600'
    },
  ];

  const style = cardStyles[index % cardStyles.length];

  useEffect(() => {
    let isMounted = true;
    if (!illustrationUrl && !isSaved && apiKey) {
      setIsGeneratingImage(true);
      generateGameIllustration(idea.title, idea.description, apiKey)
        .then(url => {
          if (isMounted && url) {
            setIllustrationUrl(url);
          }
        })
        .finally(() => {
          if (isMounted) setIsGeneratingImage(false);
        });
    }
    return () => { isMounted = false; };
  }, [idea.title, isSaved, apiKey]);

  const handleLocalSave = () => {
    if (onSave) {
      onSave({ ...idea, illustration: illustrationUrl || undefined });
    }
  };

  return (
    <>
      <div className={`rounded-[2rem] border-[3px] ${style.wrapper} p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-visible group`}>
        
        {/* Header Section: Highlighted Title & Image */}
        <div className="flex flex-col md:flex-row md:items-stretch justify-between gap-5 mb-6">
          
          {/* Left Side: Visual Identity Container */}
          <div className={`flex-grow flex gap-4 items-center p-4 rounded-2xl border-2 ${style.header} shadow-sm relative overflow-hidden group-hover:shadow-md transition-shadow`}>
             {/* Decorative Circles */}
             <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 rounded-full bg-white opacity-40 blur-xl"></div>
             <div className="absolute bottom-0 left-0 -ml-2 -mb-2 w-16 h-16 rounded-full bg-white opacity-40 blur-lg"></div>

             {/* Illustration Container */}
             <div className={`flex-shrink-0 relative w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-white shadow-lg border-4 border-white transform -rotate-2 ring-2 ${style.imageRing} z-10 transition-transform group-hover:rotate-0 group-hover:scale-105`}>
                {illustrationUrl ? (
                  <img src={illustrationUrl} alt={idea.title} className="w-full h-full object-cover animate-fade-in" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                    {isGeneratingImage ? (
                      <Sparkles size={24} className="animate-spin text-yellow-500" />
                    ) : (
                      <ImageIcon size={28} />
                    )}
                  </div>
                )}
             </div>

             <div className="z-10 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${style.accent}`}>
                    Trò chơi {index + 1}
                  </span>
                </div>
                <h3 className={`text-2xl md:text-3xl font-black ${style.title} leading-tight drop-shadow-sm`}>
                  {idea.title}
                </h3>
                <div className="flex items-center gap-3 text-gray-500 font-bold text-sm mt-2">
                  <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-lg">
                    <Clock size={14} className={style.icon} />
                    <span>{idea.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-lg">
                    <Smile size={14} className="text-orange-500" />
                    <span>{idea.funFactor}</span>
                  </div>
                </div>
             </div>
          </div>

          {/* Right Side: Actions */}
          <div className="flex flex-col gap-3 justify-start md:items-end flex-shrink-0">
            <div className="flex gap-2 flex-wrap md:justify-end">
              {onSave && (
                <button
                  onClick={handleLocalSave}
                  disabled={isSaved}
                  className={`px-3 py-2 rounded-xl font-bold shadow-sm flex items-center gap-2 text-sm transition-all ${
                    isSaved 
                      ? 'bg-gray-100 text-gray-400 cursor-default border border-gray-200' 
                      : 'bg-white border-2 border-blue-100 text-blue-600 hover:bg-blue-50'
                  }`}
                  title={isSaved ? "Đã lưu vào bộ nhớ trình duyệt" : "Lưu vào bộ nhớ trình duyệt"}
                >
                  {isSaved ? <Check size={18} /> : <Save size={18} />}
                  <span className="hidden sm:inline">{isSaved ? 'Đã lưu' : 'Lưu'}</span>
                </button>
              )}
              
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="px-3 py-2 rounded-xl font-bold shadow-sm flex items-center gap-2 text-sm transition-all bg-white border-2 border-orange-200 text-orange-600 hover:bg-orange-50"
                  title="Tải xuống máy"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">Tải về</span>
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="px-3 py-2 rounded-xl font-bold shadow-sm flex items-center gap-2 text-sm transition-all bg-white border-2 border-red-100 text-red-500 hover:bg-red-50"
                  title="Xóa khỏi kho"
                >
                  <Trash2 size={18} />
                  <span className="hidden sm:inline">Xóa</span>
                </button>
              )}
            </div>

            <button 
              onClick={() => setShowPresentation(true)}
              className={`${style.button} w-full md:w-auto text-white px-5 py-3 rounded-xl font-black shadow-lg flex items-center justify-center gap-2 text-base transition-transform hover:scale-105 active:scale-95`}
            >
              <MonitorPlay size={20} />
              Trình chiếu
            </button>
          </div>
        </div>

        {/* Description Bubble */}
        <div className="mb-8 relative">
           <div className="absolute left-6 -top-3 w-4 h-4 bg-gray-50 border-t border-l border-gray-200 transform rotate-45"></div>
           <p className="text-gray-600 font-medium italic bg-gray-50 p-4 rounded-xl border border-gray-200 text-lg leading-relaxed">
             "{idea.description}"
           </p>
        </div>

        <div className="space-y-6">
          {/* Learning Goal */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-2 uppercase text-xs tracking-widest">
              <GraduationCap className={style.icon} size={18} />
              Mục tiêu bài học
            </h4>
            <p className="text-gray-700 font-medium leading-relaxed">{idea.learningGoal}</p>
          </div>

          {/* Gamification / Rewards Section */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute -top-6 -right-6 opacity-10 rotate-12">
              <Trophy size={100} className="text-yellow-600" />
            </div>
            <h4 className="flex items-center gap-2 font-bold text-yellow-800 mb-4 relative z-10 uppercase text-xs tracking-widest">
              <Trophy size={18} className="text-yellow-600" />
              Hệ thống Điểm thưởng & Huy hiệu
            </h4>
            <div className="space-y-4 relative z-10">
                <div className="flex gap-4 items-start bg-white/60 p-3 rounded-xl">
                  <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                    <Star size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 text-sm block">Cơ chế điểm</span>
                    <p className="text-gray-700 text-sm mt-0.5">{idea.rewardDetails.mechanic}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start bg-white/60 p-3 rounded-xl">
                  <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                    <Medal size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 text-sm block">Danh hiệu</span>
                    <p className="text-gray-700 text-sm mt-0.5">{idea.rewardDetails.badges}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start bg-white/60 p-3 rounded-xl">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <Smile size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 text-sm block">Khi trả lời sai</span>
                    <p className="text-gray-700 text-sm mt-0.5">{idea.rewardDetails.feedback}</p>
                  </div>
                </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Preparation */}
            <div>
              <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-3 uppercase text-xs tracking-widest">
                <CheckCircle2 className={style.icon} size={18} />
                Chuẩn bị
              </h4>
              <ul className="space-y-2">
                {idea.preparation.map((prep, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                    <span className={`w-5 h-5 rounded-full ${style.accent} flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5`}>
                      {idx + 1}
                    </span>
                    {prep}
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div>
              <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-3 uppercase text-xs tracking-widest">
                <ListOrdered className={style.icon} size={18} />
                Cách tổ chức
              </h4>
              <div className="space-y-2">
                {idea.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 text-gray-700 text-sm bg-gray-50 p-2 rounded-lg group/step hover:bg-gray-100 transition-colors">
                    <span className={`flex-shrink-0 font-bold ${style.icon} mt-0.5`}>{idx + 1}.</span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
           {/* Example Questions Section */}
          {idea.quizExamples && idea.quizExamples.length > 0 && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mt-2">
              <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-4 uppercase text-xs tracking-widest">
                <HelpCircle className={style.icon} size={18} />
                Ví dụ câu hỏi
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {idea.quizExamples.map((quiz, qIdx) => (
                  <div key={qIdx} className="bg-gray-50 p-3 rounded-xl border border-gray-200 hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider text-white ${
                        quiz.type.includes('Trắc nghiệm') ? 'bg-blue-400' :
                        quiz.type.includes('Điền') ? 'bg-green-400' : 'bg-orange-400'
                      }`}>
                        {quiz.type}
                      </span>
                    </div>
                    <p className="font-bold text-gray-800 text-sm mb-2">{quiz.question}</p>
                    <div className="bg-white p-2 rounded-lg border border-gray-100 text-xs text-gray-600 flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-green-500 mt-0.5" />
                      <span className="font-semibold text-green-700">{quiz.answer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showPresentation && (
        <PresentationView idea={{...idea, illustration: illustrationUrl || undefined}} apiKey={apiKey} onClose={() => setShowPresentation(false)} />
      )}
    </>
  );
};