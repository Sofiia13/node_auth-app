const User = require('../models/User');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const mailController = require('./mailController');
require('dotenv').config();

function validateEmail(email) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) return 'Email is required';
  if (!emailPattern.test(email)) return 'Email is not valid';
}

function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'At least 6 characters';
}

function getByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const errors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    if (Object.values(errors).some((error) => error)) {
      return res.status(400).json({
        errors,
        message: 'Validation error',
      });
    }

    const existingUser = await getByEmail(email);

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

module.exports = {
  createUser,
};
