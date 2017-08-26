import React from 'react';
import moment from 'moment';

import DateInput from './shared/DateInput';
import PromiseContainer from './shared/PromiseContainer';
import { DATE_FORMAT_MDY, DATE_FORMAT_ISO } from './shared/DateInput';
import { fetchJSON } from './fetch';

//TODO - resize svn height, when transition multiples/stacked
//TODO - stacked: add total labels on top of each bar
//TODO - multiples: hide axis/gridlines/totals, add labels atop each rect

class VizHistogram_Chart extends React.PureComponent {

  constructor(props) {
    super(props);
    this.redraw = this.redraw.bind(this);
  }

  componentDidMount() {
    this.redraw();
    window.addEventListener("resize", this.redraw);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.redraw);
    //TODO separate resize listener, redraw only if actual size changed
  }

  componentWillReceiveProps(nextProps) {
    const changed = Object.keys(nextProps).filter(key => this.props[key] !== nextProps[key]);
    if (changed.length == 1 && changed.join() == "mode") {
      this.transition(nextProps.mode);
    } else {
      this.redraw();
    }
  }

  clear() {
    const div = d3.select(this.root);
    const node = div.node();
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  transition(mode) {
    try {
      const svg = d3.select(this.root).select("svg");
      svg.transition().duration(750)
        .selectAll("rect")
        .attr("y", this.t[mode]);
    } catch (err) {
      alert(err.toString());
      console.log(err);
    }
  }

  redraw() {
    try {
      this.clear();
      const div = d3.select(this.root);

      console.log("VizHistogram_Chart: redraw: mode=" + this.props.mode);

      const parseDate = d3.timeParse("%Y-%m"),
            formatDate = d3.timeFormat("%b-%Y"),
            formatAmount = d3.format(",.2f");

      const margin = { top: 20, right: 20, bottom: 30, left: 40 },
            width = div.node().getBoundingClientRect().width - margin.left - margin.right,
            height = div.node().getBoundingClientRect().height - margin.top - margin.bottom;

      const svg = div.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
      const g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      const x = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.2)
        .paddingOuter(0.1);

      const y1 = d3.scaleLinear()
        .rangeRound([height, 0]);

      const color = d3.scaleOrdinal(d3.schemeCategory20);

      const xKeys = [...new Set(
        this.props.histogram.map(entry => entry.postingMonth)
      )].sort();

      const yKeys = [...new Set(
        this.props.histogram.map(entry => entry.accountId)
      )].sort();
      //TODO: sort by stddev

      const accounts = Object.assign({}, ...this.props.accounts.map(e => ({
        [e.accountId]: e
      })));

      const data = xKeys.map(postingMonth => {
        const d = Object.assign(
          { postingMonth: postingMonth },
          ...yKeys.map(accountId => ({ [accountId]: 0 })),
          ...this.props.histogram
            .filter(e => e.postingMonth == postingMonth)
            .map(e => ({ [e.accountId]: e.amount }))
        );
        d.total = yKeys
          .map(accountId => d[accountId])
          .reduce((a, b) => a + b);
        return d;
      });

      const yOffsets = yKeys.map((accountId, j) => d3.max(data, d => d[accountId]));
      yOffsets.reduce((a, b, i) => yOffsets[i] = a + b);
      //debugger;

      x.domain(xKeys);
      y1.domain([0, d3.max(data, d => d.total)]).nice();
      //y1.domain([0, yOffsets[yOffsets.length - 1]]).nice();

      //TODO handle negative flows

      g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .select(".domain")
          .style("display", "none");

      g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y1));

      g.append("g")
        .attr("class", "gridline")
        .call(d3.axisLeft(y1)
          .tickSize(-width)
          .tickFormat(""))
        .call(g =>
          g.selectAll("line")
            .style("stroke", "lightgrey")
            .style("stroke-opacity", 0.7)
            .style("stroke-dasharray", "3,2")
            .style("shape-rendering", "crispEdges"))
        .call(g =>
          g.select(".domain")
            .style("display", "none"));

      const group = g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(yKeys)(data))
        .enter().append("g")
          .attr("fill", d => color(d.key));

      this.t = {
        stacked: function(d, i) { return y1(d[1]); },
        multiples: function(d, i) {
          const j = this.parentNode.__data__.index;
          let h = yOffsets[j];
          if (j > 0) { h -= yOffsets[j - 1]; }
          //debugger;
          //return y1(yOffsets[j] + d[1]);
          return y1(yOffsets[j] - d[0] + d[1] - h) - (j * 3);
        }
      };

      group.selectAll("rect")
        .data(d => d)
        .enter().append("rect")
          .attr("x", d => x(d.data.postingMonth))
          //.attr("y", d => y1(d[1]))
          //.attr("y", this.t.multiples)
          .attr("y", this.t[this.props.mode])
          .attr("height", d => y1(d[0]) - y1(d[1]))
          .attr("width", x.bandwidth())
          .append("title").text(function(d, i) {
            const accountId = this.parentNode.parentNode.__data__.key; // series.key
            return accountId + ": " + accounts[accountId].name + "\n" +
              "$" + formatAmount(d.data[accountId]);
          });

    } catch (err) {
      alert(err.toString());
      console.log(err);
    }
  }

  render() {
    return (
      <section>
        <div ref={root => this.root = root}
          style={{ width: "100%", height: "400px" }}>
        </div>
        <p>
          {JSON.stringify(this.props)}
        </p>
      </section>
    );
  }

}

