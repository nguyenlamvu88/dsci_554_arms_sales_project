# DSCI 554 - Arms Sales Analysis and Visualizations


## Datasets

### Top Arms Exporters \(1950\)–\(2023\)

- **Source**: SIPRI Arms Transfers
- **Raw File**: `suppliers_1950-2023.csv`
- **Processed File**: `processed_arms_suppliers.csv`
- **Description**: This dataset provides data on the top arms-exporting countries from \(1950\) to \(2023\), organized for analysis of long-term trends in arms exports and supplier patterns.

### Top Arms Importers \(1950\)–\(2023\)

- **Source**: SIPRI Arms Transfers
- **Raw File**: `recipients_1950-2023.csv`
- **Processed File**: `processed_arms_recipients.csv`
- **Description**: This dataset covers the leading arms-importing countries from \(1950\) to \(2023\), structured to analyze import trends and recipient country dependencies on arms suppliers over time.

### Military Expenditure by Region \(1948\)–\(2023\)

- **Source**: SIPRI Military Expenditure Database
- **Raw File**: `SIPRI-Milex-data-1948-2023.xls`
- **Processed File**: `processed_arms_expenditure_by_regions.csv`
- **Description**: This dataset captures military spending by regions over decades, facilitating the study of regional spending trends and comparative analysis between different parts of the world.

### Top \(100\) Arms Companies Revenue \(2002\)–\(2022\)

- **Source**: SIPRI Arms Industry Database
- **Raw File**: `SIPRI-Top-100-2002-2022.xls`
- **Processed File**: `processed_top_100_arms_companies_consolidated.csv`
- **Description**: This dataset consolidates revenue data for the top \(100\) arms companies, making it suitable for analyzing industry revenue trends, key players, and their performance over time.

### Global Total Arms Revenue \(2002\)–\(2022\)

- **Source**: SIPRI Arms Industry Database
- **Raw File**: `Total-arms-revenue-SIPRI-Top-100-2002-2022.xls`
- **Processed File**: `processed_global_total_arms_revenue.csv`
- **Description**: This dataset includes total global revenue from arms sales, allowing for insights into the overall growth or decline in the arms industry and patterns in global military spending.

### Arms Sales by Regions \(1950\)–\(2023\)

- **Source**: SIPRI Regional Transfers Database
- **Raw File**: `regional_transfers_1950-2023.csv`
- **Processed File**: `processed_regional_transfers.csv`
- **Description**: This dataset represents arms transfers between regions, useful for visualizing trade flows and assessing regional dependencies and interactions in the arms trade.

### Armed Conflicts by Country \(1949\)–\(2023\)

- **Source**: UCDP/PRIO Armed Conflict Database
- **Raw File**: `UcdpPrioConflict_v24_1.csv`
- **Processed File**: `processed_conflicts_locations_years.csv`
- **Description**: This dataset has been simplified to include only essential details like conflict start and end dates, and parties involved, making it easier to analyze the frequency and duration of conflicts globally.

---

## Design Methodology

### Maps

1. **Dot Map**: Use `processed_conflicts_locations_years.csv` to show conflict hotspots by marking the locations of armed conflicts.
2. **Choropleth Map**: Apply `arms_expenditure_by_regions.csv` to display military spending intensity across regions by shading regions based on spending levels.
3. **Proportional Symbol Map**: Use `processed_regional_transfers.csv` to show the volume of arms trade by region. The size of symbols can represent the trade value.

### Layouts

1. **Treemap**: Use `top_100_arms_companies_consolidated.csv` to visualize market share by company within the arms industry.
2. **Zoomable Circle Packing**: Implement `processed_arms_suppliers.csv` to represent the hierarchy of suppliers with bubble sizes corresponding to export volumes.
3. **Sunburst**: Use `processed_arms_recipients.csv` for a breakdown of arms imports by country, with each layer showing a subcategory, such as region or year.

### Graphs

1. **Chord Diagram**: Use `processed_regional_transfers.csv` to display relationships and dependencies between exporting and importing regions.
2. **Force-Directed Graph**: Utilize `processed_conflicts_locations_years.csv` to show connections between conflict parties, helping visualize alliances or opposition relationships.

### Charts

1. **Stacked Bar Chart**: Use `processed_global_total_arms_revenue.csv` to show the revenue trends for arms companies over the years, allowing for comparison of growth.
2. **Pie or Donut Chart**: Apply `arms_expenditure_by_regions.csv` to show the distribution of military expenditure across regions.
3. **Multi-line Chart**: Use `processed_global_total_arms_revenue.csv` for tracking changes in total arms revenue over time for comparative trend analysis.
4. **Parallel Coordinates Chart**: Implement `processed_arms_suppliers.csv` to examine multiple dimensions, such as export volume, country, and regions across time.
5. **Difference Chart**: Use `processed_arms_recipients.csv` to compare import volumes across countries or regions by year, highlighting increases or decreases over time.

---
