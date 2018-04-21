import React, { Component } from 'react';
import './Login.css';
import Button from '../Reusable/Button';
import * as axios from "axios";

class AdminLogin extends Component {

	state = {
		error: '',
		processing: false,
		notLoggedIn: false
	};

	componentWillMount () {
		this.confirmUser()
	}

	confirmUser = () => {
		axios({
			method: 'GET',
			url: '/api/auth/confirm',
			headers: { Authorization: JSON.parse(localStorage.getItem('token')) }
		}).then(res => {
			if (res.data.success) this.props.history.replace('/admin');
			else this.setState({ notLoggedIn: true })
		}).catch(() => this.setState({ notLoggedIn: true }))
	};

	handleSubmit = e => {
		e.preventDefault();
		this.setState({ processing: true });
		let err = false;
		const form = Array.from(e.target);
		const data = form.reduce((all, el) => {
			if (el.nodeName !== 'BUTTON') {
				if (el.value.toString().trim() === '') err = true;
				all[ el.name ] = el.value
			}
			return all
		}, {});

		if (err) return this.setError('Email address and password is required');

		axios({
			method: 'POST',
			url: '/api/auth/login',
			data
		}).then(res => {
			if (res.data.success) {
				this.setState({ processing: false, error: '' });
				const token = res.data.token;
				localStorage.clear();
				localStorage.setItem('token', JSON.stringify(token));
				this.props.history.push('/admin')
			} else this.setError(res.data.message)
		}).catch(err => this.setError(err.response.data.message))
	};

	setError = error => this.setState({ error, processing: false });

	render () {
		const { error, processing, notLoggedIn } = this.state;
		return (
			<div className={"AdminLogin"}>
				{
					notLoggedIn &&
					<div className="login-wrap">
						<h3 className={"title"}>Admin Login</h3>
						{
							error ?
								<div className="error">
									<div className="message">
										{error}
									</div>
								</div>
								:
								<hr/>
						}
						<form onSubmit={this.handleSubmit}>
							<input name={"email"} type={"text"} disabled={processing} placeholder={"Email Address"}
							       autoFocus={true}/>
							<input name={"password"} type={"password"} disabled={processing} placeholder={"Password"}/>
							<Button type={"submit"} className={"block"} text={"Login"} loading={processing} disabled={processing}/>
						</form>
					</div>
				}
			</div>
		);
	}
}

export default AdminLogin;
