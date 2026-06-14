import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api/client.js";
import { useAuth } from "../context/auth.jsx";
import IntroVideo from "../components/IntroVideo.jsx";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem("introSeen"));

  const finishIntro = () => {
    sessionStorage.setItem("introSeen", "1");
    setShowIntro(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = mode === "login"
        ? await login(form.email, form.password)
        : await register(form.email, form.password, form.full_name);
      signIn(data.access_token, data.user);
      navigate("/");
    } catch (err) {
      const detail = err.response && err.response.data && err.response.data.detail;
      setError(detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (showIntro) {
    return <IntroVideo onFinish={finishIntro} />;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-brand-light via-brand to-brand-dark animate-fade-in">
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-white/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-brand-deep/50 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-2">
          <p className="text-2xl font-extrabold tracking-tight text-white">AutoCare <span className="text-white/80">AI</span></p>
          <p className="text-xs text-white/70 mt-1">Predictive Maintenance · Edge AI</p>
        </div>

        <div className="bg-card/95 backdrop-blur rounded-2xl shadow-glow ring-1 ring-white/10 p-7 mt-6">
          <h1 className="text-lg font-bold text-ink">{mode === "login" ? "Welcome back" : "Create account"}</h1>
          <p className="text-sm text-muted mb-5">
            {mode === "login" ? "Sign in to your fleet command center." : "Register a new operator account."}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="label">Full Name</label>
                <input className="input" value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Jane Operator" />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@fleet.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </div>
            {error && <p className="text-sm text-risk-high font-medium">{error}</p>}
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-muted">
            {mode === "login" ? (
              <>No account?{" "}
                <button onClick={() => { setMode("register"); setError(""); }} className="text-brand font-semibold hover:underline">Register</button>
              </>
            ) : (
              <>Have an account?{" "}
                <button onClick={() => { setMode("login"); setError(""); }} className="text-brand font-semibold hover:underline">Sign in</button>
              </>
            )}
          </div>

          {mode === "login" && (
            <div className="mt-4 panel p-3 text-xs text-muted text-center">
              Demo admin — <span className="font-semibold text-ink">admin@autocare.ai</span> / <span className="font-semibold text-ink">admin123</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
