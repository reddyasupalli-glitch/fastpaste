import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
}

export function AdBanner({ slot, format = 'auto', className }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Use IntersectionObserver to detect when ad container is visible and has dimensions
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.boundingClientRect.width > 0) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Only push ad when visible and container has width
    if (isVisible && adRef.current && containerRef.current && !isAdLoaded.current) {
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      if (containerWidth > 0) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isAdLoaded.current = true;
        } catch (error) {
          // Silently handle AdSense errors in development
          if (process.env.NODE_ENV === 'production') {
            console.error('AdSense error:', error);
          }
        }
      }
    }
  }, [isVisible]);

  return (
    <div 
      ref={containerRef}
      className={cn("ad-container flex items-center justify-center overflow-hidden w-full", className)}
      style={{ minWidth: '280px', minHeight: '50px' }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client="ca-pub-7098510472582670"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}