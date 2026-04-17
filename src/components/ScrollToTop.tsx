import * as React from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTopProps {
  activePage?: string;
  contentRef?: React.RefObject<HTMLDivElement>;
}

export const ScrollToTop = ({ activePage, contentRef }: ScrollToTopProps) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when route or activePage changes
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Scroll the main content container if ref is provided
    if (contentRef?.current) {
      contentRef.current.scrollTop = 0;
    }
    
    // Also scroll any scrollable containers as fallback
    const scrollableElements = [
      document.querySelector('main'),
      document.querySelector('.main-content'),
      document.querySelector('[class*="content"]'),
      document.querySelector('[class*="container"]'),
      document.querySelector('#root'),
      document.body
    ];
    
    scrollableElements.forEach(element => {
      if (element) {
        element.scrollTop = 0;
      }
    });
  }, [pathname, activePage]);

  return null;
};
