const adres = new URL(self.registration.scope);
const onEk = `sokratik-koc:${adres.pathname}:`;
const onbellek = `${onEk}v1`;
const varliklar = [
  './', './index.html', './style.css', './app.js',
  './lib/koc.js', './lib/sablonlar.js', './lib/rapor.js', './lib/olcme.js',
  './degerlendirme/turev.json', './degerlendirme/veri-yapilari.json',
].map(yol => new URL(yol, adres).href);

self.addEventListener('install', olay => {
  olay.waitUntil(caches.open(onbellek).then(depo => depo.addAll(varliklar)));
});

self.addEventListener('activate', olay => {
  olay.waitUntil(caches.keys().then(anahtarlar => Promise.all(anahtarlar
    .filter(anahtar => anahtar.startsWith(onEk) && anahtar !== onbellek)
    .map(anahtar => caches.delete(anahtar))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', olay => {
  if (olay.request.method !== 'GET' || new URL(olay.request.url).origin !== adres.origin) return;
  const hedef = olay.request.mode === 'navigate' ? adres.href : olay.request.url;
  if (!varliklar.includes(hedef) || !olay.request.url.startsWith(adres.href)) return;
  olay.respondWith(caches.open(onbellek).then(async depo =>
    (await depo.match(hedef)) ?? fetch(olay.request)));
});
