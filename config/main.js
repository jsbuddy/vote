const normalizePort = port => parseInt(port, 10);
const secret = require('crypto').randomBytes(256).toString('hex');

module.exports = {
	secret,
	database: {
		uri: 'mongodb://127.0.0.1:27017/vote'
	},
	port: normalizePort(process.env.PORT || 2000)
};
