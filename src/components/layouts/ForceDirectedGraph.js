import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const ForceDirectedGraph = ({ data }) => {
  const svgRef = useRef();
  const width = 900;
  const height = 600;

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Process nodes and links based on the dataset structure
    const nodesArray = data.map(d => ({
      name: d.country,
      total_outbound: +d.total_outbound,
      total_inbound: +d.total_inbound
    }));

    // Generate links based on top outbound and inbound countries
    const links = [];
    data.forEach(d => {
      const sourceCountry = d.country;

      // Ensure `top_outbound_countries` is parsed as an array
      let topOutboundCountries = d.top_outbound_countries;
      if (typeof topOutboundCountries === "string") {
        try {
          topOutboundCountries = JSON.parse(topOutboundCountries.replace(/'/g, '"')); // Convert to array if it's a string
        } catch (e) {
          console.error("Error parsing top_outbound_countries:", e);
          topOutboundCountries = []; // Default to an empty array if parsing fails
        }
      }

      // Create links to each outbound country
      topOutboundCountries.forEach(targetCountry => {
        const sourceNode = nodesArray.find(node => node.name === sourceCountry);
        const targetNode = nodesArray.find(node => node.name === targetCountry);
        if (sourceNode && targetNode) {
          links.push({
            source: sourceNode.name,
            target: targetNode.name
          });
        }
      });
    });

    // Define scales
    const colorScale = d3.scaleOrdinal()
      .domain(["source", "balanced", "destination"])
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    const nodeSizeScale = d3.scaleSqrt()
      .domain([0, d3.max(nodesArray, d => Math.max(d.total_outbound, d.total_inbound))])
      .range([5, 20]);

    svg.attr("viewBox", [0, 0, width, height]);

    // Add container group for zooming
    const container = svg.append("g");

    svg.call(d3.zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        container.attr("transform", event.transform); // apply zoom to container
      }));

    // Draw links with lower opacity for aesthetic effect
    const link = container.append("g")
      .attr("stroke-opacity", 0.3)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1);

    // Draw nodes with size and color based on migration volume
    const node = container.append("g")
      // .attr("stroke", "#fff")
      // .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodesArray)
      .join("circle")
      .attr("r", d => nodeSizeScale(Math.max(d.total_outbound, d.total_inbound)))
      .attr("fill", d => {
        if (d.total_outbound > d.total_inbound) return colorScale("source");
        else if (d.total_outbound < d.total_inbound) return colorScale("destination");
        return colorScale("balanced");
      })
      .call(d3.drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Add labels for each node
    const label = container.append("g")
      .selectAll("text")
      .data(nodesArray)
      .join("text")
      .attr("dx", 10)
      .attr("dy", 4)
      .attr("font-size", "10px")
      .attr("fill", "#ffffff")
      .text(d => d.name);

    // Tooltip for node hover details
    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("display", "none");

    node.on("mouseover", (event, d) => {
      tooltip.style("display", "block")
        .html(`
          <strong>Country:</strong> ${d.name}<br>
          <strong>Total Outbound:</strong> ${d.total_outbound}<br>
          <strong>Total Inbound:</strong> ${d.total_inbound}
        `);
    })
    .on("mousemove", (event) => {
      tooltip.style("top", `${event.pageY - 10}px`)
        .style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => tooltip.style("display", "none"));

    // Define simulation and apply forces
    const simulation = d3.forceSimulation(nodesArray)
      .force("link", d3.forceLink(links).id(d => d.name).distance(100).strength(0.3))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);

        label
          .attr("x", d => d.x)
          .attr("y", d => d.y);
      });

    // Add legend for color coding
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 200}, ${height - 50})`);

    const legendData = [
      { label: "Source (Most Outbound Countries)", color: "#1f77b4" },
      { label: "Destination (Most Inbound Countries)", color: "#2ca02c" }
    ];

    legend.selectAll("rect")
      .data(legendData)
      .join("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 20)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", d => d.color);

    legend.selectAll("text")
      .data(legendData)
      .join("text")
      .attr("x", 20)
      .attr("y", (d, i) => i * 20 + 10)
      .attr("font-size", "10px")
      .attr("fill", "#ffffff")
      .attr("font-weight", "bold")
      .text(d => d.label);

    // Cleanup on unmount
    return () => {
      tooltip.remove();
    };
  }, [data]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default ForceDirectedGraph;
