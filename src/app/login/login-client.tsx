"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Droplet,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Building2,
  Boxes,
  CreditCard,
  Crown,
  Sparkles,
  RefreshCw,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { loginUser, quickLoginAs } from "@/actions/auth";
import { AuthUser } from "@/lib/auth-types";
import { useLanguage } from "@/context/language-context";

interface LoginClientProps {
  currentUser: AuthUser | null;
  availableUsers?: any[];
}

export function LoginClient({
  currentUser,
  availableUsers = [],
}: LoginClientProps) {
  const router = useRouter();
  const { t, language } = useLanguage();

  // Empty initial state - do NOT auto-fill credentials
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isPending, startTransition] = React.useTransition();
  const [selectedQuickUser, setSelectedQuickUser] = React.useState<
    string | null
  >(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await loginUser({ email, password });
      if (!res.success) {
        setError(
          "error" in res && res.error
            ? res.error
            : language === "bn"
              ? "লগইন ব্যর্থ হয়েছে। দয়া করে সঠিক তথ্য দিন।"
              : "Failed to authenticate.",
        );
      } else {
        window.location.href = "/";
      }
    });
  };

  const handleQuickLogin = (userId: string) => {
    setSelectedQuickUser(userId);
    setError(null);

    startTransition(async () => {
      try {
        await quickLoginAs(userId);
        window.location.href = "/";
      } catch (err: any) {
        setError(
          err?.message ||
            (language === "bn" ? "লগইন ব্যর্থ হয়েছে" : "Login failed"),
        );
      }
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Crown className="h-4 w-4 text-amber-500" />;
      case "AGENCY_MANAGER":
        return <Building2 className="h-4 w-4 text-blue-500" />;
      case "STOREKEEPER":
        return <Boxes className="h-4 w-4 text-orange-500" />;
      case "CASHIER":
        return <CreditCard className="h-4 w-4 text-emerald-500" />;
      default:
        return <UserCheck className="h-4 w-4 text-zinc-400" />;
    }
  };

  // Filter available users for Super Admin switcher
  const staffUsers = availableUsers.filter((u) => u.role !== "SUPER_ADMIN");

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      {/* LEFT: Credentials Login Card (6 cols) */}
      <div className="lg:col-span-6 bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col justify-between">
        <div className="space-y-6">
          {/* Logo, Header & Language Selector */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-red-600 to-rose-700 text-white shadow-md shadow-red-600/30">
                <Droplet className="h-6 w-6 fill-white" />
              </div>
              <div>
                <div className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                  LUBRI<span className="text-red-600">FLOW</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                    ERP
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {language === "bn"
                    ? "অনুমোদিত লুব্রিকেন্ট পরিবেশক পোর্টাল"
                    : "Multi-Dealership Access Portal"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {t.login.signInTitle}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {t.login.signInDesc}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleCredentialsLogin}
            className="space-y-4"
            autoComplete="on"
          >
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                {t.login.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.login.emailPlaceholder}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                {t.login.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.login.passwordPlaceholder}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending && !selectedQuickUser ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>{t.login.submitBtn}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: Security Panel or Persona Switcher (If Super Admin) (6 cols) */}
      <div className="lg:col-span-6 bg-zinc-50 dark:bg-zinc-900/60 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-6">
        {currentUser?.role === "SUPER_ADMIN" && staffUsers.length > 0 ? (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  {language === "bn"
                    ? "সুপার অ্যাডমিন ভূমিকা পরিবর্তন"
                    : "Super Admin Persona Switcher"}
                </h2>
              </div>
              <span className="self-start sm:self-auto text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800">
                Authorized
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              {language === "bn"
                ? "সুপার অ্যাডমিন হিসেবে আপনি যেকোনো কর্মীর ভূমিকায় স্যুইচ করে পারমিশন ও কার্যক্রম যাচাই করতে পারেন:"
                : "As Super Admin, you have exclusive privilege to switch into any dealership staff persona to verify permissions and workflows:"}
            </p>

            <div className="space-y-2.5">
              {staffUsers.map((user) => {
                const isSelected = selectedQuickUser === user.id;
                const isCurrent = currentUser?.id === user.id;
                const roleBadge =
                  t.roles[user.role as keyof typeof t.roles] || user.role;

                return (
                  <div
                    key={user.id}
                    onClick={() => handleQuickLogin(user.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? "border-red-500 bg-red-500/10"
                        : isCurrent
                          ? "border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/20 shadow-xs"
                          : "border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-700/60 shrink-0">
                          {getRoleIcon(user.role)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{user.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-mono shrink-0">
                                {language === "bn"
                                  ? "বর্তমান সেশন"
                                  : "Active Session"}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-0.5 truncate">
                            {roleBadge}
                          </div>
                        </div>
                      </div>

                      <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold shrink-0">
                        {roleBadge}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-zinc-500">
                      <span className="truncate">
                        {language === "bn" ? "এজেন্সি ক্ষেত্র:" : "Scope:"}{" "}
                        <strong className="text-zinc-700 dark:text-zinc-300">
                          {user.allowedAgencyIds.includes("*")
                            ? language === "bn"
                              ? "সকল এজেন্সি"
                              : "Cross-Agency"
                            : user.allowedAgencyIds.join(", ")}
                        </strong>
                      </span>
                      <span className="text-red-600 dark:text-red-400 font-semibold shrink-0">
                        {language === "bn"
                          ? "স্যুইচ করুন →"
                          : "Switch Persona →"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center h-full space-y-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {language === "bn"
                    ? "অনুমোদিত এন্টারপ্রাইজ অ্যাক্সেস"
                    : "Authorized Enterprise Access"}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {language === "bn"
                    ? "ভূমিকা-ভিত্তিক নিরাপত্তা ও অডিট ট্রেইল"
                    : "Role-Based Security & Audit Trail"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs space-y-1">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span>
                    {language === "bn"
                      ? "সুপার অ্যাডমিন প্রাথমিক সেটআপ"
                      : "Super Admin Initial Setup"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {language === "bn"
                    ? "সুপার অ্যাডমিন হিসেবে লগইন করে ডিলারশিপ এজেন্সি তৈরি করুন, ব্যাংক হিসাব যুক্ত করুন এবং কর্মীদের অ্যাক্সেস প্রদান করুন।"
                    : "Log in with your Super Admin credentials. Once authenticated, you can create dealership agencies, configure bank accounts, define inventory products, and invite staff."}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs space-y-1">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  <span>
                    {language === "bn"
                      ? "ডিলারশিপ ডেটা আইসোলেশন"
                      : "Dealership Data Isolation"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {language === "bn"
                    ? "প্রতিটি ডিলারশিপের ইনভেন্টরি ব্যাচ, বিক্রয় দর, ক্রেডিট সীমা এবং খাতার হিসাব সম্পূর্ণ পৃথক ও সুরক্ষিত থাকে।"
                    : "Each agency maintains strict boundaries over inventory batches, trade prices, credit limits, and customer ledgers."}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs space-y-1">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-500" />
                  <span>
                    {language === "bn"
                      ? "নিরাপদ ব্রাউজার অথেন্টিকেশন"
                      : "Browser Password Management"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {language === "bn"
                    ? "গুগল পাসওয়ার্ড ম্যানেজার এবং আধুনিক ব্রাউজারের অটোফিল নিরাপদে কাজ করার জন্য ক্ষেত্রগুলো প্রস্তুত রাখা হয়েছে।"
                    : "Login fields are left blank by default so Google Password Manager and modern browsers can securely store and autofill your credentials on demand."}
                </p>
              </div>
            </div>

            {currentUser && (
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2 text-xs">
                <div className="text-[11px] text-zinc-500 font-medium">
                  {language === "bn"
                    ? "বর্তমানে লগইন আছেন:"
                    : "Currently Authenticated As:"}
                </div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                  <span>{currentUser.name}</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 font-mono text-[10px]">
                    {t.roles[currentUser.role as keyof typeof t.roles] ||
                      currentUser.role}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  {currentUser.email}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <p className="text-[11px] leading-relaxed">
            <strong>
              {language === "bn" ? "নিরাপত্তা বিজ্ঞপ্তি:" : "Security Notice:"}
            </strong>{" "}
            {t.login.securityNote}
          </p>
        </div>
      </div>
    </div>
  );
}
