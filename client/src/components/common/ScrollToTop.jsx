import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures every navigation starts from the top (0,0) of the screen,
 * resetting both window/document scroll and any internal scrollable containers (e.g. <main> in AppShell).
 */
export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // 1. Reset standard browser window & document root scroll
    try {
      window.scrollTo(0, 0);
    } catch {}
    
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // 2. Reset all scrollable main containers & sub-scroll areas
    const scrollableElements = document.querySelectorAll('main, .overflow-y-auto, [data-scroll-container]');
    scrollableElements.forEach((el) => {
      try {
        el.scrollTop = 0;
      } catch {}
    });
  }, [pathname, search]);

  return null;
};
