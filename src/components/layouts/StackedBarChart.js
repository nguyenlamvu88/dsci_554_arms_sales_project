import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const StackedBarChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const margin = { top: 20, right: 30, bottom: 50, left: 70 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background', 'black');

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
    const countries = data.map(d => d.country); // List of countries

    // Transform data for stacking
    const stackedData = d3.stack()
      .keys(countries)
      .value((d, key) => +d[key] || 0)
      (years.map(year => {
        const yearData = { year };
        data.forEach(d => {
          yearData[d.country] = +d[year]; // Add each country's expenditure for this year
        });
        return yearData;
      }));

    const xScale = d3.scaleBand()
      .domain(years)
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])])
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(countries)
      .range(d3.schemeCategory10);

    const group = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add inline tooltip text element
    const tooltipText = group.append('text')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .style('opacity', 0); // Initially hidden

    // Render the stacked bars
    group.selectAll('g')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('fill', (d, i) => colorScale(countries[i]))
      .selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.data.year))
      .attr('y', d => yScale(d[1]))
      .attr('height', d => yScale(d[0]) - yScale(d[1]))
      .attr('width', xScale.bandwidth())
      .on('mouseover', (event, d) => {
        const country = countries[stackedData.findIndex(layer => layer === d3.select(event.target.parentNode).datum())];
        const year = d.data.year;
        const expenditure = (d[1] - d[0]).toFixed(2);

        tooltipText
          .attr('x', xScale(year) + xScale.bandwidth() / 2)
          .attr('y', yScale(d[1]) - 5) // Position above the bar
          .text(`${country}, ${expenditure}%`)
          .style('opacity', 1) // Show tooltip
          .attr('font-size', '18px') // Correct font size attribute
          .attr('font-weight', 'bold') // Correct font weight attribute
          .raise();
      })
      .on('mousemove', (event) => {
        // Move tooltip with the mouse
        tooltipText
          .attr('x', event.offsetX - margin.left - 200)
          .attr('y', event.offsetY - margin.top + 10); // Adjust for positioning
      })
      .on('mouseout', () => {
        tooltipText.style('opacity', 0); // Hide tooltip
      });

    // X-axis
    group.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    // Y-axis
    group.append('g')
      .call(d3.axisLeft(yScale).ticks(10).tickFormat(d => `${d}%`));

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', margin.left - 50)
      .attr('x', -(height / 2) - margin.top)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .text('Health Expenditure (% of GDP)');

  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default StackedBarChart;
