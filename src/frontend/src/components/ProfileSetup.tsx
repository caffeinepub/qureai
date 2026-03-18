import { Loader2, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

interface ProfileSetupProps {
  onComplete: () => void;
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [name, setName] = useState("");
  const { mutateAsync, isPending } = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const referralCode = `QURE${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await mutateAsync({
        referralCode,
        balance: 0n,
        vipLevel: 1n,
        activeInvestments: 0n,
        totalEarnings: 0n,
        dailyStreak: 1n,
        referredBy: undefined,
      });
      toast.success("Profile created! Welcome to QureAi.");
      onComplete();
    } catch {
      toast.error("Failed to create profile. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 aurora-bg flex items-center justify-center p-6 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card-strong w-full max-w-xs p-6"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full glass-card flex items-center justify-center mb-3 neon-border-cyan">
            <User className="w-8 h-8 neon-text-cyan" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Set Up Your Profile
          </h2>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Enter your name to get started with QureAi
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="display-name"
              className="text-xs text-muted-foreground mb-1 block"
            >
              Display Name
            </label>
            <input
              id="display-name"
              data-ocid="profile_setup.input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Trader"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors"
            />
          </div>
          <button
            data-ocid="profile_setup.submit_button"
            type="submit"
            disabled={isPending || !name.trim()}
            className="gradient-btn py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isPending ? "Creating..." : "Enter QureAi"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
