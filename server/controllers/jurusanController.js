const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/jurusan - Mendapatkan semua data jurusan
const getAllJurusan = async (req, res) => {
  try {
    const jurusan = await prisma.jurusan.findMany({
      include: {
        programStudi: {
          select: {
            id: true,
            kode: true,
            nama: true
          }
        }
      },
      orderBy: {
        nama: 'asc'
      }
    });

    res.status(200).json(jurusan);
  } catch (error) {
    console.error('Error fetching jurusan:', error);
    res.status(500).json({
      message: 'Gagal mengambil data jurusan',
      error: error.message
    });
  }
};

// GET /api/jurusan/:id - Mendapatkan data jurusan berdasarkan ID
const getJurusanById = async (req, res) => {
  try {
    const { id } = req.params;
    const jurusan = await prisma.jurusan.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        programStudi: {
          select: {
            id: true,
            kode: true,
            nama: true,
            jenjang: true,
            akreditasi: true
          }
        }
      }
    });

    if (!jurusan) {
      return res.status(404).json({
        message: 'Data jurusan tidak ditemukan'
      });
    }

    res.status(200).json(jurusan);
  } catch (error) {
    console.error('Error fetching jurusan by ID:', error);
    res.status(500).json({
      message: 'Gagal mengambil data jurusan',
      error: error.message
    });
  }
};

// POST /api/jurusan - Menambah data jurusan baru
const createJurusan = async (req, res) => {
  try {
    const { nama, kode, fakultas, jenjang, kaprodi, deskripsi } = req.body;

    // Validasi data yang diperlukan
    if (!nama || !kode || !fakultas) {
      return res.status(400).json({
        message: 'Nama, kode, dan fakultas harus diisi'
      });
    }

    // Cek apakah kode jurusan sudah ada
    const existingJurusan = await prisma.jurusan.findUnique({
      where: { kode }
    });

    if (existingJurusan) {
      return res.status(400).json({
        message: 'Kode jurusan sudah digunakan'
      });
    }

    // Validasi jenjang
    const validJenjang = ['D3', 'D4', 'S1', 'S2', 'S3'];
    if (jenjang && !validJenjang.includes(jenjang)) {
      return res.status(400).json({
        message: 'Jenjang tidak valid. Harus salah satu dari: D3, D4, S1, S2, S3'
      });
    }

    const newJurusan = await prisma.jurusan.create({
      data: {
        nama: nama.trim(),
        kode: kode.trim().toUpperCase(),
        fakultas: fakultas.trim(),
        jenjang: jenjang || 'S1',
        kaprodi: kaprodi?.trim() || null,
        deskripsi: deskripsi?.trim() || null
      },
      include: {
        programStudi: {
          select: {
            id: true,
            kode: true,
            nama: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Data jurusan berhasil ditambahkan',
      data: newJurusan
    });
  } catch (error) {
    console.error('Error creating jurusan:', error);
    
    // Handle Prisma unique constraint error
    if (error.code === 'P2002') {
      return res.status(400).json({
        message: 'Kode jurusan sudah digunakan'
      });
    }
    
    res.status(500).json({
      message: 'Gagal menambahkan data jurusan',
      error: error.message
    });
  }
};

// PUT /api/jurusan/:id - Mengupdate data jurusan
const updateJurusan = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, kode, fakultas, jenjang, kaprodi, deskripsi } = req.body;

    // Validasi data yang diperlukan
    if (!nama || !kode || !fakultas) {
      return res.status(400).json({
        message: 'Nama, kode, dan fakultas harus diisi'
      });
    }

    // Cek apakah jurusan exists
    const existingJurusan = await prisma.jurusan.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingJurusan) {
      return res.status(404).json({
        message: 'Data jurusan tidak ditemukan'
      });
    }

    // Cek apakah kode jurusan sudah digunakan oleh jurusan lain
    const jurusanWithSameKode = await prisma.jurusan.findUnique({
      where: { kode: kode.trim().toUpperCase() }
    });

    if (jurusanWithSameKode && jurusanWithSameKode.id !== parseInt(id)) {
      return res.status(400).json({
        message: 'Kode jurusan sudah digunakan oleh jurusan lain'
      });
    }

    // Validasi jenjang
    const validJenjang = ['D3', 'D4', 'S1', 'S2', 'S3'];
    if (jenjang && !validJenjang.includes(jenjang)) {
      return res.status(400).json({
        message: 'Jenjang tidak valid. Harus salah satu dari: D3, D4, S1, S2, S3'
      });
    }

    const updatedJurusan = await prisma.jurusan.update({
      where: {
        id: parseInt(id)
      },
      data: {
        nama: nama.trim(),
        kode: kode.trim().toUpperCase(),
        fakultas: fakultas.trim(),
        jenjang: jenjang || 'S1',
        kaprodi: kaprodi?.trim() || null,
        deskripsi: deskripsi?.trim() || null
      },
      include: {
        programStudi: {
          select: {
            id: true,
            kode: true,
            nama: true
          }
        }
      }
    });

    res.status(200).json({
      message: 'Data jurusan berhasil diperbarui',
      data: updatedJurusan
    });
  } catch (error) {
    console.error('Error updating jurusan:', error);
    
    // Handle Prisma unique constraint error
    if (error.code === 'P2002') {
      return res.status(400).json({
        message: 'Kode jurusan sudah digunakan'
      });
    }
    
    res.status(500).json({
      message: 'Gagal memperbarui data jurusan',
      error: error.message
    });
  }
};

