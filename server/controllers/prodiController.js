const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all program studi
const getAllProdi = async (req, res) => {
  try {
    const prodi = await prisma.programStudi.findMany({
      include: {
        jurusan: {
          select: {
            id: true,
            nama: true,
            kode: true
          }
        },
        _count: {
          select: {
            mahasiswa: true
          }
        }
      },
      orderBy: {
        nama: 'asc'
      }
    });

    res.json(prodi);
  } catch (error) {
    console.error('Error fetching program studi:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil data program studi',
      error: error.message 
    });
  }
};

// Get program studi by ID
const getProdiById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const prodi = await prisma.programStudi.findUnique({
      where: { 
        id: parseInt(id) 
      },
      include: {
        jurusan: {
          select: {
            id: true,
            nama: true,
            kode: true
          }
        },
        _count: {
          select: {
            mahasiswa: true
          }
        }
      }
    });

    if (!prodi) {
      return res.status(404).json({ 
        message: 'Program studi tidak ditemukan' 
      });
    }

    res.json(prodi);
  } catch (error) {
    console.error('Error fetching program studi by ID:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil data program studi',
      error: error.message 
    });
  }
};

// Create new program studi
const createProdi = async (req, res) => {
  try {
    const { kode, nama, fakultas, jenjang, akreditasi, kaprodi, jurusanId } = req.body;

    // Validation
    if (!kode || !nama || !fakultas || !jenjang) {
      return res.status(400).json({ 
        message: 'Kode, nama, fakultas, dan jenjang wajib diisi' 
      });
    }

    // Check if kode already exists
    const existingProdi = await prisma.programStudi.findUnique({
      where: { kode: kode.toUpperCase() }
    });

    if (existingProdi) {
      return res.status(400).json({ 
        message: 'Kode program studi sudah digunakan' 
      });
    }

    // Validate jurusanId if provided
    if (jurusanId) {
      const jurusan = await prisma.jurusan.findUnique({
        where: { id: jurusanId }
      });

      if (!jurusan) {
        return res.status(400).json({ 
          message: 'Jurusan tidak ditemukan' 
        });
      }
    }

    // Create program studi
    const newProdi = await prisma.programStudi.create({
      data: {
        kode: kode.toUpperCase(),
        nama: nama.trim(),
        fakultas: fakultas.trim(),
        jenjang,
        akreditasi: akreditasi || null,
        kaprodi: kaprodi ? kaprodi.trim() : null,
        jurusanId: jurusanId || null
      },
      include: {
        jurusan: {
          select: {
            id: true,
            nama: true,
            kode: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Program studi berhasil ditambahkan',
      data: newProdi
    });
  } catch (error) {
    console.error('Error creating program studi:', error);
    res.status(500).json({ 
      message: 'Gagal menambahkan program studi',
      error: error.message 
    });
  }
};

// Update program studi
const updateProdi = async (req, res) => {
  try {
    const { id } = req.params;
    const { kode, nama, fakultas, jenjang, akreditasi, kaprodi, jurusanId } = req.body;

    // Validation
    if (!kode || !nama || !fakultas || !jenjang) {
      return res.status(400).json({ 
        message: 'Kode, nama, fakultas, dan jenjang wajib diisi' 
      });
    }

    // Check if program studi exists
    const existingProdi = await prisma.programStudi.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProdi) {
      return res.status(404).json({ 
        message: 'Program studi tidak ditemukan' 
      });
    }

    // Check if kode is already used by another program studi
    const kodeCheck = await prisma.programStudi.findFirst({
      where: {
        kode: kode.toUpperCase(),
        id: { not: parseInt(id) }
      }
    });

    if (kodeCheck) {
      return res.status(400).json({ 
        message: 'Kode program studi sudah digunakan' 
      });
    }

    // Validate jurusanId if provided
    if (jurusanId) {
      const jurusan = await prisma.jurusan.findUnique({
        where: { id: jurusanId }
      });

      if (!jurusan) {
        return res.status(400).json({ 
          message: 'Jurusan tidak ditemukan' 
        });
      }
    }

    // Update program studi
    const updatedProdi = await prisma.programStudi.update({
      where: { 
        id: parseInt(id) 
      },
      data: {
        kode: kode.toUpperCase(),
        nama: nama.trim(),
        fakultas: fakultas.trim(),
        jenjang,
        akreditasi: akreditasi || null,
        kaprodi: kaprodi ? kaprodi.trim() : null,
        jurusanId: jurusanId || null
      },
      include: {
        jurusan: {
          select: {
            id: true,
            nama: true,
            kode: true
          }
        }
      }
    });

    res.json({
      message: 'Program studi berhasil diperbarui',
      data: updatedProdi
    });
  } catch (error) {
    console.error('Error updating program studi:', error);
    res.status(500).json({ 
      message: 'Gagal memperbarui program studi',
      error: error.message 
    });
  }
};

// Delete program studi
const deleteProdi = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if program studi exists
    const existingProdi = await prisma.programStudi.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            mahasiswa: true
          }
        }
      }
    });

    if (!existingProdi) {
      return res.status(404).json({ 
        message: 'Program studi tidak ditemukan' 
      });
    }

    // Check if there are related mahasiswa records
    if (existingProdi._count.mahasiswa > 0) {
      return res.status(400).json({ 
        message: `Tidak dapat menghapus program studi karena masih memiliki ${existingProdi._count.mahasiswa} mahasiswa terkait` 
      });
    }

    // Delete program studi
    await prisma.programStudi.delete({
      where: { 
        id: parseInt(id) 
      }
    });

    res.json({
      message: 'Program studi berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting program studi:', error);
    res.status(500).json({ 
      message: 'Gagal menghapus program studi',
      error: error.message 
    });
  }
};

