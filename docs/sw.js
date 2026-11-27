const adres = new URL(self.registration.scope);
const onEk = `sokratik-koc:${adres.pathname}:`;
const onbellek = `${onEk}v3`;
const varliklar = [
  './', './index.html', './style.css', './app.js',
  './lib/koc.js', './lib/sablonlar.js', './lib/rapor.js', './lib/olcme.js',
  './degerlendirme/turev.json', './degerlendirme/veri-yapilari.json',
  './manifest.webmanifest', './ikon.svg', './ikon-192.png', './ikon-512.png',
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
  // Ağ öncelikli: güncellemeler hemen görünür, bağlantı yoksa son kopya kullanılır.
  olay.respondWith(caches.open(onbellek).then(async depo => {
    try {
      const yanit = await fetch(olay.request);
      if (yanit.ok) depo.put(hedef, yanit.clone()).catch(() => {});
      return yanit;
    } catch {
      return (await depo.match(hedef)) ?? Response.error();
    }
  }));
});
