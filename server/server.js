const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Import routes
const mahasiswaRoutes = require('./routes/mahasiswa');
const dosenRoutes = require('./routes/dosen');
const pengajuanSARoutes = require('./routes/pengajuanSA');
const jurusanRoutes = require('./routes/jurusan');
const prodiRoutes = require('./routes/prodi');

// Use routes
app.use('/api/mahasiswa', mahasiswaRoutes);
app.use('/api/dosen', dosenRoutes);
app.use('/api/pengajuan-sa', pengajuanSARoutes);
app.use('/api/jurusan', jurusanRoutes);
app.use('/api/program-studi', prodiRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running successfully!',
    timestamp: new Date().toISOString(),
    endpoints: {
      mahasiswa: '/api/mahasiswa',
      dosen: '/api/dosen',
      pengajuanSA: '/api/pengajuan-sa',
      jurusan: '/api/jurusan',
      programStudi: '/api/program-studi'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    requestedPath: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}`);
});