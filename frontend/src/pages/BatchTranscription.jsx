import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/axios";
import {
  ArrowLeft,
  UploadCloud,
  FileAudio,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  Database,
  Clock,
  HardDrive,
  Type,
  Hash,
  RefreshCw,
  Server, // 🔥 Added for Task ID icon
} from "lucide-react";

// ==================================================
// 🔥 Helper Functions for Formatting Metadata
// ==================================================
const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const formatDuration = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
};

export default function BatchTranscription() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError("");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError("");
    setIsUploading(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await api.post(
        "/api/v1/transcription/upload-audio",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 🔥 We no longer need to calculate sizes here. The backend does it!
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "An error occurred during transcription.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.transcript) return;

    const blob = new Blob([result.transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    const safeName = result.filename.split(".")[0];
    a.href = url;
    a.download = `${safeName}_${result.task_id}.txt`; // Added Task ID to filename!

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Nav Bar */}
      <nav className="border-b border-zinc-800 bg-black px-6 py-4 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-zinc-500 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-6 w-[1px] bg-zinc-800"></div>
          <h1 className="text-xl font-bold tracking-wider flex items-center gap-3">
            <FileAudio className="w-5 h-5 text-orange-500" />
            BATCH <span className="text-zinc-500">PROCESSING</span>
          </h1>
        </div>
      </nav>

      <div className="flex-grow p-6 lg:p-10 max-w-[1200px] mx-auto w-full flex flex-col gap-8">
        {/* Upload Zone */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 shadow-inner">
          <h3 className="text-zinc-400 text-xs font-mono uppercase tracking-widest mb-6 flex items-center gap-2">
            <UploadCloud className="w-4 h-4" /> Audio Upload Interface
          </h3>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-mono text-red-400">{error}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full relative">
              <input
                type="file"
                accept="audio/*,video/mp4"
                onChange={handleFileChange}
                disabled={isUploading || result}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              />
              <div
                className={`w-full p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${selectedFile ? "border-orange-500/50 bg-orange-500/5" : "border-zinc-700 bg-zinc-950 hover:border-zinc-500"}`}
              >
                <FileAudio
                  className={`w-10 h-10 mb-4 ${selectedFile ? "text-orange-500" : "text-zinc-600"}`}
                />
                <p className="font-mono text-sm mb-1 text-center">
                  {selectedFile ? (
                    <span className="text-orange-400">{selectedFile.name}</span>
                  ) : (
                    "Drag & Drop audio file here, or click to browse"
                  )}
                </p>
                <p className="text-xs text-zinc-600 font-mono">
                  Supports MP3, WAV, M4A, OGG, MP4 (Max 25MB recommended)
                </p>
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || result}
              className="w-full md:w-auto px-8 py-8 h-full rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all uppercase tracking-wider text-sm
                disabled:bg-zinc-950 disabled:text-zinc-600 disabled:border disabled:border-zinc-800
                bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_20px_rgba(234,88,12,0.2)]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Database className="w-6 h-6" />
                  <span>Transcribe File</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Window */}
        {result && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col flex-grow shadow-inner overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none"></div>

            {/* Header */}
            <div className="bg-zinc-900/80 backdrop-blur-sm px-6 py-4 border-b border-zinc-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 z-10 sticky top-0">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-mono uppercase tracking-widest text-zinc-400">
                    Processed Transcript:{" "}
                    <span className="text-zinc-200">{result.filename}</span>
                  </span>
                </div>
                {/* 🔥 NEW TASK ID DISPLAY */}
                <div className="flex items-center gap-2 ml-8">
                  <Server className="w-3 h-3 text-zinc-500" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    ID: {result.task_id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-auto">
                <span className="hidden lg:inline-flex items-center px-4 py-2.5 bg-zinc-800 rounded-lg text-sm font-bold font-mono text-zinc-400 uppercase">
                  Language: {result.language}
                </span>

                <button
                  onClick={handleReset}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 bg-orange-500/10 hover:bg-orange-500/20 text-sm font-bold font-mono text-orange-500 rounded-lg transition-colors border border-orange-500/20"
                >
                  <RefreshCw className="w-4 h-4" /> New Job
                </button>

                <button
                  onClick={handleDownload}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 bg-zinc-800/50 hover:bg-zinc-700 text-sm font-bold font-mono text-white rounded-lg transition-colors border border-zinc-700"
                >
                  <Download className="w-4 h-4" /> Export .TXT
                </button>
              </div>
            </div>

            {/* METADATA DASHBOARD */}
            <div className="px-8 pt-8">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <Clock className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                      Duration
                    </span>
                  </div>
                  <p className="text-2xl font-mono text-white tracking-tight">
                    {formatDuration(result.duration)}
                  </p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <Hash className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                      Word Count
                    </span>
                  </div>
                  <p className="text-2xl font-mono text-white tracking-tight">
                    {result.wordCount.toLocaleString()}
                  </p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <FileAudio className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                      Format
                    </span>
                  </div>
                  <p className="text-2xl font-mono text-white tracking-tight">
                    {result.extension}
                  </p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <HardDrive className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                      Audio Size
                    </span>
                  </div>
                  <p className="text-xl font-mono text-white tracking-tight pt-1">
                    {formatBytes(result.audioSize)}
                  </p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <Type className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                      Text Size
                    </span>
                  </div>
                  <p className="text-xl font-mono text-white tracking-tight pt-1">
                    {formatBytes(result.textSize)}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Text Content */}
            <div className="px-8 pb-8 pt-6">
              <div className="p-6 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
                <p className="text-zinc-300 text-lg leading-loose font-mono whitespace-pre-wrap selection:bg-emerald-500/30">
                  {result.transcript}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
