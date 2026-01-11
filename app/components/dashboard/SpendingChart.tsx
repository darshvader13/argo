"use client";

import { useRef } from "react";
import { Download } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line,
    PieChart,
    Pie,
    AreaChart,
    Area
} from "recharts";

export interface ChartConfig {
    type: 'bar' | 'line' | 'pie' | 'area';
    title?: string;
    data: { label: string; value: number; color?: string }[];
    colors?: string[];
}

interface SpendingChartProps {
    config?: ChartConfig | null;
}

export default function SpendingChart({ config }: SpendingChartProps) {
    const chartRef = useRef<HTMLDivElement>(null);

    if (!config || !config.data || config.data.length === 0) return null;

    const handleDownload = async () => {
        if (!chartRef.current) return;

        const originalError = console.error;
        console.error = (...args: any[]) => {
            if (args[0]?.includes?.('domtoimage') || args[0]?.includes?.('CSS rules')) {
                return;
            }
            originalError(...args);
        };

        try {
            const domtoimage = (await import('dom-to-image-more')).default;

            const dataUrl = await domtoimage.toPng(chartRef.current, {
                bgcolor: '#18181b',
                quality: 1,
                width: chartRef.current.offsetWidth * 2,
                height: chartRef.current.offsetHeight * 2,
                style: {
                    transform: 'scale(2)',
                    transformOrigin: 'top left',
                    width: chartRef.current.offsetWidth + 'px',
                    height: chartRef.current.offsetHeight + 'px',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                },
                filter: (node: Node) => {
                    if (node instanceof HTMLLinkElement && node.rel === 'stylesheet') {
                        return false;
                    }
                    if (node instanceof HTMLStyleElement) {
                        const content = node.textContent || '';
                        if (content.includes('googleapis.com')) {
                            return false;
                        }
                    }
                    return true;
                },
                cacheBust: true
            });

            const link = document.createElement('a');
            link.download = `${config.title || 'chart'}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to download chart:', error);
            alert('Failed to download chart. Please try again.');
        } finally {
            console.error = originalError;
        }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-900 border border-white/10 p-3 rounded-xl shadow-xl z-50">
                    <p className="text-zinc-400 text-xs mb-1">{label || payload[0].name}</p>
                    <p className="text-white font-mono font-bold">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        switch (config.type) {
            case 'line':
                return (
                    <LineChart data={config.data}>
                        <XAxis
                            dataKey="label"
                            stroke="#71717a"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={20}
                        />
                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FFFFFF', strokeWidth: 1, opacity: 0.2 }} />
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                );
            case 'area':
                return (
                    <AreaChart data={config.data}>
                        <XAxis
                            dataKey="label"
                            stroke="#71717a"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={20}
                        />
                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FFFFFF', strokeWidth: 1, opacity: 0.2 }} />
                        <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    </AreaChart>
                );
            case 'pie':
                return (
                    <PieChart>
                        <Tooltip content={<CustomTooltip />} />
                        <Pie
                            data={config.data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="label"
                        >
                            {config.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || config.colors?.[index % (config.colors?.length || 1)] || '#10b981'} />
                            ))}
                        </Pie>
                    </PieChart>
                );
            case 'bar':
            default:
                return (
                    <BarChart data={config.data}>
                        <XAxis
                            dataKey="label"
                            stroke="#71717a"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={20}
                        />
                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FFFFFF', opacity: 0.05 }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {config.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.value > 0 ? (entry.color || '#10b981') : '#f43f5e'} />
                            ))}
                        </Bar>
                    </BarChart>
                );
        }
    };

    return (
        <div className="w-full mt-4">
            <div className="flex items-center justify-between mb-2 pl-2 pr-2">
                {config.title && <p className="text-xs font-semibold text-zinc-400">{config.title}</p>}
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-primary transition-colors px-2 py-1 rounded hover:bg-zinc-800/50"
                    title="Download chart as PNG"
                >
                    <Download size={14} />
                    <span>Download</span>
                </button>
            </div>
            <div ref={chartRef} data-chart-container className="h-64 w-full bg-zinc-900 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
