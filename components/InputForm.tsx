import React, { useState } from 'react';
import { GradeLevel, Subject, FormData } from '../types';
import { Lightbulb, Loader2, Calculator, BookOpen, Leaf, Languages, Globe2, Music, Heart, Sparkles, Users, BookType, Monitor, Wrench } from 'lucide-react';

interface InputFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

// Configuration for Grade Colors
const gradeConfig: Record<GradeLevel, { color: string; border: string; bg: string; activeBg: string }> = {
  [GradeLevel.Grade1]: { color: 'text-pink-600', border: 'border-pink-200', bg: 'bg-pink-50', activeBg: 'bg-pink-100' },
  [GradeLevel.Grade2]: { color: 'text-orange-600', border: 'border-orange-200', bg: 'bg-orange-50', activeBg: 'bg-orange-100' },
  [GradeLevel.Grade3]: { color: 'text-yellow-600', border: 'border-yellow-200', bg: 'bg-yellow-50', activeBg: 'bg-yellow-100' },
  [GradeLevel.Grade4]: { color: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50', activeBg: 'bg-emerald-100' },
  [GradeLevel.Grade5]: { color: 'text-blue-600', border: 'border-blue-200', bg: 'bg-blue-50', activeBg: 'bg-blue-100' },
};

// Configuration for Subject Icons and Colors
const subjectConfig: Record<Subject, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  [Subject.Math]: { icon: <Calculator size={24} />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  [Subject.Vietnamese]: { icon: <BookType size={24} />, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  [Subject.Science]: { icon: <Leaf size={24} />, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  [Subject.English]: { icon: <Languages size={24} />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  [Subject.HistoryGeo]: { icon: <Globe2 size={24} />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  [Subject.MusicArt]: { icon: <Music size={24} />, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', border: 'border-fuchsia-200' },
  [Subject.Moral]: { icon: <Heart size={24} />, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  [Subject.Informatics]: { icon: <Monitor size={24} />, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  [Subject.Technology]: { icon: <Wrench size={24} />, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  [Subject.Other]: { icon: <Sparkles size={24} />, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
};

// Define allowed subjects per grade
const allowedSubjects: Record<GradeLevel, Subject[]> = {
  [GradeLevel.Grade1]: [Subject.Math, Subject.Vietnamese, Subject.Science, Subject.English, Subject.MusicArt, Subject.Moral, Subject.Other],
  [GradeLevel.Grade2]: [Subject.Math, Subject.Vietnamese, Subject.Science, Subject.English, Subject.MusicArt, Subject.Moral, Subject.Other],
  [GradeLevel.Grade3]: [Subject.Math, Subject.Vietnamese, Subject.Science, Subject.English, Subject.MusicArt, Subject.Moral, Subject.Informatics, Subject.Technology, Subject.Other],
  // Grade 4 and 5 include everything
  [GradeLevel.Grade4]: Object.values(Subject),
  [GradeLevel.Grade5]: Object.values(Subject),
};

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [grade, setGrade] = useState<GradeLevel>(GradeLevel.Grade1);
  const [subject, setSubject] = useState<Subject>(Subject.Math);
  const [topic, setTopic] = useState<string>('');
  const [classSize, setClassSize] = useState<number>(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ grade, subject, topic, classSize });
  };

  const handleGradeChange = (newGrade: GradeLevel) => {
    setGrade(newGrade);
    
    // Check if current subject is allowed in new grade
    const validSubjects = allowedSubjects[newGrade];
    if (!validSubjects.includes(subject)) {
      // Default to Math if the selected subject (e.g., HistoryGeo) is not available in the new grade
      setSubject(Subject.Math);
    }
  };

  // Helper to get display name based on Grade
  const getSubjectDisplayName = (s: Subject, g: GradeLevel) => {
    if (s === Subject.Science) {
      // Grade 1-3: Tự nhiên xã hội, Grade 4-5: Khoa học
      if ([GradeLevel.Grade1, GradeLevel.Grade2, GradeLevel.Grade3].includes(g)) {
        return "Tự nhiên & Xã hội";
      }
      return "Khoa học";
    }
    return s;
  };

  const currentGradeStyle = gradeConfig[grade];
  const currentAllowedSubjects = allowedSubjects[grade];

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden relative">
      {/* Decoration Header */}
      <div className={`h-3 w-full ${currentGradeStyle.bg.replace('50', '400')}`}></div>
      
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
        
        {/* Header Title */}
        <div className="text-center mb-4">
          <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-1">Thiết Kế Trò Chơi</h2>
          <p className="text-gray-500 font-medium">Chọn thông tin để AI gợi ý ý tưởng</p>
        </div>

        {/* 1. Grade Selection */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Chọn Khối Lớp</label>
          <div className="grid grid-cols-5 gap-3">
            {Object.values(GradeLevel).map((g) => {
              const config = gradeConfig[g];
              const isSelected = grade === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGradeChange(g)}
                  className={`
                    py-3 px-1 rounded-2xl text-sm font-bold transition-all duration-200
                    flex flex-col items-center justify-center gap-1
                    ${isSelected 
                      ? `${config.bg} ${config.color} border-2 ${config.border.replace('200', '400')} shadow-md transform scale-105` 
                      : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100'}
                  `}
                >
                  <span className="text-xl leading-none font-black">{g.replace('Lớp ', '')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Subject Selection */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Chọn Môn Học</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-3">
            {currentAllowedSubjects.map((s) => {
              const config = subjectConfig[s];
              const isSelected = subject === s;
              const displayName = getSubjectDisplayName(s, grade);

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={`
                    p-4 rounded-2xl text-base font-bold transition-all duration-200 text-left relative overflow-hidden flex flex-col justify-start min-h-[5.5rem]
                    ${isSelected 
                      ? `${config.bg} ${config.color} border-2 ${config.border.replace('200', '400')} shadow-md` 
                      : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}
                  `}
                >
                  <div className="mb-2">
                    {config.icon}
                  </div>
                  <span className="block leading-tight break-words">{displayName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Topic Input */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Chủ đề bài học</label>
          <div className={`relative group transition-all duration-300`}>
            <div className={`absolute -inset-0.5 rounded-2xl opacity-30 blur group-hover:opacity-60 transition duration-1000 group-hover:duration-200 ${currentGradeStyle.bg.replace('50', '400')}`}></div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="VD: Phép cộng, Từ chỉ sự vật..."
              required
              className="relative w-full p-5 text-lg bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-400 focus:ring-0 outline-none transition-all text-gray-700 font-bold placeholder-gray-300 shadow-sm"
            />
          </div>
        </div>

        {/* 4. Class Size Slider */}
        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase">
              <Users size={16} /> Sĩ số lớp
            </label>
            <span className={`text-base font-black px-3 py-1 rounded-lg ${currentGradeStyle.bg} ${currentGradeStyle.color}`}>
              {classSize} hs
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="60"
            value={classSize}
            onChange={(e) => setClassSize(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
            <span>10</span>
            <span>30</span>
            <span>60</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-xl font-black text-white shadow-xl transition-all transform hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 active:scale-[0.98] ${
            isLoading || !topic.trim()
              ? 'bg-gray-300 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-200'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin w-7 h-7" /> Đang suy nghĩ...
            </>
          ) : (
            <>
              <Lightbulb className="w-7 h-7 fill-white/20" /> TẠO TRÒ CHƠI
            </>
          )}
        </button>
      </form>
    </div>
  );
};