import { Globe, Loader2, Shield, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  const features = [
    {
      icon: Zap,
      label: "AI-Powered Arbitrage",
      desc: "Smart algorithms scan 50+ exchanges",
    },
    {
      icon: TrendingUp,
      label: "Consistent Returns",
      desc: "92–98% trade accuracy rate",
    },
    {
      icon: Shield,
      label: "Secure & Verified",
      desc: "Encrypted wallet mapping",
    },
    { icon: Globe, label: "Global Markets", desc: "24/7 automated trading" },
  ];

  return (
    <div className="min-h-screen aurora-bg flex flex-col items-center justify-center p-6">
      {/* Background glow orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #8B5CFF, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #25D6FF, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-4"
          >
            <img
              src="/assets/generated/qureai-logo-transparent.dim_120x120.png"
              alt="QureAi"
              className="w-20 h-20 drop-shadow-lg"
            />
          </motion.div>
          <h1 className="text-4xl font-bold gradient-text tracking-tight">
            QureAi
          </h1>
          <p className="text-muted-foreground mt-2 text-center text-sm">
            Next-Generation AI Arbitrage Trading Ecosystem
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {features.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card p-3"
            >
              <Icon className="w-5 h-5 neon-text-cyan mb-1" />
              <p className="text-xs font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <div className="glass-card p-4 mb-6">
          <div className="flex justify-between text-center">
            {[
              { val: "$2.4M+", lbl: "Total Volume" },
              { val: "12,480", lbl: "Active Users" },
              { val: "96.2%", lbl: "Accuracy" },
            ].map(({ val, lbl }) => (
              <div key={lbl}>
                <p className="text-lg font-bold neon-text-cyan">{val}</p>
                <p className="text-xs text-muted-foreground">{lbl}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Login button */}
        <motion.button
          data-ocid="login.primary_button"
          whileTap={{ scale: 0.97 }}
          onClick={() => login()}
          disabled={isLoggingIn}
          className="gradient-btn w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 shadow-neon-cyan"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Connecting...
            </>
          ) : (
            <>Get Started — It's Free</>
          )}
        </motion.button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Secured by Internet Identity · No personal data stored
        </p>
      </motion.div>
    </div>
  );
}
