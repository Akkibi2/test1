# Google Ads Multi-Account Dashboard

A modern, responsive dashboard for monitoring multiple Google Ads accounts with real-time metrics tracking, date range filtering, and cost per conversion analysis.

## Features

✨ **Multi-Account Support** - Monitor multiple Google Ads accounts in one unified dashboard  
📊 **Key Metrics** - Track spend, conversions, cost per conversion, impressions, clicks, and CTR  
📅 **Date Range Filtering** - Preset ranges (Today, Last 7/30 days, This month) or custom dates  
🎨 **Modern UI** - Glassmorphism design with smooth animations and responsive layout  
🔄 **Auto-Refresh** - Automatic OAuth token refresh for seamless authentication  
📱 **Mobile Responsive** - Works perfectly on desktop, tablet, and mobile devices

## Prerequisites

Before you begin, you'll need:

1. **Google Ads Account** with active campaigns
2. **Google Ads Developer Token** ([Get it here](https://ads.google.com) → Tools & Settings → API Center)
3. **Google Cloud Project** with Google Ads API enabled
4. **OAuth 2.0 Credentials** (Client ID and Secret)
5. **Node.js** 18+ installed on your machine

## Setup Instructions

### Step 1: Clone and Install

```bash
cd /Users/ankit/Desktop/App/my-app
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in your credentials:
   ```env
   GOOGLE_ADS_DEVELOPER_TOKEN=your_22_character_token
   GOOGLE_ADS_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_ADS_CLIENT_SECRET=your_client_secret
   GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
   GOOGLE_ADS_CUSTOMER_IDS=1234567890,9876543210
   ```

### Step 3: Generate OAuth Refresh Token

If you don't have a refresh token yet, run the helper script:

```bash
node scripts/get-refresh-token.js
```

This will:
1. Open your browser for Google authentication
2. Guide you through the OAuth flow
3. Display your refresh token in the terminal
4. Copy the refresh token to your `.env.local` file

### Step 4: Run the Dashboard

```bash
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) in your browser.

## Project Structure

```
my-app/
├── app/
│   ├── api/
│   │   └── google-ads/
│   │       └── metrics/
│   │           └── route.ts          # API endpoint for fetching metrics
│   ├── dashboard/
│   │   └── page.tsx                  # Main dashboard page
│   └── globals.css                   # Global styles
├── components/
│   ├── AccountTable.tsx              # Sortable account metrics table
│   ├── DateRangePicker.tsx           # Date range selector
│   └── MetricsCard.tsx               # Metric display card
├── lib/
│   └── googleAds.ts                  # Google Ads API client
├── types/
│   └── googleAds.ts                  # TypeScript type definitions
├── scripts/
│   └── get-refresh-token.js          # OAuth token generator
├── .env.example                      # Environment template
└── .env.local                        # Your credentials (gitignored)
```

## API Endpoints

### GET `/api/google-ads/metrics`

Fetch metrics for configured accounts.

**Query Parameters:**
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format
- `customerIds` (optional): Comma-separated customer IDs (defaults to env var)

**Example:**
```bash
curl "http://localhost:3000/api/google-ads/metrics?startDate=2025-12-01&endDate=2025-12-12"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalSpend": 1500.00,
      "totalConversions": 45,
      "averageCostPerConversion": 33.33
    },
    "accounts": [
      {
        "customerId": "1234567890",
        "customerName": "My Campaign",
        "spend": 750.00,
        "conversions": 20,
        "costPerConversion": 37.50,
        "impressions": 50000,
        "clicks": 1200,
        "ctr": 2.4
      }
    ]
  }
}
```

## Troubleshooting

### "Missing required environment variables"
- Verify all variables in `.env.local` are set correctly
- Make sure there are no extra spaces or quotes around values

### "Failed to refresh token"
- Your refresh token may be invalid or expired
- Re-run `node scripts/get-refresh-token.js` to generate a new one
- Ensure your OAuth Client ID and Secret are correct

### "Customer not found"
- Check that customer IDs are 10 digits with no hyphens
- Verify you have access to these accounts in Google Ads
- Make sure the accounts are active

### "Developer token is invalid"
- Verify your developer token in Google Ads API Center
- Check that the token is exactly 22 characters
- Ensure your token status is "Approved" or "Test" mode

## Security Notes

⚠️ **Never commit `.env.local` to version control**  
⚠️ **Keep your refresh token secure** - it provides access to your Google Ads accounts  
⚠️ **Use environment variables** for all sensitive credentials  
⚠️ **Rotate tokens regularly** for enhanced security

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: CSS with Tailwind CSS
- **Fonts**: Inter (Google Fonts)
- **API**: Google Ads API v17
- **Authentication**: OAuth 2.0

## License

MIT

## Support

For issues related to:
- **Google Ads API**: [Official Documentation](https://developers.google.com/google-ads/api/docs/start)
- **OAuth Setup**: [Google OAuth Guide](https://developers.google.com/identity/protocols/oauth2)
- **This Dashboard**: Open an issue in this repository

---

Built with ❤️ using Next.js and Google Ads API
