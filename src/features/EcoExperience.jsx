import React, {useState} from "react";
import {createCoinBurst, showToast} from "../lib/ecoEffects";
import "../styles/premium-eco.css";

export default function EcoExperience() {
  const [coins, setCoins] = useState(1280);
  const [streak, setStreak] = useState(7);

  const earn = (amount=25) => {
    setCoins(v => v + amount);
    setStreak(v => Math.min(v + 1, 30));
    createCoinBurst({amount, origin:{x:window.innerWidth/2,y:window.innerHeight*.42}});
    showToast("Eco-Coin qo‘shildi", `Balansingiz +${amount} ga oshdi.`);
  };

  return (
    <section style={{maxWidth:1100,margin:"0 auto",padding:"32px 20px",fontFamily:"Inter,system-ui,sans-serif"}}>
      <div style={{display:"grid",gridTemplateColumns:"1.3fr .7fr",gap:18}}>
        <div className="card" style={{padding:28,border:"1px solid var(--eco-line)",borderRadius:28,background:"linear-gradient(145deg,rgba(18,42,33,.9),rgba(8,24,17,.88))"}}>
          <div style={{fontSize:12,letterSpacing:".16em",color:"var(--eco-mint)",textTransform:"uppercase"}}>Smart Eco / Live Impact</div>
          <h2 style={{fontSize:"clamp(32px,5vw,64px)",lineHeight:.98,margin:"16px 0 12px"}}>Har bir skan — o‘lchanadigan ekologik ta’sir.</h2>
          <p style={{color:"var(--eco-muted)",maxWidth:620,lineHeight:1.7}}>QR orqali chiqindini topshiring, Eco-Coin oling, streak yig‘ing va real ekologik natijangizni ko‘ring.</p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:24}}>
            <button onClick={()=>earn(25)} style={{border:0,borderRadius:16,padding:"13px 18px",fontWeight:800,cursor:"pointer",background:"linear-gradient(135deg,var(--eco-lime),var(--eco-mint))",color:"#071410"}}>+25 Eco-Coin olish</button>
            <button onClick={()=>showToast("Scan tayyor","Kamerani ochish uchun Scan bo‘limiga o‘ting.")} style={{border:"1px solid var(--eco-line)",borderRadius:16,padding:"13px 18px",fontWeight:700,cursor:"pointer",background:"rgba(255,255,255,.035)",color:"var(--eco-text)"}}>QR Scan</button>
          </div>
        </div>
        <div style={{display:"grid",gap:18}}>
          <Metric label="Eco-Coin" value={coins.toLocaleString()} suffix=" ECO"/>
          <Metric label="Streak" value={streak} suffix=" kun"/>
        </div>
      </div>
    </section>
  );
}
function Metric({label,value,suffix}) {
 return <div className="card" style={{padding:24,border:"1px solid var(--eco-line)",borderRadius:24,background:"var(--eco-glass)"}}>
   <div style={{color:"var(--eco-muted)",fontSize:13}}>{label}</div>
   <div style={{fontSize:38,fontWeight:850,marginTop:10}}>{value}<small style={{fontSize:12,color:"var(--eco-mint)",marginLeft:7}}>{suffix}</small></div>
 </div>
}
