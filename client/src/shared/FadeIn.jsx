import React from 'react';
import PropTypes from 'prop-types';

// https://github.com/reactjs/react-transition-group/issues/79

class FadeIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      className: props.transitionName + "-enter"
    };
  }

  fadeIn() {
    setTimeout(() => this.setState({
      className: this.props.transitionName + "-enter " + this.props.transitionName + "-enter-active"
    }));
    setTimeout(() => this.setState({
      className: ""
    }), this.props.timeout);
  }

  componentDidMount() {
    this.fadeIn();
  }

  componentWillReceiveProps(nextProps) {
    const child1 = React.Children.only(this.props.children);
    const child2 = React.Children.only(nextProps.children);
    if (child1.type !== child2.type ||
        child1.key  !== child2.key  ||
        nextProps.transitionName !== this.props.transitionName) {
      this.setState({ className: nextProps.transitionName + "-enter" });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.className.endsWith("-enter")) {
      this.fadeIn();
    }
  }

  render() {
    //console.log("FadeIn.render class=\"" + this.state.className + "\"");
    return (
      <div className={this.state.className}>
        {this.props.children}
      </div>
    );
  }
}

FadeIn.propTypes = {
  children: PropTypes.element.isRequired,
  transitionName: PropTypes.string.isRequired,
  timeout: PropTypes.number.isRequired
};

export default FadeIn;
