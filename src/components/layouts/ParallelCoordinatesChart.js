import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const ParallelCoordinatesChart = ({ data }) => {
  const svgRef = useRef();
  const margin = { top: 30, right: 30, bottom: 30, left: 120 }; // Increased left margin for readability
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Step 1: Aggregate total number by destination_country
    const destinationTotals = d3.rollups(
      data,
      v => d3.sum(v, d => d.number),
      d => d.destination_country
    );

    // Step 2: Sort and take the top 10 destination countries by total number
    const topDestinations = destinationTotals
      .sort((a, b) => b[1] - a[1]) // Sort descending by total number
      .slice(0, 10) // Take top 10
      .map(d => d[0]); // Get only the country names

    // Step 3: Filter data to include only the top 10 destination countries
    const filteredData = data.filter(d => topDestinations.includes(d.destination_country));

    // Define dimensions based on filtered data
    const dimensions = ["destination_country", "origin_country", "gender", "age", "number"];

    // Set up scales for each dimension
    const yScales = {};
    dimensions.forEach(dim => {
      if (dim === "number") {
        yScales[dim] = d3.scaleLinear()
          .domain(d3.extent(filteredData, d => d[dim]))
          .range([height, 0]);
      } else {
        yScales[dim] = d3.scalePoint()
          .domain([...new Set(filteredData.map(d => d[dim]))])
          .range([height, 0]);
      }
    });

    // X scale for each dimension
    const xScale = d3.scalePoint()
      .domain(dimensions)
      .range([0, width]);

    // Harmonized color scale
    const colorScale = d3.scaleOrdinal()
      .domain(topDestinations)
      .range(d3.schemeTableau10);

    // Select the SVG element and clear previous content
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    svg.selectAll("*").remove(); // Clear previous content

    // Add a group element for margins
    const chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Tooltip setup
    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("display", "none");

    // Helper function to draw each line
    const path = d => d3.line()(dimensions.map(dim => [xScale(dim), yScales[dim](d[dim])]));

    // Draw each line for each data point with tooltip functionality
    chartGroup.selectAll("path")
      .data(filteredData)
      .join("path")
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", d => colorScale(d.destination_country))
      .style("opacity", 0.7)
      .style("stroke-width", 1.5)
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).style("opacity", 1); // Highlight line
        tooltip.style("display", "block")
          .html(`
            <strong>Destination Country:</strong> ${d.destination_country}<br>
            <strong>Origin Country:</strong> ${d.origin_country}<br>
            <strong>Gender:</strong> ${d.gender}<br>
            <strong>Age:</strong> ${d.age}<br>
            <strong>Number:</strong> ${d.number.toLocaleString()}
          `);
      })
      .on("mousemove", event => {
        tooltip.style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget).style("opacity", 0.7); // Reset opacity
        tooltip.style("display", "none");
      });

    // Draw axes for each dimension
    dimensions.forEach(dim => {
      const axisGroup = chartGroup.append("g")
        .attr("transform", `translate(${xScale(dim)}, 0)`);

      // Add Y-axis for each dimension
      axisGroup.call(d3.axisLeft(yScales[dim]).ticks(5).tickSizeOuter(0));

      // Axis label
      axisGroup.append("text")
        .attr("y", -9)
        .attr("x", -5)
        .attr("text-anchor", "middle")
        .text(dim.replace(/_/g, " ")) // Make labels more readable
        .style("fill", "#0db4de")
        .style("font-size", "12px")
        .style("font-weight", "bold");
    });

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data]);

  return (
    <div style={{ overflowX: "auto" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ParallelCoordinatesChart;
