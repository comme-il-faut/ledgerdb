import React from 'react';
import moment from 'moment';

import DateInput from './shared/DateInput';
import PromiseContainer from './shared/PromiseContainer';
import { DATE_FORMAT_MDY, DATE_FORMAT_ISO } from './shared/DateInput';
import { fetchJSON } from './fetch';

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
    //TODO ???
    this.redraw();
  }

  clear() {
    const div = d3.select(this.root);
    const node = div.node();
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  redraw() {
    try {
      this.clear();
      const div = d3.select(this.root);

      const parseDate = d3.timeParse("%Y-%m"),
            formatDate = d3.timeFormat("%b-%Y");

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
        .paddingInner(0.2);

      const y = d3.scaleLinear()
        .rangeRound([height, 0]);

      const color = d3.scaleOrdinal(d3.schemeCategory20);

      const xKeys = [...new Set(
        this.props.histogram.map(entry => entry.postingMonth)
      )].sort();

      const yKeys = [...new Set(
        this.props.histogram.map(entry => entry.accountId)
      )].sort();
      //TODO: sort by stddev

      /*
      const dataByPostingMonth = new Map();
      xKeys.forEach(postingMonth => {
        const e2 = { postingMonth: postingMonth };
        yKeys.forEach(accountId => e2[accountId] = 0);
        dataByPostingMonth.set(postingMonth, e2);
      });
      this.props.histogram.forEach(e1 => {
        const e2 = dataByPostingMonth.get(e1.postingMonth)
        e2[e1.accountId] = e1.amount;
      });
      const data = Array.from(dataByPostingMonth.values());
      debugger;
      */

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

      x.domain(xKeys);
      y.domain([0, d3.max(data, d => d.total)]).nice();

      //TODO handle negative flows

      g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .select(".domain")
          .style("display", "none");

      g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

      g.append("g")
        .attr("class", "gridline")
        .call(d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat(""))
        .call(g =>
          g.selectAll("line")
            .style("stroke", "lightgrey")
            .style("stroke-opacity", 0.7)
            .style("shape-rendering", "crispEdges"))
        .call(g =>
          g.select(".domain")
            .style("display", "none"));

      g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(yKeys)(data))
        .enter().append("g")
          .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
          .attr("x", d => x(d.data.postingMonth))
          .attr("y", d => y(d[1]))
          .attr("height", d => y(d[0]) - y(d[1]))
          .attr("width", x.bandwidth());

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
    this.d1 = this.props.d1;
    this.d2 = this.props.d2;
    this.state = {
      selected: "15m", // XXX must agree
      stale: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    const value = e.target.value;
    if (value.endsWith("m")) {
      this.d1 = moment().startOf("month").add(-value.slice(0, -1) + 1, "M");
      this.d2 = moment().endOf("month");
    }
    if (value.startsWith("y")) {
      this.d1 = moment(value.slice(1) + "-01-01");
      this.d2 = moment(value.slice(1) + "-12-31");
    }
    this.setState({ selected: value, stale: true });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ stale: false });
    this.props.onSubmit(this.d1, this.d2);
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-7 col-sm-12">
          <form className="form-inline" onSubmit={this.handleSubmit}>
            <select value={this.state.selected} className="form-control" onChange={this.handleChange}>
              <option value="15m">Past 15 months</option>
              <option value="y2017">Year 2017</option>
              <option value="y2016">Year 2016</option>
            </select>
            &nbsp;
            <div className="form-group">
              <button type="submit"
                className={this.state.stale
                  ? "btn btn-primary"
                  : "btn btn-default"}
              >Refresh</button>
            </div>
          </form>
        </div>
        <div className="col-md-5 col-sm-12 text-right">
          <form className="form-inline">
            <label className="radio-inline">
              <input type="radio" name="mode" value="multiples"/> Multiples
            </label>
            &nbsp;
            <label className="radio-inline">
              <input type="radio" name="mode" value="stacked"/> Stacked
            </label>
          </form>
        </div>
      </div>
    );
  }

}

class VizHistogram extends React.PureComponent {

  constructor(props) {
    super(props);

    const d1 = moment().startOf("month").add(-15 + 1, "M"); //XXX must agree
    const d2 = moment().endOf("month");
    this.state = {
      accounts: null,
      d1: d1,
      d2: d2
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(d1, d2) {
    //this.setState({ d1: d1, d2: d2 });
    alert("d1=" + d1.format(DATE_FORMAT_ISO) + ", d2=" + d2.format(DATE_FORMAT_ISO));
  }

  render() {
    const f2 = url =>
      fetch(url, {
        method: "get",
        headers: { "Authorization": sessionStorage.token }
      }).then(fetchJSON);
    return (
      <PromiseContainer
        accounts={this.state.accounts || f2("api/account")}
        onResolve={resolvedProps => this.setState(resolvedProps)}
      >
        <div>
          <VizHistogram_Form
            d1={this.state.d1}
            d2={this.state.d2}
            onSubmit={this.handleSubmit}
          />
          <PromiseContainer
            histogram={
              f2("api/posting/flows1" +
                "?d1=" + this.state.d1.format(DATE_FORMAT_ISO) +
                "&d2=" + this.state.d2.format(DATE_FORMAT_ISO))
            }
          >
            <VizHistogram_Chart
              accounts={this.state.accounts}
            />
          </PromiseContainer>
        </div>
      </PromiseContainer>
    );
  }

}

export default VizHistogram;
