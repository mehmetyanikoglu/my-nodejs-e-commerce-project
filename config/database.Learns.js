// Gerekli olan 'mongoose' kütüphanesini projeye dahil ediyoruz.
// Mongoose, MongoDB veritabanı ile JavaScript objeleri arasında bir köprü görevi görür,
// veri modelleme, doğrulama ve iş mantığı yönetimini kolaylaştırır.
const mongoose = require('mongoose');

// --- Singleton Tasarım Deseni ile Veritabanı Bağlantı Sınıfı ---
// Bu sınıfın varlık amacı, tüm uygulama yaşam döngüsü boyunca veritabanına
// sadece ve sadece BİR TANE bağlantı nesnesi (instance) oluşturulmasını garanti etmektir.
// Bu, kaynakların verimli kullanılmasını sağlar ve gereksiz bağlantıların önüne geçer.
class Database {
    // Sınıfın tekil örneğini (instance) tutacak olan 'static' bir özelliktir.
    // 'static' olduğu için bu özellik, sınıftan oluşturulan nesnelere değil,
    // doğrudan 'Database' sınıfının kendisine aittir.
    static instance;
    
    // Bağlantı başarılı bir şekilde kurulduktan sonra, Mongoose'un bağlantı nesnesini
    // bu özellikte saklayacağız. Başlangıçta 'null' olması, henüz bir bağlantı olmadığını gösterir.
    connection = null;

    // 'new Database()' çağrıldığında çalışan özel bir metottur (yapıcı/constructor).
    constructor() {
        // Singleton deseninin kalbi: Eğer 'Database.instance' daha önce oluşturulmuşsa,
        // yeni bir nesne oluşturmak yerine, mevcut olan o tekil nesneyi geri döndür.
        if (Database.instance) {
            return Database.instance;
        }
        // Eğer bu, sınıfın ilk oluşturulma anıysa ('instance' boşsa),
        // o zaman oluşturulan bu yeni nesneyi ('this') 'static instance' özelliğine ata.
        // Artık 'instance' dolu olduğu için, bundan sonraki tüm 'new Database()' çağrıları
        // yukarıdaki 'if' bloğuna takılıp mevcut 'instance'ı döndürecektir.
        Database.instance = this;
    }

    // Veritabanına asenkron olarak bağlanmayı sağlayan metot.
    // 'async' olması, içinde 'await' anahtar kelimesini kullanmamıza izin verir.
    async connect() {
        // İdempotentlik kontrolü: Eğer 'this.connection' dolu ise (yani bağlantı zaten kurulmuşsa),
        // metodu daha fazla çalıştırma. Bu, yanlışlıkla birden çok kez bağlantı kurma girişimini engeller.
        if (this.connection) {
            console.log('Veritabanı bağlantısı zaten mevcut, tekrar bağlanılmıyor.');
            return;
        }

        // Hata yönetimi bloğu: Bağlantı sırasında oluşabilecek potansiyel hataları yakalamak için kullanılır.
        try {
            // Güvenlik kontrolü: .env dosyasında MONGO_URI'nin var olup olmadığını kontrol et.
            // Bu, en yaygın yapılandırma hatalarından birini uygulamanın en başında yakalamamızı sağlar.
            if (!process.env.MONGO_URI) {
                // Eğer değişken tanımsızsa, açıklayıcı bir hata fırlat.
                throw new Error("HATA: MONGO_URI ortam değişkeni .env dosyasında tanımlanmamış.");
            }

            console.log('Veritabanına bağlanılıyor...');
            // Mongoose'un 'connect' metodunu çağırarak asıl bağlantıyı kur.
            // 'await', bu işlemin tamamlanmasını (başarılı veya hatalı) bekler ve kodun akışını duraklatır.
            const connection = await mongoose.connect(process.env.MONGO_URI);
            
            // Başarılı bağlantı sonucunda dönen nesneyi, sınıfın 'connection' özelliğine atıyoruz.
            this.connection = connection; 
            
            // Bağlantının hangi sunucuya yapıldığını belirten bir başarı mesajı yazdır.
            console.log(`Veritabanına başarıyla bağlanıldı: ${connection.connection.host}`);

        } catch (error) {
            // 'try' bloğu içinde herhangi bir aşamada hata oluşursa, program bu 'catch' bloğuna atlar.
            console.error('Veritabanı bağlantısı kurulamadı. Hata server.js\'e fırlatılıyor...');
            
            // --- MİMARİ İYİLEŞTİRME ---
            // Uygulamayı burada aniden sonlandırmak ('process.exit(1)') yerine, yakalanan hatayı,
            // bu 'connect' metodunu çağıran yere (yani server.js'deki 'startServer' fonksiyonuna) geri fırlatıyoruz.
            // Bu, sorumlulukların doğru ayrılması prensibine daha uygundur. Alt seviye bir modül,
            // tüm uygulamanın kaderine karar vermemelidir.
            throw error;
        }
    }

    // Dışarıdan bu sınıfın tekil örneğine erişmek için kullanılacak 'static' bir metot.
    static getInstance() {
        // Eğer 'instance' henüz oluşturulmamışsa, 'new Database()' diyerek constructor'ı tetikle ve oluştur.
        if (!Database.instance) {
            new Database();
        }
        // Mevcut veya az önce oluşturulmuş 'instance'ı geri döndür.
        return Database.instance;
    }
}

// Bu dosya başka bir yerde 'require' edildiğinde, dışarıya 'Database' sınıfının kendisini değil,
// ondan 'getInstance()' metoduyla elde edilen TEKİL NESNEYİ (instance) ihraç ediyoruz.
// Bu, projenin her yerinde 'require('./config/database.js')' dendiğinde,
// herkesin aynı nesne üzerinde çalışmasını garanti altına alır.
module.exports = Database.getInstance();
