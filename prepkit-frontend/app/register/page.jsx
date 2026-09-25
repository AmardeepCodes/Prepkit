"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "../../components/Logo";
import { authApi } from "../../lib/api/client";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function handleChange(e) {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
  }
        async function handleSubmit(e) {
          e.preventDefault();
          setError("");
          if (form.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
          }
          setLoading(true);
          try {
            const data = await authApi.register(form.name, form.email, form.password);
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            router.push("/dashboard");
          } catch (err) {
            setError(err.message || "Could not create your account. Try again.");
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

      <main className="relative z-10 w-full min-h-screen flex flex-col justify-center pt-space-2xl pb-space-lg px-gutter-mobile md:px-gutter">
        <div className="relative w-full max-w-md mx-auto">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl shadow-primary/5 p-space-lg sm:p-space-xl transition-all duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center p-1 bg-surface-container-low shadow-sm">
                <Logo className="w-full h-full" />
              </div>
              <h1 className="font-headline-md text-headline-md text-on-surface mt-space-sm font-bold tracking-tight">
                Create your account
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-xs leading-relaxed">
                Start building interview kits from real job descriptions.
              </p>
            </div>

            <form className="flex flex-col gap-space-md mt-space-lg" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="name">
                  Full name
                </label>
                <input
                  className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_#4f46e5] transition-all"
                  id="name"
                  placeholder="Jane Doe"
                  required
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
                  Email
                </label>
                <input
                  className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_#4f46e5] transition-all"
                  id="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    className="w-full h-11 px-3.5 pr-10 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_#4f46e5] transition-all"
                    id="password"
                    placeholder="At least 8 characters"
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
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </form>

            <div className="mt-space-lg text-center">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Already have an account?{" "}
                <Link
                  className="font-label-lg text-label-lg text-primary-container hover:text-primary font-semibold transition-colors ml-1"
                  href="/login"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
