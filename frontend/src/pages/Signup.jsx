import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Zap,
  Mail,
  Lock,
  User,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { api } from "../api/axios"; // 🔥 Import your dynamic Axios instance

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 State to show the success message instead of logging in
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 🔥 Swapped fetch for api.post
      await api.post("/api/v1/auth/register", {
        name,
        email,
        password,
      });

      // Axios throws an error automatically if response is not 2xx.
      // If the code reaches this line, the request was successful!
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      // 🔥 Extract the FastAPI error detail securely
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to request access.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-zinc-900 border border-zinc-800 rounded-2xl mb-6 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            NEW <span className="text-orange-500">OPERATOR</span>
          </h1>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
            Establish system credentials
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          {isSuccess ? (
            /* 🔥 SUCCESS SCREEN */
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                Clearance Requested
              </h2>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                Your credentials have been securely transmitted to the command
                center. An Administrator must approve your access before you can
                log in.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all uppercase tracking-wider text-sm"
              >
                Return to Login
              </button>
            </div>
          ) : (
            /* 🔥 SIGNUP FORM */
            <>
              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-mono text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <label className="block text-zinc-400 text-xs font-mono uppercase tracking-widest mb-2 ml-1">
                    Designation (Name)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-zinc-500" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono text-sm disabled:opacity-50"
                      placeholder="Agent Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-mono uppercase tracking-widest mb-2 ml-1">
                    Comm Link (Email)
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
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono text-sm disabled:opacity-50"
                      placeholder="agent@intelligence.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-mono uppercase tracking-widest mb-2 ml-1">
                    Security Key (Password)
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
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono text-sm disabled:opacity-50"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-4 bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />{" "}
                      Processing...
                    </>
                  ) : (
                    <>
                      Request Clearance <Zap className="w-4 h-4 fill-current" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {!isSuccess && (
          <p className="text-center mt-8 text-zinc-500 font-mono text-sm">
            Already cleared?{" "}
            <Link
              to="/login"
              className="text-orange-500 hover:text-orange-400 transition-colors underline decoration-orange-500/30 underline-offset-4"
            >
              Return to Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
