'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  Crown,
  UserCheck,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { changeUserPassword } from '@/actions/auth';
import { AuthUser } from '@/lib/auth-types';
import { useLanguage } from '@/context/language-context';

interface ChangePasswordClientProps {
  currentUser: AuthUser;
}

export function ChangePasswordClient({ currentUser }: ChangePasswordClientProps) {
  const { t, language } = useLanguage();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const isMatching = newPassword && confirmPassword && newPassword === confirmPassword;
  const isMismatch = confirmPassword && newPassword !== confirmPassword;
  const isMinLength = newPassword.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!newPassword) {
      setErrorMessage(t.passwordChange.minLength);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage(t.passwordChange.minLength);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(t.passwordChange.mismatch);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changeUserPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update password');
      } else {
        setSuccessMessage(
          language === 'bn'
            ? t.passwordChange.success
            : res.message || 'Password changed successfully!'
        );
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const localizedRole =
    t.roles[currentUser.role as keyof typeof t.roles] || currentUser.role;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      {/* Top Breadcrumb & Back Action */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'ড্যাশবোর্ডে ফিরে যান' : 'Back to Dashboard'}</span>
        </Link>

        <div className="text-[11px] font-mono text-zinc-500">
          <span>LUBRIFLOW</span>
          <span className="mx-1.5">•</span>
          <span>AUTH-SEC-2026</span>
        </div>
      </div>

      {/* Main Page Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left / Main Column: Password Change Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Header */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-xl space-y-6">
            <div className="flex items-start gap-3.5">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                  {t.passwordChange.title}
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {t.passwordChange.desc}
                </p>
              </div>
            </div>

            {/* User Profile Context Strip */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0">
                  {currentUser.role === 'SUPER_ADMIN' ? (
                    <Crown className="h-4 w-4 text-amber-500" />
                  ) : (
                    <UserCheck className="h-4 w-4 text-emerald-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {currentUser.name}
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500 truncate">
                    {currentUser.email}
                  </div>
                </div>
              </div>
              <span className="shrink-0 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                {localizedRole}
              </span>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="font-medium leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Success Message Alert */}
            {successMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>{language === 'bn' ? 'ড্যাশবোর্ডে যান' : 'Go to Dashboard'} →</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              {/* Current Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {t.passwordChange.currentPassword}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t.passwordChange.currentPasswordPlaceholder}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/60 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {t.passwordChange.newPassword}
                  </label>
                  {newPassword && (
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        isMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isMinLength ? t.passwordChange.strengthGood : t.passwordChange.strengthWeak}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t.passwordChange.newPasswordPlaceholder}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/60 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {t.passwordChange.confirmPassword}
                  </label>
                  {confirmPassword && (
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        isMatching
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isMatching ? t.passwordChange.matchValid : t.passwordChange.matchInvalid}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.passwordChange.confirmPasswordPlaceholder}
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-10 py-3 rounded-2xl border ${
                      isMismatch
                        ? 'border-rose-400 dark:border-rose-600'
                        : isMatching
                        ? 'border-emerald-400 dark:border-emerald-600'
                        : 'border-zinc-200 dark:border-zinc-800'
                    } bg-zinc-50/80 dark:bg-zinc-800/60 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
                <Link
                  href="/"
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-center cursor-pointer"
                >
                  {t.passwordChange.cancel}
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || !newPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t.passwordChange.submitting}</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>{t.passwordChange.submitBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Security Guidance & Information */}
        <div className="space-y-4">
          {/* Security Best Practices */}
          <div className="p-5 rounded-3xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>{language === 'bn' ? 'নিরাপত্তা নীতিমালা' : 'Security Guidelines'}</span>
            </div>
            <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>
                  {language === 'bn'
                    ? 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড ব্যবহার করুন।'
                    : 'Use a password with a minimum of 6 characters.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>
                  {language === 'bn'
                    ? 'সহজে অনুমানযোগ্য যেমন নাম বা জন্মতারিখ পরিহার করুন।'
                    : 'Avoid easily guessable passwords like names or birthdays.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>
                  {language === 'bn'
                    ? 'পাসওয়ার্ড পরিবর্তন সম্পন্ন হলে নতুন পাসওয়ার্ড সংরক্ষণ করুন।'
                    : 'Store your new password securely once changed.'}
                </span>
              </li>
            </ul>
          </div>

          {/* Cryptographic Standards */}
          <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>{language === 'bn' ? 'এন্টারপ্রাইজ এনক্রিপশন' : 'Enterprise Protection'}</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {language === 'bn'
                ? 'লুব্রিফ্লো ইআরপি-তে সকল পাসওয়ার্ড স্ট্যান্ডার্ড PBKDF2 ও সল্টিং প্রযুক্তিতে সম্পূর্ণ সুরক্ষিত থাকে।'
                : 'All passwords in LUBRIFLOW ERP are hashed using salted PBKDF2 with SHA-512.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
