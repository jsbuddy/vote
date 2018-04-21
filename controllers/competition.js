const Competition = require('../models/competition');

module.exports.create = (req, res, next) => {
	const { name, deadline, contestants } = req.body;

	if (isEmpty(name) || isEmpty(deadline) || [ ...contestants ].length < 2) return res.status(422).json({
		success: false,
		message: 'Incomplete data'
	});
	const data = {
		name: name.toString().trim(),
		deadline: deadline.toString().trim(),
		contestants
	};
	const competition = new Competition(data);
	competition.save()
		.then(competition => res.status(200).json({ success: true, message: 'Competition Created', competition }))
		.catch(err => {
			if (err.code === 11000) {
				if (err.message.includes('name')) return res.status(422).json({
					success: false,
					message: 'Competition with that name already exists'
				});
			}
			next(err)
		})
};

module.exports.getAllCompetitions = (req, res, next) => {
	const remoteAddress = req.ip;
	Competition.find().exec()
		.then(competitions => res.status(200).json({ success: true, competitions, remoteAddress }))
		.catch(err => next(err))
};

module.exports.vote = (req, res, next) => {
	const { competitionId, contestantId, browserFingerprint } = req.body;
	const remoteAddress = req.ip;
	let voted = false;
	let storedVote;

	Competition.findById(competitionId).exec()
		.then(competition => {
			const ended = new Date() > new Date(competition.deadline);
			if (competition.votes.length > 0) {
				const canVote = competition.votes.reduce((canVote, vote, i) => {
					if (
						vote.remoteAddress.toString().trim() === remoteAddress.toString().trim() ||
						vote.browserFingerprint.toString().trim() === browserFingerprint.toString().trim()
					) {
						competition.votes[ i ].remoteAddress = remoteAddress;
						competition.votes[ i ].browserFingerprint = browserFingerprint;
						canVote = false;
						storedVote = vote;
					}
					return canVote
				}, true);
				if (canVote) {
					if (!ended) {
						competition.votes.push({ contestantId, browserFingerprint, remoteAddress });
						voted = true;
					}
				}
			} else {
				if (!ended) {
					competition.votes.push({ contestantId, browserFingerprint, remoteAddress });
					voted = true;
				}
			}
			competition.contestants.forEach((contestant, i) => {
				competition.contestants[ i ].votesCount = 0;
				competition.votes.forEach(vote => {
					if (contestant._id.toString() === vote.contestantId.toString()) {
						competition.contestants[ i ].votesCount++;
					}
				});
			});
			competition.save();
			const vote = (voted ? competition.votes[ competition.votes.length - 1 ] : storedVote) || null;
			res.status(200).json({ success: voted, competition, vote, ended });
		})
		.catch(err => next(err));
};

function isEmpty (arg) {
	if (arg === undefined || arg === null) return true;
	return arg.toString().trim() === '';
}
