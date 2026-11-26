import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { kayitOku, testKonulari, testPuanla } from '../docs/lib/olcme.js';

for (const [id, konu] of testKonulari) {
  test(`${konu} setinin iki kopyası eşleşir ve her test 10 puan üzerinden değerlendirilir`, () => {
    const kaynak = readFileSync(new URL(`../degerlendirme/${id}.json`, import.meta.url), 'utf8');
    const pages = readFileSync(new URL(`../docs/degerlendirme/${id}.json`, import.meta.url), 'utf8');
    assert.equal(kaynak, pages);
    const veri = JSON.parse(kaynak);
    assert.equal(veri.id, id);
    assert.equal(veri.konu, konu);
    assert.equal(new Set([...veri.on, ...veri.son].map(soru => soru.soru)).size, 20);
    for (const sorular of [veri.on, veri.son]) {
      assert.equal(sorular.length, 10);
      assert.ok(sorular.every(soru => soru.aciklama && soru.soru && new Set(soru.secenekler).size === 3));
      const dogrular = sorular.map(soru => soru.dogru);
      assert.equal(testPuanla(sorular, dogrular), 10);
      assert.equal(testPuanla(sorular, dogrular.map(sira => (sira + 1) % 3)), 0);
      assert.throws(() => testPuanla(sorular, dogrular.slice(1)));
      assert.throws(() => testPuanla(sorular, [3, ...dogrular.slice(1)]));
      assert.throws(() => testPuanla(sorular, [, ...dogrular.slice(1)]));
    }
  });
}

test('Kayıt yalnızca geçerli konu ve puanları okur, ön testsiz son testi yok sayar', () => {
  assert.deepEqual(kayitOku('bozuk'), {});
  assert.deepEqual(kayitOku(null), {});
  assert.deepEqual(kayitOku('{"turev":{"on":0,"son":10},"veri-yapilari":{"son":5},"baska":{"on":4}}'),
    { turev: { on: 0, son: 10 } });
  assert.deepEqual(kayitOku('{"turev":{"on":7,"son":11},"veri-yapilari":{"on":"6"}}'), { turev: { on: 7 } });
});
