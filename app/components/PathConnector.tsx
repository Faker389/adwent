"use client"

interface PathConnectorProps {
  windows: Array<{ x: number; y: number }>;
}

export const PathConnector = ({ windows }: PathConnectorProps) => {
  // Generate SVG path connecting all windows in order (1->2->3->...->24)
  const generatePath = () => {
    if (windows.length < 2) return '';
    
    // Start at first window
    let path = `M ${windows[0].x} ${windows[0].y}`;
    
    for (let i = 1; i < windows.length; i++) {
      const prev = windows[i - 1];
      const curr = windows[i];
      
      // Create smooth bezier curves between points
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      
      // Control points for a nice flowing curve
      const tension = 0.3;
      const cp1x = prev.x + dx * tension;
      const cp1y = prev.y + dy * 0.8;
      const cp2x = curr.x - dx * tension;
      const cp2y = curr.y - dy * 0.2;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    
    return path;
  };

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#facc15" stopOpacity="0.8" />
          <stop offset="33%" stopColor="#ef4444" stopOpacity="0.8" />
          <stop offset="66%" stopColor="#22c55e" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0.8" />
        </linearGradient>
        
        <filter id="glow">
          <feGaussianBlur stdDeviation="0.3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Animated dash pattern */}
        <pattern id="movingDashes" width="2" height="1" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="white" opacity="0.8"/>
        </pattern>
      </defs>
      
      {/* Background glow path */}
      <path
        d={generatePath()}
        stroke="rgba(250, 204, 21, 0.2)"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Main animated path */}
      <path
        d={generatePath()}
        stroke="url(#pathGradient)"
        strokeWidth="0.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1.5 1"
        filter="url(#glow)"
        style={{ 
          animation: 'dash 20s linear infinite',
        }}
      />
      
      {/* Small decorative dots at connection points */}
      {windows.map((point, index) => (
        <g key={index}>
          <circle
            cx={point.x}
            cy={point.y}
            r="0.6"
            fill={index % 3 === 0 ? "#facc15" : index % 3 === 1 ? "#ef4444" : "#22c55e"}
            opacity="0.5"
          />
        </g>
      ))}

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -50;
          }
        }
      `}</style>
    </svg>
  );
};
