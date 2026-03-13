# Guccora MLM Network

## Current State
Fresh rebuild. Previous version had deployment errors. Restoring from last stable working version.

## Requested Changes (Diff)

### Add
- Clean Motoko backend with user registration, OTP (stubbed), login, dashboard APIs
- Admin login (username: admin, password: Admin@123)
- Admin panel with Users Management and Payments Verification
- User registration flow (Full Name, Mobile, OTP, Address, Sponsor ID)
- OTP verification page (stubbed to always succeed for deployment stability)
- User login (mobile + password)
- User dashboard (profile, wallet, referral link, team counts, income)
- Homepage with purple/gold design (exact same as last working version)

### Modify
- N/A (fresh build)

### Remove
- Any broken deployment config

## Implementation Plan
1. Backend: registerUser, sendOTP (stub), verifyOTP (stub), loginUser, getUserDashboard, adminLogin, adminGetUsers, adminVerifyPayment, submitPayment
2. Frontend: Homepage (locked purple/gold design), /register, /verify-otp, /login, /dashboard, /admin/login, /admin/dashboard
3. Admin panel sections: Dashboard overview, Users Management, Payments Verification
4. Payment flow: user selects plan, scans QR code, submits UTR, admin approves
5. All homepage buttons wired: Free Join -> /register, Login -> /login, Join Free Now -> /register
