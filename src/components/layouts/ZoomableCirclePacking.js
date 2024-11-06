import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';

const ZoomableCirclePacking = () => {
  const svgRef = useRef();
  const [data, setData] = useState(null);
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);
  const [availableYears, setAvailableYears] = useState([]);
  const [error, setError] = useState(null);

  const width = 700;
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

        const years = Array.from(
          new Set(
            jsonData.children.flatMap((category) =>
              category.children.map((yearData) => yearData.name)
            )
          )
        ).sort((a, b) => b - a); // Sort years descending
        setAvailableYears(years);
        setSelectedYearIndex(0);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      }
    };
    fetchData();
  }, []);

  const categoryColorScale = useMemo(() => {
    return data
      ? d3.scaleOrdinal(d3.schemeTableau10).domain(data.children.map((d) => d.name)) // Changed color scheme to Tableau10
      : null;
  }, [data]);

  const colorScale = useMemo(() => {
    return d3.scaleSequential(d3.interpolateViridis).domain([1, 3]); // Changed to Viridis for contrast
  }, []);

  useEffect(() => {
    if (!data || availableYears.length === 0 || !categoryColorScale) return;

    const selectedYear = availableYears[selectedYearIndex];

    const yearData = {
      name: 'Weapon Transfers by Category',
      children: data.children
        .map((category) => ({
          name: category.name,
          children: category.children
            .filter((yearNode) => yearNode.name === selectedYear)
            .map((yearNode) => ({ ...yearNode, year: yearNode.name })),
        }))
        .filter((category) => category.children.length > 0),
    };

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('background', 'transparent') // Removed white background
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

    const pack = d3.pack().size([width - 10, height - 10]).padding(5);
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
      node.select('text').attr('fontSize', (d) => Math.max(14, (d.r * k) / 4));
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
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    node
      .append('circle')
      .attr('fill', (d) =>
        d.depth === 1 ? categoryColorScale(d.data.name) : colorScale(d.depth)
      )
      .attr('fill-opacity', (d) => (d.depth === 1 ? 1 : 0.0))
      .attr('stroke', '#333') // Darker stroke for contrast
      .attr('stroke-width', (d) => (d.depth === 1 ? 2 : 0.2))
      .attr('r', (d) => d.r)
      .style('transition', 'all 0.2s ease')
      .on('mouseover', (event, d) => {
        if (!d || !d.data) return;
        const weaponType =
          d.depth === 1
            ? d.data.name
            : d.parent && d.parent.data
            ? d.parent.data.name
            : 'N/A';
        const year = selectedYear;
        const quantity = d.value ? d.value.toLocaleString() : 'N/A';
        tooltip
          .html(`Year: ${year}<br/>Weapon Type: ${weaponType}<br/>Quantity: ${quantity}`)
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

    // Text labels, ensuring they appear above circles
    node
      .append('text')
      .attr('textAnchor', 'left')
      .attr('dy', '.3em')
      .style('pointer-events', 'none')
      .style('fill', '#333') // Dark text for better readability
      .style('font-weight', 'bold')
      .style('font-size', (d) => `${Math.max(10, d.r / 4)}px`)
      .style('z-index', 10) // Ensure text is in front
      .text((d) => (d.depth === 1 ? d.data.name : ''));

    zoomTo([root.x, root.y, root.r * 2]);

    svg.on('click', () => zoom(null, root));

    return () => {
      tooltip.remove();
    };
  }, [data, selectedYearIndex, availableYears, categoryColorScale, colorScale]);

  const handleSliderChange = (e) => {
    setSelectedYearIndex(Number(e.target.value));
  };

  const styles = {
    container: {
      position: 'relative',
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    },
    title: {
      textAlign: 'center',
      color: '#0db4de', // Updated title color for better contrast
      marginBottom: '20px',
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
      marginBottom: '20px',
    },
    sliderLabel: {
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#0db4de',
      fontSize: '1.2em',
    },
    slider: {
      width: '100%',
      maxWidth: '400px',
      marginBottom: '10px',
      appearance: 'none',
      height: '5px',
      background: '#ddd',
      borderRadius: '5px',
      outline: 'none',
      opacity: '0.9',
      transition: 'opacity .2s',
    },
    selectedYear: {
      fontSize: '1.4em',
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
      {/* Header */}
      <h2 style={styles.title}>Weapon Transfers by Category</h2>

      {/* Conditional Rendering within JSX */}
      {error && <p style={styles.error}>{error}</p>}
      {!error && !data && <p style={styles.loading}>Loading...</p>}
      {!error && data && (
        <>
          {/* Slider Container */}
          <div style={styles.sliderContainer}>
            <label htmlFor="year-slider" style={styles.sliderLabel}>
              Select Year:
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

          {/* SVG Visualization */}
          <div style={styles.svgContainer}>
            <svg
              ref={svgRef}
              width={width}
              height={height}
              role="img"
              aria-labelledby="title desc"
            >
              <title id="title">Zoomable Circle Packing of Weapon Transfers</title>
              <desc id="desc">
                Visualization showing weapon transfers by category for the selected year.
              </desc>
            </svg>
          </div>
        </>
      )}

      {/* Tooltip Div */}
      <div id="tooltip"></div>
    </div>
  );
};

export default ZoomableCirclePacking;
