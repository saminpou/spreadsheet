import React from 'react'
import PropTypes from 'prop-types'
import Cell from './Cell'

const Row = (props) => {
  const cells = []
  
  for (let j = 0; j < props.x + 1; j += 1) {
    let key = props.y + '-' + j
    let value = ''
    let input = ''
    if(j !== 0 && props.y !== 0){
        value = props.data[j].value
        input = props.data[j].input
    }

    cells.push(
      <Cell
        key={key}
        y={props.y}
        x={j}
        value={value}
        input={input}
        getDisplay = {props.getDisplay}
        getValue={props.getValue}
      />,
    )
  }

  return (
    <div>
      {cells}
    </div>
  )

}

Row.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  getDisplay: PropTypes.func.isRequired,
  getValue: PropTypes.func.isRequired,
}

export default Row