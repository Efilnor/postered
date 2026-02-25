require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const designsRoutes = require('./routes/designs')
const themesRoutes = require('./routes/themes')
const ordersRoutes = require('./routes/orders')
const adminRoutes = require('./routes/admin')
const { ensureDbInitialized } = require('../db/init');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
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
