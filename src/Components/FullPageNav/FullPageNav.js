import React, { Component } from 'react';
import { Link } from "react-router-dom";
import './FullPageNav.css';

class FullPageNav extends Component {

	toggleMenu = () => {
		const { menu, toggler } = this.refs;
		if (menu.classList.contains('show')) {
			toggler.classList.remove('open');
			menu.classList.add('animate-out');
		}
		else {
			toggler.classList.add('open');
			menu.classList.add('show');
			menu.classList.add('animate-in');
		}
	};

	animationEnded = e => {
		const { menu } = this.refs;
		if (e.animationName === 'scale-out') {
			menu.classList.remove('show');
			menu.classList.remove('animate-in');
			menu.classList.remove('animate-out');
		} else if (e.animationName === 'scale-in') {
			menu.classList.remove('animate-in');
		}
	};

	render () {
		const { menuItems = [], toggleStyle = 'dark' } = this.props;
		return (
			<div>
				<div ref={"toggler"} className={`menu-toggler ${toggleStyle}`} onClick={this.toggleMenu}>
					<div className="bar"/>
				</div>
				<div ref={"menu"} className={`full-page-menu`} onAnimationEnd={this.animationEnded}>
					<div className="menu-items">
						{
							menuItems.map((menuItem, i) => <Link key={i} to={menuItem.to} className="menu-item">{menuItem.name}</Link>)
						}
					</div>
				</div>
			</div>
		);
	}
}

export default FullPageNav;
