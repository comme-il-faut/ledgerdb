import React from 'react';

class Postings extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    document.title = "LedgerDB - Postings";
  }

  render() {
    return (
      <h1>Postings</h1>
    );
  }
}

export default Postings;
