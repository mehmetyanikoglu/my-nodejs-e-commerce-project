import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Constants - Configuration
const VALIDATION = {
  NAME_REQUIRED: 'Lütfen bir isim giriniz.',
  EMAIL_REQUIRED: 'Lütfen bir e-posta adresi giriniz.',
  EMAIL_INVALID: 'Geçerli bir e-posta adresi giriniz.',
  PASSWORD_REQUIRED: 'Lütfen bir şifre giriniz.',
  PASSWORD_MIN_LENGTH: 'Şifre en az 6 karakter olmalıdır.',
};

const SALT_ROUNDS = 10;

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * User Schema - Authentication & Authorization
 * Handles user accounts with role-based access control
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, VALIDATION.NAME_REQUIRED],
      trim: true,
      minlength: [2, 'İsim en az 2 karakter olmalıdır.'],
      maxlength: [100, 'İsim en fazla 100 karakter olabilir.'],
    },
    email: {
      type: String,
      required: [true, VALIDATION.EMAIL_REQUIRED],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => EMAIL_REGEX.test(value),
        message: VALIDATION.EMAIL_INVALID,
      },
      index: true, // Performance optimization for queries
    },
    password: {
      type: String,
      required: [true, VALIDATION.PASSWORD_REQUIRED],
      minlength: [6, VALIDATION.PASSWORD_MIN_LENGTH],
      select: false, // Don't include password in queries by default
    },
    isAdmin: {
      type: Boolean,
      default: false,
      index: true, // Performance optimization for admin queries
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual - Full email domain
userSchema.virtual('emailDomain').get(function () {
  return this.email.split('@')[1];
});

// Middleware - Pre-save password hashing
userSchema.pre('save', async function (next) {
  // Skip if password not modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware - Pre-save email normalization
userSchema.pre('save', function (next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

// Instance Methods
userSchema.methods = {
  /**
   * Compare entered password with hashed password
   * @param {string} enteredPassword - Plain text password
   * @returns {Promise<boolean>}
   */
  async matchPassword(enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
  },

  /**
   * Get safe user object without sensitive data
   * @returns {Object}
   */
  toSafeObject() {
    return {
      _id: this._id,
      name: this.name,
      email: this.email,
      isAdmin: this.isAdmin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  },
};

// Static Methods
userSchema.statics = {
  /**
   * Find user by email with password field
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  async findByEmailWithPassword(email) {
    return this.findOne({ email: email.toLowerCase() }).select('+password');
  },

  /**
   * Find all admin users
   * @returns {Promise<User[]>}
   */
  async findAdmins() {
    return this.find({ isAdmin: true });
  },

  /**
   * Check if email exists
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async emailExists(email) {
    const user = await this.findOne({ email: email.toLowerCase() });
    return !!user;
  },
};

// Query Helpers
userSchema.query = {
  /**
   * Filter by admin status
   * @param {boolean} isAdmin
   * @returns {Query}
   */
  byAdminStatus(isAdmin) {
    return this.where({ isAdmin });
  },

  /**
   * Find recent users
   * @param {number} days - Number of days to look back
   * @returns {Query}
   */
  recentUsers(days = 7) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    return this.where('createdAt').gte(dateThreshold);
  },
};

// Create model
const User = mongoose.model('User', userSchema);

export default User;
