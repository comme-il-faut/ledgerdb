import React from 'react';

import VizFlowsSankey from './VizFlowsSankey';
import promisedComponent from './promisedComponent';

class Dashboard extends React.Component {

  componentDidMount() {
    document.title = "LedgerDB";
  }

  render() {
    return (
      <div>
        {React.createElement(promisedComponent(VizFlowsSankey))}
      </div>
    );
  }
}

export default Dashboard;
