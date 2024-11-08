import React, { useState, useRef } from 'react';
import DotMap from './maps/DotMap';
import ChoroplethMap from './maps/ChoroplethMap';
import ProportionalSymbolMap from './maps/ProportionalSymbolMap';
import MigrationMap from './layouts/MigrationMap';
import ForceDirectedGraph from './layouts/ForceDirectedGraph';
import ZoomableCirclePacking from './layouts/ZoomableCirclePacking';
import ParallelCoordinatesChart from './layouts/ParallelCoordinatesChart';
import '../index.css';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("intro");
  const [selectedYear, setSelectedYear] = useState(2023);
  const [isNetworkView, setIsNetworkView] = useState(false); // To toggle between MigrationMap and ForceDirectedGraph
  const [isChoroplethView, setIsChoroplethView] = useState(false); // To toggle between ParallelCoordinatesChart and ChoroplethMap

  const allianceRef = useRef(null); // Reference for the "Strength and Resilience through Alliance and Partnership" section

  // Mapping of section keys to display names
  const sectionTitles = {
    intro: "Introduction",
    "strength-and-resilience": "Strength and Resilience through Alliance and Partnership",
    "balancing-power": "Balancing Power in Volatile Regions",
    "countering-adversaries": "Countering Adversaries Through Proxy Support",
    "enhancing-defense": "Enhancing Defense Capabilities Without Direct Engagement",
    "emerging-threats": "Preparing Allies for Emerging Threats",
    conclusion: "Conclusion"
  };

  const narrativeContent = {
    intro: (
      <>
        Explore how the <span style={{ color: '#4682B4' }}>United States</span> uses arms trade as a strategic tool to bolster global stability and strengthen alliances. This analysis highlights how arms trades align with regions of strategic interest, where conflicts either serve national agendas or promote stability aligned with superpower goals. For the <span style={{ color: '#4682B4' }}>United States</span>, arms support—whether through <span style={{ fontStyle: 'italic' }}>direct involvement</span> or <span style={{ fontStyle: 'italic' }}>indirect aid</span>—has historically been a tool to advance its interests, stabilize allies, and pursue foreign policy agendas. The maps illustrate that arms trades are not merely economic transactions; they are integral to <span style={{ fontStyle: 'italic' }}>geopolitical strategy</span>, frequently used as extensions of diplomacy within broader national security frameworks to promote stability or serve national interests.

        <br /><br />

        <strong>Illustrative Case Study: Regional Arms Trade and Conflict in 1971</strong>

        In 1971, distinct correlations emerge between regional conflicts and arms trade volumes, each reflecting the unique dynamics of the <span style={{ fontStyle: 'italic' }}>Cold War</span> and the height of the <span style={{ fontStyle: 'italic' }}>Vietnam War</span>:

        <br /><br />

        <span style={{ fontWeight: 'bold' }}>Asia:</span> During the height of the Vietnam War, <span style={{ fontStyle: 'italic' }}>Asia</span> experienced high conflict intensity, with arms imports reaching <span style={{ color: '#FF6347' }}>9.02 billion USD</span>. This substantial volume reflects Cold War tensions and regional conflicts such as the <span style={{ fontStyle: 'italic' }}>Indo-Pakistani War</span>, as superpowers funneled arms to influence outcomes and strengthen alliances.

        <br /><br />

        <span style={{ fontWeight: 'bold' }}>Middle East:</span> With arms imports totaling <span style={{ color: '#FF6347' }}>7.33 billion USD</span>, the <span style={{ fontStyle: 'italic' }}>Middle East</span> attracted heavy arms trade due to its <span style={{ fontStyle: 'italic' }}>strategic value</span> in oil reserves and its pivotal geopolitical location. Superpower involvement here was likely driven by the desire to exert influence and maintain stability amidst emerging threats.

        <br /><br />

        <span style={{ fontWeight: 'bold' }}>Africa:</span> While Africa showed scattered conflicts, its relatively lower arms imports of <span style={{ color: '#FF6347' }}>1.58 billion USD</span> suggest limited resources for large-scale military spending or less external involvement from superpowers, reflecting its differing strategic importance.

        <br /><br />

        <span style={{ fontWeight: 'bold' }}>Americas and Europe:</span> Despite substantial arms imports, conflict intensity in the <span style={{ fontStyle: 'italic' }}>Americas</span> and <span style={{ fontStyle: 'italic' }}>Europe</span> was low, indicating that arms imports in these regions were more focused on <span style={{ fontStyle: 'italic' }}>deterrence</span> or <span style={{ fontStyle: 'italic' }}>strategic positioning</span> rather than active conflict. This reflects the Cold War's balance of power, where arms served to maintain stability and prepare for potential threats rather than engage directly in regional conflicts.

        <br /><br />

        These insights illustrate that arms transfers often extend diplomatic and national security strategies, reinforcing that arms are not just tools of war but instruments of influence in the broader geopolitical landscape.
      </>
    ),

    "strength-and-resilience": isNetworkView ? (
      <>
        This Global Arms Trade Network further illustrates a complex geopolitical chessboard where the <span style={{ color: "#4682B4" }}>United States</span>, <span style={{ color: "#DC143C" }}>Russia</span>, and <span style={{ color: "#FFDB58" }}>China</span> use arms exports to expand influence and secure alliances across strategic regions. Each superpower’s network centers around key allies: the <span style={{ color: "#4682B4" }}>United States</span> supports countries in <span style={{ fontStyle: "italic" }}>Europe, the Middle East, and Asia-Pacific</span>, reinforcing a defense line against rivals; <span style={{ color: "#DC143C" }}>Russia</span> supplies nations in <span style={{ fontStyle: "italic" }}>Eastern Europe and Central Asia</span> to counter NATO's reach; and <span style={{ color: "#FFDB58" }}>China</span> arms countries in <span style={{ fontStyle: "italic" }}>Southeast Asia, Africa, and South Asia</span>, expanding its foothold in resource-rich areas. Countries like India illustrate a multilateral approach, balancing relationships with the U.S., Russia, and others. Through this network, arms transfers reveal interdependent alliances, bolstered influence, and efforts to contain rivals.
      </>
    ) : (
      <>
        The <span style={{ color: "#4682B4" }}>United States</span> uses arms exports strategically to build alliances and shape regional power dynamics, especially against major powers like <span style={{ color: "#DC143C" }}>Russia</span> and <span style={{ color: "#FFDB58" }}>China</span>. By equipping allies in key areas—such as Eastern Europe, the Middle East, and the Asia-Pacific—the <span style={{ color: "#4682B4" }}>United States</span> bolsters defense, deters aggression, and strengthens long-term partnerships. These alliances, supported by advanced weaponry, create a coordinated front that counters <span style={{ color: "#FFDB58" }}>China's</span> and <span style={{ color: "#DC143C" }}>Russia's</span> influence. In contrast, <span style={{ color: "#DC143C" }}>Russia</span> and <span style={{ color: "#FFDB58" }}>China</span> use arms transfers to establish footholds in their own spheres, particularly in the Middle East, Africa, and Southeast Asia. <span style={{ color: "#9966CC" }}>Purple dots</span> represent the top recipients of arms from each country, often bordering one another and highlighting areas of interest and spheres of influence. This distribution evidences an effort by the U.S., <span style={{ color: "#FFDB58" }}>China</span>, and <span style={{ color: "#DC143C" }}>Russia</span> to expand their spheres of influence or contain each other.

        <br /><br />A quick case study, as shown on the map, highlights a significant increase in <span style={{ color: "#FFDB58" }}>China's</span> arms trade with Africa prior to the initiation of the Belt and Road Initiative, which officially started in 2013.
      </>
    ),
    "balancing-power": "Through selective arms trade, the U.S. helps ensure stability in volatile regions by balancing power dynamics.",
    "countering-adversaries": "In regions with adversarial threats, U.S. arms trade provides critical support to nations facing direct challenges.",
    "enhancing-defense": "By empowering allies like Taiwan, the U.S. reduces the need for a direct military presence in the region.",
    "emerging-threats": "The U.S. prepares allies for future challenges, including advanced cyber and missile defense capabilities.",
    conclusion: "The U.S. arms trade strategy adapts to shifting alliances and emerging threats, ensuring global stability."
  };


  // Function to toggle between MigrationMap and ForceDirectedGraph views
  const toggleAllianceSection = () => {
    setIsNetworkView(!isNetworkView);
  };

  // Function to toggle between ParallelCoordinatesChart and ChoroplethMap
  const toggleChoroplethSection = () => {
    setIsChoroplethView(!isChoroplethView);
  };

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1>Arming for Stability: U.S. Military Strategy Through Global Arms Trade</h1>
      </header>

      {/* Sidebar for Story Navigation */}
      <aside className="sidebar">
        <h3>Explore the Story</h3>
        <ul>
          {Object.keys(sectionTitles).map((section) => (
            <li key={section}>
              <button onClick={() => setActiveSection(section)}>
                {sectionTitles[section]}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Narrative Box */}
      <aside className="narrative-box">
        <h3>{sectionTitles[activeSection]}</h3>
        {narrativeContent[activeSection]}
      </aside>

      {/* Main Content Area */}
      <main className="content-area">
        {activeSection === "intro" && (
          <section id="intro" className="large-section">
            <div className="stacked-maps">
              <DotMap />
              <ProportionalSymbolMap dataUrl="https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_regional_transfers.csv" selectedYear={selectedYear} />
            </div>
          </section>
        )}

        {activeSection === "strength-and-resilience" && (
          <section id="strength-and-resilience" ref={allianceRef} className="large-section">
            {isNetworkView ? <ForceDirectedGraph /> : <MigrationMap />}
            <button
              onClick={toggleAllianceSection}
              style={{
                marginTop: '20px',
                padding: '10px 15px',
                fontSize: '16px',
                cursor: 'pointer',
                backgroundColor: '#4682B4',
                color: 'white',
                border: 'none',
                borderRadius: '5px'
              }}
            >
              {isNetworkView ? "Back to Alliance Map" : "View Global Arms Trade Network"}
            </button>
          </section>
        )}

        {activeSection === "balancing-power" && (
          <section id="balancing-power" className="large-section">
            <div className="stacked-maps">
              <DotMap />
              <ProportionalSymbolMap dataUrl="https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_regional_transfers.csv" selectedYear={selectedYear} />
            </div>
          </section>
        )}

        {activeSection === "countering-adversaries" && (
          <section id="countering-adversaries" className="medium-section">
            {isChoroplethView ? <ChoroplethMap /> : <ParallelCoordinatesChart />}
            <button
              onClick={toggleChoroplethSection}
              style={{
                marginTop: '20px',
                padding: '10px 15px',
                fontSize: '16px',
                cursor: 'pointer',
                backgroundColor: '#4682B4',
                color: 'white',
                border: 'none',
                borderRadius: '5px'
              }}
            >
              {isChoroplethView ? "Back to Parallel Coordinates" : "View Choropleth Map"}
            </button>
          </section>
        )}

        {activeSection === "enhancing-defense" && (
          <section id="enhancing-defense" className="large-section">
            <ZoomableCirclePacking />
          </section>
        )}

        {activeSection === "emerging-threats" && (
          <section id="emerging-threats" className="medium-section">
            <ChoroplethMap />
          </section>
        )}

        {activeSection === "conclusion" && (
          <section id="conclusion" className="medium-section">
            <ChoroplethMap />
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
