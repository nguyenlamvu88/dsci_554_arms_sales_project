import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const ChordDiagram = () => {
  const svgRef = useRef();
  const width = 700;
  const height = 700;
  const outerRadius = Math.min(width, height) * 0.5 - 40;
  const innerRadius = outerRadius - 20;

  const tradeDataUrl = 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_arms_trade_hierarchical_map.json';

  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch the data from the provided URL
    d3.json(tradeDataUrl)
      .then(fetchedData => {
        // Transform data to calculate total trade amounts by country pairs
        const transformedData = transformData(fetchedData);
        setData(transformedData);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  const transformData = (rawData) => {
    if (!rawData || !rawData[0] || !rawData[0].children) return { matrix: [], countryArray: [] };

    const countryPairs = {};
    const countries = new Set();

    rawData[0].children.forEach((countryData) => {
      const originCountry = countryData.name;
      countries.add(originCountry);

      countryData.children.forEach((yearData) => {
        const amount = yearData.amount;

        // Check for or create entry for each country pair (for simplicity, self-pairs are ignored)
        rawData[0].children.forEach((destinationData) => {
          const destinationCountry = destinationData.name;
          if (originCountry !== destinationCountry) {
            const key = `${originCountry}-${destinationCountry}`;
            countryPairs[key] = (countryPairs[key] || 0) + amount;
            countries.add(destinationCountry);
          }
        });
      });
    });

    // Prepare countries as array and create a country index map
    const countryArray = Array.from(countries);
    const countryIndex = new Map(countryArray.map((country, i) => [country, i]));
    const matrix = Array.from({ length: countryArray.length }, () => Array(countryArray.length).fill(0));

    // Fill the matrix based on the calculated countryPairs
    Object.entries(countryPairs).forEach(([key, value]) => {
      const [origin, destination] = key.split("-");
      const originIdx = countryIndex.get(origin);
      const destinationIdx = countryIndex.get(destination);
      if (originIdx !== undefined && destinationIdx !== undefined) {
        matrix[originIdx][destinationIdx] = value;
      }
    });

    return { matrix, countryArray };
  };

  useEffect(() => {
    if (!data || !data.matrix || data.matrix.length === 0) return;

    const { matrix, countryArray } = data;

    // Step 2: Create the Chord Diagram
    const color = d3.scaleOrdinal(d3.schemeTableau10).domain(countryArray);
    const chord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending)(matrix);
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
    const ribbon = d3.ribbon().radius(innerRadius);

    // Clear previous SVG content
    const svg = d3.select(svgRef.current)
      .attr("viewBox", [-width / 2, -height / 2, width, height]);
    svg.selectAll("*").remove();

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
      .attr("fill", d => color(countryArray[d.index]))
      .attr("stroke", d => d3.rgb(color(countryArray[d.index])).darker())
      .attr("d", arc)
      .style("opacity", 0.8)
      .on("mouseover", (event, d) => {
        const country = countryArray[d.index];
        tooltip.style("display", "block")
          .html(`<strong>Country:</strong> ${country}`);
        d3.select(event.currentTarget).style("opacity", 1); // Highlight arc
      })
      .on("mousemove", event => {
        tooltip.style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", (event) => {
        tooltip.style("display", "none");
        d3.select(event.currentTarget).style("opacity", 0.8); // Reset opacity
      });

    // Step 4: Draw ribbons (trade flows)
    svg.append("g")
      .attr("fill-opacity", 0.7)
      .selectAll("path")
      .data(chord)
      .join("path")
      .attr("d", ribbon)
      .attr("fill", d => color(countryArray[d.source.index]))
      .attr("stroke", d => d3.rgb(color(countryArray[d.source.index])).darker())
      .on("mouseover", (event, d) => {
        const destination = countryArray[d.source.index];
        const origin = countryArray[d.target.index];
        const value = matrix[d.source.index][d.target.index];
        tooltip.style("display", "block")
          .html(`<strong>To:</strong> ${destination}<br><strong>From:</strong> ${origin}<br><strong>Number:</strong> ${value.toLocaleString()}`);
        d3.select(event.currentTarget).style("opacity", 1); // Highlight ribbon
      })
      .on("mousemove", event => {
        tooltip.style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", (event) => {
        tooltip.style("display", "none");
        d3.select(event.currentTarget).style("opacity", 0.7); // Reset opacity
      });

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default ChordDiagram;
