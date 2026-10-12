/**
 * PWA Service Worker Registration
 * Strictly avoided inside preview iframes to prevent breaking AI Studio live editor preview.
 */
export function registerPwaServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Requirement: The service worker/PWA must be registered only in the published build / standalone,
  // not in the editor preview iframe, so it doesn't break previews.
  const isIframe = window.self !== window.top;
  if (isIframe) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // SW active
      })
      .catch((error) => {
        console.warn('PWA ServiceWorker registration error:', error);
      });
  });
}
