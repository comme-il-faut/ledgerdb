import React from 'react';

import { formatAmount, formatDate } from '../Formatters';

class TableWithCheckboxes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: Array(this.props.rows.length + 1).fill(false),
      loading: false
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.rows.length < this.props.rows.length) {
      this.setState({
        checked: Array(props.rows.length + 1).fill(false),
        loading: false
      });
    }
  }

  handleChange(i) {
    this.setState((state) => {
      const checked = !state.checked[i];
      if (i == 0) {
        state.checked.fill(checked);
      } else {
        state.checked[0] = false;
        state.checked[i] = checked;
      }
      return { checked: state.checked }
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ loading: true });
    this.props.onSubmit(this.state.checked.slice(1));
  }

  renderCheckbox(i) {
    return (
      <input
        type="checkbox"
        checked={this.state.checked[i]}
        onChange={this.handleChange.bind(this, i)}
        disabled={this.state.loading}
      />
    );
  }

  renderButton() {
    const disabled = this.state.loading || this.state.checked.every(checked => !checked);
    return React.cloneElement(
      this.props.button, {
        disabled: disabled,
        onClick: this.handleSubmit
      });
  }

  render() {
    return (
      <div>
        <table className="table table-condensed le-recon-table">
          <thead>
            <tr>
              <th>
                {this.renderCheckbox(0)}
              </th>
              {this.props.head.props.children}
            </tr>
          </thead>
          <tbody>
            {this.props.rows.map((row, i) => (
              <tr key={row.key}>
                <td>
                  {this.renderCheckbox(i + 1)}
                </td>
                {row.props.children}
              </tr>
            ))}
          </tbody>
        </table>
        {this.renderButton()}
      </div>
    );
  }
}

TableWithCheckboxes.defaultProps = {
  button: (
    <button type="button" className="btn btn-success btn-lg">
      Submit
    </button>
  )
};

TableWithCheckboxes.propTypes = {
  head:     React.PropTypes.element.isRequired,
  rows:     React.PropTypes.arrayOf(React.PropTypes.element).isRequired,
  onSubmit: React.PropTypes.func.isRequired,
  button:   React.PropTypes.element
};

export default TableWithCheckboxes;
