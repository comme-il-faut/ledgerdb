import React from 'react';

class Fortune extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: "" };
  }

  componentDidMount() {
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
      <p {...this.props}>{this.state.text}</p>
    );
  }
}

export default Fortune;
