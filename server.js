import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import job from './config/cron.js'; // Import the cron job

// Load environment variables first
dotenv.config();

// Only start cron job in production or if API_URL is set
if (process.env.NODE_ENV === 'production' || process.env.API_URL) {
	try {
		job.start(); // Start the cron job
		console.log('✅ Cron job started for keep-alive pings'.green.bold);
		console.log(
			`🔄 Keep-alive pings will be sent every 14 minutes to: ${process.env.API_URL}`
				.yellow
		);
	} catch (error) {
		console.error('❌ Failed to start cron job:', error.message);
	}
} else {
	console.log('⚠️  Cron job disabled for local development'.yellow);
}

import colors from 'colors';
import cors from 'cors';
const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';

app.get('/', (req, res) => {
	res.send('API is running...');
});

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// 404 middleware - must be after all routes
app.use((req, res, next) => {
	res.status(404).send({ message: 'Route not found' });
});

// Error handling middleware - must be last
app.use((err, req, res, next) => {
	const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
	res.status(statusCode).send({
		message: err.message,
		stack: process.env.NODE_ENV === 'production' ? null : err.stack,
	});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(
		`Server running in ${
			process.env.DEV_MODE ? 'development' : 'production'
		} mode on port ${PORT}`.yellow.bold
	);
});
console.log('Server is running...'.green.bold);
export default app;
