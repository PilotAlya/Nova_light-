import React from "react";
import { ArrowLeft } from "lucide-react";

interface GlitchSimulationProps {
  onReturn: () => void;
}

export default function GlitchSimulation({ onReturn }: GlitchSimulationProps) {
  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/glitch-404.png)" }}
      />

      <button
        onClick={onReturn}
        className="absolute bottom-8 left-8 z-10 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Вернуться в реальность
      </button>
    </div>
  );
}
