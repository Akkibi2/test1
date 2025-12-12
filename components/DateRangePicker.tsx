'use client';

import { useState } from 'react';

export interface DateRange {
    startDate: string;
    endDate: string;
    label?: string;
}

interface DateRangePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
}

const presetRanges: DateRange[] = [
    {
        label: 'Today',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    },
    {
        label: 'Last 7 Days',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    },
    {
        label: 'Last 30 Days',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    },
    {
        label: 'This Month',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    },
];

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    const [isCustom, setIsCustom] = useState(false);

    const handlePresetClick = (preset: DateRange) => {
        setIsCustom(false);
        onChange(preset);
    };

    const handleCustomChange = (field: 'startDate' | 'endDate', newValue: string) => {
        onChange({
            ...value,
            [field]: newValue,
            label: 'Custom',
        });
    };

    return (
        <div className="date-range-picker">
            <div className="preset-buttons">
                {presetRanges.map((preset) => (
                    <button
                        key={preset.label}
                        onClick={() => handlePresetClick(preset)}
                        className={`preset-btn ${!isCustom && value.label === preset.label ? 'active' : ''
                            }`}
                    >
                        {preset.label}
                    </button>
                ))}
                <button
                    onClick={() => setIsCustom(true)}
                    className={`preset-btn ${isCustom ? 'active' : ''}`}
                >
                    Custom
                </button>
            </div>

            {isCustom && (
                <div className="custom-inputs">
                    <div className="input-group">
                        <label htmlFor="start-date">Start Date</label>
                        <input
                            id="start-date"
                            type="date"
                            value={value.startDate}
                            onChange={(e) => handleCustomChange('startDate', e.target.value)}
                            max={value.endDate}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="end-date">End Date</label>
                        <input
                            id="end-date"
                            type="date"
                            value={value.endDate}
                            onChange={(e) => handleCustomChange('endDate', e.target.value)}
                            min={value.startDate}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
