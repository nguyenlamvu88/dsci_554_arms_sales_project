
# Global Arms Trade Dashboard

## Overview

The Global Arms Trade Dashboard is a React-based, interactive web application offering an in-depth exploration of how the U.S. leverages arms trade and transfers to promote stability or further its interests. Emphasizing patterns, geopolitical dynamics, and strategic alliances, it utilizes D3.js and various visual components to present a narrative-driven analysis of arms transfers, alliances, and regional influences.

## Project Structure

```
DSCI_554_ARMS_SALES_PROJECT/
├── data/                                     # Directory containing all data files used for visualizations.
│   ├── processed/                            # Processed datasets ready for analysis, transformed for compatibility with the visualizations.
│   └── raw/                                  # Raw datasets, as obtained from sources, stored for reference or future processing.
├── public/                                   # Public assets accessible by the application.
│   └── index.html                            # Main HTML file for the application, which React injects content into.
├── src/                                      # Main source directory for all React components and styles.
│   ├── components/                           # Directory containing all React components for the visualizations and layout.
│   │   ├── layouts/                          # Layout components responsible for different types of visualizations.
│   │   │   ├── ForceDirectedGraph.js         # Force-directed graph showing connections between arms suppliers and recipients.
│   │   │   ├── LineChart.js                  # Line chart illustrating trends in arms trade over time.
│   │   │   ├── MigrationMap.js               # Map showing migration patterns and alliances within the arms trade network.
│   │   │   ├── ParallelCoordinatesChart.js   # Parallel coordinates chart for comparing arms trade metrics across regions.
│   │   │   ├── PieChart.js                   # Pie chart depicting arms imports distribution by region.
│   │   │   ├── Treemap.js                    # Treemap visualizing top arms companies by revenue, segmented by country.
│   │   │   └── ZoomableCirclePacking.js      # Circle packing chart for hierarchical data on weapon transfers by category.
│   │   └── maps/                             # Components specifically for map-based visualizations.
│   │       ├── ChoroplethMap.js              # Choropleth map showing arms imports by country with color-coding.
│   │       ├── DotMap.js                     # Dot map visualizing conflict locations with intensity indicators.
│   │       ├── ProportionalSymbolMap.js      # Map with symbols representing arms import volumes by region.
│   │       └── Dashboard.js                  # Main dashboard component that integrates all visualizations.
│   ├── index.css                             # Main CSS file for global styling, ensuring cohesive design across the dashboard.
│   └── index.js                              # Entry point for the React application, rendering the main dashboard.
├── .babelrc                                  # Babel configuration file for JavaScript transpilation.
├── package-lock.json                         # Automatically generated file that locks the dependencies' versions.
├── package.json                              # Configuration file listing project dependencies and scripts for building/running the app.
├── README.md                                 # Project README with instructions, descriptions, and setup details.
└── webpack.config.js                         # Webpack configuration for bundling JavaScript and other assets for the application.

```

## Installation

To set up and run the dashboard:

```bash
git clone https://github.com/nguyenlamvu88/dsci_554_arms_sales_project.git
cd dsci_554_arms_sales_project
npm install
npm start
```

