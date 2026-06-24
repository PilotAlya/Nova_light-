import { useEffect, useState, useMemo } from "react";

interface BorisGuideProps {
  section: string;
  title: string;
  text: string;
  onDismiss: () => void;
}

function playBlip() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch {}
}

function useTypewriter(text: string, speed: number, enabled: boolean) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    setDisplayed("");
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i % 3 === 0) playBlip();
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, enabled]);

  return { displayed, done };
}

export default function BorisGuide({ section, title, text, onDismiss }: BorisGuideProps) {
  const [visible, setVisible] = useState(false);
  const [showText, setShowText] = useState(false);

  const fullText = useMemo(() => `${title} — ${text}`, [title, text]);
  const { displayed, done } = useTypewriter(fullText, 35, showText);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 200);
    const t2 = setTimeout(() => setShowText(true), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleDismiss = () => {
    setShowText(false);
    setVisible(false);
    setTimeout(onDismiss, 400);
  };

  return (
    <div
      className={`fixed inset-0 z-[180] transition-all duration-500 ${
        visible ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-700 ${
          visible ? "opacity-60" : "opacity-0"
        }`}
        onClick={handleDismiss}
      />

      <div className="absolute bottom-0 right-4">
        <img
          src="/boris-guide.png"
          alt="Борис"
          className={`h-[75vh] w-auto object-contain transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{
            filter: "drop-shadow(0 0 40px rgba(251,191,36,0.2))",
          }}
        />
      </div>

      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 transition-all duration-500 ${
          showText ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        <div className="mb-8 bg-slate-900/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-5 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-[10px]">
              Б
            </div>
            <span className="text-amber-300 font-bold text-xs">Борис</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">
              Штурман Nova · {section}
            </span>
          </div>

          <div className="text-white/90 text-sm leading-relaxed min-h-[3rem]">
            {displayed}
            {!done && <span className="inline-block w-0.5 h-4 bg-amber-400 ml-0.5 animate-pulse" />}
          </div>

          <div className={`flex justify-end mt-3 transition-opacity duration-300 ${done ? "opacity-100" : "opacity-0"}`}>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(251,191,36,0.25)]"
            >
              Понятно!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
