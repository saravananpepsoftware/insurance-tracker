import React from 'react';
import heroCarShieldImg from '../../assets/hero-insurance-car-shield.png';

/**
 * 3D Car with Orange Shield Hero Artwork replacing the previous vector art
 */
export function DashboardHeroArtwork() {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '110px',
        width: '168px',
        flexShrink: 0
      }}
    >
      <img
        src={heroCarShieldImg}
        alt="Insurance Protection Car and Shield"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 8px 18px rgba(255, 107, 0, 0.2))',
          pointerEvents: 'none',
          userSelect: 'none',
          transform: 'translateY(-2px)'
        }}
      />
    </div>
  );
}
