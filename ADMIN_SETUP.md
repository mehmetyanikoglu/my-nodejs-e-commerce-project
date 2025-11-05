# 👨‍💼 Admin Yönetici Kurulum Rehberi

## 🔐 Yönetici (Admin) Nasıl Oluşturulur?

Bu sistemde **iki tür kullanıcı** vardır:

### 1️⃣ Çalışan (Normal Kullanıcı)
- Kayıt formundan (`/auth/register`) kayıt olabilir
- Kendi profil bilgilerini doldurabilir ve görüntüleyebilir
- Sadece kendi bilgilerine erişebilir
- **Otomatik olarak `isAdmin: false` ile oluşturulur**

### 2️⃣ Yönetici (Admin)
- Kayıt formundan **KAYIT OLAMAZ** ❌
- Sadece **manuel olarak veritabanına eklenen** kullanıcılar admin olabilir
- Tüm çalışanların bilgilerini görüntüleyebilir, düzenleyebilir ve silebilir
- Admin paneline (`/admin/dashboard`) erişim hakkı vardır

---

## 🛠️ Yönetici Oluşturma Adımları

### Yöntem 1: Mevcut Kullanıcıyı Admin Yapmak

Eğer sistemde zaten kayıtlı bir kullanıcı varsa ve onu admin yapmak istiyorsanız:

```bash
# MongoDB shell'e bağlanın
mongosh

# Veritabanınızı seçin
use nodejs_commerce

# Kullanıcıyı email ile bulup admin yapın
db.users.updateOne(
  { email: "ornek@email.com" },
  { $set: { isAdmin: true } }
)
```

### Yöntem 2: Yeni Admin Kullanıcısı Oluşturmak

MongoDB Compass veya mongosh kullanarak:

```javascript
// 1. Önce normal kullanıcı kaydı yapın (web sitesinden /auth/register)
// 2. Ardından o kullanıcıyı admin yapın:

db.users.updateOne(
  { email: "admin@sirket.com" },
  { $set: { isAdmin: true } }
)
```

### Yöntem 3: Doğrudan MongoDB'ye Admin Eklemek

⚠️ **ÖNEMLİ:** Şifre bcrypt ile hash'lenmiş olmalı!

