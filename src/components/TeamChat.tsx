import React, { useState, useRef, useEffect } from 'react';
import { Users, Paperclip, Mic, MicOff, Smile, Send, Star, MessageCircle, ChevronDown, Bookmark, Trash2 } from 'lucide-react';
import { TeamMember } from '../types';
import { loadData, saveData } from "../api/sync";

interface TeamChatProps {
  currentUser: string | null;
  teamMembers: Record<string, TeamMember>;
  formatTime: (date: Date) => string;
  isAdmin: boolean;
}

const BORIS_STICKERS = [
  { id: "happy", url: "/stickers/Борис радуется.png" },
  { id: "blush", url: "/stickers/Борис смущен.png" },
  { id: "sleep", url: "/stickers/Борис устал.png" },
  { id: "think", url: "/stickers/Борис Задумался.png" },
  { id: "shock", url: "/stickers/Борис в шоке.png" },
  { id: "surprised", url: "/stickers/Борис грустит.png" },
  { id: "tablet", url: "/stickers/Борис за планшетом.png" },
  { id: "shy", url: "/stickers/Борис смущается.png" },
  { id: "angry", url: "/stickers/Борис злиться.png" },
  { id: "smirk", url: "/stickers/Борис ухмыляется.png" },
];

const initialGeneralMessages = [
  { id: 1, senderKey: "marina", text: "Коллеги, кто может срочно пересчитать проект LD-001? Клиент просит заменить ЛДСП на эмаль.", time: "10:15", sticker: null as string | null },
  { id: 2, senderKey: "denis", text: "Я возьму, скинь актуальные размеры.", time: "10:18", sticker: null as string | null },
  { id: 3, senderKey: "alexey", text: "У нас задержка поставки направляющих Hettich, предупредите клиентов.", time: "11:45", sticker: null as string | null },
];

type ChatType = "general" | "saved" | string;

