import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import '../maps/Tooltip.css';

const PieChart = ({ data, highlightedCity }) => {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });
  const [legendData, setLegendData] = useState([]);
  const [totalPopulation, setTotalPopulation] = useState(0);

  useEffect(() => {
    const width = 300;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    // Add title to the chart
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20) // Position at the top of the SVG
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .attr('fill', '#0db4de')
      .text('Population by Country');

    if (!data || data.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .text('No data available');
      return;
    }

    // Aggregate population by country
    const countryPopulationData = Array.from(
      d3.group(data, d => d.country),
      ([country, cities]) => ({
        country,
        population: d3.sum(cities, d => d.population)
      })
    );

    const totalPopulation = d3.sum(countryPopulationData, d => d.population);
    setTotalPopulation(totalPopulation);

    // Set up color scale and legend data
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const legendInfo = countryPopulationData.map(d => ({
      country: d.country,
      color: colorScale(d.country),
      percentage: ((d.population / totalPopulation) * 100).toFixed(2),
      population: d.population
    }));
    setLegendData(legendInfo);

    const pie = d3.pie().value(d => d.population);
    const arc = d3.arc().outerRadius(radius - 10).innerRadius(0);
    const arcHover = d3.arc().outerRadius(radius).innerRadius(0);

    // Draw pie slices
    svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)
      .selectAll('path')
      .data(pie(countryPopulationData))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.country))
      .attr('stroke', 'white')
      .attr('opacity', 0.85)
      .on('mouseenter', (event, d) => {
        const countryPercentage = ((d.data.population / totalPopulation) * 100).toFixed(2);
        setTooltip({
          visible: true,
          x: event.pageX,
          y: event.pageY,
          content: `${d.data.country}\nPopulation: ${d.data.population.toLocaleString()} (${countryPercentage}%)`,
        });

        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('d', arcHover)
          .attr('fill', '#ffff66');
      })
      .on('mousemove', (event) => {
        setTooltip(prev => ({
          ...prev,
          x: event.pageX + 10,
          y: event.pageY + 10,
        }));
      })
      .on('mouseleave', (event, d) => {
        setTooltip({ visible: false, x: 0, y: 0, content: '' });

        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('d', arc)
          .attr('fill', colorScale(d.data.country));
      });

    // Add labels to each slice
    svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)
      .selectAll('text')
      .data(pie(countryPopulationData))
      .enter()
      .append('text')
      
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('pointer-events', 'none');

  }, [data]);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      <svg ref={svgRef}></svg>

      {tooltip.visible && (
        <div
          className="tooltip"
          style={{
            position: 'absolute',
            top: tooltip.y + 10,
            left: tooltip.x + 120,
            whiteSpace: 'pre-line',
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Legend */}
      <div style={{ marginLeft: '20px', marginTop: '85px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', fontSize: '12px', color: '#333', width: '100px' }}>
        <h3>Legend</h3>
        <p>Total Population: {totalPopulation.toLocaleString()}</p>
        {legendData.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div
              style={{
                width: '15px',
                height: '15px',
                backgroundColor: entry.color,
                marginRight: '10px',
              }}
            ></div>
            <span>{entry.country}</span>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
