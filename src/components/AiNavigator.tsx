import React, { useState, useEffect } from 'react';
import { Bot, X, Key, User, Loader2, Send, Sparkles } from 'lucide-react';

interface AiMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

interface AiNavigatorProps {
  geminiKey: string;
  tempKey: string;
  setTempKey: (key: string) => void;
  saveApiKey: () => void;
  removeApiKey: () => void;
  aiMessages: AiMessage[];
  isAiLoading: boolean;
  aiMessageInput: string;
  setAiMessageInput: (input: string) => void;
  sendAiMessage: (e?: React.FormEvent, overrideText?: string) => void;
  aiChatEndRef: React.RefObject<HTMLDivElement>;
  borisAvatarStyle: React.CSSProperties;
  currentUser: string | null;
}

const AiNavigator: React.FC<AiNavigatorProps> = ({
  geminiKey,
  tempKey,
  setTempKey,
  saveApiKey,
  removeApiKey,
  aiMessages,
  isAiLoading,
  aiMessageInput,
  setAiMessageInput,
  sendAiMessage,
  aiChatEndRef,
  borisAvatarStyle,
  currentUser,
}) => {
  const [showChat, setShowChat] = useState(false);
  const [keyError, setKeyError] = useState(false);

  const handleActivate = () => {
    if (tempKey === "nova2026") {
      setKeyError(false);
      saveApiKey();
      setShowChat(true);
    } else {
      setKeyError(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col fade-in">
      {!showChat && !geminiKey ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="glass-panel rounded-3xl p-12 border border-amber-500/20 max-w-lg w-full text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div style={borisAvatarStyle} className="w-24 h-24 rounded-full border-2 border-amber-500/50 shadow-[0_0_30px_rgba(251,191,36,0.2)]" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500/20 rounded-full border border-amber-500/30 flex items-center justify-center">
                  <Sparkles size={14} className="text-amber-400" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Интеллект-Штурман Борис</h2>
            <p className="text-sm text-slate-400 mb-8 max-w-sm mx-auto">
              Цифровой ассистент для управления бизнесом. Введи API-ключ Gemini, чтобы активировать чат.
            </p>
            <div className="flex items-center gap-2 max-w-sm mx-auto">
              <input
                type="text"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Введите Gemini API Ключ для активации"
                className="flex-1 bg-black/40 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-white/40 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                style={tempKey ? { color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' } : undefined}
                onKeyDown={(e) => { if (e.key === "Enter") handleActivate(); }}
              />
              <button
                onClick={handleActivate}
                disabled={!tempKey.trim()}
                className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white force-white px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
              >
                <Key size={16} /> Активировать
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-4">
              Демо-ключ: <span className="text-amber-400/80 font-mono">nova2026</span>
            </p>
            {keyError && (
              <p className="text-[10px] text-red-400 mt-2">Неверный ключ. Используйте демо-ключ nova2026</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1 tracking-tight flex items-center gap-3">
                <Bot size={32} className="text-amber-400" />
                Интеллект-Штурман Борис
              </h2>
              <p className="text-slate-400">{currentUser === "Администратор" ? "Цифровой ассистент для управления бизнесом, аналитики и контроля команды." : "Цифровой коллега, эксперт по регламентам и контролер дедлайнов."}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <Key size={12} /> API подключён
              </span>
              <button
                onClick={() => { removeApiKey(); setShowChat(false); }}
                className="text-[10px] text-slate-400 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-white/5 transition-all"
              >
                <X size={14} /> Отключить
              </button>
            </div>
          </div>

          <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden border-amber-500/20 shadow-[0_0_30px_rgba(251,191,36,0.05)]">
            <div className="h-16 border-b border-white/5 flex items-center px-6 bg-black/20">
              <div className="flex items-center gap-3">
                <div style={borisAvatarStyle} className="w-10 h-10 rounded-full border border-amber-500/50" />
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">Борис</h4>
                  <p className="text-[10px] text-amber-400 uppercase tracking-widest">Online</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 chat-scroll bg-black/10">
              {aiMessages.map((msg) => {
                const isMe = msg.sender === "user";
                return (
                  <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                    {isMe ? (
                      <div className="w-10 h-10 rounded-full bg-white/10 border border-white/5 flex items-center justify-center shrink-0">
                        <User size={18} className="text-slate-300" />
                      </div>
                    ) : (
                      <div style={borisAvatarStyle} className="w-10 h-10 rounded-full flex-shrink-0 shadow-md border border-amber-500/30" />
                    )}
                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-400">{isMe ? "Вы" : "Борис"}</span>
                        <span className="text-[10px] text-slate-600">{msg.time}</span>
                      </div>
                      <div
                        className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isMe
                            ? "bg-indigo-600/80 text-white rounded-tr-sm border border-indigo-500/50"
                            : "bg-black/40 border border-white/5 text-white rounded-tl-sm backdrop-blur-md ai-response"
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: msg.text
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\n/g, "<br/>"),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {isAiLoading && (
                <div className="flex gap-3">
                  <div style={borisAvatarStyle} className="w-10 h-10 rounded-full flex-shrink-0 shadow-md border border-amber-500/30 opacity-50" />
                  <div className="bg-black/40 border border-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                    <Loader2 size={16} className="text-amber-400 animate-spin" />
                    <span className="text-xs text-slate-400">Борис анализирует...</span>
                  </div>
                </div>
              )}
              <div ref={aiChatEndRef} />
            </div>

            <div className="px-6 pb-4 flex flex-wrap gap-2">
              {(currentUser === "Администратор"
                ? ["Общая аналитика по лидам", "Контроль эффективности команды", "Финансовый отчёт за месяц", "Проверь безопасность доступа"]
                : ["Какие регламенты по замеру?", "Как проходит адаптация новичка?", "Проверь дедлайны по проектам", "Статус по складу материалов"]
              ).map((text, i) => (
                <button
                  key={i}
                  onClick={() => sendAiMessage(undefined, text)}
                  className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-300 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-all uppercase font-bold tracking-wider"
                >
                  {text}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-white/10 bg-white/10 backdrop-blur-xl rounded-3xl relative shadow-[0_18px_45px_-28px_rgba(255,255,255,0.95)]">
              <form onSubmit={sendAiMessage} className="relative flex items-center">
                <input
                  type="text"
                  value={aiMessageInput}
                  onChange={(e) => setAiMessageInput(e.target.value)}
                  placeholder="Задайте вопрос Борису..."
                  disabled={isAiLoading}
                  className="w-full bg-white/10 border border-white/20 rounded-full py-3 pl-5 pr-14 text-sm focus:outline-none focus:border-amber-500/50 focus:bg-white/20 transition-all text-slate-900 placeholder-slate-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !aiMessageInput.trim()}
                  className="absolute right-2 w-8 h-8 bg-white text-slate-900 hover:bg-slate-100 disabled:bg-slate-200 rounded-full flex items-center justify-center shadow-sm border border-slate-200 transition-colors"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AiNavigator;