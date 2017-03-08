import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { load } from '../actions';

class App extends Component {

  render() {
    const { state, load } = this.props;
    return (
      <div>
        <button onClick={load}>load</button>
        <br/><br/>
        程序当前的state:
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>
    );
  }
}

App.propTypes = {
  load: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired
};

export default connect(
  state => ({state}),
  { load }
)(App);
