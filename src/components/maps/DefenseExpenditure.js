// DefenseExpenditure.js
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const DefenseExpenditure = () => {
  const svgRef = useRef();
  const lineChartRef = useRef();

  // State Variables
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });
  const [lineTooltip, setLineTooltip] = useState({ visible: false, x: 0, y: 0, content: null });
  const [countryData, setCountryData] = useState({});
  const [countries, setCountries] = useState([]);
  const [selectedYear, setSelectedYear] = useState(1960);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const minYear = 1960;
  const maxYear = 2022;

  const targetCountries = ["United States", "China", "Russia"];
  const countryNameMapping = {
    "United States": "United States of America",
    "Russian Federation": "Russia",
    "Vietnam": "Viet Nam",
  };

  const dataUrl = "https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_defense_expenditure_by_country.csv";

  useEffect(() => {
    setLoading(true);
    Promise.all([
      d3.json('https://unpkg.com/world-atlas@2/countries-110m.json'),
      d3.csv(dataUrl, d => {
        const parsedData = { Country: d.Country };
        for (let year = minYear; year <= maxYear; year++) {
          parsedData[year] = +d[year] || 0;
        }
        return parsedData;
      })
    ])
    .then(([worldData, defenseData]) => {
      const countriesData = topojson.feature(worldData, worldData.objects.countries).features;
      setCountries(countriesData);

      const processedData = {};
      defenseData.forEach(row => {
        const countryName = countryNameMapping[row.Country] || row.Country;
        processedData[countryName] = row;
      });

      setCountryData(processedData);
      setLoading(false);
    })
    .catch(error => {
      console.error("Error loading data:", error);
      setError("Failed to load data.");
      setLoading(false);
    });
  }, []);

  // Animate year slider on initial load
  useEffect(() => {
    const playAnimation = () => {
      setSelectedYear(minYear);
      const interval = setInterval(() => {
        setSelectedYear(prevYear => {
          if (prevYear < maxYear) {
            return prevYear + 1;
          } else {
            clearInterval(interval);
            return prevYear;
          }
        });
      }, 220); // Animation speed
    };

    playAnimation();
    return () => clearInterval(playAnimation);
  }, [minYear, maxYear]);

  useEffect(() => {
    if (loading || error || !countries.length || !Object.keys(countryData).length) return;

    const width = 820;
    const height = 545;
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto');

    const projection = d3.geoMercator().center([0, 20]).scale(130).translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);

    const minExpenditure = d3.min(Object.values(countryData), d => d[selectedYear] > 0 ? d[selectedYear] : null);
    const maxExpenditure = d3.max(Object.values(countryData), d => d[selectedYear] || 0);

    let colorScale;
    if (minExpenditure && maxExpenditure && minExpenditure < maxExpenditure) {
      colorScale = d3.scaleSequentialLog(d3.interpolateBlues).domain([minExpenditure, maxExpenditure]);
    } else if (maxExpenditure > 0) {
      colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, maxExpenditure]);
    } else {
      colorScale = () => '#ccc';
    }

    svg.selectAll("g.map-group").remove();  // Clear any previous map group
    const g = svg.append("g").attr("class", "map-group");

    svg.call(d3.zoom().scaleExtent([1, 8]).on('zoom', (event) => {
      g.attr('transform', event.transform);
    }));

    g.selectAll('path')
      .data(countries)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => {
        const country = d.properties.name;
        const value = countryData[country]?.[selectedYear];
        return value > 0 ? colorScale(value) : '#ccc';
      })
      .attr('stroke', '#333')
      .on('mouseenter', (event, d) => {
        const country = d.properties.name;
        const value = countryData[country]?.[selectedYear] || 0;
        setTooltip({
          visible: true,
          x: event.clientX + 10,
          y: event.clientY + 10,
          content: `${country}: $${value.toFixed(2)} Billion in ${selectedYear}`
        });
      })
      .on('mousemove', (event) => {
        setTooltip(prev => ({ ...prev, x: event.clientX + 10, y: event.clientY + 10 }));
      })
      .on('mouseleave', () => setTooltip({ visible: false, x: 0, y: 0, content: null }));

    // Add Legend outside the zoomable map group
    svg.selectAll("g.legend").remove();  // Clear any previous legend group
    const legendWidth = 200;
    const legendHeight = 10;
    const legendX = width - legendWidth - 50;
    const legendY = height - 80;

    const legendDefs = svg.append('defs');
    const linearGradient = legendDefs.append('linearGradient').attr('id', 'legend-gradient');

    linearGradient.selectAll('stop')
      .data([
        { offset: '0%', color: colorScale.range()[0] },
        { offset: '100%', color: colorScale.range()[1] }
      ])
      .enter()
      .append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

    const legendGroup = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendX},${legendY})`);

    legendGroup.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)')
      .style('stroke', '#333')
      .style('stroke-width', '1px');

    const legendScale = d3.scaleLinear().domain(colorScale.domain()).range([0, legendWidth]);
    const legendAxis = d3.axisBottom(legendScale).ticks(5).tickFormat(d => `$${d}B`);

    legendGroup.append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", 'white');
  
  }, [countries, countryData, selectedYear, loading, error]);

  // Render line chart for target countries
  useEffect(() => {
    if (!lineChartRef.current || !Object.keys(countryData).length) return;

    const mappedTargetCountries = targetCountries.map(country => countryNameMapping[country] || country);
    const years = d3.range(minYear, selectedYear + 1);
    const lineData = mappedTargetCountries.map(country => ({
      country,
      values: years.map(year => ({
        year,
        value: countryData[country] ? countryData[country][year] : 0
      }))
    }));

    const margin = { top: 10, right: 15, bottom: 15, left: 40 };
    const width = 300 - margin.left - margin.right;
    const height = 220 - margin.top - margin.bottom;

    const svg = d3.select(lineChartRef.current);
    svg.selectAll("*").remove();

    const chartGroup = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([minYear, maxYear])
      .range([0, width]);

    const yMax = d3.max(lineData, c => d3.max(c.values, v => v.value)) || 1;
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([height, 0]);

    chartGroup.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
      .selectAll("text")
      .style("font-size", "8px")
      .style("fill", 'silver');

    chartGroup.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}B`))
      .selectAll("text")
      .style("font-size", "9px")
      .style("fill", 'silver');

    const colorMap = {
      "United States of America": "#4682B4",
      "China": "#FFDB58",
      "Russia": "#DC143C"
    };

    const lineGenerator = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.value));

    lineData.forEach(d => {
      chartGroup.append('path')
        .datum(d.values)
        .attr('fill', 'none')
        .attr('stroke', colorMap[d.country])
        .attr('stroke-width', 1.5)
        .attr('d', lineGenerator);
    });

    lineData.forEach(d => {
      chartGroup.selectAll(`.circle-${d.country}`)
        .data(d.values)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.year))
        .attr('cy', d => yScale(d.value))
        .attr('r', 2)
        .attr('fill', colorMap[d.country])
        .on('mouseenter', (event, datum) => {
          setLineTooltip({
            visible: true,
            x: event.clientX + 10,
            y: event.clientY + 10,
            content: `${d.country}: $${datum.value.toFixed(2)} Billion in ${datum.year}`
          });
        })
        .on('mousemove', (event) => {
          setLineTooltip(prev => ({
            ...prev,
            x: event.clientX + 80,
            y: event.clientY + 5
          }));
        })
        .on('mouseleave', () => setLineTooltip({ visible: false, x: 0, y: 0, content: null }));
    });

    // Define display name mapping
    const displayNameMap = {
      "United States of America": "U.S.",
      "China": "China",
      "Russia": "Russia"
    };

    // Add Legend for Line Chart
    const legend = chartGroup.selectAll(".legend")
      .data(mappedTargetCountries)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (_, i) => `translate(${width - 230},${i * 10})`);

    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 3)
      .style("fill", d => colorMap[d]);

    legend.append("text")
      .attr("x", 6)
      .attr("y", 1)
      .text(d => displayNameMap[d] || d)
      .attr("text-anchor", "start")
      .style("font-size", "8px")
      .style("fill", 'silver');
  }, [countryData, selectedYear]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div style={{ width: '100%', height: '100%' }}>
          <h3 style={{
            textAlign: 'center',
            fontSize: '24px',
            color: 'rgb(71, 123, 202)',
            paddingTop: '20px',
          }}>
            Defense Expenditure by Country and Year
          </h3>
          {loading && <div style={{ textAlign: 'center' }}>Loading data...</div>}
          {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

          {!loading && !error && (
            <>
              <input
                type="range"
                min={minYear}
                max={maxYear}
                value={selectedYear}
                onChange={(e) => setSelectedYear(+e.target.value)}
                style={{
                  width: '80%',
                  appearance: 'none',
                  height: '8px',
                  backgroundColor: 'gray)',
                  borderRadius: '5px',
                  outline: 'none',
                  margin: '20px auto 10px',
                  display: 'block',
                }}
              />
              <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: 'rgb(71, 123, 202)' }}>Year: {selectedYear}</div>
              <svg ref={svgRef} style={{ width: '100%', height: '80vh', border: '1px solid #ccc' }} aria-label="Defense Expenditure Map"></svg>

              {tooltip.visible && (
                <div style={{
                  position: 'fixed',
                  top: tooltip.y,
                  left: tooltip.x,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: '#fff',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  pointerEvents: 'none',
                  transform: 'translate(-50%, -100%)',
                  whiteSpace: 'nowrap',
                  fontSize: '12px',
                  zIndex: 1000
                }}>
                  {tooltip.content}
                </div>
              )}
            </>
          )}
        </div>

        {/* Line Chart Overlay */}
        <div style={{
          position: 'fixed',
          top: '680px',
          right: '950px',
          backgroundColor: '',
          padding: '8px',
          borderRadius: '6px',
          boxShadow: '0 0 8px rgba(0,0,0,0.2)',
          width: '315px',
          height: '250px',
          overflow: 'hidden'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '10px', color: 'silver' }}>
            Defense Expenditure of U.S, China, Russia 
          </h4>
          <svg ref={lineChartRef} style={{ width: '100%', height: '100%' }}></svg>

          {lineTooltip.visible && (
            <div style={{
              position: 'fixed',
              top: lineTooltip.y,
              left: lineTooltip.x,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: '#ff0',
              padding: '6px 8px',
              borderRadius: '4px',
              pointerEvents: 'none',
              transform: 'translate(-50%, -100%)',
              whiteSpace: 'nowrap',
              fontSize: '10px',
              zIndex: 1000
            }}>
              {lineTooltip.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DefenseExpenditure;
