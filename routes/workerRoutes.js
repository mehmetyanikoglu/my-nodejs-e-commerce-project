import express from 'express';
import {
  getAllWorkers,
  getWorkerById,
  getMyWorkerProfile,
  createWorker,
  updateWorker,
  deleteWorker,
} from '../controllers/workerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- API Rotaları ---

// Tüm işçileri getir (sadece admin)
router.get('/', protect, admin, getAllWorkers);

// Kullanıcının kendi kaydını getir
router.get('/me', protect, getMyWorkerProfile);

// ID'ye göre tek işçi getir (admin veya kullanıcının kendisi)
router.get('/:id', protect, getWorkerById);

// Yeni işçi kaydı oluştur (giriş yapmış kullanıcılar)
router.post('/', protect, createWorker);

// İşçi kaydını güncelle (admin veya kullanıcının kendisi)
router.put('/:id', protect, updateWorker);

// İşçi kaydını sil (admin veya kullanıcının kendisi)
router.delete('/:id', protect, deleteWorker);

export default router;
