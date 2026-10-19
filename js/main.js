APP.applyTheme();
if (!location.hash) location.hash = '#/';
APP.render();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => { });
}
