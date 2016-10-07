import React from 'react';
import Pikaday from 'pikaday';

const DATE_FORMAT = "M/D/YYYY";

class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = { accounts: [], err: null, valid: {}, input: {} };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    document.title = "LedgerDB - Post";

    //$('.form-control').change(this.handleChange);

    this.pikaday = new Pikaday({
      field: document.getElementById('date'),
      format: DATE_FORMAT,
      firstDay: 1,
      onSelect: this.handleChangeDate.bind(this)
    });

    fetch('api/account/all', {
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
        this.setState({ accounts: json, err: null });
      })
      .catch(err => {
        console.log("Error has occurred: %o", err);
        this.setState({ accounts: [], err: err });
      });
  }

  componentWillUnmount() {
    this.pikaday.destroy();
  }

  render() {
    return (
      <form className="form-horizontal" onSubmit={this.handleSubmit}>
        {this.renderFormGroup("date", "Date", (
          <input
            type="date"
            className="form-control"
            id="date"
            placeholder={DATE_FORMAT}
            value={this.state.input.date}
            onChange={this.handleChange}
          />
        ))}
        {this.renderFormGroup("cr", "From Account", this.renderSelect("cr"))}
        {this.renderFormGroup("dr", "To Account", this.renderSelect("dr"))}
        {this.renderFormGroup("amount", "Amount", (
          <div className="input-group">
            <div className="input-group-addon">$</div>
            <input
              type="number"
              min="0"
              step="any"
              className="form-control"
              id="amount"
              value={this.state.input.amount}
              onChange={this.handleChange}
            />
          </div>
        ))}
        <div className="form-group">
          <div className="col-sm-offset-3 col-sm-9">
            <button type="submit" className="btn btn-primary btn-lg">Post</button>
            {' '}
            <button onClick={this.handleClear.bind(this)} className="btn btn-default">Clear</button>
          </div>
        </div>
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
    let optgroups = [], optgroup;
    this.state.accounts.forEach((account) => {
      if (optgroup && optgroup[0].account_type != account.account_type) {
        optgroups.push(optgroup);
        optgroup = null;
      }
      if (!optgroup) optgroup = [];
      optgroup.push(account);
    });
    if (optgroup)
      optgroups.push(optgroup);
    return (
      <select
        className="form-control"
        id={id}
        value={this.state.input[id]}
        onChange={this.handleChange}
      >
        <option value="" hidden>Choose account...</option>
        {optgroups.map((optgroup) => (
          <optgroup
            key={optgroup[0].account_type}
            label={optgroup[0].mask + " - " + optgroup[0].description}
          >
          {optgroup.map((account) => (
            <option
              key={account.account_id}
              value={account.account_id}
            >
            {account.account_id} - {account.name}
            </option>
          ))}
          </optgroup>
        ))}
      </select>
    );
  }

  handleChangeDate(a,b,c) {
    this.handleChange({ target: { id: "date", value: $('#date').val() }});
  }

  handleChange(e) {
    let input = this.state.input;
    input[e.target.id] = e.target.value;
    this.setState({ valid: {}, input: input });

    if (e.target.id == "date") {
      let value = e.target.value;
      if (value == "") {
        this.pikaday.setDate(null);
        this.pikaday.gotoToday();
      }
    }
  }

  handleClear(e) {
    e.preventDefault();
    let input = this.state.input;
    Object.keys(input).forEach(id => input[id] = "");
    this.setState({ valid: {}, input: input });
  }

  handleSubmit(e) {
    e.preventDefault();

    let valid = this.state.valid;
    valid.date = !isNaN(Date.parse($("#date").val()));
    valid.cr = !!$('#cr').val();
    valid.dr = !!$('#dr').val();
    valid.amount = !!$("#amount").val() && /^(\d+(,\d\d\d)*)?(\.\d+)?$/.test($("#amount").val());
    this.setState({ valid: valid });

    if (!Object.keys(valid).every(id => valid[id]))
      return false;
  }

}

export default Post;
