import React from 'react';
import moment from 'moment';

import Fortune from './Shared/Fortune';
import Message from './Message';
import { formatAmount, formatDate } from './Formatters';

import FormAccountButton from './Reconciliation/FormAccountButton';
import TableWithCheckboxes from './Reconciliation/TableWithCheckboxes';

class Reconciliation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      mapped: null, // { p2s: [], s2s: [] },
      unmapped: null, // { p: [], s: [] },
      message: null
    };
    this.handleSubmitP2S = this.handleSubmitP2S.bind(this);
    this.handleSubmitS2S = this.handleSubmitS2S.bind(this);
    this.handleSubmitP = this.handleSubmitP.bind(this);
    this.handleSubmitS = this.handleSubmitS.bind(this);
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
        for (let key of ['postings', 'statements', 'accounts', 'accountTypes']) {
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
        p2s: Array.from(mapP2S.entries()).sort((e1, e2) =>
          this.sort(e1[0], e2[0], ['postingDate', 'accountId', 'postingDetailId'])),
        s2s: Array.from(mapS2S.entries()).sort((e1, e2) =>
          this.sort(e1[0], e2[0], ['statementDate', 'accountId', 'statementId']))
      },
      unmapped: {
        p: Array.from(setP.values()).sort((p1, p2) =>
          this.sort(p1, p2, ['accountId', 'postingDate', 'postingDetailId'])),
        s: Array.from(setS.values()).sort((s1, s2) =>
          this.sort(s1, s2, ['accountId', 'statementDate', 'statementId']))
      }
    });
  }

  sort(o1, o2, fields) {
    if (fields.length == 0) return 0;
    const field = fields.shift();
    let val = 0;
    if (field.endsWith("Date"))
      val = o1[field].localeCompare(o2[field]);
    else
      val = o1[field] - o2[field];
    return val || this.sort(o1, o2, fields);
  }

  handleSubmitChecked(checked, url, method, key1, key2, mapper) {
    this.setState({ loading: true });
    const body = this.state[key1][key2]
      .filter((tuple, i) => checked[i])
      .map(mapper);

    fetch('api/' + url, {
      method: method,
      headers: {
        'Authorization': sessionStorage.token,
        'Content-type': 'application/json'
      },
      body: JSON.stringify(body)
    })
      .then(res => {
        if (res.ok) {
          const state = { loading: false };
          state[key1] = this.state[key1];
          state[key1][key2] = state[key1][key2].filter((tuple, i) => !checked[i]);
          this.setState(state);
        } else {
          return res.text().then(text => {
            throw new Error(text ? text : res.statusText);
          });
        }
      })
      .catch(err => {
        console.log("Error has occurred: %o", err);
        this.setState({ loading: false, message: err });
      });
  }

  handleSubmitP2S(checked) {
    this.handleSubmitChecked(checked, 'reconciliation/p2s', 'post', 'mapped', 'p2s',
      (tuple) => ({
        postingDetailId: tuple[0].postingDetailId,
        statementId: tuple[1].statementId
      }));
  }

  handleSubmitS2S(checked) {
    this.handleSubmitChecked(checked, 'reconciliation/s2s', 'post', 'mapped', 's2s',
      (tuple) => ({
        statementId1: tuple[0].statementId,
        statementId2: tuple[1].statementId
      }));
  }

  handleSubmitP(checked) {
    this.handleSubmitChecked(checked, 'posting', 'delete', 'unmapped', 'p',
      (p) => ({
        id: p.postingHeaderId
      }));
  }

  handleSubmitS(s, accountId) {
    const posting = {
      postingDate: s.statementDate,
      description: s.description,
      details: [
        { accountId: s.amount > 0 ? accountId : s.accountId, amount: -Math.abs(s.amount) },
        { accountId: s.amount > 0 ? s.accountId : accountId, amount: Math.abs(s.amount) },
      ]
    };
    posting.details.forEach((pd) => {
      if (pd.accountId == s.accountId)
        pd.statementId = s.statementId;
    });
    this.setState({ loading: true });

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
        const state = { loading: false };
        state.unmapped = this.state.unmapped;
        state.unmapped.s = state.unmapped.s.filter((s2) => s2.statementId != s.statementId);
        this.setState(state);

      })
      .catch(err => {
        this.setState({ loading: false, message: err });
      });
  }

  render() {
    //if (this.state.loading)
      //return null;
      //return <p>...</p>; //TODO spinner, or progress message "crunching numbers"

    //TODO if !loading && !mapped/!unmapped, show message in div

    return (
      <div>
        {this.state.mapped && this.state.unmapped && (
          <div>
            <h3>1. Auto-matched Postings to Statements</h3>
            {this.renderTableP2S()}

            <h3>2. Auto-matched Statements</h3>
            {this.renderTableS2S()}

            <h3>3. Unmatched Postings</h3>
            {this.renderTableP()}

            <h3>4. Unmatched Statements</h3>
            {this.renderTableS()}
          </div>
        )}
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
      const [p, s] = tuple;
      //const p = tuple[0],
      //      s = tuple[1];
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
        className="table table-condensed table-hover le-recon-table"
        head={head}
        rows={rows}
        onSubmit={this.handleSubmitP2S}
        loading={this.state.loading}
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

    const button = (
      <button type="button" className="btn btn-primary btn-lg">
        <i className="fa fa-plus" aria-hidden="true"></i> Post
      </button>
    );

    return (
      <TableWithCheckboxes
        className="table table-condensed table-hover le-recon-table"
        head={head}
        rows={rows}
        button={button}
        onSubmit={this.handleSubmitS2S}
        loading={this.state.loading}
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
        <i className="fa fa-remove" aria-hidden="true"></i> Delete
      </button>
    );

    return (
      <TableWithCheckboxes
        className="table table-condensed table-hover le-recon-table"
        head={head}
        rows={rows}
        button={button}
        onSubmit={this.handleSubmitP}
        loading={this.state.loading}
      />
    );
  }

  renderTableS() {
    if (!this.state.unmapped.s.length)
      return this.renderAOK();

    let rows = [];
    let accountId;
    this.state.unmapped.s.forEach((s) => {
      if (accountId != s.accountId) {
        accountId = s.accountId;
        rows.push(
          <tr key={"a" + accountId}>
            <th colSpan="4">
              {accountId + " - " + this.accounts[accountId].name}
            </th>
          </tr>
        );
      }
      rows.push(
        <tr key={s.statementId}>
          <td className="text-nowrap">
            <span className="le-pad-left">
              {formatDate(s.statementDate)}
            </span>
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
          <td className="text-nowrap">
            <FormAccountButton
              accountTypes={this.accountTypes}
              accounts={Object.values(this.accounts)}
              onSubmit={(accountId) => this.handleSubmitS(s, accountId)}
              loading={this.state.loading}
            />
          </td>
        </tr>
      );
    });

    return (
      <div>
        <table className="table table-condensed table-hover le-recon-table">
          <thead>
            <tr>
              <th className="col-md-1 text-nowrap">Date</th>
              <th className="col-md-1 text-right">Amount</th>
              <th className="col-md-8">Description</th>
              <th></th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
        <Fortune
          style={{
            whiteSpace: "pre-wrap",
            float: "right",
            marginTop: '30px',
            fontSize: '0.9em'
          }}
        />
      </div>
    );
  }

  renderAOK() {
    return (
      <p>A-OK.</p>
    );
  }

}

export default Reconciliation;
