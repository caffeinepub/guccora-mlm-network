import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Option "mo:core/Option";
import List "mo:core/List";
import Cycles "mo:core/Cycles";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type UserId = Text;
  type SessionToken = Text;
  type Position = { #left; #right };
  type PaymentStatus = { #pendingVerification; #approved; #rejected };

  // V1 User type - kept for migration from old stable storage
  type UserV1 = {
    id : UserId;
    fullName : Text;
    mobile : Text;
    sponsorCode : Text;
    myReferralCode : Text;
    planId : Nat;
    isActive : Bool;
    walletBalance : Nat;
    totalIncome : Nat;
    directIncome : Nat;
    binaryIncome : Nat;
    levelIncome : Nat;
    leftChildId : ?UserId;
    rightChildId : ?UserId;
    parentId : ?UserId;
    position : ?Position;
    joinedAt : Int;
    leftTeamCount : Nat;
    rightTeamCount : Nat;
  };

  // V2 User type - kept for migration from stable storage
  type UserV2 = {
    id : UserId;
    fullName : Text;
    mobile : Text;
    sponsorCode : Text;
    myReferralCode : Text;
    planId : Nat;
    isActive : Bool;
    walletBalance : Nat;
    totalIncome : Nat;
    directIncome : Nat;
    binaryIncome : Nat;
    levelIncome : Nat;
    leftChildId : ?UserId;
    rightChildId : ?UserId;
    parentId : ?UserId;
    position : ?Position;
    joinedAt : Int;
    leftTeamCount : Nat;
    rightTeamCount : Nat;
    utrNumber : Text;
    screenshotUrl : Text;
    paymentStatus : PaymentStatus;
  };

  // Current User type with payment verification fields
  type User = {
    id : UserId;
    fullName : Text;
    mobile : Text;
    sponsorCode : Text;
    myReferralCode : Text;
    planId : Nat;
    isActive : Bool;
    walletBalance : Nat;
    totalIncome : Nat;
    directIncome : Nat;
    binaryIncome : Nat;
    levelIncome : Nat;
    leftChildId : ?UserId;
    rightChildId : ?UserId;
    parentId : ?UserId;
    position : ?Position;
    joinedAt : Int;
    leftTeamCount : Nat;
    rightTeamCount : Nat;
    utrNumber : Text;
    screenshotUrl : Text;
    paymentStatus : PaymentStatus;
    password : Text;
  };

  type Plan = {
    id : Nat;
    name : Text;
    price : Nat;
    directIncomePercent : Nat;
    binaryIncomePercent : Nat;
    levelIncomeRates : [Nat];
  };

  type IncomeRecord = {
    id : Nat;
    userId : UserId;
    incomeType : { #direct; #binary; #level };
    amount : Nat;
    fromUserId : UserId;
    level : ?Nat;
    createdAt : Int;
  };

  type WalletTransaction = {
    id : Nat;
    userId : UserId;
    txType : { #credit; #debit };
    amount : Nat;
    status : { #pending; #approved; #rejected };
    note : Text;
    createdAt : Int;
  };

  type OTPRecord = {
    mobile : Text;
    otp : Text;
    expiresAt : Int;
  };

  type Payment = {
    id : Nat;
    userId : UserId;
    planId : Nat;
    amount : Nat;
    upiRef : Text;
    status : { #pending; #verified; #rejected };
    createdAt : Int;
  };

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    imageUrl : Text;
    isActive : Bool;
  };

  type DashboardStats = {
    totalTeam : Nat;
    leftTeamCount : Nat;
    rightTeamCount : Nat;
    totalIncome : Nat;
    walletBalance : Nat;
    directReferrals : Nat;
    recentIncomeRecords : [IncomeRecord];
  };

  type UserDto = {
    id : UserId;
    fullName : Text;
    mobile : Text;
    sponsorCode : Text;
    myReferralCode : Text;
    planId : Nat;
    walletBalance : Nat;
    totalIncome : Nat;
    directIncome : Nat;
    binaryIncome : Nat;
    levelIncome : Nat;
    joinedAt : Int;
    leftTeamCount : Nat;
    rightTeamCount : Nat;
    isActive : Bool;
    paymentStatus : PaymentStatus;
  };

  type UserRegistrationDto = {
    id : UserId;
    fullName : Text;
    mobile : Text;
    planId : Nat;
    planName : Text;
    planPrice : Nat;
    utrNumber : Text;
    screenshotUrl : Text;
    paymentStatus : PaymentStatus;
    joinedAt : Int;
  };

  public type UserProfile = {
    userId : Text;
    fullName : Text;
    mobile : Text;
    myReferralCode : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Legacy stable map (old User type, same variable name as before upgrade)
  var usersMap = Map.empty<UserId, UserV1>();

  // New stable map with updated User type
  var usersMapV2 = Map.empty<UserId, UserV2>();

  // New stable map with password field
  var usersMapV3 = Map.empty<UserId, User>();

  // Migration flag
  var usersMigrationDone = false;

  var plansMap = Map.empty<Nat, Plan>();
  var incomesMap = Map.empty<Nat, IncomeRecord>();
  var walletsMap = Map.empty<Nat, WalletTransaction>();
  var otpsMap = Map.empty<Text, OTPRecord>();
  var paymentsMap = Map.empty<Nat, Payment>();
  var productsMap = Map.empty<Nat, Product>();
  var sessionsMap = Map.empty<SessionToken, UserId>();
  var principalToUserIdMap = Map.empty<Principal, UserId>();
  var userProfiles = Map.empty<Principal, UserProfile>();

  // Admin credentials
  let ADMIN_PASSWORD = "Guccora@123";
  var adminSessionsMap = Map.empty<SessionToken, Bool>();

  // Counters
  var incomeRecordId = 0;
  var walletTransactionId = 0;
  var paymentRecordId = 0;
  var productRecordId = 0;

  // Initialize plans (only called from update contexts)
  func initializePlans() {
    if (plansMap.size() == 0) {
      plansMap.add(1, {
        id = 1;
        name = "Starter";
        price = 599;
        directIncomePercent = 10;
        binaryIncomePercent = 5;
        levelIncomeRates = [5, 4, 3, 3, 2, 2, 2, 1, 1, 1];
      });
      plansMap.add(2, {
        id = 2;
        name = "Growth";
        price = 999;
        directIncomePercent = 12;
        binaryIncomePercent = 7;
        levelIncomeRates = [6, 5, 4, 3, 2, 2, 2, 1, 1, 1];
      });
      plansMap.add(3, {
        id = 3;
        name = "Premium";
        price = 1999;
        directIncomePercent = 15;
        binaryIncomePercent = 10;
        levelIncomeRates = [8, 6, 5, 4, 3, 2, 2, 1, 1, 1];
      });
    };
  };

  // Migrate V1 users to V2
  func migrateUsersV1ToV2() {
    if (not usersMigrationDone) {
      for ((k, v) in usersMap.entries()) {
        let newUser : UserV2 = {
          id = v.id;
          fullName = v.fullName;
          mobile = v.mobile;
          sponsorCode = v.sponsorCode;
          myReferralCode = v.myReferralCode;
          planId = v.planId;
          isActive = v.isActive;
          walletBalance = v.walletBalance;
          totalIncome = v.totalIncome;
          directIncome = v.directIncome;
          binaryIncome = v.binaryIncome;
          levelIncome = v.levelIncome;
          leftChildId = v.leftChildId;
          rightChildId = v.rightChildId;
          parentId = v.parentId;
          position = v.position;
          joinedAt = v.joinedAt;
          leftTeamCount = v.leftTeamCount;
          rightTeamCount = v.rightTeamCount;
          utrNumber = "";
          screenshotUrl = "";
          paymentStatus = if (v.isActive) { #approved } else { #pendingVerification };
        };
        usersMapV2.add(k, newUser);
      };
      // Clear old map after migration
      usersMap := Map.empty<UserId, UserV1>();
      usersMigrationDone := true;
    };
  };

  system func preupgrade() {};
  func migrateUsersV2ToV3() {
    if (usersMapV3.size() == 0 and usersMapV2.size() > 0) {
      for ((k, v) in usersMapV2.entries()) {
        let newUser : User = {
          id = v.id;
          fullName = v.fullName;
          mobile = v.mobile;
          sponsorCode = v.sponsorCode;
          myReferralCode = v.myReferralCode;
          planId = v.planId;
          isActive = v.isActive;
          walletBalance = v.walletBalance;
          totalIncome = v.totalIncome;
          directIncome = v.directIncome;
          binaryIncome = v.binaryIncome;
          levelIncome = v.levelIncome;
          leftChildId = v.leftChildId;
          rightChildId = v.rightChildId;
          parentId = v.parentId;
          position = v.position;
          joinedAt = v.joinedAt;
          leftTeamCount = v.leftTeamCount;
          rightTeamCount = v.rightTeamCount;
          utrNumber = v.utrNumber;
          screenshotUrl = v.screenshotUrl;
          paymentStatus = v.paymentStatus;
          password = "";
        };
        usersMapV3.add(k, newUser);
      };
      usersMapV2 := Map.empty<UserId, UserV2>();
    };
  };

  system func postupgrade() {
    migrateUsersV1ToV2();
    migrateUsersV2ToV3();
    initializePlans();
  };

  // Utility Functions
  func generateId() : Nat {
    let timestamp = Int.abs(Time.now());
    timestamp;
  };

  func generateSessionToken() : SessionToken {
    generateId().toText();
  };

  func generateReferralCode(userId : UserId) : Text {
    let chars = userId.chars();
    var code = "";
    var count = 0;
    for (c in chars) {
      if (count < 6) {
        code #= Text.fromChar(c);
        count += 1;
      };
    };
    if (code == "") { "REF" # userId } else { code };
  };

  func toUserDto(user : User) : UserDto {
    {
      id = user.id;
      fullName = user.fullName;
      mobile = user.mobile;
      sponsorCode = user.sponsorCode;
      myReferralCode = user.myReferralCode;
      planId = user.planId;
      walletBalance = user.walletBalance;
      totalIncome = user.totalIncome;
      directIncome = user.directIncome;
      binaryIncome = user.binaryIncome;
      levelIncome = user.levelIncome;
      joinedAt = user.joinedAt;
      leftTeamCount = user.leftTeamCount;
      rightTeamCount = user.rightTeamCount;
      isActive = user.isActive;
      paymentStatus = user.paymentStatus;
    };
  };

  func getUserIdFromSession(sessionToken : SessionToken) : ?UserId {
    sessionsMap.get(sessionToken);
  };

  func createIncomeRecordId() : Nat {
    incomeRecordId += 1;
    incomeRecordId;
  };

  func createWalletTransactionId() : Nat {
    walletTransactionId += 1;
    walletTransactionId;
  };

  func createPaymentRecordId() : Nat {
    paymentRecordId += 1;
    paymentRecordId;
  };

  func createProductRecordId() : Nat {
    productRecordId += 1;
    productRecordId;
  };

  func placeNewUser(sponsorCode : Text, newUserId : UserId) : (Text, Position) {
    var currentUserId = sponsorCode;
    var iterations = 0;
    let maxIterations = 1000;
    
    while (iterations < maxIterations) {
      switch (usersMapV3.get(currentUserId)) {
        case (null) {
          Runtime.trap("Sponsor not found");
        };
        case (?user) {
          switch (user.leftChildId, user.rightChildId) {
            case (null, _) {
              return (user.id, #left);
            };
            case (_, null) {
              return (user.id, #right);
            };
            case (?leftId, ?rightId) {
              let leftCount = getTeamCount(leftId);
              let rightCount = getTeamCount(rightId);
              currentUserId := if (leftCount <= rightCount) { leftId } else { rightId };
            };
          };
        };
      };
      iterations += 1;
    };
    Runtime.trap("Failed to place new user");
  };

  func getTeamCount(userId : UserId) : Nat {
    switch (usersMapV3.get(userId)) {
      case (null) { 0 };
      case (?user) { 1 + user.leftTeamCount + user.rightTeamCount };
    };
  };

  func distributeDirectIncome(sponsorId : UserId, amount : Nat) {
    switch (usersMapV3.get(sponsorId)) {
      case (null) {};
      case (?sponsor) {
        let updatedSponsor = {
          sponsor with
          walletBalance = sponsor.walletBalance + amount;
          directIncome = sponsor.directIncome + amount;
          totalIncome = sponsor.totalIncome + amount;
        };
        usersMapV3.add(sponsorId, updatedSponsor);
        
        let incomeRec : IncomeRecord = {
          id = createIncomeRecordId();
          userId = sponsorId;
          incomeType = #direct;
          amount = amount;
          fromUserId = sponsorId;
          level = null;
          createdAt = Time.now();
        };
        incomesMap.add(incomeRec.id, incomeRec);
      };
    };
  };

  // Fix: use 0-based index to avoid Nat subtraction warning
  func distributeLevelIncome(newUserId : UserId, planPrice : Nat, levelRates : [Nat]) {
    var currentId = ?newUserId;
    var levelIdx = 0; // 0-based index into levelRates
    
    while (levelIdx < 10 and currentId.isSome()) {
      switch (currentId) {
        case (?userId) {
          switch (usersMapV3.get(userId)) {
            case (null) { currentId := null };
            case (?user) {
              if (levelIdx < levelRates.size()) {
                let rate = levelRates[levelIdx];
                let amount = (planPrice * rate) / 100;
                
                let updatedUser = {
                  user with
                  walletBalance = user.walletBalance + amount;
                  levelIncome = user.levelIncome + amount;
                  totalIncome = user.totalIncome + amount;
                };
                usersMapV3.add(userId, updatedUser);
                
                let incomeRec : IncomeRecord = {
                  id = createIncomeRecordId();
                  userId = userId;
                  incomeType = #level;
                  amount = amount;
                  fromUserId = newUserId;
                  level = ?(levelIdx + 1); // 1-based level for display
                  createdAt = Time.now();
                };
                incomesMap.add(incomeRec.id, incomeRec);
              };
              currentId := user.parentId;
            };
          };
        };
        case (null) {};
      };
      levelIdx += 1;
    };
  };

  func updateParentTeamCounts(userId : UserId, position : Position) {
    switch (usersMapV3.get(userId)) {
      case (null) {};
      case (?user) {
        switch (user.parentId) {
          case (null) {};
          case (?parentId) {
            switch (usersMapV3.get(parentId)) {
              case (null) {};
              case (?parent) {
                let updatedParent = switch (position) {
                  case (#left) {
                    { parent with leftTeamCount = parent.leftTeamCount + 1 }
                  };
                  case (#right) {
                    { parent with rightTeamCount = parent.rightTeamCount + 1 }
                  };
                };
                usersMapV3.add(parentId, updatedParent);
                
                switch (parent.position) {
                  case (?pos) { updateParentTeamCounts(parentId, pos) };
                  case (null) {};
                };
              };
            };
          };
        };
      };
    };
  };

  // Required Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // 1. Register User
  public shared ({ caller }) func registerUser(
    fullName : Text,
    mobile : Text,
    sponsorCode : Text,
    planId : Nat,
    utrNumber : Text,
    screenshotUrl : Text,
    password : Text
  ) : async Text {
    initializePlans();
    
    if (fullName.size() < 3 or mobile.size() < 10) {
      Runtime.trap("Invalid input: name must be at least 3 chars, mobile at least 10");
    };

    if (utrNumber.size() < 6) {
      Runtime.trap("Invalid UTR number: must be at least 6 characters");
    };

    // Check if mobile already registered
    for ((_, u) in usersMapV3.entries()) {
      if (u.mobile == mobile) {
        Runtime.trap("Mobile number already registered");
      };
    };

    switch (plansMap.get(planId)) {
      case (null) { Runtime.trap("Invalid planId") };
      case (?plan) {
        let userId = generateId().toText();

        let (parentId, position) = placeNewUser(sponsorCode, userId);

        let user : User = {
          id = userId;
          fullName = fullName;
          mobile = mobile;
          sponsorCode = sponsorCode;
          myReferralCode = generateReferralCode(userId);
          planId = planId;
          isActive = false;
          walletBalance = 0;
          totalIncome = 0;
          directIncome = 0;
          binaryIncome = 0;
          levelIncome = 0;
          leftChildId = null;
          rightChildId = null;
          parentId = ?parentId;
          position = ?position;
          joinedAt = Time.now();
          leftTeamCount = 0;
          rightTeamCount = 0;
          utrNumber = utrNumber;
          screenshotUrl = screenshotUrl;
          paymentStatus = #pendingVerification;
          password = password;
        };

        usersMapV3.add(userId, user);

        switch (usersMapV3.get(parentId)) {
          case (?parent) {
            let updatedParent = switch (position) {
              case (#left) { { parent with leftChildId = ?userId } };
              case (#right) { { parent with rightChildId = ?userId } };
            };
            usersMapV3.add(parentId, updatedParent);
          };
          case (null) {};
        };

        updateParentTeamCounts(userId, position);
        principalToUserIdMap.add(caller, userId);

        userId;
      };
    };
  };

  // 2. Send OTP (stub)
  public shared func sendOTP(_mobile : Text) : async Text {
    "000000";
  };

  // 3. Verify OTP (stub)
  public shared func verifyOTP(_mobile : Text, _otp : Text) : async Bool {
    true;
  };

  // 4. Login User By Mobile
  public shared ({ caller }) func loginUserByMobile(mobile : Text, password : Text) : async SessionToken {
    for ((userId, user) in usersMapV3.entries()) {
      if (user.mobile == mobile) {
        if (password != "" and user.password != "" and user.password != password) {
          Runtime.trap("Invalid password. Please check your password and try again.");
        };
        if (not user.isActive) {
          switch (user.paymentStatus) {
            case (#pendingVerification) {
              Runtime.trap("Account pending admin approval. Your payment is being verified. Please wait.");
            };
            case (#rejected) {
              Runtime.trap("Account registration was rejected. Please contact support.");
            };
            case (#approved) {};
          };
        };
        let sessionToken = generateSessionToken();
        sessionsMap.add(sessionToken, userId);
        principalToUserIdMap.add(caller, userId);
        return sessionToken;
      };
    };
    
    Runtime.trap("User not found with this mobile number");
  };

  // 5. Add User Binary Position (Admin only)
  public shared ({ caller }) func addUserBinaryPosition(userId : UserId, parentId : UserId, position : Position) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (usersMapV3.get(userId), usersMapV3.get(parentId)) {
      case (?user, ?parent) {
        let updatedUser = {
          user with
          parentId = ?parentId;
          position = ?position;
        };
        usersMapV3.add(userId, updatedUser);

        let updatedParent = switch (position) {
          case (#left) { { parent with leftChildId = ?userId } };
          case (#right) { { parent with rightChildId = ?userId } };
        };
        usersMapV3.add(parentId, updatedParent);
      };
      case (_, _) { Runtime.trap("User or parent not found") };
    };
  };

  // 6. Calculate Binary Income (Admin only)
  public shared ({ caller }) func calculateBinaryIncome(userId : UserId) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (usersMapV3.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        let leftBusiness = switch (user.leftChildId) {
          case (?leftId) { getTeamCount(leftId) };
          case (null) { 0 };
        };
        let rightBusiness = switch (user.rightChildId) {
          case (?rightId) { getTeamCount(rightId) };
          case (null) { 0 };
        };
        
        let weakerLeg = Nat.min(leftBusiness, rightBusiness);
        switch (plansMap.get(user.planId)) {
          case (?plan) {
            let binaryIncome = (weakerLeg * plan.binaryIncomePercent) / 100;
            
            let updatedUser = {
              user with
              walletBalance = user.walletBalance + binaryIncome;
              binaryIncome = user.binaryIncome + binaryIncome;
              totalIncome = user.totalIncome + binaryIncome;
            };
            usersMapV3.add(userId, updatedUser);
            
            let incomeRec : IncomeRecord = {
              id = createIncomeRecordId();
              userId = userId;
              incomeType = #binary;
              amount = binaryIncome;
              fromUserId = userId;
              level = null;
              createdAt = Time.now();
            };
            incomesMap.add(incomeRec.id, incomeRec);
            
            binaryIncome;
          };
          case (null) { 0 };
        };
      };
    };
  };

  // 7. Get User Dashboard
  public query ({ caller }) func getUserDashboard(sessionToken : SessionToken) : async ?DashboardStats {
    switch (getUserIdFromSession(sessionToken)) {
      case (null) { null };
      case (?userId) {
        switch (principalToUserIdMap.get(caller)) {
          case (?callerUserId) {
            if (callerUserId != userId and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own dashboard");
            };
          };
          case (null) {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own dashboard");
            };
          };
        };

        switch (usersMapV3.get(userId)) {
          case (null) { null };
          case (?user) {
            let totalTeam = user.leftTeamCount + user.rightTeamCount;
            var directReferrals = 0;
            for ((_, u) in usersMapV3.entries()) {
              if (u.sponsorCode == user.myReferralCode) {
                directReferrals += 1;
              };
            };

            var recentIncomes : [IncomeRecord] = [];
            var count = 0;
            for ((_, income) in incomesMap.entries()) {
              if (income.userId == userId and count < 10) {
                recentIncomes := recentIncomes.concat([income]);
                count += 1;
              };
            };

            ?{
              totalTeam = totalTeam;
              leftTeamCount = user.leftTeamCount;
              rightTeamCount = user.rightTeamCount;
              totalIncome = user.totalIncome;
              walletBalance = user.walletBalance;
              directReferrals = directReferrals;
              recentIncomeRecords = recentIncomes;
            };
          };
        };
      };
    };
  };

  // 8. Withdraw Request
  public shared ({ caller }) func withdrawRequest(sessionToken : SessionToken, amount : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request withdrawals");
    };

    switch (getUserIdFromSession(sessionToken)) {
      case (null) { Runtime.trap("Invalid session") };
      case (?userId) {
        switch (principalToUserIdMap.get(caller)) {
          case (?callerUserId) {
            if (callerUserId != userId) {
              Runtime.trap("Unauthorized: Can only withdraw from your own account");
            };
          };
          case (null) { Runtime.trap("Unauthorized: Session not linked to caller") };
        };

        switch (usersMapV3.get(userId)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) {
            if (user.walletBalance < amount) {
              Runtime.trap("Insufficient balance");
            };

            let txId = createWalletTransactionId();
            let tx : WalletTransaction = {
              id = txId;
              userId = userId;
              txType = #debit;
              amount = amount;
              status = #pending;
              note = "Withdrawal request";
              createdAt = Time.now();
            };
            walletsMap.add(txId, tx);

            // Fix: use Nat.sub to avoid Nat subtraction warning
            let updatedUser = {
              user with
              walletBalance = Nat.sub(user.walletBalance, amount);
            };
            usersMapV3.add(userId, updatedUser);

            txId;
          };
        };
      };
    };
  };

  // 9. Admin Login
  public shared func adminLogin(password : Text) : async SessionToken {
    if (password != ADMIN_PASSWORD) {
      Runtime.trap("Invalid admin password");
    };
    
    let sessionToken = generateSessionToken();
    adminSessionsMap.add(sessionToken, true);
    sessionToken;
  };

  // 10. Admin User List
  public query ({ caller }) func adminUserList() : async [UserDto] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    var users : [UserDto] = [];
    for ((_, user) in usersMapV3.entries()) {
      users := users.concat([toUserDto(user)]);
    };
    users;
  };

  // 11. Admin Activate User
  public shared ({ caller }) func adminActivateUser(userId : UserId, isActive : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (usersMapV3.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        let updatedUser = { user with isActive = isActive };
        usersMapV3.add(userId, updatedUser);
      };
    };
  };

  // 12. Admin Get Payments
  public query ({ caller }) func adminGetPayments() : async [Payment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    var payments : [Payment] = [];
    for ((_, payment) in paymentsMap.entries()) {
      payments := payments.concat([payment]);
    };
    payments;
  };

  // 13. Admin Approve Withdraw
  public shared ({ caller }) func adminApproveWithdraw(txId : Nat, approved : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (walletsMap.get(txId)) {
      case (null) { Runtime.trap("Transaction not found") };
      case (?tx) {
        let newStatus = if (approved) { #approved } else { #rejected };
        let updatedTx = { tx with status = newStatus };
        walletsMap.add(txId, updatedTx);

        if (not approved) {
          switch (usersMapV3.get(tx.userId)) {
            case (?user) {
              let updatedUser = {
                user with
                walletBalance = user.walletBalance + tx.amount;
              };
              usersMapV3.add(tx.userId, updatedUser);
            };
            case (null) {};
          };
        };
      };
    };
  };

  // 14. Admin Get Total Business
  public query ({ caller }) func adminGetTotalBusiness() : async {
    totalUsers : Nat;
    totalPlansSold : Nat;
    totalIncomeDistributed : Nat;
    totalWithdrawals : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let totalUsers = usersMapV3.size();
    let totalPlansSold = usersMapV3.size();
    
    var totalIncomeDistributed = 0;
    for ((_, user) in usersMapV3.entries()) {
      totalIncomeDistributed += user.totalIncome;
    };

    var totalWithdrawals = 0;
    for ((_, tx) in walletsMap.entries()) {
      if (tx.txType == #debit and tx.status == #approved) {
        totalWithdrawals += tx.amount;
      };
    };

    {
      totalUsers = totalUsers;
      totalPlansSold = totalPlansSold;
      totalIncomeDistributed = totalIncomeDistributed;
      totalWithdrawals = totalWithdrawals;
    };
  };

  // 15. Submit Payment
  public shared ({ caller }) func submitPayment(sessionToken : SessionToken, planId : Nat, upiRef : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit payments");
    };

    switch (getUserIdFromSession(sessionToken)) {
      case (null) { Runtime.trap("Invalid session") };
      case (?userId) {
        switch (principalToUserIdMap.get(caller)) {
          case (?callerUserId) {
            if (callerUserId != userId) {
              Runtime.trap("Unauthorized: Can only submit payment for your own account");
            };
          };
          case (null) { Runtime.trap("Unauthorized: Session not linked to caller") };
        };

        switch (plansMap.get(planId)) {
          case (null) { Runtime.trap("Invalid plan") };
          case (?plan) {
            let paymentId = createPaymentRecordId();
            let payment : Payment = {
              id = paymentId;
              userId = userId;
              planId = planId;
              amount = plan.price;
              upiRef = upiRef;
              status = #pending;
              createdAt = Time.now();
            };
            paymentsMap.add(paymentId, payment);
            paymentId;
          };
        };
      };
    };
  };

  // 16. Admin Verify Payment
  public shared ({ caller }) func adminVerifyPayment(paymentId : Nat, verified : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (paymentsMap.get(paymentId)) {
      case (null) { Runtime.trap("Payment not found") };
      case (?payment) {
        let newStatus = if (verified) { #verified } else { #rejected };
        let updatedPayment = { payment with status = newStatus };
        paymentsMap.add(paymentId, updatedPayment);

        if (verified) {
          switch (usersMapV3.get(payment.userId)) {
            case (?user) {
              let updatedUser = { user with isActive = true };
              usersMapV3.add(payment.userId, updatedUser);
            };
            case (null) {};
          };
        };
      };
    };
  };

  // 17. Get User Income Records
  public query ({ caller }) func getUserIncomeRecords(sessionToken : SessionToken) : async [IncomeRecord] {
    switch (getUserIdFromSession(sessionToken)) {
      case (null) { [] };
      case (?userId) {
        switch (principalToUserIdMap.get(caller)) {
          case (?callerUserId) {
            if (callerUserId != userId and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own income records");
            };
          };
          case (null) {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own income records");
            };
          };
        };

        var records : [IncomeRecord] = [];
        for ((_, income) in incomesMap.entries()) {
          if (income.userId == userId) {
            records := records.concat([income]);
          };
        };
        records;
      };
    };
  };

  // 18. Get User Wallet History
  public query ({ caller }) func getUserWalletHistory(sessionToken : SessionToken) : async [WalletTransaction] {
    switch (getUserIdFromSession(sessionToken)) {
      case (null) { [] };
      case (?userId) {
        switch (principalToUserIdMap.get(caller)) {
          case (?callerUserId) {
            if (callerUserId != userId and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own wallet history");
            };
          };
          case (null) {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own wallet history");
            };
          };
        };

        var transactions : [WalletTransaction] = [];
        for ((_, tx) in walletsMap.entries()) {
          if (tx.userId == userId) {
            transactions := transactions.concat([tx]);
          };
        };
        transactions;
      };
    };
  };

  // 19. Get Binary Tree
  public query func getBinaryTree(userId : UserId) : async ?{
    user : UserDto;
    left : ?UserDto;
    right : ?UserDto;
  } {
    switch (usersMapV3.get(userId)) {
      case (null) { null };
      case (?user) {
        let leftUser = switch (user.leftChildId) {
          case (?leftId) { usersMapV3.get(leftId).map(toUserDto) };
          case (null) { null };
        };
        let rightUser = switch (user.rightChildId) {
          case (?rightId) { usersMapV3.get(rightId).map(toUserDto) };
          case (null) { null };
        };
        ?{
          user = toUserDto(user);
          left = leftUser;
          right = rightUser;
        };
      };
    };
  };

  // 20. Admin Get Products
  public query ({ caller }) func adminGetProducts() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    var products : [Product] = [];
    for ((_, product) in productsMap.entries()) {
      products := products.concat([product]);
    };
    products;
  };

  // Add Product
  public shared ({ caller }) func addProduct(
    name : Text,
    description : Text,
    price : Nat,
    imageUrl : Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let productId = createProductRecordId();
    let product : Product = {
      id = productId;
      name = name;
      description = description;
      price = price;
      imageUrl = imageUrl;
      isActive = true;
    };
    productsMap.add(productId, product);
    productId;
  };

  // Update Product
  public shared ({ caller }) func updateProduct(
    productId : Nat,
    name : Text,
    description : Text,
    price : Nat,
    imageUrl : Text,
    isActive : Bool
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (productsMap.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let product : Product = {
          id = productId;
          name = name;
          description = description;
          price = price;
          imageUrl = imageUrl;
          isActive = isActive;
        };
        productsMap.add(productId, product);
      };
    };
  };

  // 21. Get User Profile By Session
  public query ({ caller }) func getUserProfileById(sessionToken : SessionToken) : async ?User {
    switch (getUserIdFromSession(sessionToken)) {
      case (null) { null };
      case (?userId) {
        switch (principalToUserIdMap.get(caller)) {
          case (?callerUserId) {
            if (callerUserId != userId and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own profile");
            };
          };
          case (null) {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own profile");
            };
          };
        };

        usersMapV3.get(userId);
      };
    };
  };

  // 22. Update User Profile
  public shared ({ caller }) func updateUserProfile(sessionToken : SessionToken, fullName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    switch (getUserIdFromSession(sessionToken)) {
      case (null) { Runtime.trap("Invalid session") };
      case (?userId) {
        switch (principalToUserIdMap.get(caller)) {
          case (?callerUserId) {
            if (callerUserId != userId) {
              Runtime.trap("Unauthorized: Can only update your own profile");
            };
          };
          case (null) { Runtime.trap("Unauthorized: Session not linked to caller") };
        };

        switch (usersMapV3.get(userId)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) {
            let updatedUser = { user with fullName = fullName };
            usersMapV3.add(userId, updatedUser);
          };
        };
      };
    };
  };

  // Get Plans
  public query func getPlans() : async [Plan] {
    var plans : [Plan] = [];
    for ((_, plan) in plansMap.entries()) {
      plans := plans.concat([plan]);
    };
    plans;
  };

  // Get Products
  public query func getProducts() : async [Product] {
    var products : [Product] = [];
    for ((_, product) in productsMap.entries()) {
      if (product.isActive) {
        products := products.concat([product]);
      };
    };
    products;
  };

  // 23. Admin Get Pending Registrations
  public query ({ caller }) func adminGetPendingRegistrations() : async [UserRegistrationDto] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    var result : [UserRegistrationDto] = [];
    for ((_, user) in usersMapV3.entries()) {
      let planName = switch (plansMap.get(user.planId)) {
        case (?plan) { plan.name };
        case (null) { "Unknown" };
      };
      let planPrice = switch (plansMap.get(user.planId)) {
        case (?plan) { plan.price };
        case (null) { 0 };
      };
      let reg : UserRegistrationDto = {
        id = user.id;
        fullName = user.fullName;
        mobile = user.mobile;
        planId = user.planId;
        planName = planName;
        planPrice = planPrice;
        utrNumber = user.utrNumber;
        screenshotUrl = user.screenshotUrl;
        paymentStatus = user.paymentStatus;
        joinedAt = user.joinedAt;
      };
      result := result.concat([reg]);
    };
    result;
  };

  // 24. Admin Approve Registration
  public shared ({ caller }) func adminApproveRegistration(userId : UserId, approved : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (usersMapV3.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        if (approved) {
          let updatedUser = {
            user with
            isActive = true;
            paymentStatus = #approved;
          };
          usersMapV3.add(userId, updatedUser);

          switch (plansMap.get(user.planId)) {
            case (?plan) {
              let directAmount = (plan.price * plan.directIncomePercent) / 100;
              distributeDirectIncome(user.sponsorCode, directAmount);
              distributeLevelIncome(userId, plan.price, plan.levelIncomeRates);
            };
            case (null) {};
          };
        } else {
          let updatedUser = {
            user with
            isActive = false;
            paymentStatus = #rejected;
          };
          usersMapV3.add(userId, updatedUser);
        };
      };
    };
  };

  // 25. Admin Update User
  public shared ({ caller }) func adminUpdateUser(userId : UserId, fullName : Text, mobile : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (usersMapV3.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        let updatedUser = { user with fullName = fullName; mobile = mobile };
        usersMapV3.add(userId, updatedUser);
      };
    };
  };

  // 26. Admin Delete User
  // Fix: use remove() instead of deprecated delete()
  public shared ({ caller }) func adminDeleteUser(userId : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (usersMapV3.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?_) {
        ignore usersMapV3.remove(userId);
      };
    };
  };
};
