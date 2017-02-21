import React from 'react';

class Message extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.show();
  }

  componentDidUpdate(prevProps) {
    if (this.props.message !== prevProps.message) {
      this.show();
    }
  }

  show() {
    if (this.props.message) {
      const modal = $('.modal');
      modal.modal('show');
    }
  }

  render() {
    let message = this.props.message;
    if (!message) return null;

    let title, body;
    if (message instanceof Error) {
      title = (
        <h4 className="modal-title text-danger">
          <i className="fa fa-exclamation-circle" aria-hidden="true"></i> Error
        </h4>
      );
      body = (
        <p>{message.message}</p>
      );
    } else {
      title = (
        <h4 className="modal-title text-success">
          <i className="fa fa-check-circle" aria-hidden="true"></i> Great success!
        </h4>
      );
      body = (
        <p>{message}</p>
      );
    }

    return (
      <div className="modal fade" tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button className="close" aria-label="Close" data-dismiss="modal" type="button">
                <span aria-hidden="true">&times;</span>
              </button>
              {title}
            </div>
            <div className="modal-body">
              {body}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Message.propTypes = {
  //message: React.PropTypes.any // string or Error
  message: (props, propName, componentName) => {
    if (propName != "message")
      return new Error(
        "Invalid prop " + propName + " supplied to " + componentName + " component"
      );
    const message = props[propName];
    if (!(message === null ||
        typeof(message) === 'string' ||
        message instanceof Error))
      return new Error(
        "Invalid message supplied to " + componentName + " component"
      );
  }
};

export default Message;
