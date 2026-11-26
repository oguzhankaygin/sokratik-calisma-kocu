# Ön test, oturum, son test

Aynı konuda doğrudan cevap ve Sokratik çalışma yöntemlerini kısa vadeli öğrenme kazanımı üzerinden karşılaştırmak için her katılımcı aynı sırayı izler.

1. Bir konu seç. Her iki gruba aynı konunun 10 soruluk ön testini ver. Yardım, not ve doğru yanıt açıklaması kullanmadan tamamlat.
2. Öğrencileri mümkünse rastgele iki gruba ata. Konu, çalışma hedefi, seviye, kaynaklar, Claude modeli ve oturum süresi iki grupta aynı olsun. Öğrencilerin test sorularını Claude’a göndermemesini iste.
   - **Doğrudan cevap grubu** için başlangıç isteği: “Bu konuyu düzeyime göre açıkla. Çözümü adım adım doğrudan göster ve örnek ver.”
   - **Sokratik grup** için sitedeki oturum metnini kullan. Koçun kapanışındaki mini quiz çalışmanın bir parçasıdır. İki grubun toplam çalışma süresini eşitle.
3. Oturumdan hemen sonra aynı konunun 10 soruluk son testini yardım veya not kullanmadan uygula. Aynı kazanımları farklı sorularla ölçer. Doğru yanıtları ve açıklamaları ancak son test bittikten sonra göster.

Her doğru yanıt 1 puan. Kazanım = son test puanı − ön test puanı (−10 ile +10 puan). Her katılımcı için anonim kimlik, konu, grup, ön test ve son test skorunu kaydet. Grup başına katılımcı sayısını, ön test ortalamasını ve ortalama kazanımı raporla. Eksik oturumları ve küçük örneklemi belirt. Testlerin güçlükleri ampirik olarak eşitlenmediği için küçük puan farklarını temkinli yorumla.

- [Türev ve değişim hızı](turev.json)
- [Temel veri yapıları](veri-yapilari.json)

JSON dosyalarında `on` ve `son` dizileri, her soru için `secenekler`, sıfır tabanlı doğru seçenek indeksi `dogru` ve `aciklama` bulunur. Sayfadaki bireysel akış grup ataması veya katılımcı verisi toplamaz.
