"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { apiFetch } from "@/lib/api";
import {
  AssetAllocationCard,
  LiveTradingCard,
} from "@/components/dashboard/portfolio/DashboardCards";
import {
  FollowingSection,
  TradeCopiedSection,
} from "@/components/dashboard/portfolio/TradingSections";
import DepositModal from "@/components/dashboard/modals/DepositModal";
import WithdrawModal from "@/components/dashboard/modals/WithdrawModal";
import TransactionHistoryModal from "@/components/dashboard/modals/TransactionHistoryModal";
import Link from "next/link";

interface DashboardData {
  balance: number;
  availableBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalProfits: number;
  isVerified: boolean;
  firstName: string;
}

// ── Light palette (skeleton only — hero card itself is always dark) ──
const sg = {
  cardBg: "#fff",
  cardBorder: "1px solid rgba(0,0,0,0.07)",
  cardShadow: "0 28px 80px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.05)",
  heroBg: "#fff",
};

// ── Dark palette — scoptrade's blue brand accent ──
const dk = {
  cardBg: "#0d1b3e",
  cardBorder: "1px solid rgba(255,255,255,0.06)",
  cardShadow: "0 28px 80px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.35)",
  heroBg: "#0d1b3e",
  darkText: "#ffffff",
  mutedText: "rgba(255,255,255,0.45)",
  accentDark: "#3b82f6",
  pillBg: "rgba(59,130,246,0.1)",
  pillBorder: "rgba(59,130,246,0.25)",
};

