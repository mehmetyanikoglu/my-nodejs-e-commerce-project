import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';

const router = express.Router();

// Gelen POST isteklerini doğru fonksiyonlara yönlendiriyoruz:

// Yeni kullanıcı kaydı için: POST /api/users
router.post('/', registerUser);
// Kullanıcı girişi için: POST /api/users/login
router.post('/login', loginUser);

export default router;