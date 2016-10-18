import React from 'react';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: "..." };
  }

  componentDidMount() {
    document.title = "LedgerDB";
    fetch('api/fortune', {
      method: 'get',
      headers: { 'Authorization': sessionStorage.token }
    })
      .then(res => {
        if (res.ok) {
          res.text().then(text => {
            this.setState({ text: text });
          });
        }
      });
  }

  render() {
    return (
      <pre>{this.state.text}</pre>
    );
  }
}

export default Dashboard;
