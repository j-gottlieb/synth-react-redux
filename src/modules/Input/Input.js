import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InputSelector from './components/InputSelector';
import SocketSettings from './components/SocketSettings';
import * as actions from './actions';

class Input extends React.Component {
  state = {
    showSettings: false
  };

  handleSave = settings => {
    this.toggleSettingsModal();
    this.props.setSocketSettings(settings);
  };

  toggleSettingsModal = () => {
    this.setState({
      showSettings: !this.state.showSettings
    });
  };

  render() {
    return (
      <div>
        <InputSelector showSettings={this.toggleSettingsModal} />
        <SocketSettings
          close={this.toggleSettingsModal}
          save={this.handleSave}
          show={this.state.showSettings}
        />
      </div>
    );
  }
}

Input.propTypes = {
  setSocketSettings: PropTypes.func.isRequired
};

export default connect(null, actions)(Input);
