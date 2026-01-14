import React, { useState } from 'react';
import { Key, ExternalLink, CheckCircle2, AlertCircle, Loader2, Save, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { validateApiKey } from '../services/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
  onClose: () => void;
  isMandatory?: boolean; // If true, cannot close without saving (for first time load)
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, onClose, isMandatory = false }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleVerifyAndSave = async () => {
    if (!apiKey.trim()) {
      setError("Vui lòng nhập API Key.");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const isValid = await validateApiKey(apiKey.trim());
      if (isValid) {
        onSave(apiKey.trim());
        if (!isMandatory) onClose();
      } else {
        setError("API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại.");
      }
    } catch (err) {
      setError("Không thể kết nối để kiểm tra API Key.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center flex-shrink-0">
          <div className="text-white">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Key className="w-6 h-6" /> Cấu hình API Key
            </h3>
            <p className="text-blue-100 text-sm mt-1">Kết nối với Google Gemini để bắt đầu</p>
          </div>
          {!isMandatory && (
            <button onClick={onClose} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
            <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-2">
              <ShieldCheck size={18} /> Hướng dẫn lấy Key miễn phí:
            </h4>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-blue-900">
              <li>
                Truy cập <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline inline-flex items-center gap-1 hover:text-blue-800">
                  Google AI Studio <ExternalLink size={12} />
                </a>.
              </li>
              <li>Đăng nhập bằng tài khoản Google của bạn.</li>
              <li>Nhấn nút <strong>"Create API key"</strong>.</li>
              <li>Copy đoạn mã bắt đầu bằng <code>AIza...</code> và dán vào ô bên dưới.</li>
            </ol>
            <p className="text-xs text-blue-600/80 mt-3 italic">
              * Key của bạn được lưu trực tiếp trên trình duyệt này, chúng tôi không thu thập thông tin của bạn.
            </p>
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Dán API Key của bạn vào đây</label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className={`w-full p-4 pr-12 border-2 rounded-xl text-lg font-medium outline-none transition-all ${
                    error ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' : 'border-gray-200 focus:border-blue-500 text-gray-800'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-2 font-medium animate-pulse">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
            </div>

            <button
              onClick={handleVerifyAndSave}
              disabled={isValidating || !apiKey.trim()}
              className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 text-lg transition-all shadow-lg ${
                isValidating || !apiKey.trim()
                  ? 'bg-gray-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5'
              }`}
            >
              {isValidating ? (
                <>
                  <Loader2 className="animate-spin" /> Đang kiểm tra...
                </>
              ) : (
                <>
                  <Save size={20} /> Xác thực & Lưu
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};