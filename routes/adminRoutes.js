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

// Middleware: Admin kontrolü
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/auth/login');
  }
  if (!req.user.isAdmin) {
    return res.status(403).send('❌ Bu sayfaya erişim yetkiniz yok. Sadece yöneticiler erişebilir.');
  }
  next();
};

// Tüm admin rotalarında middleware'leri kullan
router.use(getUserFromToken);
router.use(requireAdmin);

// --- ADMİN DASHBOARD (Tüm işçileri listele) ---
router.get('/dashboard', async (req, res) => {
  try {
    const workers = await Worker.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.render('admin-dashboard', {
      pageTitle: 'Yönetici Paneli - Tüm Çalışanlar',
      user: req.user,
      workers,
    });
  } catch (err) {
    console.error('Admin paneli yüklenirken hata:', err);
    res.status(500).send('Sunucu hatası');
  }
});

// --- ADMİN: İŞÇİ DÜZENLEME FORMU ---
router.get('/workers/edit/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('user', 'name email');
    
    if (!worker) {
      return res.status(404).send('İşçi bulunamadı');
    }

    res.render('admin-worker-edit', {
      pageTitle: 'Çalışan Düzenle (Yönetici)',
      user: req.user,
      worker,
      actionUrl: `/admin/workers/update/${worker._id}`,
      error: null,
    });
  } catch (err) {
    console.error('Admin düzenleme formu yüklenirken hata:', err);
    res.status(500).send('Sunucu hatası');
  }
});

// --- ADMİN: İŞÇİ GÜNCELLEME ---
router.post('/workers/update/:id', async (req, res) => {
  try {
    const { firstName, lastName, birthDate, phone, address, profession, jobType, experienceYears, education, skills, about, expectedSalary, isActive, isApproved } = req.body;

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
      isApproved: isApproved === 'on',
    }, { runValidators: true });

    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Admin güncelleme hatası:', err);
    res.status(500).send('Güncelleme hatası');
  }
});

// --- ADMİN: İŞÇİ SİLME ---
router.post('/workers/delete/:id', async (req, res) => {
  try {
    await Worker.findByIdAndDelete(req.params.id);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('İşçi silinirken hata:', err);
    res.status(500).send('Silme hatası');
  }
});

module.exports = router;
