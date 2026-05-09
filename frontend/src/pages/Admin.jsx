import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 🔥 Import Auth Context
import { api } from "../api/axios"; // 🔥 Import the dynamic Axios instance
import {
  ArrowLeft,
  Users,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Search,
  Shield,
  Cpu,
  Activity,
  Database,
  MoreVertical,
  Loader2,
} from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const { token, user } = useAuth(); // 🔥 Get the JWT token

  const [pendingUsers, setPendingUsers] = useState([]);

  // 🔥 FIXED: Start with an empty array instead of your hardcoded local user!
  const [activeUsers, setActiveUsers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // ==================================================
  // 🔥 Fetch Data on Load
  // ==================================================
  useEffect(() => {
    fetchPendingUsers();
    fetchActiveUsers(); // 🔥 ADDED: Trigger the directory fetch on load
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get("/api/v1/admin/pending-users", {
        headers: { Authorization: `Bearer ${token}` }, // Send JWT to prove you are Root Admin
      });
      setPendingUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch queue", err);
    }
  };

  // 🔥 ADDED: The function to fetch all approved users from the database
  const fetchActiveUsers = async () => {
    try {
      const response = await api.get("/api/v1/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch active users directory", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================================================
  // 🔥 Handle Approval
  // ==================================================
  const handleApprove = async (id) => {
    try {
      const response = await api.post(
        `/api/v1/admin/approve-user/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status === 200 || response.status === 201) {
        // Remove from pending UI
        setPendingUsers(pendingUsers.filter((u) => u.id !== id));
        // 🔥 Refresh the active users list so the newly approved person shows up instantly
        fetchActiveUsers();
      }
    } catch (err) {
      console.error("Failed to approve", err);
    }
  };

  const handleReject = (id) => {
    setPendingUsers(pendingUsers.filter((u) => u.id !== id));
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
            <Shield className="w-5 h-5 text-red-500" />
            ADMINISTRATOR <span className="text-zinc-500">CONSOLE</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 px-3 py-1.5 rounded-md border border-red-900/30 bg-red-500/10 text-red-500 text-sm font-mono">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          ROOT ACCESS GRANTED
        </div>
      </nav>

      <div className="flex-grow p-6 lg:p-10 max-w-[1400px] mx-auto w-full flex flex-col gap-8">
        {/* Top Row: System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Users className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">
                {activeUsers.length || 0}
              </p>
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
                Total Personnel
              </p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">
                {pendingUsers.length}
              </p>
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
                Pending Clearances
              </p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Activity className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-emerald-400">
                Stable
              </p>
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
                API Health
              </p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-orange-500/20 blur-[30px] rounded-full pointer-events-none"></div>
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <Cpu className="w-6 h-6 text-zinc-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-zinc-500">0</p>
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
                Agents Online
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Stack Layout */}
        <div className="flex flex-col gap-8">
          {/* Clearance Queue */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-inner">
            <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
              Clearance Queue
            </h3>

            {pendingUsers.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-zinc-500 font-mono text-sm uppercase">
                  No Pending Requests
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {pendingUsers.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-orange-500/30 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-white text-sm">
                            {request.name}
                          </p>
                          <p className="text-xs text-zinc-500 font-mono mt-0.5 truncate max-w-[200px]">
                            {request.email}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400 uppercase">
                          {request.date || "PENDING"}
                        </span>
                      </div>
                      <div className="mb-6">
                        <p className="text-xs text-zinc-400">
                          Requested:{" "}
                          <span className="text-orange-400 font-mono">
                            {request.requestedRole || request.role}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        <XCircle className="w-3 h-3" /> Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Master User Directory */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-white text-lg font-bold flex items-center gap-2">
                <Database className="w-5 h-5 text-orange-500" />
                Master User Directory
              </h3>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-zinc-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search operators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 text-sm font-mono"
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-900/80 text-zinc-500 font-mono uppercase text-xs tracking-widest border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Operator ID</th>
                    <th className="px-6 py-4 font-medium">Identity</th>
                    <th className="px-6 py-4 font-medium">Designation</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-zinc-500"
                      >
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                        Fetching Directory...
                      </td>
                    </tr>
                  ) : activeUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-zinc-500"
                      >
                        No active operators found.
                      </td>
                    </tr>
                  ) : (
                    activeUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-zinc-900/30 transition-colors group"
                      >
                        <td className="px-6 py-4 font-mono text-zinc-400">
                          {user.id}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-white">{user.name}</p>
                          <p className="text-xs text-zinc-500 font-mono mt-0.5">
                            {user.email}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-orange-400 font-mono text-xs">
                          {user.role}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider border ${
                              user.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}
                          >
                            {user.status || "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-zinc-500 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
