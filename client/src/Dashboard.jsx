import React from 'react';

import Fortune from './shared/Fortune';
import ProgressBar from './shared/ProgressBar';

class Dashboard extends React.PureComponent {

  componentDidMount() {
    document.title = "LedgerDB";
  }

  render() {
    /*
    return (
      <div>
        TODO
      </div>
    );
    */
    return (
      <div>
        <Fortune/>
      </div>
    );
  }
}

export default Dashboard;
