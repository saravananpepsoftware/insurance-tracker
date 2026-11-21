import React, { useState } from 'react';
import sidebarInsuranceArtwork from '../../assets/sidebar-insurance-artwork.png';

/**
 * 3D Premium Insurance Illustration on flowing liquid orange dunes
 * Matches the reference mockup design.
 */
export function SidebarCarIllustration() {
  const [imgSrc, setImgSrc] = useState(sidebarInsuranceArtwork);

  return (
    <div className="sidebar-illustration-wrapper">
      {/* Dynamic Layered Fluid Orange Waves Background */}
      <svg
        className="sidebar-bottom-wave-bg"
        viewBox="0 0 260 230"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveGradSoft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2E7" />
            <stop offset="50%" stopColor="#FFE3CD" />
            <stop offset="100%" stopColor="#FFC9A1" />
          </linearGradient>
          <linearGradient id="waveGradMid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA64D" />
            <stop offset="100%" stopColor="#FF7A00" />
          </linearGradient>
          <linearGradient id="waveGradDeep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7A00" />
            <stop offset="60%" stopColor="#FF5C00" />
            <stop offset="100%" stopColor="#E64A00" />
          </linearGradient>
        </defs>

        {/* Upper Dune Curve */}
        <path
          d="M 0 120 Q 75 90 145 110 Q 210 130 260 100 L 260 230 L 0 230 Z"
          fill="url(#waveGradSoft)"
          opacity="0.9"
        />

        {/* Middle Dune Layer */}
        <path
          d="M 0 142 Q 80 118 142 135 Q 205 152 260 132 L 260 230 L 0 230 Z"
          fill="url(#waveGradMid)"
          opacity="0.95"
        />

        {/* Deep Bottom Vibrant Orange Fluid Dune Layer */}
        <path
          d="M 0 165 Q 85 145 150 158 Q 215 170 260 152 L 260 230 L 0 230 Z"
          fill="url(#waveGradDeep)"
        />
      </svg>

      {/* 3D Insurance Graphic with Umbrella, Shield, Cars & Policy */}
      <img
        src={imgSrc}
        alt="Insurance Protection & Coverage"
        className="sidebar-3d-artwork-img"
        onError={() => setImgSrc('/images/sidebar-insurance-artwork.png')}
      />
    </div>
  );
}

export default SidebarCarIllustration;
