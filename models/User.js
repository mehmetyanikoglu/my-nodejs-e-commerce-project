// Gerekli olan Mongoose ve Bcryptjs kütüphanelerini içeri aktarıyoruz.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Bir "Kullanıcı" için Mongoose Şeması (veri şablonu) oluşturuyoruz.
const userSchema = new mongoose.Schema(
    {
        // Kullanıcının adı.
        name: {
            type: String,
            required: [true, 'Lütfen bir isim giriniz.'], // 'true' yerine hata mesajı da verebiliriz.
            trim: true,
        },
        // Kullanıcının e-posta adresi.
        email: {
            type: String,
            required: [true, 'Lütfen bir e-posta adresi giriniz.'],
            unique: true, // BU ÇOK ÖNEMLİ: Her e-postanın benzersiz olmasını sağlar.
            // Aynı e-posta ile ikinci bir kullanıcı oluşturulamaz.
            trim: true,
            lowercase: true, // E-postaları küçük harfe çevirerek 'Test@mail.com' ile 'test@mail.com'un aynı olmasını sağlar.
        },
        // Kullanıcının şifresi.
        password: {
            type: String,
            required: [true, 'Lütfen bir şifre giriniz.'],
            minlength: [6, 'Şifre en az 6 karakter olmalıdır.'], // Minimum uzunluk kuralı ekleyebiliriz.
        },
    },
    {
        // createdAt ve updatedAt alanlarını otomatik olarak ekler.
        timestamps: true,
    }
);

// --- GÜVENLİK KATMANI: ŞİFREYİ OTOMATİK HASH'LEME ---
// Mongoose'un "pre" middleware'ini kullanıyoruz. Bu, belirli bir işlemden "önce" çalışacak bir fonksiyondur.
// 'save' işlemi (yani yeni bir kullanıcı kaydedilirken veya mevcut bir kullanıcı güncellenirken)
// tetiklenmeden HEMEN ÖNCE bu fonksiyon araya girecek.
userSchema.pre('save', async function (next) {
    // 'this' anahtar kelimesi, o an kaydedilmekte olan kullanıcı dokümanını temsil eder.
    // 'userSchema.methods' diyerek, bu şemadan oluşturulan HER BİR kullanıcı dokümanına

    // Eğer şifre alanı DEĞİŞTİRİLMEMİŞSE (örneğin kullanıcı sadece e-postasını güncelliyorsa),
    // şifreyi tekrar hash'lemeye gerek yok. Boşuna işlem yapma ve devam et.
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // "Salt", hash'leme işlemine eklenen rastgele bir "karmaşıklık" katmanıdır.
        // Aynı şifreye sahip iki kullanıcının bile veritabanında farklı hash'lere sahip olmasını sağlar.
        // 10, salt'un karmaşıklık seviyesidir (genellikle 10-12 arası kullanılır).
        const salt = await bcrypt.genSalt(10);

        // Kullanıcının girdiği düz metin şifresini ('this.password') alıp, oluşturduğumuz salt ile
        // geri döndürülemez bir şekilde hash'liyoruz.
        this.password = await bcrypt.hash(this.password, salt);

        // İşlem bitti, 'save' işlemine devam etmesi için 'next()' fonksiyonunu çağır.
        next();
    } catch (error) {
        // Hash'leme sırasında bir hata olursa, hatayı bir sonraki adıma taşı.
        next(error);
    }
});

// özel metotlar ekleyebiliriz. Bu, bir 'instance method'dur.
// Metodun adı 'matchPassword'.
userSchema.methods.matchPassword = async function (enteredPassword) {
    // Bu metot, iki parametreyi karşılaştırır:
    // 1. enteredPassword: Kullanıcının giriş yaparken girdiği düz metin şifre.
    // 2. this.password: Veritabanından gelen, o kullanıcıya ait olan hash'lenmiş şifre.
    // bcrypt.compare, bu karşılaştırmayı GÜVENLİ bir şekilde yapar. Asla hash'i geri çözmez.
    // Sonuç olarak 'true' veya 'false' döndürür.
    return await bcrypt.compare(enteredPassword, this.password);
};


// Şemamızı kullanarak bir Model oluşturuyoruz.
const User = mongoose.model('User', userSchema);

// Oluşturduğumuz User modelini projenin başka yerlerinde kullanabilmek için export ediyoruz.
module.exports = User;
