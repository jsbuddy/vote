import React, { Component } from 'react';
import './About.css';

class About extends Component {
	render () {
		return (
			<div className={"About"}>
				<div className="container">
					<div className="title">
						<h1>About Us</h1>
					</div>
					<div className="content">
						<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab eligendi exercitationem fugit harum possimus? Accusamus atque maiores officia quasi vel.</p>
					</div>
				</div>
			</div>
		);
	}
}

export default About;
