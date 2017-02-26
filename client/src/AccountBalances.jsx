import React from 'react';

import Message from './shared/Message';
import { fetchCheck, fetchJSON } from './fetch';
import { formatAmount, formatDate } from './formatters';

class AccountBalanceRow extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      reconciled: props.reconciled,
      loading: false
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    e.preventDefault();
    this.setState({ loading: true });

    const accountBalance = {};
    ['accountId', 'postingDate', 'amount'].forEach(key => {
      accountBalance[key] = this.props[key];
    });

    fetch('api/balance/reconcile', {
      method: 'post',
      headers: {
        'Authorization': sessionStorage.token,
        'Content-type': 'application/json'
      },
      body: JSON.stringify(accountBalance)
    }).then(fetchCheck).then(res => {
      this.setState({ reconciled: true, loading: false });
    }).catch(err => {
      this.setState({ loading: false });
      this.props.onError && this.props.onError(err);
    });

  }

  render() {
    return (
      <tr className={this.state.reconciled && "success"}>
        <td>
          <span className="le-pad-left">
            {formatDate(this.props.postingDate)}
          </span></td>
        <td className="text-right">
          {this.renderAmount()}
        </td>
        <td>
          {this.renderCheckbox()}
        </td>
      </tr>
    );
  }

  renderAmount() {
    const amount = this.props.sign * this.props.amount;
    let className = "";
    if (amount < 0) className = "le-num-neg";
    if (amount > 0) className = "le-num-pos";
    return (
      <span className={className}>{formatAmount(amount)}</span>
    );
  }

  renderCheckbox() {
    if (this.state.loading) {
      return (
        <span className="le-checkbox">
          <i className="fa fa-spinner fa-pulse fa-fw" aria-hidden="true"></i>
        </span>
      );
    } else if (this.state.reconciled) {
      return (
        <span className="le-checkbox le-checkbox-on">
          <i className="fa fa-check fa-fw" aria-hidden="true"></i>
        </span>
      );
    } else {
      return (
        <span className="le-checkbox le-checkbox-off" onClick={this.handleChange}>
          <i className="fa fa-check fa-fw" aria-hidden="true"></i>
        </span>
      );
    }
  }

}

class AccountBalances extends React.Component {

  static getInitialPromise() {
    const resources = ["account_type", "account", "balance"];
    return Promise.all(resources.map(resource =>
      fetch('api/' + resource, {
        method: 'get',
        headers: { 'Authorization': sessionStorage.token }
      }).then(fetchJSON)
    )).then(values => {
      let data = {};
      resources.forEach((resource, i) => {
        const key = resource.replace(/_[a-z]/g, match => match.charAt(1).toUpperCase());
        data[key] = values[i];
      });
      return data;
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      err: null
    };
    this.handleError = this.handleError.bind(this);
  }

  componentDidMount() {
    document.title = "LedgerDB - Account Balances";
  }

  handleError(err) {
    this.setState({ err: err });
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-6">
            {this.renderTable('A')}
          </div>
          <div className="col-md-6">
            {this.renderTable('L')}
          </div>
        </div>
        <div style={{clear: "both"}}>
          <Message message={this.state.err}/>
        </div>
        {/*
        <p style={{clear: "both"}}>{JSON.stringify(this.state)}</p>
        */}
      </div>
    );
  }

  renderTable(accountType) {
    let rows = [];
    this.props.data &&
    this.props.data.accountType
      .filter((at) => at.accountType == accountType)
      .forEach((at) => {
        rows.push(
          <tr key={accountType}>
            <th colSpan="3">
              {at.accountType == 'A' && 'Assets'}
              {at.accountType == 'L' && 'Liabilities'}
            </th>
          </tr>
        );
        this.props.data.account
          .filter((account) => account.accountType == at.accountType)
          .forEach((account) => {
            rows.push(
              <tr key={account.accountId}>
                <th>{account.accountId} - {account.name}</th>
                <td></td>
                <td></td>
              </tr>
            );
            this.props.data.balance
              .filter((balance) => balance.accountId == account.accountId)
              .forEach((balance) => {
                rows.push(
                  <AccountBalanceRow
                    key={balance.accountId + "/" + balance.postingDate}
                    accountId={balance.accountId}
                    postingDate={balance.postingDate}
                    sign={at.sign}
                    amount={balance.amount}
                    reconciled={balance.reconciled}
                    onError={this.handleError}
                  />
                );
              });
          });
        {/*
        rows.push(
          <tr key={accountType + "/Total"}>
            <th>
              {"Total "}
              {at.accountType == 'A' && 'Assets'}
              {at.accountType == 'L' && 'Liabilities'}
            </th>
            <td className="text-right">
              {this.renderAmount(1234567890)}
            </td>
          </tr>
        );
        */}
      });

    return (
      <table className="table table-hover table-condensed le-balance-table">
        <tbody>{rows}</tbody>
      </table>
    );
  }

}

export default AccountBalances;
