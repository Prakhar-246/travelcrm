const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/leads',       require('./routes/leads'));
app.use('/api/bookings',    require('./routes/bookings'));
app.use('/api/hotels',      require('./routes/hotels'));
app.use('/api/transport',   require('./routes/transport'));
app.use('/api/vendors',     require('./routes/vendors'));
app.use('/api/packages',    require('./routes/packages'));
app.use('/api/itineraries', require('./routes/itineraries'));
app.use('/api/finance',     require('./routes/finance'));
app.use('/api/reports',     require('./routes/reports'));
app.use('/api/users',       require('./routes/users'));
app.use('/api/reminders',   require('./routes/reminders'));

app.get('/api/health', (_req, res) => res.json({ status: 'OK', app: 'Travel CRM API' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
);
