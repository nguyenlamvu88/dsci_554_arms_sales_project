import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import '../maps/Tooltip.css';

const Treemap = ({ data, highlightedCompany }) => {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });
  const [legendData, setLegendData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2022);

  // List of available years based on your dataset
  const availableYears = [
    2021, 2020, 2019, 2018, 2017, 2016, 2015,
    2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 
    2006, 2005, 2004, 2003, 2002
  ];

  useEffect(() => {
    const width = 600;
    const height = 450;

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    // Add title to the chart
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .attr('fill', '#0db4de')
      .text(`Top 20 Arms Companies by Revenue (${selectedYear})`);

    if (!data || data.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .text('No data available');
      return;
    }

    // Calculate total revenue for each company based on the selected year
    const dataWithRevenue = data.map(d => ({
      ...d,
      totalRevenue: +d[`Arms Revenue ${selectedYear}`] || 0
    }));
    
    const top20Data = dataWithRevenue
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 20);

    const totalRevenue = d3.sum(top20Data, d => d.totalRevenue);
    setTotalRevenue(totalRevenue);

    const groupedData = d3.group(top20Data, d => d.Country);

    const root = d3.hierarchy({ values: top20Data }, d => d.values)
      .sum(d => d.totalRevenue)
      .sort((a, b) => b.value - a.value);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Generate legend data
    const legendInfo = Array.from(groupedData, ([country, companies]) => {
      const countryRevenue = d3.sum(companies, company => company.totalRevenue);
      return {
        country,
        color: colorScale(country),
        percentage: (countryRevenue / totalRevenue) * 100,
      };
    });
    setLegendData(legendInfo);

    d3.treemap().size([width, height]).padding(2)(root);

    const treemapGroup = svg.append('g')
      .attr('transform', `translate(0, 40)`);

    treemapGroup.selectAll('rect')
      .data(root.leaves())
      .enter()
      .append('rect')
      .attr('x', d => d.data.Company === (highlightedCompany && highlightedCompany.Company) ? d.x0 - 0.110 * (d.x1 - d.x0) : d.x0)
      .attr('y', d => d.data.Company === (highlightedCompany && highlightedCompany.Company) ? d.y0 - 0.110 * (d.y1 - d.y0) : d.y0)
      .attr('width', d => d.data.Company === (highlightedCompany && highlightedCompany.Company) ? (d.x1 - d.x0) * 1.10 : d.x1 - d.x0)
      .attr('height', d => d.data.Company === (highlightedCompany && highlightedCompany.Company) ? (d.y1 - d.y0) * 1.10 : d.y1 - d.y0)
      .attr('fill', d => d.data.Company === (highlightedCompany && highlightedCompany.Company) ? '#ff5733' : colorScale(d.data.Country))
      .attr('stroke', 'white')
      .attr('opacity', 0.85)
      .on('mouseenter', (event, d) => {
        const revenuePercentage = ((d.data.totalRevenue / totalRevenue) * 100).toFixed(2);
        setTooltip({
          visible: true,
          x: event.pageX,
          y: event.pageY,
          content: `${d.data.Company}\nRevenue: $${d.data.totalRevenue.toLocaleString()} (${revenuePercentage}%)`,
        });

        d3.select(event.currentTarget)
          .attr('x', d.x0 - 0.125 * (d.x1 - d.x0))
          .attr('y', d.y0 - 0.125 * (d.y1 - d.y0))
          .attr('width', (d.x1 - d.x0) * 1.25)
          .attr('height', (d.y1 - d.y0) * 1.25)
          .attr('fill', '#ff5733')
          .attr('opacity', 0.25)  // Adjusted to a more visible opacity
          .raise();

        svg.select(`#text-${d.data.Company.replace(/[^a-zA-Z0-9]/g, '_')}`)
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .attr('fill', 'white');
      })
      .on('mousemove', (event) => {
        setTooltip(prev => ({
          ...prev,
          x: event.pageX + 120,
          y: event.pageY - 10,
        }));
      })
      .on('mouseleave', (event, d) => {
        setTooltip({ visible: false, x: 0, y: 0, content: '' });

        d3.select(event.currentTarget)
          .attr('x', d.x0)
          .attr('y', d.y0)
          .attr('width', d.x1 - d.x0)
          .attr('height', d.y1 - d.y0)
          .attr('fill', colorScale(d.data.Country))
          .attr('opacity', 0.85);

        svg.select(`#text-${d.data.Company.replace(/[^a-zA-Z0-9]/g, '_')}`)
          .attr('font-size', '10px')
          .attr('font-weight', 'normal')
          .attr('fill', 'white')
          .raise();
      });

    // Add labels to each rectangle with word wrapping
    treemapGroup.selectAll('text')
      .data(root.leaves())
      .enter()
      .append('text')
      .attr('id', d => d.data.Company ? `text-${d.data.Company.replace(/[^a-zA-Z0-9]/g, '_')}` : null)
      .attr('x', d => d.x0 + 5)
      .attr('y', d => d.y0 + 15)
      .attr('font-size', '10px')
      .attr('fill', 'white')
      .style('pointer-events', 'none')
      .each(function(d) {
        const text = d3.select(this);
        const words = d.data.Company.split(" ");
        let line = [];
        let lineNumber = 0;
        const lineHeight = 12;
        const boxWidth = d.x1 - d.x0 - 10;
        
        words.forEach(word => {
          line.push(word);
          text.text(line.join(" "));
          if (text.node().getComputedTextLength() > boxWidth) {
            line.pop();
            text.text(line.join(" "));
            text.append("tspan")
              .attr("x", d.x0 + 5)
              .attr("y", d.y0 + 15 + lineNumber * lineHeight)
              .text(line.join(" "));
            line = [word];
            lineNumber += 1;
          }
        });

        // Append the last line
        text.append("tspan")
          .attr("x", d.x0 + 5)
          .attr("y", d.y0 + 15 + lineNumber * lineHeight)
          .text(line.join(" "));
      });
  }, [data, highlightedCompany, selectedYear]);

  return (
    <div style={{      display: 'flex', 
      alignItems: 'flex-start' 
    }}>
      <div>
        <svg ref={svgRef}></svg>

        {tooltip.visible && (
          <div
            className="tooltip"
            style={{
              position: 'absolute',
              top: tooltip.y + 10,
              left: tooltip.x + 10,
              whiteSpace: 'pre-line',
            }}
          >
            {tooltip.content}
          </div>
        )}

        {/* Slider for Year Selection */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <label htmlFor="yearRange">Select Year: {selectedYear}</label>
          <input
            type="range"
            id="yearRange"
            min={Math.min(...availableYears)}
            max={Math.max(...availableYears)}
            step="1"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ width: '300px', marginLeft: '10px' }}
          />
        </div>
      </div>

      {/* Legend */}
      <div style={{ 
        marginLeft: '20px', 
        marginTop: '55px',
        padding: '10px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '5px', 
        fontSize: '12px', 
        color: '#333', 
        width: '170px' 
      }}>
        <h3>Legend</h3>
        <p>Total Revenue: ${(totalRevenue/1000).toLocaleString()} billion USD</p>
        {legendData.map((entry, index) => (
          <div 
            key={index} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '5px' 
            }}
          >
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center',
                flex: 1 
              }}
            >
              <div
                style={{
                  width: '15px',
                  height: '15px',
                  backgroundColor: entry.color,
                  marginRight: '10px',
                }}
              ></div>
              <span style={{ fontWeight: 'bold', marginRight: '5px' }}>{entry.country}</span>
            </div>
            <span style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
              {entry.percentage.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Treemap;
