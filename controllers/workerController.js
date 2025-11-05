const Worker = require('../models/Worker.js');

// --- TÜM İŞÇİLERİ GETIR (Admin için) ---
const getAllWorkers = async (req, res) => {
    try {
        // Kullanıcı admin mi kontrol et
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: 'Bu işlem için admin yetkisi gereklidir.' });
        }

        // Tüm işçileri getir ve user bilgilerini de dahil et
        const workers = await Worker.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(workers);
    } catch (error) {
        console.error('Hata:', error);
        res.status(500).json({ message: 'İşçiler getirilirken bir hata oluştu.' });
    }
};

// --- TEK BİR İŞÇİYİ GETIR ---
const getWorkerById = async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id).populate('user', 'name email');

        if (!worker) {
            return res.status(404).json({ message: 'İşçi bulunamadı.' });
        }

        // Kullanıcı kendi kaydına veya admin ise erişebilir
        if (!req.user || (!req.user.isAdmin && worker.user._id.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Bu bilgilere erişim yetkiniz yok.' });
        }

        res.status(200).json(worker);
    } catch (error) {
        console.error('Hata:', error);
        res.status(500).json({ message: 'İşçi getirilirken bir hata oluştu.' });
    }
};

// --- KULLANICININ KENDİ KAYDINI GETIR ---
const getMyWorkerProfile = async (req, res) => {
    try {
        const worker = await Worker.findOne({ user: req.user._id }).populate('user', 'name email');

        if (!worker) {
            return res.status(404).json({ message: 'İşçi kaydınız bulunamadı.' });
        }

        res.status(200).json(worker);
    } catch (error) {
        console.error('Hata:', error);
        res.status(500).json({ message: 'Profil getirilirken bir hata oluştu.' });
    }
};

// --- YENİ İŞÇİ KAYDI OLUŞTUR ---
const createWorker = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            birthDate,
            phone,
            address,
            profession,
            jobType,
            experienceYears,
            education,
            skills,
            about,
            expectedSalary,
        } = req.body;

        // Bu kullanıcıya ait işçi kaydı zaten var mı kontrol et
        const existingWorker = await Worker.findOne({ user: req.user._id });
        if (existingWorker) {
            return res.status(400).json({ message: 'Zaten bir işçi kaydınız bulunmaktadır.' });
        }

        // Yeni işçi kaydı oluştur
        const worker = await Worker.create({
            user: req.user._id,
            firstName,
            lastName,
            birthDate,
            phone,
            address,
            profession,
            jobType,
            experienceYears,
            education,
            skills: Array.isArray(skills) ? skills : skills?.split(',').map(s => s.trim()),
            about,
            expectedSalary,
        });

        res.status(201).json(worker);
    } catch (error) {
        console.error('Hata:', error);
        res.status(500).json({ message: 'İşçi kaydı oluşturulurken bir hata oluştu.' });
    }
};

// --- İŞÇİ KAYDINI GÜNCELLE ---
const updateWorker = async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id);

        if (!worker) {
            return res.status(404).json({ message: 'İşçi bulunamadı.' });
        }

        // Kullanıcı kendi kaydını veya admin tüm kayıtları güncelleyebilir
        if (!req.user || (!req.user.isAdmin && worker.user.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok.' });
        }

        const {
            firstName,
            lastName,
            birthDate,
            phone,
            address,
            profession,
            jobType,
            experienceYears,
            education,
            skills,
            about,
            expectedSalary,
            isActive,
            isApproved,
        } = req.body;

        // Güncelleme verileri
        const updateData = {
            firstName,
            lastName,
            birthDate,
            phone,
            address,
            profession,
            jobType,
            experienceYears,
            education,
            skills: Array.isArray(skills) ? skills : skills?.split(',').map(s => s.trim()),
            about,
            expectedSalary,
            isActive,
        };

        // Sadece admin isApproved değiştirebilir
        if (req.user.isAdmin && isApproved !== undefined) {
            updateData.isApproved = isApproved;
        }

        const updatedWorker = await Worker.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('user', 'name email');

        res.status(200).json(updatedWorker);
    } catch (error) {
        console.error('Hata:', error);
        res.status(500).json({ message: 'İşçi güncellenirken bir hata oluştu.' });
    }
};

// --- İŞÇİ KAYDINI SİL ---
const deleteWorker = async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id);

        if (!worker) {
            return res.status(404).json({ message: 'İşçi bulunamadı.' });
        }

        // Sadece admin silebilir veya kullanıcı kendi kaydını silebilir
        if (!req.user || (!req.user.isAdmin && worker.user.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok.' });
        }

        await Worker.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'İşçi kaydı başarıyla silindi.' });
    } catch (error) {
        console.error('Hata:', error);
        res.status(500).json({ message: 'İşçi silinirken bir hata oluştu.' });
    }
};

module.exports = {
    getAllWorkers,
    getWorkerById,
    getMyWorkerProfile,
    createWorker,
    updateWorker,
    deleteWorker,
};
