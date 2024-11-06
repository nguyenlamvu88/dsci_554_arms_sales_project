import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import '../maps/Tooltip.css'; // Ensure this CSS file styles the tooltip appropriately

const ChoroplethMap = () => {
  const svgRef = useRef();

  // State Variables
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });
  const [modalData, setModalData] = useState(null); // For storing data to display in the modal
  const [countryData, setCountryData] = useState({});
  const [countries, setCountries] = useState([]); // Store GeoJSON features
  const [selectedYear, setSelectedYear] = useState(null); // No default year
  const [selectedWeaponType, setSelectedWeaponType] = useState('All'); // Set to 'All' by default
  const [weaponTypes, setWeaponTypes] = useState([]);
  const [maxQuantities, setMaxQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data URL
  const dataUrl = "https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_arms_transfer_by_weapon_types.csv";

  /**
   * Country Name Mapping
   * Map dataset country names to GeoJSON country names if they differ.
   */
  const countryNameMapping = {
    "Cote d'Ivoire": "Ivory Coast",
    "Congo": "Republic of the Congo", // Adjust based on GeoJSON data
    // Add more mappings as necessary
  };

  /**
   * Data Loading Effect
   * Fetches and processes the world map and arms transfer data once when the component mounts.
   */
  useEffect(() => {
    setLoading(true);
    Promise.all([
      d3.json('https://unpkg.com/world-atlas@2/countries-110m.json'),
      d3.csv(dataUrl, d => {
        const year = +d['year'];
        const quantity = +d['quantity'];
        if (isNaN(year) || isNaN(quantity)) {
          console.warn('Invalid data row:', d);
          return null; // Skip invalid rows
        }
        return {
          recipients: d['recipients'],
          suppliers: d['suppliers'],
          year: year,
          quantity: quantity,
          weaponDescription: d['weapon description'],
          status: d['status'],
        };
      })
    ])
    .then(([worldDataRaw, armsDataRaw]) => {
      // Filter out null entries
      armsDataRaw = armsDataRaw.filter(row => row !== null);

      // Convert TopoJSON to GeoJSON Features
      const countriesData = topojson.feature(worldDataRaw, worldDataRaw.objects.countries).features;
      setCountries(countriesData); // Store countries data in state

      // Process arms transfer data
      const processedData = {};
      const uniqueWeaponTypes = new Set();
      const tempMaxQuantities = {};
      const availableYears = new Set(); // To track available years

      armsDataRaw.forEach(row => {
        let country = row.recipients;
        country = countryNameMapping[country] || country; // Apply mapping

        const year = row.year;
        if (!isNaN(year)) {
          availableYears.add(year); // Track available years
        }
        const weaponType = row.weaponDescription ? row.weaponDescription.trim() : ""; // Trim whitespace
        const quantity = row.quantity;
        const suppliers = row.suppliers;
        const status = row.status;

        // Only add non-empty weapon types
        if (weaponType !== "") {
          uniqueWeaponTypes.add(weaponType);
        }

        if (!processedData[country]) {
          processedData[country] = {};
        }
        if (!processedData[country][year]) {
          processedData[country][year] = {};
        }

        // Assuming one entry per country-year-weaponType
        processedData[country][year][weaponType] = {
          quantity,
          suppliers,
          status
        };

        // Update max quantities for scales
        if (!tempMaxQuantities[weaponType]) {
          tempMaxQuantities[weaponType] = {};
        }
        if (!tempMaxQuantities[weaponType][year] || quantity > tempMaxQuantities[weaponType][year]) {
          tempMaxQuantities[weaponType][year] = quantity;
        }
      });

      // Set the selected year to the earliest available year
      const yearsArray = Array.from(availableYears).filter(year => !isNaN(year));
      const firstAvailableYear = Math.min(...yearsArray);

      if (!isNaN(firstAvailableYear)) {
        setSelectedYear(firstAvailableYear); // Set initial selected year to the first available year
      } else {
        console.warn('No valid years found in data.');
        setError('No valid years found in data.');
      }

      // Construct weaponTypesArray with "All" and filter out any empty entries
      const weaponTypesArray = ["All", ...Array.from(uniqueWeaponTypes).filter(wt => wt !== "" && wt !== undefined).sort()];
      setWeaponTypes(weaponTypesArray);
      setCountryData(processedData);
      setMaxQuantities(tempMaxQuantities);
      setLoading(false);

      console.log("Available Weapon Types:", weaponTypesArray);
    })
    .catch(error => {
      console.error("Error loading data:", error);
      setError("Failed to load data. Please try again later.");
      setLoading(false);
    });
  }, []); // Empty dependency array ensures this runs once on mount

  /**
   * Rendering Effect
   * Draws the map whenever selectedYear, selectedWeaponType, or countryData changes.
   */
  useEffect(() => {
    if (
      countries.length === 0 ||
      Object.keys(countryData).length === 0 ||
      selectedYear === null ||
      isNaN(selectedYear) ||
      !selectedWeaponType
    ) return;

    console.log("Drawing map with Year:", selectedYear, "Weapon Type:", selectedWeaponType);
    drawMap(countries, countryData, selectedYear, selectedWeaponType);
  }, [selectedYear, selectedWeaponType, countryData, countries]);

  /**
   * Function to Draw the Map
   */
  const drawMap = (countries, armsData, year, weaponType) => {
    const width = 1000;
    const height = 600;

    // Define Projection and Path
    const projection = d3.geoMercator()
      .center([0, 20])
      .scale(130)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Define Color and Size Scales
    let maxQuantity;
    let colorScale;
    let sizeScale;

    if (weaponType === "All") {
      // Calculate the sum of quantities across all weapon types for each country
      maxQuantity = d3.max(countries, d => {
        const country = d.properties.name;
        const yearData = armsData[country]?.[year];
        if (yearData) {
          return Object.values(yearData).reduce((acc, curr) => acc + curr.quantity, 0);
        }
        return 0;
      }) || 0;

      colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, maxQuantity]);

      sizeScale = d3.scaleSqrt()
        .domain([0, maxQuantity])
        .range([0, 50]); // Adjust circle size range as necessary
    } else {
      // Specific weapon type
      maxQuantity = d3.max(countries, d => armsData[d.properties.name]?.[year]?.[weaponType]?.quantity || 0) || 0;

      colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, maxQuantity]);

      sizeScale = d3.scaleSqrt()
        .domain([0, maxQuantity])
        .range([0, 50]); // Adjust circle size range as necessary
    }

    // Select and Setup SVG
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background-color', '#f0f0f0')
      .call(d3.zoom() // Implement Zooming and Panning
        .scaleExtent([1, 8]) // Zoom scale limits
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        })
      );

    // Create a group for map elements
    let g = svg.select('g.map-group');
    if (g.empty()) {
      g = svg.append('g').attr('class', 'map-group');
    }

    // Clear previous drawings within the group
    g.selectAll('*').remove();

    // Draw Country Paths with Color Based on Quantity
    g.selectAll('path')
      .data(countries)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => {
        const country = d.properties.name;
        if (weaponType === "All") {
          const yearData = armsData[country]?.[year];
          if (yearData) {
            const totalQuantity = Object.values(yearData).reduce((acc, curr) => acc + curr.quantity, 0);
            return totalQuantity > 0 ? colorScale(totalQuantity) : '#ccc';
          }
          return '#ccc';
        } else {
          const quantity = armsData[country]?.[year]?.[weaponType]?.quantity || 0;
          return quantity > 0 ? colorScale(quantity) : '#ccc';
        }
      })
      .attr('stroke', '#333333')
      .attr('stroke-width', 0.5)
      .on('mouseenter', (event, d) => {
        const country = d.properties.name;
        const [x, yPos] = d3.pointer(event, document.body);

        // Show minimal tooltip on hover
        if (weaponType === "All") {
          const yearData = armsData[country]?.[year];
          if (!yearData) return; // No data to show

          const totalQuantity = Object.values(yearData).reduce((acc, curr) => acc + curr.quantity, 0);

          setTooltip({
            visible: true,
            x: event.clientX + 20,
            y: event.clientY + 20,
            content: `
              <div style="font-size: 12px;">
                <strong>Country:</strong> ${country}<br/>
                <strong>Year:</strong> ${year}<br/>
                <strong>Total Quantity:</strong> ${totalQuantity} units<br/>
                <em>Click for more details</em>
              </div>
            `
          });
        } else {
          const data = armsData[country]?.[year]?.[weaponType];
          if (!data) return; // No data to show

          setTooltip({
            visible: true,
            x: event.clientX + 20,
            y: event.clientY + 20,
            content: `
              <div style="font-size: 12px;">
                <strong>Country:</strong> ${country}<br/>
                <strong>Year:</strong> ${year}<br/>
                <strong>Quantity:</strong> ${data.quantity} units<br/>
                <em>Click for more details</em>
              </div>
            `
          });
        }
      })
      .on('mousemove', (event) => {
        setTooltip(prev => ({
          ...prev,
          x: event.clientX + 20,
          y: event.clientY + 20
        }));
      })
      .on('mouseleave', () => {
        setTooltip({ visible: false, x: 0, y: 0, content: '' });
      })
      .on('click', (event, d) => {
        const country = d.properties.name;
        if (weaponType === "All") {
          const yearData = armsData[country]?.[year];
          if (!yearData) return; // No data to show

          setModalData({
            country,
            year,
            data: yearData
          });
        } else {
          const data = armsData[country]?.[year]?.[weaponType];
          if (!data) return; // No data to show

          setModalData({
            country,
            year,
            weaponType,
            data
          });
        }
      });

    // Add Circles Over Each Country Based on Quantity
    g.selectAll('circle')
      .data(countries)
      .enter()
      .append('circle')
      .attr('cx', d => projection(d3.geoCentroid(d))[0])
      .attr('cy', d => projection(d3.geoCentroid(d))[1])
      .attr('r', d => {
        const country = d.properties.name;
        if (weaponType === "All") {
          const yearData = armsData[country]?.[year];
          if (yearData) {
            return sizeScale(Object.values(yearData).reduce((acc, curr) => acc + curr.quantity, 0));
          }
          return 0;
        } else {
          const quantity = armsData[country]?.[year]?.[weaponType]?.quantity || 0;
          return quantity > 0 ? sizeScale(quantity) : 0;
        }
      })
      .attr('fill', 'rgba(255, 69, 0, 0.7)') // Semi-transparent orange color for the circles
      .attr('stroke', 'orange')
      .attr('stroke-width', 0.5)
      .on('mouseenter', (event, d) => {
        const country = d.properties.name;
        const [x, yPos] = d3.pointer(event, document.body);

        // Show minimal tooltip on hover
        if (weaponType === "All") {
          const yearData = armsData[country]?.[year];
          if (!yearData) return; // No data to show

          const totalQuantity = Object.values(yearData).reduce((acc, curr) => acc + curr.quantity, 0);

          setTooltip({
            visible: true,
            x: event.clientX + 20,
            y: event.clientY + 20,
            content: `
              <div style="font-size: 12px;">
                <strong>Country:</strong> ${country}<br/>
                <strong>Year:</strong> ${year}<br/>
                <strong>Total Quantity:</strong> ${totalQuantity} units<br/>
                <em>Click for more details</em>
              </div>
            `
          });
        } else {
          const data = armsData[country]?.[year]?.[weaponType];
          if (!data) return; // No data to show

          setTooltip({
            visible: true,
            x: event.clientX + 20,
            y: event.clientY + 20,
            content: `
              <div style="font-size: 12px;">
                <strong>Country:</strong> ${country}<br/>
                <strong>Year:</strong> ${year}<br/>
                <strong>Quantity:</strong> ${data.quantity} units<br/>
                <em>Click for more details</em>
              </div>
            `
          });
        }
      })
      .on('mousemove', (event) => {
        setTooltip(prev => ({
          ...prev,
          x: event.clientX + 20,
          y: event.clientY + 20
        }));
      })
      .on('mouseleave', () => {
        setTooltip({ visible: false, x: 0, y: 0, content: '' });
      })
      .on('click', (event, d) => {
        const country = d.properties.name;
        if (weaponType === "All") {
          const yearData = armsData[country]?.[year];
          if (!yearData) return; // No data to show

          setModalData({
            country,
            year,
            data: yearData
          });
        } else {
          const data = armsData[country]?.[year]?.[weaponType];
          if (!data) return; // No data to show

          setModalData({
            country,
            year,
            weaponType,
            data
          });
        }
      });

    // Add Title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height - 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '22px')
      .attr('font-weight', 'bold')
      .attr('fill', '#A52A2A')
      .text(`Arms Exports by Country in ${year} (${weaponType})`);
  };

  /**
   * Function to Close Modal
   */
  const closeModal = () => {
    setModalData(null);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
      <h3>Arms Imports by Weapon Type and Year</h3>

      {loading && <div className="loading">Loading data...</div>}
      {error && <div className="error" style={{ color: 'red' }}>{error}</div>}

      {!loading && !error && (
        <>
          {/* Weapon Type Selection */}
          <label htmlFor="weaponTypeSelect">Select Weapon Type: </label>
          <select
            id="weaponTypeSelect"
            onChange={e => setSelectedWeaponType(e.target.value)}
            value={selectedWeaponType}
            aria-label="Select Weapon Type"
            style={{ marginBottom: '10px', padding: '5px', fontSize: '14px' }}
          >
            {weaponTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Year Slider */}
          <div style={{ position: 'absolute', bottom: '40px', left: '10px', width: '200px' }}>
            <input
              type="range"
              min="1960" // Adjusted to match the earliest year in your dataset
              max="2023"
              value={!isNaN(selectedYear) ? selectedYear : 2023} // Use current selected year or a fallback
              onChange={(e) => setSelectedYear(+e.target.value)}
              style={{
                width: '100%',
                appearance: 'none',
                backgroundColor: '#FFA500',
                height: '8px',
                borderRadius: '5px',
                outline: 'none',
              }}
            />
            <div style={{ 
              position: 'absolute', 
              bottom: '-25px', 
              left: '0px', 
              fontWeight: 'bold', 
              color: 'brown',
              fontSize: '14px'
            }}>
              Year: {!isNaN(selectedYear) ? selectedYear : 'Select a year'}
            </div>
          </div>

          {/* SVG Map */}
          <svg ref={svgRef}></svg>

          {/* Tooltip */}
          {tooltip.visible && (
            <div
              className="tooltip"
              style={{
                position: 'absolute',
                top: tooltip.y,
                left: tooltip.x,
                whiteSpace: 'pre-line',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '6px',
                borderRadius: '6px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
                fontSize: '12px',
                lineHeight: '1.4',
                color: 'black',
                maxWidth: '250px',
              }}
              dangerouslySetInnerHTML={{ __html: tooltip.content }}
            />
          )}

          {/* Modal */}
          {modalData && (
            <div
              className="modal"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
              onClick={closeModal}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  padding: '20px',
                  borderRadius: '8px',
                  maxWidth: '600px',
                  width: '90%',
                  maxHeight: '80%',
                  overflowY: 'auto',
                  position: 'relative',
                }}
                onClick={(e) => e.stopPropagation()} // Prevent click from closing modal when clicking inside
              >
                <button
                  onClick={closeModal}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                  }}
                >
                  &times;
                </button>
                <h2>Detailed Information</h2>
                <p><strong>Country:</strong> {modalData.country}</p>
                <p><strong>Year:</strong> {modalData.year}</p>
                {selectedWeaponType === "All" ? (
                  <>
                    <h3>Weapon Types and Quantities:</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Weapon Type</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Supplier</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Quantity</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(modalData.data).map(([wt, data]) => (
                          <tr key={wt}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{wt}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{data.suppliers}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{data.quantity}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{data.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <>
                    <p><strong>Weapon Type:</strong> {modalData.weaponType}</p>
                    <p><strong>Supplier:</strong> {modalData.data.suppliers}</p>
                    <p><strong>Quantity:</strong> {modalData.data.quantity} units</p>
                    <p><strong>Status:</strong> {modalData.data.status}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChoroplethMap;
