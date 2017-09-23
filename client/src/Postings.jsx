import React from 'react';

import AccountSelect from './shared/AccountSelect';
import DateInput from './shared/DateInput';
import PromiseContainer from './shared/PromiseContainer';
import { fetchJSON } from './fetch';
import { formatAmount } from './formatters';

class Postings extends React.Component {

  constructor(props) {
    super(props);

    const resources = ["account_type", "account"];
    resources.forEach(resource => {
      const key = resource.replace(/_[a-z]/g, match => match.charAt(1).toUpperCase());
      this[key] = 
        fetch('api/' + resource, {
          method: 'get',
          headers: { 'Authorization': sessionStorage.token }
        }).then(fetchJSON);
    });

  }

  componentDidMount() {
    document.title = "LedgerDB - Postings";
  }

  render() {
    return (
      <section>
        <form className="form-horizontal">
          <div className="form-group">
            <label htmlFor="q" className="col-sm-3 control-label">Search:</label>
            <div className="col-sm-9">
              <div className="input-group">
                <input id="q" name="q" type="text" className="form-control" />
                <span className="input-group-btn">
                  <button type="submit" className="btn btn-default">
                    <i className="fa fa-search" aria-hidden="true"></i> Search
                  </button>
                </span>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-3 control-label">By date:</label>
            <div className="col-sm-9">
              <div className="pull-left">
                <small>Start date:</small>
                <br/>
                <DateInput id="date1"/>
              </div>
              <div className="pull-left">
                <small>End date:</small>
                <br/>
                <DateInput id="date1"/>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-3 control-label">By account:</label>
            <div className="col-sm-9">
              <PromiseContainer
                wait={false}
                promises={{
                  accountTypes: this.accountType,
                  accounts: this.account
                }}>
                <AccountSelect
                  className="form-control"
                  multiple="multiple"
                  size="15"/>
              </PromiseContainer>
            </div>
          </div>
          <div className="form-group">
            <div className="col-sm-offset-3 col-sm-9">
              <button type="submit" className="btn btn-default">
                <i className="fa fa-search" aria-hidden="true"></i> Search
              </button>
            </div>
          </div>
        </form>

        <p>{JSON.stringify(this.props)}</p>

      </section>
    );
  }

  /*
  static getInitialPromise() {
    return fetch('api/posting', {
      method: 'get',
      headers: { 'Authorization': sessionStorage.token }
    }).then(fetchJSON);
  }
  */

  /*
  render() {
    const postings = this.props.data;
    if (!postings || !(postings.length > 0)) {
      return (
        <p>Thou hast seen nothing yet.</p>
      );
    }

    let entries = [], entry = [];

    postings.forEach((posting) => {
      if (entry.length
          && entry[0].postingHeaderId != posting.postingHeaderId) {
        entries.push(entry);
        entry = [];
      }
      entry.push(posting);
    });
    entries.push(entry);

    let rows = [];
    entries.forEach((entry) => {
      rows.push(
        <tr key={entry[0].postingHeaderId}>
          <td className="text-nowrap">{entry[0].postingDate}</td>
          <td className="text-nowrap">
            {entry.map((posting) => this.renderSpan1(
              posting,
              posting.accountName
            ))}
          </td>
          <td className="text-nowrap text-right">
            {entry.map((posting) => this.renderSpan2(
              posting,
              formatAmount(posting.amount)
            ))}
          </td>
          <td>{entry[0].description}</td>
        </tr>
      );
    });

    return (
      <table className="table table-striped table-condensed">
        <thead>
          <tr>
            <th className="col-md-1">Date</th>
            <th className="col-md-2">Account</th>
            <th className="col-md-1 text-right">Amount</th>
            <th className="col-md-8">Description</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
  */

  renderSpan1(posting, content) {
    let props = { key: posting.postingDetailId };
    if (posting.amount < 0) props.className = 'le-pad-left';
    return (
      <span {...props}>
        {content}
        <br/>
      </span>
    );
  }

  renderSpan2(posting, content) {
    let props = { key: posting.postingDetailId };
    if (posting.amount > 0) props.className = 'le-num-pos le-pad-right';
    if (posting.amount < 0) props.className = 'le-num-neg';
    return (
      <span {...props}>
        {content}
        <br/>
      </span>
    );
  }
}

export default Postings;
