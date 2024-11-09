
# Global Arms Trade Dashboard

## Overview

The Global Arms Trade Dashboard is a React-based, interactive web application offering an in-depth exploration of how the U.S. leverages arms trade and transfers to promote stability or further its interests. Emphasizing patterns, geopolitical dynamics, and strategic alliances, it utilizes D3.js and various visual components to present a narrative-driven analysis of arms transfers, alliances, and regional influences. 

The dashboad **web application** is live and can be accessed [here](https://nguyenlamvu88.github.io/dsci_554_arms_sales_project/).

## Project Structure

```
dsci_554_arms_sales_project/
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

## Data Sources

Data originates from [SIPRI](https://www.sipri.org/databases/armstransfers) and [UCDP/PRIO Armed Conflict Database](https://ucdp.uu.se/downloads/index.html#ged_global), processed and hosted on GitHub:

<small>

| **Dataset**                                | **Raw File(s)**                                | **Processed File**                               | **Description**                                                                                          |
|--------------------------------------------|------------------------------------------------|--------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| **Top Arms Exporters (1950–2023)**         | `suppliers_1950-2023.csv`                      | `processed_arms_suppliers.csv`                   | Major arms exporters over time, for export trend analysis.                                               |
| **Top Arms Importers (1950–2023)**         | `recipients_1950-2023.csv`                     | `processed_arms_recipients.csv`                  | Leading importers, showing trends and supplier dependencies.                                             |
| **Military Expenditure by Region**         | `SIPRI-Milex-data-1948-2023.xls`               | `processed_arms_expenditure_by_regions.csv`      | Regional spending data (1948–2023), enabling comparative analysis.                                       |
| **Top 100 Arms Companies Revenue**         | `SIPRI-Top-100-2002-2022.xls`                  | `processed_top_100_arms_companies_consolidated.csv` | Revenue trends of top arms companies.                           |
| **Arms Transfer by Weapon Types**          | `trade-register.csv`                           | `processed_arms_transfer_by_weapon_types.csv`    | Details on suppliers, recipients, and types of arms transfers.                                           |
| **Global Total Arms Revenue**              | `Total-arms-revenue-SIPRI-Top-100-2002-2022.xls`| `processed_global_total_arms_revenue.csv`       | Global arms sales revenue trends.                                                                       |
| **Arms Sales by Regions (1950–2023)**      | `regional_transfers_1950-2023.csv`             | `processed_regional_transfers.csv`               | Visualizes regional trade flows and dependencies.                                                        |
| **Armed Conflicts by Country**             | `UcdpPrioConflict_v24_1.csv`                   | `processed_conflicts_locations_years.csv`        | Conflict timelines and involved parties (1949–2023).                                                     |
| **Recipients of U.S., Russian, Chinese Arms** | `us_import-export-values.csv`, `russia_import-export-values.csv`, `china_import-export-values.csv` | `processed_recipients_of_us_arms_hierarchical.json`, etc. | Shows U.S., Russian, and Chinese trade recipients.                  |
| **Weapon Transfer by Category**            | `us_export_by_category.csv`, etc.              | `processed_weapon_transfer_by_category.json`     | Hierarchical categories of weapon transfers by major suppliers.                                         |

</small>

---

## Features and Components

### Key Visualizations

- **Dot Map**: Shows conflict hotspots by marking the locations of armed conflicts by year, using clustered dots, color, and size to denote intensity.
- **Choropleth Map**: Displays arms import quantities by country using the size and color of bubbles, with interactive tooltips and modals providing additional details on suppliers, weapon types, quantities, and years.
- **Proportional Symbol Map**: Represents regional arms imports with circles sized according to import value, complemented by a dynamic mini bar chart for quick reference and comparison.
- **Migration Map**: Visualizes global arms trade flows from major suppliers (United States, Russia, and China) to recipient countries, with color-coded lines representing each origin country. Line thickness indicates trade volume, and colored circles highlight the importance of recipient countries.
- **Force-Directed Graph**: Illustrates network connections between arms exporters and recipients to identify the centers of gravity and linkages.
- **Zoomable Circle Packing**: Depicts hierarchical data on weapons transfers, organized by category and year.
- **Parallel Coordinates Chart**: Highlights the top recipients of arms from the US, China, and Russia, allowing users to identify key countries of interest and observe trade patterns over time.
- **Line Chart**: Displays arms trade trends over time for selected countries, allowing users to track export and import values and compare fluctuations across different nations. The interactive slider enables users to adjust the timeframe by moving both ends to focus on specific periods.
- **Treemap**: Visualizes the top 20 arms companies by revenue for a selected year. Each rectangle represents a company, with the area proportional to its revenue share. The color indicates the company's country.
- **Pie Chart**: Displays the distribution of arms trade by region for a selected year. Each slice represents a region’s percentage of total arms imports, with color coding for easy differentiation.

### Thematic Narrative Sections

The dashboard's narrative structure allows exploration of global arms trade themes:

1. **Introduction**: Provides a strategic overview of how arms trade is used as a tool for diplomacy and influence.
2. **Strength in Alliance & Partnership**:  Highlights how superpowers like the U.S., Russia, and China reinforce alliances through targeted arms exports.
3. **Competition in Strategic Regions**: Examines the multipolar rivalry in regions where arms trade impacts stability and shifts in power dynamics.
4. **Countering Through Proxy Support**: Analyzes how countries use arms transfers to support proxy forces and maintain influence without direct involvement.
5. **Preparing Allies for Emerging Threats**: Details how arms transfers bolster allies’ defenses, reducing reliance on direct intervention by superpowers.
6. **Profiting from Tensions**: Explores the economic benefits of arms trade, especially during geopolitical conflicts, as defense industries expand influence and profit.
7. **Conclusion**:  Reflects on the strategic implications of global arms trade, focusing on the balance of power and its role in shaping international order.

## Design Choices, Functionality, Style, and Layout

### Design Choices

- **Narrative Structure with Thematic Sections**: Organizing the dashboard into thematic sections aligns with principles from **Gestalt theory** and **semiology**, allowing users to process complex information in a structured, intuitive way. This structure enhances the overall message by making **relationships and categories** within the data clearer. *(Lecture 9, Lecture 10)*

- **Color-Coded Visuals**: Consistent **color schemes** are used across maps and charts to visually distinguish data points, aiding in quick identification and comparison. This approach leverages **pre-attentive processing** and **selective attentional tuning** to help users instantly recognize categories, such as **arms exporters** or **import levels**, improving clarity and reducing **cognitive load**. *(Lecture 9, Lecture 10)*

- **Depth and Hierarchical Elements**: Including depth through visual elements like the **Zoomable Circle Packing** and **Force-Directed Graph** emphasizes **hierarchical relationships** in the data. This approach, inspired by **depth perception cues** and **3D design principles** from the lectures, conveys the **layered complexity** within the global arms trade network, making the information more engaging. *(Lecture 9)*

- **Interactive Visualizations**: Interactive elements such as **sliders** and **hover-over tooltips** align with principles of **user engagement** and **cognitive accessibility**. These interactive maps and charts encourage **exploration**, while **selective attention** aids users in focusing on relevant data layers, giving control over the **complexity** of information presented. *(Lecture 10)*

### Functionality

- **Interactive Filters**: The `MigrationMap.js`, `ChoroplethMap.js`, and `ProportionalSymbolMap.js` components integrate **filters by year, country, and trade type**, allowing users to **drill down** into specific datasets for focused analysis. These filters enhance user control and interactivity, facilitating **custom views of the data**.  
  *(Lecture 7: Interactive Visualizations)*

- **Tooltips and Hover Effects**: Across components like `ForceDirectedGraph.js`, `LineChart.js`, and `ParallelCoordinatesChart.js`, **tooltips** display detailed information upon hovering, including **trade volumes, recipient countries, and year-specific details**. This functionality, enabled by D3.js event listeners, reduces clutter while **providing contextual data** on demand.  
  *(Lecture 7: Pre-attentive Features & Interactive Elements)*

- **Zoom and Pan**: The `ZoomableCirclePacking.js` and `ProportionalSymbolMap.js` components incorporate **zoom and pan features**, allowing users to **explore data hierarchies and map details** closely. This feature is essential for **examining dense data and layered networks**, giving users **control over data exploration** depth.  
  *(Lecture 9: Depth Perception & 3D Design)*
  
### Style and Layout

- **Professional Color Palette**: Components like `ChoroplethMap.js` and `Treemap.js` use a **consistent, high-contrast color scheme** to visually distinguish **exporters, importers, and trade quantities**. This improves readability and **emphasizes key data points** across the dashboard.  
  *(Lecture 8: Color Theory and Pre-attentive Color Selection)*

- **Responsive Design**: Using **CSS flexbox and grid layouts** in `index.css` along with **responsive D3.js scaling**, the dashboard adjusts seamlessly across screen sizes, making it **desktop- and mobile-friendly** for varied user experiences.  
  *(Lecture 5: Responsive Design for Dashboards)*

- **Organized Layout**: The layout, structured with a **sidebar for navigation** and full-width sections for each visualization (found in `Dashboard.js`), provides a **structured flow** and **maximizes screen space**, allowing immersive data exploration.  
  *(Lecture 10: Gestalt Principles and Organized Layouts)*
  
## Interacting with the Dashboard

- **Sidebar Navigation**: The **thematic structure** within `Dashboard.js` includes a sidebar, encouraging users to navigate between sections, thereby guiding them through **narratives of global arms trade**.  
  *(Lecture 10: Narrative Flow and Structured Layouts)*

- **Interactive Elements**: The `PieChart.js`, `Treemap.js`, and `DotMap.js` components feature **sliders, dropdowns, and interactive legends**. These controls **enable real-time customization**, allowing users to find specific insights **without reloading or re-navigating**.  
  *(Lecture 7: Interactive Visualizations and User Engagement)*

### Customization

- **Component Customization**: Each component in `src/components/maps` and `src/components/layouts` is **modular and easily modifiable**. Encapsulated logic within files like `ChoroplethMap.js` and `LineChart.js` allows for **tailoring of datasets or visualization styles** based on project needs.  
  *(Lecture 5: Modular Component Design for Dashboards)*

- **Styling**: All styles are centralized in `index.css`, with **component-specific styles scoped** within each file, allowing for **simple theme adjustments**. This setup facilitates easy changes to **colors, fonts, or layout details** while maintaining functionality.  
  *(Lecture 8: Styling and Consistent Visual Themes)*

These design choices and interactive elements integrate **core principles** from data visualization best practices, ensuring the dashboard is **intuitive, engaging, and visually cohesive** across all sections.

---

## License

This project is licensed under the MIT License.
