import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import passport from './config/passport.js';
import { connectDB } from './config/database.js';
import config from './config/environment.js';
import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { requestLogger } from './middleware/logger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { requestContext } from './middleware/context.js';
import { auditLogger } from './middleware/audit.js';
import { initMetrics, recordHttpRequest, metricsHandler } from './middleware/metrics.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import oauthRoutes from './routes/oauth.routes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Session middleware for OAuth
app.use(
  session({
    secret: config.jwt?.secret || 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origin.includes('vercel.app') || origin.includes('netlify.app') || origin.includes('localhost')) {
        return callback(null, true);
      }
      const allowedOrigins = Array.isArray(config.cors.origin) ? config.cors.origin : [config.cors.origin];
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Logging middleware
app.use(morgan('combined'));
app.use(requestLogger);
app.use(requestContext);
app.use(auditLogger);

// Rate limiting
app.use(`${config.apiPrefix}/`, apiLimiter);

// Metrics endpoint
app.get('/metrics', metricsHandler);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
const apiPrefix = `${config.apiPrefix}/${config.apiVersion}`;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/auth`, oauthRoutes);
app.use(`${apiPrefix}/resumes`, resumeRoutes);
app.use(`${apiPrefix}/share`, shareRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);
app.use(`${apiPrefix}/ai`, aiRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/feedback`, feedbackRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize metrics
    initMetrics();

    // Connect to MongoDB
    await connectDB();

    const server = app.listen(config.port, () => {
      logger.info(
        `Server running in ${config.env} mode on port ${config.port}`
      );
      logger.info(
        `API available at http://localhost:${config.port}${apiPrefix}`
      );
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

startServer();

export default app;
