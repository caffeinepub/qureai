import { useQueryClient } from "@tanstack/react-query";
import {
  Award,
  CheckCircle,
  Copy,
  Flame,
  type LucideIcon,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AchievementType } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetUserAchievements,
  useGetUserActivity,
  useGetUserReferrals,
} from "../hooks/useQueries";

const VIP_LEVELS = [
  { level: 1, label: "Bronze", color: "#CD7F32", minBalance: 0 },
  { level: 2, label: "Silver", color: "#C0C0C0", minBalance: 500 },
  { level: 3, label: "Gold", color: "#FFD700", minBalance: 2000 },
  { level: 4, label: "Platinum", color: "#25D6FF", minBalance: 10000 },
  { level: 5, label: "Diamond", color: "#8B5CFF", minBalance: 50000 },
];

const ACHIEVEMENT_META: Record<
  AchievementType,
  { icon: LucideIcon; label: string; color: string }
> = {
  [AchievementType.firstDeposit]: {
    icon: Zap,
    label: "First Deposit",
    color: "#25D6FF",
  },
  [AchievementType.firstInvestment]: {
    icon: TrendingUp,
    label: "First Investment",
    color: "#3C8CFF",
  },
  [AchievementType.referralStar]: {
    icon: Users,
    label: "Referral Star",
    color: "#2EE6A6",
  },
  [AchievementType.weekStreak]: {
    icon: Flame,
    label: "Week Streak",
    color: "#FF8C42",
  },
  [AchievementType.vipLevelUp]: {
    icon: Award,
    label: "VIP Level Up",
    color: "#8B5CFF",
  },
};

const TOP_AFFILIATES = [
  { rank: 1, name: "@crypto_king", earnings: "$4,280", referrals: 42 },
  { rank: 2, name: "@trading_pro", earnings: "$3,140", referrals: 31 },
  { rank: 3, name: "@ai_trader_x", earnings: "$2,860", referrals: 28 },
  { rank: 4, name: "@hodl_master", earnings: "$1,920", referrals: 19 },
  { rank: 5, name: "@defi_queen", earnings: "$1,550", referrals: 15 },
];

