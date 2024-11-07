// src/components/maps/DotMap.js
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const DotMap = () => {
  const svgRef = useRef();
  const containerRef = useRef(); // Added ref for the container
  const [data, setData] = useState({ csvData: [], mapData: {} });
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });
  const [selectedYear, setSelectedYear] = useState('2023');
  const [uniqueYears, setUniqueYears] = useState([]);

  const conflictsDataUrl = 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_conflicts_locations_with_coordinates.csv';

  useEffect(() => {
    // Load CSV data and TopoJSON map data
    Promise.all([
      d3.csv(conflictsDataUrl),
      d3.json('https://unpkg.com/world-atlas@2/countries-110m.json')
    ]).then(([csvData, mapData]) => {
      
      // Calculate intensity as the count of conflicts per location per year
      const intensityData = d3.rollup(
        csvData,
        v => v.length,
        d => `${d.location}_${d.year}`
      );

      csvData.forEach(d => {
        d.year = +d.year;
        d.latitude = +d.latitude;
        d.longitude = +d.longitude;
        // Set intensity based on location and year
        d.intensity = intensityData.get(`${d.location}_${d.year}`) || 1;
      });

      setData({ csvData, mapData });

      // Extract unique years for the slider range
      const years = Array.from(new Set(csvData.map(d => d.year))).sort((a, b) => a - b);
      setUniqueYears(years);

      // Set the default year to the earliest available year
      setSelectedYear(years[0]);

      console.log("CSV Data Loaded with Intensity:", csvData);
      console.log("Map Data Loaded:", mapData);
    }).catch(error => console.error("Error loading data:", error));
  }, []);

  useEffect(() => {
    if (data.csvData.length > 0 && Object.keys(data.mapData).length > 0) {
      drawMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, data]);

  const drawMap = () => {
    const width = 1000;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "#e6f7ff");

    svg.selectAll("*").remove();

    const projection = d3.geoMercator()
      .center([0, 20])
      .scale(150)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        mapGroup.attr("transform", event.transform);  // Apply zoom only to mapGroup
      });

    svg.call(zoom);

    const mapGroup = svg.append("g");

    // Add a title to the map
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 553)  // Position the title near the bottom
      .attr("text-anchor", "middle")
      .style("font-size", "27px")
      .style("font-weight", "bold")
      .style("fill", "brown")
      .text("Conflict Location and Intensity Map");

    // Draw countries from TopoJSON data
    const countries = topojson.feature(data.mapData, data.mapData.objects.countries).features;
    mapGroup.selectAll("path")
      .data(countries)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "#333333")
      .attr("stroke", "black");

    // Filter data for the selected year
    const yearData = data.csvData.filter(d => d.year === +selectedYear);

    // Define a color scale for intensity
    const colorScale = d3.scaleSequential(d3.interpolateReds)
      .domain([1, d3.max(yearData, d => d.intensity)]);

    // Plot clustered circles/bubbles based on intensity
    mapGroup.selectAll("circle")
      .data(yearData)
      .enter()
      .append("circle")
      .attr("cx", d => projection([d.longitude, d.latitude])[0])
      .attr("cy", d => projection([d.longitude, d.latitude])[1])
      .attr("r", d => Math.sqrt(d.intensity) * 5)
      .attr("fill", d => d.intensity > 1 ? colorScale(d.intensity) : "#BC8F8F")
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .on("mouseenter", (event, d) => {
        const containerRect = containerRef.current.getBoundingClientRect(); // Get container position
        const x = event.clientX - containerRect.left + 10; // Calculate relative x
        const y = event.clientY - containerRect.top + 10;  // Calculate relative y
        setTooltip({
          visible: true,
          x: x,
          y: y,
          content: `Location: ${d.location}\nParty A: ${d.party_a}\nParty B: ${d.party_b}\nYear: ${d.year}\nIntensity: ${d.intensity}`
        });
      })
      .on("mousemove", (event) => {
        const containerRect = containerRef.current.getBoundingClientRect(); // Get container position
        const x = event.clientX - containerRect.left + 10; // Calculate relative x
        const y = event.clientY - containerRect.top + 10;  // Calculate relative y
        setTooltip(prev => ({
          ...prev,
          x: x,
          y: y
        }));
      })
      .on("mouseleave", () => {
        setTooltip({ visible: false, x: 0, y: 0, content: '' });
      });

    // Add a legend for intensity, separate from zoomable mapGroup
    const legendGroup = svg.append("g")
      .attr("transform", `translate(50, ${height - 150})`);  // Adjust position as needed

    // Add a title to the legend with two lines
    legendGroup.append("text")
      .attr("x", 0)
      .attr("y", -90)
      .attr("text-anchor", "start")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "brown")
      .text("Intensity Level");

    legendGroup.append("text")
      .attr("x", 0)
      .attr("y", -75)
      .attr("text-anchor", "start")
      .style("font-size", "12px")
      .style("fill", "brown")
      .text("(Number of Conflicts in a Given Year)");

    // Define legend circle sizes and labels
    const legendSizes = [1, 5, 10];
    const legendLabels = ["Low", "Medium", "High"];

    // Draw legend circles
    legendGroup.selectAll("circle")
      .data(legendSizes)
      .enter()
      .append("circle")
      .attr("cx", 0)
      .attr("cy", (d, i) => -i * 30 + 10)
      .attr("r", d => Math.sqrt(d) * 5)
      .attr("fill", d => d > 1 ? colorScale(d) : "#BC8F8F")
      .attr("stroke", "#333")
      .attr("stroke-width", 1);

    // Add labels next to each legend circle
    legendGroup.selectAll("text.legend-label")
      .data(legendLabels)
      .enter()
      .append("text")
      .attr("class", "legend-label")
      .attr("x", 30)  // Position text to the right of circles
      .attr("y", (d, i) => -i * 30 + 10)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .attr("fill", "#333")
      .text(d => d);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <div style={{ position: 'relative' }} ref={containerRef}> {/* Assigned ref here */}
      <svg ref={svgRef}></svg>
      
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <label htmlFor="year-slider" style={{ fontWeight: 'bold', color: '#0db4de', fontSize: '1.2em' }}>
          Year: {selectedYear}
        </label>
        <input
          type="range"
          id="year-slider"
          min={Math.min(...uniqueYears)}
          max={Math.max(...uniqueYears)}
          value={selectedYear}
          onChange={handleYearChange}
          step="1"  // Ensure slider only selects integer years
          style={{
            width: '80%',
            appearance: 'none',
            height: '8px',
            backgroundColor: '#FFA500',
            borderRadius: '5px',
            outline: 'none',
            marginTop: '5px',
          }}
          aria-label="Select Year"
        />
      </div>

      {tooltip.visible && (
        <div style={{
          position: 'absolute',
          left: tooltip.x,
          top: tooltip.y,
          backgroundColor: 'rgba(50, 50, 50, 0.9)', // Darker background for readability
          color: '#fff',
          padding: '8px', // Increase padding for spacing
          borderRadius: '6px', // Rounded corners
          pointerEvents: 'none', // Prevents tooltip from interfering with mouse events
          whiteSpace: 'pre-line', // Allows line breaks in the tooltip content
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Adds a subtle shadow
          fontSize: '14px', // Increases font size for readability
          maxWidth: '250px', // Limits tooltip width
          lineHeight: '1.5', // Adjusts line height for better readability
          zIndex: 10, // Ensure tooltip appears above other elements
        }}>
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default DotMap;
