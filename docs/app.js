import { hedefler, seviyeler, sureler, planUret, promptUret, projeTalimatlari } from './lib/koc.js';
import { sablonlar } from './lib/sablonlar.js';
import { raporOku } from './lib/rapor.js';
import { testKonulari, testPuanla, kayitOku } from './lib/olcme.js';

const bul = id => document.getElementById(id);
const deger = id => bul(id).value;
const bildir = (id, mesaj) => { bul(id).textContent = mesaj; };

function oge(etiket, metin) {
  const eleman = document.createElement(etiket);
  if (metin !== undefined) eleman.textContent = metin;
  return eleman;
}

function secenekleriDoldur(id, secenekler) {
  for (const [deger, metin] of secenekler) {
    const secenek = oge('option', metin);
    secenek.value = deger;
    bul(id).append(secenek);
  }
}

function liste(etiket, metinler) {
  const eleman = oge(etiket);
  eleman.append(...metinler.map(metin => oge('li', metin)));
  return eleman;
}

const sekmeler = [...bul('sekmeler').querySelectorAll('[role=tab]')];

function sekmeAc(sekme) {
  for (const dugme of sekmeler) {
    const secili = dugme === sekme;
    dugme.setAttribute('aria-selected', String(secili));
    dugme.tabIndex = secili ? 0 : -1;
    bul(dugme.getAttribute('aria-controls')).hidden = !secili;
  }
  sekme.focus();
}

sekmeler.forEach((sekme, i) => {
  sekme.addEventListener('click', () => sekmeAc(sekme));
  sekme.addEventListener('keydown', olay => {
    const hedef = {
      ArrowRight: (i + 1) % sekmeler.length,
      ArrowLeft: (i + sekmeler.length - 1) % sekmeler.length,
      Home: 0,
      End: sekmeler.length - 1,
    };
    if (!Object.hasOwn(hedef, olay.key)) return;
    olay.preventDefault();
    sekmeAc(sekmeler[hedef[olay.key]]);
  });
});

secenekleriDoldur('seviye', seviyeler.map(ad => [ad, ad]));
secenekleriDoldur('hedef', Object.entries(hedefler).map(([id, [ad]]) => [id, ad]));
secenekleriDoldur('sure', sureler.map(sure => [sure, `${sure} dakika`]));
secenekleriDoldur('sablon', [['', 'Şablonsuz'], ...sablonlar.map(([ad]) => [ad, ad])]);
secenekleriDoldur('test-konu', testKonulari);

bul('sablon').addEventListener('change', () => {
  const sablon = sablonlar.find(([ad]) => ad === deger('sablon'));
  bul('sablon-bilgi').hidden = !sablon;
  bildir('sablon-bilgi', sablon ? `${sablon[1]} ${sablon[2]}` : '');
});

function oturumGirdisi() {
  return {
    konu: deger('konu'),
    seviye: deger('seviye'),
    hedef: deger('hedef'),
    sure: Number(deger('sure')),
    alan: deger('sablon'),
    not: deger('not'),
  };
}

function sonucGoster(id, ...icerik) {
  const bolum = bul(id);
  bolum.replaceChildren(...icerik);
  bolum.hidden = false;
  bolum.focus();
}

async function panoyaKopyala(id, durum, kopyalandi, elle) {
  const alan = bul(id);
  try {
    await navigator.clipboard.writeText(alan.value);
    bildir(durum, kopyalandi);
  } catch {
    alan.focus();
    alan.select();
    bildir(durum, elle);
  }
}

function promptKopyala(claudeAc = false) {
  const sonEk = claudeAc ? ' Claude sekmesi açılmazsa aşağıdaki bağlantıyı kullan.' : '';
  return panoyaKopyala('prompt', 'oturum-durum', 'Metin panoya kopyalandı.' + sonEk,
    'Metni seçip elle kopyalayabilirsin.' + sonEk);
}