Open the application in a browser at [http://localhost:3000](http://localhost:3000).

---

## Usage

### Interacting with the Dashboard

Each section offers visual insights into specific aspects of arms trade:
- **Sidebar Navigation** allows users to explore sections.
- **Interactive Elements** such as sliders, dropdowns, and tooltips enrich the data exploration experience.

### Customization

- **Component Customization**: Modify each visualization component by editing the respective `.js` file in `src/components/maps` or `src/components/layouts`.
- **Styling**: Use `index.css` to alter themes or adjust layout aspects.

## Data Sources

All data originates from [https://ucdp.uu.se/downloads/index.html#ged_global](https://ucdp.uu.se/downloads/index.html#ged_global), processed and hosted on GitHub for ease of access:

1. **Top Arms Exporters (1950 – 2023)**
   - Processed File: `processed_arms_suppliers.csv`
   - Data on major arms-exporting countries for long-term export and supplier trend analysis.

2. **Top Arms Importers (1950 – 2023)**
   - Processed File: `processed_arms_recipients.csv`
   - Details on leading arms-importing countries, tracking import trends and dependencies on suppliers.

3. **Military Expenditure by Region (1948 – 2023)**
   - Processed File: `processed_arms_expenditure_by_regions.csv`
   - Captures regional military spending over decades, allowing comparative and trend analyses.

4. **Top 100 Arms Companies Revenue (2002 – 2022)**
   - Processed File: `processed_top_100_arms_companies_consolidated.csv`
   - Revenue data for top arms companies, ideal for analyzing industry performance.

5. **Arms Transfer by Weapon Types**
   - Processed File: `processed_arms_transfer_by_weapon_types.csv`
   - Lists arms suppliers, recipients, and specific types of transfers.

6. **Global Total Arms Revenue (2002 – 2022)**
   - Processed File: `processed_global_total_arms_revenue.csv`
   - Reflects total global revenue from arms sales, offering insights into spending patterns.

7. **Arms Sales by Regions (1950 – 2023)**
   - Processed File: `processed_regional_transfers.csv`
   - Represents arms transfers between regions, visualizing trade flows and regional dependencies.

8. **Armed Conflicts by Country (1949 – 2023)**
   - Processed File: `processed_conflicts_locations_years.csv`
   - Contains conflict start/end dates and involved parties, enabling conflict frequency and duration analyses.

9. **Recipients of U.S., Russian, and Chinese Arms (1950 – 2023)**
   - Processed Files:
     - `processed_recipients_of_us_arms_hierarchical.json`
     - `processed_recipients_of_russia_arms_hierarchical.json`
     - `processed_recipients_of_china_arms_hierarchical.json`
   - Shows arms trade recipients for the U.S., Russia, and China, illustrating global trade networks.

10. **Weapon Transfer by Category (US, China, and Russia)**
    - Processed File: `processed_weapon_transfer_by_category.json`
    - Hierarchical data by category, detailing weapon types transferred.

---

## Features and Components

### Key Visualizations

- **Dot Map**: Displays conflict locations by year, using clustered bubbles to denote intensity.
- **Choropleth Map**: Shows arms import quantities by country, with interactive tooltips and modals for deeper insights.
- **Proportional Symbol Map**: Represents regional arms imports with circles sized by value, complemented by a dynamic mini bar chart.
- **Migration Map**: Visualizes global arms trade migration and alliances.
- **Force-Directed Graph**: Illustrates network connections between arms exporters and recipients.
- **Zoomable Circle Packing**: Depicts hierarchical data on weapons transfers, organized by category.
- **Parallel Coordinates Chart**: Allows multi-region arms trade metric comparison.
- **Line Chart**: Presents arms trade trends over time.
- **Treemap and Pie Chart**: Visualize arms imports by category.

### Thematic Narrative Sections

The dashboard's narrative structure allows exploration of global arms trade themes:

1. **Introduction**: Strategic overview of arms trade.
2. **Strength in Alliance & Partnership**: Examines alliances reinforced by arms trade.
3. **Competition in Strategic Regions**: Analyzes regional rivalries and arms trade influence.
4. **Countering Through Proxy Support**: Investigates proxy relationships supported through arms trade.
5. **Preparing Allies for Emerging Threats**: Focuses on arming allies for future security.
6. **Profiting from Tensions**: Discusses economic motivations driving arms sales.
7. **Conclusion**: Summarizes implications of the global arms trade.

## Design Choices, Functionality, Style, and Layout

### Design Choices

- **Narrative Structure**: Divided into thematic sections, guiding users through complex arms trade topics.
- **Color-Coded Visuals**: Consistent color schemes distinguish data points such as exporters and regional import levels.
- **Hierarchical and Network Representations**: Visualizations like Zoomable Circle Packing and the Force-Directed Graph highlight the layered and networked nature of arms trade data.

### Functionality

- **Interactive Filters**: Users can filter data by year, country, and trade type for targeted insights.
- **Tooltips and Hover Effects**: Tooltips provide context and data without cluttering the interface.
- **Zoom and Pan**: Enables in-depth exploration of data-rich visualizations.

### Style and Layout

- **Professional Color Palette**: A clean, professional color scheme enhances readability and user engagement.
- **Responsive Design**: Adjusts seamlessly across screen sizes, ensuring optimal desktop and mobile experiences.
- **Organized Layout**: Sidebar navigation and a structured layout maximize screen space for visualizations.

---

## License

This project is licensed under the MIT License.
