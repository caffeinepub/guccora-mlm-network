import Map "mo:core/Map";
import Char "mo:core/Char";
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

  type AdminSettings = {
    upiId : Text;
    accountName : Text;
    activationAmount : Nat;
    qrCodeUrl : Text;
    companyName : Text;
    supportNumber : Text;
  };

  type DashboardStats = {
    totalTeam : Nat;
    leftTeamCount : Nat;
    rightTeamCount : Nat;
    totalIncome : Nat;
    walletBalance : Nat;
    directReferrals : Nat;
    directIncome : Nat;
    binaryIncome : Nat;
    levelIncome : Nat;
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

  type UserProfile = {
    userId : UserId;
    fullName : Text;
    mobile : Text;
    myReferralCode : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var usersMap = Map.empty<UserId, UserV1>();
  var usersMapV2 = Map.empty<UserId, UserV2>();
  var usersMapV3 = Map.empty<UserId, User>();
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
  let ADMIN_USERNAME = "admin";
  let ADMIN_PASSWORD = "Admin@123";
  var adminSessionsMap = Map.empty<SessionToken, Bool>();

  // Admin settings
  var adminSettings : AdminSettings = {
    upiId = "guccora@upi";
    accountName = "PUTTAPALLI RAVITEJA";
    activationAmount = 599;
    qrCodeUrl = "/assets/uploads/file_0000000094f0720b8ff4d7624cf158b4-1.png";
    companyName = "Guccora MLM Network";
    supportNumber = "6305462887";
  };

  func isValidAdminToken(token : Text) : Bool {
    switch (adminSessionsMap.get(token)) {
      case (?true) { true };
      case (_) { false };
    };
  };

  var incomeRecordId = 0;
  var walletTransactionId = 0;
  var paymentRecordId = 0;
  var productRecordId = 0;

  // Fixed income amounts (INR)
  let DIRECT_INCOME_AMOUNT : Nat = 100;
  let BINARY_PAIR_INCOME_AMOUNT : Nat = 200;
  let LEVEL_INCOME_RATES : [Nat] = [50, 30, 20, 0, 0, 0, 0, 0, 0, 0];

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

  // Ensure admin user always exists with correct credentials
  func initializeAdminUser() {
    usersMapV3.remove(ADMIN_USERNAME);
    usersMapV3.add(ADMIN_USERNAME, {
      id = ADMIN_USERNAME;
      fullName = "Admin";
      mobile = "6305462887";
      sponsorCode = "";
      myReferralCode = "ADMIN";
      planId = 1;
      isActive = true;
      walletBalance = 0;
      totalIncome = 0;
      directIncome = 0;
      binaryIncome = 0;
      levelIncome = 0;
      leftChildId = null;
      rightChildId = null;
      parentId = null;
      position = null;
      joinedAt = 0;
      leftTeamCount = 0;
      rightTeamCount = 0;
      utrNumber = "ADMIN";
      screenshotUrl = "";
      paymentStatus = #approved;
      password = ADMIN_PASSWORD;
    });
  };


  system func postupgrade() {
    migrateUsersV1ToV2();
    migrateUsersV2ToV3();
    initializePlans();
    initializeAdminUser();
  };

  // Helper to update a user record
  func updateUser(userId : UserId, user : User) {
    usersMapV3.remove(userId);
    usersMapV3.add(userId, user);
  };

  func toUpper(t : Text) : Text {
    var result = "";
    for (c in t.chars()) {
      let code = c.toNat32();
      let upper = if (code >= 97 and code <= 122) {
        Char.fromNat32(code - 32)
      } else { c };
      result #= Text.fromChar(upper);
    };
    result;
  };

  func findUserIdByReferralCode(refCode : Text) : ?UserId {
    if (refCode == "") return null;
    let refCodeUpper = toUpper(refCode);
    for ((id, user) in usersMapV3.entries()) {
      if (toUpper(user.myReferralCode) == refCodeUpper) {
        return ?id;
      };
    };
    null;
  };

  func generateId() : Nat {
    let timestamp = Int.abs(Time.now());
    timestamp;
  };

  func generateSessionToken() : SessionToken {
    generateId().toText();
  };

  func generateReferralCode(fullName : Text, mobile : Text) : Text {
    // Take first 4 uppercase letters from name + last 4 digits of mobile
    var letters = "";
    var count = 0;
    for (c in fullName.chars()) {
      if (count < 4) {
        let code = c.toNat32();
        if ((code >= 65 and code <= 90) or (code >= 97 and code <= 122)) {
          let upper = if (code >= 97 and code <= 122) {
            Char.fromNat32(code - 32)
          } else { c };
          letters #= Text.fromChar(upper);
          count += 1;
        };
      };
    };
    // last 4 of mobile
    let mobileChars = mobile.chars();
    var mobileArr : [Char] = [];
    for (c in mobileChars) {
      mobileArr := mobileArr.concat([c]);
    };
    let mLen = mobileArr.size();
    var suffix = "";
    var i = if (mLen >= 4) { mLen - 4 } else { 0 };
    while (i < mLen) {
      suffix #= Text.fromChar(mobileArr[i]);
      i += 1;
    };
    // If duplicate exists add a digit
    var code = letters # suffix;
    if (code.size() < 4) { code := "GUC" # mobile };
    code;
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

  func creditIncome(userId : UserId, amount : Nat, iType : { #direct; #binary; #level }, fromUserId : UserId, levelNum : ?Nat) {
    if (amount == 0) return;
    switch (usersMapV3.get(userId)) {
      case (null) {};
      case (?user) {
        let (newDirect, newBinary, newLevel) = switch (iType) {
          case (#direct) { (user.directIncome + amount, user.binaryIncome, user.levelIncome) };
          case (#binary) { (user.directIncome, user.binaryIncome + amount, user.levelIncome) };
          case (#level) { (user.directIncome, user.binaryIncome, user.levelIncome + amount) };
        };
        updateUser(userId, {
          user with
          walletBalance = user.walletBalance + amount;
          totalIncome = user.totalIncome + amount;
          directIncome = newDirect;
          binaryIncome = newBinary;
          levelIncome = newLevel;
        });
        let incomeId = createIncomeRecordId();
        incomesMap.add(incomeId, {
          id = incomeId;
          userId = userId;
          incomeType = iType;
          amount = amount;
          fromUserId = fromUserId;
          level = levelNum;
          createdAt = Time.now();
        });
        let note = switch (iType) {
          case (#direct) { "Direct Referral Income" };
          case (#binary) { "Binary Pair Income" };
          case (#level) {
            switch (levelNum) {
              case (?l) { "Level " # l.toText() # " Income" };
              case (null) { "Level Income" };
            };
          };
        };
        let txId = createWalletTransactionId();
        walletsMap.add(txId, {
          id = txId;
          userId = userId;
          txType = #credit;
          amount = amount;
          status = #approved;
          note = note;
          createdAt = Time.now();
        });
      };
    };
  };

  func distributeDirectIncome(sponsorId : UserId, amount : Nat) {
    creditIncome(sponsorId, amount, #direct, sponsorId, null);
  };

  func distributeLevelIncome(newUserId : UserId, levelRates : [Nat]) {
    var currentIdOpt : ?UserId = switch (usersMapV3.get(newUserId)) {
      case (?u) { u.parentId };
      case (null) { null };
    };
    var levelIdx = 0;

    while (levelIdx < 10) {
      switch (currentIdOpt) {
        case (null) { levelIdx := 10 };
        case (?userId) {
          if (levelIdx < levelRates.size()) {
            let rate = levelRates[levelIdx];
            if (rate > 0) {
              creditIncome(userId, rate, #level, newUserId, ?(levelIdx + 1));
            };
          };
          currentIdOpt := switch (usersMapV3.get(userId)) {
            case (?u) { u.parentId };
            case (null) { null };
          };
          levelIdx += 1;
        };
      };
    };
  };

  func checkAndDistributeBinaryPairIncome(userId : UserId) {
    switch (usersMapV3.get(userId)) {
      case (null) {};
      case (?user) {
        switch (user.leftChildId, user.rightChildId) {
          case (?_leftId, ?_rightId) {
            // Both positions filled, give binary pair income
            creditIncome(userId, BINARY_PAIR_INCOME_AMOUNT, #binary, userId, null);
          };
          case (_, _) {};
        };
      };
    };
  };

  func placeNewUser(sponsorCode : Text, newUserId : UserId) : (Text, Position) {
    initializeAdminUser();
    let resolvedSponsorId : UserId = switch (findUserIdByReferralCode(sponsorCode)) {
      case (?uid) { uid };
      case (null) { ADMIN_USERNAME };
    };
    var currentUserId = resolvedSponsorId;
    var iterations = 0;
    let maxIterations = 10000;

    while (iterations < maxIterations) {
      switch (usersMapV3.get(currentUserId)) {
        case (null) {
          currentUserId := ADMIN_USERNAME;
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
    Runtime.trap("Failed to place new user: tree full");
  };

  func getTeamCount(userId : UserId) : Nat {
    switch (usersMapV3.get(userId)) {
      case (null) { 0 };
      case (?user) { 1 + user.leftTeamCount + user.rightTeamCount };
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
                    { parent with leftTeamCount = parent.leftTeamCount + 1 };
                  };
                  case (#right) {
                    { parent with rightTeamCount = parent.rightTeamCount + 1 };
                  };
                };
                updateUser(parentId, updatedParent);
                switch (parent.position) {
                  case (?parentPos) { updateParentTeamCounts(parentId, parentPos) };
                  case (null) {};
                };
              };
            };
          };
        };
      };
    };
  };

  // ==================== PUBLIC FUNCTIONS ====================

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.remove(caller);
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
    initializeAdminUser();

    if (fullName.size() < 2 or mobile.size() < 10) {
      Runtime.trap("Invalid input: name must be at least 2 chars, mobile at least 10");
    };

    // Check duplicate mobile
    for ((_, u) in usersMapV3.entries()) {
      if (u.mobile == mobile) {
        Runtime.trap("Mobile number already registered");
      };
    };

    switch (plansMap.get(planId)) {
      case (null) { Runtime.trap("Invalid planId") };
      case (?_plan) {
        let userId = Int.abs(Time.now()).toText() # "_" # mobile;
        let refCode = generateReferralCode(fullName, mobile);
        // Ensure unique referral code
        let finalRefCode = switch (findUserIdByReferralCode(refCode)) {
          case (null) { refCode };
          case (?_) { refCode # mobile.size().toText() };
        };

        let (parentId, position) = placeNewUser(sponsorCode, userId);

        let user : User = {
          id = userId;
          fullName = fullName;
          mobile = mobile;
          sponsorCode = sponsorCode;
          myReferralCode = finalRefCode;
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
            updateUser(parentId, updatedParent);
          };
          case (null) {};
        };

        updateParentTeamCounts(userId, position);
        principalToUserIdMap.remove(caller);
        principalToUserIdMap.add(caller, userId);
        userId;
      };
    };
  };

  // 2. Send OTP (stub - returns test OTP)
  public shared func sendOTP(_mobile : Text) : async Text {
    "1234";
  };

  // 3. Verify OTP (stub - always true)
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
        principalToUserIdMap.remove(caller);
        principalToUserIdMap.add(caller, userId);
        return sessionToken;
      };
    };
    Runtime.trap("User not found with this mobile number");
  };

  // 5. Add User Binary Position
  public shared func addUserBinaryPosition(userId : UserId, parentId : UserId, position : Position) : async () {
    switch (usersMapV3.get(userId), usersMapV3.get(parentId)) {
      case (?user, ?parent) {
        updateUser(userId, { user with parentId = ?parentId; position = ?position });
        let updatedParent = switch (position) {
          case (#left) { { parent with leftChildId = ?userId } };
          case (#right) { { parent with rightChildId = ?userId } };
        };
        updateUser(parentId, updatedParent);
      };
      case (_, _) { Runtime.trap("User or parent not found") };
    };
  };

  // 6. Calculate Binary Income (manual trigger)
  public shared func calculateBinaryIncome(userId : UserId) : async Nat {
    switch (usersMapV3.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        switch (user.leftChildId, user.rightChildId) {
          case (?_l, ?_r) {
            creditIncome(userId, BINARY_PAIR_INCOME_AMOUNT, #binary, userId, null);
            BINARY_PAIR_INCOME_AMOUNT;
          };
          case (_, _) { 0 };
        };
      };
    };
  };

  // 7. Get User Dashboard
  public query func getUserDashboard(sessionToken : SessionToken) : async ?DashboardStats {
    switch (getUserIdFromSession(sessionToken)) {
      case (null) { null };
      case (?userId) {
        switch (usersMapV3.get(userId)) {
          case (null) { null };
          case (?user) {
            let totalTeam = user.leftTeamCount + user.rightTeamCount;
            var directReferrals = 0;
            for ((_, u) in usersMapV3.entries()) {
              if (toUpper(u.sponsorCode) == toUpper(user.myReferralCode)) {
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
              directIncome = user.directIncome;
              binaryIncome = user.binaryIncome;
              levelIncome = user.levelIncome;
              recentIncomeRecords = recentIncomes;
            };
          };
        };
      };
    };
  };

  // 8. Withdraw Request (no AccessControl needed - session token based)
  public shared func withdrawRequest(sessionToken : SessionToken, amount : Nat) : async Nat {
    switch (getUserIdFromSession(sessionToken)) {
      case (null) { Runtime.trap("Invalid session") };
      case (?userId) {
        switch (usersMapV3.get(userId)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) {
            if (user.walletBalance < amount) {
              Runtime.trap("Insufficient balance");
            };
            if (amount < 100) {
              Runtime.trap("Minimum withdrawal amount is ₹100");
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
            updateUser(userId, { user with walletBalance = Nat.sub(user.walletBalance, amount) });
            txId;
          };
        };
      };
    };
  };

  // 9. Admin Login
  public shared func adminLogin(password : Text) : async SessionToken {
    initializePlans();
    initializeAdminUser();
    if (password != ADMIN_PASSWORD) {
      Runtime.trap("Invalid admin credentials");
    };
    let sessionToken = generateSessionToken();
    adminSessionsMap.add(sessionToken, true);
    sessionToken;
  };

  // 10. Admin User List
  public query func adminUserList(adminToken : Text) : async [UserDto] {
    if (not isValidAdminToken(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    var users : [UserDto] = [];
    for ((_, user) in usersMapV3.entries()) {
      if (user.id != ADMIN_USERNAME) {
        users := users.concat([toUserDto(user)]);
      };
    };
    users;
  };

  // 11. Admin Activate User
  public shared func adminActivateUser(adminToken : Text, userId : UserId, isActive : Bool) : async () {
    if (not isValidAdminToken(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    switch (usersMapV3.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) { updateUser(userId, { user with isActive = isActive }) };
    };
  };

  // 12. Admin Get Payments
  public query func adminGetPayments(adminToken : Text) : async [Payment] {
    if (not isValidAdminToken(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    var payments : [Payment] = [];
    for ((_, payment) in paymentsMap.entries()) {
      payments := payments.concat([payment]);
    };
    payments;
  };

  // 13. Admin Approve Withdraw
  public shared func adminApproveWithdraw(adminToken : Text, txId : Nat, approved : Bool) : async () {
    if (not isValidAdminToken(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    switch (walletsMap.get(txId)) {
      case (null) { Runtime.trap("Transaction not found") };
      case (?tx) {
        let newStatus = if (approved) { #approved } else { #rejected };
        walletsMap.remove(txId);
        walletsMap.add(txId, { tx with status = newStatus });
        // If rejected, refund the wallet balance
        if (not approved) {
          switch (usersMapV3.get(tx.userId)) {
            case (?user) {
              updateUser(tx.userId, { user with walletBalance = user.walletBalance + tx.amount });
            };
            case (null) {};
          };
        };
      };
    };
  };

  // 14. Admin Get Total Business
  public query func adminGetTotalBusiness(adminToken : Text) : async {
    totalUsers : Nat;
    totalPlansSold : Nat;
    totalIncomeDistributed : Nat;
    totalWithdrawals : Nat;
  } {
    if (not isValidAdminToken(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    var totalUsers = 0;
    var totalPlansSold = 0;
    var totalIncomeDistributed = 0;
    for ((_, user) in usersMapV3.entries()) {
      if (user.id != ADMIN_USERNAME) {
        totalUsers += 1;
        if (user.isActive) { totalPlansSold += 1 };
        totalIncomeDistributed += user.totalIncome;
      };
    };
    var totalWithdrawals = 0;
    for ((_, tx) in walletsMap.entries()) {
      if (tx.txType == #debit and tx.status == #approved) {
        totalWithdrawals += tx.amount;
      };
    };
    { totalUsers; totalPlansSold; totalIncomeDistributed; totalWithdrawals };
  };

  // 15. Submit Payment
  public shared ({ caller }) func submitPayment(sessionToken : SessionToken, planId : Nat, upiRef : Text) : async Nat {
    switch (getUserIdFromSession(sessionToken)) {
      case (null) { Runtime.trap("Invalid session") };
      case (?userId) {
        switch (plansMap.get(planId)) {
          case (null) { Runtime.trap("Invalid plan") };
          case (?plan) {
            let paymentId = createPaymentRecordId();
            paymentsMap.add(paymentId, {
              id = paymentId;
              userId = userId;
              planId = planId;
              amount = plan.price;
              upiRef = upiRef;
              status = #pending;
              createdAt = Time.now();
            });
            paymentId;
          };
        };
      };
    };
  };

  // 16. Admin Verify Payment
  public shared func adminVerifyPayment(adminToken : Text, paymentId : Nat, verified : Bool) : async () {
    if (not isValidAdminToken(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    switch (paymentsMap.get(paymentId)) {
      case (null) { Runtime.trap("Payment not found") };
      case (?payment) {
        let newStatus = if (verified) { #verified } else { #rejected };
        paymentsMap.remove(paymentId);
        paymentsMap.add(paymentId, { payment with status = newStatus });
        if (verified) {
          switch (usersMapV3.get(payment.userId)) {
            case (?user) { updateUser(payment.userId, { user with isActive = true }) };
            case (null) {};
          };
        };
      };
    };
  };

  // 17. Get User Income Records
  public query func getUserIncomeRecords(sessionToken : SessionToken) : async [IncomeRecord] {
    switch (getUserIdFromSession(sessionToken)) {
      case (null) { [] };
      case (?userId) {
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

  // 18. Get User Wallet History (all transactions: credits + debits)
  public query func getUserWalletHistory(sessionToken : SessionToken) : async [WalletTransaction] {
    switch (getUserIdFromSession(sessionToken)) {
      case (null) { [] };
      case (?userId) {
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

  // 19. Get Binary Tree (1 level)
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
        ?{ user = toUserDto(user); left = leftUser; right = rightUser };
      };
    };
  };

  // 20. Admin Get Products
  public query func adminGetProducts(adminToken : Text) : async [Product] {
    if (not isValidAdminToken(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    var products : [Product] = [];
    for ((_, product) in productsMap.entries()) {
      products := products.concat([product]);
    };
    products;
  };

  // Add Product
  public shared func addProduct(
    adminToken : Text,
    name : Text,
    description : Text,
    price : Nat,
    imageUrl : Text
  ) : async Nat {
    if (not isValidAdminToken(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    let productId = createProductRecordId();
    productsMap.add(productId, { id = productId; name; description; price; imageUrl; isActive = true });
    productId;
  };

  // Update Product
  public shared func updateProduct(
    adminToken : Text,
    productId : Nat,
    name : Text,
    description : Text,
    price : Nat,
    imageUrl : Text,
    isActive : Bool
  ) : async () {
    if (not isValidAdminToken(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    switch (productsMap.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        productsMap.remove(productId);
        productsMap.add(productId, { id = productId; name; description; price; imageUrl; isActive });
      };
    };
  };

  // 21. Get User Profile By Session
  public query func getUserProfileById(sessionToken : SessionToken) : async ?User {
    switch (getUserIdFromSession(sessionToken)) {
      case (null) { null };
      case (?userId) {
        usersMapV3.get(userId);
      };
    };
  };

  // 22. Update User Profile
  public shared func updateUserProfile(sessionToken : SessionToken, fullName : Text) : async () {
    switch (getUserIdFromSession(sessionToken)) {
      case (null) { Runtime.trap("Invalid session") };
      case (?userId) {
        switch (usersMapV3.get(userId)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) { updateUser(userId, { user with fullName = fullName }) };
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

  // Get Admin Settings (public - for payment page)
  public query func getAdminSettings() : async AdminSettings {
    adminSettings;
  };

  // Admin Update Settings
  public shared func adminUpdateSettings(
    adminToken : Text,
    upiId : Text,
    accountName : Text,
    activationAmount : Nat,
    qrCodeUrl : Text,
    companyName : Text,
    supportNumber : Text
  ) : async () {
    if (not isValidAdminToken(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    adminSettings := { upiId; accountName; activationAmount; qrCodeUrl; companyName; supportNumber };
  };

  // 23. Admin Get Pending Registrations
  public query func adminGetPendingRegistrations(adminToken : Text) : async [UserRegistrationDto] {
    if (not isValidAdminToken(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    var result : [UserRegistrationDto] = [];
    for ((_, user) in usersMapV3.entries()) {
      if (user.id != ADMIN_USERNAME) {
        let planName = switch (plansMap.get(user.planId)) {
          case (?plan) { plan.name };
          case (null) { "Unknown" };
        };
        let planPrice = switch (plansMap.get(user.planId)) {
          case (?plan) { plan.price };
          case (null) { 0 };
        };
        result := result.concat([{
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
        }]);
      };
    };
    result;
  };

  // 24. Admin Approve Registration
  public shared func adminApproveRegistration(adminToken : Text, userId : UserId, approved : Bool) : async () {
    if (not isValidAdminToken(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    switch (usersMapV3.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        if (approved) {
          updateUser(userId, { user with isActive = true; paymentStatus = #approved });

          // Find sponsor
          let sponsorId = switch (findUserIdByReferralCode(user.sponsorCode)) {
            case (?uid) { uid };
            case (null) { ADMIN_USERNAME };
          };

          // 1. Direct Income: fixed ₹100 to sponsor
          distributeDirectIncome(sponsorId, DIRECT_INCOME_AMOUNT);

          // 2. Level Income: fixed amounts up the parent chain
          distributeLevelIncome(userId, LEVEL_INCOME_RATES);

          // 3. Binary Pair Income: check sponsor and ancestors
          var ancestorOpt : ?UserId = ?sponsorId;
          var depth = 0;
          while (depth < 20) {
            switch (ancestorOpt) {
              case (null) { depth := 20 };
              case (?ancestorId) {
                checkAndDistributeBinaryPairIncome(ancestorId);
                ancestorOpt := switch (usersMapV3.get(ancestorId)) {
                  case (?a) { a.parentId };
                  case (null) { null };
                };
                depth += 1;
              };
            };
          };
        } else {
          updateUser(userId, { user with isActive = false; paymentStatus = #rejected });
        };
      };
    };
  };

  // 25. Admin Update User
  public shared func adminUpdateUser(adminToken : Text, userId : UserId, fullName : Text, mobile : Text) : async () {
    if (not isValidAdminToken(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    switch (usersMapV3.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) { updateUser(userId, { user with fullName; mobile }) };
    };
  };

  // 26. Admin Delete User
  public shared func adminDeleteUser(adminToken : Text, userId : UserId) : async () {
    if (not isValidAdminToken(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    switch (usersMapV3.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?_) { usersMapV3.remove(userId) };
    };
  };

  // 27. Admin Get Withdrawals
  public query func adminGetWithdrawals(adminToken : Text) : async [WalletTransaction] {
    if (not isValidAdminToken(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    var txs : [WalletTransaction] = [];
    for ((_, tx) in walletsMap.entries()) {
      if (tx.txType == #debit) {
        txs := txs.concat([tx]);
      };
    };
    txs;
  };

  // 28. Get My Withdrawals
  public query func getMyWithdrawals(sessionToken : SessionToken) : async [WalletTransaction] {
    switch (getUserIdFromSession(sessionToken)) {
      case (null) { [] };
      case (?userId) {
        var txs : [WalletTransaction] = [];
        for ((_, tx) in walletsMap.entries()) {
          if (tx.userId == userId and tx.txType == #debit) {
            txs := txs.concat([tx]);
          };
        };
        txs;
      };
    };
  };

  // Admin Get Income Reports
  public query func adminGetIncomeReports(adminToken : Text) : async [IncomeRecord] {
    if (not isValidAdminToken(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    var records : [IncomeRecord] = [];
    for ((_, rec) in incomesMap.entries()) {
      records := records.concat([rec]);
    };
    records;
  };
};
