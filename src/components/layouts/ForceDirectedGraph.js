import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const ForceDirectedGraph = () => {
  const svgRef = useRef();
  const width = 900;
  const height = 600;
  const dataUrl = 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_recipients_of_combined_us_china_russia_arms_hierarchical.json';
  
  // State for the selected year
  const [selectedYear, setSelectedYear] = useState(2023);

  useEffect(() => {
    // Fetch data from the provided URL
    d3.json(dataUrl).then(rawData => {
      const data = rawData.data; // Access the main data array

      // Clear previous SVG contents
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      // Process nodes and links based on the dataset structure and selected year
      const nodesArray = [];
      const links = [];
      const nodeMap = new Map(); // For faster lookup and avoiding duplicates

      data.forEach(supplierEntry => {
        const supplier = supplierEntry.supplier;
        if (!nodeMap.has(supplier)) {
          nodeMap.set(supplier, { name: supplier, group: 'supplier' });
          nodesArray.push({ name: supplier, group: 'supplier' });
        }

        supplierEntry.recipients.forEach(recipientEntry => {
          const recipient = recipientEntry.recipient;
          const tradeValue = recipientEntry.years[selectedYear] || 0;

          // Only add the link if there's a trade value for the selected year
          if (tradeValue > 0) {
            if (!nodeMap.has(recipient)) {
              nodeMap.set(recipient, { name: recipient, group: 'recipient' });
              nodesArray.push({ name: recipient, group: 'recipient' });
            }
            links.push({
              source: supplier,
              target: recipient,
              value: tradeValue,
            });
          }
        });
      });

      // Define color assignments for specific suppliers
      const colorScale = d3.scaleOrdinal()
        .domain(['United States', 'Russia', 'China'])
        .range(['#1f77b4', '#8b4513', '#2ca02c']); // Blue for US, Brown for Russia, Green for China

      const nodeSizeScale = d3.scaleSqrt()
        .domain([0, d3.max(links, d => d.value)])
        .range([5, 20]);

      svg.attr("viewBox", [0, 0, width, height]);

      // Add container group for zooming
      const container = svg.append("g");

      svg.call(d3.zoom()
        .scaleExtent([0.5, 5])
        .on("zoom", (event) => {
          container.attr("transform", event.transform);
        }));

      // Draw links with lower opacity for aesthetic effect
      const link = container.append("g")
        .attr("stroke-opacity", 0.3)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", "#aaa")
        .attr("stroke-width", d => d.value / 1000);

      // Draw nodes with size and color based on group
      const node = container.append("g")
        .selectAll("circle")
        .data(nodesArray)
        .join("circle")
        .attr("r", d => nodeSizeScale(links.find(link => link.target === d.name || link.source === d.name)?.value || 1))
        .attr("fill", d => {
          if (d.group === 'supplier') return colorScale(d.name) || '#ccc';
          return '#ccc'; // Default color for recipients
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
            <strong>Type:</strong> ${d.group}
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

      // Cleanup on unmount
      return () => {
        tooltip.remove();
      };
    });
  }, [selectedYear]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width={width} height={height}></svg>
      <div style={{ position: 'absolute', top: 10, left: 10, color: 'white' }}>
        <label>Year: {selectedYear}</label>
        <input
          type="range"
          min="1950"
          max="2023"
          value={selectedYear}
          onChange={(e) => setSelectedYear(+e.target.value)}
          style={{ width: '200px' }}
        />
      </div>
    </div>
  );
};

export default ForceDirectedGraph;
