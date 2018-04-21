const AuthenticationController = require('../controllers/authentication'),
	CompetitionController = require('../controllers/competition'),
	express = require('express');

module.exports = app => {
	const apiRoutes = express.Router(),
		authRoutes = express.Router(),
		competitionRoutes = express.Router();

	apiRoutes.use('/auth', authRoutes);
	apiRoutes.use('/competition', competitionRoutes);

	authRoutes.post('/register', AuthenticationController.register);
	authRoutes.post('/login', AuthenticationController.login);
	authRoutes.get('/confirm', AuthenticationController.confirm);

	competitionRoutes.post('/', CompetitionController.create);
	competitionRoutes.get('/all', CompetitionController.getAllCompetitions);
	competitionRoutes.post('/vote', CompetitionController.vote);
	app.use('/api', apiRoutes);
};
