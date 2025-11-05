// --- ES6 Module Imports - Modern JavaScript ---

import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Initialize environment variables FIRST
dotenv.config();

// Import Database singleton
import dbInstance from './config/database.js';

// Import Routes
import workerRoutes from './routes/workerRoutes.js';
import workerViewRoutes from './routes/workerViewRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// --- Server Startup - Modern Async/Await Pattern ---

const startServer = async () => {
  try {
    // Connect to database first
    await dbInstance.connect();

    // Initialize Express app
    const app = express();
    const PORT = process.env.PORT || 3000;

    // View Engine Setup
    app.set('view engine', 'ejs');

    // Middleware Stack
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // API Routes
    app.get('/testapi/', (req, res) => {
      res.send('Version 3.0: İş Arayan Platformu API (ES6 Modules) çalışıyor...');
    });

    app.use('/api/workers', workerRoutes);
    app.use('/api/users', userRoutes);

    // View Routes
    app.use('/workers', workerViewRoutes);
    app.use('/auth', authRoutes);
    app.use('/admin', adminRoutes);

    // Root redirect
    app.get('/', (req, res) => {
      res.redirect('/workers');
    });

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📦 Using ES6 Modules (import/export)`);
    });
  } catch (error) {
    console.error('❌ Critical error during server startup:', error.message);
    process.exit(1);
  }
};

// Start the application
startServer();