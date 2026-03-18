import { ArrowDownCircle, ArrowUpCircle, Zap } from "lucide-react";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TradeType } from "../backend.d";
import { useGetRecentTrades } from "../hooks/useQueries";

const mockTrades = [
  {
    id: 1n,
    exchangePair: "ETH/USDT",
    tradeType: TradeType.buy,
    profitPercent: 21n,
    amount: 45000n,
    timestamp: BigInt(Date.now() - 30000),
  },
  {
    id: 2n,
    exchangePair: "BTC/USDT",
    tradeType: TradeType.sell,
    profitPercent: 34n,
    amount: 120000n,
    timestamp: BigInt(Date.now() - 90000),
  },
  {
    id: 3n,
    exchangePair: "BNB/ETH",
    tradeType: TradeType.buy,
    profitPercent: 18n,
    amount: 28000n,
    timestamp: BigInt(Date.now() - 180000),
  },
  {
    id: 4n,
    exchangePair: "SOL/USDT",
    tradeType: TradeType.buy,
    profitPercent: 42n,
    amount: 76000n,
    timestamp: BigInt(Date.now() - 300000),
  },
  {
    id: 5n,
    exchangePair: "ETH/BNB",
    tradeType: TradeType.sell,
    profitPercent: 27n,
    amount: 55000n,
    timestamp: BigInt(Date.now() - 480000),
  },
  {
    id: 6n,
    exchangePair: "ADA/USDT",
    tradeType: TradeType.buy,
    profitPercent: 15n,
    amount: 18000n,
    timestamp: BigInt(Date.now() - 720000),
  },
  {
    id: 7n,
    exchangePair: "DOT/USDT",
    tradeType: TradeType.buy,
    profitPercent: 31n,
    amount: 39000n,
    timestamp: BigInt(Date.now() - 1080000),
  },
];

const volumeData = [
  { hour: "00", volume: 320 },
  { hour: "04", volume: 180 },
  { hour: "08", volume: 540 },
  { hour: "12", volume: 890 },
  { hour: "16", volume: 1200 },
  { hour: "20", volume: 780 },
  { hour: "Now", volume: 1050 },
];

function timeAgo(ts: bigint) {
  const diff = Math.floor((Date.now() - Number(ts)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card-md px-3 py-2 text-xs">
        <p className="font-semibold neon-text-cyan">${payload[0].value}K vol</p>
      </div>
    );
  }
  return null;
};

export default function TradePage() {
  const { data: trades, isLoading } = useGetRecentTrades();
  const displayTrades = trades && trades.length > 0 ? trades : mockTrades;

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Live Trade Feed</h1>
          <p className="text-xs text-muted-foreground">
            Real-time AI arbitrage activity
          </p>
        </div>
        <div className="flex items-center gap-1.5 glass-card px-3 py-1.5">
          <div className="pulse-dot" />
          <span className="text-xs" style={{ color: "#2EE6A6" }}>
            Live
          </span>
        </div>
      </div>

      {/* AI Performance stats */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-4"
        data-ocid="trade.ai_stats.panel"
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 neon-text-cyan" />
          <p className="text-sm font-semibold text-foreground">
            AI Performance
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Daily ROI", value: "8.4%", color: "#2EE6A6" },
            { label: "Weekly ROI", value: "52%", color: "#25D6FF" },
            { label: "Accuracy", value: "96.2%", color: "#8B5CFF" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center glass-card py-3 rounded-xl">
              <p className="text-lg font-bold" style={{ color }}>
                {value}
              </p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Volume chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-4"
        data-ocid="trade.volume.panel"
      >
        <p className="text-sm font-semibold text-foreground mb-3">
          Trading Volume (24h)
        </p>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart
            data={volumeData}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="hour"
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
            <Bar
              dataKey="volume"
              fill="#25D6FF"
              fillOpacity={0.7}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Trade list */}
      <div className="glass-card p-4" data-ocid="trade.list">
        <p className="text-sm font-semibold text-foreground mb-3">
          Recent Trades
        </p>
        {isLoading ? (
          <div className="space-y-2" data-ocid="trade.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl glass-card animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {displayTrades.map((trade, idx) => {
              const isBuy = trade.tradeType === TradeType.buy;
              return (
                <motion.div
                  key={String(trade.id)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 glass-card px-3 py-2.5 rounded-xl"
                  data-ocid={`trade.item.${idx + 1}`}
                >
                  {isBuy ? (
                    <ArrowUpCircle
                      className="w-7 h-7 flex-shrink-0"
                      style={{ color: "#2EE6A6" }}
                    />
                  ) : (
                    <ArrowDownCircle
                      className="w-7 h-7 flex-shrink-0"
                      style={{ color: "#ff5c5c" }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {trade.exchangePair}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {isBuy ? "Buy" : "Sell"} · {timeAgo(trade.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#2EE6A6" }}
                    >
                      +{(Number(trade.profitPercent) / 10).toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      ${(Number(trade.amount) / 100).toFixed(0)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
