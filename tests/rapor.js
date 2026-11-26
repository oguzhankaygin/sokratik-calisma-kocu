import test from 'node:test';
import assert from 'node:assert/strict';
import { raporOku } from '../docs/lib/rapor.js';

const rapor = { ozet: '  Çözümde "}" kullandım. ', sonraki_adim: '  Ölç ', alintilar: ['Türkçe örnek', 'Uydurma', 'Türkçe örnek'] };
const json = JSON.stringify(rapor);

test('Düz JSON, kod bloğu ve çevreleyen metin aynı raporu verir', () => {
  const beklenen = { ozet: 'Çözümde "}" kullandım.', sonrakiAdim: 'Ölç', alintilar: ['Türkçe örnek'], dogrulanmayan: 1 };
  for (const metin of [json, `Ön bilgi\n\`\`\`JSON\r\n${json}\n\`\`\`\nSon bilgi`, `Önsöz { geçersiz } ${json} dipnot`]) {
    assert.deepEqual(raporOku(metin, 'Bir Türkçe örnek yazdık.'), beklenen);
  }
});

test('Şema denetlenir ve doğrulanan alanlar güvenli uzunluğa kırpılır', () => {
  const alinti = 'ö'.repeat(260);
  const veri = { ozet: '🦉'.repeat(1300), sonraki_adim: 'ş'.repeat(601), alintilar: [alinti, 'a', 'b', 'c', 'Ö'] };
  const sonuc = raporOku(JSON.stringify(veri), alinti + ' abc');
  assert.equal(Array.from(sonuc.ozet).length, 1200);
  assert.equal(sonuc.sonrakiAdim.length, 600);
  assert.deepEqual(sonuc.alintilar, ['ö'.repeat(240), 'a', 'b']);
  assert.equal(sonuc.dogrulanmayan, 1);
  assert.deepEqual(raporOku(json).alintilar, []);
  const bosluklu = JSON.stringify({ ...rapor, alintilar: [' Türkçe örnek '] });
  assert.deepEqual(raporOku(bosluklu, 'Türkçe örnek').alintilar, []);
  assert.deepEqual(raporOku(bosluklu, 'Bir Türkçe örnek yazdık.').alintilar, [' Türkçe örnek ']);
  for (const metin of ['{}', 'null', 'bozuk', JSON.stringify({ ...rapor, alintilar: [123] }),
    JSON.stringify({ ...rapor, ozet: '  ' }), 'x'.repeat(16001)]) {
    assert.throws(() => raporOku(metin));
  }
});
