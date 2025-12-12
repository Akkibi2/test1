import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAdsClient } from '@/lib/googleAds';
import type { MetricsResponse } from '@/types/googleAds';

export async function GET(request: NextRequest) {
    try {
        // Parse query parameters
        const searchParams = request.nextUrl.searchParams;
        const customerIdsParam = searchParams.get('customerIds');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Validate required parameters
        if (!startDate || !endDate) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required parameters: startDate and endDate are required (YYYY-MM-DD format)',
                } as MetricsResponse,
                { status: 400 }
            );
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid date format. Use YYYY-MM-DD format',
                } as MetricsResponse,
                { status: 400 }
            );
        }

        // Get customer IDs from parameter or environment variable
        let customerIds: string[];
        if (customerIdsParam) {
            customerIds = customerIdsParam.split(',').map(id => id.trim());
        } else {
            const envCustomerIds = process.env.GOOGLE_ADS_CUSTOMER_IDS;
            if (!envCustomerIds) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'No customer IDs provided. Set GOOGLE_ADS_CUSTOMER_IDS in .env.local or pass customerIds parameter',
                    } as MetricsResponse,
                    { status: 400 }
                );
            }
            customerIds = envCustomerIds.split(',').map(id => id.trim());
        }

        if (customerIds.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No customer IDs provided',
                } as MetricsResponse,
                { status: 400 }
            );
        }

        // Fetch metrics for all accounts in parallel
        const googleAdsClient = getGoogleAdsClient();
        const metricsPromises = customerIds.map(customerId =>
            googleAdsClient.getMetrics(customerId, startDate, endDate)
        );

        const accountsMetrics = await Promise.all(metricsPromises);

        // Calculate summary metrics
        const totalSpend = accountsMetrics.reduce((sum: number, account) => sum + account.spend, 0);
        const totalConversions = accountsMetrics.reduce(
            (sum: number, account) => sum + account.conversions,
            0
        );
        const averageCostPerConversion =
            totalConversions > 0 ? totalSpend / totalConversions : 0;

        const response: MetricsResponse = {
            success: true,
            data: {
                summary: {
                    totalSpend,
                    totalConversions,
                    averageCostPerConversion,
                },
                accounts: accountsMetrics.map((account) => ({
                    customerId: account.customerId,
                    customerName: account.customerName,
                    spend: account.spend,
                    conversions: account.conversions,
                    costPerConversion: account.costPerConversion,
                    impressions: account.impressions,
                    clicks: account.clicks,
                    ctr: account.clicks > 0 ? (account.clicks / account.impressions) * 100 : 0,
                })),
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Google Ads API error:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred',
            } as MetricsResponse,
            { status: 500 }
        );
    }
}