export default function PortfolioPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    balance: 0,
    availableBalance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalProfits: 0,
    isVerified: false,
    firstName: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const p = isDark ? dk : sg;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      // Fetch user profile for balance info
      const profileRes = await apiFetch("/profile/");
      const profileData = await profileRes.json();

      if (profileData.success) {
        const user = profileData.user;
        setDashboardData((prev) => ({
          ...prev,
          balance: parseFloat(user.balance) || 0,
          availableBalance: parseFloat(user.balance) || 0,
          totalProfits: parseFloat(user.profit) || 0,
          isVerified: user.is_verified || false,
          firstName: user.first_name || "",
        }));
      }

      // Fetch transaction totals
      const [depositRes, withdrawalRes] = await Promise.all([
        apiFetch("/deposits/history/?limit=100"),
        apiFetch("/withdrawals/history/?limit=100"),
      ]);

      const depositData = await depositRes.json();
      const withdrawalData = await withdrawalRes.json();

      let totalDeposits = 0;
      let totalWithdrawals = 0;

      if (depositData.success) {
        totalDeposits = depositData.transactions
          .filter((t: { status: string }) => t.status === "completed")
          .reduce((sum: number, t: { amount: string }) => sum + parseFloat(t.amount), 0);
      }

      if (withdrawalData.success) {
        totalWithdrawals = withdrawalData.transactions
          .filter((t: { status: string }) => t.status === "completed")
          .reduce((sum: number, t: { amount: string }) => sum + parseFloat(t.amount), 0);
      }

      setDashboardData((prev) => ({
        ...prev,
        totalDeposits,
        totalWithdrawals,
      }));
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { balance, totalDeposits, totalWithdrawals, totalProfits, isVerified, firstName } =
    dashboardData;

  void totalWithdrawals;

  const totalBalance = balance + totalProfits;
  const isProfitPositive = totalProfits >= 0;
  const profitPercent = balance > 0 ? (totalProfits / balance) * 100 : 0;

  const fmt = (n: number) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Re-fetch when modals close (to update balance display)
  const handleDepositClose = () => {
    setShowDeposit(false);
    fetchDashboardData(true);
  };

  const handleWithdrawClose = () => {
    setShowWithdraw(false);
    fetchDashboardData(true);
  };

  const handleHistoryClose = () => {
    setShowHistory(false);
  };

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {getGreeting()}, {firstName || "Trader"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Here&apos;s an overview of your portfolio and trading activity
        </p>
      </motion.div>

      {/* ROW 1: Balance overview (2/3) + Right Sidebar (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* ══ SKELETON ══ */}
        {isLoading && (
          <div
            className="lg:col-span-2 rounded-[28px] overflow-hidden animate-pulse"
            style={{ background: p.cardBg, boxShadow: p.cardShadow, border: p.cardBorder }}
          >
            <div className="px-6 py-6" style={{ background: p.heroBg }}>
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1.5">
                  <div className="h-4 w-28 rounded-md bg-blue-300/30 dark:bg-blue-600/20" />
                  <div className="h-3 w-16 rounded-md bg-blue-300/20 dark:bg-blue-600/15" />
                </div>
                <div className="h-6 w-14 rounded-full bg-blue-300/30 dark:bg-blue-600/20" />
              </div>
              <div className="h-3 w-24 rounded bg-blue-300/20 dark:bg-blue-600/15 mb-2" />
              <div className="h-10 w-52 rounded-lg bg-blue-300/30 dark:bg-blue-600/25 mb-4" />
              <div className="h-4 w-60 rounded bg-blue-300/20 dark:bg-blue-600/15 mb-4" />
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                <div className="space-y-1.5">
                  <div className="h-2.5 w-10 rounded bg-blue-300/20 dark:bg-blue-600/15" />
                  <div className="h-4 w-24 rounded bg-blue-300/30 dark:bg-blue-600/20" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-2.5 w-14 rounded bg-blue-300/20 dark:bg-blue-600/15" />
                  <div className="h-4 w-24 rounded bg-blue-300/30 dark:bg-blue-600/20" />
                </div>
              </div>
            </div>
            <div className="h-[120px]" style={{ background: p.heroBg }} />
            <div className="grid grid-cols-4 gap-2 px-4 pb-5 pt-4" style={{ background: p.heroBg }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[62px] rounded-[14px] bg-blue-300/25 dark:bg-blue-600/15" />
              ))}
            </div>
          </div>
        )}

        {/* ══ REAL CONTENT ══ */}
        {!isLoading && (
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* ── Hero card — always dark regardless of theme ── */}
              <div
                className="overflow-hidden relative"
                style={{
                  borderRadius: 28,
                  background: "linear-gradient(135deg, #0a0f1e 0%, #0d1428 60%, #0f1830 100%)",
                  border: dk.cardBorder,
                }}
              >
                {/* Top-right spotlight */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: -15, right: -15,
                    width: 190, height: 150,
                    background: "radial-gradient(ellipse at center, rgba(59,130,246,0.2) 0%, transparent 70%)",
                    borderRadius: "50%",
                  }}
                />
                {/* Bottom-left spotlight */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    bottom: -15, left: -15,
                    width: 160, height: 125,
                    background: "radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 70%)",
                    borderRadius: "50%",
                  }}
                />
                <div className="relative px-5 pt-5 pb-5">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[15px] font-bold leading-none">
                        <span style={{ color: dk.darkText }}>Trade</span>
                        <span style={{ color: dk.accentDark }}>Scops</span>
                      </span>
                      {isVerified && (
                        <div
                          className="flex items-center gap-1 rounded-full px-2 py-0.5 w-fit"
                          style={{ background: "rgba(59,130,246,0.15)" }}
                        >
                          <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2 6L5 9L10 3"
                              stroke="#3b82f6"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="text-[10px] font-semibold" style={{ color: "#3b82f6" }}>
                            Verified
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
                      style={{ background: dk.pillBg, border: `1px solid ${dk.pillBorder}` }}
                    >
                      <span className="relative flex w-1.5 h-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3b82f6] opacity-75" />
                        <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                      </span>
                      <span className="text-[11px] font-semibold" style={{ color: dk.accentDark }}>
                        LIVE
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] mb-1.5" style={{ color: dk.mutedText }}>
                    Total Balance
                  </p>
                  <p
                    className="text-[32px] sm:text-[38px] font-bold font-mono leading-none mb-3"
                    style={{ color: dk.darkText, letterSpacing: "-0.5px" }}
                  >
                    {fmt(totalBalance)}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="text-[13px] font-bold"
                      style={{ color: isProfitPositive ? dk.accentDark : "#ef4444" }}
                    >
                      {isProfitPositive ? "↑" : "↓"} {fmt(Math.abs(totalProfits))}
                    </span>
                    <span className="text-[12px]" style={{ color: dk.mutedText }}>
                      {isProfitPositive ? "+" : ""}
                      {profitPercent.toFixed(2)}% today
                    </span>
                  </div>

                  {/* Profit / Deposited row */}
                  <div className="flex items-start gap-8 py-3 mb-1">
                    <div>
                      <p
                        className="text-[9px] font-bold uppercase tracking-wider mb-0.5"
                        style={{ color: dk.mutedText }}
                      >
                        Profit
                      </p>
                      <p
                        className="text-[13px] font-bold font-mono"
                        style={{ color: isProfitPositive ? dk.accentDark : "#ef4444" }}
                      >
                        {fmt(totalProfits)}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[9px] font-bold uppercase tracking-wider mb-0.5"
                        style={{ color: dk.mutedText }}
                      >
                        Deposited
                      </p>
                      <p className="text-[13px] font-bold font-mono" style={{ color: dk.darkText }}>
                        {fmt(balance)}
                      </p>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="-mx-5 relative" style={{ height: 60 }}>
                    <div className="absolute inset-0 -top-[17px] flex items-start justify-end px-5 z-10 pointer-events-none">
                      <div
                        className="pointer-events-auto rounded-lg px-2 py-0.5 text-[11px] font-semibold"
                        style={{
                          background: isProfitPositive ? dk.pillBg : "rgba(239,68,68,0.08)",
                          border: isProfitPositive
                            ? `1px solid ${dk.pillBorder}`
                            : "1px solid rgba(239,68,68,0.25)",
                          color: isProfitPositive ? dk.accentDark : "#ef4444",
                        }}
                      >
                        {isProfitPositive ? "+" : ""}
                        {profitPercent.toFixed(2)}%
                      </div>
                    </div>
                    <svg
                      viewBox="-20 -5 328 64"
                      preserveAspectRatio="none"
                      fill="none"
                      style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}
                    >
                      <defs>
                        <linearGradient
                          id="chartAreaFillScoptrade"
                          x1="288" y1="7"
                          x2="60" y2="59"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
                          <stop offset="45%" stopColor="#3b82f6" stopOpacity="0.05" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>

                        <filter id="chartLineGlowScoptrade" x="-5%" y="-120%" width="110%" height="340%">
                          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="outerBlur" />
                          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="innerBlur" />
                          <feMerge>
                            <feMergeNode in="outerBlur" />
                            <feMergeNode in="innerBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Area fill */}
                      <path
                        d="M0.0,48.6 L10.7,47.7 L21.3,49.0 L32.0,45.8 L42.7,46.4 L53.3,43.8 L64.0,44.9 L74.7,41.6 L85.3,42.7 L96.0,39.9 L106.7,40.8 L117.3,38.4 L128.0,39.5 L138.7,36.2 L149.3,36.9 L160.0,33.4 L170.7,34.7 L181.3,31.2 L192.0,29.5 L202.7,26.9 L213.3,27.6 L224.0,23.9 L234.7,22.2 L245.3,18.9 L256.0,17.4 L266.7,13.5 L277.3,11.8 L288.0,7.0 L288,59 L0,59 Z"
                        fill="url(#chartAreaFillScoptrade)"
                      />

                      {/* Glowing line */}
                      <path
                        d="M0.0,48.6 L10.7,47.7 L21.3,49.0 L32.0,45.8 L42.7,46.4 L53.3,43.8 L64.0,44.9 L74.7,41.6 L85.3,42.7 L96.0,39.9 L106.7,40.8 L117.3,38.4 L128.0,39.5 L138.7,36.2 L149.3,36.9 L160.0,33.4 L170.7,34.7 L181.3,31.2 L192.0,29.5 L202.7,26.9 L213.3,27.6 L224.0,23.9 L234.7,22.2 L245.3,18.9 L256.0,17.4 L266.7,13.5 L277.3,11.8 L288.0,7.0"
                        stroke="#3b82f6"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        filter="url(#chartLineGlowScoptrade)"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* ── Action buttons ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "8px",
                  padding: "20px 0 0",
                }}
              >
                <button
                  onClick={() => setShowDeposit(true)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "5px", padding: "12px 4px", borderRadius: "14px",
                    background: "rgb(37,99,235)", border: "none",
                    boxShadow: "rgba(37,99,235,0.27) 0px 4px 14px", cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "17px", color: "rgb(255,255,255)", lineHeight: 1 }}>↓</span>
                  <span style={{ fontSize: "9px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                    Deposit
                  </span>
                </button>
                <button
                  onClick={() => setShowWithdraw(true)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "5px", padding: "12px 4px", borderRadius: "14px",
                    background: "#ffffff", border: "none",
                    boxShadow: "rgba(0,0,0,0.07) 0px 2px 8px", cursor: "pointer",
                    colorScheme: "light",
                  }}
                >
                  <span style={{ fontSize: "17px", color: "rgb(51,51,51)", lineHeight: 1 }}>↑</span>
                  <span style={{ fontSize: "9px", fontWeight: 600, color: "rgb(136,136,136)" }}>
                    Withdraw
                  </span>
                </button>
                <Link
                  href="/transfer"
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "5px", padding: "12px 4px", borderRadius: "14px",
                    background: "#ffffff",
                    boxShadow: "rgba(0,0,0,0.07) 0px 2px 8px",
                    textDecoration: "none",
                    colorScheme: "light",
                  }}
                >
                  <span style={{ fontSize: "17px", color: "rgb(51,51,51)", lineHeight: 1 }}>⇄</span>
                  <span style={{ fontSize: "9px", fontWeight: 600, color: "rgb(136,136,136)" }}>
                    Transfer
                  </span>
                </Link>
                <button
                  onClick={() => setShowHistory(true)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "5px", padding: "12px 4px", borderRadius: "14px",
                    background: "#ffffff", border: "none",
                    boxShadow: "rgba(0,0,0,0.07) 0px 2px 8px", cursor: "pointer",
                    colorScheme: "light",
                  }}
                >
                  <span style={{ fontSize: "17px", color: "rgb(51,51,51)", lineHeight: 1 }}>◷</span>
                  <span style={{ fontSize: "9px", fontWeight: 600, color: "rgb(136,136,136)" }}>
                    History
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <LiveTradingCard />
          <AssetAllocationCard
            balance={dashboardData.balance}
            totalDeposits={dashboardData.totalDeposits}
            totalWithdrawals={dashboardData.totalWithdrawals}
            totalProfits={dashboardData.totalProfits}
          />
        </div>
      </div>

      {/* ROW 2: Trade Copied (2/3) + Following (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TradeCopiedSection />
        </div>
        <div>
          <FollowingSection />
        </div>
      </div>

      {/* Modals */}
      <DepositModal isOpen={showDeposit} onClose={handleDepositClose} />
      <WithdrawModal isOpen={showWithdraw} onClose={handleWithdrawClose} />
      <TransactionHistoryModal isOpen={showHistory} onClose={handleHistoryClose} />
    </div>
  );
}
