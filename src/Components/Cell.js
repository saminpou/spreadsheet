import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.css';

export default class Cell extends React.Component{
  
  constructor(props) {
    super(props)
    this.state = {
      isSelected: false,
      value: props.value,
      input: props.input,
      x: props.x,
      y: props.y,
    }
  }
  
  //Flip my bool to convert to input box
  onClick(e){
    this.setState({isSelected: true})
  }

  onChange(e){
    this.setState({input: e.target.value})
  }

  //When I deselect a value, I want to set my true value. Do calculations later
  onBlur = (e) => {
      let value = this.props.getDisplay(
        this.state.x,
        this.state.y,
        this.state.input
      )
      this.setState({ isSelected: false, value: value })
  }

  componentWillReceiveProps() {
    if (this.state.x > 0 && this.state.y > 0){
      let value = this.props.getValue(this.state.x, this.state.y)
      this.setState({ value: value })
    }
  }

  render() {
    // The elem is the top left elem on the screen
    if (this.state.x === 0 && this.state.y === 0){
      return (
      <span type="text" className="cell">
        {''}
      </span>
      );
    }

    if (this.state.x === 0){
      return (
      <span type="text" className="cell">
        {this.state.y}
      </span>
      );
    }

    if (this.state.y === 0){
      const letters = ['','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
      return (
      <span type="text" className="cell">
        {letters[this.state.x]}
      </span>
      );
    }

    if (this.state.isSelected){
      return (
          <input
            type="text"
            className="cell"
            onBlur={e => this.onBlur(e)}
            value={this.state.input}
            onChange={e => this.onChange(e)}
          />
      );
    }else{
      return (
          <span
            type="text"
            className="cell"
            onClick={e => this.onClick(e)}
          >
            {this.state.value}
          </span>
      );
    }
  }
}

Cell.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  getDisplay: PropTypes.func.isRequired,
  getValue: PropTypes.func.isRequired,
};

