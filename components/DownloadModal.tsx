import React from 'react';
import { Download, FileText, Monitor, X } from 'lucide-react';
import { GameIdea } from '../types';

interface DownloadModalProps {
  idea: GameIdea | null;
  onClose: () => void;
  onDownloadHTML: (idea: GameIdea) => void;
  onDownloadPPTX: (idea: GameIdea) => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ idea, onClose, onDownloadHTML, onDownloadPPTX }) => {
  if (!idea) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden animate-fade-in-up">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 flex justify-between items-start">
          <div className="text-white">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Download size={24} /> Tải xuống
            </h3>
            <p className="text-blue-100 text-sm mt-1 line-clamp-1 opacity-90">{idea.title}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <p className="text-center text-gray-600 mb-6 font-medium">Bạn muốn tải trò chơi về máy định dạng nào?</p>
          
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => onDownloadPPTX(idea)}
              className="flex items-center gap-4 p-4 border-2 border-orange-100 bg-orange-50 rounded-2xl hover:bg-orange-100 hover:border-orange-300 transition-all group"
            >
              <div className="bg-orange-500 text-white p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                <Monitor size={24} />
              </div>
              <div className="text-left">
                <span className="block font-bold text-gray-800 text-lg">PowerPoint (.pptx)</span>
                <span className="text-sm text-gray-500">Trình chiếu offline, có thể chỉnh sửa</span>
              </div>
            </button>

            <button
              onClick={() => onDownloadHTML(idea)}
              className="flex items-center gap-4 p-4 border-2 border-blue-100 bg-blue-50 rounded-2xl hover:bg-blue-100 hover:border-blue-300 transition-all group"
            >
              <div className="bg-blue-500 text-white p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <div className="text-left">
                <span className="block font-bold text-gray-800 text-lg">Văn bản Web (.html)</span>
                <span className="text-sm text-gray-500">Xem nhanh trên mọi trình duyệt</span>
              </div>
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100">
           Bấm tải xuống đồng nghĩa bạn đồng ý sử dụng cho mục đích giáo dục.
        </div>
      </div>
    </div>
  );
};