import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Zap,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext"; // 🔥 Import the hook

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // 🔥 Get the login function from context

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 🔥 FastAPI OAuth2 expects Form Data, not JSON!
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Invalid credentials. Access denied.");
      }

      const data = await response.json();

      // 🔥 Send the data to your global state which handles localStorage & redirect
      login(data.user, data.access_token);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-zinc-900 border border-zinc-800 rounded-2xl mb-6 shadow-lg">
            <Zap className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            SYSTEM <span className="text-orange-500">LOGIN</span>
          </h1>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
            Authenticate to access terminal
          </p>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          {/* 🔥 Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-mono text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-zinc-400 text-xs font-mono uppercase tracking-widest mb-2 ml-1">
                Operator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-zinc-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono text-sm disabled:opacity-50"
                  placeholder="admin@intelligence.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs font-mono uppercase tracking-widest mb-2 ml-1">
                Access Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-zinc-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono text-sm disabled:opacity-50"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_15px_rgba(234,88,12,0.2)] hover:shadow-[0_0_25px_rgba(234,88,12,0.4)] disabled:shadow-none uppercase tracking-wider text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  Initialize Session <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-zinc-500 font-mono text-sm">
          No active clearance?{" "}
          <Link
            to="/signup"
            className="text-orange-500 hover:text-orange-400 transition-colors underline decoration-orange-500/30 underline-offset-4"
          >
            Request Access
          </Link>
        </p>
      </div>
    </div>
  );
}
