import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 🔥 Import the hook
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Cpu,
  Database,
  Activity,
  Network,
  LogOut,
  Settings,
  Clock,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // 🔥 Get real user data and logout function

  // Simulating backend metrics (fallback to 0)
  const [metrics] = useState({
    transcriptions: null,
    activeAgents: null,
    computeTime: null,
  });

  // Helper to format the creation date from the DB
  const formatDate = (dateString) => {
    if (!dateString) return "Processing...";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Nav Bar */}
      <nav className="border-b border-zinc-800 bg-black/80 backdrop-blur-md px-6 py-4 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-zinc-500 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-6 w-[1px] bg-zinc-800"></div>
          <h1 className="text-xl font-bold tracking-wider flex items-center gap-3">
            <User className="w-5 h-5 text-orange-500" />
            OPERATOR <span className="text-zinc-500">PROFILE</span>
          </h1>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/30"
        >
          <LogOut className="w-4 h-4" /> Terminate Session
        </button>
      </nav>

      <div className="flex-grow p-6 lg:p-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Identity & Actions */}
        <div className="col-span-1 flex flex-col gap-6">
          {/* Identity Card */}
          <div className="relative p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 overflow-hidden shadow-2xl">
            {/* Ambient Glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-[50px] pointer-events-none"></div>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 rounded-2xl bg-zinc-950 border-2 border-orange-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.15)] mb-4 relative overflow-hidden">
                <User className="w-10 h-10 text-orange-400" />
                <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-orange-500/20 to-transparent"></div>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {user?.name || "Unknown Operator"}
              </h2>
              <p className="text-orange-500 font-mono text-xs uppercase tracking-widest mt-1">
                {user?.role || "Operator"}
              </p>

              {/* 🔥 NEW: Display the real Database ID here! */}
              {user?.id && (
                <div className="mt-3 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-md font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                  ID: OP-{user.id.slice(-6)}
                </div>
              )}
            </div>

            <div className="space-y-4 font-mono text-sm border-t border-zinc-800/50 pt-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500 flex items-center gap-2 whitespace-nowrap">
                  <Mail className="w-4 h-4 shrink-0" /> Comm Link
                </span>
                <span className="text-zinc-300 truncate">{user?.email}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500 flex items-center gap-2 whitespace-nowrap">
                  <Shield className="w-4 h-4 shrink-0" /> Clearance
                </span>
                <span className="text-emerald-400 truncate">Authorized</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500 flex items-center gap-2 whitespace-nowrap">
                  <Activity className="w-4 h-4 shrink-0" /> Registered
                </span>
                <span className="text-zinc-300 truncate">
                  {user?.created_at ? formatDate(user.created_at) : "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800">
            <h3 className="text-zinc-400 text-xs font-mono uppercase tracking-widest mb-4">
              System Configurations
            </h3>
            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-orange-500/50 text-zinc-300 hover:text-white transition-all mb-3 group">
              <span className="flex items-center gap-3 text-sm font-medium">
                <Settings className="w-4 h-4 text-zinc-500 group-hover:text-orange-500 transition-colors" />{" "}
                Account Settings
              </span>
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-orange-500/50 text-zinc-300 hover:text-white transition-all group">
              <span className="flex items-center gap-3 text-sm font-medium">
                <Database className="w-4 h-4 text-zinc-500 group-hover:text-orange-500 transition-colors" />{" "}
                Manage API Keys
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Stats & Architecture */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col justify-between">
              <Activity className="w-5 h-5 text-orange-500 mb-4" />
              <div>
                <p className="text-4xl font-light font-mono text-white mb-1">
                  {metrics?.transcriptions || 0}
                </p>
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
                  Transcriptions
                </p>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col justify-between">
              <Network className="w-5 h-5 text-orange-500 mb-4" />
              <div>
                <p className="text-4xl font-light font-mono text-white mb-1">
                  {metrics?.activeAgents || 0}
                </p>
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
                  Active Agents
                </p>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col justify-between">
              <Cpu className="w-5 h-5 text-orange-500 mb-4" />
              <div>
                <p className="text-4xl font-light font-mono text-white mb-1 flex items-baseline gap-1">
                  {metrics?.computeTime || 0}
                  <span className="text-xl text-zinc-500">h</span>
                </p>
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
                  Compute Time
                </p>
              </div>
            </div>
          </div>

          {/* Architecture Items - Coming Soon */}
          <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 flex-grow shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-orange-600/5 blur-[100px] pointer-events-none"></div>

            <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
              <Network className="w-5 h-5 text-orange-500" />
              Linked Architecture & Event Hooks
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center justify-between opacity-70 cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                    <Database className="w-5 h-5 text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-400">
                      DynamoDB State Sync
                    </p>
                    <p className="text-xs text-zinc-600 font-mono mt-0.5">
                      Database Integration
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded border border-zinc-700 bg-zinc-800/50 text-zinc-500 text-xs font-mono uppercase flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Coming Soon
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center justify-between opacity-70 cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                    <Activity className="w-5 h-5 text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-400">
                      AWS EventBridge Webhooks
                    </p>
                    <p className="text-xs text-zinc-600 font-mono mt-0.5">
                      Event Driven Pipeline
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded border border-zinc-700 bg-zinc-800/50 text-zinc-500 text-xs font-mono uppercase flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Coming Soon
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center justify-between opacity-70 cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                    <Cpu className="w-5 h-5 text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-400">
                      AWS Lambda Functions
                    </p>
                    <p className="text-xs text-zinc-600 font-mono mt-0.5">
                      Serverless Compute
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded border border-zinc-700 bg-zinc-800/50 text-zinc-500 text-xs font-mono uppercase flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Coming Soon
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
