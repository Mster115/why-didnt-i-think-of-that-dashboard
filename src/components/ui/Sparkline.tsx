interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
}

/**
 * Sparkline - Minimal inline chart
 * Renders a simple SVG line chart for trending data
 */
export function Sparkline({
    data,
    width = 80,
    height = 24,
    color = '#3b82f6',
}: SparklineProps) {
    if (data.length < 2) {
        return <div style={{ width, height }} />;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data
        .map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg width={width} height={height} className="inline-block">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                points={points}
            />
        </svg>
    );
}

export default Sparkline;
