import React from 'react';
import Pikaday from 'pikaday';
import moment from 'moment';

class DateInput extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { date: "" };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.pikaday = new Pikaday({
      field: this.field,
      format: this.props.format,
      firstDay: 0,
      showDaysInNextAndPreviousMonths: true,
      onSelect: () => this.setDate(this.pikaday.toString())
    });
  }

  componentWillUnmount() {
    this.pikaday.destroy();
  }

  setDate(date) {
    console.log("DateInput > setDate > " + date);
    this.setState({ date: date });
    this.props.onChange &&
    this.props.onChange(date);
  }

  handleChange(e) {
    let value = e.target.value;
    this.setDate(value);
    if (value == "") {
      this.pikaday.setDate(null, true);
      this.pikaday.gotoToday();
    } else {
      this.pikaday.setDate(value, true);
    }
  }

  handleClick(action, e) {
    e.preventDefault();
    if (action == "calendar-check") {
      let m = moment();
      this.setDate(m.format(this.props.format));
      this.pikaday.setMoment(m, true); // do not trigger onSelect
    }
    if (action.startsWith("calendar")) {
      this.field.focus();
    }
  }

  render() {
    return (
      <div className="input-group">
        <input
          type="date"
          id={this.props.id}
          className="form-control"
          ref={(input) => { this.field = input; }}
          placeholder={this.props.format}
          value={this.state.date}
          onChange={this.handleChange}
        />
        <span className="input-group-btn">
          <button
            className="btn btn-default"
            type="button"
            onClick={this.handleClick.bind(this, 'calendar-check')}
          >
            <i className="fa fa-calendar-check-o" aria-hidden="true"></i>
          </button>
          <button
            className="btn btn-default"
            type="button"
            onClick={this.handleClick.bind(this, 'calendar')}
          >
            <i className="fa fa-calendar" aria-hidden="true"></i>
          </button>
        </span>
      </div>
    );
  }

}

DateInput.propTypes = {
  format: React.PropTypes.string.isRequired,
  id: React.PropTypes.string,
  onChange: React.PropTypes.func
};

DateInput.defaultProps = {
  format: "M/D/YYYY" // DATE_FORMAT_MDY
};

export default DateInput;