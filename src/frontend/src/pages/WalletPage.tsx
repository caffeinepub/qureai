import { CheckCircle, Clock, Copy, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Crypto, DepositStatus, WithdrawalStatus } from "../backend.d";
import {
  useCreateDeposit,
  useCreateWithdrawal,
  useGetUserDeposits,
  useGetUserWithdrawals,
} from "../hooks/useQueries";

const WALLET_ADDRESSES: Record<Crypto, string> = {
  [Crypto.usdt]: "TQFZyExDqQQzNZXp3dRFgMRuhmcE2vdMsC",
  [Crypto.bnb]: "0x742d35Cc6634C0532925a3b8D4C9d5F0f9e2a7b",
  [Crypto.trx]: "TLsVKBt2CK5k7MEhw5FU2M5rp7HpY5J3Lx",
  [Crypto.eth]: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
};

const NETWORK_LABELS: Record<Crypto, string> = {
  [Crypto.usdt]: "TRC-20 Network",
  [Crypto.bnb]: "BEP-20 Network",
  [Crypto.trx]: "TRC-20 Network",
  [Crypto.eth]: "ERC-20 Network",
};

const CRYPTO_INFO = [
  { key: Crypto.usdt, label: "USDT", name: "Tether", color: "#26A17B" },
  { key: Crypto.bnb, label: "BNB", name: "BNB Chain", color: "#F3BA2F" },
  { key: Crypto.trx, label: "TRX", name: "TRON", color: "#FF0013" },
  { key: Crypto.eth, label: "ETH", name: "Ethereum", color: "#627EEA" },
];

function cryptoLabel(c: unknown): string {
  if (typeof c === "string") return c.toUpperCase();
  if (c && typeof c === "object")
    return Object.keys(c as object)[0]?.toUpperCase() ?? String(c);
  return String(c).toUpperCase();
}

