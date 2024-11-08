// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import DotMap from './maps/DotMap';
import ChoroplethMap from './maps/ChoroplethMap';
import ProportionalSymbolMap from './maps/ProportionalSymbolMap';
import MigrationMap from './layouts/MigrationMap';
import Treemap from './layouts/Treemap';
import PieChart from './layouts/PieChart';
import ZoomableCirclePacking from './layouts/ZoomableCirclePacking';
import ForceDirectedGraph from './layouts/ForceDirectedGraph';
import LineChart from './layouts/Linechart';
import ParallelCoordinatesChart from './layouts/ParallelCoordinatesChart';
import '../index.css';

const Dashboard = () => {
  // State Variables
  const [selectedMap, setSelectedMap] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2023);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [hierarchicalData, setHierarchicalData] = useState(null);
  const [tradeData, setTradeData] = useState([]);
  const [migrationData, setMigrationData] = useState([]);
  const [forceDirectedData, setForceDirectedData] = useState([]);
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // Data URLs
  const conflictsDataUrl = 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_conflicts_locations_with_coordinates.csv'; // Not used in Dashboard.js
  const militaryExpenditureDataUrl = 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_arms_expenditure_by_regions.csv'; // Not used in Dashboard.js
  const regionalTransfersDataUrl = 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_regional_transfers.csv';
  const top100CompaniesDataUrl = 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_top_100_arms_companies_consolidated.csv';
  const armsSuppliersDataUrl = 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_arms_suppliers.csv';
  const globalArmsRevenueDataUrl = 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_global_total_arms_revenue.csv';
  const armsRecipientsDataUrl = 'https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_arms_recipients.csv';

  // Fetch data for visualizations
  useEffect(() => {
    d3.csv(top100CompaniesDataUrl)
      .then(data => setHierarchicalData(data))
      .catch(error => console.error("Error loading top 100 companies data:", error));
  }, []);

  useEffect(() => {
    d3.csv(regionalTransfersDataUrl)
      .then(data => setTradeData(data))
      .catch(error => console.error("Error loading regional transfers data:", error));
  }, []);

  useEffect(() => {
    d3.csv(armsSuppliersDataUrl)
      .then(data => setMigrationData(data))
      .catch(error => console.error("Error loading arms suppliers data:", error));
  }, []);

  useEffect(() => {
    d3.csv(globalArmsRevenueDataUrl)
      .then(data => setForceDirectedData(data))
      .catch(error => console.error("Error loading global arms revenue data:", error));
  }, []);

  // Handle Map Selection
  const handleMapSelection = (map) => {
    setSelectedMap(map);
    setSelectedLayout(null);
  };

  return (
    <div className="dashboard-container">
      <h1>Global Arms Trade Dashboard</h1>

      <nav className="navbar">
        <button onClick={() => handleMapSelection('DotMap')}>Dot Map (Conflict Hotspots)</button>
        <button onClick={() => handleMapSelection('ProportionalSymbolMap')}>Proportional Symbol Map (Arms Imports by Region)</button>
        <button onClick={() => handleMapSelection('ChoroplethMap')}>Choropleth Map (Arm Imports by Weapon Type and Year)</button>
        <button onClick={() => handleMapSelection('MigrationMap')}>Arms Proliferation Map (US, Russia, China)</button>
      </nav>

      <div className="content-area">
        <main className="map-layout-display">
          {selectedMap === 'DotMap' && (
            <DotMap
              dataUrl={conflictsDataUrl}
              onCityHover={setHoveredCity} // Removed onCitySelect since cityData is unused
            />
          )}
          {selectedMap === 'ChoroplethMap' && (
            <ChoroplethMap
              dataUrl={militaryExpenditureDataUrl}
              onRegionHover={setHoveredRegion}
            />
          )}
          {selectedMap === 'ProportionalSymbolMap' && (
            <>
              <ProportionalSymbolMap
                dataUrl={regionalTransfersDataUrl}
                selectedYear={selectedYear}
              />
              <div style={{ marginTop: '10px', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#0db4de' }}>
                  Year: {selectedYear}
                </label>
                <input
                  type="range"
                  min="1950"
                  max="2023"
                  value={selectedYear}
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
              </div>
            </>
          )}
          {selectedMap === 'MigrationMap' && (
            <MigrationMap
              data={migrationData}
            />
          )}

          <div className="layout-display">
            {selectedLayout === 'Treemap' && (
              <Treemap
                data={hierarchicalData}
                highlightedCity={hoveredCity}
              />
            )}
            {selectedLayout === 'PieChart' && (
              tradeData.length > 0 ? (
                <PieChart
                  selectedYear={selectedYear}
                />
              ) : (
                <p>No data available for Pie Chart</p>
              )
            )}
            {selectedLayout === 'ZoomableCirclePacking' && (
              <ZoomableCirclePacking />
            )}
            {selectedLayout === 'ForceDirectedGraph' && (
              <ForceDirectedGraph
                data={forceDirectedData}
              />
            )}
            {selectedLayout === 'ParallelCoordinatesChart' && (
              <ParallelCoordinatesChart
                data={migrationData}
              />
            )}
            {selectedLayout === 'LineChart' && (
              <LineChart
                importDataUrl={armsRecipientsDataUrl}
                exportDataUrl={armsSuppliersDataUrl}
              />
            )}
          </div>
        </main>

        {selectedMap && (
          <aside className="sidebar">
            <h3>Layout Options</h3>
            {selectedMap === 'DotMap' && (
              <>
                <button onClick={() => setSelectedLayout('Treemap')}>Treemap (Arms Market by Company)</button>
              </>
            )}
            {selectedMap === 'ProportionalSymbolMap' && (
              <>
                <button onClick={() => setSelectedLayout('PieChart')}>Pie Chart (Military Expenditure by Region)</button>
                <button onClick={() => setSelectedLayout('LineChart')}>Multiline Chart (Arms Imports/Exports Over Time)</button>
              </>
            )}
            {selectedMap === 'MigrationMap' && (
              <>
                <button onClick={() => setSelectedLayout('ForceDirectedGraph')}>Force-Directed Graph (Global Arms Trade Network of US, China and Russia)</button>
                <button onClick={() => setSelectedLayout('ParallelCoordinatesChart')}>Parallel Coordinates Chart (Top 10 Recipients of US, China and Russia)</button>
                <button onClick={() => setSelectedLayout('ZoomableCirclePacking')}>Zoomable Circle Packing (Supplier Hierarchy)</button> {/* Added ZoomableCirclePacking */}
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
