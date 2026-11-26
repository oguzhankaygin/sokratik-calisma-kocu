export const testKonulari = [
  ['turev', 'Türev ve değişim hızı'],
  ['veri-yapilari', 'Temel veri yapıları'],
];

export function testPuanla(sorular, yanitlar) {
  if (yanitlar.length !== sorular.length || !sorular.length ||
      !sorular.every(({ secenekler }, i) =>
        Number.isInteger(yanitlar[i]) && yanitlar[i] >= 0 && yanitlar[i] < secenekler.length)) {
    throw new Error('Puanlamak için tüm soruları yanıtla.');
  }
  return sorular.filter(({ dogru }, i) => dogru === yanitlar[i]).length;
}

export function kayitOku(metin) {
  let veri;
  try {
    veri = JSON.parse(metin);
  } catch {
    return {};
  }
  const sonuc = {};
  for (const [id] of testKonulari) {
    const { on, son } = veri?.[id] ?? {};
    if (Number.isInteger(on) && on >= 0 && on <= 10) {
      sonuc[id] = { on };
      if (Number.isInteger(son) && son >= 0 && son <= 10) sonuc[id].son = son;
    }
  }
  return sonuc;
}
