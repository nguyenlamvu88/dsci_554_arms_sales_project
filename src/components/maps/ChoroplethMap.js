import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import '../maps/Tooltip.css';

const ChoroplethMap = () => {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });
  const [countryData, setCountryData] = useState({});
  const [selectedYear, setSelectedYear] = useState(2023); // Default year

  useEffect(() => {
    // Load the world map and arms sales data
    Promise.all([
      d3.json('https://unpkg.com/world-atlas@2/countries-110m.json'),
      d3.csv('https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed_arms_sales.csv') // Update this path
    ]).then(([worldDataRaw, salesDataRaw]) => {
      const countries = topojson.feature(worldDataRaw, worldDataRaw.objects.countries).features;
      const salesDataProcessed = {};

      // Process the arms sales data by year and country
      salesDataRaw.forEach(row => {
        const country = row.country;
        salesDataProcessed[country] = {};
        for (let year = 1980; year <= 2023; year++) {
          salesDataProcessed[country][year] = +row[year] || 0;
        }
      });
      setCountryData(salesDataProcessed);

      drawMap(countries, salesDataProcessed, selectedYear);
    });
  }, [selectedYear]);

  const drawMap = (countries, salesData, year) => {
    const width = 1000;
    const height = 600;

    const projection = d3.geoMercator()
      .center([0, 20])
      .scale(130)
      .translate([width / 2, height / 2]);

    // Define a color scale for sales values based on the selected year
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
      .domain([0, d3.max(Object.values(salesData), d => d[year] || 0)]);

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background-color', '#f0f0f0');

    svg.selectAll('*').remove();

    const g = svg.append('g');

    g.selectAll('path')
      .data(countries)
      .enter()
      .append('path')
      .attr('d', d3.geoPath().projection(projection))
      .attr('fill', d => {
        const country = d.properties.name;
        return colorScale(salesData[country]?.[year] || 0); // Default color if no data
      })
      .attr('stroke', '#333333')
      .on('mouseenter', (event, d) => {
        const country = d.properties.name;
        const sales = salesData[country]?.[year] || 0;

        const svgRect = svgRef.current.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: event.clientX - svgRect.left + window.scrollX,
          y: event.clientY - svgRect.top + window.scrollY,
          content: `${country}: $${sales.toFixed(2)} million`
        });
      })
      .on('mousemove', (event) => {
        const svgRect = svgRef.current.getBoundingClientRect();
        setTooltip(prev => ({
          ...prev,
          x: event.clientX - svgRect.left + window.scrollX,
          y: event.clientY - svgRect.top + window.scrollY - 25
        }));
      })
      .on('mouseleave', () => {
        setTooltip({ visible: false, x: 0, y: 0, content: '' });
      });

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 80)
      .attr('text-anchor', 'middle')
      .attr('font-size', '22px')
      .attr('font-weight', 'bold')
      .attr('fill', '#A52A2A')
      .text(`Arms Sales by Country in ${year} (millions)`);

    // Add color legend
    const legendWidth = 200;
    const legendHeight = 15;

    const legendSvg = svg.append('g')
      .attr('transform', `translate(20, ${height - 95})`);

    const legendScale = d3.scaleLinear()
      .domain([0, d3.max(Object.values(salesData).map(d => d[year] || 0))])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format(".0f"));

    legendSvg.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#linear-gradient)');

    const linearGradient = legendSvg.append('defs').append('linearGradient')
      .attr('id', 'linear-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    linearGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colorScale(0));

    linearGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colorScale(d3.max(Object.values(salesData).map(d => d[year] || 0))));

    legendSvg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .selectAll("text")
      .style("fill", "#A52A2A")
      .style("font-weight", "bold");
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      {tooltip.visible && (
        <div className="tooltip" style={{
          position: 'absolute',
          top: tooltip.y + 10,
          left: tooltip.x + 10,
          whiteSpace: 'pre-line',
        }}>
          {tooltip.content}
        </div>
      )}
      
      {/* Year Slider */}
      <input
        type="range"
        min="1980"
        max="2023"
        value={selectedYear}
        onChange={(e) => setSelectedYear(+e.target.value)}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '10px',
          width: '200px',
          appearance: 'none',
          backgroundColor: '#FFA500',
          height: '8px',
          borderRadius: '5px',
          outline: 'none',
        }}
      />
      <div style={{ 
      position: 'absolute', 
      bottom: '27px', 
      left: '12px', 
      fontWeight: 'bold', 
      color: 'brown',
      fontSize: '14px'
    }}>
      Year: {selectedYear}
    </div>
    </div>
  );
};

export default ChoroplethMap;
