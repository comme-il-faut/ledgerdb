import React from 'react';
import { NavLink, Route } from 'react-router-dom';

import VizFlowsSankey from './VizFlowsSankey';
import VizHistogram from './VizHistogram';
import promisedComponent from './promisedComponent';

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
              <NavLink to="/reports/histogram" activeClassName="active">Histogram of Expenses</NavLink>
            </li>
            <li>
              <a href="#">Histogram of Expenses MTD</a>
            </li>
            <li>
              <NavLink to="/reports/flows" activeClassName="active">Flow Diagram</NavLink>
            </li>
          </ul>
        </div>
        <div className="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
          <Route path={this.props.match.url + "/histogram"} component={VizHistogram}/>
          <Route path={this.props.match.url + "/flows"} component={VizFlowsSankey}/>
        </div>
      </div>
    )
  }

}

export default Reports;
