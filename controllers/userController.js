import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// --- Yeni Kullanıcı Kaydı (Register) ---
const registerUser = async (req, res) => {
    // 1. Kullanıcının gönderdiği bilgileri (isim, e-posta, şifre) isteğin 'body'sinden al.
    const { name, email, password } = req.body;

    try {
        // 2. Bu e-posta adresi veritabanında zaten kayıtlı mı diye kontrol et.
        const userExists = await User.findOne({ email });
        if (userExists) {
            // Eğer varsa, isteğin kötü olduğunu belirten 400 durum koduyla bir hata mesajı gönder.
            return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor.' });
        }

        // 3. User modelini kullanarak yeni bir kullanıcı oluştur.
        //    Bu 'create' işlemi tetiklendiği anda, User modelindeki 'pre-save' hook'u
        //    devreye girer ve 'password' alanını otomatik olarak hash'ler.
        const user = await User.create({
            name,
            email,
            password,
        });

        // 4. Kullanıcı başarıyla oluşturulduysa...
        if (user) {
            // ...ona kimliğini kanıtlayan bir JWT (dijital pasaport) oluştur.
            const token = jwt.sign(
                { id: user._id }, // Pasaportun içine sadece kullanıcının eşsiz ID'sini koyuyoruz.
                process.env.JWT_SECRET, // Pasaportu, sadece bizim bildiğimiz gizli anahtarla imzalıyoruz.
                { expiresIn: '30d' } // Pasaportun 30 gün geçerli olacağını belirtiyoruz.
            );

            // 201 (Created) durum koduyla birlikte, yeni oluşturulan kullanıcının bilgilerini
            // (şifre HARİÇ) ve token'ını istemciye geri gönder.
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: token,
            });
        } else {
            res.status(400).json({ message: 'Geçersiz kullanıcı verisi.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası: ' + error.message });
    }
};

// --- Kullanıcı Girişi (Login) ---
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Verilen e-postaya sahip bir kullanıcıyı veritabanında bul.
        const user = await User.findOne({ email });

        // 2. Eğer kullanıcı bulunduysa VE Adım 1'de modele eklediğimiz metodu kullanarak
        //    girdiği şifrenin doğruluğunu kanıtlarsa...
        if (user && (await user.matchPassword(password))) {
            // ...ona yeni bir dijital pasaport (token) ver.
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '30d',
            });

            // Kullanıcı bilgilerini ve token'ı geri döndür.
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: token,
            });
        } else {
            // Kullanıcı bulunamadıysa veya şifre yanlışsa, 401 (Yetkisiz) durum koduyla hata döndür.
            res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası: ' + error.message });
    }
};

export { registerUser, loginUser };