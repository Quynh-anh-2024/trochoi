import React, { useState } from 'react';
import { Save, X, ExternalLink, HardDrive } from 'lucide-react';

interface DriveConfigModalProps {
  onSave: (clientId: string) => void;
  onClose: () => void;
}

export const DriveConfigModal: React.FC<DriveConfigModalProps> = ({ onSave, onClose }) => {
  const [clientId, setClientId] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <HardDrive className="text-blue-600" /> Kết nối Google Drive
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Để lưu file vào thư mục của bạn, ứng dụng cần <strong>Google Client ID</strong>.
        </p>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-4 text-xs text-blue-800">
          <strong>Lưu ý:</strong> Ứng dụng này chạy trực tiếp trên trình duyệt. Chúng tôi không lưu trữ thông tin đăng nhập của bạn.
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Google Client ID</label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="VD: 123456...apps.googleusercontent.com"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
            />
          </div>

          <div className="text-xs text-gray-500">
             Bạn chưa có Client ID? <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-blue-600 underline flex items-center gap-1 inline-flex">Tạo tại Google Cloud Console <ExternalLink size={10} /></a> (Chọn loại 'Web application').
          </div>

          <button
            onClick={() => {
              if (clientId.trim()) onSave(clientId.trim());
            }}
            disabled={!clientId.trim()}
            className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 ${
              clientId.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <Save size={18} /> Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
};