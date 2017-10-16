import React from 'react';
import moment from 'moment';

import AccountSelect from './shared/AccountSelect';
import DateInput from './shared/DateInput';
import Message from './shared/Message';
import PromiseContainer from './shared/PromiseContainer';
import { DATE_FORMAT_MDY } from './shared/DateInput';
import { fetchJSON } from './fetch';

class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accountType: [],
      account: [],
      valid: {},
      input: {},
      running: false,
      message: null
    };

    let inputs = [ 'date', 'cr', 'dr', 'amount', 'description' ];
    for (let i = 0; i < inputs.length; i++) {
      this.state.input[inputs[i]] = "";
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClear = this.handleClear.bind(this);

    this.accountTypes = fetchJSON("api/account_type");
    this.accounts = fetchJSON("api/account");
  }

  componentDidMount() {
    document.title = "LedgerDB - Post";
  }

  componentDidUpdate() {
    if (this.state.message) {
      this.state.message = null;
    }
  }

  render() {
    return (
      <form className="form-horizontal" onSubmit={this.handleSubmit}>
        {this.renderFormGroup("date", "Date", (
          <DateInput
            id="date"
            format={DATE_FORMAT_MDY}
            onChange={(date) => this.setInput("date", date)}
          />
        ))}
        {this.renderFormGroup("cr", "From", this.renderSelect("cr"))}
        {this.renderFormGroup("dr", "To", this.renderSelect("dr"))}
        {this.renderFormGroup("amount", "Amount", (
          <div className="input-group">
            <div className="input-group-addon">$</div>
            <input
              type="text"
              min="0"
              step="any"
              className="form-control"
              id="amount"
              value={this.state.input.amount}
              onChange={this.handleChange}
            />
          </div>
        ))}
        {this.renderFormGroup("description", "Description", (
          <input
            type="text"
            className="form-control"
            id="description"
            value={this.state.input.description}
            onChange={this.handleChange}
          />
        ))}
        <div className="form-group">
          <div className="col-sm-offset-3 col-sm-9">
            <button
              type="submit"
              className={"btn btn-success" + (this.state.running ? " disabled" : "")}
            >
              <i className="fa fa-plus" aria-hidden="true"></i> Post
            </button>
            {' '}
            <button
              type="reset"
              onClick={this.handleClear}
              className="btn btn-default"
            >
              <i className="fa fa-eraser" aria-hidden="true"></i> Clear
            </button>
          </div>
        </div>
        {/*
        <p>{JSON.stringify(this.state.input)}</p>
        */}
        <Message message={this.state.message}/>
      </form>
    );
  }

  renderFormGroup(id, label, input) {
    let c = ["form-group"];
    if (this.state.valid[id] == false)
      c.push("has-error");
    return (
      <div className={c.join(" ")}>
        <label htmlFor={id} className="col-sm-3 control-label">{label}:</label>
        <div className="col-sm-9">{input}</div>
      </div>
    );
  }

  renderSelect(id) {
    return (
      <PromiseContainer
        wait={false}
        promises={{
          accountTypes: this.accountTypes,
          accounts: this.accounts
        }}>
      <AccountSelect
        className="form-control"
        id={id}
        value={this.state.input[id]}
        onChange={this.handleChange}
      />
      </PromiseContainer>
    );
  }

  setInput(id, value) {
    this.setState((prevState) => {
      let input = Object.assign({}, prevState.input);
      input[id] = value;
      return { valid: {}, input: input };
    });
  }

  handleChange(e) {
    this.setInput(e.target.id, e.target.value);
  }

  handleClear(e) {
    e.preventDefault();
    this.setState((prevState) => {
      let input = Object.assign({}, prevState.input);
      Object.keys(input).forEach(id => input[id] = "");
      return { valid: {}, input: input };
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    let input = Object.assign({}, this.state.input);
    let m = moment(input.date, DATE_FORMAT_MDY, true); // use strict parsing

    let valid = this.state.valid;
    valid.date = m.isValid();
    valid.cr = !!input.cr;
    valid.dr = !!input.dr;
    valid.amount = !!input.amount && /^(\d+(,\d\d\d)*)?(\.\d+)?$/.test(input.amount);
    this.setState({ valid: valid });
    if (!Object.keys(valid).every(id => valid[id]))
      return;

    input.amount = input.amount.replace(/,/g, "");

    let posting = {
      postingDate: m.format('YYYY-MM-DD'),
      description: input.description,
      details: [
        { accountId: input.cr, amount: "-" + input.amount },
        { accountId: input.dr, amount: input.amount }
      ]
    };

    this.setState({ running: true });

    fetch('api/posting', {
      method: 'post',
      headers: {
        'Authorization': sessionStorage.token,
        'Content-type': 'application/json'
      },
      body: JSON.stringify(posting)
    })
      .then(fetchJSON)
      .then(json => {
        this.setState({ running: false, message: "OK" });
      })
      .catch(err => {
        this.setState({ running: false, message: err });
      });
  }

}

export default Post;
