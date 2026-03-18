import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface InvestmentPlan {
    id: bigint;
    maxAmount: Amount;
    minAmount: Amount;
    name: string;
    lockDays: bigint;
    dailyReturn: bigint;
}
export interface Trade {
    id: bigint;
    tradeType: TradeType;
    exchangePair: string;
    timestamp: Time;
    amount: Amount;
    profitPercent: bigint;
}
export interface Investment {
    id: bigint;
    startTime: Time;
    active: boolean;
    endTime: Time;
    planId: bigint;
    user: UserId;
    amount: Amount;
}
export type Amount = bigint;
export interface Achievement {
    id: bigint;
    user: UserId;
    achievement: AchievementType;
    timestamp: Time;
}
export type UserId = Principal;
export interface Activity {
    id: bigint;
    user: UserId;
    actionType: string;
    description: string;
    timestamp: Time;
}
export interface Withdrawal {
    id: bigint;
    status: WithdrawalStatus;
    user: UserId;
    walletAddress: string;
    crypto: Crypto;
    timestamp: Time;
    amount: Amount;
}
export interface Referral {
    referralCode: string;
    referrer: UserId;
    referredUser: UserId;
}
export interface Deposit {
    id: bigint;
    status: DepositStatus;
    user: UserId;
    walletAddress: string;
    crypto: Crypto;
    timestamp: Time;
    amount: Amount;
}
export interface UserProfile {
    referralCode: string;
    balance: Amount;
    vipLevel: bigint;
    activeInvestments: bigint;
    referredBy?: string;
    totalEarnings: Amount;
    dailyStreak: bigint;
}
export enum AchievementType {
    vipLevelUp = "vipLevelUp",
    referralStar = "referralStar",
    firstInvestment = "firstInvestment",
    firstDeposit = "firstDeposit",
    weekStreak = "weekStreak"
}
export enum Crypto {
    bnb = "bnb",
    eth = "eth",
    trx = "trx",
    usdt = "usdt"
}
export enum DepositStatus {
    pending = "pending",
    completed = "completed"
}
export enum TradeType {
    buy = "buy",
    sell = "sell"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WithdrawalStatus {
    pending = "pending",
    completed = "completed",
    approved = "approved"
}
export interface backendInterface {
    addTrade(exchangePair: string, tradeType: TradeType, profitPercent: bigint, amount: Amount): Promise<Trade>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    awardAchievement(achievement: AchievementType): Promise<Achievement>;
    createDeposit(crypto: Crypto, amount: Amount, walletAddress: string): Promise<Deposit>;
    createInvestment(planId: bigint, amount: Amount): Promise<Investment>;
    createWithdrawal(amount: Amount, walletAddress: string, crypto: Crypto): Promise<Withdrawal>;
    getAllPlans(): Promise<Array<InvestmentPlan>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getRecentTrades(): Promise<Array<Trade>>;
    getUserAchievements(user: UserId): Promise<Array<Achievement>>;
    getUserActivity(user: UserId): Promise<Array<Activity>>;
    getUserDeposits(user: UserId): Promise<Array<Deposit>>;
    getUserInvestments(user: UserId): Promise<Array<Investment>>;
    getUserProfile(user: UserId): Promise<UserProfile | null>;
    getUserReferrals(userId: UserId): Promise<Array<Referral>>;
    getUserWithdrawals(user: UserId): Promise<Array<Withdrawal>>;
    isCallerAdmin(): Promise<boolean>;
    logActivity(actionType: string, description: string): Promise<Activity>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateUserProfile(profile: UserProfile): Promise<void>;
}
