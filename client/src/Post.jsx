import React from 'react';
import Pikaday from 'pikaday';
import moment from 'moment';

import AccountSelect from './shared/AccountSelect';
import Message from './shared/Message';

const DATE_FORMAT_MDY = "M/D/YYYY";

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
  }

  componentDidMount() {
    document.title = "LedgerDB - Post";

    this.pikaday = new Pikaday({
      field: document.getElementById('date'),
      format: DATE_FORMAT_MDY,
      firstDay: 0,
      showDaysInNextAndPreviousMonths: true,
      onSelect: () => this.setInput("date", this.pikaday.toString())
    });

    let resources = ["account_type", "account"];
    resources.forEach(resource => {
      const key = resource.replace(/_[a-z]/g, match => match.charAt(1).toUpperCase());
      fetch('api/' + resource, {
        method: 'get',
        headers: { 'Authorization': sessionStorage.token }
      })
        .then(res => {
          if (res.ok) {
            return res.json();
          } else {
            return res.text().then(text => {
              throw new Error(text ? text : res.statusText);
            });
          }
        })
        .then(json => {
          let state = {};
          state[key] = json;
          this.setState(state);
        })
        .catch(err => {
          console.log("Error has occurred: %o", err);
          let state = { message: err };
          state[key] = [];
          this.setState(state);
        });
    });
  }

  componentWillUnmount() {
    this.pikaday.destroy();
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
          <div className="input-group">
            <input
              type="date"
              className="form-control"
              id="date"
              placeholder={DATE_FORMAT_MDY}
              value={this.state.input.date}
              onChange={this.handleChange}
            />
            <span className="input-group-btn">
              <button
                className="btn btn-default"
                type="button"
                onClick={this.handleClick.bind(this, 'calendar-check')}
              >
                <i className="fa fa-calendar-check-o" aria-hidden="true"></i>
              </button>
              <button
                className="btn btn-default"
                type="button"
                onClick={this.handleClick.bind(this, 'calendar')}
              >
                <i className="fa fa-calendar" aria-hidden="true"></i>
              </button>
            </span>
          </div>
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
              className={"btn btn-primary btn-lg" + (this.state.running ? " disabled" : "")}
            >
              <i className="fa fa-plus" aria-hidden="true"></i> Post
            </button>
            {' '}
            <button
              type="reset"
              onClick={this.handleClick.bind(this, 'clear')}
              className="btn btn-default"
            >
              <i className="fa fa-eraser" aria-hidden="true"></i> Clear
            </button>
          </div>
        </div>
        {/*<p>{JSON.stringify(this.state.input)}</p>*/}
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
      <AccountSelect
        accountTypes={this.state.accountType}
        accounts={this.state.account}
        className="form-control"
        id={id}
        value={this.state.input[id]}
        onChange={this.handleChange}
      />
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

    if (e.target.id == "date") {
      let value = e.target.value;
      if (value == "") {
        this.pikaday.setDate(null, true);
        this.pikaday.gotoToday();
      } else {
        this.pikaday.setDate(value, true);
      }
    }
  }

  handleClick(action, e) {
    e.preventDefault();
    if (action == "calendar-check") {
      let m = moment();
      this.setInput('date', m.format(DATE_FORMAT_MDY));
      this.pikaday.setMoment(m, true); // do not trigger onSelect
    }
    if (action.startsWith("calendar")) {
      document.getElementById("date").focus();
    }
    if (action == "clear") {
      this.setState((prevState) => {
        let input = Object.assign({}, prevState.input);
        Object.keys(input).forEach(id => input[id] = "");
        return { valid: {}, input: input };
      });
    }
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
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          return res.text().then(text => {
            throw new Error(text ? text : res.statusText);
          });
        }
      })
      .then(json => {
        //console.log("Post-OK");
        this.setState({ running: false, message: "OK" });
      })
      .catch(err => {
        this.setState({ running: false, message: err });
      });
  }

}

export default Post;
