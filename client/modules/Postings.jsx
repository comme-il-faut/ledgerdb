import React from 'react';

import Message from './Message.jsx';

class Postings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      postings: [],
      message: null
    };
  }

  componentDidUpdate() {
    if (this.state.message) {
      this.state.message = null;
    }
  }

  componentDidMount() {
    document.title = "LedgerDB - Postings";

    fetch('api/posting', {
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
        this.setState({ postings: json });
      })
      .catch(err => {
        console.log("Error has occurred: %o", err);
        this.setState({ postings: [], message: err });
      });
  }

  render() {
    return (
      <div>
        {this.renderTable()}
        {/* JSON.stringify(entries) */}
        <Message message={this.state.message}/>
      </div>
    );
  }

  renderTable() {
    if (!this.state.postings.length)
      return null;

    let entries = [], entry = [];

    this.state.postings.forEach((posting) => {
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
              this.renderAmount(posting.amount)
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

  renderAmount(amount) {
    if (amount == 0) return "-";
    let s = amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
    if (s.startsWith("-"))
      s = "(" + s.substring(1) + ")";
    return s;
  }
}

export default Postings;
