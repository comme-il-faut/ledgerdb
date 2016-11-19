import React from 'react';

class Postings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      postings: [],
      message: null
    };
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
    if (!this.state.postings.length)
      return null;

    let entries = [], entry = [];

    this.state.postings.forEach((posting) => {
      if (entry.length
          && entry[0].posting_header_id != posting.posting_header_id) {
        entries.push(entry);
        entry = [];
      }
      entry.push(posting);
    });
    entries.push(entry);

    let rows = [];
    entries.forEach((entry) => {
      rows.push(
        <tr key={entry[0].posting_header_id}>
          <td className="text-nowrap">{entry[0].posting_date}</td>
          <td className="text-nowrap">
            {entry.map((posting) => this.renderSpan(
              posting,
              posting.account_name
            ))}
          </td>
          <td className="text-nowrap text-right">
            {entry.map((posting) => this.renderSpan(
              posting,
              this.renderAmount(posting.amount)
            ))}
          </td>
          <td>{entry[0].description}</td>
        </tr>
      );
    });

    return (
      <div>
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
        {/* JSON.stringify(entries) */}
      </div>
    );
  }

  renderSpan(posting, content) {
    let props = { key: posting.posting_detail_id };
    if (posting.amount > 0) props.className = 'number-positive';
    if (posting.amount < 0) props.className = 'number-negative';
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