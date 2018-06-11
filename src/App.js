import React, { Component } from 'react';
import './App.css';
import DataTable from './Components/DataTable'

class App extends Component {
  render() {
    return (
      <div className="App">
        <DataTable x={7} y={12} />
      </div>
    );
  }
}

export default App;
