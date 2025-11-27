import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const SectorBarChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data.length) return;

    const counts = {};
    data.forEach(d => {
      if (d.sector) counts[d.sector] = (counts[d.sector] || 0) + 1;
    });

    const entries = Object.keys(counts).map(s => ({
      sector: s,
      count: counts[s]
    })).sort((a, b) => b.count - a.count).slice(0, 10);

    const width = 600, height = 400;
    const margin = { top: 20, right: 20, bottom: 120, left: 80 };

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

    const x = d3.scaleBand()
      .domain(entries.map(e => e.sector))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(entries, e => e.count)])
      .range([height - margin.bottom, margin.top])
      .nice();

    svg.selectAll("rect")
      .data(entries)
      .enter()
      .append("rect")
      .attr("x", e => x(e.sector))
      .attr("y", e => y(e.count))
      .attr("height", e => height - margin.bottom - y(e.count))
      .attr("width", x.bandwidth())
      .attr("fill", "#4BC0C0")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", (event, d) => {
        const percentage = ((d.count / data.length) * 100).toFixed(1);
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <strong>${d.sector}</strong><br/>
          Count: ${d.count}<br/>
          Percentage: ${percentage}%
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
        d3.select(event.target).attr("fill", "#36A2EB");
      })
      .on("mouseout", (event) => {
        tooltip.transition().duration(200).style("opacity", 0);
        d3.select(event.target).attr("fill", "#4BC0C0");
      });

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "9px")
      .text(function(d) { return d.length > 8 ? d.substring(0, 8) + '...' : d; });

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", -(height / 2))
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Count");

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

export default SectorBarChart;