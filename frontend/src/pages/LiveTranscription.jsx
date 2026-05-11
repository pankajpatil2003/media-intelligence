import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Mic,
  Square,
  Clock,
  Activity,
  Server,
  Database,
  Download, // 🔥 1. Added Download Icon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ==================================================
// 🔥 Dynamic WebSocket URL Routing
// ==================================================
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const WS_BASE_URL = API_URL.replace(/^http/, "ws");

export default function LiveTranscription() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState("idle");
  const [latestText, setLatestText] = useState("");
  const [fullTranscript, setFullTranscript] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);

  const websocketRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const displayId = user?.id
    ? `OP-${user.id.slice(-6).toUpperCase()}`
    : "UNKNOWN";

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = () => {
    timerRef.current = setInterval(
      () => setRecordingTime((prev) => prev + 1),
      1000,
    );
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // ==================================================
  // 🔥 2. Handle Text File Download
  // ==================================================
  const handleDownload = () => {
    if (!fullTranscript) return;

    // Create a Blob containing the text data
    const blob = new Blob([fullTranscript], { type: "text/plain" });

    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);

    // Create an invisible anchor tag to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = `TRANSCRIPT_${sessionId || "SESSION"}.txt`;

    // Trigger download and clean up
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const startRecording = async () => {
    try {
      if (websocketRef.current?.readyState === WebSocket.OPEN) return;

      setLatestText("");
      setFullTranscript("");
      setRecordingTime(0);
      setStatus("connecting");

      const wsUrl = `${WS_BASE_URL}/api/v1/live-transcription/ws/transcribe?token=${token}`;
      const ws = new WebSocket(wsUrl);

      websocketRef.current = ws;

      ws.onopen = async () => {
        try {
          setStatus("connected");
          ws.send(JSON.stringify({ type: "session_start", user_id: user?.id }));

          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          streamRef.current = stream;

          const audioContext = new AudioContext({ sampleRate: 16000 });
          audioContextRef.current = audioContext;
          const source = audioContext.createMediaStreamSource(stream);
          const processor = audioContext.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (ws.readyState !== WebSocket.OPEN) return;
            const input = e.inputBuffer.getChannelData(0);
            ws.send(new Float32Array(input).buffer);
          };

          source.connect(processor);
          processor.connect(audioContext.destination);

          setStatus("recording");
          startTimer();
        } catch (err) {
          console.error(err);
          setStatus("error");
        }
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.session_id) setSessionId(data.session_id);
        if (data.status) setStatus(data.status);
        if (data.latest_text) setLatestText(data.latest_text);
        if (data.full_transcript) setFullTranscript(data.full_transcript);
      };

      ws.onerror = () => setStatus("error");
      ws.onclose = () => {
        stopTimer();
        setStatus("disconnected");
      };
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const stopRecording = () => {
    setStatus("stopping");
    stopTimer();
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({ type: "stop_session" }));
    }
    if (processorRef.current) processorRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    if (streamRef.current)
      streamRef.current.getTracks().forEach((track) => track.stop());

    setTimeout(() => {
      if (websocketRef.current) websocketRef.current.close();
    }, 500);
  };

  useEffect(() => {
    return () => {
      stopTimer();
      if (websocketRef.current) websocketRef.current.close();
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const isRecording = status === "recording" || status === "connecting";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-orange-500 selection:text-white">
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
            <Activity className="w-5 h-5 text-orange-500" />
            LIVE <span className="text-zinc-500">TRANSCRIPTION</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 text-sm font-mono">
          <div className="flex items-center gap-2 text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800">
            <Server className="w-4 h-4" /> {WS_BASE_URL}
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${isRecording ? "bg-orange-500/10 border-orange-500/50 text-orange-400 shadow-[0_0_10px_rgba(234,88,12,0.2)]" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}
          >
            {isRecording && (
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            )}
            {status.toUpperCase()}
          </div>
        </div>
      </nav>

      <div className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-1 flex flex-col gap-6">
          <div
            className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${isRecording ? "bg-zinc-900/80 border-orange-500/40 shadow-[0_0_30px_rgba(234,88,12,0.05)]" : "bg-zinc-900/40 border-zinc-800"}`}
          >
            {isRecording && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-[50px] rounded-full pointer-events-none"></div>
            )}

            <div className="mb-8">
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-1">
                Session Duration
              </p>
              <p
                className={`text-5xl font-light tracking-tight font-mono ${isRecording ? "text-white" : "text-zinc-600"}`}
              >
                {formatTime(recordingTime)}
              </p>
            </div>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={status === "connecting" || status === "stopping"}
              className={`w-full py-4 px-4 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 uppercase tracking-wider text-xs xl:text-sm
                ${
                  isRecording
                    ? "bg-zinc-950 text-red-500 hover:bg-zinc-900 border border-red-900/50 hover:border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    : "bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)]"
                } disabled:opacity-50`}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 fill-current flex-shrink-0" />
                  <span className="text-center">Terminate Stream</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 flex-shrink-0" />
                  <span className="text-center">Initialize Stream</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex-grow">
            <h3 className="text-zinc-400 text-xs font-mono uppercase tracking-widest mb-6 flex items-center gap-2">
              <Database className="w-4 h-4" /> System Metadata
            </h3>

            <div className="space-y-4 font-mono text-sm">
              <div>
                <p className="text-zinc-600 text-xs mb-1">USER_ID</p>
                <p className="text-zinc-300 truncate">{displayId}</p>
              </div>
              <div>
                <p className="text-zinc-600 text-xs mb-1">SESSION_ID</p>
                <p className="text-orange-400/80 truncate">
                  {sessionId || "NULL"}
                </p>
              </div>
              <div>
                <p className="text-zinc-600 text-xs mb-1">AUDIO_FORMAT</p>
                <p className="text-zinc-300">16kHz / Float32</p>
              </div>
              <div>
                <p className="text-zinc-600 text-xs mb-1">ENGINE</p>
                <p className="text-zinc-300">Faster Whisper (tiny)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
          <div
            className={`p-6 rounded-2xl border transition-all duration-500 flex items-center min-h-[120px]
            ${latestText ? "bg-orange-500/5 border-orange-500/30" : "bg-zinc-900/40 border-zinc-800"}`}
          >
            {latestText ? (
              <p className="text-2xl font-medium text-orange-400 leading-snug tracking-wide">
                "{latestText}"
              </p>
            ) : (
              <div className="flex items-center gap-3 text-zinc-600 font-mono text-sm uppercase tracking-widest">
                <Activity className="w-4 h-4 animate-pulse" /> Awaiting audio
                chunks...
              </div>
            )}
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col flex-grow overflow-hidden relative shadow-inner">
            <div className="bg-zinc-900/80 backdrop-blur-sm px-6 py-4 border-b border-zinc-800 flex justify-between items-center z-10 sticky top-0">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Master Transcript Log
              </span>

              {/* 🔥 3. Download Button Added to Header */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-zinc-600">
                  Auto-scrolling
                </span>
                <button
                  onClick={handleDownload}
                  disabled={!fullTranscript}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800/50 text-xs font-mono text-white rounded-md transition-colors border border-zinc-700"
                >
                  <Download className="w-3 h-3" /> Export .TXT
                </button>
              </div>
            </div>

            <div className="p-8 flex-grow overflow-y-auto">
              <p className="text-zinc-300 text-lg leading-loose font-mono whitespace-pre-wrap">
                {fullTranscript || (
                  <span className="text-zinc-700">
                    No data written to buffer yet. Initialize stream to begin
                    writing.
                  </span>
                )}
              </p>
              {isRecording && fullTranscript && (
                <span className="inline-block w-2.5 h-5 bg-orange-500 ml-2 animate-pulse align-middle"></span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
