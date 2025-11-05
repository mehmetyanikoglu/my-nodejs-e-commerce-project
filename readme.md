# 💼 İş Arayan Platformu - Worker Management System

Bu proje, Node.js, Express ve MongoDB kullanılarak geliştirilmiş bir **iş arayan/çalışan yönetim platformudur**. Proje, modern backend geliştirme pratiklerini öğrenmek ve uygulamak amacıyla e-ticaret sisteminden dönüştürülmüştür. Kullanıcı kaydı, JWT ile kimlik doğrulama, rol bazlı yetkilendirme ve çalışan profil yönetimi gibi özellikleri içerir.

## 🎯 Projenin Amacı ve Geliştirme Süreci

Bu proje, backend geliştirme yeteneklerimi sergilemek ve Node.js ekosistemindeki en iyi pratikleri (best practices) uygulayarak kendimi geliştirmek amacıyla başlattığım bir öğrenme yolculuğudur. Sistem başlangıçta e-ticaret platformu olarak tasarlanmış, daha sonra **iş arayan/çalışan yönetim platformuna** dönüştürülmüştür.

Temel hedefim, production (canlı ortam) seviyesinde bir uygulamanın temel bileşenlerini sıfırdan inşa ederek sağlam bir temel oluşturmaktır.

### ✅ Mevcut Özellikler

-   **Çalışan Kayıt Sistemi:** Kullanıcılar kendilerini kayıt edip çalışan profili oluşturabilir.
-   **Rol Bazlı Yetkilendirme:** `Admin` ve `Çalışan` olmak üzere iki kullanıcı rolü.
-   **Admin Paneli:** Yöneticiler tüm çalışanları görüntüleyebilir, düzenleyebilir ve silebilir.
-   **Çalışan Paneli:** Kullanıcılar kendi profillerini görüntüleyip düzenleyebilir.
-   **JWT Authentication:** Cookie-based ve Bearer token destekli kimlik doğrulama.
-   **Güvenli Admin Oluşturma:** Admin kullanıcılar sadece manuel veritabanı işlemiyle oluşturulabilir.

### 🚧 Gelecekte Eklenecek Özellikler

-   **Arama ve Filtreleme:** Mesleklerine, deneyimlerine göre çalışan arama.
-   **Sayfalama (Pagination):** Çok sayıda çalışanı verimli bir şekilde listelemek.
-   **Dosya Yükleme:** Profil fotoğrafı ve CV yükleme özelliği.
-   **Email Bildirimleri:** Kayıt onayı ve sistem bildirimleri için email entegrasyonu.
-   **Testler:** Unit ve entegrasyon testleri ile kod kalitesini ve güvenirliğini artırmak.
-   **Dashboard İstatistikleri:** Admin için detaylı analitik ve raporlama.

## ✨ Temel Özellikler

-   **RESTful API & View Routes:** Hem API endpoint'leri hem de EJS ile render edilen view sayfaları.
-   **İki Katmanlı Kullanıcı Sistemi:** 
    - **Çalışan:** Web'den kayıt olabilir, kendi profilini yönetir
    - **Admin:** Manuel DB ekleme ile oluşturulur, tüm çalışanları yönetir
-   **Güvenli Kimlik Doğrulama:** 
    - Bcrypt ile şifre hashleme
    - JWT token tabanlı oturum yönetimi
    - Cookie-based authentication (httpOnly, secure)
-   **Rol Bazlı Yetkilendirme:** Admin ve çalışan rolleri için ayrı middleware'ler.
-   **Kapsamlı Çalışan Profili:** 
    - Kişisel bilgiler (ad, soyad, doğum tarihi, telefon, adres)
    - Kariyer bilgileri (meslek, deneyim, eğitim, yetenekler)
    - İş tercihleri (tam/yarı zamanlı, beklenen maaş)
-   **MongoDB Entegrasyonu:** Mongoose ODM ile ilişkisel veri modellemesi.
-   **EJS Template Engine:** Dinamik HTML sayfa render işlemleri.

## 🛠️ Kullanılan Teknolojiler

-   **Backend Runtime:** Node.js
-   **Web Framework:** Express.js 5.1.0
-   **Veritabanı:** MongoDB (Cloud - MongoDB Atlas)
-   **ODM (Object Data Modeling):** Mongoose 8.18.1
-   **Template Engine:** EJS 3.1.10
-   **Kimlik Doğrulama:** 
    - jsonwebtoken 9.0.2 (JWT)
    - bcryptjs 3.0.2 (Password hashing)
    - cookie-parser 1.4.6 (Session management)
