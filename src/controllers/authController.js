const User = require('../models/User');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const mailController = require('./mailController');

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const activationToken = uuidv4();

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const activationLink = `http://localhost:3000/auth/activate/${activationToken}`;

    await mailController.sendMail({
      to: email,
      subject: 'Активація акаунту',
      text: `Привіт, ${name}! Перейдіть за посиланням для активації акаунту: ${activationLink}`,
    });

    res.json({
      message: 'Користувача створено. Перевірте email для активації.',
    });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createUser,
};
