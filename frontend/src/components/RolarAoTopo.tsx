import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Ao trocar de página, volta ao topo (ou rola até a âncora #id, se houver). */
export function RolarAoTopo() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 60);
      return () => window.clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}
