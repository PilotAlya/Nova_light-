import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronRight, SkipForward, Volume2, VolumeX } from "lucide-react";

interface OnboardingStep {
  id: number;
  text: string;
  emotion: "happy" | "think" | "shock" | "blush" | "wave";
  audio: string; // путь к аудиофайлу
  highlight?: string;
}

const STEPS: OnboardingStep[] = [
  {
    id: 1,
    text: "Приветствую тебя, новый пилот Nova! Я — Борис, цифровой штурман этой системы. Добро пожаловать на борт!",
    emotion: "wave",
    audio: "/audio/boris_01.mp3",
  },
  {
    id: 2,
    text: "Сразу скажу честно: это прототип. Будущее не за горами. Если что-то работает не идеально — не расстраивайся. Мы в процессе!",
    emotion: "blush",
    audio: "/audio/boris_02.mp3",
  },
  {
    id: 3,
    text: "Сердце системы — «Пайплайн задач». Здесь живут все твои лиды. Перетаскивай карточки между колонками, следи за дедлайнами. Просроченные — красные!",
    emotion: "think",
    audio: "/audio/boris_03.mp3",
    highlight: "kanban",
  },
  {
    id: 4,
    text: "В разделе «Наши герои» — твоя команда. И анонимный ящик для идей. Хочешь кофемашину в цех? Самое место!",
    emotion: "happy",
    audio: "/audio/boris_04.mp3",
    highlight: "community",
  },
  {
    id: 5,
    text: "«База Знаний» — твой штабной справочник. Там стандарты, обучение, библиотека модулей и калькулятор. Читай перед тем, как что-то делать самостоятельно!",
    emotion: "think",
    audio: "/audio/boris_05.mp3",
    highlight: "wiki",
  },
  {
    id: 6,
    text: "Я всегда рядом — нажми на кнопку «ИИ-Штурман» и задавай любые вопросы. Только не забудь подключить Gemini API!",
    emotion: "happy",
    audio: "/audio/boris_06.mp3",
    highlight: "ai-navigator",
  },
  {
    id: 7,
    text: "Всё, инструктаж завершён! Удачного полёта, пилот. Nova ждёт твоих великих свершений. И помни — без самодеятельности!",
    emotion: "shock",
    audio: "/audio/boris_07.mp3",
  },
];

// Пути к спрайтам маскота (без белого фона)
const BORIS_IMAGES: Record<string, string> = {
  happy: "/stickers/boris_happy_nobg.png",
  think: "/stickers/boris_think_nobg.png",
  shock: "/stickers/boris_shock_nobg.png",
  blush: "/stickers/boris_blush_nobg.png",
  wave:  "/stickers/boris_wave_nobg.png",
};

interface BorisOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function BorisOnboarding({
  onComplete,
  onSkip,
}: BorisOnboardingProps) {
  const [step, setStep] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const current = STEPS[step];

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Воспроизводим аудио при смене шага
  useEffect(() => {
    if (!current) return;

    // Останавливаем предыдущее
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (!isMuted) {
      const audio = new Audio(current.audio);
      audio.volume = volume;
      audioRef.current = audio;
      audio.play().catch(() => {
        // Браузер может заблокировать автовоспроизведение — молча игнорируем
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [step, isMuted]);

  // Синхронизируем громкость при изменении слайдера
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const typeText = useCallback((text: string) => {
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 22);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (current) {
      const cleanup = typeText(current.text);
      return cleanup;
    }
  }, [step, current, typeText]);

  const handleNext = () => {
    if (isTyping) {
      setDisplayedText(current.text);
      setIsTyping(false);
      return;
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      // Останавливаем аудио при завершении
      if (audioRef.current) audioRef.current.pause();
      setIsVisible(false);
      setTimeout(onComplete, 400);
    }
  };

  const handleSkip = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsVisible(false);
    setTimeout(onSkip, 400);
  };

  const toggleMute = () => {
    setIsMuted((m) => {
      if (!m && audioRef.current) {
        // Включаем mute — останавливаем текущее
        audioRef.current.pause();
      }
      return !m;
    });
  };

  const progress = ((step + 1) / STEPS.length) * 100;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ background: "rgba(7, 8, 14, 0.92)", backdropFilter: "blur(8px)" }}
    >
      {/* Звёздный фон */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            style={{
              left: `${(i * 2.5) % 100}%`,
              top: `${(i * 3.7) % 100}%`,
              animation: `pulseSoft ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${(i % 4) * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div
        className={`relative w-full max-w-2xl mx-4 transition-all duration-500 ${
          isVisible ? "onboarding-slide-up" : ""
        }`}
      >
        {/* Верхняя панель: пропустить + звук */}
        <div className="absolute -top-12 left-0 right-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMute}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm transition-colors"
              title={isMuted ? "Включить звук" : "Выключить звук"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isMuted ? "Звук выкл." : "Звук вкл."}</span>
            </button>
            {!isMuted && (
              <div className="flex items-center gap-2" title="Громкость Бориса">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Громкость:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 focus:outline-none transition-all"
                  aria-label="Громкость Бориса"
                />
                <span className="text-[10px] text-slate-400 w-6 font-medium">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            )}
          </div>
          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            <SkipForward size={14} />
            Пропустить
          </button>
        </div>

        {/* Карточка */}
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Прогресс-бар */}
          <div className="h-1 bg-black/40">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-8">
            <div className="flex gap-8 items-start">

              {/* Аватар Бориса — без анимации, фиксированный размер */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-3xl border border-white/10 overflow-hidden"
                  style={{ background: "rgba(15, 17, 26, 0.8)" }}
                >
                  <img
                    src={BORIS_IMAGES[current?.emotion || "happy"]}
                    alt="Борис"
                    className="w-full h-full object-contain object-bottom"
                  />
                </div>

                {/* Точки-шаги */}
                <div className="mt-3 flex gap-1.5 justify-center">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === step
                          ? "w-5 bg-indigo-400"
                          : i < step
                          ? "w-1.5 bg-indigo-600"
                          : "w-1.5 bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Текстовый пузырь */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 pulse-soft" />
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
                    Штурман Борис · Шаг {step + 1} из {STEPS.length}
                  </span>
                </div>

                <div className="min-h-[100px] bg-black/30 rounded-2xl border border-white/5 p-5 mb-6 relative">
                  <div className="absolute -left-2 top-6 w-3 h-3 bg-black/30 border-l border-b border-white/5 rotate-45" />
                  <p className="text-white text-base leading-relaxed">
                    {displayedText}
                    {isTyping && (
                      <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 animate-pulse" />
                    )}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleNext}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all ${
                      isLast && !isTyping
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                        : "bg-indigo-600/80 hover:bg-indigo-500 text-white"
                    }`}
                  >
                    {isTyping ? (
                      "Показать всё"
                    ) : isLast ? (
                      <>
                        <span>Вперёд, в систему!</span>
                        <span className="text-lg">🚀</span>
                      </>
                    ) : (
                      <>
                        <span>Дальше</span>
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>

                  {!isLast && (
                    <button
                      onClick={handleSkip}
                      className="px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-all border border-white/5"
                    >
                      Пропустить
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <span className="text-xs text-slate-500">
            Это онбординг-тур. Он показывается только при первом входе.
          </span>
        </div>
      </div>
    </div>
  );
}
