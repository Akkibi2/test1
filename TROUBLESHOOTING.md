# Troubleshooting: 404 Error for Customer ID

## The Problem

You're getting a **404 error** when trying to access customer ID `4309921237`. This means the Google Ads API cannot find this account with your current credentials.

## Most Common Cause: Missing Manager Account ID

If you're accessing **client accounts** through a **manager (MCC) account**, you need to specify your manager account ID in the `login-customer-id` header.

### Solution

Add your **manager account ID** to `.env.local`:

```env
GOOGLE_ADS_LOGIN_CUSTOMER_ID=your_manager_account_id
```

**Example:**
```env
# If your manager account ID is 123-456-7890
GOOGLE_ADS_LOGIN_CUSTOMER_ID=1234567890
```

**How to find your manager account ID:**
1. Go to [https://ads.google.com](https://ads.google.com)
2. Look at the top-right corner
3. If you see multiple accounts, the **top-level account** is your manager account
4. Copy the 10-digit number (remove hyphens)

## Other Possible Causes

### 1. Invalid Customer ID

**Check:**
- Is `4309921237` the correct customer ID?
- Does this account exist in your Google Ads?
- Is it exactly 10 digits with no hyphens?

**How to verify:**
1. Log in to Google Ads
2. Switch to the account you want to monitor
3. Check the customer ID in the top-right corner
4. Make sure it matches exactly

### 2. No Access to Account

**Check:**
- Do your OAuth credentials have access to this account?
- Did you authenticate with the correct Google account?

**Solution:**
1. Re-run the OAuth flow: `node scripts/get-refresh-token.js`
2. Make sure you sign in with the Google account that has access to customer `4309921237`
3. Update the refresh token in `.env.local`

### 3. Developer Token Not Approved

**Check:**
- Is your developer token in "Test" or "Standard" mode?
- In Test mode, you can only access accounts owned by the same Google account

**Solution:**
- If in Test mode, make sure the OAuth account matches the developer token account
- For production use, apply for Standard Access in Google Ads API Center

## Quick Fix Steps

1. **Add manager account ID** (if applicable):
   ```bash
   # Edit .env.local
   GOOGLE_ADS_LOGIN_CUSTOMER_ID=your_manager_account_id
   ```

2. **Restart the dev server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

3. **Test again** by refreshing the dashboard

## Still Not Working?

### Verify Your Configuration

Run this test to check your API access:

```bash
curl -X POST \
  "https://googleads.googleapis.com/v17/customers/4309921237/googleAds:searchStream" \
  -H "Content-Type: application/json" \
  -H "developer-token: YOUR_DEVELOPER_TOKEN" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "login-customer-id: YOUR_MANAGER_ACCOUNT_ID" \
  -d '{
    "query": "SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1"
  }'
```

Replace:
- `YOUR_DEVELOPER_TOKEN` with your actual developer token
- `YOUR_ACCESS_TOKEN` with a fresh access token
- `YOUR_MANAGER_ACCOUNT_ID` with your manager account ID (if applicable)

### Check the Error Response

The improved error messages will now tell you:
- **404**: Account not found or no access → Check customer ID and login-customer-id
- **401**: Authentication failed → Refresh your OAuth token
- **403**: Permission denied → Check developer token and account access

## Need More Help?

1. **Google Ads API Documentation**: [https://developers.google.com/google-ads/api/docs/start](https://developers.google.com/google-ads/api/docs/start)
2. **Manager Accounts Guide**: [https://developers.google.com/google-ads/api/docs/concepts/call-structure#cid](https://developers.google.com/google-ads/api/docs/concepts/call-structure#cid)
3. **OAuth Troubleshooting**: [https://developers.google.com/identity/protocols/oauth2/web-server#handlingresponse](https://developers.google.com/identity/protocols/oauth2/web-server#handlingresponse)