// DELETE /api/jurusan/:id - Menghapus data jurusan
const deleteJurusan = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah jurusan exists
    const existingJurusan = await prisma.jurusan.findUnique({
      where: { id: parseInt(id) },
      include: {
        programStudi: true
      }
    });

    if (!existingJurusan) {
      return res.status(404).json({
        message: 'Data jurusan tidak ditemukan'
      });
    }

    // Cek apakah ada program studi yang terkait
    if (existingJurusan.programStudi.length > 0) {
      return res.status(400).json({
        message: 'Tidak dapat menghapus jurusan karena masih memiliki program studi terkait',
        relatedCount: existingJurusan.programStudi.length
      });
    }

    await prisma.jurusan.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.status(200).json({
      message: 'Data jurusan berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting jurusan:', error);
    
    // Handle foreign key constraint error
    if (error.code === 'P2003') {
      return res.status(400).json({
        message: 'Tidak dapat menghapus jurusan karena masih memiliki data terkait'
      });
    }
    
    res.status(500).json({
      message: 'Gagal menghapus data jurusan',
      error: error.message
    });
  }
};

// GET /api/jurusan/search - Mencari jurusan berdasarkan query
const searchJurusan = async (req, res) => {
  try {
    const { q, fakultas, jenjang } = req.query;

    const whereCondition = {
      AND: [
        // Text search
        q ? {
          OR: [
            { nama: { contains: q, mode: 'insensitive' } },
            { kode: { contains: q, mode: 'insensitive' } },
            { kaprodi: { contains: q, mode: 'insensitive' } }
          ]
        } : {},
        // Filter fakultas
        fakultas ? { fakultas: fakultas } : {},
        // Filter jenjang
        jenjang ? { jenjang: jenjang } : {}
      ]
    };

    const jurusan = await prisma.jurusan.findMany({
      where: whereCondition,
      include: {
        programStudi: {
          select: {
            id: true,
            kode: true,
            nama: true
          }
        }
      },
      orderBy: {
        nama: 'asc'
      }
    });

    res.status(200).json(jurusan);
  } catch (error) {
    console.error('Error searching jurusan:', error);
    res.status(500).json({
      message: 'Gagal mencari data jurusan',
      error: error.message
    });
  }
};

// GET /api/jurusan/stats - Mendapatkan statistik jurusan
const getJurusanStats = async (req, res) => {
  try {
    const [total, byJenjang, byFakultas] = await Promise.all([
      // Total jurusan
      prisma.jurusan.count(),
      
      // Jurusan per jenjang
      prisma.jurusan.groupBy({
        by: ['jenjang'],
        _count: {
          id: true
        }
      }),
      
      // Jurusan per fakultas
      prisma.jurusan.groupBy({
        by: ['fakultas'],
        _count: {
          id: true
        }
      })
    ]);

    const stats = {
      total,
      byJenjang: byJenjang.reduce((acc, item) => {
        acc[item.jenjang] = item._count.id;
        return acc;
      }, {}),
      byFakultas: byFakultas.reduce((acc, item) => {
        acc[item.fakultas] = item._count.id;
        return acc;
      }, {})
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting jurusan stats:', error);
    res.status(500).json({
      message: 'Gagal mengambil statistik jurusan',
      error: error.message
    });
  }
};

module.exports = {
  getAllJurusan,
  getJurusanById,
  createJurusan,
  updateJurusan,
  deleteJurusan,
  searchJurusan,
  getJurusanStats
};