// DotMap.js
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import '../maps/Tooltip.css';

const DotMap = ({ onCitySelect }) => {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });

  const selectedCountries = ["Brazil", "China", "Germany", "United States", "India"];

  useEffect(() => {
    const width = 1000;
    const height = 500;
    const projection = d3.geoMercator().center([0, 15]).scale(160).translate([width / 2, height / 2]);

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background-color', '#f0f0f0')
      .style('border', '1px solid #ccc')
      .call(d3.zoom().scaleExtent([1, 8]).on('zoom', (event) => {
        svg.select('g').attr('transform', event.transform);
      }));

    svg.selectAll('*').remove(); // Clear previous renders

    const g = svg.append('g');

    d3.json('https://unpkg.com/world-atlas@2/countries-110m.json').then(worldData => {
      const countries = topojson.feature(worldData, worldData.objects.countries).features;

      g.selectAll('path').data(countries).enter()
        .append('path').attr('d', d3.geoPath().projection(projection))
        .attr('fill', '#cccccc').attr('stroke', '#333333');

      d3.csv('https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_a7/main/dot_map_populations_cities.csv').then(data => {
        const countryData = data.filter(d => selectedCountries.includes(d.country));
        const topTenCities = Array.from(d3.group(countryData, d => d.country), ([country, cities]) => {
          return cities.sort((a, b) => b.population - a.population).slice(0, 10);
        }).flat();

        topTenCities.forEach(d => {
          d.population = +d.population;
          d.latitude = +d.latitude;
          d.longitude = +d.longitude;
        });

        g.selectAll('circle').data(topTenCities).enter()
          .append('circle')
          .attr('cx', d => projection([d.longitude, d.latitude])[0])
          .attr('cy', d => projection([d.longitude, d.latitude])[1])
          .attr('r', d => Math.sqrt(d.population) / 300)
          .attr('fill', 'red').attr('opacity', 0.6).attr('stroke', 'none')
          .on('click', (event, d) => onCitySelect(d)) // Trigger selection on click
          .on('mouseenter', (event, d) => {
            setTooltip({
              visible: true, x: event.pageX, y: event.pageY,
              content: `${d.city}, ${d.country}\nPopulation: ${d.population.toLocaleString()}`
            });
          })
          .on('mousemove', (event) => setTooltip(prev => ({
            ...prev, x: event.pageX, y: event.pageY - 10
          })))
          .on('mouseleave', () => setTooltip({ visible: false, x: 0, y: 0, content: '' }));
      });
    });
  }, [onCitySelect]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      {tooltip.visible && (
        <div className="tooltip" style={{ position: 'absolute', top: tooltip.y, left: tooltip.x }}>
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default DotMap;
