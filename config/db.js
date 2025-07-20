import mongoose from 'mongoose';

const connectDB = async () => {
	try {
		// Remove deprecated options
		const conn = await mongoose.connect(process.env.DB_URI);
		console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline);
	} catch (error) {
		console.error(`Error: ${error.message}`.red);
		process.exit(1);
	}
};

export default connectDB;
