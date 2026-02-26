require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit')
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const designsRoutes = require('./routes/designs')
const themesRoutes = require('./routes/themes')
const ordersRoutes = require('./routes/orders')
const adminRoutes = require('./routes/admin')
const { ensureDbInitialized } = require('../db/init');

const app = express();

app.set('trust proxy', 1);
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Trop de requêtes, veuillez réessayer plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, 
  message: { error: "Trop de tentatives de connexion. Réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/auth', authLimiter, authRoutes);
app.use('/api', apiRoutes);
app.use('/api/designs', designsRoutes);
app.use('/api/themes', themesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes)
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 4000;

ensureDbInitialized().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize DB', err);
  process.exit(1);
});
