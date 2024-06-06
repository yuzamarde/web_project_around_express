const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/utils');

const User = require('../models/user');

const doesUserExist = async (email) => {
  let user;
  try {
    user = await User.findOne({ email });
  } catch (error) {
    throw new Error('Terjadi kesalahan di server saat mencari pengguna');
  }
  return !!user;
};

const hashPassword = async (password) => bcrypt.hash(password, 10);

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findUserByCredentials(email, password);

    if (user && (user instanceof Error || user === 'Email atau sandi salah')) {
      return res.status(403).send(user.message);
    }
    const token = await generateToken(user);
    return res.status(200).send({ token });
  } catch (error) {
    return res.status(401).send({ message: error.message, details: error });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      name, about, avatar, email, password,
    } = req.body;
    const userExists = await doesUserExist(email);
    if (userExists) {
      return res.status(409).send({ message: 'Mail sudah terdaftar sebelumnya' });
    }
    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      name,
      about,
      avatar,
      email,
      password: hashedPassword,
    });
    return res.status(201).send({ data: newUser, message: 'Pengguna berhasil dibuat' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).send({ message: 'Kesalahan validasi data' });
    }
    return res.status(500).send({ message: 'Terjadi kesalahan saat membuat data pengguna di server' });
  }
};

const getUserbyId = async (req, res) => {
  const { _id } = req.user;
  try {
    const user = await User.findById(_id);
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send({ message: 'Terjadi kesalahan di server saat mencari data pengguna' });
  }
};

const updateUserProfile = async (req, res) => {
  const { name, about } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true },
    );
    return res.status(200).send(updatedUser);
  } catch (error) {
    return res.status(400).send({ message: 'Terjadi kesalahan saat memperbarui profil pengguna' });
  }
};

const updateUserAvatar = async (req, res) => {
  const { avatar } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true },
    );
    return res.status(200).send(updatedUser);
  } catch (error) {
    return res.status(400).send({ message: 'Terjadi kesalahan saat memperbarui avatar pengguna' });
  }
};

// Tambahkan fungsi getUsers di sini
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: 'Terjadi kesalahan saat mengambil data pengguna' });
  }
};

module.exports = {
  createUser, updateUserProfile, updateUserAvatar, login, getUserbyId, getUsers,
};
