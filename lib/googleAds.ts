/**
 * Google Ads API Client
 * Handles authentication and API requests to Google Ads API
 */

interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

interface GoogleAdsConfig {
    developerToken: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
}

class GoogleAdsClient {
    private config: GoogleAdsConfig;
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor() {
        this.config = {
            developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
            clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
            refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
        };

        this.validateConfig();
    }

    private validateConfig(): void {
        const missing: string[] = [];

        if (!this.config.developerToken) missing.push('GOOGLE_ADS_DEVELOPER_TOKEN');
        if (!this.config.clientId) missing.push('GOOGLE_ADS_CLIENT_ID');
        if (!this.config.clientSecret) missing.push('GOOGLE_ADS_CLIENT_SECRET');
        if (!this.config.refreshToken) missing.push('GOOGLE_ADS_REFRESH_TOKEN');

        if (missing.length > 0) {
            throw new Error(
                `Missing required environment variables: ${missing.join(', ')}. ` +
                'Please check your .env.local file.'
            );
        }
    }

    /**
     * Get a valid access token, refreshing if necessary
     */
    private async getAccessToken(): Promise<string> {
        // Check if current token is still valid (with 5 minute buffer)
        const now = Date.now();
        if (this.accessToken && this.tokenExpiry > now + 5 * 60 * 1000) {
            return this.accessToken;
        }

        // Refresh the token
        const tokenUrl = 'https://oauth2.googleapis.com/token';
        const params = new URLSearchParams({
            refresh_token: this.config.refreshToken,
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            grant_type: 'refresh_token',
        });

        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Failed to refresh token: ${response.status} - ${errorText}`;

                // Check for invalid_grant error (expired/revoked refresh token)
                if (errorText.includes('invalid_grant') || errorText.includes('expired') || errorText.includes('revoked')) {
                    errorMessage += `\n\n🔑 Your refresh token is invalid or expired.\n\nTo fix this:\n1. Run: node scripts/get-refresh-token.js\n2. Follow the browser authentication flow\n3. Copy the new refresh token to .env.local\n4. Restart the dev server\n\nNote: Refresh tokens can expire if you:\n- Changed your Google account password\n- Revoked app access in your Google account\n- Haven't used the token in a long time`;
                }

                throw new Error(errorMessage);
            }

            const data: TokenResponse = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiry = now + data.expires_in * 1000;

            return this.accessToken;
        } catch (error) {
            throw new Error(
                `OAuth token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Execute a Google Ads API search query
     */
    async search(customerId: string, query: string): Promise<any> {
        const accessToken = await this.getAccessToken();

        // Remove hyphens from customer ID if present
        const cleanCustomerId = customerId.replace(/-/g, '');

        const url = `https://googleads.googleapis.com/v17/customers/${cleanCustomerId}/googleAds:searchStream`;

        // Prepare headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'developer-token': this.config.developerToken,
            'Authorization': `Bearer ${accessToken}`,
        };

        // Add login-customer-id if specified (for manager accounts)
        const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
        if (loginCustomerId) {
            headers['login-customer-id'] = loginCustomerId.replace(/-/g, '');
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                const errorText = await response.text();

                // Provide helpful error messages
                let errorMessage = `Google Ads API request failed for customer ${customerId}: ${response.status}`;

                if (response.status === 404) {
                    errorMessage += `\n\nPossible causes:
- Customer ID ${customerId} doesn't exist or you don't have access to it
- If accessing a client account, you may need to set GOOGLE_ADS_LOGIN_CUSTOMER_ID (your manager account ID) in .env.local
- Verify the customer ID is correct (10 digits, no hyphens)
- Check that your OAuth credentials have access to this account`;
                } else if (response.status === 401) {
                    errorMessage += '\n\nAuthentication failed. Your access token may be invalid or expired.';
                } else if (response.status === 403) {
                    errorMessage += '\n\nPermission denied. Check that your developer token is approved and you have access to this account.';
                }

                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            throw new Error(
                `Google Ads API error for customer ${customerId}: ${error instanceof Error ? error.message : 'Unknown error'
                }`
            );
        }
    }

    /**
     * Get metrics for a customer within a date range
     */
    async getMetrics(
        customerId: string,
        startDate: string,
        endDate: string
    ): Promise<{
        customerId: string;
        customerName: string;
        spend: number;
        conversions: number;
        costPerConversion: number;
        impressions: number;
        clicks: number;
    }> {
        const query = `
      SELECT
        customer.id,
        customer.descriptive_name,
        metrics.cost_micros,
        metrics.conversions,
        metrics.impressions,
        metrics.clicks
      FROM customer
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
    `;

        const response = await this.search(customerId, query);

        // Parse the response
        let totalCostMicros = 0;
        let totalConversions = 0;
        let totalImpressions = 0;
        let totalClicks = 0;
        let customerName = '';

        if (response.results && response.results.length > 0) {
            for (const result of response.results) {
                if (result.customer?.descriptiveName) {
                    customerName = result.customer.descriptiveName;
                }

                if (result.metrics) {
                    totalCostMicros += parseInt(result.metrics.costMicros || '0', 10);
                    totalConversions += parseFloat(result.metrics.conversions || '0');
                    totalImpressions += parseInt(result.metrics.impressions || '0', 10);
                    totalClicks += parseInt(result.metrics.clicks || '0', 10);
                }
            }
        }

        const spend = totalCostMicros / 1_000_000; // Convert micros to currency units
        const costPerConversion = totalConversions > 0 ? spend / totalConversions : 0;

        return {
            customerId: customerId.replace(/-/g, ''),
            customerName: customerName || `Account ${customerId}`,
            spend,
            conversions: totalConversions,
            costPerConversion,
            impressions: totalImpressions,
            clicks: totalClicks,
        };
    }
}

// Lazy initialization - only create client when needed
let clientInstance: GoogleAdsClient | null = null;

export function getGoogleAdsClient(): GoogleAdsClient {
    if (!clientInstance) {
        clientInstance = new GoogleAdsClient();
    }
    return clientInstance;
}
