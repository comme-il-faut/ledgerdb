import React from 'react';

class ProgressBar extends React.PureComponent {

  constructor(props) {
    super(props);
    this.animate = this.animate.bind(this);

    this.r = 3; // radius of each dot circle
    this.n = 5; // number of dot circles
  }

  componentDidMount() {
    const root = d3.select(this.root);
    const svg = root.append("svg")
      .attr("width", "100%")
      .attr("height", "100%");

    this.circles = svg.selectAll("circle")
      .data(d3.range(this.n))
      .enter()
      .append("circle")
      .style("fill", "#777")
      .attr("cx", -this.r)
      .attr("cy", this.r + 2)
      .attr("r", this.r);

    this.animate();
  }

  componentWillUnmount() {
    delete this.circles;
  }

  ease(t) {
    const x = t * 4;
    switch (true) {
      case x < 1:
        return Math.sqrt(x) * 2/5;
      case x > 3:
        return 1 - Math.sqrt(4 - x) * 2/5;
      default:
        return ((x - 1) / 2 + 2) / 5;
    }
  }

  animate() {
    try {
      if (!this.circles) return;
      if (!this.root) return;

      const w = this.root.getBoundingClientRect().width;
      if (!(w > (this.r + 2) * 3)) return;

      this.circles
        .attr("cx", -5)
        .attr("cy", 5)
        .transition()
          .delay((d, i) => 1000 + i * 500)
          .ease(this.ease)
          .duration(w < 300 ? 3000 : 5000)
          .attr("cx", w + 5)
          .on("end", (d, i) => { i == this.n - 1 && this.animate() })
          ;
    } catch (err) {
      console.log("Error: %o", err);
    }
  }

  render() {
    return (
      <div ref={root => this.root = root}
        style={{ width: "100%", height: "15px" }}
      />
    );
  }
}

export default ProgressBar;
