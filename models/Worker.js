import mongoose from 'mongoose';

// Constants - Validation Messages
const VALIDATION = {
  USER_REQUIRED: 'Kullanıcı referansı zorunludur',
  FIRST_NAME_REQUIRED: 'Ad zorunludur',
  LAST_NAME_REQUIRED: 'Soyad zorunludur',
  BIRTH_DATE_REQUIRED: 'Doğum tarihi zorunludur',
  PHONE_REQUIRED: 'Telefon numarası zorunludur',
  PHONE_INVALID: 'Geçerli bir telefon numarası giriniz',
  ADDRESS_REQUIRED: 'Adres zorunludur',
  PROFESSION_REQUIRED: 'Meslek bilgisi zorunludur',
  JOB_TYPE_REQUIRED: 'İş türü zorunludur',
  EXPERIENCE_REQUIRED: 'Deneyim yılı zorunludur',
  EDUCATION_REQUIRED: 'Eğitim durumu zorunludur',
  ABOUT_MAX_LENGTH: 'Hakkında metni en fazla 1000 karakter olabilir',
};

// Enums
const JOB_TYPES = ['Tam Zamanlı', 'Yarı Zamanlı', 'Serbest', 'Staj', 'Geçici'];
const EDUCATION_LEVELS = ['İlkokul', 'Ortaokul', 'Lise', 'Üniversite', 'Yüksek Lisans', 'Doktora'];

// Phone validation regex (Turkish format)
const PHONE_REGEX = /^(\+90|0)?[5][0-9]{9}$/;

/**
 * Worker Schema - Job Seeker Profile
 * Contains comprehensive information about job seekers
 */
const workerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, VALIDATION.USER_REQUIRED],
      unique: true, // One worker per user
      index: true,
    },
    firstName: {
      type: String,
      required: [true, VALIDATION.FIRST_NAME_REQUIRED],
      trim: true,
      minlength: [2, 'Ad en az 2 karakter olmalıdır'],
      maxlength: [50, 'Ad en fazla 50 karakter olabilir'],
    },
    lastName: {
      type: String,
      required: [true, VALIDATION.LAST_NAME_REQUIRED],
      trim: true,
      minlength: [2, 'Soyad en az 2 karakter olmalıdır'],
      maxlength: [50, 'Soyad en fazla 50 karakter olabilir'],
    },
    birthDate: {
      type: Date,
      required: [true, VALIDATION.BIRTH_DATE_REQUIRED],
      validate: {
        validator: function (value) {
          const age = this.calculateAge(value);
          return age >= 16 && age <= 100;
        },
        message: 'Yaş 16-100 arasında olmalıdır',
      },
    },
    phone: {
      type: String,
      required: [true, VALIDATION.PHONE_REQUIRED],
      trim: true,
      validate: {
        validator: (value) => PHONE_REGEX.test(value),
        message: VALIDATION.PHONE_INVALID,
      },
    },
    address: {
      type: String,
      required: [true, VALIDATION.ADDRESS_REQUIRED],
      trim: true,
      minlength: [10, 'Adres en az 10 karakter olmalıdır'],
      maxlength: [200, 'Adres en fazla 200 karakter olabilir'],
    },
    profession: {
      type: String,
      required: [true, VALIDATION.PROFESSION_REQUIRED],
      trim: true,
      minlength: [2, 'Meslek en az 2 karakter olmalıdır'],
      maxlength: [100, 'Meslek en fazla 100 karakter olabilir'],
      index: true, // For search optimization
    },
    jobType: {
      type: String,
      required: [true, VALIDATION.JOB_TYPE_REQUIRED],
      enum: {
        values: JOB_TYPES,
        message: 'Geçersiz iş türü',
      },
      default: 'Tam Zamanlı',
      index: true,
    },
    experienceYears: {
      type: Number,
      required: [true, VALIDATION.EXPERIENCE_REQUIRED],
      min: [0, 'Deneyim yılı negatif olamaz'],
      max: [50, 'Deneyim yılı 50\'den fazla olamaz'],
      default: 0,
      index: true,
    },
    education: {
      type: String,
      required: [true, VALIDATION.EDUCATION_REQUIRED],
      enum: {
        values: EDUCATION_LEVELS,
        message: 'Geçersiz eğitim seviyesi',
      },
      index: true,
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'En fazla 20 yetenek eklenebilir',
      },
    },
    about: {
      type: String,
      maxlength: [1000, VALIDATION.ABOUT_MAX_LENGTH],
      trim: true,
    },
    expectedSalary: {
      type: Number,
      min: [0, 'Maaş negatif olamaz'],
      max: [1000000, 'Beklenen maaş çok yüksek'],
    },
    cvFile: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
workerSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

workerSchema.virtual('age').get(function () {
  return this.calculateAge(this.birthDate);
});

workerSchema.virtual('experienceLevel').get(function () {
  if (this.experienceYears === 0) return 'Deneyimsiz';
  if (this.experienceYears <= 2) return 'Junior';
  if (this.experienceYears <= 5) return 'Mid-Level';
  if (this.experienceYears <= 10) return 'Senior';
  return 'Expert';
});

// Instance Methods
workerSchema.methods = {
  /**
   * Calculate age from birth date
   * @param {Date} birthDate
   * @returns {number}
   */
  calculateAge(birthDate) {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  },

  /**
   * Check if worker profile is complete
   * @returns {boolean}
   */
  isProfileComplete() {
    return !!(
      this.firstName &&
      this.lastName &&
      this.birthDate &&
      this.phone &&
      this.address &&
      this.profession &&
      this.education &&
      this.skills.length > 0
    );
  },

  /**
   * Get safe worker object for public display
   * @returns {Object}
   */
  toPublicObject() {
    return {
      _id: this._id,
      fullName: this.fullName,
      age: this.age,
      profession: this.profession,
      jobType: this.jobType,
      experienceYears: this.experienceYears,
      experienceLevel: this.experienceLevel,
      education: this.education,
      skills: this.skills,
      about: this.about,
      isActive: this.isActive,
      isApproved: this.isApproved,
    };
  },
};

// Static Methods
workerSchema.statics = {
  /**
   * Find active and approved workers
   * @returns {Promise<Worker[]>}
   */
  async findActiveWorkers() {
    return this.find({ isActive: true, isApproved: true }).populate('user', 'name email');
  },

  /**
   * Find workers by profession
   * @param {string} profession
   * @returns {Promise<Worker[]>}
   */
  async findByProfession(profession) {
    return this.find({
      profession: new RegExp(profession, 'i'),
      isActive: true,
      isApproved: true,
    }).populate('user', 'name email');
  },

  /**
   * Find workers by experience range
   * @param {number} minYears
   * @param {number} maxYears
   * @returns {Promise<Worker[]>}
   */
  async findByExperience(minYears, maxYears) {
    return this.find({
      experienceYears: { $gte: minYears, $lte: maxYears },
      isActive: true,
      isApproved: true,
    }).populate('user', 'name email');
  },

  /**
   * Find pending approval workers
   * @returns {Promise<Worker[]>}
   */
  async findPendingApproval() {
    return this.find({ isApproved: false }).populate('user', 'name email');
  },
};

// Query Helpers
workerSchema.query = {
  /**
   * Filter by active status
   * @param {boolean} isActive
   * @returns {Query}
   */
  active(isActive = true) {
    return this.where({ isActive });
  },

  /**
   * Filter by approval status
   * @param {boolean} isApproved
   * @returns {Query}
   */
  approved(isApproved = true) {
    return this.where({ isApproved });
  },

  /**
   * Filter by job type
   * @param {string} jobType
   * @returns {Query}
   */
  byJobType(jobType) {
    return this.where({ jobType });
  },

  /**
   * Search by skills
   * @param {string[]} skills
   * @returns {Query}
   */
  withSkills(skills) {
    return this.where({ skills: { $in: skills } });
  },

  /**
   * Sort by experience descending
   * @returns {Query}
   */
  mostExperienced() {
    return this.sort({ experienceYears: -1 });
  },

  /**
   * Recent workers
   * @param {number} days
   * @returns {Query}
   */
  recent(days = 30) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    return this.where('createdAt').gte(dateThreshold);
  },
};

// Middleware - Pre-save normalization
workerSchema.pre('save', function (next) {
  // Normalize phone number
  if (this.isModified('phone')) {
    this.phone = this.phone.replace(/\s+/g, '');
  }

  // Normalize skills
  if (this.isModified('skills')) {
    this.skills = this.skills.map(skill => skill.trim()).filter(Boolean);
  }

  next();
});

// Create model
const Worker = mongoose.model('Worker', workerSchema);

export default Worker;
