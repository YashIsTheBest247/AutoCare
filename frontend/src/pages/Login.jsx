import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api/client.js";
import { useAuth } from "../context/auth.jsx";

const FEATURES = [
  "Real-time vehicle health monitoring",
  "AI failure prediction & risk scoring",
  "Anomaly detection & instant alerts",
  "Live fleet map with risk pins",
  "Predictive maintenance scheduling",
  "Analytics, forecasting & email alerts",
];

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const phase = "split";

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

  const split = phase === "split";

  return (
    <div className="min-h-screen flex flex-col-reverse md:flex-row">
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-brand-light via-brand to-brand-dark transition-all duration-700
          ${split ? "md:w-1/2 md:h-auto md:min-h-screen" : "w-full min-h-screen"}`}
      >
        <video
          ref={videoRef}
          src="/intro.mp4"
          autoPlay
          muted
          playsInline
          loop={split}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className={`absolute inset-0 transition-all duration-700 ${split ? "bg-gradient-to-t from-brand-deep/90 via-brand-deep/55 to-black/30" : "bg-black/10"}`} />

        {split && (
          <div className="relative z-10 md:h-full flex flex-col justify-center p-6 sm:p-10 animate-fade-up">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow">AutoCare <span className="text-white/80">AI</span></p>
            <p className="text-sm text-white/85 mt-1">Predict problems before they happen.</p>

            <p className="text-[11px] uppercase tracking-widest text-white/70 mt-5 sm:mt-8 mb-2.5 sm:mb-3">Everything you get</p>
            <ul className="space-y-1.5 sm:space-y-2.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-white/95 text-[13px] sm:text-sm">
                  <span className="h-5 w-5 shrink-0 rounded-full bg-white/20 ring-1 ring-white/30 flex items-center justify-center">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => { setMode("register"); setError(""); }}
              className="mt-5 sm:mt-7 inline-flex w-fit items-center gap-2 bg-white text-brand-dark font-bold px-5 py-2.5 rounded-xl shadow-lg hover:bg-white/90 transition-colors"
            >
              Sign up for more
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {split && (
        <div className="md:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-paper">
          <div key={mode} className="w-full max-w-md animate-slide-in-right">
            <h1 className="text-2xl font-bold text-ink">{mode === "login" ? "Welcome back" : "Create account"}</h1>
            <p className="text-sm text-muted mb-6">
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
      )}
    </div>
  );
}
