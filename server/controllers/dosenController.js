const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mengambil semua dosen
const getAllDosen = async (req, res) => {
  try {
    const dosen = await prisma.dosen.findMany({
      include: {
        pengajuanSA: true
      }
    });
    res.json(dosen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mengambil dosen berdasarkan ID
const getDosenById = async (req, res) => {
  try {
    const dosen = await prisma.dosen.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        pengajuanSA: true
      }
    });
    if (!dosen) {
      return res.status(404).json({ error: 'Dosen not found' });
    }
    res.json(dosen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Menambahkan dosen baru
const createDosen = async (req, res) => {
  try {
    const { nama, nip, email, noTelp } = req.body;
    const dosen = await prisma.dosen.create({
      data: {
        nama,
        nip,
        email,
        noTelp
      }
    });
    res.status(201).json(dosen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Memperbarui dosen berdasarkan ID
const updateDosen = async (req, res) => {
  try {
    const { nama, nip, email, noTelp } = req.body;
    const dosen = await prisma.dosen.update({
      where: { id: parseInt(req.params.id) },
      data: {
        nama,
        nip,
        email,
        noTelp
      }
    });
    res.json(dosen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Menghapus dosen berdasarkan ID
const deleteDosen = async (req, res) => {
  try {
    await prisma.dosen.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Dosen deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllDosen,
  getDosenById,
  createDosen,
  updateDosen,
  deleteDosen
};