const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const Worker = require('../models/Worker.js');
const jwt = require('jsonwebtoken');

// --- GET: Giriş sayfası ---
router.get('/login', (req, res) => {
  res.render('login', {
    error: null,
    success: null
  });
});

// --- POST: Giriş işlemi ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Kullanıcıyı bul
    const user = await User.findOne({ email });

    // Kullanıcı var mı ve şifre doğru mu?
    if (user && (await user.matchPassword(password))) {
      // JWT token oluştur
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Token'ı cookie'ye kaydet (httpOnly güvenlik için önemli)
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 gün
        secure: process.env.NODE_ENV === 'production', // Production'da HTTPS gerekli
      });

      // Başarılı giriş - Admin ise admin paneline, değilse çalışan paneline yönlendir
      if (user.isAdmin) {
        res.redirect('/admin/dashboard');
      } else {
        res.redirect('/workers/profile');
      }
    } else {
      // Hatalı giriş
      res.render('login', {
        error: 'E-posta veya şifre hatalı!',
        success: null
      });
    }
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.render('login', {
      error: 'Sunucu hatası. Lütfen tekrar deneyin.',
      success: null
    });
  }
});

// --- GET: Çıkış işlemi ---
router.get('/logout', (req, res) => {
  // Cookie'yi temizle
  res.clearCookie('token');
  res.redirect('/auth/login');
});

module.exports = router;
