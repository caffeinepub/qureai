import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Achievement,
  Activity,
  Deposit,
  Investment,
  InvestmentPlan,
  Referral,
  Trade,
  UserProfile,
  Withdrawal,
} from "../backend.d";
import { AchievementType, Crypto, TradeType } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export type {
  UserProfile,
  InvestmentPlan,
  Trade,
  Investment,
  Deposit,
  Withdrawal,
  Achievement,
  Activity,
  Referral,
};
export { Crypto, TradeType, AchievementType };

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

export function useGetAllPlans() {
  const { actor, isFetching } = useActor();
  return useQuery<InvestmentPlan[]>({
    queryKey: ["allPlans"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPlans();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRecentTrades() {
  const { actor, isFetching } = useActor();
  return useQuery<Trade[]>({
    queryKey: ["recentTrades"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentTrades();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useGetUserDeposits() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Deposit[]>({
    queryKey: ["userDeposits"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserDeposits(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetUserWithdrawals() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Withdrawal[]>({
    queryKey: ["userWithdrawals"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserWithdrawals(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetUserInvestments() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Investment[]>({
    queryKey: ["userInvestments"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserInvestments(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetUserAchievements() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Achievement[]>({
    queryKey: ["userAchievements"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserAchievements(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetUserActivity() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Activity[]>({
    queryKey: ["userActivity"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserActivity(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetUserReferrals() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Referral[]>({
    queryKey: ["userReferrals"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserReferrals(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreateDeposit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      crypto,
      amount,
      walletAddress,
    }: {
      crypto: Crypto;
      amount: bigint;
      walletAddress: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createDeposit(crypto, amount, walletAddress);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userDeposits"] }),
  });
}

export function useCreateWithdrawal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      walletAddress,
      crypto,
    }: {
      amount: bigint;
      walletAddress: string;
      crypto: Crypto;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createWithdrawal(amount, walletAddress, crypto);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userWithdrawals"] }),
  });
}

export function useCreateInvestment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      planId,
      amount,
    }: { planId: bigint; amount: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createInvestment(planId, amount);
    },
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["userInvestments"] }),
        qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
      ]),
  });
}
