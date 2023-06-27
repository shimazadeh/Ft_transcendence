import { CSSProperties, Component } from 'react';

interface Props {
	width?: string;
	minWidth?: string;
	height?: string;
	minHeight?: string;
	alignItems?: string;
	padding?: string;
	margin?: string;
	gap?: string;
	backgroundColor?: string;
	borderRadius?: string;
	borderBottom?: string;
	borderRight?: string;
	overflow?: string;
	direction?: "row" | "column";
	children?: React.ReactNode;
}

class Cont extends Component<Props> {
	render() {
		const {backgroundColor, padding, margin, direction,
			   width, minWidth, height, gap, overflow,
			   alignItems, borderBottom, borderRight, minHeight,
			   borderRadius, children} = this.props;

		const ContStyle: CSSProperties = {
			backgroundColor: backgroundColor ? backgroundColor : 'none',
			padding: padding ? padding : '5px',
			margin: margin ? margin : 'none',
    		width: width ? width : 'none',
   			height: height ? height : 'none',
    		borderRadius: borderRadius ? borderRadius : 'none',
			borderBottom: borderBottom? borderBottom : 'none',
			borderRight: borderRight ? borderRight : 'none',
			display: "flex",
			flexDirection: direction ? direction : "column",
			alignItems: alignItems ? alignItems : "flex-start",
			minWidth: minWidth ? minWidth : 'none',
			minHeight: minHeight ? minHeight :'none',
			gap: gap ? gap : 'none',
			overflow: overflow ? overflow : 'none'
		}
		return (
			<div style={ContStyle}> {children}</div>
		);
	}
}

class HeaderBar extends Component<Props> {
	render() {
		const {backgroundColor, padding, width, height, borderRadius, borderBottom, children} = this.props;

		const HeaderStyle: CSSProperties = {
			backgroundColor: backgroundColor ? backgroundColor : 'none',
			padding: padding ? padding : '5px',
    		opacity: 1,
    		width: width ? width : '99%',
   			height: height ? height : '70px',
    		borderRadius: borderRadius ? borderRadius : 'none',
			borderBottom: borderBottom? borderBottom : 'none',
			display: "flex",
			flexDirection: "row",
			alignItems: "flex-start"
		}
		return (
			<div style={HeaderStyle}> {children}</div>
		);
	}
}

export {Cont, HeaderBar};