```javascript
// Örnek hash'lenmiş şifre: "admin123" 
// (Gerçek sistemde güçlü şifre kullanın!)

db.users.insertOne({
  name: "Sistem Yöneticisi",
  email: "admin@sirket.com",
  password: "$2a$10$5Zq8X.YvT3QZJKcKWVxJTOxYzQqP8vF9KjLhXzDp5yJzHwNzYXdGm",
  isAdmin: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## 📋 Kullanıcı Rolleri ve Yetkiler

| Özellik | Çalışan (isAdmin: false) | Yönetici (isAdmin: true) |
|---------|-------------------------|-------------------------|
| Kayıt Olma | ✅ Web üzerinden | ❌ Sadece manuel DB |
| Giriş Yapma | ✅ `/auth/login` | ✅ `/auth/login` |
| Kendi Profili | ✅ Görüntüleme + Düzenleme | ✅ Görüntüleme + Düzenleme |
| Diğer Profiller | ❌ Erişemez | ✅ Tümünü görebilir |
| İşçi Düzenleme | ❌ Sadece kendisini | ✅ Herkesi düzenleyebilir |
| İşçi Silme | ❌ Erişemez | ✅ Silebilir |
| Admin Paneli | ❌ 403 Hata | ✅ Tam erişim |
| Onaylama Yetkisi | ❌ Yoktur | ✅ `isApproved` değiştirebilir |

---

## 🌐 Rota Yapısı

### Genel Erişim (Oturum Açmadan)
- `GET /auth/register` - Kayıt formu
- `GET /auth/login` - Giriş formu
- `POST /auth/register` - Kayıt işlemi
- `POST /auth/login` - Giriş işlemi

### Çalışan Rotaları (Oturum Gerekli)
- `GET /workers` - Ana sayfa (role göre yönlendirir)
- `GET /workers/profile` - Kendi profilini görüntüle
- `GET /workers/new` - İşçi bilgileri formu
- `POST /workers/new` - İşçi bilgilerini kaydet
- `GET /workers/edit` - Kendi profilini düzenle
- `POST /workers/update` - Kendi profilini güncelle

### Admin Rotaları (Sadece isAdmin: true)
- `GET /admin/dashboard` - Tüm işçileri listele
- `GET /admin/workers/edit/:id` - Herhangi bir işçiyi düzenle
- `POST /admin/workers/update/:id` - İşçi bilgilerini güncelle
- `POST /admin/workers/delete/:id` - İşçiyi sil

---

## 🔒 Güvenlik Kontrolleri

### 1. `protect` Middleware
- JWT token kontrolü yapar
- Token yoksa veya geçersizse `/auth/login` sayfasına yönlendirir
- Token geçerliyse `req.user` nesnesine kullanıcı bilgilerini ekler

### 2. `requireAdmin` Middleware
- `req.user.isAdmin` kontrolü yapar
- Admin değilse **403 Forbidden** hatası döner
- Sadece admin rotalarında kullanılır

```javascript
// Örnek middleware kullanımı:
router.get('/admin/dashboard', getUserFromToken, requireAdmin, async (req, res) => {
  // Buraya sadece admin kullanıcılar erişebilir
});
```

---

## 🚀 Giriş Yapma Akışı

### Çalışan Girişi:
1. `/auth/login` sayfasından giriş yapar
2. Sistem `isAdmin` değerini kontrol eder
3. `isAdmin: false` ise → `/workers/profile` sayfasına yönlendirilir
4. Eğer Worker kaydı yoksa → `/workers/new` formuna yönlendirilir

### Yönetici Girişi:
1. `/auth/login` sayfasından giriş yapar
2. Sistem `isAdmin` değerini kontrol eder
3. `isAdmin: true` ise → `/admin/dashboard` sayfasına yönlendirilir
4. Tüm çalışanların listesini görür

---

## ✅ Admin Kontrolü Nasıl Yapılır?

### MongoDB Shell'de:
```javascript
// Tüm adminleri listele
db.users.find({ isAdmin: true })

// Belirli bir kullanıcının admin olup olmadığını kontrol et
db.users.findOne({ email: "admin@sirket.com" })
```

### Web Arayüzünde:
1. Admin hesabıyla giriş yapın
2. Üst menüde **"Admin Paneli"** butonu görünüyorsa admin'siniz ✅
3. `/admin/dashboard` adresine gitmeyi deneyin
4. Eğer erişebildiyseniz admin yetkileriniz aktif 🎉

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Admin Kayıt Formu YOKTUR** - Bu güvenlik önlemidir
2. **İlk admin manuel oluşturulmalıdır** - Sistem başlatıldıktan sonra DB'ye eklenir
3. **Admin şifresi güçlü olmalıdır** - Minimum 8 karakter, büyük/küçük harf, rakam
4. **Admin sayısı sınırlı tutulmalıdır** - Sadece güvenilir kişiler admin olmalı
5. **Admin logları takip edilmelidir** - Silme ve düzenleme işlemleri kayıt altına alınmalı

---

## 📧 İletişim ve Destek

Admin oluşturma ile ilgili sorun yaşarsanız:
- MongoDB bağlantınızı kontrol edin
- `isAdmin` alanının boolean (true/false) olduğundan emin olun
- JWT token'ının geçerli olduğundan emin olun
- Tarayıcı çerezlerini temizleyip tekrar giriş yapın

---

## 🔄 Versiyon Bilgisi

- **Sistem:** İş Arayan Platformu v2.0
- **Güncelleme:** Admin/Çalışan ayrımı eklendi
- **Son Değişiklik:** Admin rotaları `/admin` altına taşındı
