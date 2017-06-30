import React from 'react';
import { Link } from 'react-router';

class Reports extends React.PureComponent {

  componentDidMount() {
    document.title = "LedgerDB - Reports";
  }

  render() {
    return (
      <div className="row">
        <div className="col-sm-3 col-md-2 sidebar">
          <ul className="nav nav-sidebar">
            <li>
              <Link to="/reports/histogram" activeClassName="active">Histogram of Expenses</Link>
            </li>
            <li>
              <a href="#">Histogram of Expenses MTD</a>
            </li>
            <li>
              <Link to="/reports/flows" activeClassName="active">Flow Diagram</Link>
            </li>
          </ul>
        </div>
        <div className="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
          {this.props.children}
        </div>
      </div>
    )
  }

}

export default Reports;
