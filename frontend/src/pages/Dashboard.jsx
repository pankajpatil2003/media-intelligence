import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 🔥 Import Auth Context
import {
  Activity,
  Radio,
  FileAudio,
  ChevronRight,
  User,
  Shield,
  LogOut,
  Database,
  Search, // 🔥 Added Search Icon
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // 🔥 Get user data and logout function

  // 🔥 State for the search bar
  const [searchQuery, setSearchQuery] = useState("");

  const features = [
    {
      id: "transcription",
      title: "Live Transcription",
      description:
        "Real-time, 16kHz float32 audio streaming with hardware-accelerated speech-to-text.",
      icon: <Activity className="w-7 h-7 text-orange-400" />,
      path: "/live-transcription",
      active: true,
      tag: "v1.0",
    },
    {
      id: "batch_transcription",
      title: "Batch Processing",
      description:
        "Upload pre-recorded media files (MP3, WAV, MP4) for deep analysis and complete text extraction.",
      icon: <Database className="w-7 h-7 text-orange-400" />,
      path: "/batch-transcription",
      active: true,
      tag: "v1.0",
    },
    {
      id: "sentiment",
      title: "Audio Sentiment",
      description:
        "Deep-learning analysis of emotional tone and frequency variations.",
      icon: <Radio className="w-7 h-7 text-zinc-600" />,
      path: "#",
      active: false,
      tag: "Beta",
    },
  ];

  // 🔥 Filter features based on search query (checks title and description)
  const filteredFeatures = features.filter(
    (feature) =>
      feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black p-10 pt-20 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 border-b border-zinc-800/50 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">
              SYSTEM <span className="text-orange-500">MODULES</span>
            </h2>
            <p className="text-zinc-400 mt-2 font-mono text-sm">
              Select an active processing node below.
            </p>
          </div>

          {/* Top Right Navigation Cluster */}
          <div className="flex items-center gap-3">
            {/* Admin Console (Conditional) */}
            {user?.role === "Root Admin" && (
              <button
                onClick={() => navigate("/admin")}
                title="Admin Console"
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:text-red-500 transition-all text-zinc-400 group"
              >
                <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            )}

            {/* Operator Profile */}
            <button
              onClick={() => navigate("/profile")}
              title="Operator Profile"
              className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 hover:text-orange-500 transition-all text-zinc-400 group"
            >
              <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>

            {/* Terminate Session (Logout) */}
            <button
              onClick={logout}
              title="Terminate Session"
              className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </header>

        {/* 🔥 Search Bar UI */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-zinc-500" />
            </div>
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono text-sm placeholder-zinc-600"
            />
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 🔥 Display Empty State if no features match the search */}
          {filteredFeatures.length === 0 ? (
            <div className="col-span-full py-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
              <Search className="w-8 h-8 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
                No modules found matching "{searchQuery}"
              </p>
            </div>
          ) : (
            filteredFeatures.map((feature) => (
              <div
                key={feature.id}
                onClick={() => feature.active && navigate(feature.path)}
                className={`group relative p-8 rounded-2xl bg-zinc-900/30 backdrop-blur-md border overflow-hidden flex flex-col h-full transition-all duration-500
                  ${
                    feature.active
                      ? "border-zinc-700/50 hover:border-orange-500/80 cursor-pointer hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(234,88,12,0.3)]"
                      : "border-zinc-800/30 opacity-50 cursor-not-allowed"
                  }`}
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1 ${feature.active ? "bg-gradient-to-r from-orange-600 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" : ""}`}
                ></div>

                <div className="flex justify-between items-start mb-6">
                  <div
                    className={`p-4 rounded-xl border ${feature.active ? "bg-orange-500/10 border-orange-500/20 shadow-[0_0_15px_rgba(234,88,12,0.2)]" : "bg-zinc-950 border-zinc-800"}`}
                  >
                    {feature.icon}
                  </div>
                  <span className="font-mono text-xs uppercase tracking-widest px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-500">
                    {feature.tag}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed flex-grow mb-8">
                  {feature.description}
                </p>

                <div className="mt-auto border-t border-zinc-800/50 pt-4 flex items-center justify-between">
                  <span
                    className={`text-xs font-mono uppercase tracking-widest ${feature.active ? "text-orange-500" : "text-zinc-600"}`}
                  >
                    {feature.active ? "Initialize Engine" : "Offline"}
                  </span>
                  {feature.active && (
                    <ChevronRight className="w-5 h-5 text-orange-500 transform group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
