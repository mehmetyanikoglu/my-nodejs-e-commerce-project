const express = require('express');
// Express'in Router özelliğini kullanarak modüler bir yönlendirici oluşturuyoruz.
const router = express.Router();

// Controller'dan, istekleri yönetecek olan fonksiyonları import ediyoruz.
const { 
    getAllProducts, 
    getProductById 
} = require('../controllers/productController.js');

// YENİ EKLENEN SATIR: Nöbetçiyi (middleware) import et.
const { protect } = require('../middleware/authMiddleware.js');

// --- Rota Tanımlamaları ---

// Temel rota: GET /
// Bu dosya /api/products altında kullanılacağı için, bu rota aslında GET /api/products anlamına gelir.
// Bu rotaya istek geldiğinde, getAllProducts fonksiyonu çalışacak.
router.get('/', protect, getAllProducts);

// ID'ye göre tek ürün rotası: GET /:id
// Bu rota, /api/products/abc1234 gibi bir isteği karşılar.
// ':id' bir parametredir ve Express bu değeri req.params.id olarak Controller'a gönderir.
router.get('/:id', getProductById);


// Yapılandırdığımız bu router'ı dışa aktarıyoruz.
module.exports = router;