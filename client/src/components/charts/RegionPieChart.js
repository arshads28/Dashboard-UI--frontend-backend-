import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const RegionPieChart = ({ data }) => {
  const svgRef = useRef();
  useEffect(() => {
    if (!data.length) return;

    const counts = {};
    data.forEach(d => {
      if (d.region) counts[d.region] = (counts[d.region] || 0) + 1;
    });

    const width = 500;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 80;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#f8f9fa");

    svg.selectAll("*").remove();

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", "1000");

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeSet3);

    const pie = d3.pie()
      .value(d => d[1])
      .sort(null);

    const dataReady = pie(Object.entries(counts));

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const arcHover = d3.arc()
      .innerRadius(0)
      .outerRadius(radius + 10);

    const labelArc = d3.arc()
      .innerRadius(radius + 20)
      .outerRadius(radius + 20);

    g.selectAll("path")
      .data(dataReady)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data[0]))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", (event, d) => {
        const total = dataReady.reduce((sum, item) => sum + item.data[1], 0);
        const percentage = ((d.data[1] / total) * 100).toFixed(1);
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`<strong>${d.data[0]}</strong><br/>Count: ${d.data[1]}<br/>Percentage: ${percentage}%`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
        d3.select(event.target).attr("d", arcHover);
      })
      .on("mouseout", (event) => {
        tooltip.transition().duration(200).style("opacity", 0);
        d3.select(event.target).attr("d", arc);
      });

    // Add labels outside (only for slices > 4%)
    g.selectAll(".label-text")
      .data(dataReady)
      .enter()
      .append("text")
      .attr("class", "label-text")
      .attr("transform", d => `translate(${labelArc.centroid(d)})`)
      .attr("text-anchor", d => {
        const centroid = labelArc.centroid(d);
        return centroid[0] > 0 ? "start" : "end";
      })
      .style("font-size", "11px")
      .style("font-weight", "500")
      .style("fill", "#333")
      .text(d => {
        const total = dataReady.reduce((sum, item) => sum + item.data[1], 0);
        const percentage = (d.data[1] / total) * 100;
        return percentage >= 4 ? d.data[0] : "";
      });

    // Add label lines (only for slices > 4%)
    g.selectAll(".label-line")
      .data(dataReady)
      .enter()
      .append("polyline")
      .attr("class", "label-line")
      .attr("points", d => {
        const total = dataReady.reduce((sum, item) => sum + item.data[1], 0);
        const percentage = (d.data[1] / total) * 100;
        if (percentage < 4) return "";
        const pos = arc.centroid(d);
        const mid = labelArc.centroid(d);
        return [pos, mid].map(p => p.join(",")).join(" ");
      })
      .style("fill", "none")
      .style("stroke", "#999")
      .style("stroke-width", 1);

    return () => {
      d3.selectAll(".tooltip").remove();
    };
  }, [data]);

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default RegionPieChart;
