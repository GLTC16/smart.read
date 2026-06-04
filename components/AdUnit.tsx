'use client';

import { useEffect, useRef } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * Google AdSense ad unit.
 * Only renders if NEXT_PUBLIC_ADSENSE_ID is set and not placeholder.
 */
export default function AdUnit({ slot, format = 'auto', className = '', style }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!clientId || clientId.includes('XXXXX') || pushed.current) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      (window.adsbygoogle as unknown[]).push({});
      pushed.current = true;
    } catch {
      // AdSense not ready
    }
  }, [clientId]);

  if (!clientId || clientId.includes('XXXXX')) return null;

  return (
    <div
      className={`ad-container overflow-hidden ${className}`}
      style={{ textAlign: 'center', ...style }}
      aria-label="Publicidad"
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
