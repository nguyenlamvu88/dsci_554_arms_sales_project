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
  const [selectedFilter, setSelectedFilter] = useState("Both");

  const tradeDataUrl = 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_arms_trade_hierarchical_map.json';
  const geoJSONUrl = 'https://unpkg.com/world-atlas@2/countries-110m.json';

  const normalizeCountryName = (name) => {
    const mapping = {
      "United States of America": "United States",
      "USA": "United States",
      // Add more mappings as necessary
    };
    return mapping[name] || name;
  };

  useEffect(() => {
    d3.json(tradeDataUrl)
      .then(data => setTradeData(data))
      .catch(error => console.error("Error loading trade data:", error));
  }, []);

  useEffect(() => {
    d3.json(geoJSONUrl)
      .then(worldData => {
        const centroids = {};
        topojson.feature(worldData, worldData.objects.countries).features.forEach(feature => {
          const countryName = feature.properties.name;
          centroids[normalizeCountryName(countryName)] = d3.geoCentroid(feature);
        });
        setCountryCentroids(centroids);
        setWorldGeoJSON(worldData);
      })
      .catch(error => console.error("Error fetching GeoJSON data:", error));
  }, []);

  useEffect(() => {
    if (!worldGeoJSON || tradeData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = d3.geoMercator().scale(150).translate([width / 2, height / 1.5]);
    const path = d3.geoPath().projection(projection);

    const mapContainer = svg.append("g").attr("class", "map-container");

    // Apply zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        mapContainer.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Draw the world map with thicker borders
    mapContainer.selectAll("path.country")
      .data(topojson.feature(worldGeoJSON, worldGeoJSON.objects.countries).features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", "#e0e0e0")
      .attr("stroke", "#333")
      .attr("stroke-width", 1.5); // Thicker borders

    const validTrades = tradeData.flatMap(origin => 
      origin.children.map(destination => {
        const originCountry = normalizeCountryName(origin.name);
        const destCountry = normalizeCountryName(destination.name);
        const originCoords = countryCentroids[originCountry];
        const destCoords = countryCentroids[destCountry];
        
        if (originCoords && destCoords) {
          const [originX, originY] = projection(originCoords);
          const [destX, destY] = projection(destCoords);
          
          const totalExport = destination.children.reduce((sum, yearData) => sum + yearData.amount, 0);
          const totalImport = totalExport; // Assuming mutual import/export amounts for simplicity here
          
          return {
            originCountry,
            destCountry,
            originX,
            originY,
            destX,
            destY,
            totalExport,
            totalImport
          };
        }
        return null;
      })
    ).filter(d => d !== null);

    // Filter top 50 trade routes by export volume for readability
    const topTrades = validTrades.sort((a, b) => b.totalExport - a.totalExport).slice(0, 50);

    const maxTradeValue = d3.max(topTrades, d => Math.max(d.totalExport, d.totalImport));
    const strokeScale = d3.scaleSqrt()
      .domain([0, maxTradeValue])
      .range([1, 4]);

    // Tooltip for interactivity
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("display", "none");

    // Draw lines based on filter selection
    if (selectedFilter === "Exports" || selectedFilter === "Both") {
      // Export lines (solid blue)
      mapContainer.selectAll("line.export")
        .data(topTrades)
        .enter()
        .append("line")
        .attr("class", "export")
        .attr("x1", d => d.originX)
        .attr("y1", d => d.originY)
        .attr("x2", d => d.destX)
        .attr("y2", d => d.destY)
        .attr("stroke", "rgba(30, 144, 255, 0.5)") // Blue for exports
        .attr("stroke-width", d => strokeScale(d.totalExport))
        .on("mouseover", (event, d) => {
          d3.select(event.currentTarget).attr("stroke", "blue").attr("stroke-width", 2); // Highlight
          tooltip.style("display", "block")
            .html(`<strong>Export:</strong> ${d.originCountry} → ${d.destCountry}<br/><strong>Value:</strong> ${d.totalExport.toFixed(2)}B USD`);
        })
        .on("mousemove", (event) => tooltip.style("left", `${event.pageX + 10}px`).style("top", `${event.pageY - 28}px`))
        .on("mouseout", (event) => {
          d3.select(event.currentTarget).attr("stroke", "rgba(30, 144, 255, 0.5)").attr("stroke-width", d => strokeScale(d.totalExport)); // Remove highlight
          tooltip.style("display", "none");
        });
    }

    if (selectedFilter === "Imports" || selectedFilter === "Both") {
      // Import lines (dashed orange)
      mapContainer.selectAll("line.import")
        .data(topTrades)
        .enter()
        .append("line")
        .attr("class", "import")
        .attr("x1", d => d.destX)
        .attr("y1", d => d.destY)
        .attr("x2", d => d.originX)
        .attr("y2", d => d.originY)
        .attr("stroke", "rgba(255, 165, 0, 0.5)") // Orange for imports
        .attr("stroke-dasharray", "4,2") // Dashed lines for imports
        .attr("stroke-width", d => strokeScale(d.totalImport))
        .on("mouseover", (event, d) => {
          d3.select(event.currentTarget).attr("stroke", "orange").attr("stroke-width", 2); // Highlight
          tooltip.style("display", "block")
            .html(`<strong>Import:</strong> ${d.destCountry} ← ${d.originCountry}<br/><strong>Value:</strong> ${d.totalImport.toFixed(2)}B USD`);
        })
        .on("mousemove", (event) => tooltip.style("left", `${event.pageX + 10}px`).style("top", `${event.pageY - 28}px`))
        .on("mouseout", (event) => {
          d3.select(event.currentTarget).attr("stroke", "rgba(255, 165, 0, 0.5)").attr("stroke-width", d => strokeScale(d.totalImport)); // Remove highlight
          tooltip.style("display", "none");
        });
    }

    return () => tooltip.remove();
  }, [worldGeoJSON, tradeData, countryCentroids, selectedFilter]);

  return (
    <div>
      <label htmlFor="filter">Select Trade Type: </label>
      <select id="filter" value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
        <option value="Both">Both</option>
        <option value="Exports">Exports</option>
        <option value="Imports">Imports</option>
      </select>
      <svg ref={svgRef} width={width} height={height} style={{ backgroundColor: '#333' }}></svg>
    </div>
  );
};

export default MigrationMap;
