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
    if (!Object.keys(nextProps).every(key => nextProps[key] === this.props.key)) {
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
        this.props.onResolve &&
          this.props.onResolve(resolvedProps);
        this.setState({ pending: false, props: resolvedProps });
      })
      .catch(err => {
        this.setState({ pending: false, err: err });
      });
  }

  render() {
    if (this.state.pending) {
      /*
      return (
        <section>
          <div style={{ color: "#c7c7c7" }}>
            <i className="fa fa-spinner fa-pulse fa-3x fa-fw" aria-hidden="true"></i>
            <span className="sr-only">Loading...</span>
          </div>
        </section>
      );
      */
      /*
      return (
        <section>
          <div className="progress">
            <div className="progress-bar progress-bar-striped active"
                 role="progressbar"
                 aria-valuenow="100"
                 aria-valuemin="0"
                 aria-valuemax="100"
                 style={{ width: "100%" }}>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </section>
      );
      */
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
    return this.props.onResolve
      ? onlyChild
      : React.cloneElement(onlyChild, this.state.props);
  }
}

PromiseContainer.propTypes = {
  children: React.PropTypes.element.isRequired,
  onResolve: React.PropTypes.func
}

export default PromiseContainer;
