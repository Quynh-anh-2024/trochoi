import React from 'react';
import { BookOpen, Sparkles, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onOpenSettings?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onOpenSettings }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b-4 border-yellow-400 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-2 rounded-full text-white">
              <BookOpen size={24} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-blue-900">
              Lớp Học <span className="text-yellow-500">Vui Nhộn</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              <Sparkles size={16} className="text-yellow-500" />
              <span>AI Powered</span>
            </div>
            {onOpenSettings && (
              <button 
                onClick={onOpenSettings}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Cấu hình API Key"
              >
                <Settings size={24} />
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 py-6 mt-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2026 Thầy Hải Trường PTDTBT TH Giàng Chu Phìn.</p>
        </div>
      </footer>
    </div>
  );
};