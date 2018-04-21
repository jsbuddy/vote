const jwt = require('jsonwebtoken'),
	User = require('../models/user'),
	config = require('../config/main');

exports.confirm = (req, res, next) => {
	const token = req.headers['authorization'].split(' ')[1];
	jwt.verify(token, config.secret, (err, decoded) => {
		if (err) return res.status(401).json({ success: false, message: 'Unauthorized '});
		User.findById(decoded._id).exec()
			.then(user => {
				if (user) res.status(200).json({ success: true, user });
				else res.status(401).json({ success: false, message: 'Unauthorized '})
			})
			.catch(err => next(err))
	})
};

exports.login = (req, res, next) => {
	const { email, password } = req.body;
	if (isEmpty(email) || isEmpty(password)) return res.status(422).json({
		success: false,
		message: 'Incomplete Data'
	});

	User.findOne({ email }).exec()
		.then(user => {
			if (user) {
				const isMatch = user.comparePassword(password);
				if (isMatch) {
					const userInfo = setUserInfo(user);
					res.status(200).json({
						success: true,
						token: 'JWT ' + generateToken(userInfo),
						user: userInfo
					});
				} else res.status(422).json({ success: false, message: 'Incorrect Password' })
			} else res.status(422).json({ success: false, message: 'Incorrect Credentials' })
		})
		.catch(err => next(err))

};

exports.register = (req, res, next) => {
	const { email, firstName, lastName, password } = req.body;

	if (isEmpty(email) || isEmpty(password)) return res.status(422).json({
		success: false,
		message: 'Incomplete data'
	});

	const user = new User({
		email: email.toString().trim(),
		password: password.toString().trim(),
		profile: {
			firstName: firstName.toString().trim(),
			lastName: lastName.toString().trim()
		}
	});

	user.save()
		.then(user => {
			const userInfo = setUserInfo(user);
			res.status(201).json({
				success: true,
				token: 'JWT ' + generateToken(userInfo),
				user: userInfo,
			});
		})
		.catch(err => {
			if (err.code === 11000) {
				if (err.message.includes('email')) return res.status(422).json({
					success: false,
					message: 'Email address already in use'
				});
			}
			next(err)
		});
};

function generateToken (user) {
	return jwt.sign(user, config.secret, {
		expiresIn: 10080 // in seconds
	});
}

function setUserInfo (request) {
	return {
		_id: request._id,
		firstName: request.profile.firstName,
		lastName: request.profile.lastName,
		email: request.email
	};
}

function isEmpty (arg) {
	if (arg === undefined || arg === null) return true;
	return arg.toString().trim() === '';
}

//TODO next(err)