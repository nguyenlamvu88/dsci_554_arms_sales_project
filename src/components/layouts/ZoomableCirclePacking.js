import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';

const ZoomableCirclePacking = () => {
  const svgRef = useRef();
  const [data, setData] = useState(null);
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);
  const [availableYears, setAvailableYears] = useState([]);
  const [error, setError] = useState(null);

  const width = 1000;
  const height = 650;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_weapon_transfer_by_category.json'
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(jsonData);

        // Extract unique years and set availableYears state
        const years = Array.from(
          new Set(
            Object.values(jsonData.Exports).flatMap((countryData) =>
              countryData.flatMap((category) => Object.keys(category).filter(key => !isNaN(key)))
            )
          )
        ).sort((a, b) => a - b);
        setAvailableYears(years); // Ensure available years are set for the slider
        setSelectedYearIndex(0);  // Reset selectedYearIndex to 0
        
        // Set default year to the latest year
        const defaultYearIndex = years.length - 1; // Assuming the latest year
        setSelectedYearIndex(defaultYearIndex);

        console.log("Data fetched successfully:", jsonData);
        console.log("Available years:", years);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      }
    };
    fetchData();
  }, []);

  // Color scale for countries
  const countryColorScale = useMemo(() => {
    return data
      ? d3.scaleOrdinal(d3.schemeTableau10).domain(Object.keys(data.Exports))
      : null;
  }, [data]);

  // Separate color scale for weapon categories
  const categoryColorScale = useMemo(() => {
    const allCategories = data
      ? Object.values(data.Exports).flatMap((countryData) =>
          countryData.map((category) => category['Unnamed: 1'])
        )
      : [];
    return d3.scaleOrdinal(d3.schemePaired).domain(allCategories);
  }, [data]);

  useEffect(() => {
    if (!data || availableYears.length === 0 || !countryColorScale || !categoryColorScale) return;

    const selectedYear = availableYears[selectedYearIndex];
    console.log("Selected year:", selectedYear);

    const yearData = {
      name: 'Weapon Transfers by Country',
      children: Object.entries(data.Exports).map(([country, categories]) => ({
        name: country,
        children: categories
          .map((category) => ({
            name: category['Unnamed: 1'],
            value: category[selectedYear] || 0,
          }))
          .filter((category) => category.value > 0),
      })).filter(country => country.children.length > 0),
    };

    console.log("Year data for visualization:", yearData);

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('background', 'transparent')
      .style('cursor', 'pointer');

    svg.selectAll('*').remove();

    let tooltip = d3.select('#tooltip');
    if (tooltip.empty()) {
      tooltip = d3
        .select('body')
        .append('div')
        .attr('id', 'tooltip')
        .style('position', 'absolute')
        .style('padding', '8px 12px')
        .style('background', 'rgba(0, 0, 0, 0.85)')
        .style('color', '#fff')
        .style('border-radius', '8px')
        .style('pointer-events', 'none')
        .style('font-size', '14px')
        .style('display', 'none')
        .style('z-index', '1000')
        .style('white-space', 'nowrap')
        .style('box-shadow', '0px 4px 12px rgba(0, 0, 0, 0.3)');
    }

    const root = d3
      .hierarchy(yearData)
      .sum((d) => d.value || 0)
      .sort((a, b) => b.value - a.value);

    const pack = d3.pack().size([width - 10, height - 10]).padding(10);
    pack(root);

    let focus = root;
    let view;

    const zoomTo = (v) => {
      const k = width / v[2];
      view = v;
      node.attr(
        'transform',
        (d) =>
          `translate(${(d.x - v[0]) * k + width / 2}, ${
            (d.y - v[1]) * k + height / 2
          })`
      );
      node.select('circle').attr('r', (d) => d.r * k);
      node.selectAll('text')
        .attr('fontSize', (d) => Math.max(10, (d.r * k) / 4));
    };

    const zoom = (event, d) => {
      if (!d) return;
      focus = d;
      const transition = svg
        .transition()
        .duration(750)
        .tween('zoom', () => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return (t) => zoomTo(i(t));
        });
    };

    const node = svg
      .append('g')
      .attr("transform", "translate(0, -20)")
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    node
      .append('circle')
      .attr('fill', (d) => {
        if (d.depth === 1) return countryColorScale(d.data.name);
        if (d.depth === 2) return categoryColorScale(d.data.name);
        return '#ccc';
      })
      .attr('fill-opacity', (d) => (d.depth === 1 || d.depth === 2 ? 1 : 0.0))
      .attr('stroke', 'none')
      .attr('stroke-width', (d) => (d.depth === 1 || d.depth === 2 ? 2 : 0.2))
      .attr('r', (d) => d.r)
      .style('transition', 'all 0.2s ease')
      .on('mouseover', (event, d) => {
        if (!d || !d.data) return;
        const country = d.depth === 1 ? d.data.name : d.parent && d.parent.data ? d.parent.data.name : 'N/A';
        const weaponType = d.depth === 2 ? d.data.name : 'N/A';
        const quantity = d.value ? d.value.toLocaleString() : 'N/A';
        tooltip
          .html(`Country: ${country}<br/>Weapon Type: ${weaponType}<br/>Quantity: ${quantity}`)
          .style('display', 'block');
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY - 30}px`);
      })
      .on('mouseout', () => tooltip.style('display', 'none'))
      .on('click', (event, d) => {
        if (focus !== d) {
          zoom(event, d);
          event.stopPropagation();
        }
      });

    node
      .append('text')
      .attr('textAnchor', 'middle')
      .attr('dy', '.3em')
      .style('pointer-events', 'none')
      .style('fill', '#333')
      .style('font-weight', 'bold')
      .style('font-size', (d) => `${Math.max(10, d.r / 4)}px`)
      .text((d) => (d.depth === 2 ? d.data.name : ''));

    node
      .filter(d => d.depth === 1)
      .append('text')
      .attr('textAnchor', 'start')
      .attr('dx', 20) // Adjust this value to move the text further right
      .attr('dy', (d) => d.r + 100) // Adjust as needed to control the vertical position)
      .style('pointer-events', 'none')
      .style('fill', 'white')
      .style('font-weight', 'bold')
      .style('font-size', '17px')
      .text(d => d.data.name);

    zoomTo([root.x, root.y, root.r * 2]);

    svg.on('click', () => zoom(null, root));

    return () => {
      tooltip.remove();
    };
  }, [data, selectedYearIndex, availableYears, countryColorScale, categoryColorScale]);

  const handleSliderChange = (e) => {
    setSelectedYearIndex(Number(e.target.value));
    console.log("Slider changed to index:", e.target.value);
  };

  const styles = {
    container: {
      position: 'relative',
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '10px 20px',  // Adjust padding to bring everything up
      fontFamily: 'Arial, sans-serif',
    },
    title: {
      textAlign: 'center',
      color: '#0db4de',
      margin: '10px 0 5px', // Reduce bottom margin to bring it closer to the slider
      fontSize: '1.8em',
      fontWeight: 'bold',
    },
    error: {
      color: 'red',
      textAlign: 'center',
    },
    loading: {
      textAlign: 'center',
      color: '#555',
    },
    sliderContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: '5px 0 20px', // Reduced top margin to move it up
      position: 'relative',  // Can use relative or absolute for finer adjustments
      top: '-20px',          // Move the slider container up
    },
    sliderLabel: {
      fontWeight: 'bold',
      marginBottom: '30px',   // Reduce space between label and slider
      color: '#0db4de',
      fontSize: '1.2em',
    },
    slider: {
      width: '100%',
      maxWidth: '400px',
      appearance: 'none',
      height: '5px',
      background: '#ddd',
      borderRadius: '5px',
      outline: 'none',
      opacity: '0.9',
      transition: 'opacity .2s',
    },
    selectedYear: {
      fontSize: '1.3em',
      color: '#0db4de',
      fontWeight: 'bold',
    },
    svgContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  };
  

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Weapon Transfers by Category</h2>
      {error && <p style={styles.error}>{error}</p>}
      {!error && !data && <p style={styles.loading}>Loading...</p>}
      {!error && data && availableYears.length > 0 && (
        <>
          <div style={styles.sliderContainer}>
            <label htmlFor="year-slider" style={styles.sliderLabel}>
             
            </label>
            <input
              type="range"
              id="year-slider"
              min="0"
              max={availableYears.length - 1}
              value={selectedYearIndex}
              onChange={handleSliderChange}
              style={styles.slider}
              aria-label="Select Year"
            />
            <div style={styles.selectedYear}>
              Year: <span>{availableYears[selectedYearIndex]}</span>
            </div>
          </div>

          <div style={styles.svgContainer}>
            <svg
              ref={svgRef}
              width={width}
              height={height}
              role="img"
              aria-labelledby="title desc"
            >
              <title id="title">Zoomable Circle Packing of Weapon Transfers by Country</title>
              <desc id="desc">
                Visualization showing weapon transfers by country and category for the selected year.
              </desc>
            </svg>
          </div>
        </>
      )}
      <div id="tooltip"></div>
    </div>
  );
};

export default ZoomableCirclePacking;
