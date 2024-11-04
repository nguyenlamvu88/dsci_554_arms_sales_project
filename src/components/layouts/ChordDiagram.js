import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const ChordDiagram = ({ data }) => {
  const svgRef = useRef();
  const width = 700;
  const height = 700;
  const outerRadius = Math.min(width, height) * 0.5 - 40;
  const innerRadius = outerRadius - 20;

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Step 1: Create a matrix for the chord diagram
    const countryPairs = d3.rollups(
      data,
      v => d3.sum(v, d => d.number),
      d => `${d.destination_country}-${d.origin_country}` // Keep the order as destination-origin
    );

    // Get unique countries from the data
    const countries = [...new Set(data.flatMap(d => [d.destination_country, d.origin_country]))];

    const countryIndex = new Map(countries.map((country, i) => [country, i]));
    const matrix = Array.from({ length: countries.length }, () => Array(countries.length).fill(0));

    // Fill the matrix with migration flows, excluding same-origin and destination pairs
    data.forEach(d => {
      const destinationIdx = countryIndex.get(d.destination_country);
      const originIdx = countryIndex.get(d.origin_country);
      if (destinationIdx !== undefined && originIdx !== undefined && destinationIdx !== originIdx) { // Exclude same-origin pairs
        matrix[destinationIdx][originIdx] += d.number; // Use destination as row index and origin as column index
      }
    });

    // Step 2: Create the Chord Diagram
    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(countries);
    const chord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending)(matrix);
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
    const ribbon = d3.ribbon().radius(innerRadius);

    // Clear previous SVG content
    const svg = d3.select(svgRef.current)
      .attr("viewBox", [-width / 2, -height / 2, width, height]);
    svg.selectAll("*").remove(); // Clear previous content

    // Tooltip setup
    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("display", "none");

    // Step 3: Draw arcs (country segments)
    svg.append("g")
      .selectAll("path")
      .data(chord.groups)
      .join("path")
      .attr("fill", d => color(countries[d.index]))
      .attr("d", arc)
      .on("mouseover", (event, d) => {
        const country = countries[d.index];
        tooltip.style("display", "block")
          .html(`<strong>Country:</strong> ${country}`);
      })
      .on("mousemove", event => {
        tooltip.style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });

    // Step 4: Draw ribbons (migration flows)
    svg.append("g")
      .attr("fill-opacity", 0.7)
      .selectAll("path")
      .data(chord)
      .join("path")
      .attr("d", ribbon)
      .attr("fill", d => color(countries[d.source.index]))
      .attr("stroke", d => d3.rgb(color(countries[d.source.index])).darker())
      .on("mouseover", (event, d) => {
        const destination = countries[d.source.index];
        const origin = countries[d.target.index];
        const value = matrix[d.source.index][d.target.index];
        tooltip.style("display", "block")
          .html(`<strong>To:</strong> ${destination}<br><strong>From:</strong> ${origin}<br><strong>Number:</strong> ${value.toLocaleString()}`);
      })
      .on("mousemove", event => {
        tooltip.style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default ChordDiagram;
