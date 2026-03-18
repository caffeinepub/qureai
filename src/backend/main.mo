import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var investmentIdCounter = 0;
  var depositIdCounter = 0;
  var withdrawalIdCounter = 0;
  var tradeIdCounter = 0;
  var achievementIdCounter = 0;
  var activityIdCounter = 0;

  type UserId = Principal;
  type Amount = Nat; // USDC Cents

  type Crypto = {
    #usdt;
    #bnb;
    #trx;
    #eth;
  };

  type InvestmentPlan = {
    id : Nat;
    name : Text;
    minAmount : Amount;
    maxAmount : Amount;
    dailyReturn : Nat;
    lockDays : Nat;
  };

  type Investment = {
    id : Nat;
    user : UserId;
    planId : Nat;
    amount : Amount;
    startTime : Time.Time;
    endTime : Time.Time;
    active : Bool;
  };

  type DepositStatus = {
    #pending;
    #completed;
  };

  type Deposit = {
    id : Nat;
    user : UserId;
    crypto : Crypto;
    amount : Amount;
    status : DepositStatus;
    walletAddress : Text;
    timestamp : Time.Time;
  };

  type WithdrawalStatus = {
    #pending;
    #approved;
    #completed;
  };

  type Withdrawal = {
    id : Nat;
    user : UserId;
    amount : Amount;
    walletAddress : Text;
    crypto : Crypto;
    status : WithdrawalStatus;
    timestamp : Time.Time;
  };

  type TradeType = {
    #buy;
    #sell;
  };

  type Trade = {
    id : Nat;
    exchangePair : Text;
    tradeType : TradeType;
    profitPercent : Nat;
    amount : Amount;
    timestamp : Time.Time;
  };

  type Activity = {
    id : Nat;
    user : UserId;
    actionType : Text;
    description : Text;
    timestamp : Time.Time;
  };

  type AchievementType = {
    #firstDeposit;
    #firstInvestment;
    #referralStar;
    #weekStreak;
    #vipLevelUp;
  };

  type Achievement = {
    id : Nat;
    user : UserId;
    achievement : AchievementType;
    timestamp : Time.Time;
  };

  type UserProfile = {
    balance : Amount;
    totalEarnings : Amount;
    activeInvestments : Nat;
    vipLevel : Nat;
    dailyStreak : Nat;
    referralCode : Text;
    referredBy : ?Text;
  };

  type Referral = {
    referrer : UserId;
    referralCode : Text;
    referredUser : UserId;
  };

  module Referral {
    public func compare(a : Referral, b : Referral) : Order.Order {
      Text.compare(a.referralCode, b.referralCode);
    };
  };

  let userProfiles = Map.empty<UserId, UserProfile>();
  let investments = Map.empty<UserId, List.List<Investment>>();
  let deposits = Map.empty<UserId, List.List<Deposit>>();
  let withdrawals = Map.empty<UserId, List.List<Withdrawal>>();
  let referralCodeToActor = Map.empty<Text, Principal>();
  let referrals = Map.empty<UserId, List.List<Referral>>();
  let trades = Map.empty<UserId, List.List<Trade>>();
  let activities = Map.empty<UserId, List.List<Activity>>();
  let achievements = Map.empty<UserId, List.List<Achievement>>();
  let investmentPlans = Map.empty<Nat, InvestmentPlan>();

  let starterPlan : InvestmentPlan = {
    id = 1;
    name = "Starter";
    minAmount = 2000;
    maxAmount = 49900;
    dailyReturn = 5;
    lockDays = 7;
  };

  let advancedPlan : InvestmentPlan = {
    id = 2;
    name = "Advanced";
    minAmount = 50000;
    maxAmount = 499900;
    dailyReturn = 10;
    lockDays = 14;
  };

  let proAiPlan : InvestmentPlan = {
    id = 3;
    name = "Pro AI";
    minAmount = 500000;
    maxAmount = 10000000;
    dailyReturn = 18;
    lockDays = 30;
  };

  investmentPlans.add(1, starterPlan);
  investmentPlans.add(2, advancedPlan);
  investmentPlans.add(3, proAiPlan);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : UserId) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func updateUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createInvestment(planId : Nat, amount : Amount) : async Investment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create investments");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        switch (investmentPlans.get(planId)) {
          case (null) { Runtime.trap("Invalid plan") };
          case (?plan) {
            if (amount < plan.minAmount or amount > plan.maxAmount) {
              Runtime.trap("Amount not within plan limits");
            };

            investmentIdCounter += 1;
            let investment : Investment = {
              id = investmentIdCounter;
              user = caller;
              planId;
              amount;
              startTime = Time.now();
              endTime = Time.now() + (plan.lockDays * 24 * 3600 * 1000000000);
              active = true;
            };

            let userInvestments = switch (investments.get(caller)) {
              case (null) {
                let newList = List.empty<Investment>();
                newList.add(investment);
                newList;
              };
              case (?existingInvestments) {
                let newInvestments = existingInvestments.clone();
                newInvestments.add(investment);
                newInvestments;
              };
            };

            investments.add(caller, userInvestments);
            investment;
          };
        };
      };
    };
  };

  public query ({ caller }) func getUserInvestments(user : UserId) : async [Investment] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own investments");
    };

    switch (investments.get(user)) {
      case (null) { Runtime.trap("No investments found") };
      case (?userInvestments) { userInvestments.toArray() };
    };
  };

  public query ({ caller }) func getAllPlans() : async [InvestmentPlan] {
    investmentPlans.values().toArray();
  };

  public shared ({ caller }) func createDeposit(crypto : Crypto, amount : Amount, walletAddress : Text) : async Deposit {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create deposits");
    };

    depositIdCounter += 1;
    let deposit : Deposit = {
      id = depositIdCounter;
      user = caller;
      crypto;
      amount;
      status = #pending;
      walletAddress;
      timestamp = Time.now();
    };

    let userDeposits = switch (deposits.get(caller)) {
      case (null) {
        let newList = List.empty<Deposit>();
        newList.add(deposit);
        newList;
      };
      case (?existingDeposits) {
        let newDeposits = existingDeposits.clone();
        newDeposits.add(deposit);
        newDeposits;
      };
    };

    deposits.add(caller, userDeposits);
    deposit;
  };

  public query ({ caller }) func getUserDeposits(user : UserId) : async [Deposit] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own deposits");
    };

    switch (deposits.get(user)) {
      case (null) { Runtime.trap("No deposits found") };
      case (?userDeposits) { userDeposits.toArray() };
    };
  };

  public shared ({ caller }) func createWithdrawal(amount : Amount, walletAddress : Text, crypto : Crypto) : async Withdrawal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create withdrawals");
    };

    withdrawalIdCounter += 1;
    let withdrawal : Withdrawal = {
      id = withdrawalIdCounter;
      user = caller;
      amount;
      walletAddress;
      crypto;
      status = #pending;
      timestamp = Time.now();
    };

    let userWithdrawals = switch (withdrawals.get(caller)) {
      case (null) {
        let newList = List.empty<Withdrawal>();
        newList.add(withdrawal);
        newList;
      };
      case (?existingWithdrawals) {
        let newWithdrawals = existingWithdrawals.clone();
        newWithdrawals.add(withdrawal);
        newWithdrawals;
      };
    };

    withdrawals.add(caller, userWithdrawals);
    withdrawal;
  };

  public query ({ caller }) func getUserWithdrawals(user : UserId) : async [Withdrawal] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own withdrawals");
    };

    switch (withdrawals.get(user)) {
      case (null) { Runtime.trap("No withdrawals found") };
      case (?userWithdrawals) { userWithdrawals.toArray() };
    };
  };

  public query ({ caller }) func getUserReferrals(userId : UserId) : async [Referral] {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own referrals");
    };

    switch (referrals.get(userId)) {
      case (null) { Runtime.trap("No referrals found") };
      case (?referralList) { referralList.toArray() };
    };
  };

  public shared ({ caller }) func addTrade(exchangePair : Text, tradeType : TradeType, profitPercent : Nat, amount : Amount) : async Trade {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add trade entries");
    };

    tradeIdCounter += 1;
    let trade : Trade = {
      id = tradeIdCounter;
      exchangePair;
      tradeType;
      profitPercent;
      amount;
      timestamp = Time.now();
    };

    let tradeList = List.singleton<Trade>(trade);
    trades.add(caller, tradeList);
    trade;
  };

  public query ({ caller }) func getRecentTrades() : async [Trade] {
    if (trades.isEmpty()) { Runtime.trap("No trades found") };
    let allTrades = trades.values();

    let recentTrades = allTrades.flatMap(
      func(tradeList) { tradeList.values() }
    );

    let recentTradesArray = recentTrades.toArray();
    let recentTradesSize = recentTradesArray.size();

    if (recentTradesSize <= 20) {
      recentTradesArray;
    } else {
      recentTradesArray.sliceToArray(recentTradesSize - 20, recentTradesSize);
    };
  };

  public shared ({ caller }) func logActivity(actionType : Text, description : Text) : async Activity {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log activities");
    };

    activityIdCounter += 1;
    let activity : Activity = {
      id = activityIdCounter;
      user = caller;
      actionType;
      description;
      timestamp = Time.now();
    };

    let userActivities = switch (activities.get(caller)) {
      case (null) {
        let newList = List.empty<Activity>();
        newList.add(activity);
        newList;
      };
      case (?existingActivities) {
        let newActivities = existingActivities.clone();
        newActivities.add(activity);
        newActivities;
      };
    };

    activities.add(caller, userActivities);
    activity;
  };

  public query ({ caller }) func getUserActivity(user : UserId) : async [Activity] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own activity");
    };

    switch (activities.get(user)) {
      case (null) { Runtime.trap("No activity found") };
      case (?userActivities) { userActivities.toArray() };
    };
  };

  public shared ({ caller }) func awardAchievement(achievement : AchievementType) : async Achievement {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can award achievements");
    };

    achievementIdCounter += 1;
    let achievementRecord : Achievement = {
      id = achievementIdCounter;
      user = caller;
      achievement;
      timestamp = Time.now();
    };

    let userAchievements = switch (achievements.get(caller)) {
      case (null) {
        let newList = List.empty<Achievement>();
        newList.add(achievementRecord);
        newList;
      };
      case (?existingAchievements) {
        let newAchievements = existingAchievements.clone();
        newAchievements.add(achievementRecord);
        newAchievements;
      };
    };

    achievements.add(caller, userAchievements);
    achievementRecord;
  };

  public query ({ caller }) func getUserAchievements(user : UserId) : async [Achievement] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own achievements");
    };

    switch (achievements.get(user)) {
      case (null) { Runtime.trap("No achievements found") };
      case (?userAchievements) { userAchievements.toArray() };
    };
  };
};
