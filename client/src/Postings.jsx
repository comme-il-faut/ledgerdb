import React from 'react';

import { fetchJSON } from './fetch';
import { formatAmount } from './formatters';

class Postings extends React.Component {

  static getInitialPromise() {
    return fetch('api/posting', {
      method: 'get',
      headers: { 'Authorization': sessionStorage.token }
    }).then(fetchJSON);
  }

  componentDidMount() {
    document.title = "LedgerDB - Postings";
  }

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
