import React from 'react';

import { formatAmount, formatDate } from '../Formatters';

class TableWithCheckboxes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: [false].concat(this.props.rows.map(row => false))
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(i) {
    this.setState((state) => {
      const checked = !state.checked[i];
      if (i == 0) {
        state.checked.fill(checked);
      } else {
        state.checked[i] = checked;
        state.checked[0] = false;
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
      />
    );
  }

  renderButton() {
    return React.cloneElement(
      this.props.button, {
        disabled: this.state.checked.every(checked => !checked),
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

export default TableWithCheckboxes;
