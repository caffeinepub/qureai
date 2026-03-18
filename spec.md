# QureAi

## Current State
WalletPage has DepositTab and WithdrawTab. DepositTab shows wallet address as text, no QR code. Crypto enum in history uses .toUpperCase() which may break if the value is not a plain string.

## Requested Changes (Diff)

### Add
- QR code rendered from wallet address in DepositTab
- Network label per crypto (USDT=TRC-20, BNB=BEP-20, TRX=TRC-20, ETH=ERC-20)
- Safe cryptoLabel() helper to display crypto enum safely

### Modify
- Replace raw .toUpperCase() on crypto enum with safe helper
- Improve history empty state
- Make address card more prominent

### Remove
- Nothing

## Implementation Plan
1. Add qrcode.react or lightweight QR lib
2. Add cryptoLabel helper
3. Render QR in DepositTab
4. Update history rows with safe label
5. Add empty state messages
