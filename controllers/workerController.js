import Worker from '../models/Worker.js';

// Response Helper - Standardized API Responses
class ApiResponse {
  static success(res, data, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
    });
  }

  static error(res, message, statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  static notFound(res, message = 'Kayıt bulunamadı.') {
    return this.error(res, message, 404);
  }

  static forbidden(res, message = 'Bu işlem için yetkiniz yok.') {
    return this.error(res, message, 403);
  }

  static badRequest(res, message = 'Geçersiz istek.') {
    return this.error(res, message, 400);
  }
}

// Service Layer - Business Logic
class WorkerService {
  static async getAllWorkers() {
    return Worker.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
  }

  static async getWorkerById(workerId) {
    return Worker.findById(workerId).populate('user', 'name email');
  }

  static async getWorkerByUserId(userId) {
    return Worker.findOne({ user: userId }).populate('user', 'name email');
  }

  static async createWorker(userId, workerData) {
    const processedSkills = Array.isArray(workerData.skills)
      ? workerData.skills
      : workerData.skills?.split(',').map(s => s.trim());

    return Worker.create({
      user: userId,
      ...workerData,
      skills: processedSkills,
    });
  }

  static async updateWorker(workerId, updateData, isAdmin = false) {
    const processedSkills = Array.isArray(updateData.skills)
      ? updateData.skills
      : updateData.skills?.split(',').map(s => s.trim());

    const dataToUpdate = {
      ...updateData,
      skills: processedSkills,
    };

    // Only admin can update isApproved
    if (!isAdmin) {
      delete dataToUpdate.isApproved;
    }

    return Worker.findByIdAndUpdate(workerId, dataToUpdate, {
      new: true,
      runValidators: true,
    }).populate('user', 'name email');
  }

  static async deleteWorker(workerId) {
    return Worker.findByIdAndDelete(workerId);
  }

  static async checkWorkerExists(userId) {
    return Worker.findOne({ user: userId });
  }
}

// Authorization Helper
class AuthHelper {
  static isOwnerOrAdmin(user, ownerId) {
    return user.isAdmin || user._id.toString() === ownerId.toString();
  }

  static requireAdmin(user) {
    return user && user.isAdmin;
  }
}

// Controller - Request/Response Handlers
const getAllWorkers = async (req, res) => {
  try {
    if (!AuthHelper.requireAdmin(req.user)) {
      return ApiResponse.forbidden(res, 'Bu işlem için admin yetkisi gereklidir.');
    }

    const workers = await WorkerService.getAllWorkers();
    return ApiResponse.success(res, workers);
  } catch (error) {
    console.error('Get all workers error:', error);
    return ApiResponse.error(res, 'İşçiler getirilirken bir hata oluştu.');
  }
};

const getWorkerById = async (req, res) => {
  try {
    const worker = await WorkerService.getWorkerById(req.params.id);

    if (!worker) {
      return ApiResponse.notFound(res, 'İşçi bulunamadı.');
    }

    // Authorization check
    if (!AuthHelper.isOwnerOrAdmin(req.user, worker.user._id)) {
      return ApiResponse.forbidden(res, 'Bu bilgilere erişim yetkiniz yok.');
    }

    return ApiResponse.success(res, worker);
  } catch (error) {
    console.error('Get worker by ID error:', error);
    return ApiResponse.error(res, 'İşçi getirilirken bir hata oluştu.');
  }
};

const getMyWorkerProfile = async (req, res) => {
  try {
    const worker = await WorkerService.getWorkerByUserId(req.user._id);

    if (!worker) {
      return ApiResponse.notFound(res, 'İşçi kaydınız bulunamadı.');
    }

    return ApiResponse.success(res, worker);
  } catch (error) {
    console.error('Get my profile error:', error);
    return ApiResponse.error(res, 'Profil getirilirken bir hata oluştu.');
  }
};

const createWorker = async (req, res) => {
  try {
    // Check if worker already exists
    const existingWorker = await WorkerService.checkWorkerExists(req.user._id);
    if (existingWorker) {
      return ApiResponse.badRequest(res, 'Zaten bir işçi kaydınız bulunmaktadır.');
    }

    // Create new worker
    const worker = await WorkerService.createWorker(req.user._id, req.body);

    return ApiResponse.success(res, worker, 201);
  } catch (error) {
    console.error('Create worker error:', error);
    return ApiResponse.error(res, 'İşçi kaydı oluşturulurken bir hata oluştu.');
  }
};

const updateWorker = async (req, res) => {
  try {
    const worker = await WorkerService.getWorkerById(req.params.id);

    if (!worker) {
      return ApiResponse.notFound(res, 'İşçi bulunamadı.');
    }

    // Authorization check
    if (!AuthHelper.isOwnerOrAdmin(req.user, worker.user._id)) {
      return ApiResponse.forbidden(res);
    }

    // Update worker
    const updatedWorker = await WorkerService.updateWorker(
      req.params.id,
      req.body,
      req.user.isAdmin
    );

    return ApiResponse.success(res, updatedWorker);
  } catch (error) {
    console.error('Update worker error:', error);
    return ApiResponse.error(res, 'İşçi güncellenirken bir hata oluştu.');
  }
};

const deleteWorker = async (req, res) => {
  try {
    const worker = await WorkerService.getWorkerById(req.params.id);

    if (!worker) {
      return ApiResponse.notFound(res, 'İşçi bulunamadı.');
    }

    // Authorization check
    if (!AuthHelper.isOwnerOrAdmin(req.user, worker.user._id)) {
      return ApiResponse.forbidden(res);
    }

    await WorkerService.deleteWorker(req.params.id);

    return ApiResponse.success(res, { message: 'İşçi kaydı başarıyla silindi.' });
  } catch (error) {
    console.error('Delete worker error:', error);
    return ApiResponse.error(res, 'İşçi silinirken bir hata oluştu.');
  }
};

export {
  getAllWorkers,
  getWorkerById,
  getMyWorkerProfile,
  createWorker,
  updateWorker,
  deleteWorker,
};
