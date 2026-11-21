import React from 'react';

export function StatCard({ label, value, subtext, icon: Icon, colorTheme = 'orange', badge }) {
  const iconClasses = {
    orange: 'stat-icon-orange',
    gold: 'stat-icon-gold',
    green: 'stat-icon-green',
    red: 'stat-icon-red'
  };

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        <div className={`stat-icon-wrapper ${iconClasses[colorTheme] || 'stat-icon-orange'}`}>
          {Icon && <Icon size={20} strokeWidth={2.2} />}
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-footer">
        {badge && <span className="stat-tag-highlight">{badge}</span>}
        <span>{subtext}</span>
      </div>
    </div>
  );
}
