import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const ZoomableCirclePacking = ({ data }) => {
  const svgRef = useRef();
  const width = 650;
  const height = 600;
  const [selectedYear, setSelectedYear] = useState('2023');

  const availableYears = Array.from(new Set(data.children.flatMap(country => country.children.map(year => year.name)))).sort();

  // Define color scales outside of useEffect to ensure consistency
  const countryColorScale = d3.scaleOrdinal(d3.schemeSet3)
    .domain(data.children.map(d => d.name));

  // Fixed domain for consistent colors across years
  const colorScale = d3.scaleSequential(d3.interpolateCool)
    .domain([1, 3]);

  useEffect(() => {
    if (!selectedYear || !data) return;

    const yearData = {
      name: "World",
      children: data.children.map(country => ({
        name: country.name,
        children: country.children
          .filter(yearNode => yearNode.name === selectedYear)
          .map(yearNode => ({
            name: "Population",
            children: yearNode.children
              .filter(d => d.name === "Male Population" || d.name === "Female Population")
              .map(genderNode => ({ ...genderNode }))
          }))
      }))
    };

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "#f5f5f5")
      .style("border-radius", "8px")
      .style("cursor", "pointer");

    svg.selectAll('*').remove();

    // Add multi-line title to the SVG
    svg.append("text")
    .attr("x", width / 2) // Center the title horizontally
    .attr("y", 20) // Position it 20px from the top
    .attr("text-anchor", "middle") // Center-align the text
    .style("font-size", "18px") // Adjust font size as needed
    .style("fill", "#333") // Set color
    .style("font-weight", "bold") // Make text bold
    .append("tspan") // First line
      .attr("x", width / 2)
      .attr("dy", "0") // No vertical shift for the first line
      .text("Male vs. Female Population")
    .append("tspan") // Second line
      .attr("x", width / 2)
      .attr("dy", "1.2em") // Shift down for the second line
      .text("Zoomable Circle Packing Chart");

    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("padding", "10px")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("font-size", "12px")
      .style("display", "none")
      .style("z-index", "1000");

    const root = d3.hierarchy(yearData)
      .sum(d => d.value || 1)
      .sort((a, b) => b.value - a.value);

    const pack = d3.pack()
      .size([width - 10, height - 10])
      .padding(5);

    pack(root);

    let focus = root;
    let view;

    const zoomTo = (v) => {
      const k = width / v[2];
      view = v;

      // Apply transform to both circles and text elements
      node.attr("transform", d => `translate(${(d.x - v[0]) * k + width / 2}, ${(d.y - v[1]) * k + height / 2})`);
      node.select("circle").attr("r", d => d.r * k); // Update circle radius based on zoom level
    };

    const node = svg.append("g")
      .selectAll("g")
      .data(root.descendants().slice(1))
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    // Append circles within each group
    node.append("circle")
      .attr("fill", d => d.depth === 1 ? countryColorScale(d.data.name) : colorScale(d.depth))
      .attr("fill-opacity", d => d.depth === 1 ? 1 : 0.7)
      .attr("r", d => d.r)
      .on("mouseover", (event, d) => {
        tooltip
          .html(d.depth === 1
            ? `<strong>Country: ${d.data.name}</strong><br/>Total Population: ${d.value ? d.value.toLocaleString() : 'N/A'}`
            : `<strong>${d.data.name}</strong><br/>Population: ${d.value ? d.value.toLocaleString() : 'N/A'}`)
          .style("display", "block");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      })
      .on("click", (event, d) => {
        if (focus !== d) {
          focus = d;
          zoom(event, d);
          event.stopPropagation();
        }
      });

    // Append text labels for country names centered on top-level circles
    node.append("text")
      .filter(d => d.depth === 1) // Only apply to top-level countries
      .attr("text-anchor", "middle")
      .attr("y", d => d.r + 10) // Position slightly below the circle
      .text(d => d.data.name)
      .style("font-size", "12px")
      .style("fill", "#333")
      .style("pointer-events", "none");

    const label = svg.append("g")
      .style("font", "12px sans-serif")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .style("fill-opacity", d => d.parent === focus ? 1 : 0)
      .style("display", d => d.parent === focus ? "inline" : "none")
      .text(d => d.data.name);

    const zoom = (event, d) => {
      focus = d;

      const transition = svg.transition()
        .duration(750)
        .tween("zoom", () => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return t => zoomTo(i(t));
        });

      label
        .filter(d => d.parent === focus || (this && d3.select(this).style("display") === "inline"))
        .transition(transition)
        .style("fill-opacity", d => d.parent === focus ? 1 : 0)
        .style("display", d => d.parent === focus ? "inline" : "none");
    };

    // Call zoomTo immediately after creating the circles to set the initial view
    zoomTo([root.x, root.y, root.r * 2]);

    svg.on("click", (event) => zoom(event, root));

    return () => tooltip.remove();
  }, [data, selectedYear]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
      <label htmlFor="year-select" style={{ position: 'absolute', top: '10px', right: '140px', color: '#0db4de', fontWeight: 'bold' }}>Select Year:</label>
      <select
        id="year-select"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '8px',
          backgroundColor: '#2c2f33',
          color: '#e6e6e6',
          border: '1px solid #5a5e65',
          borderRadius: '5px',
          fontSize: '1rem',
          cursor: "pointer"
        }}
        onChange={(e) => setSelectedYear(e.target.value)}
        value={selectedYear}
      >
        <option value="" disabled>Select year</option>
        {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
      </select>
      
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
};

export default ZoomableCirclePacking;
