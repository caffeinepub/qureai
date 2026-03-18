import { Check, Loader2, Lock, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateInvestment,
  useGetAllPlans,
  useGetUserInvestments,
} from "../hooks/useQueries";
import type { InvestmentPlan } from "../hooks/useQueries";

const mockPlans: InvestmentPlan[] = [
  {
    id: 1n,
    name: "Starter Plan",
    minAmount: 2000n,
    maxAmount: 50000n,
    dailyReturn: 80n,
    lockDays: 7n,
  },
  {
    id: 2n,
    name: "Advanced Plan",
    minAmount: 50000n,
    maxAmount: 200000n,
    dailyReturn: 120n,
    lockDays: 14n,
  },
  {
    id: 3n,
    name: "Pro AI Plan",
    minAmount: 200000n,
    maxAmount: 1000000n,
    dailyReturn: 200n,
    lockDays: 30n,
  },
];

const planConfig = [
  {
    glow: "neon-border-cyan",
    gradientFrom: "#25D6FF",
    features: [
      "Auto arbitrage scanning",
      "5 exchange pairs",
      "Daily profit reports",
      "Email notifications",
    ],
    badge: "STARTER",
    popular: false,
  },
  {
    glow: "neon-border-blue",
    gradientFrom: "#3C8CFF",
    features: [
      "Priority AI execution",
      "15 exchange pairs",
      "Real-time alerts",
      "24/7 support",
    ],
    badge: "ADVANCED",
    popular: true,
  },
  {
    glow: "neon-border-purple",
    gradientFrom: "#8B5CFF",
    features: [
      "Maximum optimization",
      "50+ exchange pairs",
      "Dedicated AI instance",
      "VIP support",
    ],
    badge: "PRO AI",
    popular: false,
  },
];

interface InvestModalProps {
  plan: InvestmentPlan;
  config: (typeof planConfig)[0];
  onClose: () => void;
}

function InvestModal({ plan, config: _config, onClose }: InvestModalProps) {
  const [amount, setAmount] = useState("");
  const { mutateAsync, isPending } = useCreateInvestment();
  const minUsd = Number(plan.minAmount) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const usd = Number.parseFloat(amount);
    if (Number.isNaN(usd) || usd < minUsd) {
      toast.error(`Minimum investment is $${minUsd}`);
      return;
    }
    try {
      await mutateAsync({
        planId: plan.id,
        amount: BigInt(Math.round(usd * 100)),
      });
      toast.success(
        `Investment of $${usd.toFixed(2)} in ${plan.name} confirmed!`,
      );
      onClose();
    } catch {
      toast.error("Investment failed. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-4"
      data-ocid="invest.modal"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-strong w-full max-w-sm p-6 mb-4"
      >
        <h3 className="text-lg font-bold text-foreground mb-1">
          Invest in {plan.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Daily ROI: {(Number(plan.dailyReturn) / 10).toFixed(1)}% · Lock:{" "}
          {String(plan.lockDays)} days
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="invest-amount"
              className="text-xs text-muted-foreground mb-1 block"
            >
              Amount (USD)
            </label>
            <input
              id="invest-amount"
              data-ocid="invest.amount.input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min $${minUsd}`}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors"
            />
          </div>
          <button
            data-ocid="invest.submit_button"
            type="submit"
            disabled={isPending}
            className="gradient-btn py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isPending ? "Processing..." : "Confirm Investment"}
          </button>
          <button
            data-ocid="invest.cancel_button"
            type="button"
            onClick={onClose}
            className="text-muted-foreground text-sm py-2"
          >
            Cancel
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function InvestPage() {
  const { data: plans, isLoading } = useGetAllPlans();
  const { data: investments } = useGetUserInvestments();
  const [selectedPlan, setSelectedPlan] = useState<{
    plan: InvestmentPlan;
    config: (typeof planConfig)[0];
  } | null>(null);

  const displayPlans = plans && plans.length > 0 ? plans : mockPlans;

  return (
    <div className="pb-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">
          Investment Packages
        </h1>
        <p className="text-xs text-muted-foreground">
          AI-powered arbitrage plans
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="invest.loading_state">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl glass-card animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {displayPlans.map((plan, idx) => {
            const cfg = planConfig[idx % planConfig.length];
            const dailyRoi = (Number(plan.dailyReturn) / 10).toFixed(1);
            const weeklyRoi = ((Number(plan.dailyReturn) * 7) / 10).toFixed(1);
            const minUsd = (Number(plan.minAmount) / 100).toFixed(0);
            const maxUsd = (Number(plan.maxAmount) / 100).toFixed(0);

            return (
              <motion.div
                key={String(plan.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`glass-card-strong p-5 relative overflow-hidden ${cfg.glow}`}
                data-ocid={`invest.plan.item.${idx + 1}`}
              >
                {cfg.popular && (
                  <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full gradient-btn">
                    POPULAR
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block"
                      style={{
                        background: `${cfg.gradientFrom}20`,
                        color: cfg.gradientFrom,
                      }}
                    >
                      {cfg.badge}
                    </span>
                    <h3 className="text-lg font-bold text-foreground">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      ${minUsd} – ${maxUsd}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-2xl font-bold"
                      style={{ color: cfg.gradientFrom }}
                    >
                      {dailyRoi}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      daily ROI
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="glass-card p-2 rounded-lg text-center">
                    <p className="text-xs font-semibold text-foreground">
                      {weeklyRoi}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Weekly ROI
                    </p>
                  </div>
                  <div className="glass-card p-2 rounded-lg text-center">
                    <p className="text-xs font-semibold text-foreground">
                      {String(plan.lockDays)} days
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Lock Period
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  {cfg.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Check
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: cfg.gradientFrom }}
                      />
                      <span className="text-xs text-muted-foreground">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock period: {String(plan.lockDays)} days</span>
                  <TrendingUp
                    className="w-3.5 h-3.5 ml-auto"
                    style={{ color: cfg.gradientFrom }}
                  />
                  <span style={{ color: cfg.gradientFrom }}>
                    Est.{" "}
                    {(
                      (Number(plan.dailyReturn) * Number(plan.lockDays)) /
                      10
                    ).toFixed(0)}
                    % total
                  </span>
                </div>

                <button
                  type="button"
                  data-ocid={`invest.plan.${idx + 1}.primary_button`}
                  onClick={() => setSelectedPlan({ plan, config: cfg })}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90"
                  style={{
                    background: `linear-gradient(135deg, ${cfg.gradientFrom}40, ${cfg.gradientFrom}20)`,
                    border: `1px solid ${cfg.gradientFrom}40`,
                    color: cfg.gradientFrom,
                  }}
                >
                  Invest Now
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {investments && investments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 mt-4"
          data-ocid="invest.active.panel"
        >
          <p className="text-sm font-semibold text-foreground mb-3">
            Active Investments
          </p>
          <div className="space-y-2">
            {investments
              .filter((i) => i.active)
              .map((inv, idx) => (
                <div
                  key={String(inv.id)}
                  className="flex items-center justify-between glass-card px-3 py-2.5 rounded-xl"
                  data-ocid={`invest.active.item.${idx + 1}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Plan #{String(inv.planId)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      ${(Number(inv.amount) / 100).toFixed(2)}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ background: "#2EE6A620", color: "#2EE6A6" }}
                  >
                    Active
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {selectedPlan && (
        <InvestModal
          plan={selectedPlan.plan}
          config={selectedPlan.config}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}