function CryptoButton({
  info,
  selected,
  onClick,
}: { info: (typeof CRYPTO_INFO)[0]; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        selected ? "border" : "glass-card border border-transparent"
      }`}
      style={
        selected
          ? {
              borderColor: info.color,
              background: `${info.color}15`,
              color: info.color,
            }
          : {}
      }
      data-ocid={`wallet.crypto.${info.label.toLowerCase()}.toggle`}
    >
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
        style={{ background: `${info.color}30`, color: info.color }}
      >
        {info.label[0]}
      </span>
      {info.label}
    </button>
  );
}

function DepositTab() {
  const [selectedCrypto, setSelectedCrypto] = useState(Crypto.usdt);
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const { data: deposits } = useGetUserDeposits();
  const { mutateAsync, isPending } = useCreateDeposit();
  const address = WALLET_ADDRESSES[selectedCrypto];
  const cryptoInfo = CRYPTO_INFO.find((c) => c.key === selectedCrypto);
  const networkLabel = NETWORK_LABELS[selectedCrypto];
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}&bgcolor=ffffff&color=000000&margin=10`;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Address copied!");
  };

  const handleDeposit = async () => {
    const trimmed = amount.trim();
    if (!trimmed || Number.isNaN(Number(trimmed))) {
      toast.error("Please enter a valid amount");
      return;
    }
    const usd = Number.parseFloat(trimmed);
    if (usd < 20) {
      toast.error("Minimum deposit is $20");
      return;
    }
    try {
      await mutateAsync({
        crypto: selectedCrypto,
        amount: BigInt(Math.round(usd * 100)),
        walletAddress: address,
      });
      toast.success("Deposit request submitted!");
      setAmount("");
    } catch {
      toast.error("Deposit failed. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-muted-foreground mb-2">
          Select Cryptocurrency
        </p>
        <div className="flex gap-2 flex-wrap">
          {CRYPTO_INFO.map((info) => (
            <CryptoButton
              key={info.key}
              info={info}
              selected={selectedCrypto === info.key}
              onClick={() => setSelectedCrypto(info.key)}
            />
          ))}
        </div>
      </div>

      <div className="glass-card p-4 rounded-2xl flex flex-col items-center gap-3">
        {/* QR Code */}
        <div className="bg-white p-3 rounded-2xl shadow-lg">
          <img
            src={qrUrl}
            alt={`QR code for ${cryptoInfo?.label} address`}
            width={180}
            height={180}
            className="block"
          />
        </div>
        <p
          className="text-xs font-semibold"
          style={{ color: cryptoInfo?.color }}
        >
          {cryptoInfo?.label} · {networkLabel}
        </p>

        {/* Address */}
        <div className="w-full">
          <p className="text-xs text-muted-foreground mb-1">Deposit Address</p>
          <div className="flex items-center gap-2">
            <p className="flex-1 text-xs font-mono text-foreground break-all bg-white/5 border border-white/10 rounded-lg px-3 py-2">
              {address}
            </p>
            <button
              type="button"
              data-ocid="wallet.copy.button"
              onClick={handleCopy}
              className="flex-shrink-0 p-2 glass-card rounded-lg"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4" style={{ color: "#2EE6A6" }} />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Only send {cryptoInfo?.name} ({networkLabel}) to this address. Network
          confirmations required.
        </p>
      </div>

      <div>
        <label
          htmlFor="deposit-amount"
          className="text-xs text-muted-foreground mb-1 block"
        >
          Amount (USD) · Min $20
        </label>
        <input
          id="deposit-amount"
          data-ocid="wallet.deposit.input"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount in USD"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors"
        />
      </div>

      <button
        type="button"
        data-ocid="wallet.deposit.submit_button"
        onClick={handleDeposit}
        disabled={isPending}
        className="gradient-btn w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {isPending ? "Processing..." : "Submit Deposit"}
      </button>

      <div>
        <p className="text-sm font-semibold text-foreground mb-2">
          Deposit History
        </p>
        {deposits && deposits.length > 0 ? (
          <div className="space-y-2">
            {deposits.map((dep, idx) => (
              <div
                key={String(dep.id)}
                className="glass-card px-3 py-2.5 rounded-xl flex items-center justify-between"
                data-ocid={`wallet.deposit.item.${idx + 1}`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {cryptoLabel(dep.crypto)} · $
                    {(Number(dep.amount) / 100).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(
                      Number(dep.timestamp) / 1_000_000,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    dep.status === DepositStatus.completed
                      ? "text-green-400 bg-green-400/10"
                      : "text-yellow-400 bg-yellow-400/10"
                  }`}
                >
                  {dep.status === DepositStatus.completed
                    ? "Completed"
                    : "Pending"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="glass-card px-4 py-6 rounded-xl text-center"
            data-ocid="wallet.deposit.empty_state"
          >
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Your deposit history will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function WithdrawTab() {
  const [selectedCrypto, setSelectedCrypto] = useState(Crypto.usdt);
  const [amount, setAmount] = useState("");
  const [walletAddr, setWalletAddr] = useState("");
  const { data: withdrawals } = useGetUserWithdrawals();
  const { mutateAsync, isPending } = useCreateWithdrawal();

  const handleWithdraw = async () => {
    const trimmed = amount.trim();
    if (!trimmed || Number.isNaN(Number(trimmed))) {
      toast.error("Please enter a valid amount");
      return;
    }
    const usd = Number.parseFloat(trimmed);
    if (usd < 10) {
      toast.error("Minimum withdrawal is $10");
      return;
    }
    if (!walletAddr.trim()) {
      toast.error("Please enter a wallet address");
      return;
    }
    try {
      await mutateAsync({
        amount: BigInt(Math.round(usd * 100)),
        walletAddress: walletAddr,
        crypto: selectedCrypto,
      });
      toast.success("Withdrawal request submitted! Processing within 24h.");
      setAmount("");
      setWalletAddr("");
    } catch {
      toast.error("Withdrawal failed. Please try again.");
    }
  };

  const statusColor = (s: WithdrawalStatus) => {
    if (s === WithdrawalStatus.completed)
      return "text-green-400 bg-green-400/10";
    if (s === WithdrawalStatus.approved) return "text-blue-400 bg-blue-400/10";
    return "text-yellow-400 bg-yellow-400/10";
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-muted-foreground mb-2">Cryptocurrency</p>
        <div className="flex gap-2 flex-wrap">
          {CRYPTO_INFO.map((info) => (
            <CryptoButton
              key={info.key}
              info={info}
              selected={selectedCrypto === info.key}
              onClick={() => setSelectedCrypto(info.key)}
            />
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="withdraw-amount"
          className="text-xs text-muted-foreground mb-1 block"
        >
          Amount (USD) · Min $10
        </label>
        <input
          id="withdraw-amount"
          data-ocid="wallet.withdraw.input"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter withdrawal amount"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="withdraw-address"
          className="text-xs text-muted-foreground mb-1 block"
        >
          Wallet Address
        </label>
        <input
          id="withdraw-address"
          data-ocid="wallet.withdraw.address.input"
          type="text"
          value={walletAddr}
          onChange={(e) => setWalletAddr(e.target.value)}
          placeholder="Your crypto wallet address"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors"
        />
      </div>

      <div className="glass-card p-3 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            Withdrawals processed weekly · Min $10 · Smart verification
          </span>
        </div>
      </div>

      <button
        type="button"
        data-ocid="wallet.withdraw.submit_button"
        onClick={handleWithdraw}
        disabled={isPending}
        className="gradient-btn w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {isPending ? "Submitting..." : "Request Withdrawal"}
      </button>

      <div>
        <p className="text-sm font-semibold text-foreground mb-2">
          Withdrawal History
        </p>
        {withdrawals && withdrawals.length > 0 ? (
          <div className="space-y-2">
            {withdrawals.map((w, idx) => (
              <div
                key={String(w.id)}
                className="glass-card px-3 py-2.5 rounded-xl flex items-center justify-between"
                data-ocid={`wallet.withdraw.item.${idx + 1}`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {cryptoLabel(w.crypto)} · $
                    {(Number(w.amount) / 100).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(
                      Number(w.timestamp) / 1_000_000,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${statusColor(w.status)}`}
                >
                  {w.status === WithdrawalStatus.completed
                    ? "Completed"
                    : w.status === WithdrawalStatus.approved
                      ? "Approved"
                      : "Pending"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="glass-card px-4 py-6 rounded-xl text-center"
            data-ocid="wallet.withdraw.empty_state"
          >
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Your withdrawal history will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WalletPage() {
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");

  return (
    <div className="pb-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">Wallet</h1>
        <p className="text-xs text-muted-foreground">
          Deposit & withdraw funds
        </p>
      </div>

      <div className="glass-card p-1 flex gap-1 mb-6" data-ocid="wallet.tab">
        <button
          type="button"
          data-ocid="wallet.deposit.tab"
          onClick={() => setTab("deposit")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            tab === "deposit" ? "gradient-btn" : "text-muted-foreground"
          }`}
        >
          Deposit
        </button>
        <button
          type="button"
          data-ocid="wallet.withdraw.tab"
          onClick={() => setTab("withdraw")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            tab === "withdraw" ? "gradient-btn" : "text-muted-foreground"
          }`}
        >
          Withdraw
        </button>
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tab === "deposit" ? <DepositTab /> : <WithdrawTab />}
      </motion.div>
    </div>
  );
}
