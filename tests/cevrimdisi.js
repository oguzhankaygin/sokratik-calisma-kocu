import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

test('Service Worker depo alt yolunda sayfayı ve tüm çevrimdışı varlıkları önbellekten sunar', async () => {
  const kok = 'https://example.test/sokratik-calisma-kocu/';
  const dinleyiciler = {};
  const varliklar = new Set();
  const depo = {
    addAll(yollar) {
      for (const adres of yollar) {
        const yol = adres.slice(kok.length) || 'index.html';
        assert.ok(adres.startsWith(kok) && existsSync(new URL(`../docs/${yol}`, import.meta.url)), yol);
        varliklar.add(adres);
      }
    },
    match: adres => varliklar.has(adres) ? adres : undefined,
  };
  runInNewContext(readFileSync(new URL('../docs/sw.js', import.meta.url), 'utf8'), {
    URL,
    self: {
      registration: { scope: kok },
      addEventListener: (ad, islev) => { dinleyiciler[ad] = islev; },
    },
    caches: { open: async () => depo },
    fetch: () => assert.fail('Önbellekteki dosya için ağ isteği yapıldı.'),
  });
  await new Promise(resolve => dinleyiciler.install({ waitUntil: resolve }));

  for (const yol of ['', 'index.html', 'app.js', 'style.css', 'lib/koc.js',
    'lib/sablonlar.js', 'lib/rapor.js', 'lib/olcme.js', 'degerlendirme/turev.json',
    'degerlendirme/veri-yapilari.json']) {
    const url = kok + yol;
    const modu = yol === 'index.html' || yol === '' ? 'navigate' : 'same-origin';
    const yanit = await new Promise(resolve => dinleyiciler.fetch({
      request: { method: 'GET', mode: modu, url },
      respondWith: resolve,
    }));
    assert.equal(yanit, modu === 'navigate' ? kok : url);
  }
  dinleyiciler.fetch({
    request: { method: 'GET', mode: 'navigate', url: 'https://claude.ai/new' },
    respondWith: () => assert.fail('Başka bir kaynağa yapılan gezinti yakalandı.'),
  });
});
