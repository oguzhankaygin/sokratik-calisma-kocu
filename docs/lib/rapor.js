function* jsonAdaylari(metin) {
  for (const eslesme of metin.matchAll(/```(?:json)?[ \t]*\r?\n([\s\S]*?)```/gi)) {
    yield eslesme[1].trim();
  }
  yield metin.trim();
  // Çevreleyen metinden, JSON dizgilerindeki parantezleri atlayarak nesneleri çıkar.
  for (let bas = metin.indexOf('{'); bas !== -1; bas = metin.indexOf('{', bas + 1)) {
    let derinlik = 0;
    let dizgi = false;
    for (let i = bas; i < metin.length; i++) {
      const karakter = metin[i];
      if (dizgi && karakter === '\\') {
        i++;
      } else if (karakter === '"') {
        dizgi = !dizgi;
      } else if (!dizgi && karakter === '{') {
        derinlik++;
      } else if (!dizgi && karakter === '}' && --derinlik === 0) {
        yield metin.slice(bas, i + 1);
        break;
      }
    }
  }
}

export function raporOku(metin, dersNotu = '') {
  if (typeof metin !== 'string' || metin.length > 16000) {
    throw new Error('JSON raporu en fazla 16.000 karakter olabilir.');
  }
  for (const aday of jsonAdaylari(metin)) {
    let veri;
    try {
      veri = JSON.parse(aday);
    } catch {
      continue;
    }
    if (!veri || typeof veri.ozet !== 'string' || !veri.ozet.trim() ||
        typeof veri.sonraki_adim !== 'string' || !veri.sonraki_adim.trim() ||
        !Array.isArray(veri.alintilar) || !veri.alintilar.every(alinti => typeof alinti === 'string')) continue;

    const alintilar = [...new Set(veri.alintilar.filter(alinti => alinti.trim()))];
    const dogrulanan = alintilar.filter(alinti => dersNotu.includes(alinti));
    return {
      ozet: Array.from(veri.ozet.trim()).slice(0, 1200).join(''),
      sonrakiAdim: Array.from(veri.sonraki_adim.trim()).slice(0, 600).join(''),
      alintilar: dogrulanan.slice(0, 3).map(alinti => Array.from(alinti).slice(0, 240).join('')),
      dogrulanmayan: alintilar.length - dogrulanan.length,
    };
  }
  throw new Error('Geçerli bir rapor bulunamadı. Claude’dan “JSON raporu” iste ve yanıtı buraya yapıştır.');
}
