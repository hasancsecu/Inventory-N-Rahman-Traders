"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Droplet,
  Crown,
  UserCheck,
  ChevronDown,
  LogOut,
  Shield,
  KeyRound,
  Database,
  Menu,
  X,
  Building2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { AgencySwitcher } from "./agency-switcher";
import { ThemeToggle } from "./theme-toggle";
import { AgencySummary } from "@/actions/agency";
import { AuthUser, userHasPermission } from "@/lib/auth-types";
import { logoutUser } from "@/actions/auth";
import {
  getNavigationForUser,
  canUserSwitchRole,
  canUserAccessMasterData,
} from "@/lib/navigation";

interface DashboardHeaderProps {
  currentAgency: AgencySummary | null;
  agencies: AgencySummary[];
  activeUser?: AuthUser | null;
}

export function DashboardHeader({
  currentAgency,
  agencies,
  activeUser = null,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isSuperAdmin = activeUser
    ? activeUser.role === "SUPER_ADMIN" || activeUser.allowedAgencyIds.includes("*")
    : false;

  const accessibleAgencies = isSuperAdmin
    ? agencies
    : activeUser
      ? agencies.filter((a) => activeUser.allowedAgencyIds.includes(a.id))
      : [];

  const canManageUsers = activeUser
    ? isSuperAdmin || userHasPermission(activeUser, "admin:manage_users")
    : false;
  const canAccessMasterData = activeUser
    ? isSuperAdmin || canUserAccessMasterData(activeUser)
    : false;
  const canSwitchRole = activeUser ? canUserSwitchRole(activeUser) : false;

  const navItems = activeUser ? getNavigationForUser(activeUser) : [];

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-700 dark:text-amber-300 border-amber-300/60 dark:border-amber-700/60";
      case "AGENCY_MANAGER":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300/60 dark:border-blue-700/60";
      case "STOREKEEPER":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-300/60 dark:border-orange-700/60";
      case "CASHIER":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/60";
      default:
        return "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-xs transition-colors">
      {/* Main Header Bar */}
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Brand Identity + Dealership Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-600 to-red-600 text-white shadow-md shadow-red-600/25 ring-1 ring-white/20 group-hover:scale-105 transition-all">
              <Droplet className="h-5 w-5 fill-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
                  LUBRI
                  <span className="bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
                    FLOW
                  </span>
                </span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 leading-none">
                  ERP
                </span>
              </div>
              <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 hidden sm:block tracking-tight mt-0.5">
                Multi-Brand Distributorship
              </span>
            </div>
          </Link>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

          {/* Dealership Switcher (Desktop & Tablet) */}
          <div className="hidden sm:block">
            <AgencySwitcher
              currentAgency={currentAgency}
              agencies={accessibleAgencies}
            />
          </div>
        </div>

        {/* Center: Live FY & Active Scope Pulse Pill (Large Screens) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/70 dark:border-zinc-800/70 text-xs font-medium text-zinc-600 dark:text-zinc-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            FY 2026-27
          </span>
          <span className="text-zinc-400 dark:text-zinc-600">•</span>
          <span className="text-zinc-500 dark:text-zinc-400">Scope:</span>
          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
            {currentAgency?.code || "MULTI-AGENCY"}
          </span>
        </div>

        {/* Right: Controls & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile Dealership Scope Pill Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="sm:hidden flex items-center gap-1 px-2 py-1 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-100/90 dark:bg-zinc-900/90 text-[11px] font-bold font-mono text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors shrink-0"
            title="Open dealership drawer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="truncate max-w-[65px]">
              {currentAgency?.code || "ERP"}
            </span>
          </button>

          <ThemeToggle />

          {/* User Persona & Profile Pill (Desktop & Tablet) */}
          {activeUser ? (
            <div className="relative hidden sm:block" ref={userMenuRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer group"
                id="user-profile-menu-btn"
                aria-label="User profile and persona settings"
              >
                <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0">
                  {activeUser.role === "SUPER_ADMIN" ? (
                    <Crown className="h-4 w-4 text-amber-500" />
                  ) : (
                    <UserCheck className="h-4 w-4 text-emerald-500" />
                  )}
                </div>

                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[130px]">
                    {activeUser.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {activeUser.roleTitle || activeUser.role}
                  </span>
                </div>

                <span
                  className={`hidden lg:inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${getRoleBadgeStyle(
                    activeUser.role,
                  )}`}
                >
                  {activeUser.role}
                </span>

                <ChevronDown
                  className={`h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-transform ${
                    userDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Menu Popover */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-zinc-900 dark:text-zinc-100">
                  <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs truncate">
                        {activeUser.name}
                      </span>
                      {activeUser.role === "SUPER_ADMIN" && (
                        <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono truncate">
                      {activeUser.email}
                    </div>
                    <div className="pt-1 flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getRoleBadgeStyle(
                          activeUser.role,
                        )}`}
                      >
                        {activeUser.role}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        • {activeUser.roleTitle || "Authorized Staff"}
                      </span>
                    </div>
                  </div>

                  <div className="p-1 space-y-0.5 text-xs">
                    {/* Super Admin Master Data CRUD Hub */}
                    {canAccessMasterData && (
                      <Link
                        href="/admin/master-data"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Database className="h-4 w-4 text-amber-500" />
                          <span>Master Data CRUD Hub</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-mono">
                          ALL
                        </span>
                      </Link>
                    )}

                    {/* User & Role Governance */}
                    {canManageUsers && (
                      <Link
                        href="/admin/users"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                          <span>Role & User Governance</span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-400">
                          RBAC
                        </span>
                      </Link>
                    )}

                    {/* Role Switching: ONLY AVAILABLE FOR SUPER ADMIN */}
                    {canSwitchRole && (
                      <Link
                        href="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <KeyRound className="h-4 w-4 text-amber-500" />
                          <span>Switch Staff Persona</span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500">
                          Admin
                        </span>
                      </Link>
                    )}

                    <button
                      onClick={() => logoutUser()}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-medium cursor-pointer transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all cursor-pointer"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Toggle Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Secondary Clean Navigation Bar (Desktop & Tablet) */}
      <div className="hidden md:block border-t border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/60 dark:bg-zinc-900/40 backdrop-blur-md">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 py-1.5 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const isGold = item.badgeVariant === "gold";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    isActive
                      ? isGold
                        ? "bg-amber-500 text-zinc-950 font-bold shadow-sm shadow-amber-500/20"
                        : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                      : isGold
                        ? "text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/40"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isActive
                        ? isGold
                          ? "text-zinc-950"
                          : "text-white dark:text-zinc-900"
                        : isGold
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-zinc-400"
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        isActive
                          ? isGold
                            ? "bg-black/20 text-zinc-950 font-bold"
                            : "bg-white/20 dark:bg-black/20 text-white dark:text-zinc-900 font-bold"
                          : isGold
                            ? "bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold"
                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Backdrop & Drawer Navigation (Small Screens) */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 top-16 bg-black/60 backdrop-blur-xs z-30 md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative z-40 md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl p-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            {/* User Profile Card */}
            {activeUser ? (
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0">
                    {activeUser.role === "SUPER_ADMIN" ? (
                      <Crown className="h-5 w-5 text-amber-500" />
                    ) : (
                      <UserCheck className="h-5 w-5 text-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {activeUser.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 truncate">
                      <span
                        className={`px-1.5 py-0.2 rounded font-mono font-bold border ${getRoleBadgeStyle(
                          activeUser.role,
                        )}`}
                      >
                        {activeUser.role}
                      </span>
                      <span className="truncate font-mono">
                        {activeUser.email}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logoutUser();
                  }}
                  className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-between gap-3 font-bold text-xs shadow-md shadow-red-600/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className="h-4 w-4" />
                  <span>Sign In to Dealership</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/20">
                  Login →
                </span>
              </Link>
            )}

            {/* Dealership Switcher (Full Width in Mobile Drawer) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Active Dealership Scope
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <AgencySwitcher
                currentAgency={currentAgency}
                agencies={accessibleAgencies}
                isFullWidth={true}
              />
            </div>

            {/* Super Admin Quick Actions */}
            {canAccessMasterData && (
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-red-500/5 to-transparent border border-amber-400/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                    Admin Control Suite
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300">
                    Full CRUD
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/admin/master-data"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Database className="h-4 w-4 mx-auto text-amber-500 mb-1" />
                    <div className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                      Master Data
                    </div>
                    <div className="text-[9px] text-zinc-400">
                      Products, Agencies
                    </div>
                  </Link>
                  {canManageUsers && (
                    <Link
                      href="/admin/users"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2.5 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Shield className="h-4 w-4 mx-auto text-red-500 mb-1" />
                      <div className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                        Users & Roles
                      </div>
                      <div className="text-[9px] text-zinc-400">
                        RBAC Security
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Menu */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1">
                Operational Modules
              </span>
              <div className="space-y-1.5 pt-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  const isGold = item.badgeVariant === "gold";

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all min-h-[44px] ${
                        isActive
                          ? isGold
                            ? "bg-amber-500 text-zinc-950 font-bold shadow-md"
                            : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md"
                          : isGold
                            ? "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-400/40"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 ${
                            isActive
                              ? isGold
                                ? "text-zinc-950"
                                : "text-white dark:text-zinc-900"
                              : isGold
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-zinc-400"
                          }`}
                        />
                        <div>
                          <div>{item.label}</div>
                          {item.description && (
                            <div
                              className={`text-[10px] font-normal ${
                                isActive
                                  ? "opacity-80"
                                  : "text-zinc-500 dark:text-zinc-400"
                              }`}
                            >
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            isActive
                              ? "bg-black/20 dark:bg-white/20"
                              : isGold
                                ? "bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold"
                                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Staff Persona Switcher (If Super Admin) */}
            {canSwitchRole && (
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-400/30 transition-colors min-h-[44px]"
                >
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="h-4 w-4 text-amber-500" />
                    <span>Switch Staff Persona</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                    Super Admin
                  </span>
                </Link>
              </div>
            )}

            {/* Mobile Sign Out Button */}
            {activeUser && (
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logoutUser();
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-900/60 transition-colors cursor-pointer min-h-[44px]"
                >
                  <div className="flex items-center gap-2.5">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out of Dealership</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300">
                    Logout
                  </span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
}
