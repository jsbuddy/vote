import React, { Component } from 'react';
import Button from "../Reusable/Button";
import * as axios from "axios";

const client = new window.ClientJS();

class CompetitionViewer extends Component {
	state = {
		processing: false,
		competition: null,
		ended: false
	};

	componentWillMount () {
		const { competition } = this.props;
		document.title = competition.name ? competition.name : 'Competition';
		this.setState({ ended: new Date() > new Date(competition.deadline) })
	}

	handleVote = contestant => {
		this.setState({ processing: true });
		const { competition } = this.props;
		axios({
			method: 'POST',
			url: '/api/competition/vote',
			data: {
				browserFingerprint: client.getFingerprint(),
				competitionId: competition._id,
				contestantId: contestant._id
			}
		})
			.then(res => {
				this.props.reload()
					.then(() => {
						res.data.vote && this.props.storeVote(res.data.vote, res.data.competition._id);
						this.setState({ processing: false, competition: res.data.competition, ended: res.data.ended });
					})
			})
			.catch(err => this.setState({ processing: false }, () => console.log(err)))
	};

	render () {
		const { processing, ended } = this.state;
		const { close } = this.props;
		const competition = this.state.competition || this.props.competition;

		return (
			<div className={"CompetitionViewer"}>
				<div className="contestants">
					<div className="title">
						<Button text={"Back"} onClick={close}/>
						<h1>{competition.name}</h1>
					</div>
					{
						(competition.contestants || [])
							.sort((a, b) => b.votesCount - a.votesCount)
							.map(contestant => {
								const storedVote = JSON.parse(localStorage.getItem(`vote${competition._id.toString().substr(-15)}`));
								let voted = false;
								let voteId = null;
								if (storedVote) {
									competition.votes.forEach((vote) => {
										if (vote._id === storedVote.voteId) {
											voteId = vote._id;
											if (storedVote.competitionId === competition._id && storedVote.contestantId === contestant._id) {
												voted = true;
											}
										}
									});
								}
								return (
									<section className="contestant" key={contestant._id}>
										<div className="image">
											<div className="wrap"
											     style={{ backgroundImage: contestant.imageUrl ? `url('${contestant.imageUrl}')` : '' }}>
											</div>
										</div>
										<div className="details">
											<div className="content">
												<div className="name">
													<h2>{contestant.name}</h2>
												</div>
												<div className={'button-group'}>
													{
														!voteId && !ended &&
														<Button text={"Vote"} loading={processing} disabled={processing}
														        onClick={() => this.handleVote(contestant)}/>
													}
													{
														storedVote && voted && <Button text={"Voted"} disabled={true}/>
													}
													<span
														className={`count ${storedVote && voted && 'voted'}`}>{contestant.votesCount}</span>
												</div>
											</div>
										</div>
									</section>
								)
							})
					}
				</div>
			</div>
		);
	}
}

export default CompetitionViewer;
