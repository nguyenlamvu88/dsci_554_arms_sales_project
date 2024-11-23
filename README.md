# Arming for Stability: U.S. Strategy Through Global Arms Trade

## Table of Contents

- [Project Overview](#project-overview)
- [Project Information](#project-information)
  - [Group Name](#group-name)
  - [Team Members](#team-members)
  - [Artifacts](#artifacts)
- [Project Structure](#project-structure)
- [Data Sources](#data-sources)
- [Installation](#installation)
- [Design Choices](#design-choices)
  - [Technology Stack](#technology-stack)
  - [Visualization Libraries](#visualization-libraries)
  - [Design Principles](#design-principles)
  - [Design Methodology](#design-methodology)
- [UX & UI Design](#ux--ui-design)
- [Features and Components](#features-and-components)
  - [Key Visualizations](#key-visualizations)
  - [Thematic Narrative Sections](#thematic-narrative-sections)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Contact](#contact)
- [FAQs](#faqs)
- [AI Assistance](#ai-assistance)
- [References](#references)

---

## Project Overview

**Arming for Stability: U.S. Strategy Through Global Arms Trade** is a comprehensive React-based application that visualizes the complexities of global arms trade and its geopolitical implications. By integrating cutting-edge libraries like D3.js, Three.js, and @deck.gl, the project provides an interactive and visually compelling exploration of how arms exports shape alliances, counter rivals, and influence geopolitics.

### Relevance in Current Context

- **Russia-Ukraine Conflict:** U.S. military aid to Ukraine highlights the strategic use of arms trade in countering adversaries.
- **Taiwan Defense Strategy:** U.S. arms exports to Taiwan underscore efforts to balance power in the Asia-Pacific.
- **NATO Expansion:** Increased arms transfers to Eastern Europe signal U.S. efforts to strengthen alliances.

This project connects data to real-world geopolitical shifts, offering a dynamic way to explore these themes.

---

## Project Information

### Group Name

**TEAM SMURF**

### Team Members

- **Member 1** - [vulnguye@usc.edu](mailto:vulnguye@usc.edu)
- **Member 2** - [kwparker@usc.edu](mailto:kwparker@usc.edu)
- **Member 3** - [dlee8267@usc.edu](mailto:dlee8267@usc.edu)

### Artifacts

- **Demonstration URL:** [Insert Link Here](#)
- **Presentation URL:** [Insert Link Here](#)
- **Paper PDF and Paper Overleaf URL:** [Insert Links Here](#)
- **YouTube Video Link:** [Insert Link Here](#)

---

## Project Structure

```plaintext
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

## Design Choices

Selecting the right technology stack is crucial for building a scalable, maintainable, and high-performance application. The chosen technologies for this project are based on their robustness, community support, and compatibility with the project's requirements.

### Technology Stack

- **React:**
  - **Reason for Choice:** React's component-based architecture allows for building reusable UI components, enhancing maintainability and scalability. Its virtual DOM ensures efficient rendering, which is essential for interactive and dynamic visualizations. *(See Lecture 3: Visualization Techniques, Web Technologies; Lecture 4: Graphing in the Browser, D3)*
  
- **Webpack:**
  - **Reason for Choice:** Webpack is a powerful module bundler that efficiently manages and bundles assets, ensuring optimized load times and performance. Its extensive plugin ecosystem allows for customizing the build process to suit project-specific needs. *(Aligned with Lecture 5: Use frameworks with large community support to ensure scalability and efficient debugging)*
  
- **Babel:**
  - **Reason for Choice:** Babel transpiles modern JavaScript and JSX, ensuring compatibility across various browsers. It allows developers to use the latest language features without worrying about browser support.

### Visualization Libraries

- **D3.js:**
  - **Reason for Choice:** D3.js is renowned for its versatility in creating dynamic and interactive data visualizations. Its powerful data-driven approach allows for detailed and customized charting solutions, making it ideal for representing complex arms trade data. *(See Lecture 4: Graphing in the Browser, D3; Lecture 7: Interactive Visualizations)*
  
- **Three.js:**
  - **Reason for Choice:** Three.js enables the rendering of sophisticated 3D graphics within the browser. It's leveraged for immersive animations, such as the jet fleet visualization, providing a more engaging user experience. *(See Lecture 11: 3D Data Visualization; Lecture 9: Depth Perception and 3D Design)*
  
- **@deck.gl:**
  - **Reason for Choice:** @deck.gl is a WebGL-powered framework for visual exploratory data analysis of large datasets. It's used for advanced geospatial visualizations, enhancing the depth and interactivity of maps and spatial data representations. *(See Lecture 8: Maps and Choropleths)*
  
- **Mermaid.js:**
  - **Reason for Choice:** Mermaid.js facilitates the creation of dynamic and interactive workflow diagrams, enhancing the project's documentation and visualization aspects by allowing the generation of diagrams from text definitions, facilitating easier updates and maintenance.

### Design Principles

- **Clarity and Simplicity:** Ensuring that visualizations are easy to understand, avoiding unnecessary complexity while effectively conveying the intended message. *(See Lecture 10: Gestalt and Semiology)*
  
- **Interactivity:** Providing users with interactive elements such as tooltips, sliders, and clickable regions to explore data dynamically. *(See Lecture 7: Interactive Visualizations)*
  
- **Accessibility:** Designing with accessibility in mind, including ARIA labels, keyboard navigation, and sufficient color contrast to support all users. *(See Lecture 6: The Eye and the Visual Brain)*
  
- **Responsiveness:** Creating a layout that adapts seamlessly to various screen sizes and devices, ensuring a consistent user experience.
  
- **Performance:** Optimizing rendering and data processing to maintain smooth interactions and quick load times, even with large datasets. *(See Lectures 3: Visualization Techniques, Web Technologies; 5: Loading Data with D3)*
  
- **Maintainability:** Building a modular and well-documented codebase to facilitate easy updates and scalability.

### Design Methodology

The project follows an iterative and user-centered design approach, ensuring that each aspect of the application aligns with user needs and project goals. The integration of interactivity, functionality, style and layouts, typography, and responsive design are meticulously crafted to support this methodology.

#### Steps Involved:

- **Research and Data Collection:**
  - **Objective:** Gather comprehensive data on global arms trade, focusing on key players, historical events, and geopolitical shifts.
  - **Method:** Utilize reputable sources such as SIPRI datasets, government reports, and academic studies to ensure data accuracy and reliability.
  
- **Wireframing and Prototyping:**
  - **Objective:** Create initial layouts and prototypes to establish the structure and flow of information.
  - **Method:** Develop low-fidelity wireframes to outline the placement of visualizations and textual content, followed by high-fidelity prototypes incorporating design elements and interactivity.
  
- **Component Development:**
  - **Objective:** Build reusable React components for different sections and visualizations.
  - **Method:** Employ a modular approach, creating components like charts, maps, and animations that can be easily maintained and scaled.
  
- **Visualization Implementation:**
  - **Objective:** Integrate D3.js, Three.js, and @deck.gl to create interactive and dynamic charts that align with the project's narrative. *(Inspired by Lecture 5: Loading Data with D3)*
  
- **Interactivity and Functionality Integration:**
  - **Objective:** Enhance user engagement through interactive elements and seamless functionality.
  - **Method:** Implement features like year selection buttons, tooltips, hover effects, and dynamic animations to allow users to explore data insights deeply. *(See Lecture 7: Interactive Visualizations)*
  
- **Style and Layout Refinement:**
  - **Objective:** Ensure that the application's aesthetic elements support usability and readability.
  - **Method:** Apply consistent color schemes, typography, and responsive design principles to create a cohesive and accessible user interface. *(See Lectures 6: The Eye and the Visual Brain; 8: Color and Complex Charts)*
  
- **User Testing and Feedback:**
  - **Objective:** Validate design decisions and functionality through real user interactions.
  - **Method:** Conduct usability testing sessions, gather feedback, and iterate on designs to address any usability issues or enhance user experience.
  
- **Optimization and Deployment:**
  - **Objective:** Fine-tune performance, ensure accessibility standards are met, and deploy the application for public access.
  - **Method:** Optimize asset loading, implement caching strategies, and deploy using platforms like Netlify or Vercel for efficient delivery.

#### Supporting Elements:

- **Interactivity:** Enhances user engagement by allowing dynamic exploration of data.
- **Functionality:** Provides essential features that facilitate data analysis and comprehension.
- **Style and Layout:** Ensures that visual and structural elements are aligned with usability and aesthetic standards.
- **Typography:** Improves readability and emphasizes key information through thoughtful font choices.
- **Responsive Design:** Guarantees that the application is accessible and functional across a wide range of devices and screen sizes.

By ensuring that each of these elements supports the overarching design methodology, the application delivers a seamless and insightful user experience, effectively communicating the complexities of global arms trade and geopolitical strategies.

## UX & UI Design

Upon launching the application, you will be greeted with an interactive interface featuring a fixed header and a sidebar for navigation. Here's how to navigate and utilize the application:

### Sidebar Navigation

- **Sections:** The sidebar lists different sections of the project, such as Introduction, Strength in Alliance & Partnership, Competition in Strategic Regions, etc.
- **Navigation:** Click on any section to navigate to it. The main content area will update accordingly.

### Exploring Visualizations

- **Interactive Controls:** Use buttons and sliders within each section to interact with the visualizations, such as selecting different years or categories.
- **Hover Effects:** Hover over elements within the charts and maps to view detailed tooltips and information.
- **Animations:** Engage with dynamic animations to visualize arms trade flows and conflict distributions.
- **Workflow Diagrams:** View and understand the application's data processing and component interaction workflows through Mermaid.js diagrams.

### Responsive Design

- **Adaptability:** The application is optimized for various screen sizes. Resize your browser or access the application on different devices to experience the responsive layout. *(See Lecture 3: Visualization Techniques, Web Technologies)*

### Accessibility Features

- **Keyboard Navigation:** Navigate the application using keyboard inputs.
- **Screen Readers:** The content is accessible to screen readers due to proper ARIA labels and semantic HTML elements.
- **Color Scheme:** The application of a color palette is rooted in Lecture 8 (Color Theory), ensuring appropriate use of hues and contrasts for interpretability.
- **Typography:** Guidelines from Lecture 6 informed font selection to enhance readability and maintain consistency across visual elements. *(See Lecture 2: Statistical Graphics; Lecture 6: Pre-attentive Features)*

**Expanded Insights:**

- **Lecture 2:** Emphasis on statistical graphics informs the project's focus on user-friendly visualizations.
- **Lecture 6:** Exploration of pre-attentive features shaped the choice of colors and layouts to effectively draw users' attention.

---

## Features and Components

### Key Visualizations

Each visualization reflects best practices from Lectures 7 and 8:

- **Dot Map:** Shows conflict hotspots by marking the locations of armed conflicts by year, using clustered dots, color, and size to denote intensity. *(Highlights conflict intensity, leveraging pre-attentive features like size and color.)*

- **Choropleth Map:** Displays arms import quantities by country using the size and color of bubbles, with interactive tooltips and modals providing additional details on suppliers, weapon types, quantities, and years. *(Applies Lecture 9's principles on color gradients for effective spatial analysis.)*

- **Proportional Symbol Map:** Represents regional arms imports with circles sized according to import value, complemented by a dynamic mini bar chart for quick reference and comparison.

- **Migration Map:** Visualizes global arms trade flows from major suppliers (United States, Russia, and China) to recipient countries, with color-coded lines representing each origin country. Line thickness indicates trade volume, and colored circles highlight the importance of recipient countries.

- **Force-Directed Graph:** Illustrates network connections between arms exporters and recipients to identify the centers of gravity and linkages.

- **Zoomable Circle Packing:** Depicts hierarchical data on weapons transfers, organized by category and year. *(Uses Lecture 8's guidelines on hierarchical data representation.)*

- **Parallel Coordinates Chart:** Highlights the top recipients of arms from the US, China, and Russia, allowing users to identify key countries of interest and observe trade patterns over time. *(Reflects multi-dimensional data analysis techniques from Lecture 2.)*

- **Line Chart:** Displays arms trade trends over time for selected countries, allowing users to track export and import values and compare fluctuations across different nations. The interactive slider enables users to adjust the timeframe by moving both ends to focus on specific periods.

- **Treemap:** Visualizes the top 20 arms companies by revenue for a selected year. Each rectangle represents a company, with the area proportional to its revenue share. The color indicates the company's country. *(Applies Lecture 10's strategies for hierarchical data visualization.)*

- **Pie Chart:** Displays the distribution of arms trade by region for a selected year. Each slice represents a region’s percentage of total arms imports, with color coding for easy differentiation.

### Thematic Narrative Sections

The dashboard's narrative structure allows exploration of global arms trade themes:

- **Introduction:** Provides a strategic overview of how arms trade is used as a tool for diplomacy and influence.
- **Strength in Alliance & Partnership:** Highlights how superpowers like the U.S., Russia, and China reinforce alliances through targeted arms exports.
- **Competition in Strategic Regions:** Examines the multipolar rivalry in regions where arms trade impacts stability and shifts in power dynamics.
- **Countering Through Proxy Support:** Analyzes how countries use arms transfers to support proxy forces and maintain influence without direct involvement.
- **Preparing Allies for Emerging Threats:** Details how arms transfers bolster allies’ defenses, reducing reliance on direct intervention by superpowers.
- **Profiting from Tensions:** Explores the economic benefits of arms trade, especially during geopolitical conflicts, as defense industries expand influence and profit.
- **Conclusion:** Reflects on the strategic implications of global arms trade, focusing on the balance of power and its role in shaping international order.

**Expanded Insights:**

- **Lecture 1:** Emphasis on storytelling shapes the narrative sections, connecting visualizations to real-world implications. These narratives help contextualize data for better comprehension and impact.

---

## License

This project is licensed under the MIT License.

---

## Acknowledgements

This project integrates insights from multiple lectures:

- **React:** A JavaScript library for building user interfaces.
- **D3.js:** A powerful library for producing dynamic, interactive data visualizations.
- **Three.js:** A 3D library that makes WebGL simpler.
- **@deck.gl:** WebGL-powered framework for visual exploratory data analysis of large datasets.
- **Bootstrap:** For responsive design and pre-styled components.
- **Mermaid.js:** For creating dynamic and interactive workflow diagrams.
- **SIPRI:** For providing comprehensive datasets on global arms transfers.
- **OpenAI's ChatGPT:** Assistance in generating and refining project documentation.
- **Lecture 1:** Inspiration for aligning visualization goals with user needs.
- **Lecture 3:** Guidance on selecting robust visualization tools.

Feel free to suggest further enhancements or report issues!

---

## Contact

For any inquiries or feedback, please contact [your-email@example.com](mailto:your-email@example.com).

---

## FAQs

**Q1: What prerequisites are needed to run the project?**  
**A:** Ensure you have Node.js and npm installed on your machine.

**Q2: I encounter an error while running `npm install`. What should I do?**  
**A:** Try deleting the `node_modules` folder and the `package-lock.json` file, then run `npm install` again.

**Q3: How can I contribute to the project?**  
**A:** Please refer to the [Contributing](#contributing) section for detailed guidelines.

**Q4: How do I report bugs or request features?**  
**A:** You can open an issue on the GitHub repository detailing the bug or feature request.

**Q5: Where can I find the project documentation?**  
**A:** Comprehensive documentation is available within the repository, including this README and additional docs in the `/docs` directory.

**Q6: Can I use the project's visualizations for my own work?**  
**A:** Yes, the project is licensed under the MIT License, allowing for reuse with proper attribution.

---

## AI Assistance

We leveraged AI tools to enhance various aspects of the project. Below are the specific contributions:

- **Data Wrangling and Processing:** Processed and organized datasets to be analytics-ready and visualization-friendly, ensuring data accuracy and reliability.
- **Dot Map Enhancements:** Improved legend readability, defined intensity levels, added map title, customized colors, implemented tooltips, and integrated a year slider for dynamic filtering.
- **Tree Map Modifications:** Enhanced interactivity with top 20 companies filtering, year-selection slider, hover opacity adjustments, text wrapping, and dynamic color scaling.
- **Multiline Chart Development:** Converted Y-axis values to billions, added titles and labels, implemented tooltips, enabled country selection, and created a responsive legend.
- **Proportional Symbol Map and Pie Chart Improvements:** Added dynamic year sliders, enhanced tooltip functionality, filtered out irrelevant data, increased pie chart size, and implemented 3D appearance enhancements.
- **Arms Trade Directional Map Construction:** Integrated hierarchical JSON data, set up GeoJSON maps, calculated country centroids, added interactive color-coded lines, scaled line thickness, and improved visibility with color opacity adjustments.
- **Visualizations Refinement:** Built and refined multiple D3.js visualizations, including migration maps, parallel coordinates charts, force-directed graphs, and chord diagrams with dynamic filtering and interactive elements.
- **Choropleth Map for Suppliers and Weapon Types:** Created an interactive map with weapon type dropdowns, year sliders, dynamic country color and size, and tooltips for comprehensive arms trade patterns.
- **Zoomable Circle Packing Customization:** Enhanced readability with scaled labels, increased bubble sizes, refined color schemes, resolved background issues, positioned tooltips, and improved overall styling.
- **Storyboard Framework Development:** Refined CSS styling, centered map positioning, enhanced migration maps with distinct colors, improved legends, integrated tooltips, and expanded narrative emphasizing U.S. strategic countermeasures.
- **Global Arms Trade Network Narrative Modification:** Updated the force-directed diagram with color-coded superpowers, highlighted key regions and multilateral partners, and applied styling for a cohesive geopolitical narrative.
- **Storyboard and Narrative Improvement:** Adjusted visualization colors and layout, moved visualizations to appropriate sections, added toggle buttons for view switching, and streamlined user interaction for enhanced presentation.
- **README Creation:** Collaborated to refine the README, focusing on clarity, functionality, and alignment with course objectives, organizing data sources, detailing design choices, and providing comprehensive project summaries.
- **Choropleth Map and Line Chart for Defense Expenditure:** Built Choropleth Map and Line Chart components using React, D3, and TopoJSON to display global defense expenditure data with synchronized interactivity and responsive design.

---

## References

- **Lecture 1:** Statistical Graphics; Storytelling and Aligning Data with User Needs.
- **Lecture 2:** Statistical Graphics; Multi-dimensional Data Analysis.
- **Lecture 3:** Visualization Techniques, Web Technologies; Loading Data with D3; Understanding Data Pipelines and Ensuring Data Integrity.
- **Lecture 4:** Graphing in the Browser, D3; Selecting Frameworks with Large Community Support.
- **Lecture 5:** Loading Data with D3; Dashboards Design; Simplifying User Interaction with Tools.
- **Lecture 6:** The Eye and the Visual Brain; Pre-attentive Features; Contrast Ratios and Keyboard Navigation.
- **Lecture 7:** Interactive Visualizations; Enhancing User Engagement through Interactivity; Data Preparation for Filters and Sliders.
- **Lecture 8:** Color and Complex Charts; Maps and Choropleths; Hierarchical Data Representation.
- **Lecture 9:** Maps and Depth Perception; Geospatial Representation Techniques; 3D Visualizations.
- **Lecture 10:** Gestalt and Semiology; Hierarchical Data Visualization.
- **Lecture 11:** 3D Data Visualization; Designing Effective Dashboards; Emerging Technologies in Data Visualization.

---


#### AI Links
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

[AI Assistance 13 – README Creation](https://chatgpt.com/c/672fd8a5-555c-8001-9f05-b79c0ace787f)
We collaborated to refine the GitHub README for a Global Arms Trade Dashboard, focusing on clarity, functionality, and alignment with your DSCI 554 course. We organized data sources from SIPRI and UCDP/PRIO efficiently and developed a Design Choices section to highlight narrative structure, color-coded visuals, depth, and interactivity, drawing on principles like Gestalt theory and cognitive load reduction from your lectures. We detailed functionality for key interactive elements (sidebar navigation, tooltips, zoom/pan) and customization options, with references to the React components (.js files) that implement these features. The final document in GitHub Markdown provides a cohesive, professional summary of the dashboard’s capabilities and design rationale.

[AI Assistance 14]( https://chatgpt.com/c/6730dcbe-841c-8001-8926-9a0fa9dd81e0) & [AI Assistance 15]( https://chatgpt.com/c/6730ff0b-3c10-8001-9954-957a31078481)
We worked on building Choropleth Map and Line Chart for the defense expenditure by country by year components using React, D3, and TopoJSON to display global defense expenditure data. The component features a choropleth map to show defense expenditure by country for a selected year, synchronized with a line chart showing historical expenditure trends for the United States, China, and Russia. We ensured compatibility of country names between the dataset and the map, applied a logarithmic color scale for better visual contrast, and added tooltips for detailed information on hover. Additionally, we positioned a legend for both the map and line chart, synchronized the line chart with the map’s year slider, and included highlighted points on the line chart to mark the selected year. Finally, we placed the line chart in the bottom right corner of the map for an integrated, responsive layout.

