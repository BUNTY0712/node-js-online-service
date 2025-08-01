import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		id: {
			type: Number,
			unique: true,
			index: true,
		},
		fullname: {
			type: String,
		},
		phone: {
			type: String,
		},
		email: {
			type: String,
		},
		city: {
			type: String,
		},
		user_type: {
			type: String,
		},
		password: {
			type: String,
		},
		confirm_password: {
			type: String,
		},
		// Add fields for password reset
		resetPasswordToken: {
			type: String,
			default: undefined,
		},
		resetPasswordExpires: {
			type: Date,
			default: undefined,
		},
		trial_end: {
			type: Date,
			default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
		},
		is_subscribed: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	}
);

userSchema.pre('save', async function (next) {
	try {
		if (!this.isNew) {
			return next(); // If not a new document, skip auto-increment logic
		}
		const latestid = await this.constructor.findOne(
			{},
			{},
			{ sort: { id: -1 } }
		); // Find the document with the highest id
		if (latestid) {
			this.id = latestid.id + 1; // Increment the id
		} else {
			this.id = 1;
		}
		next();
	} catch (error) {
		console.error(error); // Log the error
		next(error);
	}
});

const userModel = mongoose.model('User', userSchema);

export default userModel;
