import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const LineChartIntensity = ({ data }) => {
  const svgRef = useRef();
  useEffect(() => {
    if (!data.length) return;

    const yearly = {};
    data.forEach(d => {
      if (d.end_year && d.intensity) {
        yearly[d.end_year] = (yearly[d.end_year] || 0) + d.intensity;
      }
    });

    const entries = Object.entries(yearly)
      .sort((a, b) => a[0] - b[0])
      .slice(0, 15);
    
    const years = entries.map(e => e[0]);
    const values = entries.map(e => e[1]);

    const width = 700, height = 400;
    const margin = { top: 30, right: 20, bottom: 60, left: 60 };

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

    const x = d3.scalePoint()
      .domain(years)
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(values)])
      .range([height - margin.bottom, margin.top])
      .nice();

    const line = d3.line()
      .x((_, i) => x(years[i]))
      .y(d => y(d))
      .curve(d3.curveMonotoneX);

    // Line path
    svg.append("path")
      .datum(values)
      .attr("fill", "none")
      .attr("stroke", "#36A2EB")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Data points
    svg.selectAll(".dot")
      .data(values)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", (_, i) => x(years[i]))
      .attr("cy", d => y(d))
      .attr("r", 5)
      .attr("fill", "#36A2EB")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", (event, d) => {
        const i = values.indexOf(d);
        tooltip.transition().duration(200).style("opacity", 1);
        const avgIntensity = (d / data.filter(item => item.end_year == years[i]).length).toFixed(2);
        tooltip.html(`<strong>Year: ${years[i]}</strong><br/>Total Intensity: ${d.toFixed(1)}<br/>Average Intensity: ${avgIntensity}<br/>Data Points: ${data.filter(item => item.end_year == years[i]).length}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
        d3.select(event.target).attr("r", 7);
      })
      .on("mouseout", (event) => {
        tooltip.transition().duration(200).style("opacity", 0);
        d3.select(event.target).attr("r", 5);
      });

    // X-axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "11px");

    // Y-axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // X-axis label
    svg.append("text")
      .attr("transform", `translate(${width / 2}, ${height - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Year");

    // Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", -(height / 2))
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Total Intensity");

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

export default LineChartIntensity;