import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const CountryIntensityChart = ({ data }) => {
  const svgRef = useRef();
  useEffect(() => {
    if (!data.length) return;

    const sum = {}, count = {};

    data.forEach(d => {
      if (d.country && d.intensity) {
        sum[d.country] = (sum[d.country] || 0) + d.intensity;
        count[d.country] = (count[d.country] || 0) + 1;
      }
    });

    const entries = Object.keys(sum).map(c => ({
      country: c,
      avg: sum[c] / count[c],
      total: sum[c],
      count: count[c]
    })).sort((a, b) => b.avg - a.avg).slice(0, 10);

    const width = 600, height = 400;
    const margin = { top: 20, right: 20, bottom: 100, left: 80 };

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
      .domain(entries.map(e => e.country))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(entries, e => e.avg)])
      .range([height - margin.bottom, margin.top])
      .nice();

    svg.selectAll("rect")
      .data(entries)
      .enter()
      .append("rect")
      .attr("x", e => x(e.country))
      .attr("y", e => y(e.avg))
      .attr("height", e => height - margin.bottom - y(e.avg))
      .attr("width", x.bandwidth())
      .attr("fill", "#FF9F40")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <strong>${d.country}</strong><br/>
          Avg Intensity: ${d.avg.toFixed(2)}<br/>
          Total Intensity: ${d.total.toFixed(1)}<br/>
          Data Points: ${d.count}
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
        d3.select(event.target).attr("fill", "#FF6384");
      })
      .on("mouseout", (event) => {
        tooltip.transition().duration(200).style("opacity", 0);
        d3.select(event.target).attr("fill", "#FF9F40");
      });

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "9px")
      .text(function(d) { return d.length > 6 ? d.substring(0, 6) + '...' : d; });

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
      .text("Average Intensity");

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

export default CountryIntensityChart;
