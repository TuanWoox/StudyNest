import { useState, useRef, useEffect } from "react";

interface UseCollapsibleHeaderOptions {
  /**
   * Dependencies that should trigger header height recalculation
   * @default []
   */
  dependencies?: any[];
  /**
   * Minimum scroll distance to trigger collapse/expand
   * @default 5
   */
  scrollThreshold?: number;
  /**
   * Minimum scroll position from top to allow collapse
   * @default 100
   */
  collapseThreshold?: number;
}

interface UseCollapsibleHeaderReturn {
  /**
   * Whether the header is currently collapsed
   */
  isHeaderCollapsed: boolean;
  /**
   * Current header height in pixels
   */
  headerHeight: number;
  /**
   * Ref to attach to the scroll container element
   */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Ref to attach to the header element
   */
  headerRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Manually set collapsed state
   */
  setIsHeaderCollapsed: (collapsed: boolean) => void;
}

/**
 * Custom hook for creating a collapsible header that hides on scroll down
 * and shows on scroll up. Useful for sticky headers that should auto-hide.
 * 
 * @example
 * ```tsx
 * const { isHeaderCollapsed, headerRef, scrollContainerRef } = useCollapsibleHeader({
 *   dependencies: [currentStep, isMobile],
 *   scrollThreshold: 10,
 *   collapseThreshold: 150
 * });
 * 
 * return (
 *   <div ref={scrollContainerRef} style={{ overflow: 'auto' }}>
 *     <div 
 *       ref={headerRef}
 *       style={{ 
 *         transform: isHeaderCollapsed ? 'translateY(-100%)' : 'translateY(0)',
 *         transition: 'transform 0.3s'
 *       }}
 *     >
 *       Header Content
 *     </div>
 *     <div>Main Content</div>
 *   </div>
 * );
 * ```
 */
export function useCollapsibleHeader(
  options: UseCollapsibleHeaderOptions = {}
): UseCollapsibleHeaderReturn {
  const {
    dependencies = [],
    scrollThreshold = 5,
    collapseThreshold = 100,
  } = options;

  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);

  // Measure header height on mount and when dependencies change
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  // Handle scroll to collapse/expand header
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const lastScrollTop = lastScrollTopRef.current;
      const delta = scrollTop - lastScrollTop;

      // Ignore small scroll changes (prevents jittery behavior)
      if (Math.abs(delta) < scrollThreshold) return;

      const isScrollingDown = delta > 0;

      // Collapse when scrolling down past threshold
      if (isScrollingDown && scrollTop > collapseThreshold && !isHeaderCollapsed) {
        setIsHeaderCollapsed(true);
      }
      // Expand when scrolling up
      else if (!isScrollingDown && isHeaderCollapsed) {
        setIsHeaderCollapsed(false);
      }

      // Update last scroll position (but never negative)
      lastScrollTopRef.current = scrollTop <= 0 ? 0 : scrollTop;
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [isHeaderCollapsed, headerHeight, scrollThreshold, collapseThreshold]);

  return {
    isHeaderCollapsed,
    headerHeight,
    scrollContainerRef,
    headerRef,
    setIsHeaderCollapsed,
  };
}
