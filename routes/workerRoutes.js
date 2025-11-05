const express = require('express');
const router = express.Router();

const {
    getAllWorkers,
    getWorkerById,
    getMyWorkerProfile,
    createWorker,
    updateWorker,
    deleteWorker,
} = require('../controllers/workerController.js');

const { protect, admin } = require('../middleware/authMiddleware.js');

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

module.exports = router;
