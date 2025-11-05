import mongoose from 'mongoose';

// Constants - Connection Configuration
const DB_CONFIG = {
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  family: 4, // Use IPv4
};

const ERROR_MESSAGES = {
  NO_URI: 'MONGO_URI ortam değişkeni .env dosyasında tanımlanmamış.',
  CONNECTION_FAILED: 'Veritabanı bağlantısı kurulamadı.',
  DISCONNECTED: 'MongoDB bağlantısı kesildi.',
  RECONNECTION_FAILED: 'MongoDB yeniden bağlantı girişimi başarısız.',
};

const LOG_MESSAGES = {
  CONNECTING: 'Veritabanına bağlanılıyor...',
  CONNECTED: (host) => `✅ MongoDB bağlantısı başarılı: ${host}`,
  ALREADY_CONNECTED: 'Veritabanı bağlantısı zaten mevcut.',
  RECONNECTING: 'MongoDB yeniden bağlanmaya çalışıyor...',
  DISCONNECTED: 'MongoDB bağlantısı kapatıldı.',
};

/**
 * Database Singleton Pattern
 * Ensures single database connection instance throughout the application
 */
class Database {
  static #instance = null;
  #connection = null;
  #isConnecting = false;

  constructor() {
    if (Database.#instance) {
      return Database.#instance;
    }
    Database.#instance = this;
    this.#setupEventHandlers();
  }

  /**
   * Setup MongoDB connection event handlers
   * @private
   */
  #setupEventHandlers() {
    mongoose.connection.on('connected', () => {
      console.log(LOG_MESSAGES.CONNECTED(mongoose.connection.host));
    });

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(LOG_MESSAGES.DISCONNECTED);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Validate environment configuration
   * @private
   * @throws {Error} If MONGO_URI is not defined
   */
  #validateConfig() {
    if (!process.env.MONGO_URI) {
      throw new Error(ERROR_MESSAGES.NO_URI);
    }
  }

  /**
   * Connect to MongoDB database
   * @returns {Promise<void>}
   * @throws {Error} If connection fails
   */
  async connect() {
    // Prevent multiple simultaneous connection attempts
    if (this.#isConnecting) {
      console.log('Connection attempt in progress...');
      return;
    }

    if (this.#connection) {
      console.log(LOG_MESSAGES.ALREADY_CONNECTED);
      return;
    }

    try {
      this.#isConnecting = true;
      this.#validateConfig();

      console.log(LOG_MESSAGES.CONNECTING);
      
      const connection = await mongoose.connect(process.env.MONGO_URI, DB_CONFIG);
      
      this.#connection = connection;
      this.#isConnecting = false;
    } catch (error) {
      this.#isConnecting = false;
      console.error(ERROR_MESSAGES.CONNECTION_FAILED, error.message);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB database
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.#connection) {
      await mongoose.disconnect();
      this.#connection = null;
      console.log(LOG_MESSAGES.DISCONNECTED);
    }
  }

  /**
   * Get database connection status
   * @returns {boolean}
   */
  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Get Mongoose connection object
   * @returns {mongoose.Connection}
   */
  getConnection() {
    return mongoose.connection;
  }

  /**
   * Get Database singleton instance
   * @returns {Database}
   */
  static getInstance() {
    if (!Database.#instance) {
      new Database();
    }
    return Database.#instance;
  }
}

// Export singleton instance
export default Database.getInstance();
