const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mengambil semua mahasiswa
const getAllMahasiswa = async (req, res) => {
  try {
    const mahasiswa = await prisma.mahasiswa.findMany({
      include: {
        pengajuanSA: true
      }
    });
    res.json(mahasiswa);
  } catch (error) {
    console.error('Error getting all mahasiswa:', error);
    res.status(500).json({ 
      error: error.message,
      message: 'Gagal mengambil data mahasiswa'
    });
  }
};

// Mengambil mahasiswa berdasarkan ID
const getMahasiswaById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: 'Invalid ID format',
        message: 'ID harus berupa angka'
      });
    }

    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: { id },
      include: {
        pengajuanSA: true
      }
    });
    
    if (!mahasiswa) {
      return res.status(404).json({ 
        error: 'Mahasiswa not found',
        message: 'Data mahasiswa tidak ditemukan'
      });
    }
    
    res.json(mahasiswa);
  } catch (error) {
    console.error('Error getting mahasiswa by ID:', error);
    res.status(500).json({ 
      error: error.message,
      message: 'Gagal mengambil data mahasiswa'
    });
  }
};

// Menambahkan mahasiswa baru
const createMahasiswa = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Debug log
    
    const { nama, nim, programStudi, angkatan, semester, noTelp, email } = req.body;
    
    // Validasi input wajib
    if (!nama || !nim || !programStudi || !angkatan || !semester || !noTelp) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Semua field wajib harus diisi (nama, nim, programStudi, angkatan, semester, noTelp)'
      });
    }

    // Validasi format semester
    const semesterInt = parseInt(semester);
    if (isNaN(semesterInt) || semesterInt < 1 || semesterInt > 14) {
      return res.status(400).json({
        error: 'Invalid semester',
        message: 'Semester harus berupa angka antara 1-14'
      });
    }

    // Cek apakah NIM sudah ada
    const existingMahasiswa = await prisma.mahasiswa.findFirst({
      where: { nim: nim.toString() }
    });

    if (existingMahasiswa) {
      return res.status(409).json({
        error: 'NIM already exists',
        message: 'NIM sudah terdaftar'
      });
    }

    // Buat data mahasiswa baru
    const mahasiswaData = {
      nama: nama.toString().trim(),
      nim: nim.toString().trim(),
      programStudi: programStudi.toString().trim(),
      angkatan: angkatan.toString().trim(),
      semester: semesterInt,
      noTelp: noTelp.toString().trim()
    };

    // Tambahkan email jika ada dan tidak kosong
    if (email && email.trim()) {
      mahasiswaData.email = email.toString().trim();
    }

    const mahasiswa = await prisma.mahasiswa.create({
      data: mahasiswaData
    });
    
    console.log('Mahasiswa created:', mahasiswa); // Debug log
    res.status(201).json({
      ...mahasiswa,
      message: 'Data mahasiswa berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Error creating mahasiswa:', error);
    
    // Handle Prisma specific errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Unique constraint violation',
        message: 'Data sudah ada (kemungkinan NIM duplikat)'
      });
    }
    
    res.status(500).json({ 
      error: error.message,
      message: 'Gagal menambahkan data mahasiswa'
    });
  }
};

// Memperbarui mahasiswa berdasarkan ID
const updateMahasiswa = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: 'Invalid ID format',
        message: 'ID harus berupa angka'
      });
    }

    const { nama, nim, programStudi, angkatan, semester, noTelp, email } = req.body;
    
    // Validasi input wajib
    if (!nama || !nim || !programStudi || !angkatan || !semester || !noTelp) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Semua field wajib harus diisi'
      });
    }

    // Validasi format semester
    const semesterInt = parseInt(semester);
    if (isNaN(semesterInt) || semesterInt < 1 || semesterInt > 14) {
      return res.status(400).json({
        error: 'Invalid semester',
        message: 'Semester harus berupa angka antara 1-14'
      });
    }

    // Cek apakah mahasiswa ada
    const existingMahasiswa = await prisma.mahasiswa.findUnique({
      where: { id }
    });

    if (!existingMahasiswa) {
      return res.status(404).json({
        error: 'Mahasiswa not found',
        message: 'Data mahasiswa tidak ditemukan'
      });
    }

    // Cek apakah NIM sudah digunakan oleh mahasiswa lain
    const nimExists = await prisma.mahasiswa.findFirst({
      where: { 
        nim: nim.toString(),
        NOT: { id }
      }
    });

    if (nimExists) {
      return res.status(409).json({
        error: 'NIM already exists',
        message: 'NIM sudah digunakan oleh mahasiswa lain'
      });
    }

    // Update data mahasiswa
    const updateData = {
      nama: nama.toString().trim(),
      nim: nim.toString().trim(),
      programStudi: programStudi.toString().trim(),
      angkatan: angkatan.toString().trim(),
      semester: semesterInt,
      noTelp: noTelp.toString().trim()
    };

    // Tambahkan email jika ada
    if (email !== undefined) {
      updateData.email = email && email.trim() ? email.toString().trim() : null;
    }

    const mahasiswa = await prisma.mahasiswa.update({
      where: { id },
      data: updateData
    });
    
    res.json({
      ...mahasiswa,
      message: 'Data mahasiswa berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating mahasiswa:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Unique constraint violation',
        message: 'Data sudah ada (kemungkinan NIM duplikat)'
      });
    }
    
    res.status(500).json({ 
      error: error.message,
      message: 'Gagal memperbarui data mahasiswa'
    });
  }
};

// Menghapus mahasiswa berdasarkan ID
const deleteMahasiswa = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: 'Invalid ID format',
        message: 'ID harus berupa angka'
      });
    }

    // Cek apakah mahasiswa ada
    const existingMahasiswa = await prisma.mahasiswa.findUnique({
      where: { id }
    });

    if (!existingMahasiswa) {
      return res.status(404).json({
        error: 'Mahasiswa not found',
        message: 'Data mahasiswa tidak ditemukan'
      });
    }

    await prisma.mahasiswa.delete({
      where: { id }
    });
    
    res.json({ 
      message: 'Data mahasiswa berhasil dihapus',
      deletedId: id
    });
  } catch (error) {
    console.error('Error deleting mahasiswa:', error);
    
    // Handle foreign key constraint errors
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'Foreign key constraint',
        message: 'Tidak dapat menghapus mahasiswa karena masih memiliki data terkait'
      });
    }
    
    res.status(500).json({ 
      error: error.message,
      message: 'Gagal menghapus data mahasiswa'
    });
  }
};

module.exports = {
  getAllMahasiswa,
  getMahasiswaById,
  createMahasiswa,
  updateMahasiswa,
  deleteMahasiswa
};