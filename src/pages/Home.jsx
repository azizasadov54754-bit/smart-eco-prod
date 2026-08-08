import {ArrowUpRight,Flame,Leaf,ScanLine,Sparkles,Trophy,Zap} from "lucide-react";import {challenges} from "../data/data";import {fmt} from "../hooks/useAppState";
export default function Home({state,go,T}){
 return <div className="page home"><header className="mobile-head"><div className="mobile-brand">◒ <b>SMART <i>ECO</i></b></div><button className="avatar" onClick={()=>go("profile")}>{state.user?.initials||"ME"}</button></header>
 <section className="hero"><div className="eyebrow"><span/> SMART CAMPUS • LIVE</div><h1>Yaxshi odatni<br/><em>o‘yinga aylantiring.</em></h1><p>Har bir Smart Bin skani campusni toza va sizni bir qadam oldinda qiladi.</p><button className="primary-btn" onClick={()=>go("scan")}><ScanLine/> Smart Bin skanerlash <ArrowUpRight/></button></section>
 <section className="metric-grid"><Metric icon={<Sparkles/>} label={T.coins} value={fmt(state.coins)} note="+90 bugun"/><Metric icon={<Flame/>} label={T.streak} value={`${state.streak} kun`} note="🔥 davom eting"/><Metric icon={<Leaf/>} label={T.impact} value={`${state.impact} kg`} note="♻ chiqindi"/><Metric icon={<Zap/>} label={T.scans} value={state.scans} note="bu oy"/></section>
 <div className="section-title"><div><span>BUGUN</span><h2>{T.missions}</h2></div><button onClick={()=>go("rewards")}>Barchasi <ArrowUpRight size={15}/></button></div>
 <div className="challenge-grid">{challenges.map(c=><article className="challenge" key={c.id}><div className="challenge-icon">{c.icon==="scan"?<ScanLine/>:c.icon==="leaf"?<Leaf/>:<Trophy/>}</div><div><b>{c.title}</b><div className="bar"><i style={{width:`${Math.min(100,c.progress/c.target*100)}%`}}/></div><small>{c.progress}/{c.target} • +{c.reward} ✦</small></div></article>)}</div>
 <article className="impact-card"><div><span>GREEN IMPACT</span><b>Campus bugun <em>1,284 kg</em> chiqindi saraladi.</b><small>Sizning hissangiz: {state.impact} kg</small></div><Sparkles/></article>
 </div>
}
function Metric({icon,label,value,note}){return <div className="metric"><div className="metric-icon">{icon}</div><small>{label}</small><b>{value}</b><span>{note}</span></div>}
