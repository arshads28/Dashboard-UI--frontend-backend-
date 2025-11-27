import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const BubbleChart = ({ data }) => {
  const svgRef = useRef();
  useEffect(() => {
    if (!data.length) return;

    const width = 700, height = 400;
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };

    const filtered = data.filter(d => d.likelihood && d.relevance && d.intensity).slice(0, 50);

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

    const x = d3.scaleLinear()
      .domain([0, d3.max(filtered, d => d.likelihood)])
      .range([margin.left, width - margin.right])
      .nice();

    const y = d3.scaleLinear()
      .domain([0, d3.max(filtered, d => d.relevance)])
      .range([height - margin.bottom, margin.top])
      .nice();

    const r = d3.scaleSqrt()
      .domain([0, d3.max(filtered, d => d.intensity)])
      .range([3, 20]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    svg.selectAll("circle")
      .data(filtered)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.likelihood))
      .attr("cy", d => y(d.relevance))
      .attr("r", d => r(d.intensity))
      .attr("fill", d => color(d.sector || "Unknown"))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("opacity", 0.7)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <strong>${d.title ? d.title.substring(0, 25) + '...' : 'No Title'}</strong><br/>
          Likelihood: ${d.likelihood || 0}<br/>
          Relevance: ${d.relevance || 0}<br/>
          Intensity: ${d.intensity || 0}<br/>
          Sector: ${d.sector || 'Unknown'}<br/>
          Country: ${d.country || 'Unknown'}
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
        d3.select(event.target).attr("opacity", 1).attr("stroke-width", 2);
      })
      .on("mouseout", (event) => {
        tooltip.transition().duration(200).style("opacity", 0);
        d3.select(event.target).attr("opacity", 0.7).attr("stroke-width", 1);
      });

    // X-axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    // Y-axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // X-axis label
    svg.append("text")
      .attr("transform", `translate(${width / 2}, ${height - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Likelihood");

    // Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", -(height / 2))
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Relevance");

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

export default BubbleChart;
