import { Activity, Award, DollarSign, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useGetCallerUserProfile } from "../hooks/useQueries";

const portfolioData = [
  { day: "Mon", value: 1200 },
  { day: "Tue", value: 1380 },
  { day: "Wed", value: 1310 },
  { day: "Thu", value: 1590 },
  { day: "Fri", value: 1750 },
  { day: "Sat", value: 1820 },
  { day: "Sun", value: 2140 },
];

const ACTIVITY_FEED = [
  {
    id: 1,
    msg: "@alex earned $312.50 today via ETH arbitrage",
    time: "2s ago",
    color: "#2EE6A6",
  },
  {
    id: 2,
    msg: "New deposit of $5,000 USDT confirmed",
    time: "8s ago",
    color: "#25D6FF",
  },
  {
    id: 3,
    msg: "AI executed BTC/USDT arbitrage +2.1% profit",
    time: "15s ago",
    color: "#8B5CFF",
  },
  {
    id: 4,
    msg: "@maria_k invested $2,000 in Pro AI Plan",
    time: "22s ago",
    color: "#2EE6A6",
  },
  {
    id: 5,
    msg: "@james_w earned $88.20 from referral bonus",
    time: "35s ago",
    color: "#25D6FF",
  },
  {
    id: 6,
    msg: "AI executed ETH/BNB arbitrage +3.4% profit",
    time: "48s ago",
    color: "#8B5CFF",
  },
  {
    id: 7,
    msg: "New withdrawal of $1,500 approved",
    time: "1m ago",
    color: "#2EE6A6",
  },
  {
    id: 8,
    msg: "@crypto_hans joined via referral link",
    time: "2m ago",
    color: "#25D6FF",
  },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card-md px-3 py-2 text-xs">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-semibold neon-text-cyan">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { data: profile } = useGetCallerUserProfile();
  const baseBalance = profile ? Number(profile.balance) / 100 : 1450.78;
  const [displayBalance, setDisplayBalance] = useState(baseBalance);
  const feedRef = useRef<HTMLDivElement>(null);
  const [feedItems, setFeedItems] = useState(ACTIVITY_FEED);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setDisplayBalance(baseBalance);
  }, [baseBalance]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayBalance((prev) => prev + Math.random() * 0.12 + 0.01);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setFeedItems((prev) => {
        const source =
          ACTIVITY_FEED[Math.floor(Math.random() * ACTIVITY_FEED.length)];
        const newItem = {
          id: Date.now(),
          msg: source.msg,
          time: "just now",
          color: (["#2EE6A6", "#25D6FF", "#8B5CFF"] as const)[
            Math.floor(Math.random() * 3)
          ],
        };
        return [newItem, ...prev.slice(0, 6)];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const dailyEarnings = profile
    ? (Number(profile.totalEarnings) / 100) * 0.08
    : 84.2;
  const weeklyEarnings = dailyEarnings * 7;
  const activeInvestments = profile ? Number(profile.activeInvestments) : 3;

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Live AI Trading Overview
          </p>
        </div>
        <div className="flex items-center gap-2 glass-card px-3 py-1.5">
          <div className="pulse-dot" />
          <span className="text-xs font-medium" style={{ color: "#2EE6A6" }}>
            AI Engine: Active
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card-strong p-5 mb-4 neon-border-cyan"
        data-ocid="dashboard.card"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Total Balance
            </p>
            <p className="text-4xl font-bold gradient-text">
              $
              {displayBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="glass-card p-2 rounded-xl">
            <DollarSign className="w-5 h-5 neon-text-cyan" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <TrendingUp className="w-4 h-4" style={{ color: "#2EE6A6" }} />
          <span className="text-sm font-semibold" style={{ color: "#2EE6A6" }}>
            +${dailyEarnings.toFixed(2)} today
          </span>
          <span className="text-xs text-muted-foreground">
            (+8.4% daily ROI)
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          {
            label: "Daily Earnings",
            value: `$${dailyEarnings.toFixed(0)}`,
            icon: TrendingUp,
            ocid: "dashboard.daily_earnings.card",
          },
          {
            label: "Weekly Earnings",
            value: `$${weeklyEarnings.toFixed(0)}`,
            icon: Activity,
            ocid: "dashboard.weekly_earnings.card",
          },
          {
            label: "Active Inv.",
            value: activeInvestments.toString(),
            icon: Award,
            ocid: "dashboard.active_inv.card",
          },
        ].map(({ label, value, icon: Icon, ocid }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-3 text-center"
            data-ocid={ocid}
          >
            <Icon className="w-4 h-4 neon-text-cyan mx-auto mb-1" />
            <p className="text-base font-bold text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {label}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 mb-4"
        data-ocid="dashboard.chart.panel"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">
            Portfolio Growth
          </p>
          <span className="text-xs font-semibold" style={{ color: "#2EE6A6" }}>
            +78.3% ↑
          </span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart
            data={portfolioData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#25D6FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#25D6FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tick={{ fill: "#7E8AA3", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#7E8AA3", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#25D6FF"
              strokeWidth={2}
              fill="url(#portfolioGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4"
        data-ocid="dashboard.activity.panel"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">
            Live Activity Feed
          </p>
          <div className="flex items-center gap-1.5">
            <div className="pulse-dot" />
            <span className="text-xs" style={{ color: "#2EE6A6" }}>
              Live
            </span>
          </div>
        </div>
        <div ref={feedRef} className="space-y-2 overflow-hidden max-h-48">
          {feedItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-2"
            >
              <div
                className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                style={{ background: item.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">{item.msg}</p>
                <p className="text-[10px] text-muted-foreground">{item.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
