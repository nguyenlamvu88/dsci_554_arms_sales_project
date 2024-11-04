import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const formatPopulation = (population) => {
  if (population >= 1e9) {
    return (population / 1e9).toFixed(1) + " billion";
  } else if (population >= 1e6) {
    return (population / 1e6).toFixed(1) + " million";
  }
  return population.toLocaleString();
};

const formatGDP = (gdp) => {
  return "$" + gdp.toFixed(2) + " trillion";
};

const ProportionalSymbolMap = ({ dataUrl, selectedYear }) => {
  const svgRef = useRef();

  useEffect(() => {
    const width = 1000;
    const height = 600;
    const gdpScalingFactor = 5;
    const selectedCountries = ["United States", "China", "India", "Brazil", "Germany"];

    // Load CSV data
    d3.csv(dataUrl).then(data => {
      data.forEach(d => {
        d.population = +d.population;
        for (let year = 2013; year <= 2023; year++) {
          d[`gdp_${year}`] = +d[year];
        }
      });

      const projection = d3.geoMercator()
        .center([0, 20])
        .scale(130)
        .translate([width / 2, height / 2]);

      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .style('background-color', '#F5F5DC');

      svg.selectAll('*').remove();

      // Group to apply zoom effects
      const g = svg.append('g');

      // Define zoom behavior
      const zoom = d3.zoom()
        .scaleExtent([1, 8]) // Limits zoom level
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });

      // Apply zoom behavior to the SVG
      svg.call(zoom);

      d3.json('https://unpkg.com/world-atlas@2/countries-110m.json').then(worldData => {
        const countryNameMap = { "United States of America": "United States" };

        const countries = topojson.feature(worldData, worldData.objects.countries).features;

        const colorScale = d3.scaleSequential(d3.interpolateWarm)
          .domain(d3.extent(data, d => d.population));

        const barScale = d3.scaleLinear()
          .domain(d3.extent(data, d => d[`gdp_${selectedYear}`]))
          .range([10, 80]);

        g.selectAll('path')
          .data(countries)
          .enter()
          .append('path')
          .attr('d', d3.geoPath().projection(projection))
          .attr('fill', d => {
            const countryData = data.find(c => c.country === (countryNameMap[d.properties.name] || d.properties.name));
            return countryData ? colorScale(countryData.population) : '#ccc';
          })
          .attr('stroke', '#333')
          .on('mouseenter', (event, d) => {
            const countryData = data.find(c => c.country === (countryNameMap[d.properties.name] || d.properties.name));
            if (countryData) {
              d3.select('#tooltip')
                .style('display', 'block')
                .style('left', `${event.pageX + 5}px`)
                .style('top', `${event.pageY - 28}px`)
                .html(`
                  <strong>${countryData.country}</strong><br/>
                  <span style="color:#555;">Population:</span> ${formatPopulation(countryData.population)}
                `);
            }
          })
          .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
          });

        g.selectAll('rect')
          .data(data.filter(d => selectedCountries.includes(d.country)))
          .enter()
          .append('rect')
          .attr('x', d => projection([+d.longitude, +d.latitude])[0] - 5)
          .attr('y', d => projection([+d.longitude, +d.latitude])[1] - barScale(d[`gdp_${selectedYear}`]))
          .attr('width', 10)
          .attr('height', d => barScale(d[`gdp_${selectedYear}`]))
          .attr('fill', '#000080')
          .attr('fill-opacity', 0.8)
          .on('mouseenter', (event, d) => {
            const tooltip = d3.select('#tooltip');
            const gdpPerCapita = (d[`gdp_${selectedYear}`] * 1e12 / d.population).toFixed(2);
            tooltip.style('display', 'block')
              .style('left', `${event.pageX + 5}px`)
              .style('top', `${event.pageY - 28}px`)
              .html(`
                <strong>${d.country}</strong><br/>
                <span style="color:#555;">GDP (${selectedYear}):</span> ${formatGDP(d[`gdp_${selectedYear}`])}<br/>
                <span style="color:#555;">GDP per Capita:</span> $${gdpPerCapita}
              `);
          })
          .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
          });

        // Tooltip div for population and GDP display
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

        const populationLegend = svg.append('g')
          .attr('transform', `translate(${width - 290}, ${height - 90})`);

        populationLegend.selectAll('rect')
          .data(d3.range(0, 200, 20))
          .enter()
          .append('rect')
          .attr('x', d => d)
          .attr('width', 30)
          .attr('height', 15)
          .attr('fill', d => colorScale(d3.max(data, d => d.population) * (d / 200)));

        const popScale = d3.scaleLinear()
          .domain(d3.extent(data, d => d.population))
          .range([0, 300]);

        populationLegend.append("g")
          .attr("transform", `translate(0, 15)`)
          .call(
            d3.axisBottom(popScale)
              .ticks(4)
              .tickFormat(d => {
                if (d >= 1e9) return d / 1e9 + " billion";
                if (d >= 1e6) return d / 1e6 + " million";
                return d;
              })
          )
          .selectAll(".tick text")
          .style("fill", "black")
          .style("font-size", "10px");

        populationLegend.append("text")
          .attr("x", 150)
          .attr("y", -10)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .attr("fill", "black")
          .style("font-weight", "bold")
          .text("Population");

        const gdpLegend = svg.append('g')
          .attr('transform', `translate(50, ${height - 140})`);

        gdpLegend.append("rect")
          .attr("width", 20)
          .attr("height", barScale(d3.max(data, d => d[`gdp_${selectedYear}`])))
          .attr("fill", "#000080")
          .attr("fill-opacity", 0.8);

        gdpLegend.append("text")
          .attr("x", 30)
          .attr("y", 5)
          .style("font-size", "10px")
          .style("font-weight", "bold")
          .text(`Max GDP: ${formatGDP(d3.max(data, d => d[`gdp_${selectedYear}`]))}`);

        gdpLegend.append("text")
          .attr("x", 30)
          .attr("y", barScale(d3.min(data, d => d[`gdp_${selectedYear}`])) + 75)
          .style("font-size", "10px")
          .style("font-weight", "bold")
          .text(`Min GDP: ${formatGDP(d3.min(data, d => d[`gdp_${selectedYear}`]))}`);
      });

      // Add the map title after all other elements
      // First line of title
        svg.append('text')
        .attr('x', width / 2)
        .attr('y', 500) // Adjust the y-position for the first line
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .style('fill', 'brown')
        .text("Proportional Symbol Map")
        .raise();

        // Second line of title
        svg.append('text')
        .attr('x', width / 2)
        .attr('y', 530) // Adjust the y-position for the second line
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .style('fill', 'brown')
        .text(`GDP and Population (${selectedYear})`)
        .raise();
    });
  }, [dataUrl, selectedYear]);

  return <svg ref={svgRef}></svg>;
};

export default ProportionalSymbolMap;
