import React from 'react';

function promisedComponent(component) {
  //console.log("promisedComponent -> " + component.name);
  return class extends React.PureComponent {

    constructor(props) {
      super(props);
      //console.log("promisedComponent -> constructor");
      if (typeof component.getInitialPromise === 'function') {
        this.state = { pending: true };
        component.getInitialPromise()
          .then(data => this.setState({ pending: false, data: data }))
          .catch(err => this.setState({ pending: false, err: err }));
      } else {
        this.state = { pending: false };
      }
      document.title = "LedgerDB";
    }

    render() {
      //console.log("promisedComponent -> render " + component.name);

      if (this.state.pending) {
        return null;
      }

      if (this.state.err) {
        console.log("Oh snap! Error: %o", this.state.err);
        return (
          <div className="alert alert-danger">
            <strong>Oh snap!</strong> {this.state.err.toString()}
          </div>
        );
      }

      let props = Object.assign({}, this.props);
      if (this.state.data) {
        props.data = this.state.data;
      }
      return React.createElement(component, props, this.props.children);
    }
  };
}

export default promisedComponent;
