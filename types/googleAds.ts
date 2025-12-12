export interface GoogleAdsMetrics {
    customerId: string;
    customerName?: string;
    spend: number; // in currency units (e.g., dollars)
    conversions: number;
    costPerConversion: number;
    impressions?: number;
    clicks?: number;
    ctr?: number; // click-through rate
}

export interface GoogleAdsApiResponse {
    results: Array<{
        customer: {
            id: string;
            descriptiveName?: string;
        };
        metrics: {
            costMicros: string;
            conversions: number;
            impressions?: string;
            clicks?: string;
        };
        segments?: {
            date: string;
        };
    }>;
    fieldMask?: string;
    nextPageToken?: string;
}

export interface MetricsRequest {
    customerIds: string[];
    startDate: string; // YYYY-MM-DD format
    endDate: string; // YYYY-MM-DD format
}

export interface MetricsResponse {
    success: boolean;
    data?: {
        summary: {
            totalSpend: number;
            totalConversions: number;
            averageCostPerConversion: number;
        };
        accounts: GoogleAdsMetrics[];
    };
    error?: string;
}

export interface DateRange {
    startDate: Date;
    endDate: Date;
    label?: string;
}