-   **Yapılandırma:** dotenv 17.2.2
-   **Development Tool:** nodemon 3.1.9

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

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nodejs_commerce
PORT=5001
JWT_SECRET=<gizli-bir-anahtar-kelime-en-az-32-karakter>
NODE_ENV=development
```

-   `MONGO_URI`: MongoDB Atlas veya local MongoDB bağlantı adresi.
-   `PORT`: Sunucunun çalışacağı port numarası (default: 5001).
-   `JWT_SECRET`: Token oluşturmak için kullanılacak gizli anahtar (minimum 32 karakter önerilir).
-   `NODE_ENV`: Ortam türü (`development` veya `production`).

### 4. Sunucuyu Başlatın

Geliştirme ortamı için `nodemon` kullanarak sunucuyu başlatabilirsiniz. Bu sayede dosyalarda yaptığınız her değişiklikte sunucu otomatik olarak yeniden başlar.

```bash
npm run dev
```

Alternatif olarak, production modunda başlatmak için:

```bash
npm run start
```

Sunucu başarıyla başladığında terminalde `Sunucu 5001 portunda başarıyla çalışıyor.` mesajını göreceksiniz.

## 👨‍💼 Admin Kullanıcısı Oluşturma

⚠️ **ÖNEMLİ:** Admin kullanıcılar web arayüzünden kayıt olamaz. Güvenlik nedeniyle sadece manuel olarak veritabanına eklenebilir.

### Yöntem 1: Mevcut Kullanıcıyı Admin Yapmak

```bash
# MongoDB shell'e bağlanın
mongosh

# Veritabanınızı seçin
use nodejs_commerce

# Kullanıcıyı admin yapın
db.users.updateOne(
  { email: "kullanici@email.com" },
  { $set: { isAdmin: true } }
)
```

### Yöntem 2: Yeni Admin Oluşturmak

1. Web sitesinden normal kayıt yapın (`/auth/register`)
2. MongoDB'de o kullanıcının `isAdmin` alanını `true` yapın
3. Çıkış yapıp tekrar giriş yapın

Detaylı admin kurulum rehberi için: **[ADMIN_SETUP.md](./ADMIN_SETUP.md)** dosyasına bakın.

## 🎮 Kullanım Senaryoları

### 📋 Çalışan Kullanımı

1. **Kayıt Olma:** `http://localhost:5001/auth/register` adresinden kayıt olun
2. **Profil Doldurma:** Otomatik olarak `/workers/new` sayfasına yönlendirileceksiniz
3. **Bilgileri Girin:** Kişisel bilgiler, kariyer bilgileri, yetenekler vb.
4. **Profili Görüntüleme:** Kayıt sonrası `/workers/profile` adresinde kendi profilinizi görebilirsiniz
5. **Düzenleme:** İstediğiniz zaman `/workers/edit` sayfasından bilgilerinizi güncelleyebilirsiniz

### 👨‍💼 Admin Kullanımı

1. **Giriş Yapma:** Admin hesabıyla `http://localhost:5001/auth/login` adresinden giriş yapın
2. **Dashboard:** Otomatik olarak `/admin/dashboard` sayfasına yönlendirileceksiniz
3. **Çalışanları Görme:** Tüm kayıtlı çalışanları tablo şeklinde görebilirsiniz
4. **İstatistikler:** Toplam, aktif, onaylı ve onay bekleyen çalışan sayılarını görün
5. **Düzenleme:** İstediğiniz çalışanı düzenleyip `isApproved` durumunu değiştirebilirsiniz
6. **Silme:** Gerekirse çalışan kaydını tamamen silebilirsiniz

## 🔒 Güvenlik Özellikleri

- ✅ **Bcrypt Password Hashing:** Şifreler veritabanında hashlenmiş olarak saklanır
- ✅ **JWT Token Authentication:** 30 günlük geçerlilik süresi
- ✅ **HttpOnly Cookies:** XSS saldırılarına karşı korumalı
- ✅ **Secure Cookies:** Production'da HTTPS zorunluluğu
- ✅ **Role-Based Access Control (RBAC):** Admin ve çalışan rolleri
- ✅ **Protected Routes:** Yetkisiz erişim engellenmesi
- ✅ **Manual Admin Creation:** Admin kullanıcılar sadece DB'den oluşturulabilir

## 📊 Veri Modelleri

### User Model
```javascript
{
  name: String,          // Ad Soyad
  email: String,         // E-posta (unique)
  password: String,      // Hash'lenmiş şifre
  isAdmin: Boolean,      // Admin yetkisi (default: false)
  createdAt: Date,
  updatedAt: Date
}
```

