import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, subtitle, icon: Icon, color = '#2563eb' }) => {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
            {subtitle}
          </div>
        )}
      </div>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          background: `${color}15`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={24} />
      </div>
    </div>
  );
};
