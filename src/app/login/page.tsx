"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/auth-context";
import { apiClient } from "../../lib/api-client";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const reasonParam = searchParams.get("reason");
  const modeParam = searchParams.get("mode");
  const { login, lang, setLang, isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [mode, setMode] = useState<"login" | "signup" | "forgot">(
    modeParam === "signup" ? "signup" : "login"
  );
  const [signupStep, setSignupStep] = useState<"details" | "otp">("details");
  const [signupOtp, setSignupOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Login form state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Sign up form state
  const [signupData, setSignupData] = useState({
    fullName: "",
    phone: "",
    email: "",
    organizationName: "",
    gstin: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const otpParam = (searchParams.get("otp") || "").replace(/\D/g, "").slice(0, 6);
    if (modeParam === "signup" || (otpParam && modeParam !== "forgot")) {
      setMode("signup");
      if (otpParam.length === 6) {
        setSignupStep("otp");
        setSignupOtp(otpParam);
      }
    } else if (modeParam === "forgot") {
      setMode("forgot");
      if (otpParam.length === 6) {
        setResetSent(true);
        setResetOtp(otpParam);
      }
    } else if (modeParam === "login") {
      setMode("login");
    }
  }, [modeParam, searchParams]);

  // If already logged in, redirect accordingly
  useEffect(() => {
    if (!authLoading && isAuthenticated && user && !reasonParam) {
      if (user.role === "SUPER_ADMIN") {
        const dest = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/superadmin";
        router.replace(dest);
      } else {
        const dest =
          redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("/superadmin")
            ? redirectParam
            : "/";
        router.replace(dest);
      }
    }
  }, [authLoading, isAuthenticated, user, router, redirectParam, reasonParam]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res: any = await apiClient.post("/auth/login", {
        identifier: identifier.trim(),
        password,
      });

      if (res?.accessToken) {
        await login({
          accessToken: res.accessToken,
          user: res.user,
          defaultContext: res.defaultContext,
        });

        if (res.user?.role === "SUPER_ADMIN") {
          const dest = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/superadmin";
          router.push(dest);
        } else {
          const dest =
            redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("/superadmin")
              ? redirectParam
              : "/";
          router.push(dest);
        }
      } else {
        setError(
          lang === "gu"
            ? "સર્વર તરફથી અમાન્ય પ્રતિસાદ મળ્યો."
            : "Invalid response from authentication server."
        );
      }
    } catch (err: any) {
      setError(
        lang === "gu" && err.messageGujarati
          ? err.messageGujarati
          : err.message || (lang === "gu" ? "લોગિન નિષ્ફળ ગયું. ઓળખપત્ર ચકાસો." : "Login failed. Please check your credentials.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const email = signupData.email.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setIsLoading(false);
      setError(lang === "gu" ? "નોંધણી માટે ઈમેલ જરૂરી છે." : "Email is required to register.");
      return;
    }

    try {
      if (signupStep === "details") {
        const otpRes: any = await apiClient.post("/auth/otp/send", {
          email,
          purpose: "REGISTER",
          phone: signupData.phone.trim(),
        });
        setSignupStep("otp");
        setDevOtp(otpRes?.devOtp || null);
        setSuccessMsg(
          otpRes?.delivered
            ? lang === "gu"
              ? "ચકાસણી કોડ ઈમેલ પર મોકલ્યો. કોડ દાખલ કરીને નોંધણી પૂર્ણ કરો."
              : "Verification code sent to your email. Enter it to finish registration."
            : lang === "gu"
              ? "ઈમેલ સર્વર ગોઠવેલું નથી. નીચેનો કોડ વાપરીને નોંધણી પૂર્ણ કરો."
              : "Email server not configured. Use the code shown below to finish registration."
        );
        return;
      }

      const res: any = await apiClient.post("/auth/register", {
        fullName: signupData.fullName.trim(),
        phone: signupData.phone.trim(),
        email,
        otp: signupOtp.trim(),
        organizationName: signupData.organizationName.trim(),
        gstin: signupData.gstin.trim() || undefined,
        password: signupData.password,
        preferredLang: lang,
        stateCode: "24",
      });

      if (res?.accessToken) {
        await login({
          accessToken: res.accessToken,
          user: res.user,
          defaultContext: res.defaultContext,
        });
        router.push("/");
      } else {
        setSuccessMsg(
          lang === "gu"
            ? "નોંધણી સફળ થઈ! કૃપા કરીને લોગિન કરો."
            : "Account created successfully! Please sign in."
        );
        setMode("login");
      }
    } catch (err: any) {
      setError(
        lang === "gu" && err.messageGujarati
          ? err.messageGujarati
          : err.message || (lang === "gu" ? "નોંધણી નિષ્ફળ ગઈ. કૃપા કરીને માહિતી તપાસો." : "Registration failed. Please check your details.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const otpRes: any = await apiClient.post("/auth/otp/send", {
        email: resetEmail.trim().toLowerCase(),
        purpose: "PASSWORD_RESET",
      });
      setResetSent(true);
      setDevOtp(otpRes?.devOtp || null);
      setSuccessMsg(
        otpRes?.delivered
          ? lang === "gu"
            ? "જો આ ઈમેલનું ખાતું હોય તો કોડ મોકલાયો છે."
            : "If an account exists for this email, a code has been sent."
          : otpRes?.devOtp
            ? lang === "gu"
              ? "ઈમેલ સર્વર ગોઠવેલું નથી. નીચેનો કોડ વાપરો."
              : "Email server is not configured. Use the code shown below."
            : lang === "gu"
              ? "જો આ ઈમેલનું ખાતું હોય તો કોડ મોકલાયો છે."
              : "If an account exists for this email, a code has been sent."
      );
    } catch (err: any) {
      setError(
        lang === "gu" && err.messageGujarati
          ? err.messageGujarati
          : err.message || (lang === "gu" ? "કોડ મોકલી શકાયો નથી." : "Could not send the code.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res: any = await apiClient.post("/auth/password/reset", {
        email: resetEmail.trim().toLowerCase(),
        otp: resetOtp.trim(),
        newPassword: resetPassword,
      });
      setMode("login");
      setResetSent(false);
      setResetOtp("");
      setResetPassword("");
      setDevOtp(null);
      setIdentifier(resetEmail.trim().toLowerCase());
      setPassword("");
      setSuccessMsg(
        lang === "gu" && res?.messageGujarati
          ? res.messageGujarati
          : res?.message || (lang === "gu" ? "પાસવર્ડ અપડેટ થયો." : "Password updated. Sign in with the new password.")
      );
    } catch (err: any) {
      setError(
        lang === "gu" && err.messageGujarati
          ? err.messageGujarati
          : err.message || (lang === "gu" ? "પાસવર્ડ રીસેટ નિષ્ફળ." : "Password reset failed.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Dedicated SuperAdmin auto-fill helper (Phone: 9999900000 / Password123#)
  const handleFillDemoSuperAdmin = () => {
    setMode("login");
    setIdentifier("9999900000");
    setPassword("Password123#");
    setError(null);
  };

  return (
    <div className="h-full min-h-[100dvh] w-full bg-[#F8FAFC] flex flex-col justify-center items-center p-4 relative overflow-y-auto selection:bg-blue-100 selection:text-[#1677E8]">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

      {/* Top Left Navigation Link */}
      <div className="absolute top-5 left-5 z-10">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{lang === "gu" ? "મુખ્ય પૃષ્ઠ" : "Main App"}</span>
        </button>
      </div>

      {/* Language Switcher in Top Right */}
      <div className="absolute top-5 right-5 z-10 flex items-center bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs">
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            lang === "en" ? "bg-blue-50 text-[#1677E8] font-bold" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLang("gu")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all font-gujarati cursor-pointer ${
            lang === "gu" ? "bg-blue-50 text-[#1677E8] font-bold" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          ગુજરાતી
        </button>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/90 p-6 sm:p-8 space-y-6 relative z-10 my-8 animate-fadeIn">
        {/* Official Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1677E8] text-white flex items-center justify-center shadow-md shadow-blue-500/25 mx-auto">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4a2 2 0 012-2h12a2 2 0 012 2v16l-7-3.5L4 20V4z" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              MyOwn BillBook
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#1677E8] text-[10px] font-bold uppercase tracking-wider mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1677E8]" />
              Super Admin Console
            </div>
          </div>

          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {lang === "gu"
              ? "પ્લેટફોર્મ મલ્ટી-ટેનન્ટ આર્કિટેક્ચર અને બિલિંગ મેનેજમેન્ટ"
              : "Sign in to access platform telemetry, multi-tenant fleet & billing controls."}
          </p>
        </div>

        {/* Tab Switcher: Sign In | Tenant Account */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === "login"
                ? "bg-white text-[#1677E8] font-bold shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {lang === "gu" ? "પ્રવેશ કરો (Sign In)" : "Sign In"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-white text-[#1677E8] font-bold shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {lang === "gu" ? "ટેનન્ટ રજીસ્ટ્રેશન" : "Tenant Registration"}
          </button>
        </div>

        {/* Session Expired Notice */}
        {reasonParam === "session_expired" && !error && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-center gap-2 animate-fadeIn">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-8V5a2 2 0 00-2-2H8a2 2 0 00-2 2v4m10 0H6m12 0v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9" />
            </svg>
            <span>
              {lang === "gu"
                ? "તમારું સત્ર સમાપ્ત થઈ ગયું છે. કૃપા કરીને ફરીથી લોગિન કરો."
                : "Your session has expired. Please sign in again."}
            </span>
          </div>
        )}

        {/* Success Notice */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2 animate-fadeIn">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2 animate-fadeIn">
            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {lang === "gu" ? "મોબાઇલ નંબર અથવા ઇમેઇલ *" : "Phone Number or Email *"}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={lang === "gu" ? "9999900000 અથવા email" : "9999900000 or email@domain.com"}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-[#1677E8] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  {lang === "gu" ? "પાસવર્ડ *" : "Password *"}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-[#1677E8] cursor-pointer transition-colors"
                >
                  {showPassword ? (lang === "gu" ? "છુપાવો" : "Hide") : (lang === "gu" ? "બતાવો" : "Show")}
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-[#1677E8] focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setResetSent(false);
                  setResetEmail(identifier.includes("@") ? identifier.trim() : "");
                  setError(null);
                  setSuccessMsg(null);
                  setDevOtp(null);
                }}
                className="text-[11px] font-semibold text-[#1677E8] hover:underline cursor-pointer"
              >
                {lang === "gu" ? "પાસવર્ડ ભૂલી ગયા?" : "Forgot password?"}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#1677E8] hover:bg-[#1268D3] active:bg-[#0D5FC4] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>{lang === "gu" ? "ચકાસી રહ્યું છે..." : "Signing in..."}</span>
                </>
              ) : (
                <span>{lang === "gu" ? "પ્રવેશ કરો (Sign In)" : "Sign In to SuperAdmin"}</span>
              )}
            </button>
          </form>
        ) : mode === "forgot" ? (
          <form onSubmit={resetSent ? handleResetPassword : handleSendResetOtp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === "gu" ? "ખાતાનો ઈમેલ *" : "Account Email *"}
              </label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="superadmin@myownbillbook.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-[#1677E8] outline-none transition-all"
              />
            </div>
            {resetSent && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === "gu" ? "ઈમેલ કોડ *" : "Email Code *"}
                  </label>
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono tracking-[0.3em] text-slate-900 focus:bg-white focus:border-[#1677E8] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === "gu" ? "નવો પાસવર્ડ *" : "New Password *"}
                  </label>
                  <input
                    type="password"
                    required
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-[#1677E8] outline-none transition-all font-mono"
                  />
                </div>
              </>
            )}

            {devOtp && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-[#1677E8] font-mono">
                Development OTP: <span className="font-bold">{devOtp}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="flex-1 py-2 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                {lang === "gu" ? "રદ કરો" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-3 text-xs font-bold text-white bg-[#1677E8] hover:bg-[#1268D3] rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? "Processing..." : resetSent ? (lang === "gu" ? "પાસવર્ડ બદલો" : "Reset Password") : (lang === "gu" ? "કોડ મોકલો" : "Send OTP")}
              </button>
            </div>
          </form>
        ) : (
          /* Sign Up Form for Tenant */
          <form onSubmit={handleRegister} className="space-y-3">
            {signupStep === "details" ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === "gu" ? "પૂરું નામ *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    placeholder="Jaydeep Khunt"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-[#1677E8] outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === "gu" ? "મોબાઇલ નંબર *" : "Phone *"}
                    </label>
                    <input
                      type="tel"
                      required
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      placeholder="9898000000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-[#1677E8] outline-none transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === "gu" ? "ઈમેલ *" : "Email *"}
                    </label>
                    <input
                      type="email"
                      required
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      placeholder="admin@domain.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-[#1677E8] outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === "gu" ? "વેપાર / પેઢીનું નામ *" : "Business / Org Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={signupData.organizationName}
                    onChange={(e) => setSignupData({ ...signupData, organizationName: e.target.value })}
                    placeholder="My Enterprise"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-[#1677E8] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === "gu" ? "પાસવર્ડ *" : "Password *"}
                  </label>
                  <input
                    type="password"
                    required
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-[#1677E8] outline-none transition-all font-mono"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === "gu" ? "ચકાસણી કોડ (OTP) *" : "Verification Code (OTP) *"}
                </label>
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  value={signupOtp}
                  onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono tracking-[0.3em] text-slate-900 focus:bg-white focus:border-[#1677E8] outline-none transition-all"
                />
              </div>
            )}

            {devOtp && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-[#1677E8] font-mono">
                Development OTP: <span className="font-bold">{devOtp}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#1677E8] hover:bg-[#1268D3] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Processing..." : signupStep === "details" ? "Send Verification Code" : "Complete Registration"}
            </button>
          </form>
        )}

        {/* Clean SuperAdmin Quick Access Bar (Demo Business User removed) */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>RLS Enforced</span>
          </div>

          <button
            type="button"
            onClick={handleFillDemoSuperAdmin}
            className="text-[11px] text-[#1677E8] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            title="Auto-fill SuperAdmin Credentials (9999900000 / Password123#)"
          >
            <span>Fill SuperAdmin Credentials</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1677E8] flex items-center justify-center text-white shadow-md animate-pulse">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4a2 2 0 012-2h12a2 2 0 012 2v16l-7-3.5L4 20V4z" />
            </svg>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
