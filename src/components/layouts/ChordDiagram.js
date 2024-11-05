import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const ChordDiagram = () => {
  const svgRef = useRef();
  const width = 700;
  const height = 700;
  const outerRadius = Math.min(width, height) * 0.5 - 40;
  const innerRadius = outerRadius - 20;

  const dataUrl = 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_recipients_of_combined_us_china_russia_arms_hierarchical.json';

  const [data, setData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [years, setYears] = useState([]);

  useEffect(() => {
    // Fetch data from the URL
    d3.json(dataUrl)
      .then(fetchedData => {
        const uniqueYears = new Set();

        // Extract unique years for the dropdown
        fetchedData.data.forEach(supplierData => {
          supplierData.recipients.forEach(recipientData => {
            Object.keys(recipientData.years).forEach(year => uniqueYears.add(year));
          });
        });

        setYears([...uniqueYears].sort());
        setSelectedYear([...uniqueYears][0]);
        setData(fetchedData.data);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  const transformData = (rawData, year) => {
    if (!rawData) return { matrix: [], countryArray: [] };

    const countryPairs = {};
    const countries = new Set(["United States", "China", "Russia"]); // Ensure suppliers are included

    // Filter top 5 recipients for each supplier for the selected year
    rawData.forEach(supplierData => {
      const supplier = supplierData.supplier;
      const recipientTotals = supplierData.recipients
        .map(recipientData => ({
          recipient: recipientData.recipient,
          value: recipientData.years[year] || 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Get top 5 recipients

      recipientTotals.forEach(({ recipient, value }) => {
        const key = `${supplier}-${recipient}`;
        countryPairs[key] = value;
        countries.add(supplier);
        countries.add(recipient);
      });
    });

    // Convert filtered data to matrix format
    const countryArray = Array.from(countries).sort();
    const countryIndex = new Map(countryArray.map((country, i) => [country, i]));
    const matrix = Array.from({ length: countryArray.length }, () => Array(countryArray.length).fill(0));

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
    if (!data || !selectedYear) return;

    const transformedData = transformData(data, selectedYear);
    const { matrix, countryArray } = transformedData;

    // Set up color scale for countries
    const color = d3.scaleOrdinal()
      .domain(countryArray)
      .range(["#1f77b4", "#d62728", "#2ca02c", ...d3.schemeTableau10]); // Blue for US, Brown for Russia, Green for China

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

    // Draw arcs (country segments)
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
        d3.select(event.currentTarget).style("opacity", 1);
      })
      .on("mousemove", event => {
        tooltip.style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", (event) => {
        tooltip.style("display", "none");
        d3.select(event.currentTarget).style("opacity", 0.8);
      });

    // Draw ribbons (trade flows)
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
          .html(`<strong>To:</strong> ${destination}<br><strong>From:</strong> ${origin}<br><strong>Value:</strong> ${value.toLocaleString()}`);
        d3.select(event.currentTarget).style("opacity", 1);
      })
      .on("mousemove", event => {
        tooltip.style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", (event) => {
        tooltip.style("display", "none");
        d3.select(event.currentTarget).style("opacity", 0.7);
      });

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, selectedYear]);

  return (
    <div>
      <h2>Arms Trade Flow between Major Global Suppliers and Top Recipients by Year</h2>
      <label>
        Select Year:
        <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value, 10))}>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </label>
      <svg ref={svgRef}></svg>
    </div>
  );
  
};

export default ChordDiagram;
