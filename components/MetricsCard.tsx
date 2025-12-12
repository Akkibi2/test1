interface MetricsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export default function MetricsCard({ title, value, subtitle, icon, trend }: MetricsCardProps) {
    return (
        <div className="metrics-card">
            <div className="card-header">
                <div className="card-title">
                    {icon && <span className="card-icon">{icon}</span>}
                    <h3>{title}</h3>
                </div>
                {trend && (
                    <div className={`trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                        <span className="trend-arrow">{trend.isPositive ? '↑' : '↓'}</span>
                        <span className="trend-value">{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>
            <div className="card-value">{value}</div>
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
        </div>
    );
}
