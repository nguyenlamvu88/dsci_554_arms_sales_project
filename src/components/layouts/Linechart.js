import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

const LineChart = () => {
  const svgRef = useRef();
  const width = 800;
  const height = 550;
  const margin = { top: 60, right: 100, bottom: 60, left: 100 };
  const [data, setData] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState(['India', 'China']);
  const [yearRange, setYearRange] = useState([1950, 2023]);
  const [tradeType, setTradeType] = useState('export');
  const [loading, setLoading] = useState(true);

  // Set URLs for arms trade data
  const armsSuppliersDataUrl = 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_arms_suppliers.csv';
  const armsRecipientsDataUrl = 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_arms_recipients.csv';

  useEffect(() => {
    const dataUrl = tradeType === 'import' ? armsRecipientsDataUrl : armsSuppliersDataUrl;
    const countryKey = tradeType === 'import' ? 'Recipient' : 'supplier';

    setLoading(true);
    d3.csv(dataUrl).then(rawData => {
      const yearColumns = Object.keys(rawData[0]).filter(col => !isNaN(col));
      const countryTotals = rawData.map(row => ({
        country: row[countryKey],
        total: yearColumns.reduce((sum, year) => sum + (+row[year] || 0), 0)
      }));

      const top10Countries = countryTotals
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
        .map(d => d.country);

      const processedData = rawData
        .filter(row => top10Countries.includes(row[countryKey]))
        .map(row => ({
          country: row[countryKey],
          values: yearColumns.map(year => ({ year: +year, value: (+row[year] || 0) / 1000 }))
        }));

      setData(processedData);

      // Set selectedCountries based on tradeType
      if (tradeType === 'export') {
        setSelectedCountries(['United States', 'China', 'Russia'].filter(c => top10Countries.includes(c)));
      } else if (tradeType === 'import') {
        setSelectedCountries(['China', 'India'].filter(c => top10Countries.includes(c)));
      }

      setLoading(false);
    }).catch(error => {
      console.error("Error loading or processing data:", error);
      setLoading(false);
    });
  }, [tradeType]);

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "gray")
      .style("border-radius", "8px");

    svg.selectAll('*').remove();

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text(`Arms ${tradeType === 'import' ? 'Imports' : 'Exports'} by Country (Top 9) Over Time`);

    // Y-axis Label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", margin.left / 4)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "white")
      .style("font-weight", "bold")
      .text(`Value (Billions USD)`);

    // Tooltip and vertical line
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("padding", "8px")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("border-radius", "4px")
      .style("font-size", "15px")
      .style("display", "none");

    const verticalLine = svg.append("line")
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4 4")
      .style("display", "none");

    // Filter data based on selected countries and year range
    const filteredData = data
      .filter(d => selectedCountries.includes(d.country))
      .map(d => ({
        ...d,
        values: d.values.filter(v => v.year >= yearRange[0] && v.year <= yearRange[1])
      }));

    // Define scales
    const xScale = d3.scaleLinear()
      .domain(yearRange)
      .range([margin.left, width - margin.right]);

    const yMax = d3.max(filteredData, d => d3.max(d.values, v => v.value)) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(selectedCountries);

    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.value));

    // X and Y Axes
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}B`));

    // Draw lines
    svg.selectAll(".line")
      .data(filteredData)
      .join("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", d => {
        if (d.country === 'United States') return '#4682B4'; // Color for United States
        if (d.country === 'China') return '#DC143C';          // Color for China
        if (d.country === 'Russia') return '#FFDB58';         // Color for Russia
        return color(d.country);                              // Default color scale for other countries
      })
      .attr("stroke-width", 3.25)
      .attr("d", d => line(d.values));

    // Draw dots
    svg.selectAll(".dot")
      .data(filteredData.flatMap(d => d.values.map(v => ({ ...v, country: d.country }))))
      .join("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.value))
      .attr("r", 5.5)
      .attr("fill", d => {
        if (d.country === 'United States') return '#4682B4'; // Color for United States
        if (d.country === 'China') return '#DC143C';          // Color for China
        if (d.country === 'Russia') return '#FFDB58';         // Color for Russia
        return color(d.country);                              // Default color scale for other countries
      })
      .on("mouseover", (event, d) => {
        verticalLine.style("display", "block");
        tooltip.style("display", "block");
      })
      .on("mousemove", (event) => {
        const mouseX = event.pageX - svg.node().getBoundingClientRect().left;
        verticalLine.attr("x1", mouseX).attr("x2", mouseX);

        const tooltipData = filteredData
          .map(countryData => {
            const closestPoint = countryData.values.reduce((prev, curr) =>
              Math.abs(curr.year - xScale.invert(mouseX)) < Math.abs(prev.year - xScale.invert(mouseX)) ? curr : prev
            );
            return `<strong>${countryData.country}</strong><br/>Year: ${closestPoint.year}<br/>Value: ${closestPoint.value.toFixed(2)} Billion`;
          }).join("<br/><br/>");

        tooltip
          .html(tooltipData)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", () => {
        verticalLine.style("display", "none");
        tooltip.style("display", "none");
      });

    // Country labels
    svg.selectAll(".country-label")
      .data(filteredData)
      .join("text")
      .attr("class", "country-label")
      .attr("x", width - margin.right + 5) // Position to the right of the line
      .attr("y", d => yScale(d.values[d.values.length - 1].value))
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .text(d => d.country)
      .style("fill", d => {
        if (d.country === 'United States') return '#4682B4'; // Color for United States
        if (d.country === 'China') return '#DC143C';          // Color for China
        if (d.country === 'Russia') return '#FFDB58';         // Color for Russia
        return color(d.country);                              // Default color scale for other countries
      })
      .style("font-size", "12px");

    // Cleanup on unmount
    return () => {
      tooltip.remove();
      verticalLine.remove();
    };
  }, [data, selectedCountries, yearRange, tradeType]);

  const handleCountryToggle = (country) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  const handleTradeTypeChange = (event) => {
    const newTradeType = event.target.value;
    setTradeType(newTradeType);
    if (newTradeType === 'export') {
      setSelectedCountries(['United States', 'China', 'Russia']);
    } else if (newTradeType === 'import') {
      setSelectedCountries(['China', 'India']);
    }
  };

  const resetSelections = () => {
    setTradeType('export');
    setYearRange([1950, 2023]);
    setSelectedCountries(['United States', 'China', 'Russia']);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', padding: '20px', backgroundColor: '#333', borderRadius: '8px' }}>
      <div style={{ flex: '1' }}>
        <svg ref={svgRef} width={width} height={height}></svg>
      </div>

      <div style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', color: '#e6e6e6' }}>
        <label style={{ fontWeight: 'bold', fontSize: '16px' }}>Trade Type:</label>
        <select value={tradeType} onChange={handleTradeTypeChange} style={{ margin: '10px 0', padding: '5px' }}>
          <option value="import">Imports</option>
          <option value="export">Exports</option>
        </select>

        <button onClick={resetSelections}
          style={{
            backgroundColor: '#0db4de',
            color: '#fff',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            marginTop: '10px'
          }}
        >
          Reset Selections
        </button>

        <div style={{ marginTop: '20px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '16px' }}></label>
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

        <label style={{ fontWeight: 'bold', fontSize: '16px', marginTop: '20px' }}>Select Countries:</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: '10px', marginTop: '10px' }}>
          {data.map(d => (
            <div key={d.country} style={{ display: 'flex', alignItems: 'center' }}>
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
    </div>
  );
};

export default LineChart;
