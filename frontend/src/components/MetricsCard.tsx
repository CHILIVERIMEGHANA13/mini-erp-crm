import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, subtitle, icon: Icon, color = 'var(--primary)' }) => {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 24px' }}>
      <div>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 800,
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.875rem',
          fontWeight: 800,
          color: 'var(--text-main)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 500 }}>
            {subtitle}
          </div>
        )}
      </div>
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: `radial-gradient(circle at 30% 30%, ${color}25, ${color}10)`,
          border: `1px solid ${color}40`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 20px ${color}20`,
          flexShrink: 0,
        }}
      >
        <Icon size={26} />
      </div>
    </div>
  );
};
