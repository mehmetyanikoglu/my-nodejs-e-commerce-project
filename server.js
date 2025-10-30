// --- Gerekli Modüllerin İçeri Aktarılması (Import) ---

// Express.js: Node.js için web uygulama çatısı. Sunucu kurmamızı ve rotaları yönetmemizi sağlar.
const express = require('express');
// dotenv: .env dosyasındaki ortam değişkenlerini 'process.env' nesnesine yükler.
const dotenv = require('dotenv');

// --- Başlangıç Yapılandırması (Initial Configuration) ---

// dotenv.config() metodu, projenin kök dizinindeki '.env' dosyasını bulur ve okur.
// BU SATIR, .env dosyasındaki değişkenlere ihtiyaç duyan (database.js gibi)
// diğer tüm kodlardan ÖNCE çalıştırılmalıdır. Bu, projenin en kritik kurallarından biridir.
dotenv.config();

// Veritabanı bağlantısını yönetecek olan Singleton nesnemizi import ediyoruz.
// 'require' ettiğimizde, database.js dosyasının en sonundaki 'module.exports' bize
// Database sınıfının tekil örneğini (instance) verir.
const dbInstance = require('./config/database.js'); 
// Ürünlerle ilgili URL'leri (/api/products, /api/products/:id) yönetecek olan
// yönlendirici (router) modülümüzü import ediyoruz.
const productRoutes = require('./routes/productRoutes.js');
const userRoutes = require('./routes/userRoutes.js');

// --- Ana Sunucu Başlatma Mantığı ---

// Tüm başlatma sürecini 'async' bir fonksiyon içine alıyoruz.
// Bu, veritabanı bağlantısı gibi asenkron (zaman alan) işlemlerin
// tamamlanmasını beklememizi ve uygulamanın doğru sırada başlamasını sağlar.
const startServer = async () => {
    // try...catch bloğu, başlatma sırasında oluşabilecek kritik hataları
    // (örneğin veritabanına bağlanamama) yakalamak için kullanılır.
    try {
        // 'await' anahtar kelimesi, dbInstance.connect() metodunun tamamlanmasını bekler.
        // Bu metot, başarılı olursa bir sonraki satıra geçilir.
        // Başarısız olursa, bir hata fırlatır ve program 'catch' bloğuna atlar.
        // Bu sayede, sunucunun veritabanı hazır olmadan istek kabul etmesi engellenir.
        await dbInstance.connect();

        // Veritabanı bağlantısı başarılı olduktan SONRA Express uygulamasını başlatıyoruz.
        const app = express();
        const PORT = process.env.PORT || 3000;

        // --- Middleware Katmanı ---
        // app.use(express.json()): Bu, Express'e gelen isteklerin (request)
        // body kısmındaki JSON verilerini otomatik olarak bir JavaScript nesnesine
        // çevirmesini söyleyen bir ara yazılımdır (middleware). POST ve PUT gibi
        // veri gönderme işlemlerinde bu satır zorunludur.
        app.use(express.json());
        
        // --- Rota (Route) Katmanı ---

        // Ana rota: API'nin çalışıp çalışmadığını kontrol etmek için basit bir test noktası.
        app.get('/testapi/', (req, res) => {
            res.send('Version 1.2: API çalışıyor...');
        });
        
        // Ürün Rotaları: Uygulamamıza diyoruz ki, "/api/products" ile başlayan
        // herhangi bir URL'ye istek gelirse, o isteği yönetmesi için 'productRoutes' yönlendiricisine devret.
        app.use('/api/products', productRoutes);
        app.use('/api/users', userRoutes);
        
        // --- Sunucuyu Dinlemeye Başlatma ---
        
        // app.listen(), sunucuyu belirtilen port üzerinden gelen HTTP isteklerini
        // dinlemeye başlatır. Bu, başlatma sürecinin en son adımıdır.
        app.listen(PORT, () => {
            console.log(`Sunucu ${PORT} portunda başarıyla çalışıyor.`);
        });
    } catch (error) {
        // Eğer 'try' bloğundaki 'await dbInstance.connect()' satırı bir hata fırlatırsa,
        // program bu 'catch' bloğuna düşer.
        console.error("Sunucu başlatılırken kritik bir hata oluştu:", error.message);
        
        // process.exit(1), uygulamanın kasıtlı olarak bir hata ile sonlandırıldığını belirtir.
        // Veritabanı olmadan API'nin çalışması anlamsız olduğu için bu en güvenli yaklaşımdır.
        process.exit(1);
    }
};

// --- Uygulamayı Çalıştırma ---
// Tanımladığımız 'startServer' fonksiyonunu çağırarak tüm süreci başlatıyoruz.
startServer();