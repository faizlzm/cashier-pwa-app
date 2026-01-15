"use client";

import { useState, useEffect } from "react";

/**
 * Breakpoints matching Flutter responsive_utils.dart
 * - mobile: < 600px
 * - tablet: 600px - 1024px
 * - desktop: >= 1024px
 * - compactHeight: < 500px (landscape mobile)
 */
export const BREAKPOINTS = {
  mobile: 600,
  tablet: 1024,
  desktop: 1440,
  compactHeight: 500,
} as const;

interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isMobileOrTablet: boolean;
  isLandscape: boolean;
  isCompactHeight: boolean;
  isMobileLandscape: boolean;
}

/**
 * Custom hook for responsive design with breakpoints matching Flutter
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    // SSR-safe initial state
    if (typeof window === "undefined") {
      return {
        width: 1024,
        height: 768,
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isMobileOrTablet: true,
        isLandscape: true,
        isCompactHeight: false,
        isMobileLandscape: false,
      };
    }

    return calculateState(window.innerWidth, window.innerHeight);
  });

  useEffect(() => {
    const handleResize = () => {
      setState(calculateState(window.innerWidth, window.innerHeight));
    };

    // Set initial state on client
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return state;
}

function calculateState(width: number, height: number): ResponsiveState {
  const isMobile = width < BREAKPOINTS.mobile;
  const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.tablet;
  const isLandscape = width > height;
  const isCompactHeight = height < BREAKPOINTS.compactHeight;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet: width < BREAKPOINTS.tablet,
    isLandscape,
    isCompactHeight,
    isMobileLandscape: isLandscape && isCompactHeight,
  };
}

/**
 * Get responsive value based on current breakpoint
 */
export function useResponsiveValue<T>(mobile: T, tablet?: T, desktop?: T): T {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) return mobile;
  if (isTablet) return tablet ?? mobile;
  return desktop ?? tablet ?? mobile;
}
