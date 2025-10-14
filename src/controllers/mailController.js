const transporter = require('../config/nodemailer');

exports.sendMail = async ({ to, subject, text }) => {
  try {
    const info = await transporter.sendMail({
      from: '"Auth App" <sophiyastanish1@gmail.com>',
      to,
      subject,
      text,
    });

    return info;
  } catch (err) {
    throw new Error(err.message);
  }
};
