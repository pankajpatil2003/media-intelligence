import { useNavigate } from "react-router-dom";
import { Mic, Zap, Shield, Cpu } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl text-center space-y-10 px-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-sm font-mono tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(234,88,12,0.15)]">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
          System Online
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 drop-shadow-lg">
          MEDIA
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
            INTELLIGENCE
          </span>
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
          An enterprise-grade media processing engine. Ultra-low latency
          transcription and robust audio analytics powered by raw AI compute.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-orange-600 text-white font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(234,88,12,0.4)]"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
          <span className="relative flex items-center gap-2">
            Access Dashboard <Zap className="w-5 h-5 fill-current" />
          </span>
        </button>

        {/* Footer Tech Specs */}
        <div className="pt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto text-zinc-500 font-mono text-xs uppercase tracking-widest border-t border-zinc-800/50 mt-12">
          <div className="flex flex-col items-center gap-2">
            <Cpu className="w-5 h-5" /> Faster Whisper
          </div>
          <div className="flex flex-col items-center gap-2">
            <Zap className="w-5 h-5" /> WebSockets
          </div>
          <div className="flex flex-col items-center gap-2">
            <Shield className="w-5 h-5" /> WebRTC VAD
          </div>
        </div>
      </div>
    </div>
  );
}
