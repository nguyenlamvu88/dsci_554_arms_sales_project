// src/components/layouts/MigrationMap.js
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const MigrationMap = () => {
  const svgRef = useRef();
  const width = 1000;
  const height = 600;

  const [worldGeoJSON, setWorldGeoJSON] = useState(null);
  const [countryCentroids, setCountryCentroids] = useState({});
  const [migrationData, setMigrationData] = useState([]);

  const migrationDataUrl = 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_a7/main/migration_map.json';
  const geoJSONUrl = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';

  // Enhanced normalization mapping
  const normalizeCountryName = (name) => {
    const mapping = {
      "United States of America": "United States",
      "Russia": "Russian Federation",
      "Czech Republic": "Czechia",
      "South Korea": "Republic of Korea",
      "North Korea": "Democratic People’s Republic of Korea",
      "Côte d'Ivoire": "Ivory Coast",
      "FYUG": "Former Yugoslavia",
      "LUX": "Luxembourg",
      "USA": "United States",
      "US": "United States",
      "United States": "United States",
      "Unknown": "Unknown",
      // Add more mappings as needed
    };
    return mapping[name] || name;
  };

  // Fetch Migration Data
  useEffect(() => {
    d3.json(migrationDataUrl)
      .then(data => setMigrationData(data))
      .catch(error => console.error("Error loading migration data:", error));
  }, []);

  // Fetch GeoJSON Data and Calculate Centroids
  useEffect(() => {
    d3.json(geoJSONUrl)
      .then(data => {
        const centroids = {};
        data.features.forEach(feature => {
          const countryName = feature.properties.name;
          let centroid = d3.geoCentroid(feature);

          // Manually set centroid for United States if necessary
          if (countryName === "United States") {
            centroid = [-98.5795, 39.8283]; // Approximate centroid
            console.log("Manually set Centroid for United States:", centroid);
          }

          centroids[countryName] = centroid;

          // Log the centroid for verification
          if (countryName === "United States") {
            console.log("Centroid for United States:", centroid);
          }
        });

        // Check if "United States" is present
        if (!centroids["United States"]) {
          console.error("GeoJSON does not include 'United States'. Please check the country name.");
          // Optionally, manually add the centroid
          centroids["United States"] = [-98.5795, 39.8283];
          console.log("Manually added Centroid for United States:", centroids["United States"]);
        }

        setCountryCentroids(centroids);
        setWorldGeoJSON(data);
      })
      .catch(error => console.error("Error fetching GeoJSON data:", error));
  }, []);

  // Log all country names to verify GeoJSON
  useEffect(() => {
    if (worldGeoJSON) {
      console.log("List of Countries in GeoJSON:");
      worldGeoJSON.features.forEach(feature => {
        console.log(feature.properties.name);
      });
    }
  }, [worldGeoJSON]);

  // Log available centroids and verify "United States"
  useEffect(() => {
    if (worldGeoJSON) {
      console.log("Available Centroids:", Object.keys(countryCentroids));
      if (!countryCentroids["United States"]) {
        console.error("Centroid for United States not found.");
      } else {
        console.log("Centroid for United States is available.");
      }
    }
  }, [worldGeoJSON, countryCentroids]);

  // Main Rendering Effect
  useEffect(() => {
    if (!worldGeoJSON || migrationData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous renders

    const projection = d3.geoMercator().scale(150).translate([width / 2, height / 1.5]);
    const path = d3.geoPath().projection(projection);

    const mapContainer = svg.append("g").attr("class", "map-container");

    // Create a tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("display", "none")
      .style("font-size", "14px")
      .style("z-index", "10");

    // Draw the world map
    mapContainer.selectAll("path.country")
      .data(worldGeoJSON.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", "#e0e0e0")
      .attr("stroke", "#333");

    // Prepare migration data with valid centroids
    const validMigrations = migrationData.map(migration => {
      const originCountry = normalizeCountryName(migration.origin_country);
      const destCountry = normalizeCountryName(migration.destination_country);
      const origin = countryCentroids[originCountry];
      const destination = countryCentroids[destCountry];

      if (!origin) {
        console.warn(`Origin centroid not found for: ${originCountry}`);
      }
      if (!destination) {
        console.warn(`Destination centroid not found for: ${destCountry}`);
      }

      if (origin && destination) {
        const [originX, originY] = projection(origin);
        const [destX, destY] = projection(destination);
        return { ...migration, originX, originY, destX, destY };
      }
      return null;
    }).filter(d => d !== null);

    // Define a scale for stroke widths
    const strokeScale = d3.scaleSqrt()
      .domain([d3.min(validMigrations, d => d.number), d3.max(validMigrations, d => d.number)])
      .range([1, 10]);

    // Draw migration lines
    mapContainer.selectAll("line.migration")
      .data(validMigrations)
      .enter()
      .append("line")
      .attr("class", "migration")
      .attr("x1", d => d.originX)
      .attr("y1", d => d.originY)
      .attr("x2", d => d.destX)
      .attr("y2", d => d.destY)
      .attr("stroke", "rgba(0, 123, 255, 0.4)")
      .attr("stroke-width", d => strokeScale(d.number))
      .on("mouseover", function(event, d) {
        tooltip
          .html(`<strong>Migration:</strong> ${d.origin_country} → ${d.destination_country}<br/><strong>Number:</strong> ${Math.round(d.number).toLocaleString()}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`)
          .style("display", "block");
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", function() {
        tooltip.style("display", "none");
      });

    // Draw origin circles
    mapContainer.selectAll("circle.origin")
      .data(validMigrations)
      .enter()
      .append("circle")
      .attr("class", "origin")
      .attr("cx", d => d.originX)
      .attr("cy", d => d.originY)
      .attr("r", 3)
      .attr("fill", "red");

    // Draw destination circles
    mapContainer.selectAll("circle.destination")
      .data(validMigrations)
      .enter()
      .append("circle")
      .attr("class", "destination")
      .attr("cx", d => d.destX)
      .attr("cy", d => d.destY)
      .attr("r", 3)
      .attr("fill", "blue");

    // Zoom and pan functionality
    svg.call(d3.zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        mapContainer.attr("transform", event.transform);
      })
    );

    // Static Legend for red and blue dots
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 190}, ${height - 67})`);

    legend.append("circle")
      .attr("cx", 10)
      .attr("cy", 10)
      .attr("r", 5)
      .attr("fill", "red");

    legend.append("text")
      .attr("x", 20)
      .attr("y", 14)
      .text("Origin Country")
      .attr("fill", "#fff") // Improved contrast
      .style("font-size", "12px");

    legend.append("circle")
      .attr("cx", 10)
      .attr("cy", 30)
      .attr("r", 5)
      .attr("fill", "blue");

    legend.append("text")
      .attr("x", 20)
      .attr("y", 34)
      .text("Destination Country")
      .attr("fill", "#fff") // Improved contrast
      .style("font-size", "12px");

    return () => {
      tooltip.remove();
    };
  }, [worldGeoJSON, countryCentroids, migrationData]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      style={{ backgroundColor: '#333', width: '100%', height: 'auto' }}
      aria-label="Migration Map"
    ></svg>
  );
};

export default MigrationMap;
