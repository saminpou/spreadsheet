import React from 'react'
import PropTypes from 'prop-types'
import Row from './Row'
import { Parser as FormulaParser } from 'hot-formula-parser'
import { toposort, extractLabel, isExpr } from './helper'

const letters = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

export default class DataTable extends React.Component {
    constructor(props) {
        super(props)

        let data = {}
        let labels = new Set([])

        for (let i = 1; i < props.y + 1; i++) {
            for (let j = 1; j < props.x + 1; j++) {
                labels.add(letters[j]+i)
                if (i in data) {
                    data[i][j] = { value: '', input: '' }
                } else {
                    data[i] = {}
                    data[i][j] = { value: '', input: '' }
                }
            }
        }

        this.state = {
            labels: labels,
            data: data,
            x: props.x,
            y: props.y
        }

        this.getDisplay = this.getDisplay.bind(this)
        this.getGraph = this.getGraph.bind(this)
        this.getValue = this.getValue.bind(this)
        this.parser = new FormulaParser()

        this.parser.on('callCellValue', (cellCoord, done) => {
            const x = cellCoord.column.index + 1
            const y = cellCoord.row.index + 1

            if (this.parser.cell.x === x && this.parser.cell.y === y) {
                throw this.parser.Error(this.parser.ERROR_REF)
            }

            if (!this.state.data[y] || !this.state.data[y][x]) {
                return done('')
            }
            return done(this.state.data[y][x].value)
        })
    }

    getGraph = () => {
        let graph = []
        for (let i = 1; i < this.state.y + 1; i++) {
            for (let j = 1; j < this.state.x + 1; j++) {
                let input = this.state.data[i][j].input
                // If the value is an expession
                if (isExpr(input)) {
                    this.parser.cell = { x: j, y: i }
                    let res = this.parser.parse(this.state.data[i][j].input.substr(1))
                    // If the equation is valid add the edges to our list (only works for simple inputs)
                    if (res.error === null) {
                        const start = this.state.data[i][j].input.indexOf('(') + 1
                        const end = this.state.data[i][j].input.indexOf(')')
                        let s = this.state.data[i][j].input.substring(start, end).replace(/ /g, '')
                        let array = s.split(',')
                        for (let k = 0; k < array.length; k++) {
                            if (this.state.labels.has(array[k])){
                                graph.push([array[k], letters[j] + i])
                            }
                        }
                    }
                }
            }
        }
        return graph
    }

    getDisplay = (x, y, input) => {
        const modifiedData = Object.assign({}, this.state.data)
        modifiedData[y][x].input = input

        //If its not an expression, we can just set the value to it immediately
        if (!isExpr(input)) {
            modifiedData[y][x].value = input
        }else{
            //Otherwise, we immediatly evaluate it
            this.parser.cell = { x: x, y: y }
            let res = this.parser.parse(modifiedData[y][x].input.substr(1))
            if (res.result == null ){
                modifiedData[y][x].value = res.error
            }else{
                modifiedData[y][x].value = res.result
            }
        }
        //Compute all edges of the graph
        let graph = this.getGraph()

        //Compute the topological sort
        let nodes = null
        try {
            nodes = toposort(graph)
        } catch (err) {
            //There is a cycle
            modifiedData[y][x].value = "ERROR"
            this.setState({ data: modifiedData })
            return modifiedData[y][x].value
        }

        //For each node, determine the coordinates and evaluate the expression
        for (let k = 0; k < nodes.length; k++) {
            let coord = extractLabel(nodes[k])

            let i = coord[0].index + 1
            let j = coord[1].index + 1

            this.parser.cell = { x: j, y: i }

            if (isExpr(modifiedData[i][j].input)) {
                let res = this.parser.parse(modifiedData[i][j].input.substr(1))
                modifiedData[i][j].value = res.result
            }
        }

        this.setState({ data: modifiedData })
        return modifiedData[y][x].value
    }

    getValue(x,y){
        return this.state.data[y][x].value
    }

    render() {
        const rows = []

        for (let i = 0; i < this.props.y + 1; i += 1) {
            let r_data = ''
            // If the value is not a header column, then give the data
            if (i in this.state.data) {
                r_data = this.state.data[i]
            } else {
                r_data = ''
            }
            rows.push(
                <Row
                    key={i}
                    y={i}
                    x={this.props.x}
                    data={r_data}
                    getDisplay={this.getDisplay}
                    getValue={this.getValue}
                />,
            )
        }

        return (

            <div>
                {rows}
            </div>
        )
    }
}

DataTable.propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
}