"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  BookOpenCheck,
  Menu,
  X,
  Crown,
  Database,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { AuthUser } from "@/lib/auth-types";

interface MobileNavProps {
  activeUser?: AuthUser | null;
  onOpenMobileMenu?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  cartCount?: number;
}

export function MobileNav({
  activeUser = null,
  onOpenMobileMenu,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
  cartCount = 0,
}: MobileNavProps) {
  const pathname = usePathname();
  const { t, language } = useLanguage();

  const isSuperAdmin = activeUser
    ? activeUser.role === "SUPER_ADMIN" || activeUser.allowedAgencyIds.includes("*")
    : false;

  const isStorekeeper = activeUser?.role === "STOREKEEPER";
  const isCashier = activeUser?.role === "CASHIER";

  // Navigation items tailored to mobile quick-thumb ergonomics
  const navTabs = [
    {
      href: "/",
      label: language === "bn" ? "ড্যাশবোর্ড" : "Home",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      href: "/pos",
      label: language === "bn" ? "বিক্রয়/পিওএস" : "POS Bill",
      icon: ShoppingCart,
      active: pathname.startsWith("/pos"),
      badge: cartCount > 0 ? cartCount : undefined,
      hidden: isStorekeeper, // Storekeeper doesn't sell
    },
    {
      href: "/inventory",
      label: language === "bn" ? "ইনভেন্টরি" : "Stock",
      icon: Boxes,
      active: pathname.startsWith("/inventory"),
      hidden: isCashier, // Cashier primarily handles invoices & khata
    },
    {
      href: "/khata",
      label: language === "bn" ? "বাকি খাতা" : "Khata",
      icon: BookOpenCheck,
      active: pathname.startsWith("/khata"),
      hidden: isStorekeeper,
    },
  ].filter((item) => !item.hidden);

  const handleToggle = () => {
    if (onToggleMobileMenu) {
      onToggleMobileMenu();
    } else if (onOpenMobileMenu) {
      onOpenMobileMenu();
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] safe-area-bottom"
    >
      <div className="grid grid-cols-5 items-center h-16 px-1 max-w-lg mx-auto">
        {navTabs.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 relative group active:scale-95 touch-manipulation min-h-[48px] ${
                item.active
                  ? "text-red-600 dark:text-red-400 font-bold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  item.active
                    ? "bg-red-500/10 dark:bg-red-500/20 scale-105"
                    : "group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    item.active
                      ? "stroke-[2.4px] text-red-600 dark:text-red-400"
                      : "stroke-[1.8px]"
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold font-mono flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight leading-tight mt-0.5 truncate max-w-full">
                {item.label}
              </span>
              {item.active && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400" />
              )}
            </Link>
          );
        })}

        {/* 5th slot: More / Menu toggle button */}
        <button
          type="button"
          onClick={handleToggle}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 active:scale-95 touch-manipulation min-h-[48px] cursor-pointer relative group ${
            isMobileMenuOpen
              ? "text-red-600 dark:text-red-400 font-bold"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium"
          }`}
          aria-label={isMobileMenuOpen ? "Close Menu" : "Open More Menu"}
          aria-expanded={isMobileMenuOpen}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isMobileMenuOpen
                ? "bg-red-500/15 dark:bg-red-500/25 scale-105"
                : "group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800"
            }`}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 stroke-[2.4px] text-red-600 dark:text-red-400" />
            ) : (
              <Menu className="h-5 w-5 stroke-[1.8px]" />
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-tight mt-0.5 font-medium">
            {isMobileMenuOpen
              ? (language === "bn" ? "বন্ধ করুন" : "Close")
              : (language === "bn" ? "মেনু" : "Menu")}
          </span>
          {isMobileMenuOpen && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400" />
          )}
        </button>
      </div>
    </nav>
  );
}
