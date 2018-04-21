import React, { Component } from 'react';
import './App.css';
import { Route } from 'react-router-dom';
import Competitions from './Components/Competitions/Competitions'
import Admin from "./Components/Admin/Admin";
import AdminLogin from "./Components/Admin/Login";
import About from "./Components/About/About";

class App extends Component {
	render () {
		return (
			<div className="App">
				<Route path={'/'} component={r => {
					r.history.replace('/competitions/active');
					return null
				}} exact/>
				<Route path={'/competitions'} component={r => {
					r.history.replace('/competitions/active');
					return null
				}} exact/>
				<Route path={'/competitions/:query'} component={r => {
					return r.match.params.query.toString().toLowerCase().match(/^active|completed$/)
						? <Competitions location={r.location} match={r.match}/>
						: null
				}} exact/>
				<Route path={'/about'} component={About} exact/>
				<Route path={'/admin'} component={Admin} exact/>
				<Route path={'/admin/login'} component={AdminLogin}/>
			</div>
		);
	}
}

export default App;
