import React from 'react';
import PropTypes from 'prop-types';

import ProgressBar from './ProgressBar';

class PromiseContainer extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = { pending: true };
  }

  componentDidMount() {
    this.load(this.props.promises);
  }

  componentWillReceiveProps(nextProps) {
    const propKeys = Object.keys(nextProps.promises);
    if (!propKeys.every(key => nextProps.promises[key] === this.props.promises[key])) {
      this.setState({ pending: true });
      this.load(nextProps.promises);
    }
  }

  load(props) {
    const propKeys = Object.keys(props);
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
      if (this.props.wait) {
        return (
          <section>
            <ProgressBar/>
          </section>
        );
      } else {
        const onlyChild = React.Children.only(this.props.children);
        return onlyChild;
      }
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
  children: PropTypes.element.isRequired,
  promises: PropTypes.object.isRequired,
  defaults: PropTypes.object,
  wait: PropTypes.bool
};

PromiseContainer.defaultProps = {
  wait: true
};

export default PromiseContainer;
