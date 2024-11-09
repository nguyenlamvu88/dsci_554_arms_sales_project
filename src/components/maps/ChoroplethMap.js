import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const ChoroplethMap = () => {
  const svgRef = useRef();

  // State Variables
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });
  const [modalData, setModalData] = useState(null); // For storing data to display in the modal
  const [countryData, setCountryData] = useState({});
  const [countries, setCountries] = useState([]); // Store GeoJSON features
  const [selectedYear, setSelectedYear] = useState(null); // Initialize to null
  const [selectedWeaponType, setSelectedWeaponType] = useState(null); // Initialize to null
  const [weaponTypes, setWeaponTypes] = useState([]);
  const [maxQuantities, setMaxQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minYear, setMinYear] = useState(1950); // Fixed minimum year
  const [maxYear, setMaxYear] = useState(2023); // Fixed maximum year

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
        // Validate year range
        if (isNaN(year) || isNaN(quantity) || year < minYear || year > maxYear) {
          console.warn('Invalid or out-of-range data row:', d);
          return null; // Skip invalid or out-of-range rows
        }
        return {
          recipients: d['recipients'],
          suppliers: d['suppliers'],
          year: Math.round(year), // Ensure year is an integer
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

      armsDataRaw.forEach(row => {
        let country = row.recipients;
        country = countryNameMapping[country] || country; // Apply mapping

        const year = row.year;
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

      // Construct weaponTypesArray with "All" and filter out any empty entries
      const weaponTypesArray = ["All", ...Array.from(uniqueWeaponTypes).filter(wt => wt !== "" && wt !== undefined).sort()];
      setWeaponTypes(weaponTypesArray);
      setCountryData(processedData);
      setMaxQuantities(tempMaxQuantities);
      setLoading(false);

      // Check if default year 1980 has data
      const has1980Data = armsDataRaw.some(row => row.year === 1980);
      if (!has1980Data) {
        console.warn('No data available for the default year 1980.');
        setError('No data available for the default year 1980.');
      }

      // Set default selectedYear and selectedWeaponType based on available data
      const availableYears = Array.from(new Set(armsDataRaw.map(d => d.year))).sort((a, b) => a - b);
      if (availableYears.length > 0) {
        setSelectedYear(availableYears[0]);
      }

      if (weaponTypesArray.includes('All')) {
        setSelectedWeaponType('All');
      } else if (weaponTypesArray.length > 0) {
        setSelectedWeaponType(weaponTypesArray[0]);
      }

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
    const width = 800;
    const height = 450;

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

    // Function to Handle Tooltip Content
    const handleTooltipContent = (country, year, weaponType, data) => {
      if (weaponType === "All") {
        const totalQuantity = Object.values(data).reduce((acc, curr) => acc + curr.quantity, 0);
        return (
          <div style={{ lineHeight: '1.6', fontSize: '17px' }}>
            <strong>{country}</strong><br/>
            Year: {year}<br/>
            Total Import Quantity: {totalQuantity} units<br/>
            <br/>
            <span style={{ fontSize: '17px', fontWeight: 'bold', cursor: 'pointer', color: '#0db4de' }}>
              Click for Details
            </span>
          </div>
        );
      } else {
        // Handle other weapon types if necessary
        return (
          <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
            <strong>{country}</strong><br/>
            Year: {year}<br/>
            Weapon: {weaponType}<br/>
            Quantity: {data.quantity} units<br/>
            Status: {data.status}<br/>
            <br/>
            <span style={{ fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', color: '#0db4de' }}>
              Click for Details
            </span>
          </div>
        );
      }
    };

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

        let content = null;

        if (weaponType === "All") {
          const yearData = armsData[country]?.[year];
          if (!yearData) return; // No data to show

          content = handleTooltipContent(country, year, weaponType, yearData);
        } else {
          const data = armsData[country]?.[year]?.[weaponType];
          if (!data) return; // No data to show

          content = handleTooltipContent(country, year, weaponType, data);
        }

        // Use d3.pointer to get mouse position relative to the SVG
        const [x, yPos] = d3.pointer(event, svgRef.current);

        setTooltip({
          visible: true,
          x: x + 15, // Offset to avoid cursor overlap
          y: yPos + 15,
          content: content
        });
      })
      .on('mousemove', (event) => {
        const [x, y] = d3.pointer(event, svgRef.current);
        const tooltipWidth = 300; // Match with Tooltip.css max-width
        const tooltipHeight = 100; // Adjust as needed

        // Calculate position with offset
        let tooltipX = x + 15;
        let tooltipY = y + 100;

        // Get container dimensions
        const container = svgRef.current.parentNode;
        const containerRect = container.getBoundingClientRect();

        // Adjust tooltip position if it overflows the right edge
        if (tooltipX + tooltipWidth > containerRect.width) {
          tooltipX = x - tooltipWidth - 15;
        }

        // Adjust tooltip position if it overflows the bottom edge
        if (tooltipY + tooltipHeight > containerRect.height) {
          tooltipY = y - tooltipHeight - 15;
        }

        setTooltip(prev => ({
          ...prev,
          x: tooltipX,
          y: tooltipY
        }));
      })
      .on('mouseleave', () => {
        setTooltip({ visible: false, x: 0, y: 0, content: null });
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

    // Draw Circles Over Each Country Based on Quantity
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

        let content = null;

        if (weaponType === "All") {
          const yearData = armsData[country]?.[year];
          if (!yearData) return; // No data to show

          content = handleTooltipContent(country, year, weaponType, yearData);
        } else {
          const data = armsData[country]?.[year]?.[weaponType];
          if (!data) return; // No data to show

          content = handleTooltipContent(country, year, weaponType, data);
        }

        // Use d3.pointer to get mouse position relative to the SVG
        const [x, yPos] = d3.pointer(event, svgRef.current);

        setTooltip({
          visible: true,
          x: x + 15, // Offset to avoid cursor overlap
          y: yPos + 15,
          content: content
        });
      })
      .on('mousemove', (event) => {
        const [x, y] = d3.pointer(event, svgRef.current);
        const tooltipWidth = 300; // Match with Tooltip.css max-width
        const tooltipHeight = 100; // Adjust as needed

        // Calculate position with offset
        let tooltipX = x + 15;
        let tooltipY = y + 100;

        // Get container dimensions
        const container = svgRef.current.parentNode;
        const containerRect = container.getBoundingClientRect();

        // Adjust tooltip position if it overflows the right edge
        if (tooltipX + tooltipWidth > containerRect.width) {
          tooltipX = x - tooltipWidth - 15;
        }

        // Adjust tooltip position if it overflows the bottom edge
        if (tooltipY + tooltipHeight > containerRect.height) {
          tooltipY = y - tooltipHeight - 15;
        }

        setTooltip(prev => ({
          ...prev,
          x: tooltipX,
          y: tooltipY
        }));
      })
      .on('mouseleave', () => {
        setTooltip({ visible: false, x: 0, y: 0, content: null });
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
      .text(``);
  };

  /**
   * Function to Close Modal
   */
  const closeModal = () => {
    setModalData(null);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'auto', color: '#0db4de', fontSize: '17px' }}>
      <h3>Arms Imports by Weapon Type and Year</h3>

      {loading && <div className="loading">Loading data...</div>}
      {error && <div className="error" style={{ color: 'red' }}>{error}</div>}

      {!loading && !error && (
        <>
          {/* Weapon Type Selection */}
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="weaponTypeSelect">Select Weapon Type: </label>
            <select
              id="weaponTypeSelect"
              onChange={e => setSelectedWeaponType(e.target.value)}
              value={selectedWeaponType}
              aria-label="Select Weapon Type"
              style={{ padding: '5px', fontSize: '14px' }}
            >
              {weaponTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Year Slider */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="yearSlider"
              style={{
                display: 'block',
                marginBottom: '5px',
                color: '#0db4de' // Change this hex code to your desired color
              }}
            >
                            
            </label>
            <input
              type="range"
              id="yearSlider"
              min={minYear} // Fixed earliest year
              max={maxYear} // Fixed latest year
              step={1} // Ensure only whole numbers
              value={selectedYear} // Use selectedYear directly
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))} // Ensure integer
              style={{
                width: '100%',
                appearance: 'none',
                backgroundColor: '#FFA500',
                height: '8px',
                borderRadius: '5px',
                outline: 'none',
              }}
              disabled={!selectedWeaponType} // Disable until weapon type is selected
            />
            <div style={{ 
              marginTop: '5px', 
              fontWeight: 'bold', 
              color: '#0db4de',
              fontSize: '16px'
            }}>
              Year: {selectedYear}
            </div>
          </div>

          {/* SVG Map */}
          <svg ref={svgRef}></svg>

          {/* Tooltip */}
          {tooltip.visible && (
            <div
              style={{
                position: 'absolute',
                top: tooltip.y,
                left: tooltip.x,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: '#ffffff',
                padding: '16px 20px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                fontSize: '16px',
                pointerEvents: 'none',
                transition: 'opacity 0.3s ease',
                opacity: tooltip.visible ? 1 : 0,
                zIndex: 10,
                maxWidth: '300px',
                width: 'auto',
                height: 'auto',
              }}
            >
              {tooltip.content}
            </div>
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
                    color: 'black', // Ensure close button text is black
                  }}
                  aria-label="Close modal"
                >
                  &times;
                </button>
                
                <p style={{ color: 'black' }}><strong>Country:</strong> {modalData.country}</p>
                <p style={{ color: 'black' }}><strong>Year:</strong> {modalData.year}</p>
                {selectedWeaponType === "All" ? (
                  <>                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'black' }}>
                      <thead>
                        <tr>
                          <th style={{ border: '1px solid #ddd', padding: '8px', color: 'black' }}>Weapon Type</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px', color: 'black' }}>Supplier</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px', color: 'black' }}>Quantity</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px', color: 'black' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(modalData.data).map(([wt, data]) => (
                          <tr key={wt}>
                            <td style={{ border: '1px solid #ddd', padding: '8px', color: 'black' }}>{wt}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px', color: 'black' }}>{data.suppliers}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px', color: 'black' }}>{data.quantity}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px', color: 'black' }}>{data.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <>
                    <p style={{ color: 'black' }}><strong>Weapon Type:</strong> {modalData.weaponType}</p>
                    <p style={{ color: 'black' }}><strong>Supplier:</strong> {modalData.data.suppliers}</p>
                    <p style={{ color: 'black' }}><strong>Quantity:</strong> {modalData.data.quantity} units</p>
                    <p style={{ color: 'black' }}><strong>Status:</strong> {modalData.data.status}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Error Handling: If no data for default selections */}
      {error && !loading && (
        <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default ChoroplethMap;
