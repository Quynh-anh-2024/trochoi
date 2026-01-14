import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { InputForm } from './components/InputForm';
import { GameCard } from './components/GameCard';
import { FormData, GameIdea } from './types';
import { generateGameIdeas } from './services/gemini';
import { exportToHTML, exportToPPTX } from './services/exportService';
import { DownloadModal } from './components/DownloadModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AlertCircle, Library, PlusCircle, CheckCircle } from 'lucide-react';

type ViewMode = 'create' | 'saved';

export default function App() {
  const [ideas, setIdeas] = useState<GameIdea[] | null>(null);
  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Storage and View State
  const [savedGames, setSavedGames] = useState<GameIdea[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('create');

  // API Key State
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiModal, setShowApiModal] = useState(false);

  // Download State
  const [downloadIdea, setDownloadIdea] = useState<GameIdea | null>(null);

  // Load saved games and API Key on mount
  useEffect(() => {
    try {
      const storedGames = localStorage.getItem('teacher_assistant_saved_games');
      if (storedGames) setSavedGames(JSON.parse(storedGames));

      const storedKey = localStorage.getItem('teacher_assistant_api_key');
      if (storedKey) {
        setApiKey(storedKey);
      } else {
        setShowApiModal(true); // Show modal if no key found
      }
    } catch (e) {
      console.error("Failed to load local storage", e);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('teacher_assistant_api_key', key);
    setShowApiModal(false);
    showSuccess("Đã lưu API Key thành công!");
  };

  // Save functionality (Local)
  const handleSaveGame = (ideaToSave: GameIdea) => {
    if (savedGames.some(g => g.title === ideaToSave.title)) return;
    const newSaved = [ideaToSave, ...savedGames];
    setSavedGames(newSaved);
    localStorage.setItem('teacher_assistant_saved_games', JSON.stringify(newSaved));
    showSuccess("Đã lưu vào bộ nhớ trình duyệt!");
  };

  // Delete functionality
  const handleDeleteGame = (index: number) => {
    const newSaved = savedGames.filter((_, i) => i !== index);
    setSavedGames(newSaved);
    localStorage.setItem('teacher_assistant_saved_games', JSON.stringify(newSaved));
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleFormSubmit = async (data: FormData) => {
    if (!apiKey) {
      setShowApiModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    setIdeas(null);
    setCurrentFormData(data);
    setViewMode('create');
    
    try {
      const generatedIdeas = await generateGameIdeas(data, apiKey);
      setIdeas(generatedIdeas);
    } catch (err) {
      setError("Có lỗi xảy ra khi kết nối với AI. Vui lòng kiểm tra lại API Key hoặc thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRequest = (idea: GameIdea) => {
    setDownloadIdea(idea);
  };

  const processDownloadHTML = (idea: GameIdea) => {
    exportToHTML(idea);
    setDownloadIdea(null);
    showSuccess("Đã tải xuống file HTML!");
  };

  const processDownloadPPTX = async (idea: GameIdea) => {
    try {
      await exportToPPTX(idea);
      setDownloadIdea(null);
      showSuccess("Đã tải xuống file PowerPoint!");
    } catch (e) {
      console.error(e);
      setError("Không thể tạo file PowerPoint. Vui lòng thử lại.");
    }
  };

  return (
    <Layout onOpenSettings={() => setShowApiModal(true)}>
      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={showApiModal} 
        onSave={handleSaveApiKey} 
        onClose={() => setShowApiModal(false)}
        isMandatory={!apiKey}
      />

      {/* Notifications */}
      {successMsg && (
        <div className="fixed top-24 right-4 bg-green-100 border border-green-400 text-green-800 px-6 py-4 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-fade-in-up">
          <CheckCircle className="text-green-600" />
          {successMsg}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-200 inline-flex">
          <button
            onClick={() => setViewMode('create')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              viewMode === 'create'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <PlusCircle size={20} />
            Sáng tạo
          </button>
          <button
            onClick={() => setViewMode('saved')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              viewMode === 'saved'
                ? 'bg-yellow-500 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Library size={20} />
            Kho lưu trữ
            {savedGames.length > 0 && (
              <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">
                {savedGames.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {viewMode === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          {/* Left Column: Form - Increased width to col-span-5 */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-6">
             <div className="sticky top-24">
               <InputForm onSubmit={handleFormSubmit} isLoading={loading} />
               
               <div className="mt-6 bg-yellow-50 rounded-2xl p-5 border border-yellow-200 shadow-sm">
                  <h3 className="font-bold text-yellow-800 mb-2 text-sm uppercase tracking-wide">Mẹo cho giáo viên</h3>
                  <ul className="text-sm text-yellow-900 space-y-2 list-disc pl-4">
                    <li>Nhập chủ đề cụ thể để có trò chơi sát với bài học.</li>
                    <li>Hoạt động khởi động nên diễn ra nhanh (3-5 phút).</li>
                    <li>Ưu tiên các trò chơi vận động nhẹ hoặc đố vui nhanh.</li>
                  </ul>
               </div>
             </div>
          </div>

          {/* Right Column: Results - Adjusted width to col-span-7 */}
          <div className="lg:col-span-7 xl:col-span-7">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 mb-6">
                <AlertCircle className="flex-shrink-0 mt-0.5" />
                <p>{error}</p>
                {error.includes("API Key") && (
                  <button onClick={() => setShowApiModal(true)} className="underline font-bold ml-2">Cập nhật Key</button>
                )}
              </div>
            )}

            {!ideas && !loading && !error && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center text-gray-400 p-8 border-4 border-dashed border-gray-200 rounded-3xl">
                <img 
                  src="https://picsum.photos/300/200?blur=5" 
                  alt="Classroom illustration" 
                  className="mb-4 rounded-2xl opacity-50 grayscale"
                />
                <p className="text-xl font-medium">Chưa có ý tưởng nào.</p>
                <p className="mt-2">Hãy nhập thông tin bên trái để bắt đầu sáng tạo!</p>
              </div>
            )}
            
            {loading && (
               <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 shadow-sm animate-pulse border border-gray-100">
                      <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                      <div className="h-20 bg-gray-100 rounded-xl mb-6"></div>
                      <div className="space-y-2">
                         <div className="h-4 bg-gray-200 rounded w-full"></div>
                         <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                         <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                      </div>
                    </div>
                  ))}
               </div>
            )}

            {ideas && ideas.length > 0 && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Kết quả đề xuất
                  </h2>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                    {ideas.length} trò chơi
                  </span>
                </div>
                
                {ideas.map((idea, index) => (
                  <GameCard 
                    key={index} 
                    idea={idea} 
                    index={index} 
                    apiKey={apiKey || ''}
                    onSave={(updatedIdea) => handleSaveGame(updatedIdea || idea)}
                    onDownload={() => handleDownloadRequest(idea)}
                    isSaved={savedGames.some(g => g.title === idea.title)}
                  />
                ))}

                <div className="bg-blue-50 p-6 rounded-2xl text-center mt-8 border border-blue-100">
                  <p className="text-blue-800 font-medium mb-2">Bạn muốn thêm ý tưởng khác?</p>
                  <button 
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Thử lại với chủ đề khác
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Saved Games View */
        <div className="max-w-4xl mx-auto animate-fade-in">
           <div className="flex items-center justify-between mb-8">
             <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
               <Library className="text-yellow-500" size={32} />
               Kho trò chơi đã lưu
             </h2>
             <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 font-medium text-gray-600">
               Tổng cộng: <span className="font-bold text-blue-600">{savedGames.length}</span>
             </div>
           </div>

           {savedGames.length === 0 ? (
             <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
               <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                 <Library size={40} />
               </div>
               <h3 className="text-xl font-bold text-gray-600 mb-2">Chưa có trò chơi nào được lưu</h3>
               <p className="text-gray-500 mb-6">Hãy tạo trò chơi mới và nhấn nút "Lưu" để thêm vào đây.</p>
               <button 
                 onClick={() => setViewMode('create')}
                 className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
               >
                 Tạo trò chơi ngay
               </button>
             </div>
           ) : (
             <div className="space-y-8">
               {savedGames.map((idea, index) => (
                 <GameCard 
                   key={`saved-${index}`} 
                   idea={idea} 
                   index={index}
                   apiKey={apiKey || ''}
                   onDelete={() => handleDeleteGame(index)}
                   onDownload={() => handleDownloadRequest(idea)}
                 />
               ))}
             </div>
           )}
        </div>
      )}

      <DownloadModal 
        idea={downloadIdea} 
        onClose={() => setDownloadIdea(null)}
        onDownloadHTML={processDownloadHTML}
        onDownloadPPTX={processDownloadPPTX}
      />
    </Layout>
  );
}