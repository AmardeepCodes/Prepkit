"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "../../components/Logo";
import { authApi } from "../../lib/api/client";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "", remember: true });

  function handleChange(e) {
    const { id, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [id]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.login(form.email, form.password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Could not log in. Check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-x-hidden min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
        <div className="w-[640px] h-[640px] rounded-full bg-surface-container-high/40 blur-[140px] -translate-y-12" />
      </div>

      <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-margin-mobile md:px-margin py-space-lg">
        <div className="flex items-center gap-space-sm">
          <Logo className="h-8 w-8" />
          <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
            PrepKit<span className="text-primary">AI</span>
          </span>
        </div>
      </div>

      <main className="relative z-10 w-full min-h-screen flex flex-col justify-between pt-space-2xl pb-space-lg px-gutter-mobile md:px-gutter">
        <div className="relative w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-space-xl px-gutter-mobile md:px-gutter">
          <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-[520px] h-[360px] bg-primary/10 rounded-full blur-[110px]" />
          <div className="pointer-events-none absolute bottom-4 left-1/4 w-[380px] h-[280px] bg-tertiary-fixed-dim/20 rounded-full blur-[130px]" />

          <div className="relative w-full max-w-md mx-auto">
            <div className="bg-surface-container-lowest rounded-2xl shadow-xl shadow-primary/5 p-space-lg sm:p-space-xl transition-all duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center p-1 bg-surface-container-low shadow-sm">
                  <Logo className="w-full h-full" />
                </div>
                <h1 className="font-headline-md text-headline-md text-on-surface mt-space-sm font-bold tracking-tight">
                  Welcome back
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-xs leading-relaxed">
                  Turn any job description into your personal, data-driven interview
                  prep kit.
                </p>
              </div>

              <form className="flex flex-col gap-space-md mt-space-lg" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-label-md text-label-md text-on-surface flex items-center justify-between"
                    htmlFor="email"
                  >
                    <span>Email</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant/60 text-[20px] pointer-events-none">
                      mail
                    </span>
                    <input
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_#4f46e5] transition-all"
                      id="email"
                      placeholder="you@example.com"
                      required
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant/60 text-[20px] pointer-events-none">
                      lock
                    </span>
                    <input
                      className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_#4f46e5] transition-all"
                      id="password"
                      placeholder="••••••••"
                      required
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                    />
                    <button
                      aria-label="Toggle password visibility"
                      className="absolute right-2.5 p-1 text-on-surface-variant/60 hover:text-on-surface transition-colors"
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      <span className="material-symbols-outlined text-[20px] block">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      checked={form.remember}
                      className="w-4 h-4 rounded text-primary-container accent-primary-container focus:ring-0 focus:outline-none cursor-pointer"
                      id="remember"
                      type="checkbox"
                      onChange={handleChange}
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant select-none">
                      Remember me for 30 days
                    </span>
                  </label>
                </div>

                {error && (
                  <p className="font-body-sm text-body-sm text-error" role="alert">
                    {error}
                  </p>
                )}

                <button
                  className="group relative w-full h-11 rounded-xl bg-primary-container hover:bg-secondary text-on-primary font-label-lg text-label-lg shadow-md hover:shadow-lg shadow-primary-container/20 flex items-center justify-center gap-space-xs transition-all duration-150 active:scale-[0.98] mt-1 disabled:opacity-70"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        progress_activity
                      </span>
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span>Log In</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-space-lg text-center">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Don&apos;t have an account?{" "}
                  <Link
                    className="font-label-lg text-label-lg text-primary-container hover:text-primary font-semibold transition-colors ml-1 inline-flex items-center gap-0.5"
                    href="/register"
                  >
                    Sign up
                    <span className="material-symbols-outlined text-[14px]">
                      north_east
                    </span>
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-space-md flex flex-col items-center gap-space-xs text-center">
              <div className="inline-flex items-center gap-1.5 text-on-surface-variant/80 font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[15px] text-tertiary">
                  lock
                </span>
                <span>Session-based authentication, hashed passwords</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="w-full max-w-7xl mx-auto pt-space-xl flex flex-col sm:flex-row items-center justify-between gap-space-sm text-on-surface-variant">
          <div className="font-label-sm text-label-sm text-on-surface-variant">
            © 2026 PrepKit AI. Built for the Trao assessment.
          </div>
        </footer>
      </main>
    </div>
  );
}
