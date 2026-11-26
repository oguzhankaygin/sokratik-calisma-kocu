# Sokratik Ders Çalışma Koçu

Öğrencinin sorular ve kademeli ipuçlarıyla kendi yanıtını kurmasına yardımcı olan statik çalışma aracı. Ön ve son test, aynı konudaki kısa vadeli kazanımı puan olarak gösterir.

[Tarayıcıda kullan](https://oguzhankaygin.github.io/sokratik-calisma-kocu/)

## Nasıl çalışır?

1. **Çevrimdışı çalışma planı.** Konu, seviye, hedef ve süreyi gir. Uygulama çalışma ve mola bloklarını, hedefe göre kendine soracağın soruları ve Feynman adımlarını üretir. İnternete bağlı ilk ziyarette statik dosyalar önbelleğe alındıktan sonra sayfa ve testler çevrimdışı yeniden açılabilir.
2. **Claude’da aç.** İstersen sekiz alan şablonundan birini seç ve ders notu ekle. Düğme Türkçe koçluk talimatını kopyalar ve yeni bir Claude sekmesi açar. Hazır metni kendi Claude hesabındaki sohbete yapıştır. **Kalıcı kullanım** sekmesinden Claude Projects için tekrar kullanılabilir proje talimatını kopyalayabilirsin.
3. **Claude’un yanıtını yapıştır.** Mini quizden sonra Claude’dan “JSON raporu” iste. Raporu yapıştırınca site özet ve sonraki adımı gösterir, ders notunda birebir bulunan alıntıları doğrular.

**Kendini sına** sekmesinde bir konunun 10 soruluk ön testini çöz, aynı konu üzerinde çalış ve 10 soruluk son testi tamamla. Sayfa iki skoru ve aralarındaki puan farkını gösterir. İki testin açıklamaları son testten sonra açılır. Karşılaştırmalı uygulama için [ölçme protokolüne](degerlendirme/README.md) bak.

## Gizlilik

Site form verilerini sunucuya göndermez. Claude’a yapıştırdığın metin ve eklediğin notlar Claude ile paylaşılır. Uygulama öğrencinin girdilerini veya raporlarını kalıcı olarak saklamaz. Skorlar ancak seçeneği işaretlersen bu tarayıcının localStorage alanına yazılır. Seçeneği kapatınca kalıcı kayıt kaldırılır. **Skorları temizle** hem açık sayfadaki hem tarayıcıdaki skorları siler.

## Sınırlamalar

- Claude konuşmanın süresini ölçmez. Süreyi sen takip edip koça bildirirsin.
- Claude’un talimatları izlemesi ve yanıtlarının doğruluğu garanti edilemez. Rapor doğrulaması şemayı ve alıntı eşleşmesini denetler.
- Ön ve son test puanlarının farkı kısa vadeli bir göstergedir. Tek kişinin skoruyla yöntemler arasında nedensel sonuç çıkarılamaz.
- Çevrimdışı yeniden açılış, tarayıcının Service Worker ve önbellek desteğine bağlıdır. Claude sohbeti için bağlantı gerekir.

## Katkı

GitHub Pages kaynağını depo kökündeki `docs/` olarak seç. Kurulum, derleme ve API anahtarı gerekmez. Yerel tarayıcı önizlemesinde `docs/` dizinini bir statik HTTP sunucusunun kökü olarak kullan. ES modülleri tarayıcıda HTTP üzerinden yüklenir.

```sh
node --test tests/
for dosya in docs/*.js docs/lib/*.js; do node --check "$dosya" || exit 1; done
```

Soru setlerini düzenlerken `degerlendirme/` ve Pages tarafından sunulan `docs/degerlendirme/` JSON kopyalarını eşleştir. Tarayıcıya dağıtılan dosyalar değiştiğinde `docs/sw.js` içindeki önbellek sürümünü artır. Kod MIT lisanslıdır.
