import React from 'react';
import moment from 'moment';

import DateInput from './shared/DateInput';
import PromiseContainer from './shared/PromiseContainer';
import { DATE_FORMAT_MDY, DATE_FORMAT_ISO } from './shared/DateInput';
import { fetchJSON } from './fetch';

//TODO handle negative net flows
//TODO separate resize listener, redraw only if actual size changed
//TODO do not hardcode years in <select><option>..., get the dynamically from server
//TODO add link to each bar, show to postings details for the month+account
//TODO overlay line chart of total income
//TODO preserve multiples state after refresh, or toggle stacked button selected

class VizHistogram_Chart extends React.PureComponent {

  constructor(props) {
    super(props);
    this.redraw = this.redraw.bind(this);
  }

  componentDidMount() {
    this.redraw();
    //window.addEventListener("resize", this.redraw);
  }

  componentWillUnmount() {
    //window.removeEventListener("resize", this.redraw);
  }

  componentWillReceiveProps(nextProps) {
    const changed = Object.keys(nextProps).filter(key => this.props[key] !== nextProps[key]);
    if (changed.length == 1 && changed.join() == "mode") {
      this.trap(this.transition, nextProps.mode);
    } else {
      this.trap(this.redraw);
    }
  }

  trap(func, ...args) {
    try {
      func(...args);
    } catch (err) {
      alert(err.toString());
      console.log(err);
    }
  }