class VizHistogram_Form extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      date: this.props.date,
      dateStale: false,
      mode: this.props.mode
    };

    this.inputModeRefs = {};

    this.setInputModeRef = this.setInputModeRef.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handleModeChange = this.handleModeChange.bind(this);
  }

  componentDidMount() {
    Object.keys(this.inputModeRefs).forEach(key => {
      const input = this.inputModeRefs[key];
      $(input).change(() => this.handleModeChange(key));
    });
  }

  // https://github.com/facebook/react/issues/4533
  setInputModeRef(input) {
    if (input) {
      this.inputModeRefs[input.value] = input;
    }
  }

  handleDateChange(e) {
    this.setState({ date: e.target.value, dateStale: true });
  }
  handleRefresh(e) {
    e.preventDefault();
    this.setState({ dateStale: false });
    this.props.onDateChange(this.state.date);
  }

  handleModeChange(mode) {
    this.props.onModeChange(mode);
  }

  render() {
    //TODO - do not hardcode years, get the dynamically from server
    return (
      <div className="row">
        <div className="col-md-7 col-sm-12">
          <form className="form-inline" onSubmit={this.handleRefresh}>
            <select value={this.state.date} className="form-control" onChange={this.handleDateChange}>
              <option value="15m">Past 15 months</option>
              <option value="y2017">Year 2017</option>
              <option value="y2016">Year 2016</option>
            </select>
            &nbsp;
            <div className="form-group">
              <button type="submit" className={"btn btn-" + (this.state.dateStale ? "primary" : "default")}>Refresh</button>
            </div>
          </form>
        </div>
        <div className="col-md-5 col-sm-12 text-right">
          <form className="form-inline">
            <div className="btn-group" data-toggle="buttons">
              <label className={"btn btn-default" + (this.state.mode == "multiples" ? " active" : "")}>
                <input type="radio" name="mode" autoComplete="off"
                  value="multiples"
                  ref={this.setInputModeRef}
                /> Multiples
              </label>
              <label className={"btn btn-default" + (this.state.mode == "stacked" ? " active" : "")}>
                <input type="radio" name="mode" autoComplete="off"
                  value="stacked"
                  ref={this.setInputModeRef}
                /> Stacked
              </label>
            </div>
          </form>
        </div>
      </div>
    );
  }

}

class VizHistogram extends React.Component {

  constructor(props) {
    super(props);

    this.accounts = fetch("api/account", {
      method: "get",
      headers: { "Authorization": sessionStorage.token }
    }).then(fetchJSON)

    this.state = {
      date: "15m",
      mode: "stacked"
    };
    this.setDates(this.state.date);

    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleModeChange = this.handleModeChange.bind(this);
  }

  componentDidMount() {
    document.title = "LedgerDB - Reports - Histogram of Expenses";
  }

  setDates(date) {
    if (date.endsWith("m")) {
      this.d1 = moment().startOf("month").add(-date.slice(0, -1) + 1, "M");
      this.d2 = moment().endOf("month");
    }
    if (date.startsWith("y")) {
      this.d1 = moment(date.slice(1) + "-01-01");
      this.d2 = moment(date.slice(1) + "-12-31");
    }

    const url = "api/posting/flows1" +
      "?d1=" + this.d1.format(DATE_FORMAT_ISO) +
      "&d2=" + this.d2.format(DATE_FORMAT_ISO);
    this.histogram = fetch(url, {
      method: "get",
      headers: { "Authorization": sessionStorage.token }
    }).then(fetchJSON);
  }

  handleDateChange(date) {
    this.setDates(date);
    this.setState({ date: date });
  }

  handleModeChange(mode) {
    if (this.state.mode != mode) {
      this.setState({ mode: mode });
    }
  }

  render() {
    return (
      <div>
        <VizHistogram_Form
          date={this.state.date}
          mode={this.state.mode}
          onDateChange={this.handleDateChange}
          onModeChange={this.handleModeChange}
        />
        <PromiseContainer accounts={this.accounts} histogram={this.histogram}>
          <VizHistogram_Chart
            mode={this.state.mode}
          />
        </PromiseContainer>
      </div>
    );
  }

}

export default VizHistogram;
