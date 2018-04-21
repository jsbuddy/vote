import React, { Component } from 'react';
import * as axios from "axios";
import CompetitionViewer from './CompetitionViewer'
import FullPageNav from "../FullPageNav/FullPageNav";
import './Competitions.css';

const client = new window.ClientJS();

class Competitions extends Component {

	state = {
		competitions: [],
		dataLoaded: false,
		failedToLoad: false,
		showCompetition: false,
		showCompetitionData: null,
		remoteAddress: null
	};

	componentWillMount () {
		this.view = this.props.match.params.query;
		document.title = `${this.view === 'active' ? 'Active' : 'Completed'} Competitions`;
		this.loadCompetitions();
		this.browserFingerprint = client.getFingerprint();
	}

	retryLoadCompetitions = () => {
		this.setState({ dataLoaded: false, failedToLoad: false }, () => this.loadCompetitions())
	};

	loadCompetitions = () => {
		return new Promise(resolve => {
			axios({ message: 'GET', url: '/api/competition/all' })
				.then(res => {
					if (res.data.success) {
						this.remoteAddress = res.data.remoteAddress;
						this.setState({ dataLoaded: true, competitions: res.data.competitions }, () => resolve());
					} else this.setState({ dataLoaded: false, failedToLoad: true });
				})
				.catch(err => this.setState({ dataLoaded: false, failedToLoad: true }, () => console.dir(err)))
		})
	};

	storeVote = (vote, competitionId) => {
		localStorage.setItem(`vote${competitionId.toString().substr(-15)}`, JSON.stringify({
			voteId: vote._id,
			contestantId: vote.contestantId,
			competitionId
		}));
	};

	showCompetition = competitions => this.setState({ showCompetition: true, showCompetitionData: competitions });

	closeShowCompetition = () => this.setState({
		showCompetition: false,
		showCompetitionData: null
	}, () => document.title = 'Competitions');

	formatDate = d => {
		const date = new Date(d);
		const days = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
		const months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
		return `${days[ date.getDay() ]} ${months[ date.getMonth() ]} ${date.getFullYear()}`;
	};

	render () {
		const { dataLoaded, failedToLoad, competitions = [], showCompetition, showCompetitionData } = this.state;
		const { browserFingerprint, remoteAddress } = this;
		const active = this.view === 'active';
		// console.log(browserFingerprint, remoteAddress);

		return (
			<div className={"competitions"}>
				<FullPageNav menuItems={[
					{
						name: `${active ? 'Completed' : 'Active'}`,
						to: `/competitions/${active ? 'completed' : 'active'}`
					},
					{ name: 'Admin', to: '/admin' },
					{ name: 'About', to: '/about' }
				]}/>
				{
					dataLoaded ?
						(showCompetition && showCompetitionData) ?
							<CompetitionViewer
								reload={this.loadCompetitions}
								competition={showCompetitionData}
								close={this.closeShowCompetition}
								storeVote={this.storeVote}
							/>
							:
							<div className="competitions">
								<div className="title">
									<h1> {`${this.view} Competitions`}</h1>
								</div>
								<div className="competitions-wrap">
									{
										competitions
											.filter(competition => active ? new Date() < new Date(competition.deadline) : new Date() > new Date(competition.deadline))
											.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
											.map(competition => {
												const top = competition.contestants.sort((a, b) => b.votesCount - a.votesCount)[ 0 ],
													_leading = competition.contestants.filter(contestant =>
															(contestant.votesCount === top.votesCount && contestant.votesCount > 0))
														.map(contestant => contestant.name);
												const leading = `${_leading.length > 0 ? _leading.join(', ') : ''}`;

												const storedVote = JSON.parse(localStorage.getItem(`vote${competition._id.toString().substr(-15)}`));
												return (
													<div className="competition" key={competition._id}
													     onClick={() => this.showCompetition(competition)}>
														<div className="name">
															<h3>{competition.name}</h3>
														</div>
														<div className="contestants">
															<h5><span
																className="r">Contestants:</span> {competition.contestants.length}
															</h5>
															<h5>
																{
																	leading &&
																	<span><span className="r">
																		{active ? 'Winning' : 'Winner'}:</span> {leading}</span>
																}
															</h5>
															<h5>
																{
																	competition.votes.map(vote => {
																		if (
																			vote.browserFingerprint.toString() === browserFingerprint.toString() ||
																			vote.remoteAddress === remoteAddress
																		) {
																			if (!storedVote) {
																				this.storeVote(vote, competition._id);
																			}
																			return (
																				<span key={vote._id}>
																				<span
																					className="r">You voted for:</span> {competition.contestants.filter(contestant => contestant._id === vote.contestantId)[ 0 ].name}
																			</span>
																			)
																		} else {
																			if (storedVote && vote._id === storedVote.voteId) {
																				return (
																					<span key={vote._id}>
																					You voted for {competition.contestants.find(contestant => contestant._id === vote.contestantId).name}
																				</span>
																				)
																			}
																		}
																		return null
																	})
																}
															</h5>
															<h5>
																{
																	new Date() >= new Date(competition.deadline)
																		? <span className="r">Competition Ended</span>
																		: <span>
																		<span className="r">Voting Ends:
																		</span> {this.formatDate(competition.deadline)}
																	</span>
																}
															</h5>
														</div>
													</div>
												)
											})
									}
								</div>
								{
									active && competitions
										.filter(competition => new Date() < new Date(competition.deadline)).length < 1 &&
									<div className="null">
										<h3>No Active Competition</h3>
									</div>
								}
								{
									!active && competitions
										.filter(competition => new Date() > new Date(competition.deadline)).length < 1 &&
									<div className="null">
										<h3>No Completed Competition</h3>
									</div>
								}
							</div>
						:
						(
							failedToLoad ?
								<div className={"failed"}>
									<h4>Failed to Load Competitions<br/>Please Try Again!</h4>
									<button onClick={this.retryLoadCompetitions}>Retry</button>
								</div>
								:
								<div className="pre-loader">
									<div className="spinner"/>
								</div>
						)
				}
			</div>
		);
	}
}


export default Competitions;
