import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const ProportionalSymbolMap = () => {
  const svgRef = useRef();
  const [selectedYear, setSelectedYear] = useState(1971); // Set initial year
  const dataUrl = "https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_regional_transfers.csv";

  useEffect(() => {
    const width = 1000;
    const height = 570;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background-color', '#F5F5DC');

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        svg.select('.map-layer').attr("transform", event.transform);
        svg.select('.dynamic-layer').attr("transform", event.transform);
      });
    
    svg.call(zoom);

    // Create a static layer for the map
    const mapLayer = svg.append('g').attr('class', 'map-layer');

    d3.json('https://unpkg.com/world-atlas@2/countries-110m.json').then(worldData => {
      const projection = d3.geoMercator()
        .center([0, 20])
        .scale(130)
        .translate([width / 2, height / 2]);

      // Render static map paths
      const countries = topojson.feature(worldData, worldData.objects.countries).features;
      mapLayer.selectAll('path')
        .data(countries)
        .enter()
        .append('path')
        .attr('d', d3.geoPath().projection(projection))
        .attr('fill', '#ccc')
        .attr('stroke', '#333');
    });
  }, []);

  useEffect(() => {
    const width = 1000;
    const height = 600;

    const svg = d3.select(svgRef.current);
    const projection = d3.geoMercator()
      .center([0, 20])
      .scale(130)
      .translate([width / 2, height / 2]);

    // Add a dynamic layer for circles and the legend on top of the map
    let dynamicLayer = svg.select('.dynamic-layer');
    if (dynamicLayer.empty()) {
      dynamicLayer = svg.append('g').attr('class', 'dynamic-layer');
    } else {
      dynamicLayer.selectAll('*').remove(); // Clear previous elements
    }

    // Load and update dynamic data elements
    d3.csv(dataUrl).then(data => {
      data.forEach(d => {
        for (let year = 1950; year <= 2023; year++) {
          d[year] = +d[year] / 1000; // Convert to billions
        }
      });

      const regions = {
        "Africa": [20, 0],
        "Americas": [-80, 0],
        "Asia and Oceania": [100, 20],
        "Europe": [10, 50],
        "Middle East": [45, 30],
      };

      const colorScale = d3.scaleSequential(d3.interpolateWarm)
        .domain(d3.extent(data, d => d[selectedYear]));

      const sizeScale = d3.scaleSqrt()
        .domain(d3.extent(data, d => d[selectedYear]))
        .range([10, 50]); // Adjust circle size as needed

      // Bind data to circles in the new `dynamicLayer`
      dynamicLayer.selectAll('circle')
        .data(Object.keys(regions), region => region)
        .join('circle')
        .attr('cx', d => projection(regions[d])[0])
        .attr('cy', d => projection(regions[d])[1])
        .attr('r', d => {
          const regionData = data.find(item => item['Imports by Regions'] === d);
          return sizeScale(regionData[selectedYear]);
        })
        .attr('fill', '#FF6347')
        .attr('opacity', 0.6)
        .on('mouseenter', (event, d) => {
          const regionData = data.find(item => item['Imports by Regions'] === d);
          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', `${event.pageX + 5}px`)
            .style('top', `${event.pageY - 28}px`)
            .html(`
              <strong>${d}</strong><br/>
              <span style="color:#555;">Arms Imports (${selectedYear}):</span> ${regionData[selectedYear].toFixed(2)} billion USD
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });

      // Tooltip div for display
      if (!document.getElementById('tooltip')) {
        d3.select('body').append('div')
          .attr('id', 'tooltip')
          .style('position', 'absolute')
          .style('display', 'none')
          .style('background-color', 'rgba(255, 255, 255, 0.9)')
          .style('color', '#333')
          .style('padding', '10px')
          .style('border-radius', '8px')
          .style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.2)')
          .style('font-size', '14px')
          .style('line-height', '1.4')
          .style('pointer-events', 'none');
      }

      // Add the map title in the dynamic layer
      dynamicLayer.append('text')
        .attr('x', width / 2)
        .attr('y', height - 75)
        .attr('text-anchor', 'middle')
        .style('font-size', '22px')
        .style('font-weight', 'bold')
        .style('fill', 'brown')
        .text(`Arms Imports by Region ${selectedYear} (billion USD)`);

      // Dynamic mini bar chart for the legend
      const regionsData = Object.keys(regions).map(region => {
        const regionData = data.find(d => d['Imports by Regions'] === region);
        return {
          region,
          value: regionData ? regionData[selectedYear] : 0 // Get the arms import value for the selected year
        };
      });

      const maxValue = d3.max(regionsData, d => d.value);
      const barScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, 200]); // Adjust width as needed for bar size

      // Append mini bar chart in the legend section on the left
      const barChartLegend = dynamicLayer.append('g')
        .attr('transform', `translate(50, ${height - 200})`);

      barChartLegend.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .attr('text-anchor', 'start')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .text('');

      barChartLegend.selectAll('.bar')
        .data(regionsData)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', (d, i) => i * 20)
        .attr('width', d => barScale(d.value))
        .attr('height', 15)
        .attr('fill', '#FF6347')
        .attr('opacity', 0.8);

      barChartLegend.selectAll('.bar-label')
        .data(regionsData)
        .join('text')
        .attr('class', 'bar-label')
        .attr('x', d => barScale(d.value) + 5)
        .attr('y', (d, i) => i * 20 + 10)
        .style('font-size', '12px')
        .style('fill', '#333')
        .text(d => `${d.region}: ${d.value.toFixed(2)}B USD`);
    });
  }, [dataUrl, selectedYear]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <div>
      <svg ref={svgRef}></svg>
      <div style={{ marginTop: '10px', textAlign: 'start' }}>
        <label htmlFor="year-slider" style={{ fontWeight: 'bold', color: '#0db4de', fontSize: '1.2em' }}>
          Year: {selectedYear}
        </label>
        <input
          type="range"
          id="year-slider"
          min="1950"
          max="2023"
          value={selectedYear}
          onChange={handleYearChange}
          step="1"
          style={{
            width: '50%',
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
    </div>
  );
};

export default ProportionalSymbolMap;
