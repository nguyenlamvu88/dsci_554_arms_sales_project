import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const Treemap = () => {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });
  const [legendData, setLegendData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2022);

  const dataUrl = "https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_top_100_arms_companies_consolidated.csv";

  useEffect(() => {
    const width = 900;
    const height = 900;

    const svg = d3.select(svgRef.current)
                  .attr('width', width)
                  .attr('height', height)
                  .style('position', 'relative');
    svg.selectAll('*').remove();

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .attr('fill', '#0db4de')
      .text(`Top 20 Arms Companies by Revenue (${selectedYear})`);

    d3.csv(dataUrl).then(data => {
      const revenueColumn = `Arms Revenue ${selectedYear}`;
      if (!data.columns.includes(revenueColumn)) {
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .text(`No data available for the year ${selectedYear}`);
        return;
      }

      const dataWithRevenue = data.map(d => ({
        ...d,
        totalRevenue: +d[revenueColumn] || 0
      })).filter(d => d.totalRevenue > 0);

      const top20Data = dataWithRevenue
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 20);

      const totalRev = d3.sum(top20Data, d => d.totalRevenue);
      setTotalRevenue(totalRev);

      const groupedData = d3.group(top20Data, d => d.Country);

      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
      const legendInfo = Array.from(groupedData, ([country, companies]) => {
        const countryRevenue = d3.sum(companies, company => company.totalRevenue);
        return {
          country,
          color: colorScale(country),
          percentage: (countryRevenue / totalRev) * 100,
        };
      });
      setLegendData(legendInfo);

      const root = d3.hierarchy({ children: top20Data })
                     .sum(d => d.totalRevenue)
                     .sort((a, b) => b.value - a.value);

      d3.treemap()
        .size([width, height - 60])
        .padding(2)
        (root);

      const treemapGroup = svg.append('g')
                              .attr('transform', `translate(0, 40)`);

      treemapGroup.selectAll('rect')
        .data(root.leaves())
        .enter()
        .append('rect')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', d => colorScale(d.data.Country))
        .attr('stroke', 'white')
        .attr('opacity', 0.85)
        .on('mouseenter', (event, d) => {
          const revenuePercentage = ((d.data.totalRevenue / totalRev) * 100).toFixed(2);
          setTooltip({
            visible: true,
            x: event.pageX + 5,
            y: event.pageY + 5,
            content: `${d.data.Company}\nRevenue: $${d.data.totalRevenue.toLocaleString()} (${revenuePercentage}%)`,
          });

          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr('x', d.x0 - 5)
            .attr('y', d.y0 - 5)
            .attr('width', (d.x1 - d.x0) + 20)
            .attr('height', (d.y1 - d.y0) + 20)
            .attr('fill', '#ff5733')
            .attr('opacity', 0.25);
        })
        .on('mousemove', (event) => {
          setTooltip(prev => ({
            ...prev,
            x: event.pageX - 800,
            y: event.pageY - 90,
          }));
        })
        .on('mouseleave', (event, d) => {
          setTooltip({ visible: false, x: 0, y: 0, content: '' });

          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr('x', d.x0)
            .attr('y', d.y0)
            .attr('width', d.x1 - d.x0)
            .attr('height', d.y1 - d.y0)
            .attr('fill', colorScale(d.data.Country))
            .attr('opacity', 0.85);
        });

      treemapGroup.selectAll('text')
        .data(root.leaves())
        .enter()
        .append('text')
        .attr('x', d => d.x0 + 5)
        .attr('y', d => d.y0 + 15)
        .attr('font-size', '16px')
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

          text.append("tspan")
            .attr("x", d.x0 + 5)
            .attr("y", d.y0 + 15 + lineNumber * lineHeight)
            .text(line.join(" "));
        });
    }).catch(error => {
      console.error("Error loading data:", error);
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .text('Failed to load data');
    });
  }, [selectedYear]);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      <div style={{ position: 'relative' }}>
        <svg ref={svgRef}></svg>

        {tooltip.visible && (
          <div
            style={{
              position: 'absolute',
              top: tooltip.y + 10,
              left: tooltip.x + 10,
              whiteSpace: 'pre-line',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '8px',
              borderRadius: '5px',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
              fontSize: '12px',
              color: '#333',
              pointerEvents: 'none',
              zIndex: 100,
              maxWidth: '200px',
            }}
          >
            {tooltip.content}
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <label htmlFor="yearRange">Select Year: {selectedYear}</label>
          <input
            type="range"
            id="yearRange"
            min={2002}
            max={2022}
            step="1"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{
              width: '600px', // Increase width for a longer slider
              height: '8px',  // Optional: adjust the height for thickness
              background: '#e74c3c', // Optional: customize the track color
              borderRadius: '5px',
              cursor: 'pointer',
              marginLeft: '10px'
            }}
          />
        </div>
      </div>

      <div style={{
        marginLeft: '20px',
        marginTop: '55px',
        padding: '20px', // Increase padding for larger box size
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        fontSize: '16px',
        color: '#333',
        width: '250px', // Increase width for larger legend box
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Legend</h3>
        <p style={{ fontSize: '16px', marginBottom: '10px', color: '#FF8C00' }}>
          Total Revenue: ${(totalRevenue / 1000).toLocaleString()} billion USD
        </p>
        {legendData.map((entry, index) => (
          <div 
            key={index} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '8px',
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
                  width: '20px',
                  height: '20px',
                  backgroundColor: entry.color,
                  marginRight: '15px',
                }}
              ></div>
              <span style={{ fontWeight: 'bold', fontSize: '15px', marginRight: '5px' }}>
                {entry.country}
              </span>
            </div>
            <span style={{ fontSize: '15px', textAlign: 'right', whiteSpace: 'nowrap' }}>
              {entry.percentage.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Treemap;
