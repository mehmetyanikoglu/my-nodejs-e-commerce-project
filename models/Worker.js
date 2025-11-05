// Mongoose kütüphanesini içeri aktar
const mongoose = require('mongoose');

// İşçi (Worker) şeması
const workerSchema = new mongoose.Schema(
    {
        // Kullanıcı referansı - her işçi bir kullanıcıya ait
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Ad
        firstName: {
            type: String,
            required: [true, 'Ad zorunludur'],
            trim: true,
        },
        // Soyad
        lastName: {
            type: String,
            required: [true, 'Soyad zorunludur'],
            trim: true,
        },
        // Doğum Tarihi
        birthDate: {
            type: Date,
            required: [true, 'Doğum tarihi zorunludur'],
        },
        // Telefon
        phone: {
            type: String,
            required: [true, 'Telefon numarası zorunludur'],
            trim: true,
        },
        // Adres
        address: {
            type: String,
            required: [true, 'Adres zorunludur'],
            trim: true,
        },
        // Meslek/Uzmanlık Alanı
        profession: {
            type: String,
            required: [true, 'Meslek bilgisi zorunludur'],
            trim: true,
        },
        // Aradığı İş Türü
        jobType: {
            type: String,
            required: [true, 'İş türü zorunludur'],
            enum: ['Tam Zamanlı', 'Yarı Zamanlı', 'Serbest', 'Staj', 'Geçici'],
            default: 'Tam Zamanlı',
        },
        // Deneyim Yılı
        experienceYears: {
            type: Number,
            required: [true, 'Deneyim yılı zorunludur'],
            min: 0,
            default: 0,
        },
        // Eğitim Durumu
        education: {
            type: String,
            required: [true, 'Eğitim durumu zorunludur'],
            enum: ['İlkokul', 'Ortaokul', 'Lise', 'Üniversite', 'Yüksek Lisans', 'Doktora'],
        },
        // Yetenekler/Beceriler
        skills: {
            type: [String],
            default: [],
        },
        // Hakkında/Özgeçmiş Özeti
        about: {
            type: String,
            maxlength: 1000,
            trim: true,
        },
        // Beklenen Maaş (TL)
        expectedSalary: {
            type: Number,
            min: 0,
        },
        // CV Dosya Yolu (ileride dosya yükleme için)
        cvFile: {
            type: String,
        },
        // Aktif mi? (İş aramaya devam ediyor mu?)
        isActive: {
            type: Boolean,
            default: true,
        },
        // Admin onayı durumu
        isApproved: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // createdAt ve updatedAt otomatik ekler
    }
);

// Virtual field: Tam ad
workerSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual field: Yaş hesaplama
workerSchema.virtual('age').get(function () {
    if (!this.birthDate) return null;
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

// JSON'a çevirirken virtual fieldları dahil et
workerSchema.set('toJSON', { virtuals: true });
workerSchema.set('toObject', { virtuals: true });

const Worker = mongoose.model('Worker', workerSchema);

module.exports = Worker;
