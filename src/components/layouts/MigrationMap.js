import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const MigrationMap = () => {
  const svgRef = useRef();
  const width = 1000;
  const height = 600;

  const [worldGeoJSON, setWorldGeoJSON] = useState(null);
  const [countryCentroids, setCountryCentroids] = useState({});
  const [tradeData, setTradeData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2023);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [error, setError] = useState(null);
  const [legendData, setLegendData] = useState({
    originColors: {
      "United States": "#1f77b4",
      "Russia": "#D2691E",
      "China": "#2ca02c",
      "All": "#9467bd" // Added "All" to originColors
    },
    recipientCircle: {
      label: 'Recipient Importance',
      sizes: [3, 6],
    },
  });

  // URLs for arms data by country (using original URLs)
  const urls = {
    "United States": 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_recipients_of_us_arms_hierarchical.json',
    "Russia": 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_recipients_of_russia_arms_hierarchical.json',
    "China": 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_recipients_of_china_arms_hierarchical.json',
    "All": 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_recipients_of_combined_us_china_russia_arms_hierarchical.json'
  };

  const geoJSONUrl = 'https://unpkg.com/world-atlas@2/countries-110m.json';

  const normalizeCountryName = (name) => {
    const mapping = {
      "United States of America": "United States",
      "USA": "United States",
      "Russian Federation": "Russia",
      "People's Republic of China": "China",
      // Add more mappings as needed
    };
    return mapping[name] || name;
  };

  // Define color mapping for origin countries
  const originColors = {
    "United States": "#1f77b4",
    "Russia": "#D2691E",
    "China": "#2ca02c",
    "All": "#9467bd" // Consistent color for "All"
  };

  // Load trade data based on selected country
  useEffect(() => {
    setError(null); // Reset error state
    d3.json(urls[selectedCountry])
      .then(data => {
        console.log(`Fetched data for ${selectedCountry}:`, data); // Log fetched data

        if (selectedCountry === "All") {
          if (data && data.data) {
            setTradeData(data.data);
          } else {
            console.error("Unexpected data structure for 'All'", data);
            setError("Failed to load 'All' trade data.");
            setTradeData([]);
          }
        } else {
          if (data && data.recipients && Array.isArray(data.recipients)) {
            setTradeData(data.recipients);
          } else {
            console.error(`Unexpected data structure for ${selectedCountry}`, data);
            setError(`Failed to load ${selectedCountry} trade data.`);
            setTradeData([]);
          }
        }
      })
      .catch(error => {
        console.error("Error loading trade data:", error);
        setError(`Error loading ${selectedCountry} trade data.`);
        setTradeData([]);
      });
  }, [selectedCountry]);

  // Load world GeoJSON data
  useEffect(() => {
    d3.json(geoJSONUrl)
      .then(worldData => {
        console.log("Fetched world GeoJSON data:", worldData); // Log fetched GeoJSON data
        const centroids = {};
        topojson.feature(worldData, worldData.objects.countries).features.forEach(feature => {
          const countryName = feature.properties.name;
          centroids[normalizeCountryName(countryName)] = d3.geoCentroid(feature);
        });
        setCountryCentroids(centroids);
        setWorldGeoJSON(worldData);
      })
      .catch(error => {
        console.error("Error fetching GeoJSON data:", error);
        setError("Error loading map data.");
      });
  }, []);

  useEffect(() => {
    if (!worldGeoJSON || tradeData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = d3.geoMercator().scale(150).translate([width / 2, height / 1.5]);
    const path = d3.geoPath().projection(projection);

    const mapContainer = svg.append("g").attr("class", "map-container");

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        mapContainer.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Draw countries
    mapContainer.selectAll("path.country")
      .data(topojson.feature(worldGeoJSON, worldGeoJSON.objects.countries).features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", "#c0c0c0")
      .attr("stroke", "#999")
      .attr("stroke-width", 1.5);

    // Prepare trade data with coordinates
    let validTrades = [];
    let topRecipientCountries = new Set();

    if (selectedCountry === "All") {
      validTrades = tradeData.flatMap(supplier => {
        if (!supplier || !supplier.recipients || !Array.isArray(supplier.recipients)) return [];
        return supplier.recipients.map(recipient => {
          const originCountry = supplier.supplier;
          const destCountry = normalizeCountryName(recipient.recipient);
          const originCoords = countryCentroids[normalizeCountryName(originCountry)];
          const destCoords = countryCentroids[destCountry];

          if (originCoords && destCoords) {
            const tradeValue = recipient.years[selectedYear] || 0;
            return {
              originCountry,
              destCountry,
              originX: projection(originCoords)[0],
              originY: projection(originCoords)[1],
              destX: projection(destCoords)[0],
              destY: projection(destCoords)[1],
              tradeValue,
            };
          } else {
            console.warn(`Missing centroid for ${originCountry} or ${destCountry}`);
            return null;
          }
        });
      }).filter(d => d !== null && d.tradeValue > 0);
      
      // Sort by trade value and get top 5 recipients for the year
      validTrades.sort((a, b) => b.tradeValue - a.tradeValue);
      topRecipientCountries = new Set(validTrades.slice(0, 5).map(d => d.destCountry));

    } else {
      // Logic for individual countries
      validTrades = tradeData.map(recipient => {
        const originCountry = selectedCountry;
        const destCountry = normalizeCountryName(recipient.recipient);
        const originCoords = countryCentroids[originCountry];
        const destCoords = countryCentroids[destCountry];

        if (originCoords && destCoords) {
          const tradeValue = recipient.years[selectedYear] || 0;
          return {
            originCountry,
            destCountry,
            originX: projection(originCoords)[0],
            originY: projection(originCoords)[1],
            destX: projection(destCoords)[0],
            destY: projection(destCoords)[1],
            tradeValue,
          };
        } else {
          console.warn(`Missing centroid for ${originCountry} or ${destCountry}`);
          return null;
        }
      }).filter(d => d !== null && d.tradeValue > 0);

      // Sort by trade value and get top 5 recipients for the year
      validTrades.sort((a, b) => b.tradeValue - a.tradeValue);
      topRecipientCountries = new Set(validTrades.slice(0, 5).map(d => d.destCountry));
    }

    const maxTradeValue = d3.max(validTrades, d => d.tradeValue) || 0;
    const strokeScale = d3.scaleSqrt().domain([0, maxTradeValue]).range([1, 4]);

    // Draw trade lines
    mapContainer.selectAll("line.trade-line")
      .data(validTrades)
      .enter()
      .append("line")
      .attr("class", "trade-line")
      .attr("x1", d => d.originX)
      .attr("y1", d => d.originY)
      .attr("x2", d => d.destX)
      .attr("y2", d => d.destY)
      .attr("stroke", d => originColors[d.originCountry] || "rgba(30, 144, 255, 0.5)")
      .attr("stroke-width", d => strokeScale(d.tradeValue))
      .on("mouseover", (event, d) => {
        tooltip
          .style("display", "block")
          .html(`
            <strong>Origin:</strong> ${d.originCountry}<br/>
            <strong>Destination:</strong> ${d.destCountry}<br/>
            <strong>Trade Value:</strong> ${d.tradeValue}
          `);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });

    // Draw trade circles
    mapContainer.selectAll("circle.trade-circle")
      .data(validTrades)
      .enter()
      .append("circle")
      .attr("class", "trade-circle")
      .attr("cx", d => d.destX)
      .attr("cy", d => d.destY)
      .attr("r", d => topRecipientCountries.has(d.destCountry) ? 6 : 3)
      .attr("fill", d => topRecipientCountries.has(d.destCountry) ? "#8A2BE2" : "red") // Purple for top recipients
      .on("mouseover", (event, d) => {
        tooltip
          .style("display", "block")
          .html(`
            <strong>Destination:</strong> ${d.destCountry}<br/>
            <strong>Trade Value:</strong> ${d.tradeValue}
          `);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });

    // Define tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("display", "none");

    return () => tooltip.remove();
  }, [worldGeoJSON, tradeData, countryCentroids, selectedYear, selectedCountry]);

  // Legend Component
  const Legend = ({ data, styles }) => {
    const { originColors, recipientCircle } = data;
    const { container, section, title, item, colorBox, circleExample } = styles;
  
    return (
      <div style={container}>
        {/* Origin Countries */}
        <div style={section}>
          <div style={title}>Origin Countries</div>
          {Object.entries(originColors)
            .filter(([country]) => country !== "All") // Filter out "All"
            .map(([country, color]) => (
              <div key={country} style={item}>
                <div style={{ ...colorBox, backgroundColor: color }}></div>
                <div>{country}</div>
              </div>
            ))}
        </div>
  
        {/* Recipient Circle Sizes */}
        <div style={section}>
          <div style={title}>Recipient Importance</div>
          <div style={item}>
            <svg width="20" height="20" style={{ marginRight: '6px' }}>
              <circle cx="10" cy="10" r={recipientCircle.sizes[0]} fill="red" />
            </svg>
            <div>Normal Recipient</div>
          </div>
          <div style={item}>
            <svg width="20" height="20" style={{ marginRight: '6px' }}>
              <circle cx="10" cy="10" r={recipientCircle.sizes[1]} fill="#8A2BE2" />
            </svg>
            <div>Top Recipient</div>
          </div>
        </div>
      </div>
    );
  };

  // Define legend styles
  const legendStyles = {
    container: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '10px',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      fontSize: '12px',
      color: '#333',
      maxWidth: '200px',
    },
    section: {
      marginBottom: '10px',
    },
    title: {
      fontWeight: 'bold',
      marginBottom: '5px',
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '4px',
    },
    colorBox: {
      width: '12px',
      height: '12px',
      marginRight: '6px',
      borderRadius: '2px',
    },
    circleExample: {
      marginRight: '6px',
    },
  };

  return (
    <div style={{ position: 'relative', width: `${width}px`, height: `${height}px` }}>
      {/* Map Title */}
      <h2 style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        margin: 0, 
        padding: '10px', 
        background: '#D3D3D3', 
        borderRadius: '8px', 
        boxShadow: '0 0 5px rgba(0,0,0,0.3)',
        color: 'black',          // Text color
        textAlign: 'center'      // Center the text within the h2
      }}>
        Global Arms Proliferation By US, China, and Russia (in million USD)
      </h2>

      {/* Display error messages if any */}
      {error && <div style={{ color: 'red', position: 'absolute', top: '60px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.8)', padding: '5px', borderRadius: '4px' }}>{error}</div>}

      {/* SVG Map */}
      <svg ref={svgRef} width={width} height={height} style={{ backgroundColor: '#f0f0f0' }}></svg>

      {/* Legend */}
      {worldGeoJSON && tradeData.length > 0 && (
        <Legend data={legendData} styles={legendStyles} />
      )}

      {/* Controls: Year Slider and Country Selector */}
      <div style={{ position: 'absolute', bottom: '20px', left: '60px', color: 'black', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: '10px' }}>Year: {selectedYear}</div>
      
        <div style={{ marginBottom: '15px' }}>
          <input
            type="range"
            min="1950"
            max="2023"
            value={selectedYear}
            onChange={(e) => setSelectedYear(+e.target.value)}
            style={{
              width: '200px',
            }}
          />
        </div>

        <label htmlFor="country" style={{ display: 'block', marginBottom: '5px' }}>Select Country:</label>
        <select 
          id="country" 
          value={selectedCountry} 
          onChange={(e) => setSelectedCountry(e.target.value)}
          style={{
            fontSize: '14px',       // Increases font size
            padding: '6px 10px',    // Adds padding for better readability
            width: '120px'          // Adjusts the dropdown width
          }}
        >
          <option value="All">All</option>
          <option value="United States">United States</option>
          <option value="Russia">Russia</option>
          <option value="China">China</option>
        </select>
      </div>
    </div>
  );
};

export default MigrationMap;
