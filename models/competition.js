const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

const CompetitionSchema = new Schema({
	name: { type: String, require: true, unique: true },
	deadline: { type: Date, required: true },
	contestants: [
		{
			name: { type: String },
			imageUrl: { type: String },
			votesCount: { type: Number, default: 0 }
		}
	],
	votes: [
		{
			contestantId: { type: String },
			remoteAddress: { type: String },
			browserFingerprint: { type: String }
		}
	],
	active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Competition', CompetitionSchema);
