// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(function (reg) {
        // Check for updates periodically
        setInterval(function () {
          reg.update();
        }, 60 * 60 * 1000); // every hour
      })
      .catch(function () {
        // SW registration failed silently
      });
  });
}
