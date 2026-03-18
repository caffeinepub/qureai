import {
  LayoutDashboard,
  Package,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";

export type TabId = "dashboard" | "trade" | "invest" | "wallet" | "profile";

const tabs: { id: TabId; icon: typeof LayoutDashboard; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "trade", icon: TrendingUp, label: "Trade" },
  { id: "invest", icon: Package, label: "Invest" },
  { id: "wallet", icon: Wallet, label: "Wallet" },
  { id: "profile", icon: User, label: "Profile" },
];

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="tab-bar fixed bottom-0 left-0 right-0 flex items-center justify-around h-16 px-2 z-50">
      {tabs.map(({ id, icon: Icon, label }) => {
        const isActive = id === active;
        return (
          <button
            type="button"
            key={id}
            data-ocid={`nav.${id}.link`}
            onClick={() => onChange(id)}
            className="flex flex-col items-center gap-0.5 flex-1 py-2 transition-all duration-200"
          >
            <div
              className={`p-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20"
                  : ""
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive ? "text-neon-cyan" : "text-muted-foreground"
                }`}
              />
            </div>
            <span
              className={`text-[10px] font-medium transition-colors duration-200 ${
                isActive ? "text-neon-cyan" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
