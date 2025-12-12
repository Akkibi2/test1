'use client';

import { useState, useEffect } from 'react';
import DateRangePicker, { type DateRange } from '@/components/DateRangePicker';
import MetricsCard from '@/components/MetricsCard';
import AccountTable from '@/components/AccountTable';
import type { MetricsResponse } from '@/types/googleAds';

export default function DashboardPage() {
    const [dateRange, setDateRange] = useState<DateRange>({
        label: 'Last 30 Days',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    const [data, setData] = useState<MetricsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
            });

            const response = await fetch(`/api/google-ads/metrics?${params.toString()}`);
            const result: MetricsResponse = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch metrics');
            }

            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, [dateRange]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(value);
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>Google Ads Dashboard</h1>
                    <p className="subtitle">Monitor your advertising performance across multiple accounts</p>
                </div>
            </header>

            <div className="dashboard-controls">
                <DateRangePicker value={dateRange} onChange={setDateRange} />
                <button onClick={fetchMetrics} className="refresh-btn" disabled={loading}>
                    {loading ? '⟳ Loading...' : '↻ Refresh'}
                </button>
            </div>

            {error && (
                <div className="error-banner">
                    <span className="error-icon">⚠️</span>
                    <div className="error-content">
                        <strong>Error:</strong> {error}
                    </div>
                </div>
            )}

            {loading && !data && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading metrics...</p>
                </div>
            )}

            {data?.data && (
                <>
                    <div className="metrics-grid">
                        <MetricsCard
                            title="Total Spend"
                            value={formatCurrency(data.data.summary.totalSpend)}
                            subtitle={`${dateRange.label || 'Custom Range'}`}
                            icon="💰"
                        />
                        <MetricsCard
                            title="Total Conversions"
                            value={formatNumber(data.data.summary.totalConversions)}
                            subtitle={`Across ${data.data.accounts.length} account${data.data.accounts.length !== 1 ? 's' : ''
                                }`}
                            icon="🎯"
                        />
                        <MetricsCard
                            title="Avg Cost Per Conversion"
                            value={
                                data.data.summary.totalConversions > 0
                                    ? formatCurrency(data.data.summary.averageCostPerConversion)
                                    : '-'
                            }
                            subtitle="Average across all accounts"
                            icon="📊"
                        />
                    </div>

                    <div className="accounts-section">
                        <div className="section-header">
                            <h2>Account Performance</h2>
                            <p className="section-subtitle">
                                Detailed breakdown by account for {dateRange.label || 'selected period'}
                            </p>
                        </div>
                        <AccountTable accounts={data.data.accounts} />
                    </div>
                </>
            )}

            {!loading && !error && !data && (
                <div className="empty-state">
                    <p>No data available. Please check your configuration.</p>
                </div>
            )}
        </div>
    );
}