  clear() {
    const div = d3.select(this.root);
    const node = div.node();
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  redraw() {
    this.clear();
    const div = d3.select(this.root);

    console.log("VizHistogram_Chart: redraw: mode=" + this.props.mode);

    const xKeys = [...new Set(
      this.props.histogram.map(o => o.postingMonth)
    )].sort();

    const yKeys = [...new Set(
      this.props.histogram.map(o => o.accountId)
    )];

    const accounts = Object.assign({}, ...this.props.accounts.map(o => ({
      [o.accountId]: o
    })));

    const data = xKeys.map(postingMonth => {
      const d = Object.assign(
        { postingMonth: postingMonth },
        ...yKeys.map(accountId => ({ [accountId]: 0 })),
        ...this.props.histogram
          .filter(o => o.postingMonth == postingMonth)
          .map(o => ({ [o.accountId]: o.amount }))
      );
      d.total = yKeys
        .map(accountId => d[accountId])
        .reduce((a, b) => a + b);
      return d;
    });

    const ySort = {};
    yKeys.forEach(accountId => {
      ySort[accountId]
        = d3.deviation(data, d => d[accountId])
        / d3.mean(data, d => d[accountId]);
    });
    yKeys.sort((a, b) => ySort[a] - ySort[b]);

    const yBands = yKeys.map((accountId, j) => d3.max(data, d => d[accountId]));
    yBands.reduce((a, b, i) => yBands[i] = a + b);
    yBands.unshift(0);

    const yMax1 = d3.max(data, d => d.total);
    const yMax2 = yBands[yBands.length - 1];
    // 1 = stacked, 2 = multiples


    const parseDate = d3.timeParse("%Y-%m"),
          formatDate = d3.timeFormat("%b-%Y"),
          formatAmount = d3.format(",.2f");

    const margin = { top: 20, right: 20, bottom: 30, left: 40 },
          width = div.node().getBoundingClientRect().width - margin.left - margin.right,
          padding = 20,
          h1 = 400 - margin.top - margin.bottom,
          h2 = Math.ceil(h1 * yMax2 / yMax1) + padding * yKeys.length;

    const color = d3.scaleOrdinal(d3.schemeCategory20);

    const svg = div.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", h1 + margin.top + margin.bottom)
      .attr("font-size", 10)
      .attr("font-family", "sans-serif");
    //const defs = svg.append("defs");
    const g = svg.append("g").append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const y = d3.scaleLinear()
      .rangeRound([h1, 0]);

    y.domain([0, yMax1]).nice();


    const legend = g.append("g")
      .attr("text-anchor", "start");

    const legendY1 = (d, i) => "translate(0," + (yKeys.length - i - 1) * 17 + ")";
    const legendY2 = (d, i) => "translate(0," + (y(yBands[i]) - i * padding - 16) + ")";

    legend.selectAll("g")
      .data(yKeys)
      .enter().append("g")
        .attr("transform", legendY1)
        .call(g =>
          g.append("rect")
            .attr("x", width)
            .attr("width", 16)
            .attr("height", 16)
            .attr("fill", color))
        .call(g =>
          g.append("text")
            .attr("x", width + 19)
            .attr("y", 8)
            .attr("dy", 3)
            .text(accountId => accountId + ": " + accounts[accountId].name));

    const legendWidth = legend.node().getBoundingClientRect().width;
    legend.attr("transform", "translate(-" + legendWidth + ",0)");


    const x = d3.scaleBand()
      .rangeRound([0, width - legendWidth - padding])
      .paddingInner(0.2)
      .paddingOuter(0.1);

    x.domain(xKeys);

    const y1 = function(d, i) { return y(d[1]); };
    const y2 = function(d, i) {
      const j = this.parentNode.__data__.index;
      return y(d[1] - d[0] + yBands[j]) - (j * padding);
    };

    g.append("g")
      .attr("class", "axis axis-x")
      .attr("transform", "translate(0," + h1 + ")")
      .call(d3.axisBottom(x)
        .tickSize(0))
      .call(g =>
        g.select(".domain")
          .style("display", "none"));

    g.append("g")
      .attr("class", "axis axis-y")
      .call(d3.axisLeft(y));

    g.append("g")
      .attr("class", "gridline")
      .call(d3.axisLeft(y)
        .tickSize(-width + legendWidth + padding + x.step() * x.paddingOuter())
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
      .enter().append("g");

    group.append("g")
      .attr("fill", d => color(d.key))
      .selectAll("rect")
      .data(d => d)
      .enter().append("rect")
        .attr("x", d => x(d.data.postingMonth))
        .attr("y", y1)
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .append("title").text(function(d, i) {
          const accountId = this.parentNode.parentNode.__data__.key; // series.key
          return accountId + ": " + accounts[accountId].name + "\n" +
            "$" + formatAmount(d.data[accountId]);
        });

    g.append("g")
      .attr("class", "labels labels-stacked")
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(data)
      .enter().append("text")
        .text(d => "$" + formatAmount(d.total))
        .attr("x", d => x(d.postingMonth) + x.bandwidth() / 2)
        .attr("y", d => y(d.total))
        .attr("dy", "-.3em");

    group.append("g")
      .attr("class", "labels labels-multiples")
      .attr("opacity", 0)
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(d => d)
      .enter().append("text")
        .text(d => "$" + formatAmount(d[1] - d[0]))
        .attr("x", d => x(d.data.postingMonth) + x.bandwidth() / 2)
        .attr("y", y2)
        .attr("dy", "-.3em");


    this.transition = function(mode) {
      const t1 = svg.transition().duration(750);
      const t2 = t1.transition().duration(250);

      if (mode == "stacked") {
        svg.transition(t1).attr("height", h1 + margin.top + margin.bottom);
        t1.select("g").attr("transform", "translate(0,0)")
          .selectAll("rect").attr("y", y1);
        t1.select(".gridline").attr("opacity", 1);
        t1.select(".axis-y").attr("opacity", 1);
        t1.selectAll(".labels-multiples").attr("opacity", 0);
        t2.select(".labels-stacked").attr("opacity", 1);
        legend.selectAll("g").transition(t1).attr("transform", legendY1);
      }

      if (mode == "multiples") {
        svg.transition(t1).attr("height", h2 + margin.top + margin.bottom);
        t1.select("g").attr("transform", "translate(0," + (h2 - h1) + ")")
          .selectAll("rect").attr("y", y2);
        t1.select(".gridline").attr("opacity", 0);
        t1.select(".axis-y").attr("opacity", 0);
        t1.select(".labels-stacked").attr("opacity", 0);
        t2.selectAll(".labels-multiples").attr("opacity", 1);
        legend.selectAll("g").transition(t1).attr("transform", legendY2);
      }
    };
  }

  render() {
    return (
      <section>
        <div ref={root => this.root = root}
          style={{ width: "100%" }}>
        </div>
        {/*
        <p>
          {JSON.stringify(this.props)}
        </p>
        */}
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
    }).then(fetchJSON);

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
        <PromiseContainer
          promises={{
            accounts: this.accounts,
            histogram: this.histogram
          }}>
          <VizHistogram_Chart
            mode={this.state.mode}
          />
        </PromiseContainer>
      </div>
    );
  }

}

export default VizHistogram;
