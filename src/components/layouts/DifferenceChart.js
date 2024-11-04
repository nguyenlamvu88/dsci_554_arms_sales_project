import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const DifferenceChart = ({ data, country1, country2 }) => {
  const svgRef = useRef();

  useEffect(() => {
    const margin = { top: 20, right: 30, bottom: 50, left: 70 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background', 'light gray');

    svg.selectAll('*').remove(); // Clear previous content

    if (!data || data.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .text('No data available');
      return;
    }

    const years = Object.keys(data[0]).filter(key => key !== 'country'); // Extract year keys

    // Filter data for the selected countries
    const dataCountry1 = data.find(d => d.country === country1);
    const dataCountry2 = data.find(d => d.country === country2);

    // Handle case where countries are not found
    if (!dataCountry1 || !dataCountry2) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .text(`Please select data for Country 1 and Country 2 for comparison`);
      return;
    }

    // Calculate the differences for each year, handling missing year data
    const differences = years.map(year => ({
      year,
      difference: (dataCountry1[year] || 0) - (dataCountry2[year] || 0), // Use 0 if year data is missing
    }));

    const xScale = d3.scaleBand()
      .domain(years)
      .range([0, width])
      .paddingInner(0.05); // Slight padding between bars

    const yExtent = d3.extent(differences, d => d.difference);
    const yScale = d3.scaleLinear()
      .domain([Math.min(0, yExtent[0]), Math.max(0, yExtent[1])]) // Ensure zero is included
      .range([height, 0]);

    const colorScale = d3.scaleSequential()
      .domain([d3.min(differences, d => d.difference), d3.max(differences, d => d.difference)])
      .interpolator(d3.interpolateRdYlGn);

    const group = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Render the difference bars
    group.selectAll('rect')
      .data(differences)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.year))
      .attr('y', d => (d.difference >= 0 ? yScale(d.difference) : yScale(0)))
      .attr('height', d => Math.abs(yScale(d.difference) - yScale(0)))
      .attr('width', xScale.bandwidth())
      .attr('fill', d => colorScale(d.difference));

    // Add inline tooltip text element
    const tooltipText = group.append('text')
      .attr('fill', 'black')
      .attr('font-size', '12px') 
      .attr('font-weight', 'bold') 
      .style('opacity', 0); // Initially hidden

    // Tooltip interactions
    group.selectAll('rect')
      .on('mouseover', (event, d) => {
        tooltipText
          .attr('x', xScale(d.year) + xScale.bandwidth() / 2)
          .attr('y', yScale(d.difference) - 8) // Position closer to the bar
          
          .text(`Year: ${d.year}, Diff: ${d.difference.toFixed(2)}%`)
          .style('opacity', 1)
          .attr('text-anchor', 'middle')
          .raise();
      })
      .on('mousemove', (event) => {
        tooltipText
          .attr('x', event.offsetX - margin.left)
          .attr('y', event.offsetY - margin.top - 10);
      })
      .on('mouseout', () => {
        tooltipText.style('opacity', 0); // Hide tooltip
      });

    // X-axis
    group.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => d));

    // Y-axis
    group.append('g')
      .call(d3.axisLeft(yScale).ticks(10).tickFormat(d => `${d}%`));

    // Axis labels
    
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', margin.left - 50)
      .attr('x', -(height / 2) - margin.top)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .text(`Expenditure Difference (${country1} vs ${country2})`);

  }, [data, country1, country2]);

  return <svg ref={svgRef}></svg>;
};

export default DifferenceChart;
