// src/components/Dashboard.js

import React, { useState, useRef } from 'react';
import DefenseExpenditure from './maps/DefenseExpenditure'; // Import DefenseExpenditure component
import DotMap from './maps/DotMap';
import ChoroplethMap from './maps/ChoroplethMap'; // Retained ChoroplethMap import
import ProportionalSymbolMap from './maps/ProportionalSymbolMap';
import MigrationMap from './layouts/MigrationMap';
import ForceDirectedGraph from './layouts/ForceDirectedGraph';
import ZoomableCirclePacking from './layouts/ZoomableCirclePacking';
import ParallelCoordinatesChart from './layouts/ParallelCoordinatesChart';
import LineChart from './layouts/LineChart';
import PieChart from './layouts/PieChart';
import Treemap from './layouts/Treemap'; // Import Treemap component
import '../index.css';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("intro");
  const [selectedYear, setSelectedYear] = useState(2023);
  const [isNetworkView, setIsNetworkView] = useState(false);
  const [isCirclePackingView, setIsCirclePackingView] = useState(false);

  const allianceRef = useRef(null);

  const sectionTitles = {
    intro: "Introduction",
    "balancing-power": "Competition in Strategic Regions",
    "strength-and-resilience": "Strength in Alliance & Partnership",    
    "countering-adversaries": "Countering through Proxy Support",
    "emerging-threats": "Preparing Allies for Emerging Threats",
    "profiting-from-tensions": "From Tensions to Strategic Economic Engines", 
    conclusion: "Conclusion"
  };

  const narrativeContent = {
    intro: (
      <>
        <p style={{ marginBottom: "1.5em" }}>
          The <span style={{ color: '#4682B4' }}>United States</span> has strategically employed arms trades and transfers to enhance global stability and reinforce alliances. This analysis highlights how arms trades align with regions of strategic interest, where conflicts either serve national agendas or promote stability aligned with superpower goals. For the <span style={{ color: '#4682B4' }}>United States</span>, arms support—whether through <em style={{ color: 'orange' }}>direct involvement</em> or <em style={{ color: 'orange' }}>indirect aid</em>—has historically been a tool to advance its interests, stabilize allies, and pursue foreign policy agendas. The maps illustrate that arms trades are not merely economic transactions; they are integral to <em style={{ color: 'orange' }}>geopolitical strategy</em>, frequently used as extensions of diplomacy within broader national security <em style={{ color: 'orange' }}>Diplomatic, Informational, Military, and Economic (DIME)</em> frameworks to promote stability or serve national interests.
        </p>

        <p style={{ fontSize: "1.2em", margin: "1.5em 0 0.8em", color: "#e74c3c", fontWeight: "bold", borderBottom: "2px solid #e74c3c", paddingBottom: "0.2em" }}>
          Illustrative Case: The Indo-Pacific as a New Geopolitical Center of Gravity
        </p>
        <p style={{ marginBottom: "1.2em" }}>
          As you slide through the year selector, it becomes clear that <span style={{ color: '#FFDB58' }}>China</span> has steadily increased its defense budget since the late 1990s and early 2000s, surpassing <span style={{ color: '#DC143C' }}>Russia</span> and signaling its ambitions for military modernization and expanded influence, particularly in the Indo-Pacific region. In response, Indo-Pacific nations have also significantly increased their defense spending, bolstering military capabilities to address regional security concerns and counterbalance <span style={{ color: '#FFDB58' }}>China's</span> growing presence.
        </p>     
      </>
    ),

    "strength-and-resilience": isNetworkView ? (
      <>
        <p style={{ marginBottom: "1.5em" }}>
          This Global Arms Trade Network further illustrates a complex geopolitical chessboard where the <span style={{ color: "#4682B4" }}>United States</span>, <span style={{ color: "#DC143C" }}>Russia</span>, and <span style={{ color: "#FFDB58" }}>China</span> use arms exports to expand influence and secure alliances across strategic regions. Each superpower’s network centers around key allies: the <span style={{ color: "#4682B4" }}>United States</span> supports countries in <span style={{ fontStyle: "italic" }}>Europe, the Middle East, and Asia-Pacific</span>, reinforcing a defense line against rivals; <span style={{ color: "#DC143C" }}>Russia</span> supplies nations in <span style={{ fontStyle: "italic" }}>Eastern Europe and Central Asia</span> to counter NATO's reach; and <span style={{ color: "#FFDB58" }}>China</span> arms countries in <span style={{ fontStyle: "italic" }}>Southeast Asia, Africa, and South Asia</span>, expanding its foothold in resource-rich areas. Countries like India illustrate a multilateral approach, balancing relationships with the U.S., Russia, and others. Through this network, arms transfers reveal interdependent alliances, bolstered influence, and efforts to contain rivals.
        </p>
      </>
    ) : (
      <>
        <p style={{ marginBottom: "1.5em" }}>
          The <span style={{ color: "#4682B4" }}>United States</span> uses arms exports strategically to build alliances and shape regional power dynamics, especially against major powers like <span style={{ color: "#DC143C" }}>Russia</span> and <span style={{ color: "#FFDB58" }}>China</span>. By equipping allies in key areas—such as Eastern Europe, the Middle East, and the Asia-Pacific—the <span style={{ color: "#4682B4" }}>United States</span> bolsters defense, deters aggression, and strengthens long-term partnerships. These alliances, supported by advanced weaponry, create a coordinated front that counters <span style={{ color: "#FFDB58" }}>China's</span> and <span style={{ color: "#DC143C" }}>Russia's</span> influence.
        </p>

        <p style={{ marginBottom: "1.5em" }}>
          In contrast, <span style={{ color: "#DC143C" }}>Russia</span> and <span style={{ color: "#FFDB58" }}>China</span> use arms transfers to establish footholds in their own spheres, particularly in the Middle East, Africa, and Southeast Asia. <span style={{ color: "#9966CC" }}>Purple dots</span> represent the top recipients of arms from each country, often bordering one another and highlighting areas of interest and spheres of influence. This distribution evidences an effort by the U.S., <span style={{ color: "#FFDB58" }}>China</span>, and <span style={{ color: "#DC143C" }}>Russia</span> to expand their spheres of influence or contain each other.
        </p>

        <p style={{ marginBottom: "1.5em" }}>
          A quick case study, as shown on the map, highlights a significant increase in <span style={{ color: "#FFDB58" }}>China's</span> arms trade with Africa prior to the initiation of the Belt and Road Initiative, which officially started in 2013.
        </p>
      </>
    ),

    "balancing-power": (
      <>
        <p style={{ marginBottom: "1.5em" }}>
          The global arms trade has shifted from a U.S.-Soviet rivalry to a multipolar competition, with <span style={{ color: "#FFDB58" }}>China</span> joining the <span style={{ color: "#4682B4" }}>U.S.</span> and <span style={{ color: "#DC143C" }}>Russia</span> as key players. Each nation’s influence is shaped by historical events, alliances, and economic factors, impacting global security dynamics.
        </p>

        <p style={{ fontSize: "1.4em", margin: "1.5em 0 0.8em", color: "#e74c3c", fontWeight: "bold", borderBottom: "2px solid #e74c3c", paddingBottom: "0.2em" }}>
          Cold War Era (1947-1991)
        </p>
        <p style={{ marginBottom: "1.2em" }}>
          During the Cold War, the <span style={{ color: "#4682B4" }}>U.S.</span> and <span style={{ color: "#DC143C" }}>Soviet Union</span> dominated arms exports, each supporting allies to extend ideological influence.
        </p>

        <p style={{ fontSize: "1.4em", margin: "1.5em 0 0.8em", color: "#e74c3c", fontWeight: "bold", borderBottom: "2px solid #e74c3c", paddingBottom: "0.2em" }}>
          Post-Cold War Shift (1991-2000)
        </p>
        <p style={{ marginBottom: "1.2em" }}>
          With the <span style={{ color: "#DC143C" }}>Soviet Union’s</span> collapse, the <span style={{ color: "#4682B4" }}>U.S.</span> emerged as the top arms exporter, backed by a strong economy and stable alliances.
        </p>

        <p style={{ fontSize: "1.4em", margin: "1.5em 0 0.8em", color: "#e74c3c", fontWeight: "bold", borderBottom: "2px solid #e74c3c", paddingBottom: "0.2em" }}>
          Russia’s Resurgence (Early 2000s)
        </p>
        <p style={{ marginBottom: "1.2em" }}>
          Under Putin, <span style={{ color: "#DC143C" }}>Russia</span> rebuilt its defense industry, regaining clients with affordable options like the S-400.
        </p>

        <p style={{ fontSize: "1.4em", margin: "1.5em 0 0.8em", color: "#e74c3c", fontWeight: "bold", borderBottom: "2px solid #e74c3c", paddingBottom: "0.2em" }}>
          China’s Rise (2000s-Present)
        </p>
        <p style={{ marginBottom: "1.2em" }}>
          <span style={{ color: "#FFDB58" }}>China</span> entered the market, offering affordable alternatives to Western and Russian arms, appealing to regions like Africa and Southeast Asia. The Belt and Road initiative and a non-interference policy further bolstered <span style={{ color: "#FFDB58" }}>China’s</span> appeal.
        </p>

        <p style={{ fontSize: "1.4em", margin: "1.5em 0 0.8em", color: "#e74c3c", fontWeight: "bold", borderBottom: "2px solid #e74c3c", paddingBottom: "0.2em" }}>
          China Surpasses Russia (2022)
        </p>
        <p style={{ marginBottom: "1.2em" }}>
          In 2022, <span style={{ color: "#FFDB58" }}>China</span> became the second-largest arms exporter as <span style={{ color: "#DC143C" }}>Russia</span> faced challenges due to the Ukraine conflict and Western sanctions.
        </p>

        <p style={{ fontSize: "1.4em", margin: "1.5em 0 0.8em", color: "#e74c3c", fontWeight: "bold", borderBottom: "2px solid #e74c3c", paddingBottom: "0.2em" }}>
          Global Implications
        </p>
        <p style={{ marginBottom: "1.2em" }}>
          The arms trade now includes three key exporters with distinct strategies:
        </p>
        <ul style={{ marginBottom: "1.2em", paddingLeft: "1.5em" }}>
          <li>The <span style={{ color: "#4682B4" }}>U.S.</span> leads in high-tech systems for wealthy allies.</li><br />
          <li><span style={{ color: "#DC143C" }}>Russia</span> faces limitations due to sanctions and internal demands.</li><br />
          <li><span style={{ color: "#FFDB58" }}>China</span> offers affordable, flexible options to budget-conscious nations. Its rapid rise signals ambitions to reshape global power dynamics economically and militarily, adding complexity to global security.</li><br />
        </ul>
      </>
    ),

    "countering-adversaries": (
      <>
        <p style={{ marginBottom: "1.5em" }}>
          The international arms trade is a complex network of alliances and rivalries, reflecting strategic shifts and regional priorities on the parallel coordinates chart. Tracing the lines reveals historical trends and evolving arms trade relationships, each reflecting strategic alliances and rivalries.
        </p>
      
        <p style={{ fontSize: "1.4em", margin: "1.5em 0 0.8em", color: "#e74c3c", fontWeight: "bold", borderBottom: "2px solid #e74c3c", paddingBottom: "0.2em" }}>
          Key Relationships and Trends
        </p>
      
        <p style={{ marginBottom: "1.2em" }}>
          The <strong style={{ color: "#4682B4" }}>U.S.</strong> maintains strategic alliances across Asia and the Middle East to counter regional threats. This includes supplying advanced weaponry to <strong style={{ color: "#A895C0" }}>Taiwan</strong>, <strong style={{ color: "#A895C0" }}>Japan</strong>, <strong style={{ color: "#A895C0" }}>South Korea</strong>, <strong style={{ color: "#A895C0" }}>Israel</strong>, and <strong style={{ color: "#A895C0" }}>Saudi Arabia</strong>, aimed at countering China's influence and ensuring regional stability.
        </p>
      
        <p style={{ marginBottom: "1.2em" }}>
          <strong style={{ color: "#FFD700" }}>China</strong> relies mainly on domestic arms production, with significant support from <strong style={{ color: "#CD5C5C" }}>Russia</strong> for strategic gains. Meanwhile, <strong style={{ color: "#A895C0" }}>India</strong> diversifies its procurement with major imports from Russia, the <strong style={{ color: "#4682B4" }}>U.S.</strong>, and Israel to enhance security.
        </p>
      
        <p style={{ marginBottom: "1.2em" }}>
          Within NATO, countries like <strong style={{ color: "#A895C0" }}>Turkey</strong> and <strong style={{ color: "#A895C0" }}>Germany</strong> balance Western alliances with regional ambitions, similar to <strong style={{ color: "#A895C0" }}>Saudi Arabia</strong>'s approach to stabilizing its region with Western support. Additionally, <strong style={{ color: "#CD5C5C" }}>Iran</strong> maintains limited but strategic ties with Russia to assert its influence against Western powers.
        </p>
      
        <p style={{ fontSize: "1.4em", margin: "1.5em 0 0.8em", color: "#e74c3c", fontWeight: "bold", borderBottom: "2px solid #e74c3c", paddingBottom: "0.2em" }}>
          Geopolitical Shifts
        </p>
      
        <p style={{ marginBottom: "1.2em" }}>
          <strong>Cold War Era (1947-1991)</strong>: The <strong style={{ color: "#4682B4" }}>U.S.</strong> and <strong style={{ color: "#CD5C5C" }}>Soviet Union</strong> engaged in proxy wars, driving high arms trade volumes.
        </p>
      
        <p style={{ marginBottom: "1.2em" }}>
          <strong>Post-Cold War (1991-Present)</strong>: The <strong style={{ color: "#4682B4" }}>U.S.</strong> dominates, exporting to strategic regions, with <strong style={{ color: "#FFD700" }}>China</strong> and <strong style={{ color: "#A895C0" }}>India</strong> emerging as key players.
        </p>
      
        <p style={{ marginBottom: "1.2em" }}>
          <strong>Recent Decades (2000s-2020s)</strong>: Middle Eastern and Asia-Pacific tensions drive significant arms trade with <strong style={{ color: "#A895C0" }}>Saudi Arabia</strong>, <strong style={{ color: "#A895C0" }}>Israel</strong>, <strong style={{ color: "#A895C0" }}>Turkey</strong>, <strong style={{ color: "#A895C0" }}>Japan</strong>, <strong style={{ color: "#A895C0" }}>South Korea</strong>, and <strong style={{ color: "#A895C0" }}>Taiwan</strong>.
        </p>
      
        <p style={{ fontSize: "1.4em", margin: "1.5em 0 0.8em", color: "#e74c3c", fontWeight: "bold", borderBottom: "2px solid #e74c3c", paddingBottom: "0.2em" }}>
          Impact of Geopolitical Events
        </p>
      
        <p style={{ marginBottom: "1.2em" }}>
          <strong>Russia-Ukraine Conflict</strong>: The conflict reshapes trade, with Western nations backing Ukraine and <strong style={{ color: "#CD5C5C" }}>Russia</strong> facing sanctions.
        </p>
      
        <p style={{ marginBottom: "1.2em" }}>
          <strong>Great Power Competition</strong>: <strong style={{ color: "#4682B4" }}>U.S.</strong>-<strong style={{ color: "#FFD700" }}>China</strong> competition redefines global alliances, with the <strong style={{ color: "#4682B4" }}>U.S.</strong> fortifying Indo-Pacific ties and <strong style={{ color: "#FFD700" }}>China</strong> expanding its influence.
        </p>    
      </>
    ),

    "emerging-threats": (
      <>
        <p style={{ marginBottom: "1.5em" }}>
          <span style={{ color: '#4682B4', fontWeight: 'bold' }}>The United States</span> strengthens regional defense by empowering allies, reducing the need for an extensive U.S. military presence. Equipped with advanced weaponry from the U.S., allies like <span style={{ color: '#A895C0', fontWeight: 'bold' }}>Taiwan</span>, <span style={{ color: '#A895C0', fontWeight: 'bold' }}>Japan</span>, <span style={{ color: '#A895C0', fontWeight: 'bold' }}>South Korea</span>, and the <span style={{ color: '#A895C0', fontWeight: 'bold' }}>Philippines</span> bolster their capabilities to counter regional threats independently. This <em style={{ color: 'orange', fontWeight: 'bold' }}>Building Partner Capacity</em> strategy has become even more significant amid rising South China Sea tensions, where U.S. support to countries like the <span style={{ color: '#A895C0', fontWeight: 'bold' }}>Philippines</span>, <span style={{ color: '#A895C0', fontWeight: 'bold' }}>Malaysia</span>, <span style={{ color: '#A895C0', fontWeight: 'bold' }}>Brunei</span>, and <span style={{ color: '#A895C0', fontWeight: 'bold' }}>Indonesia</span> is crucial in deterring China's territorial ambitions.
        </p>

        <p style={{ fontSize: "1.4em", margin: "1.5em 0 0.8em", color: "#e74c3c", fontWeight: "bold", borderBottom: "2px solid #e74c3c", paddingBottom: "0.2em" }}>
          The Geopolitical Chessboard
        </p>
        
        <p style={{ marginBottom: "1.5em" }}>
          The containment strategy is illustrated through a network of U.S.-supported countries stretching from Northeast to Southeast Asia, forming a defensive line around <span style={{ color: '#FFD700', fontWeight: 'bold' }}>China</span> in the Pacific. Anchoring the northern flank, <span style={{ color: '#A895C0', fontWeight: 'bold' }}>Japan</span>, <span style={{ color: '#A895C0', fontWeight: 'bold' }}>South Korea</span>, and <span style={{ color: '#A895C0', fontWeight: 'bold' }}>Taiwan</span> serve as critical points, while Southeast Asian allies like the <span style={{ color: '#A895C0', fontWeight: 'bold' }}>Philippines</span> and <span style={{ color: '#A895C0', fontWeight: 'bold' }}>Malaysia</span> solidify the southern edge. These countries, strategically positioned and equipped through U.S. arms transfers, establish a robust containment ring, countering <span style={{ color: '#FFD700', fontWeight: 'bold' }}>China</span>’s influence across the region.
        </p>

        <p style={{ fontSize: "1.4em", margin: "1.5em 0 0.8em", color: "#e74c3c", fontWeight: "bold", borderBottom: "2px solid #e74c3c", paddingBottom: "0.2em" }}>
          Exploring the Arms Trade Dynamic
        </p>
        
        <p style={{ marginBottom: "1.5em" }}>
          To explore this dynamic, use the Choropleth Map and Pie Chart to examine key years when South China Sea tensions escalated. By selecting years like <em style={{ color: 'orange', fontWeight: 'bold' }}>2010-2020</em>, you can observe a noticeable rise in U.S. arms imports by Asian allies and an increase in total arms trade in the Asia-Oceania region. This interactive view reveals the correlation between heightened regional disputes and the strategic arms support provided by the <span style={{ color: '#4682B4', fontWeight: 'bold' }}>U.S.</span>
        </p>
      </>
    ),

    "profiting-from-tensions": (
      <>
        <p style={{ marginBottom: "1.5em" }}>
          The global arms trade is a powerful economic force, generating massive revenue, especially during geopolitical tensions. Major powers like the <span style={{ color: "#4682B4" }}>United States</span>, <span style={{ color: "#DC143C" }}>Russia</span>, and <span style={{ color: "#FFDB58" }}>China</span> strategically use arms exports to strengthen influence and alliances. The <span style={{ color: "#4682B4" }}>U.S.</span> supports allies in <span style={{ fontStyle: "italic" }}>Europe, the Middle East, and Asia-Pacific</span> to counter rivals, while <span style={{ color: "#DC143C" }}>Russia</span> and <span style={{ color: "#FFDB58" }}>China</span> build influence in <span style={{ fontStyle: "italic" }}>Eastern Europe, Central Asia, and Africa</span>. This distribution bolsters alliances and drives substantial profits for defense contractors as demand rises.
        </p>

        <p style={{ marginBottom: "1.5em" }}>
          Since the Cold War, the arms trade has evolved into a multipolar competition. While the <span style={{ color: "#4682B4" }}>U.S.</span> remains dominant, its share has decreased from 69.45% in 2010 to 55.95% in 2022, as <span style={{ color: "#FFDB58" }}>China</span> rapidly expanded to capture 24.74% of the market. European and Russian shares have declined, reflecting China’s rising influence and ambition to challenge Western defense markets.
        </p>

        <p style={{ marginBottom: "1.5em" }}>
          Defense industries benefit immensely, with geopolitical conflicts boosting demand for advanced systems, driving innovation, and fueling growth. Thus, the global arms trade serves both economic and strategic purposes, enabling superpowers to advance interests, stabilize allies, and counter rivals through targeted arms exports.
        </p>
      </>
    ),

    conclusion: (
      <>
        <p style={{ marginBottom: "1.5em" }}>
          The global arms trade underscores the <span style={{ color: "#4682B4" }}>United States</span>' strategic approach to maintaining dominance, countering adversaries, and advancing national interests. Through targeted arms exports, the <span style={{ color: "#4682B4" }}>U.S.</span> fortifies alliances and builds military capabilities in regions of strategic importance, particularly in <span style={{ fontStyle: "italic" }}>Europe, the Middle East, and the Asia-Pacific</span>. By equipping allies, the <span style={{ color: "#4682B4" }}>U.S.</span> not only strengthens its influence but also deters aggression from rivals like <span style={{ color: "#DC143C" }}>Russia</span> and <span style={{ color: "#FFDB58" }}>China</span>.
        </p>

        <p style={{ marginBottom: "1.5em" }}>
          This approach enables the <span style={{ color: "#4682B4" }}>United States</span> to project power globally and support stability, using arms transfers as a means of reinforcing international order aligned with American interests. As <span style={{ color: "#FFDB58" }}>China</span> and <span style={{ color: "#DC143C" }}>Russia</span> expand their influence through arms exports, the <span style={{ color: "#4682B4" }}>U.S.</span> adapts its strategies to contain these adversaries and uphold its leadership position.
        </p>

        <p style={{ marginBottom: "1.5em" }}>
          Ultimately, the <span style={{ color: "#4682B4" }}>U.S.</span> arms trade serves as a multifaceted tool of diplomacy, economic support, and military reinforcement, advancing a vision of stability and security that aligns with national interests. By strategically directing its arms exports, the <span style={{ color: "#4682B4" }}>United States</span> continues to shape a global landscape that supports its long-term objectives and counterbalances the ambitions of its rivals.
        </p>              
      </>
    )
  };

  // Function to toggle between MigrationMap and ForceDirectedGraph views
  const toggleAllianceSection = () => {
    setIsNetworkView(!isNetworkView);
  };

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1>Arming for Stability: U.S. Strategy Through Global Arms Trade</h1>
      </header>

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

      <aside className="narrative-box">
        <h3>{sectionTitles[activeSection]}</h3>
        {narrativeContent[activeSection]}
      </aside>

      <main className="content-area">
        {activeSection === "intro" && (
          <section id="intro" className="large-section">
            <div className="stacked-maps">
              {/* Include DefenseExpenditure map in Introduction */}
              <DefenseExpenditure />
              {/* Removed ProportionalSymbolMap from Introduction */}
              {/* <ProportionalSymbolMap dataUrl="https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_regional_transfers.csv" selectedYear={selectedYear} /> */}
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
              <LineChart />
              {/* ChoroplethMap is still used in other sections; keep it here if needed */}
              <ChoroplethMap />
            </div>
          </section>
        )}

        {activeSection === "countering-adversaries" && (
          <section id="countering-adversaries" className="medium-section">
            {isCirclePackingView ? <ZoomableCirclePacking /> : <ParallelCoordinatesChart />}
            <button
              onClick={() => setIsCirclePackingView(!isCirclePackingView)}
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
              {isCirclePackingView ? "Back to Parallel Coordinates" : "View Circle Packing"}
            </button>
          </section>
        )}

        {activeSection === "emerging-threats" && (
          <section id="emerging-threats" className="medium-section">
            <div className="stacked-maps">
              {/* ChoroplethMap is still used in other sections; keep it here if needed */}
              <ChoroplethMap />
              <PieChart selectedYear={selectedYear} />
            </div>
          </section>
        )}

        {activeSection === "profiting-from-tensions" && (
          <section id="profiting-from-tensions" className="medium-section">
            <Treemap selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
          </section>
        )}

        {activeSection === "conclusion" && (
          <section id="conclusion" className="medium-section">           
            <div className="stacked-maps">
              <DotMap />
              <ProportionalSymbolMap dataUrl="https://raw.githubusercontent.com/nguyenlamvu88/dsci_554_arms_sales_project/main/data/processed/processed_regional_transfers.csv" selectedYear={selectedYear} />
             </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
