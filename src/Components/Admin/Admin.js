import React, { Component } from 'react';
import * as axios from "axios";
import Button from "../Reusable/Button";
import FullPageNav from "../FullPageNav/FullPageNav";
import './Admin.css';

class Admin extends Component {

	state = {
		user: null,
		contestantsLength: 0,
		alert: {
			message: '',
			intent: ''
		},
		processing: false
	};

	componentWillMount () {
		this.confirmUser()
	}

	confirmUser = () => {
		axios({
			method: 'GET',
			url: '/api/auth/confirm',
			headers: {
				Authorization: JSON.parse(localStorage.getItem('token'))
			}
		}).then(res => {
			if (res.data.success) {
				this.setState({ user: res.data.user })
			}
			else this.props.history.replace('/admin/login');
		}).catch(() => this.props.history.replace('/admin/login'))
	};

	initCompetition = e => {
		e.preventDefault();
		let err = false;
		const form = Array.from(e.target);

		const data = form.reduce((all, el) => {
			if (el.nodeName !== 'BUTTON') {
				if (el.value.toString().trim() === '') err = true;
				all[ el.name ] = el.value.toString().trim()
			}
			return all
		}, {});

		if (new Date() >= new Date(data.deadline)) return this.alert('Deadline cannot be in the past');
		if (err) return this.alert('All fields are required');

		this.setState({ contestantsLength: data.contestantsLength }, () => {
			this.alert('', null);
			this.data = data
		});
	};

	showAddNewContestants = n => {
		const elements = [];
		for (let i = 0; i < n; i++) {
			elements.push(
				<div className="content">
					<div className="name">
						<input className={"contestant-name"} type="text" placeholder="Contestant Name"/>
					</div>
					<div className="image">
						<input type="file" id={`file-input${i + 1}`} className="file-input" accept="image/*"
						       onChange={this.handleFileInputChange}/>
						<label htmlFor={`file-input${i + 1}`}>Choose an Image</label>
					</div>
					<p className={"or"}>or</p>
					<div className="name">
						<input className={"contestant-imageUrl"} type="url" placeholder="Image Url"/>
					</div>
				</div>
			)
		}
		return elements;
	};

	handleFileInputChange = e => {
		const el = e.target;
		if (el.files.length < 1) {
			el.nextElementSibling.textContent = 'Choose a file..';
			return
		}
		el.nextElementSibling.textContent = el.files.length > 1 ? `${el.files.length} Files` : el.files[ 0 ].name;
	};

	alert = (message, intent) => this.setState({ alert: { message, intent }, processing: false });

	createCompetition = () => {
		let err = false;
		this.setState({ processing: true, alert: { message: '' } });
		const contestantsArr = [ ...this.refs.contestants.children ];
		const contestants = contestantsArr.reduce((all, el) => {
			const name = el.querySelector('.contestant-name').value,
				imageUrl = el.querySelector('.contestant-imageUrl').value,
				image = el.querySelector('.file-input').files[ 0 ];
			if (name.toString().trim() === '' || (!image && imageUrl.toString().trim() === '')) err = true;
			all.push({ name, imageUrl, image: '' });
			return all
		}, []);

		if (err) return this.alert('Please fill in all fields');

		axios({
			method: 'POST',
			url: '/api/competition',
			headers: { Authorization: JSON.parse(localStorage.getItem('token')) },
			data: { ...this.data, contestants }
		}).then(res => {
			if (res.data.success) {
				this.alert(res.data.message, 'success');
				this.reset();
			} else this.alert(res.data.message);
		}).catch(err => this.alert(err.response.data.message))
	};

	reset = () => {
		this.refs.initForm.reset();
		this.setState({ contestantsLength: 0, processing: false });
		this.data = null;
	};

	render () {
		const { user, contestantsLength, alert, processing } = this.state;

		return (
			<div className={"Admin"}>
				{
					user &&
					<div className="admin">
						<FullPageNav
							menuItems={[
								{ name: 'Competitions', to: '/competitions' },
								{ name: 'About', to: '/about' }
							]}
							toggleStyle={'light'}
						/>
						<div className="top">
							<form onSubmit={this.initCompetition} ref={"initForm"}>
								<div className="inline">
									<input name={"name"} type="text" placeholder="Competition Name"/>
									<input name={"deadline"} type="date" placeholder="Deadline"
									       title={"Deadline for Voters"}/>
									<input name={"contestantsLength"} type="number" placeholder="No. of Contestants"
									       min="2"/>
									<Button text={"Save"} type={"submit"} disabled={processing}/>
								</div>
							</form>
						</div>
						<div className="bottom">
							{
								alert.message &&
								<div className={`alert ${alert.intent || 'error'}`}>
									<div className="content">
										{alert.message}
									</div>
								</div>
							}
							<div className="new-contestants" ref={"contestants"}>
								{
									this.showAddNewContestants(contestantsLength).map((el, i) => {
										return <div key={i} className={"new-contestant"}>{el}</div>
									})
								}
							</div>
							{
								contestantsLength > 1 &&
								<div className="create-competition">
									<Button loading={processing} type={"submit"} text={"Create Competition"}
									        onClick={this.createCompetition} disabled={processing}/>
								</div>
							}
						</div>
					</div>
				}
			</div>
		);
	}
}

export default Admin;
