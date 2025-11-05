import express from 'express';
import jwt from 'jsonwebtoken';
import Worker from '../models/Worker.js';
import User from '../models/User.js';

const router = express.Router();

// Error Messages - Centralized Configuration
const ERROR_MESSAGES = {
  SERVER_ERROR: 'Sunucu hatası',
  WORKER_NOT_FOUND: 'İşçi bulunamadı',
  UPDATE_ERROR: 'Güncelleme hatası',
  DELETE_ERROR: 'Silme hatası',
  FORBIDDEN: '❌ Bu sayfaya erişim yetkiniz yok. Sadece yöneticiler erişebilir.',
};

// Service Layer - Admin Business Logic
class AdminWorkerService {
  static async getAllWorkers() {
    return Worker.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
  }

  static async getWorkerById(workerId) {
    return Worker.findById(workerId).populate('user', 'name email');
  }

  static async updateWorker(workerId, updateData) {
    const processedData = {
      ...updateData,
      skills: updateData.skills ? updateData.skills.split(',').map(s => s.trim()) : [],
      isActive: updateData.isActive === 'on',
      isApproved: updateData.isApproved === 'on',
    };

    return Worker.findByIdAndUpdate(
      workerId,
      processedData,
      { runValidators: true, new: true }
    );
  }

  static async deleteWorker(workerId) {
    return Worker.findByIdAndDelete(workerId);
  }
}

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

const createAdminMiddleware = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/auth/login');
    }
    if (!req.user.isAdmin) {
      return res.status(403).send(ERROR_MESSAGES.FORBIDDEN);
    }
    next();
  };
};

// Middleware Instances
const getUserFromToken = createAuthMiddleware();
const requireAdmin = createAdminMiddleware();

// Apply global middleware
router.use(getUserFromToken);
router.use(requireAdmin);

// Route Handlers - Clean Code Pattern
const handleDashboard = async (req, res) => {
  try {
    const workers = await AdminWorkerService.getAllWorkers();

    res.render('admin-dashboard', {
      pageTitle: 'Yönetici Paneli - Tüm Çalışanlar',
      user: req.user,
      workers,
    });
  } catch (err) {
    console.error('Dashboard loading error:', err);
    res.status(500).send(ERROR_MESSAGES.SERVER_ERROR);
  }
};

const handleEditForm = async (req, res) => {
  try {
    const worker = await AdminWorkerService.getWorkerById(req.params.id);
    
    if (!worker) {
      return res.status(404).send(ERROR_MESSAGES.WORKER_NOT_FOUND);
    }

    res.render('admin-worker-edit', {
      pageTitle: 'Çalışan Düzenle (Yönetici)',
      user: req.user,
      worker,
      actionUrl: `/admin/workers/update/${worker._id}`,
      error: null,
    });
  } catch (err) {
    console.error('Edit form loading error:', err);
    res.status(500).send(ERROR_MESSAGES.SERVER_ERROR);
  }
};

const handleWorkerUpdate = async (req, res) => {
  try {
    await AdminWorkerService.updateWorker(req.params.id, req.body);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Worker update error:', err);
    res.status(500).send(ERROR_MESSAGES.UPDATE_ERROR);
  }
};

const handleWorkerDelete = async (req, res) => {
  try {
    await AdminWorkerService.deleteWorker(req.params.id);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Worker deletion error:', err);
    res.status(500).send(ERROR_MESSAGES.DELETE_ERROR);
  }
};

// Route Definitions - Separation of Concerns
router.get('/dashboard', handleDashboard);
router.get('/workers/edit/:id', handleEditForm);
router.post('/workers/update/:id', handleWorkerUpdate);
router.post('/workers/delete/:id', handleWorkerDelete);

export default router;
