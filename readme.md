# Node.js & Express.js E-Ticaret API Projesi

Bu proje, Node.js, Express ve MongoDB kullanılarak geliştirilmiş temel bir e-ticaret platformu için RESTful API sunucusudur. Proje, modern backend geliştirme pratiklerini öğrenmek ve uygulamak amacıyla oluşturulmuştur. Kullanıcı kaydı, JWT ile kimlik doğrulama ve ürün listeleme gibi temel özellikleri içerir.

## 🎯 Projenin Amacı ve Geliştirme Süreci

Bu proje, backend geliştirme yeteneklerimi sergilemek ve Node.js ekosistemindeki en iyi pratikleri (best practices) uygulayarak kendimi geliştirmek amacıyla başlattığım bir öğrenme yolculuğudur. Proje **aktif olarak geliştirilme aşamasındadır** ve zamanla yeni özellikler eklenerek daha kapsamlı bir hale getirilecektir.

Temel hedefim, production (canlı ortam) seviyesinde bir uygulamanın temel bileşenlerini sıfırdan inşa ederek sağlam bir temel oluşturmaktır.

### Gelecekte Eklenecek Özellikler

-   **Gelişmiş Ürün Yönetimi:** Ürün ekleme, güncelleme ve silme (CRUD) işlemleri.
-   **Sipariş ve Sepet Sistemi:** Kullanıcıların sepet oluşturması ve sipariş verebilmesi.
-   **Kullanıcı Rolleri:** `Admin` ve `Müşteri` gibi farklı yetkilere sahip kullanıcı rolleri.
-   **Sayfalama (Pagination):** Çok sayıda ürünü verimli bir şekilde listelemek.
-   **Testler:** Unit ve entegrasyon testleri ile kod kalitesini ve güvenirliğini artırmak.
-   **Gelişmiş Hata Yönetimi:** Merkezi bir hata yönetim mekanizması kurmak.

## ✨ Temel Özellikler

-   **RESTful API Tasarımı:** Ürünler ve kullanıcılar için standart HTTP metotları (GET, POST, vb.) ile yönetilen endpoint'ler.
-   **Kullanıcı Yönetimi:** Güvenli şifre saklama (hashing) ile kullanıcı kaydı.
-   **Kimlik Doğrulama:** Kullanıcı girişi sonrası JSON Web Token (JWT) tabanlı yetkilendirme.
-   **Korunmuş Rotalar (Protected Routes):** Belirli API endpoint'lerine sadece geçerli bir token'a sahip kullanıcıların erişebilmesi.
-   **MongoDB Entegrasyonu:** Mongoose ODM kullanılarak yapılandırılmış veri modellemesi ve veritabanı işlemleri.
-   **Yapılandırma Yönetimi:** Hassas bilgilerin `.env` dosyası üzerinden yönetilmesi.

## 🛠️ Kullanılan Teknolojiler

-   **Backend:** Node.js
-   **Framework:** Express.js
-   **Veritabanı:** MongoDB
-   **ODM (Object Data Modeling):** Mongoose
-   **Kimlik Doğrulama:** JSON Web Token (jsonwebtoken), bcryptjs
-   **Ortam Değişkenleri:** dotenv

## 🚀 Kurulum ve Başlatma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

### 1. Projeyi Klonlayın

```bash
git clone <proje-github-linki>
cd NodeCommerce
```

### 2. Gerekli Paketleri Yükleyin

Projenin bağımlılıklarını `npm` kullanarak yükleyin.

```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarlayın

Projenin ana dizininde `.env` adında bir dosya oluşturun. Bu dosya, veritabanı bağlantı adresi ve diğer hassas bilgileri içerecektir.

```
MONGO_URI=<mongodb-baglanti-adresiniz>
PORT=5000
JWT_SECRET=<gizli-bir-anahtar-kelime>
```

-   `MONGO_URI`: MongoDB veritabanınızın bağlantı adresidir. (Örn: `mongodb://localhost:27017/nodecommerce`)
-   `PORT`: Sunucunun çalışacağı port numarası.
-   `JWT_SECRET`: Token oluşturmak için kullanılacak gizli anahtar.

### 4. Sunucuyu Başlatın

Geliştirme ortamı için `nodemon` kullanarak sunucuyu başlatabilirsiniz. Bu sayede dosyalarda yaptığınız her değişiklikte sunucu otomatik olarak yeniden başlar.

```bash
npm run dev
```

Alternatif olarak, production modunda başlatmak için:

```bash
npm run start
```

Sunucu başarıyla başladığında terminalde `Sunucu 5000 portunda başarıyla çalışıyor.` mesajını göreceksiniz.

## 📖 API Endpoint'leri

API'ye `http://localhost:5000` adresi üzerinden erişilebilir.

### Kullanıcı Rotaları (`/api/users`)

| Metot | Endpoint         | Açıklama                                   | Erişim |
| :---- | :--------------- | :----------------------------------------- | :------ |
| `POST`  | `/`              | Yeni bir kullanıcı kaydı oluşturur.          | Herkese Açık |
| `POST`  | `/login`         | Kullanıcı girişi yapar ve JWT döndürür.    | Herkese Açık |

**Örnek `POST /api/users` Body:**
```json
{
    "name": "Mehmet Yanıkoğlu",
    "email": "mehmet@example.com",
    "password": "password123"
}
```

### Ürün Rotaları (`/api/products`)

| Metot | Endpoint | Açıklama                               | Erişim     |
| :---- | :------- | :------------------------------------- | :--------- |
| `GET`   | `/`      | Tüm ürünleri listeler.                 | **Korumalı** |
| `GET`   | `/:id`   | Belirtilen ID'ye sahip ürünü getirir.  | Herkese Açık |

> **Not:** `/api/products` rotasına erişmek için, kullanıcı girişi sonrası alınan token'ı isteğin `Authorization` başlığına `Bearer <token>` formatında eklemeniz gerekmektedir.

## 📂 Proje Yapısı

```
NodeCommerce/
├── config/
│   └── database.js         # Singleton veritabanı bağlantı mantığı
├── controllers/
│   ├── productController.js  # Ürünlerle ilgili iş mantığı
│   └── userController.js     # Kullanıcılarla ilgili iş mantığı
├── middleware/
│   └── authMiddleware.js     # JWT doğrulama ve rota koruma
├── models/
│   ├── Product.js            # Product Mongoose şeması ve modeli
│   └── User.js               # User Mongoose şeması ve modeli
├── routes/
│   ├── productRoutes.js      # Ürün API rotaları
│   └── userRoutes.js         # Kullanıcı API rotaları
├── .env                      # Ortam değişkenleri (Git'e eklenmemeli)
├── .gitignore                # Git tarafından izlenmeyecek dosyalar
├── package.json
├── README.md
└── server.js                 # Ana sunucu giriş noktası
```

 