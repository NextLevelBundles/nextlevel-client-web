import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    const updateMatch = () => setMatches(media.matches);
    updateMatch();

    if (media.addListener) {
      media.addListener(updateMatch);
      return () => media.removeListener(updateMatch);
    } else {
      media.addEventListener('change', updateMatch);
      return () => media.removeEventListener('change', updateMatch);
    }
  }, [query]);

  return matches;
}

export function useIsMobile() {
  return !useMediaQuery('(min-width: 768px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}