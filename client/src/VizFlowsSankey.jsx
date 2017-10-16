import React from 'react';
import moment from 'moment';

import DateInput from './shared/DateInput';
import PromiseContainer from './shared/PromiseContainer';
//import d3 from './subcomponents/VizFlowsSankey/d3';
import { DATE_FORMAT_MDY, DATE_FORMAT_ISO } from './shared/DateInput';
import { fetchJSON } from './fetch';
import { formatAmount } from './formatters';

class VizFlowsSankeyChart extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = { err: null };

    this.flows = {
      nodes: [],
      links: [],
    };

    this.accounts = {};
    this.props.accounts.forEach(a => {
      this.accounts[a.accountId] = a;
    });

    this.redraw = this.redraw.bind(this);
  }

  componentDidMount() {
    this.reload(this.props.d1, this.props.d2);
    window.addEventListener("resize", this.redraw);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.redraw);
  }

  componentWillReceiveProps(nextProps) {
    this.reload(nextProps.d1, nextProps.d2);
  }

  reload(d1, d2) {
    this.flows.nodes = [];
    this.flows.links = [];
    this.clear();
    fetch('api/posting/flows2?d1=' + d1 + '&d2=' + d2, {
      method: 'get',
      headers: { 'Authorization': sessionStorage.token }
    }).then(fetchJSON).then(flows => {

      const accountIds = [...new Set([
        ...flows.map(row => row.account1),
        ...flows.map(row => row.account2)
      ])].sort();

      const accountIdsIndex = {};
      accountIds.forEach((accountId, i) => accountIdsIndex[accountId] = i);

      const nodes = accountIds.map(accountId => this.accounts[accountId]);
      const links = flows.map(flow => ({
        source: accountIdsIndex[flow.account1],
        target: accountIdsIndex[flow.account2],
        value: flow.amount
      }));

      this.detectCycle(nodes, links);

      this.flows = {
        nodes: nodes,
        links: links
      };
      this.redraw();

    }).catch(err => {
      console.log("Error: %o", err)
      this.setState({ err: err });
    });
  }

  detectCycle(nodes, links, i, nodeVisited, nodeVisiting) {
    if (i === undefined) {
      nodeVisited = new Array(nodes.length).fill(false);
      nodeVisiting = new Array(nodes.length).fill(false);
      for (i = 0; i < nodes.length; i++) {
        this.detectCycle(nodes, links, i, nodeVisited, nodeVisiting);
      }
    } else {
      if (nodeVisited[i])
        return;
      if (nodeVisiting[i])
        throw new Error("Oops...found a cycle!");

      nodeVisiting[i] = true;
      for (let j = 0; j < links.length; j++) {
        if (links[j].source == i) {
          const k = links[j].target;
          this.detectCycle(nodes, links, k, nodeVisited, nodeVisiting);
        }
      }
      nodeVisiting[i] = false;
      nodeVisited[i] = true;
    }
  }

  clear() {
    const div = d3.select('#viz-flows-sankey-chart');
    const node = div.node();
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  redraw() {
    if (this.flows.nodes.length == 0)
      return;

    this.clear();
    const div = d3.select('#viz-flows-sankey-chart');

    const margin = { top: 1, right: 1, bottom: 6, left: 1 },
          width = div.node().getBoundingClientRect().width - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    const format = formatAmount;
    const color = d3.scaleOrdinal(d3.schemeCategory20);

    const svg = div.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const sankey = d3.sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .size([width, height]);

    const path = sankey.link();

    sankey
      .nodes(this.flows.nodes)
      .links(this.flows.links)
      .layout(32);

    const link = svg.append('g').selectAll('.viz-flow-sankey-link')
      .data(this.flows.links)
      .enter().append('path')
      .attr('class', 'viz-flow-sankey-link')
      .attr('d', path)
      .style("stroke-width", function(d) {
        return Math.max(1, d.dy);
      })
      .sort(function(a, b) {
        return b.dy - a.dy;
      });

    link.append("title")
      .text(function(d) {
        return d.source.name + " -> " + d.target.name + "\n" + format(d.value);
      });

    const dragmove = function(d) {
      d3.select(this).attr("transform", "translate(" + d.x + "," +
        (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
      sankey.relayout();
      link.attr("d", path);
    }

    const node = svg.append("g").selectAll(".viz-flows-sankey-node")
      .data(this.flows.nodes)
      .enter().append("g")
      .attr("class", "viz-flow-sankey-node")
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
      .call(d3.drag()
        .subject(function(d) {
          return d;
        })
        .on("start", function() {
          this.parentNode.appendChild(this);
        })
        .on("drag", dragmove));

    node.append("rect")
      .attr("height", function(d) {
        return d.dy;
      })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) {
        return d.color = color(d.name.replace(/ (.+)?/, ""));
      })
      .style("stroke", function(d) {
        return d3.rgb(d.color).darker(2);
      })
      .append("title")
      .text(function(d) {
        return d.accountId + ": " + d.name + "\n" + format(d.value);
      });

    node.append("text")
      .attr("x", -6)
      .attr("y", function(d) {
        return d.dy / 2;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) {
        return d.name;
      })
      .filter(function(d) {
        return d.x < width / 2;
      })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");
  }

  render() {
    return (
      <div id="viz-flows-sankey-chart">
        {this.state.err &&
         this.state.err.toString()}
      </div>
    );
  }
}

class VizFlowsSankey extends React.PureComponent {

  constructor(props) {
    super(props);

    this.d1 = moment().startOf('month').format(DATE_FORMAT_MDY);
    this.d2 = moment().endOf('month').format(DATE_FORMAT_MDY);
    this.state = {
      d1: this.d1,
      d2: this.d2
    };

    this.accounts = fetchJSON('api/account');

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(field, date) {
    this[field] = date;
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({
      d1: this.d1,
      d2: this.d2
    });
  }

  render() {
    return (
      <div>
        <div className="form-group input-group">
          <form className="form-inline" onSubmit={this.handleSubmit}>
            {/*
            <div className="form-group">
              <small><label htmlFor="viz-flows-sankey-input-d1">Quick dates:</label></small><br/>
              <select className="form-control">
                <option>Current month</option>
                <option>Previous month</option>
                <option>Last 10 days</option>
                <option>Last 30 days</option>
              </select>
            </div>
            &nbsp;
            */}
            <div className="form-group">
              <small><label htmlFor="viz-flows-sankey-input-d1">Start date:</label></small><br/>
              <DateInput id="viz-flows-sankey-input-d1"
                value={this.state.d1}
                onChange={this.handleChange.bind(this, 'd1')}
              />
            </div>
            &nbsp;
            <div className="form-group">
              <small><label htmlFor="viz-flows-sankey-input-d2">End date:</label></small><br/>
              <DateInput id="viz-flows-sankey-input-d2"
                value={this.state.d2}
                onChange={this.handleChange.bind(this, 'd2')}
              />
            </div>
            &nbsp;
            <div className="form-group le-bottom-align">
              <button type="submit" className="btn btn-default">Refresh</button>
            </div>
          </form>
        </div>
        <PromiseContainer promises={{accounts: this.accounts}}>
          <VizFlowsSankeyChart
            d1={ moment(this.state.d1, DATE_FORMAT_MDY).format(DATE_FORMAT_ISO) }
            d2={ moment(this.state.d2, DATE_FORMAT_MDY).format(DATE_FORMAT_ISO) }
          />
        </PromiseContainer>
      </div>
    );
  }
}

export default VizFlowsSankey;
