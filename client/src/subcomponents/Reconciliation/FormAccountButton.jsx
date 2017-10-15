import React from 'react';
import PropTypes from 'prop-types';

import AccountSelect from '../../shared/AccountSelect';

class FormAccountButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.value);
  }

  render() {
    const disabled = this.props.loading || !this.state.value;
    return (
      <form className="form-inline" onSubmit={this.handleSubmit}>
        <AccountSelect
          accountTypes={this.props.accountTypes}
          accounts={this.props.accounts}
          className="form-control"
          value={this.state.value}
          onChange={this.handleChange}
        />
        {" "}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={disabled}
        >
          <i className="fa fa-plus" aria-hidden="true"></i> Post
        </button>
      </form>
    );
  }
}

FormAccountButton.propTypes = {
  accountTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  accounts:     PropTypes.arrayOf(PropTypes.object).isRequired,
  onSubmit:     PropTypes.func.isRequired,
  loading:      PropTypes.bool
};

FormAccountButton.defaultProps = {
  loading: false
};

export default FormAccountButton;
