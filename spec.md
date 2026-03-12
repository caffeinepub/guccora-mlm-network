# Guccora MLM Network

## Current State
- Users register and are immediately set as `isActive = true`
- UTR number is stored only in a separate Payment record via `submitPayment`
- Login bypasses any status check
- Admin Payments page shows payment records but no user details (name, mobile)
- No link between registration and payment approval for account activation

## Requested Changes (Diff)

### Add
- `utrNumber: Text`, `screenshotUrl: Text`, `paymentStatus: { #pendingVerification; #approved; #rejected }` fields to `User` type
- `UserRegistrationDto` type for admin view (id, fullName, mobile, planId, planName, planPrice, utrNumber, screenshotUrl, paymentStatus, joinedAt)
- Backend: `registerUser` now accepts `utrNumber` and `screenshotUrl` params, creates user with `isActive = false` and `paymentStatus = #pendingVerification`
- Backend: `adminGetPendingRegistrations()` query returning all users with `paymentStatus = #pendingVerification`
- Backend: `adminApproveRegistration(userId, approved)` sets `isActive = true/false` and updates `paymentStatus`
- Frontend: New `AdminRegistrations.tsx` page listing pending registrations with Name, Mobile, Plan, UTR, Screenshot link, Approve/Reject buttons
- Frontend: Registration completion screen shows "Payment Pending Verification" message instead of navigating to dashboard
- Frontend: Login page shows specific message when account is pending approval

### Modify
- `loginUserByMobile`: check `user.isActive`, if false trap with "Account pending admin approval. Please wait."
- `Register.tsx`: add optional screenshot URL input; after submit show pending verification screen
- `AdminLayout.tsx`: add Registrations nav link
- `App.tsx` (routing): add `/admin/registrations` route
- `useQueries.ts`: add `useAdminPendingRegistrations` and `useAdminApproveRegistration` hooks
- `backend.d.ts`: update types to match new backend

### Remove
- Nothing removed

## Implementation Plan
1. Update `src/backend/main.mo` — add fields, modify registerUser, loginUserByMobile, add new admin APIs
2. Update `src/frontend/src/backend.d.ts` — reflect new types and function signatures
3. Update `src/frontend/src/hooks/useQueries.ts` — add new hooks
4. Update `src/frontend/src/pages/Register.tsx` — new registerUser call signature, pending screen
5. Create `src/frontend/src/pages/admin/AdminRegistrations.tsx` — registrations approval UI
6. Update `src/frontend/src/components/AdminLayout.tsx` — add Registrations nav
7. Update `src/frontend/src/App.tsx` — add route
