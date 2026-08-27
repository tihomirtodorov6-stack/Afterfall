import "./style.css";
export default function App() {
  return (
    <main style={{background:"#0a0e13", minHeight:"100vh", color:"white", padding:"20px", fontFamily:"Arial"}}>
      <h1>AFTERFALL - NEW HOPE</h1>
      <p>Build fixed! Сега ще добавяме новия дизайн.</p>
      <div style={{marginTop:"20px", background:"#1a242f", padding:"15px", borderRadius:"8px"}}>
        <div>💰 Gold: 829963</div>
        <div>🌾 Food: 1.7M</div>
        <div>⛏️ Metal: 4.8M</div>
        <div>🛢️ Fuel: 474366</div>
        <div>⚡ Power: 28,949,348</div>
      </div>
      <button style={{marginTop:"20px", padding:"12px 24px", background:"#ffcc00", color:"black", border:"none", fontWeight:"bold"}}>CITY</button>
      <button style={{marginLeft:"8px", padding:"12px 24px", background:"#1a242f", color:"white", border:"1px solid #2a3a4a"}}>WORLD MAP</button>
    </main>
  );
} 