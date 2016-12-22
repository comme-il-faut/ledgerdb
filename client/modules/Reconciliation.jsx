import React from 'react';
import moment from 'moment';

import Message from './Message.jsx';
import { formatAmount, formatDate } from './Formatters';

import TableWithCheckboxes from './Reconciliation/TableWithCheckboxes.jsx';

class Reconciliation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      mapped: { p2s: [], s2s: [] },
      unmapped:  { p: [], s: [] },
      message: null
    };
  }

  componentDidMount() {
    document.title = "LedgerDB - Reconciliation";

    fetch('api/reconciliation', {
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
        for (let key of ['postings', 'statements', 'accounts']) {
          let a = json[key]
          if (!Array.isArray(a))
            throw new Error("Invalid server response");
          this[key] = json[key];
        }
        this.accounts = {};
        json.accounts.forEach((a) => {
          this.accounts[a.accountId] = a;
        })
        this.reconcile();
      })
      .catch(err => {
        console.log("Error has occurred: %o", err);
        this.setState({ loading: false, message: err });
      });
  }

  componentDidUpdate() {
    if (this.state.message) {
      this.state.message = null;
    }
  }

  reconcile() {
    let setP = new Set(this.postings);
    let setS = new Set(this.statements);

    let mapP2S = new Map();

    for (let p of this.postings) {
      for (let s of this.statements) {
        if (!setS.has(s)) continue;

        if (p.accountId == s.accountId
            && p.amount == s.amount) {

          let pd = moment(p.postingDate);
          let sd = moment(s.statementDate);
          let days = sd.diff(pd, 'days');
          if (!(days >= 0 && days < 5))
            continue;

          if (mapP2S.has(p)) {
            let s0 = mapP2S.get(p);
            if (moment(s0.statementDate).isSameOrBefore(sd))
              continue;
            setS.add(s0);
          }
          mapP2S.set(p, s);
          setP.delete(p);
          setS.delete(s);
        }
      }
    }

    let mapS2S = new Map();

    if (setS.size > 1) {
      for (let i = 0; i < this.statements.length - 1; i++) {
        let s1 = this.statements[i];
        if (!setS.has(s1)) continue;
        for (let j = i + 1; j < this.statements.length; j++) {
          let s2 = this.statements[j];
          if (!setS.has(s2)) continue;

          if (s1.statementDate == s2.statementDate
              && s1.amount == -s2.amount
              && s1.accountId != s2.accountId) {

            mapS2S.set(s1, s2);
            setS.delete(s1);
            setS.delete(s2);
            break;
          }
        }
      }
    }

    this.setState({
      loading: false,
      mapped: {
        p2s: Array.from(mapP2S.entries()).sort((e1, e2) => this.sortPostings(e1[0], e2[0])),
        s2s: Array.from(mapS2S.entries()).sort((e1, e2) => this.sortStatements(e1[0], e2[0]))
      },
      unmapped: {
        p: Array.from(setP.values()).sort(this.sortPostings),
        s: Array.from(setS.values()).sort(this.sortStatements)
      }
    });
  }

  sortPostings(p1, p2) {
    return p1.postingDate.localeCompare(p2.postingDate)
      || p1.accountId - p2.accountId
      || p1.postingDetailId - p2.postingDetailId;
  }
  sortStatements(s1, s2) {
      return s1.statementDate.localeCompare(s2.statementDate)
        || s1.accountId - s2.accountId
        || s1.statementId - s2.statementId;
  }

  handleSubmitP2S(checked) {
    console.log("%o", checked);
  }

  handleSubmitS2S(checked) {
    console.log("%o", checked);
  }

  handleSubmitP(checked) {
    console.log("%o", checked);
  }

  render() {
    if (this.state.loading)
      return null;
      //return <p>...</p>; //TODO spinner, or progress message "crunching numbers"

    return (
      <div>
        <h3>1. Auto-matched Postings to Statements</h3>
        {this.renderTableP2S()}

        <h3>2. Auto-matched Statements</h3>
        {this.renderTableS2S()}

        <h3>3. Unmatched Postings</h3>
        {this.renderTableP()}

        <h3>4. Unmatched Statements</h3>
        {this.renderTableS()}

        {/* <p>{JSON.stringify(this.state)}</p> */}
        <Message message={this.state.message}/>
      </div>
    );
  }

  renderTableP2S() {
    if (!this.state.mapped.p2s.length)
      return this.renderAOK();

    const head = (
      <tr>
        <th className="text-nowrap">Date</th>
        <th className="text-nowrap">Account</th>
        <th className="text-right">Amount</th>
        <th className="col-md-8">Description</th>
      </tr>
    );

    const rows = this.state.mapped.p2s.map((tuple) => {
      const p = tuple[0],
            s = tuple[1];
      return (
        <tr key={p.postingDetailId}>
          <td className="text-nowrap">
            {formatDate(p.postingDate)}
            <br/>
            {p.postingDate != s.statementDate
              && <small className="le-pad-left">{formatDate(s.statementDate)}</small>}
          </td>
          <td className="text-nowrap">
            {this.accounts[p.accountId].name}
          </td>
          <td className="text-nowrap text-right">
            <span className={
              p.amount < 0
                ? "le-num-neg"
                : "le-num-pos"
            }>
              {formatAmount(p.amount)}
            </span>
          </td>
          <td>
            <span>{p.description}</span>
            <br/>
            <small>{s.description}</small>
          </td>
        </tr>
      );
    });

    return (
      <TableWithCheckboxes
        head={head}
        rows={rows}
        onSubmit={this.handleSubmitP2S}
      />
    );
  }

  renderTableS2S() {
    if (!this.state.mapped.s2s.length)
      return this.renderAOK();

    const head = (
      <tr>
        <th className="col-md-1 text-nowrap">Date</th>
        <th className="col-md-2 text-nowrap">Account</th>
        <th className="col-md-1 text-right">Amount</th>
        <th className="col-md-8">Description</th>
      </tr>
    );

    const rows = this.state.mapped.s2s.map((tuple) => {
      const s1 = tuple[0].amount > 0 ? tuple[0] : tuple[1],
            s2 = tuple[0].amount > 0 ? tuple[1] : tuple[0];
      return (
        <tr key={s1.statementId}>
          <td className="text-nowrap">{formatDate(s1.statementDate)}</td>
          <td className="text-nowrap">
            <span>
              {this.accounts[s1.accountId].name}
            </span>
            <br/>
            <span className="le-pad-left">
              {this.accounts[s2.accountId].name}
            </span>
          </td>
          <td className="text-nowrap text-right">
            <span className="le-num-pos le-pad-right">
              {formatAmount(s1.amount)}
            </span>
            <br/>
            <span className="le-num-neg">
              {formatAmount(s2.amount)}
            </span>
          </td>
          <td>
            {s1.description}
            <br/>
            {s2.description}
          </td>
        </tr>
      );
    });

    return (
      <TableWithCheckboxes
        head={head}
        rows={rows}
        onSubmit={this.handleSubmitS2S}
      />
    );
  }

  renderTableP() {
    if (!this.state.unmapped.p.length)
      return this.renderAOK();

    const head = (
      <tr>
        <th className="col-md-1 text-nowrap">Date</th>
        <th className="col-md-2 text-nowrap">Account</th>
        <th className="col-md-1 text-right">Amount</th>
        <th className="col-md-8">Description</th>
      </tr>
    );

    const rows = this.state.unmapped.p.map((p) => (
      <tr key={p.postingDetailId}>
        <td className="text-nowrap">{formatDate(p.postingDate)}</td>
        <td className="text-nowrap">
          {this.accounts[p.accountId].name}
        </td>
        <td className="text-nowrap text-right">
          <span className={
            p.amount < 0
              ? "le-num-neg"
              : "le-num-pos"
          }>
            {formatAmount(p.amount)}
          </span>
        </td>
        <td>
          {p.description}
        </td>
      </tr>
    ));

    const button = (
      <button type="button" className="btn btn-danger btn-lg">
        Delete
      </button>
    );

    return (
      <TableWithCheckboxes
        head={head}
        rows={rows}
        button={button}
        onSubmit={this.handleSubmitP}
      />
    );
  }

  renderTableS() {
    if (!this.state.unmapped.s.length)
      return this.renderAOK();

    let rows = [];
    this.state.unmapped.s.forEach((s) => {
      rows.push(
        <tr key={s.statementId}>
          <td className="text-nowrap">{formatDate(s.statementDate)}</td>
          <td className="text-nowrap">
            {this.accounts[s.accountId].name}
          </td>
          <td className="text-nowrap text-right">
            <span className={
              s.amount < 0
                ? "le-num-neg"
                : "le-num-pos"
            }>
              {formatAmount(s.amount)}
            </span>
          </td>
          <td>
            {s.description}
          </td>
        </tr>
      );
    });

    return (
      <table className="table table-striped table-condensed">
        <thead>
          <tr>
            <th className="col-md-1 text-nowrap">Date</th>
            <th className="col-md-2 text-nowrap">Account</th>
            <th className="col-md-1 text-right">Amount</th>
            <th className="col-md-8">Description</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }

  renderAOK() {
    return (
      <p>A-OK.</p>
    );
  }

}

export default Reconciliation;
