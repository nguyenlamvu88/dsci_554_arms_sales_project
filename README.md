
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
│   │       ├── DefenseExpenditure.js         # Choropleth map showing defense expenditure by country by year.
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

Data originates from [SIPRI](https://www.sipri.org/databases/armstransfers), [UCDP/PRIO Armed Conflict Database](https://ucdp.uu.se/downloads/index.html#ged_global), and the [World Bank](https://data.worldbank.org/indicator/MS.MIL.XPND.CD?end=2022&start=2022&view=map), processed with ChatGPT assistance and hosted on GitHub:

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
| **Defense Expenditure by Country Over Years** | `API_MS.MIL.XPND.CD_DS2_en_csv_v2_11551.csv`   | `processed_defense_expenditure_by_country.csv`   | Defense spending by country, allowing temporal and regional analysis of expenditure trends.             |

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
  
## Style and Layout

- **Professional Color Palette**: Components like `ChoroplethMap.js` and `Treemap.js` use a **high-contrast color scheme** to visually distinguish **exporters, importers, and trade quantities**. This approach, based on color theory, enhances readability and emphasizes key metrics across the dashboard.  
  *(Lecture 8: Color, Complex Charts & Colors in D3)*

- **Responsive Design with Flexible Layouts**: The dashboard leverages **CSS flexbox and grid layouts** in `index.css` with responsive D3.js scaling. This combination ensures seamless resizing for both desktop and mobile views, providing an optimized user experience.  
  *(Lecture 5: Dashboards & Infographics Design)*

- **Structured and Organized Flow**: A sidebar for **navigation** and full-width sections for visualizations (found in `Dashboard.js`) create a logical flow. Each visualization is spaced to maximize screen area, allowing immersive data interaction and smoother navigation.  
  *(Lecture 3: Visualization Techniques, Web Technologies)*

- **Integrated Line Chart and Choropleth Map**: A **line chart within the map container** shows temporal trends, providing a connected view of defense expenditure changes over time with geospatial data.  
  *(Lecture 9: Depth Perception and 3D Design, Maps)*

- **Stacked Map and Transition Controls**: A **stacked layout** combines interactive maps with transition buttons for toggling between years. This helps users explore temporal changes intuitively, enhancing engagement without cluttering the display.  
  *(Lecture 10: Patterns, Gestalt, and Semiology)*

- **Static Legend with Persistent Positioning**: To ensure consistent data interpretation, the **legend remains fixed** and is unaffected by zooming and panning, providing a stable reference for value scales.  
  *(Lecture 4: Design Space, Graphing in the Browser, D3)*  
  
## Interacting with the Dashboard

- **Sidebar Navigation**: The **thematic structure** implemented in `Dashboard.js` provides users with a sidebar for seamless navigation across various sections, facilitating a guided exploration of **global arms trade narratives**.  
  *(Lecture 10: Narrative Flow and Structured Layouts)*

- **Interactive Elements**: Components like `PieChart.js`, `Treemap.js`, and `DotMap.js` are equipped with **sliders, dropdowns, and interactive legends**. These elements enable **real-time customization** without requiring page reloads, allowing users to refine data views to gain specific insights.  
  *(Lecture 7: Interactive Visualizations and User Engagement)*

- **Tooltip and Hover Effects**: Tooltips across components such as `ChoroplethMap.js` and `ProportionalSymbolMap.js` provide contextual details on hover, giving users access to supplementary data without cluttering the interface. This supports a clear visual hierarchy and efficient data comprehension.  
  *(Lecture 7: Pre-Attentive Features and Visual Queries)*

- **Zoom and Pan Features**: The `MapBox.js` and `TopoJSON.js` components incorporate pan and zoom, enabling an in-depth examination of geographic data. This functionality is essential for analyzing complex trade data spread over different regions.  
  *(Lecture 9: Depth Perception and 3D Design in Maps)*

### Customization

- **Component Modularity**: Each component under `src/components/maps` and `src/components/layouts` is designed for **easy modification**. The encapsulated structure within files like `ChordDiagram.js` and `LineChart.js` allows for **tailored adjustments to datasets and visualization styles** to align with evolving project requirements.  
  *(Lecture 5: Modular Component Design for Dashboards)*

- **Styling**: The centralized `index.css` file, along with scoped styles within each component, enables **efficient theme alterations** across the dashboard. Adjustments to colors, fonts, and layout can be made seamlessly to maintain a cohesive aesthetic.  
  *(Lecture 8: Styling and Consistent Visual Themes)*

These interactive features and customization options reflect best practices in data visualization, ensuring the dashboard is user-friendly, visually appealing, and adaptable to different analysis needs.

---

## License

This project is licensed under the MIT License.

---

#### AI Assistance
[AI Assistance 1 – Data Wrangling and Processing]( https://chatgpt.com/c/6726a05f-a0d8-8001-8afc-98eeab6d623c)
We processed and organized several datasets on arms trade, military expenditure, and conflicts to be analytics-ready and visualization-friendly:
•	Top Arms Exporters and Importers (1950-2023): Showcasing major arms suppliers and recipients over time.
•	Military Expenditure by Region (1948-2023): Analyzing regional spending trends and comparisons.
•	Top 100 Arms Companies Revenue (2002-2022): Consolidated for industry revenue analysis.
•	Global Total Arms Revenue (2002-2022): Highlighting trends in the global arms industry.
•	Arms Sales by Regions (1950-2023): Structured to explore regional arms transfer patterns.
•	Armed Conflicts by Country (1949-2023): Focused on conflict duration, location, and participants for global trend analysis.

[AI Assistance 2 – Dot Map]( https://chatgpt.com/c/6726cfe4-788c-8001-aca0-c59b364e7bf0)
we worked on enhancing a D3-based interactive Dot Map that visualizes conflict locations and intensities by year. We refined the legend by adjusting the positioning of circles and labels to improve readability, defined specific intensity values for "Low," "Medium," and "High" levels, and ensured that the labels aligned properly with the circles. Additionally, we added a map title at the top, customized map colors and background, and implemented a tooltip to display detailed information on hover. Finally, we integrated a year slider for dynamic filtering, allowing users to view conflict data by specific years.

[AI Assistance 3 – Tree Map](https://chatgpt.com/c/6726f5c9-d53c-8001-a649-4d0881e9f2ce)
We discussed modifying a React D3 Tree Map component, focusing on enhancements like filtering data for the top 20 companies, adding a year-selection slider, adjusting hover opacity, wrapping text inside each box, and positioning the legend. Additionally, we reviewed how to format total revenue in billions within the legend, converting it from millions by dividing by 1 billion. These adjustments aimed to improve the component's interactivity, visual clarity, and data display accuracy.

[AI Assistance 4 – Multiline Chart]( https://chatgpt.com/c/6727025d-28c4-8001-b1c9-0bdb9799e205)
We worked on building a Multiline Chart and enhanced the D3.js LineChart component by converting Y-axis values to billions and formatting the ticks accordingly. We added a title and Y-axis label, implemented a tooltip for data points, and fixed syntax errors in the JSX. Additionally, we enabled country selection with checkboxes and created a legend to display corresponding colors, ensuring a responsive and user-friendly design.

[AI Assistance 5 – Proportional Symbol Map and Pie Chart]( https://chatgpt.com/c/6728d70e-e590-8001-8191-7b6fc6348b65)
We focused on building data visualization components, specifically the Proportional Symbol Map and Pie Chart. We improved the Proportional Symbol Map by adding a year slider for dynamic updates and enhanced tooltip functionality to display detailed arms trade information. We also ensured that both the "World total" and "International organizations" data are filtered out dynamically. For the Pie Chart, we increased its size, added tooltip functionality that enlarges slices on hover, and filtered out "International organizations" data. Additionally, we updated the Dashboard.js file to ensure the Pie Chart only displays after selecting it from the Proportional Symbol Map layout options. Lastly, we discussed methods to give the Pie Chart a 3D appearance for better visual aesthetics.

[AI Assistance 6 – Arms Trade Directional Map]( https://chatgpt.com/c/6728fbb0-20c0-8001-87bc-a935806db5fc)
We built an arms trade directional map by integrating hierarchical JSON data, setting up a GeoJSON map, and calculating country centroids for accurate trade routes. We added interactive, color-coded lines for imports and exports, with tooltip information, scaling line thickness by trade volume for readability. Finally, we enhanced visibility by adjusting color opacity and filtering, ensuring a clear, informative visualization.

[AI Assistance 7 – Arms Proliferation Map, Parallel Coordinates Chart, Force-Directed Graph]( https://chatgpt.com/c/6729689d-8e0c-8001-9407-505ebe3839da)
We built and refined several D3.js visualizations, including a migration map, parallel coordinates chart, force-directed graph, and chord diagram, all using trade data for the U.S., China, and Russia. We added dynamic filtering, year-based selection, and interactive elements like tooltips and color coding (blue for U.S., brown for Russia, green for China) to enhance usability. Each visualization was tailored to highlight top recipients and facilitate clear data interpretation.

[AI Assistance 8 – Choropleth Map for suppliers and weapon types]( https://chatgpt.com/c/67298d2a-8e18-8001-a06e-e6299432480f)
We created an interactive Choropleth Map to visualize global arms transfers by country, weapon type, and year. Key features include a dropdown for selecting weapon types, a year slider, and dynamic country color and size based on arms export quantities. Tooltips display details on hover, providing a comprehensive view of arms trade patterns.

[AI Assistance 9 – Zoomable Circle Packing for Weapon Transfer by Category]( https://chatgpt.com/c/672aa4c5-ec74-8001-a95d-14cfaa125f68)
we built and customized a D3.js Zoomable Circle Packing visualization to dynamically display weapon transfer data by category and year. We improved readability by scaling circle labels, increasing bubble sizes, and refining the color scheme. We resolved background color issues, positioned the tooltip to follow the mouse, and enhanced the overall styling for a cleaner, interactive user.

[AI Assistance 10 – Storyboard Framework]( https://chatgpt.com/c/672d253a-250c-8001-901e-8c4d8d47f2d0)
we built a framework for the storyboard refined the CSS styling for consistent display and centered positioning of maps within the main content area. We enhanced a D3.js migration map to show trade data from the U.S., Russia, and China, using distinct colors for each country's trade lines and highlighting top recipients with purple dots. The legend was improved with better spacing and omitting "All" for clarity. We also integrated tooltips displaying detailed trade data on hover and added controls for selecting the year and origin country. Additionally, we expanded the narrative, emphasizing how the U.S. counters Chinese and Russian influence by building defense networks and strengthening alliances with key recipient countries.

[AI Assistance 11 – Global Arms Trade Network for the Storyboard]( https://chatgpt.com/c/672d253a-250c-8001-901e-8c4d8d47f2d0)
We modified the narrative for the Global Arms Trade Network in the Forced Diagram, where the United States (blue), Russia (red), and China (yellow) use arms exports to expand influence and form alliances in key regions. The U.S. supports allies in Europe, the Middle East, and Asia-Pacific, while Russia focuses on Eastern Europe and Central Asia, and China strengthens ties in Southeast Asia, Africa, and South Asia. We highlighted India as an example of a multilateral partner by underlining it, as it balances relationships with the U.S., Russia, and other powers. Styling was applied directly in JSX: colors for each country, italics for regions, and underlining for India, resulting in a visually cohesive and strategic narrative that aligns with the diagram's geopolitical themes.

[AI Assistance 12 – Storyboard and Narrative Improvement]( https://chatgpt.com/c/672f8c38-f3a0-8001-ae12-cfdb9451df7d)
We refined a data visualization dashboard on the global arms trade by adjusting colors and layout for improved clarity and visual hierarchy. Key updates include moving the Pie Chart to Preparing Allies for Emerging Threats and the Zoomable Circle Packing to Countering Through Proxy Support. Additionally, we added a toggle button in Countering Through Proxy Support to switch between the Parallel Coordinates Chart and the Zoomable Circle Packing, with dynamic labels reflecting the selected view. These changes streamline user interaction and enhance the presentation of strategic alliances and trends in arms trade.

[AI Assistance 13 – README Creation](https://chatgpt.com/c/672fd8a5-555c-8001-9f05-b79c0ace787f))
We collaborated to refine the GitHub README for a Global Arms Trade Dashboard, focusing on clarity, functionality, and alignment with your DSCI 554 course. We organized data sources from SIPRI and UCDP/PRIO efficiently and developed a Design Choices section to highlight narrative structure, color-coded visuals, depth, and interactivity, drawing on principles like Gestalt theory and cognitive load reduction from your lectures. We detailed functionality for key interactive elements (sidebar navigation, tooltips, zoom/pan) and customization options, with references to the React components (.js files) that implement these features. The final document in GitHub Markdown provides a cohesive, professional summary of the dashboard’s capabilities and design rationale.

[AI Assistance 13]( https://chatgpt.com/c/6730dcbe-841c-8001-8926-9a0fa9dd81e0) & [AI Assistance 14]( https://chatgpt.com/c/6730ff0b-3c10-8001-9954-957a31078481)
We worked on building Choropleth Map and Line Chart for the defense expenditure by country by year components using React, D3, and TopoJSON to display global defense expenditure data. The component features a choropleth map to show defense expenditure by country for a selected year, synchronized with a line chart showing historical expenditure trends for the United States, China, and Russia. We ensured compatibility of country names between the dataset and the map, applied a logarithmic color scale for better visual contrast, and added tooltips for detailed information on hover. Additionally, we positioned a legend for both the map and line chart, synchronized the line chart with the map’s year slider, and included highlighted points on the line chart to mark the selected year. Finally, we placed the line chart in the bottom right corner of the map for an integrated, responsive layout.

