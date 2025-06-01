const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mengambil semua pengajuan SA
const getAllPengajuanSA = async (req, res) => {
  try {
    const pengajuanSA = await prisma.pengajuanSA.findMany({
      include: {
        mahasiswa: true,
        dosen: true
      }
    });
    res.json(pengajuanSA);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mengambil pengajuan SA berdasarkan mahasiswa
const getPengajuanSAByMahasiswa = async (req, res) => {
  try {
    const pengajuanSA = await prisma.pengajuanSA.findMany({
      where: { mahasiswaId: parseInt(req.params.mahasiswaId) },
      include: {
        mahasiswa: true,
        dosen: true
      }
    });
    res.json(pengajuanSA);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Menambahkan pengajuan SA baru (dengan upload bukti pembayaran)
const createPengajuanSA = async (req, res) => {
  try {
    const { mahasiswaId, keterangan } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Bukti pembayaran harus diupload' });
    }

    const pengajuanSA = await prisma.pengajuanSA.create({
      data: {
        mahasiswaId: parseInt(mahasiswaId),
        buktiPembayaran: req.file.filename,
        keterangan,
        status: 'PROSES_PENGAJUAN'
      },
      include: {
        mahasiswa: true
      }
    });
    
    res.status(201).json(pengajuanSA);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Memperbarui status pengajuan SA (untuk kaprodi)
const updateStatusPengajuanSA = async (req, res) => {
  try {
    const { status, dosenId } = req.body;
    
    const updateData = { status };
    if (dosenId) {
      updateData.dosenId = parseInt(dosenId);
    }

    const pengajuanSA = await prisma.pengajuanSA.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      include: {
        mahasiswa: true,
        dosen: true
      }
    });
    
    res.json(pengajuanSA);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Memperbarui nilai SA (untuk dosen)
const updateNilaiPengajuanSA = async (req, res) => {
  try {
    const { nilaiAkhir } = req.body;
    
    const pengajuanSA = await prisma.pengajuanSA.update({
      where: { id: parseInt(req.params.id) },
      data: {
        nilaiAkhir: parseFloat(nilaiAkhir),
        status: 'SELESAI'
      },
      include: {
        mahasiswa: true,
        dosen: true
      }
    });
    
    res.json(pengajuanSA);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllPengajuanSA,
  getPengajuanSAByMahasiswa,
  createPengajuanSA,
  updateStatusPengajuanSA,
  updateNilaiPengajuanSA
};