// Get program studi statistics
const getProdiStats = async (req, res) => {
  try {
    const stats = await prisma.programStudi.groupBy({
      by: ['jenjang'],
      _count: {
        jenjang: true
      }
    });

    const totalProdi = await prisma.programStudi.count();
    const terakreditasi = await prisma.programStudi.count({
      where: {
        akreditasi: {
          not: null
        }
      }
    });

    const formattedStats = {
      total: totalProdi,
      terakreditasi,
      byJenjang: stats.reduce((acc, item) => {
        acc[item.jenjang.toLowerCase()] = item._count.jenjang;
        return acc;
      }, {})
    };

    res.json(formattedStats);
  } catch (error) {
    console.error('Error fetching program studi statistics:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil statistik program studi',
      error: error.message 
    });
  }
};

// Search program studi
const searchProdi = async (req, res) => {
  try {
    const { q, fakultas, jenjang, akreditasi } = req.query;

    const whereClause = {};

    // Search by name or code
    if (q) {
      whereClause.OR = [
        {
          nama: {
            contains: q,
            mode: 'insensitive'
          }
        },
        {
          kode: {
            contains: q,
            mode: 'insensitive'
          }
        },
        {
          kaprodi: {
            contains: q,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Filter by fakultas
    if (fakultas) {
      whereClause.fakultas = fakultas;
    }

    // Filter by jenjang
    if (jenjang) {
      whereClause.jenjang = jenjang;
    }

    // Filter by akreditasi
    if (akreditasi) {
      whereClause.akreditasi = akreditasi;
    }

    const prodi = await prisma.programStudi.findMany({
      where: whereClause,
      include: {
        jurusan: {
          select: {
            id: true,
            nama: true,
            kode: true
          }
        },
        _count: {
          select: {
            mahasiswa: true
          }
        }
      },
      orderBy: {
        nama: 'asc'
      }
    });

    res.json(prodi);
  } catch (error) {
    console.error('Error searching program studi:', error);
    res.status(500).json({ 
      message: 'Gagal mencari program studi',
      error: error.message 
    });
  }
};

module.exports = {
  getAllProdi,
  getProdiById,
  createProdi,
  updateProdi,
  deleteProdi,
  getProdiStats,
  searchProdi
};