bul('kurucu').addEventListener('submit', olay => {
  olay.preventDefault();
  const girdi = oturumGirdisi();
  try {
    if (olay.submitter?.value === 'prompt') {
      bul('prompt').value = promptUret(girdi);
      bul('prompt-kutu').hidden = false;
      // İki işlem de tıklama bağlamında ve herhangi bir await öncesinde başlar.
      void promptKopyala(true);
      window.open('https://claude.ai/new', '_blank', 'noopener,noreferrer');
    } else {
      const { konu, bloklar, sorular, feynman } = planUret(girdi);
      bildir('oturum-durum', '');
      sonucGoster('plan', oge('h2', 'Çevrimdışı çalışma planı'), oge('p', konu),
        liste('ol', bloklar.map(([sure, ad]) => `${sure} dk · ${ad}`)),
        oge('h3', 'Kendine sor'), liste('ul', sorular),
        oge('h3', 'Feynman tekniği'), liste('ol', feynman));
    }
  } catch (hata) {
    bildir('oturum-durum', hata.message);
  }
});

bul('prompt-kopyala').addEventListener('click', () => void promptKopyala());
bul('proje-metin').value = projeTalimatlari();
bul('proje-kopyala').addEventListener('click', () => void panoyaKopyala(
  'proje-metin', 'proje-durum', 'Proje talimatı kopyalandı.', 'Talimatı seçip elle kopyalayabilirsin.',
));

bul('rapor-form').addEventListener('submit', olay => {
  olay.preventDefault();
  try {
    const { ozet, sonrakiAdim, alintilar, dogrulanmayan } = raporOku(deger('rapor-metin'), deger('not'));
    sonucGoster('rapor-sonuc', oge('h2', 'Öğrendiklerim'), oge('p', ozet),
      oge('h3', 'Sonraki adım'), oge('p', sonrakiAdim),
      oge('h3', 'Ders notundan doğrulanan alıntılar'),
      alintilar.length ? liste('ul', alintilar) : oge('p', 'Doğrulanan alıntı yok.'));
    bildir('rapor-durum', dogrulanmayan ? `${dogrulanmayan} alıntı ders notunda bulunamadı ve gösterilmedi.` : '');
  } catch (hata) {
    bul('rapor-sonuc').hidden = true;
    bildir('rapor-durum', hata.message);
  }
});

const kayitAnahtari = 'sokratik-koc-skor-v1';
let skorlar = {};
let acikTest;
let istek = 0;

try {
  const kayit = localStorage.getItem(kayitAnahtari);
  bul('sakla').checked = kayit !== null;
  skorlar = kayitOku(kayit);
} catch {
  bildir('test-durum', 'Tarayıcı kaydı kullanılamıyor. Skorlar bu sayfada gösterilecek.');
}

function kaydiGuncelle() {
  try {
    if (bul('sakla').checked) localStorage.setItem(kayitAnahtari, JSON.stringify(skorlar));
    else localStorage.removeItem(kayitAnahtari);
    return true;
  } catch {
    bildir('test-durum', 'Tarayıcı kaydı değiştirilemedi. Sayfadaki skorlar kullanılabilir.');
    return false;
  }
}

function skorGoster() {
  const { on, son } = skorlar[deger('test-konu')] ?? {};
  const kazanım = son - on;
  bildir('skor', son !== undefined
    ? `Ön test ${on}/10 · Son test ${son}/10 · Kazanım ${kazanım > 0 ? '+' : ''}${kazanım} puan`
    : on !== undefined ? `Ön test ${on}/10 · Son test bekleniyor` : '');
  bildir('teste-basla', son !== undefined ? 'Açıklamaları göster' : on !== undefined ? 'Son teste başla' : 'Ön teste başla');
  bul('teste-basla').disabled = Boolean(acikTest);
  bul('konuyla-calis').hidden = on === undefined || son !== undefined;
}

function testiKapat() {
  istek++;
  acikTest = undefined;
  bul('test-form').hidden = true;
  bul('sorular').replaceChildren();
  bul('aciklamalar').hidden = true;
  bul('aciklamalar').replaceChildren();
}

bul('sakla').addEventListener('change', () => {
  if (kaydiGuncelle()) bildir('test-durum', bul('sakla').checked ? 'Skor kaydı açık.' : 'Tarayıcıdaki skor kaydı kaldırıldı.');
});
bul('sil').addEventListener('click', () => {
  skorlar = {};
  bul('sakla').checked = false;
  testiKapat();
  if (kaydiGuncelle()) bildir('test-durum', 'Tüm skorlar temizlendi.');
  skorGoster();
});
bul('test-konu').addEventListener('change', () => {
  testiKapat();
  bildir('test-durum', '');
  skorGoster();
});

