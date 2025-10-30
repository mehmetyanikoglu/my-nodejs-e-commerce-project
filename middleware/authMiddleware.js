// middleware/authMiddleware.js İÇİN TAM KOD
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

// Rotaları koruyacak olan asıl middleware fonksiyonumuz.
const protect = async (req, res, next) => {
    let token;

    // 1. Gelen isteğin başlıklarını (headers) kontrol et.
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Token'ı headerdan ayıkla.
            token = req.headers.authorization.split(' ')[1];

            // 3. Token'ı doğrula (Pasaport Kontrolü).
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Token geçerliyse, içindeki ID'yi kullanarak kullanıcıyı veritabanında bul.
            req.user = await User.findById(decoded.id).select('-password');

            // 5. Her şey mükemmel. Nöbetçi kapıyı açar ve isteğin devam etmesine izin verir.
            next();
        } catch (error) {
            console.error(error);
            // 'try' bloğunda bir hata olursa (örn: geçersiz token), 401 hatası gönder.
            res.status(401).json({ message: 'Yetkiniz yok, token geçersiz.' });
        }
    }

    // Eğer istekte 'Authorization' başlığı hiç yoksa...
    if (!token) {
        res.status(401).json({ message: 'Yetkiniz yok, token bulunamadı.' });
    }
};

module.exports = { protect };