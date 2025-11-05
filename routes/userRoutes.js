const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController.js');

// Gelen POST isteklerini doğru fonksiyonlara yönlendiriyoruz:

// Yeni kullanıcı kaydı için: POST /api/users
router.post('/', registerUser);
// Kullanıcı girişi için: POST /api/users/login
router.post('/login', loginUser);

module.exports = router;