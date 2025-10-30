const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController.js');

// Gelen POST isteklerini doğru fonksiyonlara yönlendiriyoruz.
// Kayıt için: /api/users/register
router.post('/register', registerUser);
// Giriş için: /api/users/login
router.post('/login', loginUser);

module.exports = router;