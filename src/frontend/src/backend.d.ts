import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type UserId = string;
export interface Plan {
    id: bigint;
    levelIncomeRates: Array<bigint>;
    directIncomePercent: bigint;
    name: string;
    binaryIncomePercent: bigint;
    price: bigint;
}
export interface IncomeRecord {
    id: bigint;
    userId: UserId;
    createdAt: bigint;
    level?: bigint;
    fromUserId: UserId;
    incomeType: Variant_level_direct_binary;
    amount: bigint;
}
export interface User {
    id: UserId;
    directIncome: bigint;
    planId: bigint;
    rightTeamCount: bigint;
    joinedAt: bigint;
    rightChildId?: UserId;
    totalIncome: bigint;
    levelIncome: bigint;
    fullName: string;
    leftChildId?: UserId;
    isActive: boolean;
    binaryIncome: bigint;
    myReferralCode: string;
    mobile: string;
    position?: Position;
    parentId?: UserId;
    leftTeamCount: bigint;
    walletBalance: bigint;
    sponsorCode: string;
    utrNumber: string;
    screenshotUrl: string;
    paymentStatus: PaymentStatus;
}
export type SessionToken = string;
export interface UserDto {
    id: UserId;
    directIncome: bigint;
    planId: bigint;
    rightTeamCount: bigint;
    joinedAt: bigint;
    totalIncome: bigint;
    levelIncome: bigint;
    fullName: string;
    binaryIncome: bigint;
    myReferralCode: string;
    mobile: string;
    leftTeamCount: bigint;
    walletBalance: bigint;
    sponsorCode: string;
    isActive: boolean;
    paymentStatus: PaymentStatus;
}
export interface UserRegistrationDto {
    id: UserId;
    fullName: string;
    mobile: string;
    planId: bigint;
    planName: string;
    planPrice: bigint;
    utrNumber: string;
    screenshotUrl: string;
    paymentStatus: PaymentStatus;
    joinedAt: bigint;
}
export interface WalletTransaction {
    id: bigint;
    status: Variant_pending_approved_rejected;
    userId: UserId;
    note: string;
    createdAt: bigint;
    txType: Variant_credit_debit;
    amount: bigint;
}
export interface Payment {
    id: bigint;
    status: Variant_verified_pending_rejected;
    planId: bigint;
    userId: UserId;
    createdAt: bigint;
    upiRef: string;
    amount: bigint;
}
export interface DashboardStats {
    directReferrals: bigint;
    rightTeamCount: bigint;
    totalIncome: bigint;
    totalTeam: bigint;
    recentIncomeRecords: Array<IncomeRecord>;
    leftTeamCount: bigint;
    walletBalance: bigint;
    directIncome: bigint;
    binaryIncome: bigint;
    levelIncome: bigint;
}
export interface AdminSettings {
    upiId: string;
    accountName: string;
    activationAmount: bigint;
    qrCodeUrl: string;
    companyName: string;
    supportNumber: string;
}
export interface UserProfile {
    userId: string;
    fullName: string;
    myReferralCode: string;
    mobile: string;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    isActive: boolean;
    imageUrl: string;
    price: bigint;
}
export enum Position {
    left = "left",
    right = "right"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_credit_debit {
    credit = "credit",
    debit = "debit"
}
export enum Variant_level_direct_binary {
    level = "level",
    direct = "direct",
    binary = "binary"
}
export enum Variant_pending_approved_rejected {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum Variant_verified_pending_rejected {
    verified = "verified",
    pending = "pending",
    rejected = "rejected"
}
export enum PaymentStatus {
    pendingVerification = "pendingVerification",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    addProduct(adminToken: string, name: string, description: string, price: bigint, imageUrl: string): Promise<bigint>;
    addUserBinaryPosition(userId: UserId, parentId: UserId, position: Position): Promise<void>;
    adminActivateUser(adminToken: string, userId: UserId, isActive: boolean): Promise<void>;
    adminApproveRegistration(adminToken: string, userId: UserId, approved: boolean): Promise<void>;
    adminApproveWithdraw(adminToken: string, txId: bigint, approved: boolean): Promise<void>;
    adminDeleteUser(adminToken: string, userId: string): Promise<void>;
    adminGetPayments(adminToken: string): Promise<Array<Payment>>;
    adminGetPendingRegistrations(adminToken: string): Promise<Array<UserRegistrationDto>>;
    adminGetProducts(adminToken: string): Promise<Array<Product>>;
    adminGetTotalBusiness(adminToken: string): Promise<{
        totalIncomeDistributed: bigint;
        totalPlansSold: bigint;
        totalUsers: bigint;
        totalWithdrawals: bigint;
    }>;
    adminGetWithdrawals(adminToken: string): Promise<Array<WalletTransaction>>;
    adminGetIncomeReports(adminToken: string): Promise<Array<IncomeRecord>>;
    adminLogin(password: string): Promise<SessionToken>;
    adminUpdateUser(adminToken: string, userId: string, fullName: string, mobile: string): Promise<void>;
    adminUpdateSettings(adminToken: string, upiId: string, accountName: string, activationAmount: bigint, qrCodeUrl: string, companyName: string, supportNumber: string): Promise<void>;
    adminUserList(adminToken: string): Promise<Array<UserDto>>;
    adminVerifyPayment(adminToken: string, paymentId: bigint, verified: boolean): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateBinaryIncome(userId: UserId): Promise<bigint>;
    getAdminSettings(): Promise<AdminSettings>;
    getBinaryTree(userId: UserId): Promise<{
        left?: UserDto;
        user: UserDto;
        right?: UserDto;
    } | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPlans(): Promise<Array<Plan>>;
    getProducts(): Promise<Array<Product>>;
    getUserDashboard(sessionToken: SessionToken): Promise<DashboardStats | null>;
    getUserIncomeRecords(sessionToken: SessionToken): Promise<Array<IncomeRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserProfileById(sessionToken: SessionToken): Promise<User | null>;
    getUserWalletHistory(sessionToken: SessionToken): Promise<Array<WalletTransaction>>;
    getMyWithdrawals(sessionToken: SessionToken): Promise<Array<WalletTransaction>>;
    isCallerAdmin(): Promise<boolean>;
    loginUserByMobile(mobile: string, otp: string): Promise<SessionToken>;
    registerUser(fullName: string, mobile: string, sponsorCode: string, planId: bigint, utrNumber: string, screenshotUrl: string, password: string): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendOTP(mobile: string): Promise<string>;
    submitPayment(sessionToken: SessionToken, planId: bigint, upiRef: string): Promise<bigint>;
    updateProduct(adminToken: string, productId: bigint, name: string, description: string, price: bigint, imageUrl: string, isActive: boolean): Promise<void>;
    updateUserProfile(sessionToken: SessionToken, fullName: string): Promise<void>;
    verifyOTP(mobile: string, otp: string): Promise<boolean>;
    withdrawRequest(sessionToken: SessionToken, amount: bigint): Promise<bigint>;
}