bul('konuyla-calis').addEventListener('click', () => {
  const [id, konu] = testKonulari.find(([id]) => id === deger('test-konu'));
  bul('konu').value = konu;
  bul('sablon').value = id === 'turev' ? 'Matematik / Kalkülüs' : 'Veri Yapıları';
  bul('sablon').dispatchEvent(new Event('change'));
  sekmeAc(bul('sekme-oturum'));
  bul('konu').focus();
});

function sorulariGoster(sorular, asama) {
  bildir('test-baslik', asama === 'on' ? 'Ön test' : 'Son test');
  bul('sorular').replaceChildren(...sorular.map(({ soru, secenekler }, i) => {
    const grup = oge('fieldset');
    grup.append(oge('legend', `${i + 1}. ${soru}`));
    secenekler.forEach((secenek, j) => {
      const etiket = oge('label');
      etiket.className = 'onay';
      const radyo = oge('input');
      radyo.type = 'radio';
      radyo.required = true;
      radyo.name = `soru-${i}`;
      radyo.value = j;
      etiket.append(radyo, oge('span', secenek));
      grup.append(etiket);
    });
    return grup;
  }));
  bul('test-form').hidden = false;
  bul('test-baslik').focus();
}

function aciklamalariGoster(veri) {
  const bolum = bul('aciklamalar');
  bolum.replaceChildren(...[['on', 'Ön test'], ['son', 'Son test']].map(([asama, ad]) => {
    const kutu = oge('details');
    kutu.append(oge('summary', `${ad} açıklamaları`),
      liste('ol', veri[asama].map(({ soru, aciklama, secenekler, dogru }) =>
        `${soru} Doğru yanıt: ${secenekler[dogru]}. ${aciklama}`)));
    return kutu;
  }));
  bolum.hidden = false;
}

bul('teste-basla').addEventListener('click', async () => {
  const id = deger('test-konu');
  const sira = ++istek;
  bul('teste-basla').disabled = true;
  bildir('test-durum', 'Sorular yükleniyor.');
  try {
    const yanit = await fetch(new URL(`./degerlendirme/${id}.json`, import.meta.url));
    if (!yanit.ok) throw new Error('Sorular yüklenemedi.');
    const veri = await yanit.json();
    if (sira !== istek) return;
    bildir('test-durum', '');
    if (skorlar[id]?.son !== undefined) {
      aciklamalariGoster(veri);
      bul('aciklamalar').querySelector('summary').focus();
    } else {
      const asama = skorlar[id] ? 'son' : 'on';
      acikTest = { id, asama, veri };
      sorulariGoster(veri[asama], asama);
    }
  } catch {
    if (sira === istek) bildir('test-durum', 'Sorular yüklenemedi. Sayfayı bağlantı varken açıp tekrar dene.');
  } finally {
    if (sira === istek) skorGoster();
  }
});

bul('test-form').addEventListener('submit', olay => {
  olay.preventDefault();
  if (!acikTest) return;
  const { id, asama, veri } = acikTest;
  const form = new FormData(olay.currentTarget);
  const yanitlar = veri[asama].map((_, i) => form.has(`soru-${i}`) ? Number(form.get(`soru-${i}`)) : NaN);
  try {
    const puan = testPuanla(veri[asama], yanitlar);
    skorlar[id] = { ...skorlar[id], [asama]: puan };
    testiKapat();
    skorGoster();
    if (kaydiGuncelle()) bildir('test-durum', asama === 'on'
      ? 'Ön test tamamlandı. Aynı konuda çalıştıktan sonra son testi çöz.'
      : 'Son test tamamlandı. İki testin açıklamalarını inceleyebilirsin.');
    if (asama === 'son') aciklamalariGoster(veri);
    bul(asama === 'on' ? 'konuyla-calis' : 'teste-basla').focus();
  } catch (hata) {
    bildir('test-durum', hata.message);
  }
});

skorGoster();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(new URL('./sw.js', import.meta.url)).catch(() => {
    // Açık sayfadaki çalışma planı önbellek kurulmasa da çalışır.
  });
}
