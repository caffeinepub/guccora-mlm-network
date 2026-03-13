# Guccora MLM Network

## Current State
Registration page (Step 4) shows QR code, UPI ID/name, payment app badges, a UTR input field, a screenshot URL text input, and a submit button. Admin Registrations page shows pending registrations with name, mobile, plan, UTR, screenshot link, approve/reject buttons.

## Requested Changes (Diff)

### Add
- Numbered payment instructions on Step 4 payment page
- BHIM badge alongside PhonePe, Google Pay, Paytm
- File upload input for payment screenshot (converts to base64 stored in screenshotUrl)
- Preview of selected screenshot before submit
- In admin Payments Verification: render screenshot as inline image if it's a base64/data URL

### Modify
- QR code image path updated to new uploaded image: `/assets/uploads/AccountQRCodeCentral-Bank-Of-India-5251_LIGHT_THEME-1-1.png`
- Screenshot input changed from URL text field to file upload button
- Submit button renamed to "Submit Payment"
- Admin Registrations page title changed from "New Registrations" to "Payments Verification"
- Admin screenshot display: if screenshotUrl is base64, show as img; if http URL, show as link

### Remove
- Screenshot URL text input (replaced by file upload)

## Implementation Plan
1. Update Register.tsx Step 4: new QR path, numbered instructions, file upload for screenshot, BHIM badge, "Submit Payment" button label
2. Update AdminRegistrations.tsx: rename title, show screenshot as image when base64 data URL
