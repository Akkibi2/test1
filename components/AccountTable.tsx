'use client';

import { useState, useMemo } from 'react';
import type { GoogleAdsMetrics } from '@/types/googleAds';

interface AccountTableProps {
    accounts: GoogleAdsMetrics[];
}

type SortField = keyof GoogleAdsMetrics;
type SortDirection = 'asc' | 'desc';

export default function AccountTable({ accounts }: AccountTableProps) {
    const [sortField, setSortField] = useState<SortField>('spend');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedAccounts = useMemo(() => {
        return [...accounts].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return 0;
        });
    }, [accounts, sortField, sortDirection]);

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

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <span className="sort-icon inactive">⇅</span>;
        }
        return (
            <span className="sort-icon active">
                {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
        );
    };

    return (
        <div className="account-table-container">
            <table className="account-table">
                <thead>
                    <tr>
                        <th onClick={() => handleSort('customerName')}>
                            Account <SortIcon field="customerName" />
                        </th>
                        <th onClick={() => handleSort('spend')} className="numeric">
                            Spend <SortIcon field="spend" />
                        </th>
                        <th onClick={() => handleSort('conversions')} className="numeric">
                            Conversions <SortIcon field="conversions" />
                        </th>
                        <th onClick={() => handleSort('costPerConversion')} className="numeric">
                            Cost/Conv <SortIcon field="costPerConversion" />
                        </th>
                        <th onClick={() => handleSort('impressions')} className="numeric">
                            Impressions <SortIcon field="impressions" />
                        </th>
                        <th onClick={() => handleSort('clicks')} className="numeric">
                            Clicks <SortIcon field="clicks" />
                        </th>
                        <th onClick={() => handleSort('ctr')} className="numeric">
                            CTR <SortIcon field="ctr" />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedAccounts.map((account) => (
                        <tr key={account.customerId}>
                            <td className="account-name">
                                <div className="account-info">
                                    <span className="name">{account.customerName}</span>
                                    <span className="id">{account.customerId}</span>
                                </div>
                            </td>
                            <td className="numeric spend">{formatCurrency(account.spend)}</td>
                            <td className="numeric">{formatNumber(account.conversions)}</td>
                            <td className="numeric">
                                {account.conversions > 0
                                    ? formatCurrency(account.costPerConversion)
                                    : '-'}
                            </td>
                            <td className="numeric">{formatNumber(account.impressions || 0)}</td>
                            <td className="numeric">{formatNumber(account.clicks || 0)}</td>
                            <td className="numeric">
                                {account.ctr ? `${account.ctr.toFixed(2)}%` : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {accounts.length === 0 && (
                <div className="empty-state">
                    <p>No data available for the selected date range</p>
                </div>
            )}
        </div>
    );
}
