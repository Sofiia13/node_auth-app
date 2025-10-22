const User = require('../models/User');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const mailController = require('./mailController');
const usersRepository = require('../services/usersRepository');

require('dotenv').config();

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

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

    const existingUser = await usersRepository.getByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(400).json({
        errors: { email: 'Email is already taken' },
        message: 'Validation error',
      });
    }

    const activationToken = uuidv4();

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password,
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

    if (!user) {
      return res.status(400).send('Invalid activation link');
    }

    user.activationToken = null;
    user.isActive = true;
    await user.save({ fields: ['activationToken', 'isActive'] });

    res.send('Акаунт активовано!');

    res.send('Акаунт активовано!');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();


    const user = await usersRepository.getByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials (no user)' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account not activated' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: 'Invalid credentials (wrong password)' });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createUser,
  activateAccount,
  login,
};
