import React from 'react';
import PropTypes from 'prop-types';

class TableWithCheckboxes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: Array(this.props.rows.length + 1).fill(false)
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.rows.length < this.props.rows.length) {
      this.setState({
        checked: Array(props.rows.length + 1).fill(false)
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
    this.props.onSubmit(this.state.checked.slice(1));
  }

  renderCheckbox(i) {
    return (
      <input
        type="checkbox"
        checked={this.state.checked[i]}
        onChange={this.handleChange.bind(this, i)}
        disabled={this.props.loading}
      />
    );
  }

  renderButton() {
    const disabled = this.props.loading || this.state.checked.every(checked => !checked);
    return React.cloneElement(
      this.props.button, {
        disabled: disabled,
        onClick: this.handleSubmit
      });
  }

  render() {
    return (
      <div>
        <table className={this.props.className}>
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
  ),
  loading: false
};

TableWithCheckboxes.propTypes = {
  head:     PropTypes.element.isRequired,
  rows:     PropTypes.arrayOf(PropTypes.element).isRequired,
  onSubmit: PropTypes.func.isRequired,
  button:   PropTypes.element,
  loading:  PropTypes.bool
};

export default TableWithCheckboxes;
