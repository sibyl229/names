import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route , Link, Redirect } from 'react-router-dom';
import 'typeface-roboto';
import { withStyles } from './components/elements';
import Header, { NavBar } from './containers/Header';
import Authenticate, { ProfileButton } from './containers/Authenticate';
import Footer from './containers/Footer';
import Gene, { GeneProfile } from './containers/Gene';
import {startMock, stopMock} from './mock';
import logo from './logo.svg';
import wormbaseLogo from './logo_wormbase_solid.svg';
import './App.css';


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
      <Authenticate>
        {
          ({isAuthenticated, user, login, profile}) => (
            <div className={this.props.classes.root}>
              <Header>
                <ProfileButton name={user.name}/>
              </Header>
              {
                isAuthenticated ? [
                  <NavBar />,
                  <div className={this.props.classes.content}>
                    <Route exact path="/" component={() => <Redirect to="/gene" /> } />
                    <Route exact path="/gene" component={() => (
                      <div>
                        <Gene />
                        <ul>
                          <li><Link to="/">Home</Link></li>
                          <li><Link to="/gene/new">Create a new gene</Link></li>
                          <li><Link to="/gene/id/WB1">Edit an exiting gene (example)</Link></li>
                          <li><Link to="/gene/merge">Merge two genes</Link></li>
                          <li><Link to="/gene/split">Split a gene</Link></li>
                        </ul>
                      </div>
                    )} />
                    <Route path="/gene" component={({match}) => ([
                      <Route path={`${match.url}/new`} component={() => <GeneProfile />} />,
                      <Route path={`${match.url}/id/:id`} component={({match}) => <GeneProfile wbId={match.params.id} />} />,
                      <Route path={`${match.url}/merge`} component={() => 'form to merge two genes'} />,
                      <Route path={`${match.url}/split`} component={() => 'form to split a gene'} />,
                    ])} />
                    <Route path="/variation" component={() => 'variation page' } />
                    <Route path="/me" component={() => profile } />
                  </div>
                ] :
                login
              }
              <Footer />
            </div>
          )
        }
      </Authenticate>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  root: {
    display : 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  content: {
    flex: '1 0 auto',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing.unit * 4,
  }
});

export default withStyles(styles)(App);