### Worker Model
```javascript
{
  user: ObjectId,             // User referansı
  firstName: String,
  lastName: String,
  birthDate: Date,
  phone: String,
  address: String,
  profession: String,         // Meslek
  jobType: String,           // Tam Zamanlı, Yarı Zamanlı, vb.
  experienceYears: Number,
  education: String,         // Eğitim durumu
  skills: [String],          // Yetenekler array
  about: String,             // Hakkımda
  expectedSalary: Number,
  isActive: Boolean,         // İş aramaya devam ediyor mu?
  isApproved: Boolean,       // Admin onayı
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Test Etme

### Manuel Test

1. Postman veya Thunder Client kullanarak API endpoint'lerini test edebilirsiniz
2. Tarayıcıdan view rotalarını test edebilirsiniz

### Örnek API İsteği (Bearer Token)

```bash
# Tüm çalışanları getir (Admin gerekli)
curl -X GET http://localhost:5001/api/workers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Kendi bilgilerini getir
curl -X GET http://localhost:5001/api/workers/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📚 Kaynaklar ve Öğrenme Materyalleri

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [EJS Template Engine](https://ejs.co/)
- [MongoDB University](https://university.mongodb.com/)

## 📝 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

## 👨‍💻 Geliştirici

**Mehmet Yanıkoğlu**
- GitHub: [@mehmetyanikoglu](https://github.com/mehmetyanikoglu)

## 📖 Rotalar ve Endpoint'ler

Uygulamaya `http://localhost:5001` adresi üzerinden erişilebilir.

### 🔐 Authentication Routes (`/auth/*`)

| Metot | Endpoint | Açıklama | Yönlendirme |
|-------|----------|----------|-------------|
| `GET` | `/auth/register` | Kayıt formu sayfası | - |
| `POST` | `/auth/register` | Yeni çalışan kaydı oluştur | `/workers/new` |
| `GET` | `/auth/login` | Giriş formu sayfası | - |
| `POST` | `/auth/login` | Kullanıcı girişi | Admin → `/admin/dashboard`<br>User → `/workers/profile` |
| `GET` | `/auth/logout` | Çıkış yap | `/auth/login` |

### 👤 Worker View Routes (`/workers/*`) - Çalışan Paneli

| Metot | Endpoint | Middleware | Açıklama |
|-------|----------|-----------|----------|
| `GET` | `/workers` | - | Ana sayfa (rol bazlı yönlendirme) |
| `GET` | `/workers/new` | `requireAuth` | Çalışan bilgileri formu |
| `POST` | `/workers/new` | `requireAuth` | Çalışan kaydı oluştur |
| `GET` | `/workers/profile` | `requireAuth` | Kendi profilini görüntüle |
| `GET` | `/workers/edit` | `requireAuth` | Kendi profilini düzenle |
| `POST` | `/workers/:id/update` | `requireAuth` | Kendi profilini güncelle |

### 👨‍💼 Admin Routes (`/admin/*`) - Yönetici Paneli

| Metot | Endpoint | Middleware | Açıklama |
|-------|----------|-----------|----------|
| `GET` | `/admin/dashboard` | `requireAdmin` | Tüm çalışanları listele |
| `GET` | `/admin/workers/edit/:id` | `requireAdmin` | Çalışan düzenleme formu |
| `POST` | `/admin/workers/update/:id` | `requireAdmin` | Çalışan bilgilerini güncelle |
| `POST` | `/admin/workers/delete/:id` | `requireAdmin` | Çalışanı sil |

### 🔌 Worker API Routes (`/api/workers/*`)

| Metot | Endpoint | Middleware | Açıklama |
|-------|----------|-----------|----------|
| `GET` | `/api/workers` | `protect` + `admin` | Tüm çalışanları getir (API) |
| `GET` | `/api/workers/me` | `protect` | Kendi kaydını getir |
| `GET` | `/api/workers/:id` | `protect` | ID'ye göre çalışan getir |
| `POST` | `/api/workers` | `protect` | Yeni çalışan kaydı (API) |
| `PUT` | `/api/workers/:id` | `protect` | Çalışan güncelle (API) |
| `DELETE` | `/api/workers/:id` | `protect` | Çalışan sil (API) |

> **Not:** API rotalarına erişmek için `Authorization: Bearer <token>` header'ı gereklidir.
> View rotaları cookie-based authentication kullanır.

## 📂 Proje Yapısı

```
NodeCommerce/
├── config/
│   └── database.js              # Singleton veritabanı bağlantı mantığı
├── controllers/
│   ├── workerController.js      # Çalışan CRUD işlemleri ve iş mantığı
│   └── userController.js        # Kullanıcı kayıt ve giriş mantığı
├── middleware/
│   └── authMiddleware.js        # JWT doğrulama ve rota koruma (API için)
├── models/
│   ├── Worker.js                # Worker Mongoose şeması (15+ alan)
│   └── User.js                  # User Mongoose şeması (isAdmin field)
├── routes/
│   ├── workerRoutes.js          # Çalışan API rotaları (/api/workers)
│   ├── workerViewRoutes.js      # Çalışan view rotaları (/workers)
│   ├── adminRoutes.js           # Admin view rotaları (/admin)
│   ├── authRoutes.js            # Kimlik doğrulama rotaları (/auth)
│   └── userRoutes.js            # Kullanıcı API rotaları (/api/users)
├── views/
│   ├── login.ejs                # Giriş sayfası
│   ├── register.ejs             # Kayıt sayfası
│   ├── worker-form.ejs          # Çalışan bilgileri formu
│   ├── user-profile.ejs         # Çalışan profil görünümü
│   ├── admin-dashboard.ejs      # Admin paneli (tüm çalışanlar)
│   └── admin-worker-edit.ejs    # Admin çalışan düzenleme
├── .env                         # Ortam değişkenleri (Git'e eklenmez)
├── .gitignore
├── package.json
├── ADMIN_SETUP.md               # Admin oluşturma rehberi
├── KONTROL_RAPORU.md            # Sistem kontrol raporu
├── README.md
└── server.js                    # Ana sunucu giriş noktası
```

 