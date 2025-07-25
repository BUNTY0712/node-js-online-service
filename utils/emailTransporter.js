import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	service: 'gmail', // or your email provider
	auth: {
		user: process.env.EMAIL_USER, // your email
		pass: process.env.EMAIL_PASS, // your email password or app password
	},
});

export default transporter;
