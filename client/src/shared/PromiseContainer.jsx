import React from 'react';

import ProgressBar from './ProgressBar';

class PromiseContainer extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = { pending: true };
  }

  componentDidMount() {
    this.load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const propKeys = Object.keys(nextProps).filter(key => !PromiseContainer.propTypes.hasOwnProperty(key));
    if (!propKeys.every(key => nextProps[key] === this.props[key])) {
      this.setState({ pending: true });
      this.load(nextProps);
    }
  }

  load(props) {
    const propKeys = Object.keys(props).filter(key => !PromiseContainer.propTypes.hasOwnProperty(key));
    Promise.all(propKeys.map(key => Promise.resolve(props[key])))
      .then(values => {
        const resolvedProps = {};
        propKeys.forEach((key, i) => resolvedProps[key] = values[i]);
        this.setState({ pending: false, props: resolvedProps });
      })
      .catch(err => {
        this.setState({ pending: false, err: err });
      });
  }

  render() {
    if (this.state.pending) {
      return (
        <section>
          <ProgressBar/>
        </section>
      );
    }

    if (this.state.err) {
      console.log("Oh sorrow! Error: %o", this.state.err);
      return (
        <section>
          <div className="alert alert-danger">
            <strong>Oh sorrow!</strong> {this.state.err.toString()}
          </div>
        </section>
      );
    }

    const onlyChild = React.Children.only(this.props.children);
    return React.cloneElement(onlyChild, this.state.props);
  }
}

PromiseContainer.propTypes = {
  children: React.PropTypes.element.isRequired
}

export default PromiseContainer;
