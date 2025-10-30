// 1. Product modelimizi import ediyoruz. Veritabanı işlemleri için bu modele ihtiyacımız var.
//    ../ diyerek bir üst dizine (proje ana dizinine) çıkıp oradan models klasörüne giriyoruz.
const Product = require('../models/product.js');

// --- Tüm Ürünleri Getiren Fonksiyon ---
const getAllProducts = async (req, res) => {
    try {
        // 2. Product modelini kullanarak veritabanındaki TÜM ürünleri buluyoruz.
        //    .find({}) metodu, filtre olmadan tüm dokümanları getirir.
        //    'await' kelimesi, veritabanından cevap gelene kadar kodun bu satırda beklemesini sağlar.
        const products = await Product.find({});

        // 3. Başarılı olursa, istemciye 200 (OK) durum kodu ve bulunan ürünleri JSON formatında gönderiyoruz.
        res.status(200).json(products);

    } catch (error) {
        // 4. 'try' bloğunda herhangi bir hata olursa, 'catch' bloğu çalışır.
        //    İstemciye 500 (Sunucu Hatası) durum kodu ve bir hata mesajı gönderiyoruz.
        console.error('Hata:', error); // Hatayı konsola da yazdıralım ki görebilelim.
        res.status(500).json({ message: 'Ürünler getirilirken bir sunucu hatası oluştu.' });
    }
};

// --- ID'ye Göre Tek Bir Ürün Getiren Fonksiyon ---
const getProductById = async (req, res) => {
    try {
        // 5. İsteğin parametrelerinden (URL'den) ürünün ID'sini alıyoruz.
        //    Örn: /api/products/12345 -> req.params.id = '12345' olur.
        const productId = req.params.id;

        // 6. Product modelini kullanarak o ID'ye sahip ürünü veritabanında buluyoruz.
        const product = await Product.findById(productId);

        // 7. Eğer o ID'ye sahip bir ürün bulunamazsa...
        if (!product) {
            // ...istemciye 404 (Bulunamadı) durum kodu ve bir mesaj gönderiyoruz.
            return res.status(404).json({ message: 'Ürün bulunamadı.' });
        }

        // 8. Ürün bulunduysa, istemciye 200 (OK) durum kodu ve ürünü JSON formatında gönderiyoruz.
        res.status(200).json(product);

    } catch (error) {
        // Hata durumunda yine 500 hatası gönderiyoruz.
        console.error('Hata:', error);
        res.status(500).json({ message: 'Ürün getirilirken bir sunucu hatası oluştu.' });
    }
};

// 9. Yazdığımız bu fonksiyonları projenin başka yerlerinde kullanabilmek için export ediyoruz.
module.exports = {
    getAllProducts,
    getProductById
};