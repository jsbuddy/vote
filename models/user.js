const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	bcrypt = require('bcrypt-nodejs');

const UserSchema = new Schema({
	email: { type: String, lowercase: true, unique: true, required: true },
	password: { type: String, required: true },
	profile: {
		firstName: { type: String },
		lastName: { type: String }
	},
	resetPasswordToken: { type: String },
	resetPasswordExpires: { type: Date }
}, { timestamps: true });

// Pre-save of user to database, hash password if password is modified or new
UserSchema.pre('save', function (next) {
	const user = this,
		SALT_FACTOR = 5;

	if (!user.isModified('password')) return next();

	bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
		if (err) return next(err);

		bcrypt.hash(user.password, salt, null, function (err, hash) {
			if (err) return next(err);
			user.password = hash;
			next();
		});
	});
});

// Method to compare password for login
UserSchema.methods.comparePassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);