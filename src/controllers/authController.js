const User = require('../models/User');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const mailController = require('./mailController');
const usersRepository = require('../services/usersRepository');

require('dotenv').config();

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const errors = {
      email: usersRepository.validateEmail(email),
      password: usersRepository.validatePassword(password),
    };

    if (Object.values(errors).some((error) => error)) {
      return res.status(400).json({
        errors,
        message: 'Validation error',
      });
    }

    const existingUser = await usersRepository.getByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        errors: { email: 'Email is already taken' },
        message: 'Validation error',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const activationToken = uuidv4();

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      activationToken,
    });

    const activationLink = `http://${process.env.API_URL}/auth/activate/${activationToken}`;

    await mailController.sendMail({
      to: email,
      subject: 'Активація акаунту',
      text: `Привіт, ${name}! Перейдіть за посиланням для активації акаунту: ${activationLink}`,
    });

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const activateAccount = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ where: { activationToken: token } });

    if (!user) return res.status(400).send('Invalid activation link');

    user.activationToken = null;
    await user.save();

    res.send('Акаунт активовано!');

    res.redirect('/profile');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = {
  createUser,
  activateAccount,
};
