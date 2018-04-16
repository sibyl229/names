import React, { Component } from 'react';
import { Route , Link } from 'react-router-dom';
import 'typeface-roboto';
import { createMuiTheme, MuiThemeProvider } from './components/elements';
import {startMock, stopMock} from './mock';
import logo from './logo.svg';
import wormbaseLogo from './logo_wormbase_solid.svg';
import './App.css';

const theme = createMuiTheme({
});

class App extends Component {
  componentDidMount() {
    startMock();
    fetch('/aaaa').then(function(data) {
      console.log('got data', data);
    });
  }

  componentWillUnmount() {
    stopMock();
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <p>a header and sidebar</p>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/gene/new">Create a new gene</Link></li>
            <li><Link to="/gene/id/WB1">Edit an exiting gene (example)</Link></li>
            <li><Link to="/gene/merge">Merge two genes</Link></li>
            <li><Link to="/gene/split">Split a gene</Link></li>
          </ul>
          <Route exact path="/" component={() => 'home page' } />
          <Route path="/gene" component={({match}) => ([
            <Route path={`${match.url}/new`} component={() => 'form to create new gene'} />,
            <Route path={`${match.url}/id/:id`} component={() => 'form edit an existing new gene'} />,
            <Route path={`${match.url}/merge`} component={() => 'form to merge two genes'} />,
            <Route path={`${match.url}/split`} component={() => 'form to split a gene'} />,
          ])} />
          <Route path="/variation" component={() => 'variation page' } />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
