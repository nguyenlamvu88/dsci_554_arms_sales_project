import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

const LineChart = ({ dataUrl }) => {
  const svgRef = useRef();
  const width = 900;
  const height = 500;
  const margin = { top: 60, right: 30, bottom: 60, left: 100 }; // Increased left margin for better Y-axis label spacing
  const [data, setData] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [yearRange, setYearRange] = useState([1950, 2023]);

  useEffect(() => {
    d3.csv(dataUrl).then(rawData => {
      const countryTotals = rawData.map(row => ({
        country: row.Recipient,
        total: Object.keys(row)
          .filter(year => !isNaN(year))
          .reduce((sum, year) => sum + (+row[year] || 0), 0)
      }));
      
      const top10Countries = countryTotals
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
        .map(d => d.country);

      const processedData = rawData
        .filter(row => top10Countries.includes(row.Recipient))
        .map(row => ({
          country: row.Recipient,
          values: Object.keys(row)
            .filter(year => !isNaN(year))
            .map(year => ({ year: +year, value: (+row[year] || 0) / 1000 })) // Convert to billions
        }));

      setData(processedData);
      setSelectedCountries(top10Countries.filter(
        country => !['Total', 'Saudi Arabia', 'Egypt', 'Japan', 'Turkiye', 'South Korea', 'Germany', 'Iraq'].includes(country)
      ));      
      }).catch(error => console.error("Error loading or processing data:", error));
    }, [dataUrl]);

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "gray")
      .style("border-radius", "8px");

    svg.selectAll('*').remove();

    // Add title
    svg.append("text")
    .attr("x", width / 2) // Center horizontally
    .attr("y", margin.top / 2) // Position at the top
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .style("fill", "#333")
    .text("Arms Imports by Country (Top 10) Over Time");

    // Add Y-axis label
    svg.append("text")
    .attr("transform", "rotate(-90)") // Rotate the text vertically
    .attr("x", -height / 2) // Center along the Y-axis
    .attr("y", margin.left / 4) // Position near the Y-axis, adjust for spacing
    .attr("dy", "1em") // Slight padding for readability
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("fill", "#333")
    .text("Arms Imports Value (Billions)");

    // Tooltip setup
    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("padding", "8px")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("display", "none");

    const filteredData = data
      .filter(d => selectedCountries.includes(d.country))
      .map(d => ({
        ...d,
        values: d.values.filter(v => v.year >= yearRange[0] && v.year <= yearRange[1])
      }));

    const xScale = d3.scaleLinear()
      .domain(yearRange)
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d3.max(d.values, v => v.value))])
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.value));

    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}B`)); // Format Y-axis in billions

    svg.selectAll(".line")
      .data(filteredData)
      .join("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", (d, i) => d3.schemeCategory10[i % 10])
      .attr("stroke-width", 3.5)
      .attr("d", d => line(d.values));

    svg.selectAll(".dot")
      .data(filteredData.flatMap(d => d.values.map(v => ({ ...v, country: d.country }))))
      .join("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.value))
      .attr("r", 3)
      .attr("fill", d => d3.schemeCategory10[selectedCountries.indexOf(d.country) % 10])
      .on("mouseover", (event, d) => {
        tooltip
          .style("display", "block")
          .html(`<strong>${d.country}</strong><br/>Year: ${d.year}<br/>Imports: ${d.value.toFixed(2)} Billion`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", () => tooltip.style("display", "none"));

    svg.selectAll(".country-label")
      .data(filteredData)
      .join("text")
      .attr("class", "country-label")
      .attr("x", width - margin.right)
      .attr("y", d => yScale(d.values[d.values.length - 1].value))
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .text(d => d.country)
      .style("fill", (d, i) => d3.schemeCategory10[i % 10])
      .style("font-size", "12px");

    return () => tooltip.remove();
  }, [data, selectedCountries, yearRange]);

  const handleCountryToggle = (country) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#333', borderRadius: '8px' }}>
      <div style={{ marginBottom: '20px', color: '#e6e6e6' }}>
        <label style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px', marginLeft: '20px' }}>Year Range:</label>
        <RangeSlider
          min={1950}
          max={2023}
          defaultValue={yearRange}
          onInput={(values) => setYearRange(values)}
          style={{ width: '100%', margin: '10px 0' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0db4de', fontSize: '14px', marginTop: '10px' }}>
          <span>{yearRange[0]}</span>
          <span>{yearRange[1]}</span>
        </div>
      </div>

      <div style={{ marginBottom: '20px', color: '#e6e6e6' }}>
        <label style={{ fontWeight: 'bold', fontSize: '16px'}}>Select Countries:</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
          {data.map(d => (
            <div key={d.country} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                value={d.country}
                checked={selectedCountries.includes(d.country)}
                onChange={() => handleCountryToggle(d.country)}
                style={{ marginRight: '5px' }}
              />
              <label>{d.country}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', color: '#e6e6e6' }}>
        {selectedCountries.map((country, index) => (
          <div key={country} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: d3.schemeCategory10[index % 10],
              marginRight: '8px',
              borderRadius: '50%'
            }}></div>
            <span>{country}</span>
          </div>
        ))}
      </div>

      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
};

export default LineChart;
