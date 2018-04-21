import React, { Component } from 'react';
import './Button.css';

class Button extends Component {
	render () {
		const { text = 'Button', loading = false, disabled = false, className = '', type = 'button', onClick } = this.props;
		return (
			<button className={`Button ${className}`} disabled={disabled} type={type} onClick={onClick}>
				{ loading ? <span className="loading"/> : text }
			</button>
		);
	}
}

export default Button;
