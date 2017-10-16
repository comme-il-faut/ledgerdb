import React from 'react';

// https://facebook.github.io/react/blog/2017/07/26/error-handling-in-react-16.html

class ErrorBoundary extends React.Component {

  constructor(props) {
    super(props);
    this.state = { err: null };
  }

  componentDidCatch(err, info) {
    this.setState({ err: err });
  }

  render() {
    if (this.state.err) {
      return (
        <div className="container">
          <strong>Oh sorrow!</strong> {this.state.err.toString()}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
