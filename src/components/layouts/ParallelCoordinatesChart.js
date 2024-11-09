import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const ParallelCoordinatesChart = () => {
  const svgRef = useRef();
  const margin = { top: 120, right: 30, bottom: 30, left: 120 };
  const width = 1150 - margin.left - margin.right;
  const height = 850 - margin.top - margin.bottom;
  const dataUrl = 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_recipients_of_combined_us_china_russia_arms_hierarchical.json';

  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch and process data from the URL
    d3.json(dataUrl).then(rawData => {
      const flattenedData = [];
      rawData.data.forEach((supplierData) => {
        const supplier = supplierData.supplier;
        supplierData.recipients.forEach((recipientData) => {
          const recipient = recipientData.recipient;
          Object.entries(recipientData.years).forEach(([year, value]) => {
            flattenedData.push({ supplier, recipient, year: +year, value });
          });
        });
      });
      setData(flattenedData);
    });
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Aggregate total trade value by recipient
    const destinationTotals = d3.rollups(
      data,
      (v) => d3.sum(v, (d) => d.value),
      (d) => d.recipient
    );

    // Sort and take the top 10 recipients by total trade value
    const topDestinations = destinationTotals
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map((d) => d[0]);

    // Filter data to include only the top 10 recipients
    const filteredData = data.filter((d) => topDestinations.includes(d.recipient));

    // Define dimensions for parallel coordinates
    const dimensions = ["supplier", "recipient", "year", "value"];

    // Set up scales for each dimension
    const yScales = {};
    dimensions.forEach((dim) => {
      if (dim === "value") {
        yScales[dim] = d3.scaleLinear()
          .domain(d3.extent(filteredData, (d) => d[dim]))
          .range([height, 0]);
      } else if (dim === "year") {
        yScales[dim] = d3.scaleLinear()
          .domain(d3.extent(filteredData, (d) => d[dim]))
          .range([height, 0]);
      } else {
        yScales[dim] = d3.scalePoint()
          .domain([...new Set(filteredData.map((d) => d[dim]))])
          .range([height, 0]);
      }
    });

    // X scale for each dimension
    const xScale = d3.scalePoint()
      .domain(dimensions)
      .range([0, width]);

    // Harmonized color scale for recipients
    const colorScale = d3.scaleOrdinal()
      .domain(topDestinations)
      .range(d3.schemeTableau10);

    // Select the SVG element and clear previous content
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 50); // Extra space for title and legend
    svg.selectAll("*").remove();

    // Add a group element for margins
    const chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add title
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", margin.top / 2 - 25)
      .attr("text-anchor", "middle")
      .style("font-size", "22px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text("Top 10 Recipients of Arms Trade by Supplier (in million USD)");

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
    const path = (d) => d3.line()(dimensions.map((dim) => [xScale(dim), yScales[dim](d[dim])]));

    // Draw each line for each data point with tooltip functionality
    chartGroup.selectAll("path")
      .data(filteredData)
      .join("path")
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", (d) => colorScale(d.recipient))
      .style("opacity", 0.7)
      .style("stroke-width", 1.5)
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).style("opacity", 1) // Highlight line
        .style("opacity", 1)              // Increase opacity for visibility
        .style("stroke-width", 8);
        tooltip.style("display", "block")
          .html(`
            <strong>Supplier:</strong> ${d.supplier}<br>
            <strong>Recipient:</strong> ${d.recipient}<br>
            <strong>Year:</strong> ${d.year}<br>
            <strong>Value:</strong> ${d.value.toLocaleString()} USD
          `);
      })
      .on("mousemove", (event) => {
        tooltip.style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget)
          .style("opacity", 0.7)            // Reset opacity
          .style("stroke-width", 1.5);      // Reset stroke-width
        tooltip.style("display", "none");
      });

    // Draw axes for each dimension
    dimensions.forEach((dim) => {
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
        .style("font-size", "14px")
        .style("font-weight", "bold");
    });

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + margin.left + 30}, ${margin.top})`);

    topDestinations.forEach((recipient, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colorScale(recipient));

      legendRow.append("text")
        .attr("x", 15)
        .attr("y", 10)
        .attr("text-anchor", "start")
        .style("font-size", "10px")
        .text(recipient);
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
