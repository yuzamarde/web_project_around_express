const Card = require('../models/card');

exports.getAllCards = async (req, res) => {
  try {
    const cards = await Card.find({}, null, { sort: { createdAt: -1 } });
    return res.status(200).json({ cards });
  } catch (error) {
    return res.status(500).send('Terjadi kesalahan saat mengambil kartu', error);
  }
};

exports.createCard = async (req, res) => {
  const { name, link } = req.body;
  const { _id } = req.user;

  try {
    const newCard = await Card.create({ name, link, owner: _id });
    return res.status(201).json(newCard);
  } catch (error) {
    return res.status(400).send('Terjadi kesalahan saat membuat kartu', error);
  }
};

exports.deleteCardById = async (req, res) => {
  const { cardId } = req.params;
  const { _id } = req.user;
  try {
    const selectedCard = await Card.findById(cardId);

    if (!selectedCard) {
      return res.status(404).send('Kartu tidak ditemukan');
    }

    if (selectedCard.owner.toString() !== _id) {
      return res.status(404).send('Anda tidak memiliki izin untuk menghapus Kartu ini');
    }

    const deletedCard = await Card.findByIdAndRemove(cardId);
    return res.json({ data: deletedCard });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).send('Data kartu tidak valid');
    }
    return res.status(500).send('Kesalahan saat menghapus Kartu', error);
  }
};

exports.likeCard = async (req, res) => {
  try {
    const updatedCard = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );

    return res.status(200).json(updatedCard);
  } catch (error) {
    return res.status(400).send('Kesalahan dalam like card', error);
  }
};

exports.dislikeCard = async (req, res) => {
  try {
    const updatedCard = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );
    return res.status(200).json(updatedCard);
  } catch (error) {
    return res.status(400).send('Kesalahan dalam unlike card', error);
  }
};
