const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Worker = require('../models/Worker.js');
const User = require('../models/User.js');

// Middleware: Cookie'den kullanıcı bilgisini al
const getUserFromToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (error) {
    req.user = null;
  }
  next();
};

// Middleware: Kullanıcı giriş yapmış mı kontrol et
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Middleware: Admin kontrolü
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).send('Bu sayfaya erişim yetkiniz yok.');
  }
  next();
};

// Tüm view rotalarında getUserFromToken middleware'ini kullan
router.use(getUserFromToken);

// --- ANA SAYFA ---
router.get('/', (req, res) => {
  // Giriş yapmamışsa kayıt formuna yönlendir
  if (!req.user) {
    return res.redirect('/workers/new');
  }
  
  // Admin ise admin paneline yönlendir
  if (req.user.isAdmin) {
    return res.redirect('/admin/dashboard');
  }
  
  // Normal kullanıcı ise profil sayfasına yönlendir
  res.redirect('/workers/profile');
});

// --- İŞÇİ KAYIT FORMU (Herkes erişebilir - yeni kayıt için) ---
router.get('/new', async (req, res) => {
  try {
    // Eğer zaten giriş yapmışsa profiline yönlendir
    if (req.user) {
      return res.redirect('/workers/profile');
    }

    res.render('worker-form', {
      pageTitle: 'Çalışan Kayıt Formu',
      user: null,
      worker: null,
      actionUrl: '/workers/new',
      error: null,
    });
  } catch (err) {
    console.error('Form yüklenirken hata:', err);
    res.status(500).send('Sunucu hatası');
  }
});

// --- İŞÇİ KAYDI OLUŞTURMA (POST) - Hem User hem Worker oluştur ---
router.post('/new', async (req, res) => {
  try {
    const { email, password, confirmPassword, firstName, lastName, birthDate, phone, address, profession, jobType, experienceYears, education, skills, about, expectedSalary } = req.body;

    // Şifre kontrolü
    if (password !== confirmPassword) {
      return res.render('worker-form', {
        pageTitle: 'Çalışan Kayıt Formu',
        user: null,
        worker: null,
        actionUrl: '/workers/new',
        error: 'Şifreler eşleşmiyor!',
      });
    }

    // Email kontrolü
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.render('worker-form', {
        pageTitle: 'Çalışan Kayıt Formu',
        user: null,
        worker: null,
        actionUrl: '/workers/new',
        error: 'Bu e-posta adresi zaten kullanılıyor!',
      });
    }

    // 1. Önce User oluştur
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password, // User modelindeki pre-save hook otomatik hash'leyecek
      isAdmin: false,
    });

    // 2. Sonra Worker kaydı oluştur
    await Worker.create({
      user: user._id,
      firstName,
      lastName,
      birthDate,
      phone,
      address,
      profession,
      jobType,
      experienceYears,
      education,
      skills: skills ? skills.split(',').map(s => s.trim()) : [],
      about,
      expectedSalary,
      isActive: true,
      isApproved: false,
    });

    // 3. JWT token oluştur ve otomatik login yap
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Token'ı cookie'ye kaydet
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    });

    // 4. Profiline yönlendir
    res.redirect('/workers/profile');
  } catch (err) {
    console.error('Kayıt oluşturulurken hata:', err);
    res.render('worker-form', {
      pageTitle: 'Çalışan Kayıt Formu',
      user: null,
      worker: null,
      actionUrl: '/workers/new',
      error: 'Kayıt oluşturulamadı. Lütfen tüm alanları doğru doldurun.',
    });
  }
});

// --- KULLANICI PROFİLİ (Kendi kaydını görüntüleme) ---
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id }).populate('user', 'name email');
    
    if (!worker) {
      // Admin ise admin paneline yönlendir
      if (req.user.isAdmin) {
        return res.redirect('/admin/dashboard');
      }
      // Normal kullanıcı ise kayıt formuna yönlendir
      return res.redirect('/workers/new');
    }

    res.render('user-profile', {
      pageTitle: 'Profilim',
      user: req.user,
      worker,
    });
  } catch (err) {
    console.error('Profil yüklenirken hata:', err);
    res.status(500).send('Sunucu hatası');
  }
});

// --- PROFİL DÜZENLEME FORMU ---
router.get('/edit', requireAuth, async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    
    if (!worker) {
      return res.redirect('/workers/new');
    }

    res.render('worker-form', {
      pageTitle: 'Profili Düzenle',
      user: req.user,
      worker,
      actionUrl: `/workers/${worker._id}/update`,
      error: null,
    });
  } catch (err) {
    console.error('Düzenleme formu yüklenirken hata:', err);
    res.status(500).send('Sunucu hatası');
  }
});

// --- PROFİL GÜNCELLEME (POST) ---
router.post('/:id/update', requireAuth, async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    
    if (!worker || worker.user.toString() !== req.user._id.toString()) {
      return res.status(403).send('Bu işlem için yetkiniz yok.');
    }

    const { firstName, lastName, birthDate, phone, address, profession, jobType, experienceYears, education, skills, about, expectedSalary, isActive } = req.body;

    await Worker.findByIdAndUpdate(req.params.id, {
      firstName,
      lastName,
      birthDate,
      phone,
      address,
      profession,
      jobType,
      experienceYears,
      education,
      skills: skills ? skills.split(',').map(s => s.trim()) : [],
      about,
      expectedSalary,
      isActive: isActive === 'on',
    }, { runValidators: true });

    res.redirect('/workers/profile');
  } catch (err) {
    console.error('Profil güncellenirken hata:', err);
    res.status(500).send('Güncelleme hatası');
  }
});

module.exports = router;