export default function ProfilePage() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: achievements } = useGetUserAchievements();
  const { data: activity } = useGetUserActivity();
  const { data: referrals } = useGetUserReferrals();
  const { identity, clear } = useInternetIdentity();
  const qc = useQueryClient();
  const [copiedRef, setCopiedRef] = useState(false);

  const principal = identity?.getPrincipal().toString() ?? "";
  const initials = principal.slice(0, 2).toUpperCase();
  const vipLevel = profile ? Number(profile.vipLevel) : 1;
  const vipInfo =
    VIP_LEVELS.find((v) => v.level === Math.min(vipLevel, 5)) ?? VIP_LEVELS[0];
  const streak = profile ? Number(profile.dailyStreak) : 0;
  const refCode = profile?.referralCode ?? "QURE000000";
  const refLink = `https://qureai.app/ref/${refCode}`;
  const totalEarnings = profile
    ? (Number(profile.totalEarnings) / 100).toFixed(2)
    : "0.00";

  const handleCopyRef = () => {
    navigator.clipboard.writeText(refLink);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
    toast.success("Referral link copied!");
  };

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  return (
    <div className="pb-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
        <p className="text-xs text-muted-foreground">Account & rewards</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-strong p-5 mb-4"
        data-ocid="profile.card"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #25D6FF30, #8B5CFF30)",
              border: `2px solid ${vipInfo.color}50`,
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-bold text-foreground truncate">
                {principal.slice(0, 12)}...
              </p>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{
                  background: `${vipInfo.color}20`,
                  color: vipInfo.color,
                }}
              >
                <Shield className="w-3 h-3" /> {vipInfo.label} VIP
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total Earned: ${totalEarnings}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 glass-card px-3 py-2 rounded-xl">
          <Flame className="w-4 h-4" style={{ color: "#FF8C42" }} />
          <span className="text-sm font-semibold text-foreground">
            {streak} Day Streak
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            Keep trading daily!
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-4"
        data-ocid="profile.referral.panel"
      >
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 neon-text-cyan" />
          <p className="text-sm font-semibold text-foreground">
            Referral Program
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="glass-card p-3 rounded-xl text-center">
            <p className="text-lg font-bold neon-text-cyan">
              {referrals?.length ?? 0}
            </p>
            <p className="text-[10px] text-muted-foreground">Referrals</p>
          </div>
          <div className="glass-card p-3 rounded-xl text-center">
            <p className="text-lg font-bold" style={{ color: "#2EE6A6" }}>
              ${((referrals?.length ?? 0) * 12.5).toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground">Commission</p>
          </div>
        </div>
        <div className="flex items-center gap-2 glass-card px-3 py-2.5 rounded-xl">
          <p className="flex-1 text-xs font-mono text-foreground truncate">
            {refLink}
          </p>
          <button
            type="button"
            data-ocid="profile.referral.copy.button"
            onClick={handleCopyRef}
            className="flex-shrink-0 p-1.5 rounded-lg glass-card"
          >
            {copiedRef ? (
              <CheckCircle className="w-4 h-4" style={{ color: "#2EE6A6" }} />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-4 mb-4"
        data-ocid="profile.achievements.panel"
      >
        <p className="text-sm font-semibold text-foreground mb-3">
          Achievements
        </p>
        <div className="grid grid-cols-5 gap-2">
          {(Object.keys(ACHIEVEMENT_META) as AchievementType[]).map((key) => {
            const meta = ACHIEVEMENT_META[key];
            const Icon = meta.icon;
            const unlocked = achievements?.some((a) => a.achievement === key);
            return (
              <div
                key={key}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl glass-card transition-all ${
                  unlocked ? "" : "opacity-40"
                }`}
                data-ocid={`profile.achievement.${key}.toggle`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: `${meta.color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: meta.color }} />
                </div>
                <p className="text-[9px] text-muted-foreground text-center leading-tight">
                  {meta.label}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 mb-4"
        data-ocid="profile.leaderboard.panel"
      >
        <p className="text-sm font-semibold text-foreground mb-3">
          Top Affiliates
        </p>
        <div className="space-y-2">
          {TOP_AFFILIATES.map(({ rank, name, earnings, referrals: refs }) => (
            <div
              key={rank}
              className="flex items-center gap-3 glass-card px-3 py-2 rounded-xl"
              data-ocid={`profile.leaderboard.item.${rank}`}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background:
                    rank === 1
                      ? "#FFD70020"
                      : rank === 2
                        ? "#C0C0C020"
                        : rank === 3
                          ? "#CD7F3220"
                          : "#ffffff10",
                  color:
                    rank === 1
                      ? "#FFD700"
                      : rank === 2
                        ? "#C0C0C0"
                        : rank === 3
                          ? "#CD7F32"
                          : "#7E8AA3",
                }}
              >
                {rank}
              </span>
              <p className="flex-1 text-sm text-foreground">{name}</p>
              <div className="text-right">
                <p
                  className="text-xs font-semibold"
                  style={{ color: "#2EE6A6" }}
                >
                  {earnings}
                </p>
                <p className="text-[10px] text-muted-foreground">{refs} refs</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {activity && activity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-4 mb-4"
          data-ocid="profile.activity.panel"
        >
          <p className="text-sm font-semibold text-foreground mb-3">
            Activity Log
          </p>
          <div className="space-y-2">
            {activity.slice(0, 5).map((act, idx) => (
              <div
                key={String(act.id)}
                className="flex items-start gap-2"
                data-ocid={`profile.activity.item.${idx + 1}`}
              >
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-neon-cyan flex-shrink-0" />
                <div>
                  <p className="text-xs text-foreground">{act.description}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(
                      Number(act.timestamp) / 1_000_000,
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <button
        type="button"
        data-ocid="profile.logout.button"
        onClick={handleLogout}
        className="w-full py-3 rounded-xl text-sm font-semibold text-destructive glass-card border border-destructive/20 transition-all hover:border-destructive/40"
      >
        Sign Out
      </button>
    </div>
  );
}
