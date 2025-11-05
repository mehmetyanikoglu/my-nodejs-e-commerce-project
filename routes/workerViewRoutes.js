import express from 'express';
import jwt from 'jsonwebtoken';
import Worker from '../models/Worker.js';
import User from '../models/User.js';

const router = express.Router();

// Constants - Configuration
const TOKEN_EXPIRY = '30d';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

// Error Messages
const ERROR_MESSAGES = {
  SERVER_ERROR: 'Sunucu hatası',
  UNAUTHORIZED: 'Bu işlem için yetkiniz yok.',
  PASSWORDS_MISMATCH: 'Şifreler eşleşmiyor!',
  EMAIL_EXISTS: 'Bu e-posta adresi zaten kullanılıyor!',
  REGISTRATION_ERROR: 'Kayıt oluşturulamadı. Lütfen tüm alanları doğru doldurun.',
  UPDATE_ERROR: 'Güncelleme hatası',
  FORBIDDEN: 'Bu sayfaya erişim yetkiniz yok.'
};

// Service Layer - Business Logic
class WorkerService {
  static async findByUserId(userId) {
    return Worker.findOne({ user: userId }).populate('user', 'name email');
  }

  static async createWorkerAccount(userData, workerData) {
    // Create User
    const user = await User.create({
      name: `${workerData.firstName} ${workerData.lastName}`,
      email: userData.email,
      password: userData.password,
      isAdmin: false,
    });

    // Create Worker
    await Worker.create({
      user: user._id,
      ...workerData,
      skills: workerData.skills ? workerData.skills.split(',').map(s => s.trim()) : [],
      isActive: true,
      isApproved: false,
    });

    return user;
  }

  static async updateWorker(workerId, updateData) {
    return Worker.findByIdAndUpdate(
      workerId,
      {
        ...updateData,
        skills: updateData.skills ? updateData.skills.split(',').map(s => s.trim()) : [],
        isActive: updateData.isActive === 'on',
      },
      { runValidators: true, new: true }
    );
  }

  static async checkEmailExists(email) {
    return User.findOne({ email });
  }
}

// Helper Functions
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

const setCookieToken = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
};

const renderForm = (res, options = {}) => {
  const defaults = {
    pageTitle: 'Çalışan Kayıt Formu',
    user: null,
    worker: null,
    actionUrl: '/workers/new',
    error: null,
  };
  res.render('worker-form', { ...defaults, ...options });
};

// Middleware Factory Pattern
const createAuthMiddleware = () => {
  return async (req, res, next) => {
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
};

const createRequireAuth = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/auth/login');
    }
    next();
  };
};

const createRequireAdmin = () => {
  return (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).send(ERROR_MESSAGES.FORBIDDEN);
    }
    next();
  };
};

// Middleware Instances
const getUserFromToken = createAuthMiddleware();
const requireAuth = createRequireAuth();
const requireAdmin = createRequireAdmin();

// Apply global middleware
router.use(getUserFromToken);

// Route Handlers - Clean Code Pattern
const handleHomePage = (req, res) => {
  if (!req.user) {
    return res.redirect('/workers/new');
  }
  
  if (req.user.isAdmin) {
    return res.redirect('/admin/dashboard');
  }
  
  res.redirect('/workers/profile');
};

const handleRegistrationForm = async (req, res) => {
  try {
    if (req.user) {
      return res.redirect('/workers/profile');
    }

    renderForm(res);
  } catch (err) {
    console.error('Form loading error:', err);
    res.status(500).send(ERROR_MESSAGES.SERVER_ERROR);
  }
};

const handleRegistrationSubmit = async (req, res) => {
  try {
    const { email, password, confirmPassword, ...workerData } = req.body;

    // Validate passwords
    if (password !== confirmPassword) {
      return renderForm(res, { error: ERROR_MESSAGES.PASSWORDS_MISMATCH });
    }

    // Check email availability
    const userExists = await WorkerService.checkEmailExists(email);
    if (userExists) {
      return renderForm(res, { error: ERROR_MESSAGES.EMAIL_EXISTS });
    }

    // Create user and worker
    const user = await WorkerService.createWorkerAccount(
      { email, password },
      workerData
    );

    // Generate token and set cookie
    const token = generateToken(user._id);
    setCookieToken(res, token);

    // Redirect to profile
    res.redirect('/workers/profile');
  } catch (err) {
    console.error('Registration error:', err);
    renderForm(res, { error: ERROR_MESSAGES.REGISTRATION_ERROR });
  }
};

const handleProfileView = async (req, res) => {
  try {
    const worker = await WorkerService.findByUserId(req.user._id);
    
    if (!worker) {
      const redirectPath = req.user.isAdmin ? '/admin/dashboard' : '/workers/new';
      return res.redirect(redirectPath);
    }

    res.render('user-profile', {
      pageTitle: 'Profilim',
      user: req.user,
      worker,
    });
  } catch (err) {
    console.error('Profile loading error:', err);
    res.status(500).send(ERROR_MESSAGES.SERVER_ERROR);
  }
};

const handleEditForm = async (req, res) => {
  try {
    const worker = await WorkerService.findByUserId(req.user._id);
    
    if (!worker) {
      return res.redirect('/workers/new');
    }

    renderForm(res, {
      pageTitle: 'Profili Düzenle',
      user: req.user,
      worker,
      actionUrl: `/workers/${worker._id}/update`,
    });
  } catch (err) {
    console.error('Edit form loading error:', err);
    res.status(500).send(ERROR_MESSAGES.SERVER_ERROR);
  }
};

const handleProfileUpdate = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    
    // Authorization check
    if (!worker || worker.user.toString() !== req.user._id.toString()) {
      return res.status(403).send(ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Update worker
    await WorkerService.updateWorker(req.params.id, req.body);

    res.redirect('/workers/profile');
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).send(ERROR_MESSAGES.UPDATE_ERROR);
  }
};

// Route Definitions - Separation of Concerns
router.get('/', handleHomePage);
router.get('/new', handleRegistrationForm);
router.post('/new', handleRegistrationSubmit);
router.get('/profile', requireAuth, handleProfileView);
router.get('/edit', requireAuth, handleEditForm);
router.post('/:id/update', requireAuth, handleProfileUpdate);

export default router;
