import { useState, useEffect, useCallback } from 'react';

export const useIsMobile = (breakpoint: number = 768): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const checkIsMobile = useCallback(() => {
    setIsMobile(window.innerWidth < breakpoint);
  }, [breakpoint]);

  useEffect(() => {
    // Check on mount
    checkIsMobile();

    // Debounce resize handler for better performance
    let timeoutId: NodeJS.Timeout;
    const debouncedCheckIsMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkIsMobile, 150);
    };

    // Add event listener for window resize
    window.addEventListener('resize', debouncedCheckIsMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedCheckIsMobile);
      clearTimeout(timeoutId);
    };
  }, [checkIsMobile]);

  return isMobile;
};