const TeamChat: React.FC<TeamChatProps> = ({ currentUser, teamMembers, formatTime, isAdmin }) => {
  const memberKeys = Object.keys(teamMembers);

  const [activeChat, setActiveChat] = useState<ChatType>("general");
  const [chatMessages, setChatMessages] = useState<Record<string, typeof initialGeneralMessages>>(() => {
    const saved = localStorage.getItem("nova_light_chat_messages");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return { general: [...initialGeneralMessages], saved: [] };
  });

  const [serverLoaded, setServerLoaded] = useState(false);

  useEffect(() => {
    if (serverLoaded) return;
    loadData<Record<string, typeof initialGeneralMessages>>("chat_messages").then(d => {
      if (d && Object.keys(d).length > 0) {
        setChatMessages(prev => {
          const merged = { ...prev };
          for (const key of Object.keys(d)) {
            const existing = prev[key] || [];
            const serverIds = new Set(d[key].map(m => m.id));
            merged[key] = [...d[key], ...existing.filter(m => !serverIds.has(m.id))];
          }
          return merged;
        });
      }
      setServerLoaded(true);
    }).catch(() => setServerLoaded(true));
  }, [serverLoaded]);

  useEffect(() => {
    localStorage.setItem("nova_light_chat_messages", JSON.stringify(chatMessages));
    if (serverLoaded) saveData("chat_messages", chatMessages);
  }, [chatMessages, serverLoaded]);
  const [newTeamMessage, setNewTeamMessage] = useState("");
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const teamChatEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [chatAttachments, setChatAttachments] = useState<{ name: string; url: string; type: string }[]>([]);
  const [showMemberList, setShowMemberList] = useState(false);

  const [customStickers, setCustomStickers] = useState<string[]>([]);
  const stickerOptions = [
    ...customStickers.map((url, index) => ({ id: `custom-${index}`, url, custom: true })),
    ...BORIS_STICKERS,
  ];

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("nova_light_chat_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("nova_light_chat_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    loadData<string[]>("chat_favorites").then(d => {
      if (d && d.length > 0) setFavorites(d);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (favorites.length > 0) saveData("chat_favorites", favorites);
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("nova_light_chat_messages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  const customStickerInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (teamChatEndRef.current) {
      teamChatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeChat]);

  const addCustomStickers = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setCustomStickers((prev) => [...prev, ...urls]);
    if (customStickerInputRef.current) {
      customStickerInputRef.current.value = "";
    }
  };

  const handleCustomStickerUpload = () => {
    customStickerInputRef.current?.click();
  };

  const getCurrentUserKey = (): string => {
    return Object.keys(teamMembers).find((k) => teamMembers[k].name === currentUser) || "admin";
  };

  const getChatName = (chat: ChatType): string => {
    if (chat === "general") return "Общий канал";
    if (chat === "saved") return "Сохранённые сообщения";
    return teamMembers[chat]?.name || chat;
  };

  const getChatAvatar = (chat: ChatType): string => {
    if (chat === "general") return "";
    if (chat === "saved") return "";
    return teamMembers[chat]?.avatar || "";
  };

  const sendTeamMessage = (e: React.FormEvent | null, sticker: string | null = null) => {
    if (e) e.preventDefault();
    if (!newTeamMessage.trim() && !sticker && chatAttachments.length === 0) return;

    const msg = {
      id: Date.now(),
      senderKey: getCurrentUserKey(),
      text: newTeamMessage + (chatAttachments.length > 0 ? "\n📎 " + chatAttachments.map(a => a.name).join(", ") : ""),
      sticker,
      time: formatTime(new Date()),
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), msg],
    }));
    setNewTeamMessage("");
    setChatAttachments([]);
    setShowStickerPicker(false);
  };

  const handleFileAttach = (files: FileList | null) => {
    if (!files) return;
    const newAttachments = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    }));
    setChatAttachments((prev) => [...prev, ...newAttachments]);
  };

  const startRecording = async () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Ваш браузер не поддерживает распознавание речи. Используйте Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "ru-RU";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript)
        .join("");
      setNewTeamMessage(transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const toggleFavorite = (key: string) => {
    setFavorites((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const deleteMessage = (msgId: number) => {
    if (!confirm("Удалить сообщение?")) return;
    setChatMessages((prev) => ({
      ...prev,
      [activeChat]: (prev[activeChat] || []).filter((m) => m.id !== msgId),
    }));
  };

  const messages = chatMessages[activeChat] || [];

  const isSavedChat = activeChat === "saved";
  const isGeneralChat = activeChat === "general";
  const isPrivateChat = !isGeneralChat && !isSavedChat;

  const renderMemberItem = (key: string) => {
    const member = teamMembers[key];
    if (!member) return null;
    const isActive = activeChat === key;
    const isFav = favorites.includes(key);
    return (
      <button
        key={key}
        onClick={() => { setActiveChat(key); setShowMemberList(false); }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${
          isActive ? "bg-indigo-500/15 border border-indigo-500/20" : "hover:bg-white/5 border border-transparent"
        }`}
      >
        <div className="relative flex-shrink-0">
          <img src={member.avatar} className="w-9 h-9 rounded-full object-cover border border-white/10" alt="" />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-white truncate">{member.name}</span>
            {isFav && <Star size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />}
          </div>
          <p className="text-[10px] text-slate-500 truncate">{member.role}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(key); }}
          className={`p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:bg-white/10 ${
            isFav ? "opacity-100" : ""
          }`}
        >
          <Star size={12} className={isFav ? "text-amber-400 fill-amber-400" : "text-slate-500"} />
        </button>
      </button>
    );
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col fade-in">
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">Командный чат</h2>
        <p className="text-slate-400">Личные и общие чаты команды.</p>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        <div className={`${showMemberList ? "fixed inset-0 z-50 flex" : "hidden"} lg:flex lg:relative lg:inset-auto lg:z-auto`}>
          {showMemberList && (
            <div className="absolute inset-0 bg-black/60 lg:hidden" onClick={() => setShowMemberList(false)} />
          )}
          <div className={`relative w-72 flex-shrink-0 glass-panel rounded-2xl flex flex-col overflow-hidden ${showMemberList ? "m-4" : ""}`}>
            <div className="p-4 border-b border-white/5 bg-black/20 space-y-1">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle size={16} className="text-indigo-400" />
                <h4 className="font-bold text-white text-sm">Чаты</h4>
              </div>

              <button
                onClick={() => { setActiveChat("saved"); setShowMemberList(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                  activeChat === "saved" ? "bg-amber-500/15 border border-amber-500/20" : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Bookmark size={16} className="text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-white">Сохранённые сообщения</span>
                  <p className="text-[10px] text-slate-500 truncate">Личные заметки</p>
                </div>
                <span className="text-[10px] text-slate-500">{chatMessages.saved?.length || 0}</span>
              </button>

              <button
                onClick={() => { setActiveChat("general"); setShowMemberList(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                  activeChat === "general" ? "bg-indigo-500/15 border border-indigo-500/20" : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Users size={16} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-white">Общий канал</span>
                  <p className="text-[10px] text-slate-500 truncate">Вся команда</p>
                </div>
                <span className="text-[10px] text-slate-500">{chatMessages.general?.length || 0}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {favorites.length > 0 && (
                <>
                  <div className="flex items-center gap-1.5 px-2 py-1.5">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Избранное</span>
                  </div>
                  {favorites.map((key) => renderMemberItem(key))}
                  <div className="border-t border-white/5 my-2" />
                </>
              )}

              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <Users size={10} className="text-slate-500" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Команда</span>
              </div>
              {memberKeys.map((key) => renderMemberItem(key))}
            </div>
          </div>
        </div>

        <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden">
          <div className="h-14 border-b border-white/5 flex items-center px-5 bg-black/20 justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMemberList(true)}
                className="lg:hidden w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400"
              >
                <ChevronDown size={16} />
              </button>
              {isGeneralChat ? (
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Users size={14} className="text-indigo-400" />
                </div>
              ) : isSavedChat ? (
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Bookmark size={14} className="text-amber-400" />
                </div>
              ) : (
                <img src={getChatAvatar(activeChat)} className="w-8 h-8 rounded-full object-cover border border-white/10" alt="" />
              )}
              <div>
                <h4 className="font-bold text-white text-sm">{getChatName(activeChat)}</h4>
                <p className="text-[10px] text-slate-500">
                  {isGeneralChat ? `${memberKeys.length} участников` : isSavedChat ? "Только ты" : teamMembers[activeChat]?.role || ""}
                </p>
              </div>
            </div>
            {isPrivateChat && (
              <button
                onClick={() => toggleFavorite(activeChat)}
                className={`p-1.5 rounded-lg transition-all ${favorites.includes(activeChat) ? "text-amber-400" : "text-slate-500 hover:text-white"}`}
              >
                <Star size={14} className={favorites.includes(activeChat) ? "fill-amber-400" : ""} />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5 chat-scroll bg-black/10">
            {isSavedChat && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                  <Bookmark size={28} className="text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Сохранённые сообщения</h3>
                <p className="text-sm text-slate-400 max-w-xs">
                  Здесь хранятся твои заметки, напоминания и важные файлы. Только ты видишь этот чат.
                </p>
              </div>
            )}
            {messages.map((msg) => {
              const isMine = msg.senderKey === getCurrentUserKey();
              const sender = teamMembers[msg.senderKey];
              const isStickerOnly = msg.sticker && !msg.text.trim();
              return (
                <div key={msg.id} className={`flex gap-3 group ${isMine ? "flex-row-reverse" : ""} ${isSavedChat ? "justify-start" : ""}`}>
                  {sender && !isSavedChat && (
                    <img
                      src={sender.avatar}
                      className="w-8 h-8 rounded-full flex-shrink-0 border border-white/10 mt-1"
                      alt=""
                    />
                  )}
                  <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[75%]`}>
                    <div className="flex items-baseline gap-2 mb-0.5">
                      {!isSavedChat && (
                        <span className="text-xs font-semibold text-slate-300">{sender?.name || msg.senderKey}</span>
                      )}
                      <span className="text-[9px] text-slate-600">{msg.time}</span>
                      {isMine && (
                        <button onClick={() => deleteMessage(msg.id)} className="p-0.5 rounded hover:bg-white/10 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all ml-1" title="Удалить">
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed backdrop-blur-sm ${
                      isStickerOnly
                        ? "bg-transparent border-none"
                        : isSavedChat
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-100"
                          : isMine
                            ? "bg-indigo-600/80 text-white rounded-tr-sm"
                            : "bg-black/40 border border-white/5 text-slate-300 rounded-tl-sm"
                    }`}>
                      {msg.text}
                      {msg.sticker && (
                        <div className="mt-2 animate-in zoom-in-50 duration-300 w-max">
                          <img src={msg.sticker} className="w-24 h-24 object-contain" style={{ filter: "contrast(1.05) brightness(1.05)" }} alt="sticker" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={teamChatEndRef} />
          </div>

          <div className="p-4 border-t border-white/5 bg-black/30 relative">
            {showStickerPicker && (
              <div className="absolute bottom-full left-4 mb-2 p-3 glass-panel rounded-2xl flex flex-col gap-3 shadow-2xl border-indigo-500/30 animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-widest text-slate-400">Стикеры Бориса</span>
                  {isAdmin && (
                    <button type="button" onClick={handleCustomStickerUpload} className="text-[11px] px-2 py-1 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-full transition-colors">
                      Загрузить свой
                    </button>
                  )}
                </div>
                <div className="flex gap-3 flex-wrap">
                  {stickerOptions.map((s) => (
                    <button key={s.id} onClick={() => sendTeamMessage(null, s.url)} className="w-14 h-14 hover:bg-white/5 rounded-xl flex items-center justify-center transition-all hover:scale-110">
                      <img src={s.url} className="w-12 h-12 object-contain" alt="sticker" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <input ref={customStickerInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addCustomStickers(e.target.files)} />
            {chatAttachments.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                {chatAttachments.map((file, i) => (
                  <div key={i} className="relative group shrink-0">
                    {file.type.startsWith("image/") ? (
                      <img src={file.url} className="w-16 h-16 object-cover rounded-xl border border-white/10" alt="attach" />
                    ) : (
                      <div className="w-16 h-16 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                        <Paperclip size={20} className="text-slate-400" />
                      </div>
                    )}
                    <button onClick={() => setChatAttachments((p) => p.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={(e) => sendTeamMessage(e)} className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleFileAttach(e.target.files)} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors shrink-0">
                <Paperclip size={20} />
              </button>
              <div className="flex-1 bg-black/40 border border-white/10 rounded-xl flex items-center pr-2 focus-within:border-indigo-500/50 transition-colors">
                <input type="text" value={newTeamMessage} onChange={(e) => setNewTeamMessage(e.target.value)}
                  placeholder={
                    isSavedChat
                      ? "Написать заметку..."
                      : isGeneralChat
                        ? "Написать в общий чат..."
                        : `Написать ${teamMembers[activeChat]?.name || ""}...`
                  }
                  className="w-full bg-transparent border-none px-4 py-3 text-sm text-white focus:outline-none placeholder-slate-500" />
                <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isRecording ? "bg-red-500/20 text-red-400 animate-pulse" : "hover:bg-white/5 text-slate-400"}`}>
                  {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <button type="button" onClick={() => setShowStickerPicker(!showStickerPicker)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ml-1 ${showStickerPicker ? "bg-indigo-500/20 text-indigo-400" : "hover:bg-white/5 text-slate-400"}`}>
                  <Smile size={16} />
                </button>
              </div>
              <button type="submit" disabled={!newTeamMessage.trim() && chatAttachments.length === 0} className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl flex items-center justify-center transition-all shrink-0 shadow-lg">
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamChat;
