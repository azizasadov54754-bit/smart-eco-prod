import {useCallback,useEffect,useMemo,useState} from "react";import {Bell,Menu,Search,X} from "lucide-react";import {useAppState} from "./hooks/useAppState";import {t} from "./lib/i18n";import {clearState} from "./lib/store";import Logo from "./components/Logo";import Sidebar from "./components/Sidebar";import MobileNav from "./components/MobileNav";import Toast from "./components/Toast";import QRScanner from "./components/QRScanner";import Onboarding from "./components/Onboarding";import Home from "./pages/Home";import MapPage from "./pages/MapPage";import Rewards from "./pages/Rewards";import Profile from "./pages/Profile";import Leader from "./pages/Leader";import Events from "./pages/Events";import Settings from "./pages/Settings";import {bins} from "./data/data";import {api,auth} from "./lib/api";import {createCoinBurst,showToast} from "./lib/ecoEffects";
export default function App(){
 const [state,setState]=useAppState(),[active,setActive]=useState("home"),[scanner,setScanner]=useState(false),[toast,setToast]=useState(null),[notice,setNotice]=useState(false);
 const T=useMemo(()=>({home:t(state.lang,"home"),map:t(state.lang,"map"),scan:t(state.lang,"scan"),rewards:t(state.lang,"rewards"),profile:t(state.lang,"profile"),settings:t(state.lang,"settings"),leader:t(state.lang,"leader"),events:t(state.lang,"events"),coins:t(state.lang,"coins"),streak:t(state.lang,"streak"),impact:t(state.lang,"impact"),scans:t(state.lang,"scans"),missions:t(state.lang,"missions"),search:t(state.lang,"search")}),[state.lang]);
 useEffect(()=>{document.documentElement.dataset.theme=state.theme;document.documentElement.lang=state.lang},[state.theme,state.lang]);
 const toastIt=useCallback((message,type="success")=>setToast({message,type}),[]);
 const go=useCallback(id=>{if(id==="scan"){setScanner(true);return}setActive(id)},[]);
 const finish=async user=>{
   try{
     const [first_name,...rest]=String(user.name||'').trim().split(/\s+/); const last_name=rest.join(' ')||'User';
     const r=await api.register({phone:user.phone||'+998000000000',first_name:first_name||'Eco',last_name});
     auth.set(r.token); user={...user,id:r.user.id,name:`${r.user.first_name} ${r.user.last_name}`,phone:r.user.phone,initials:`${r.user.first_name[0]||''}${r.user.last_name[0]||''}`.toUpperCase()};
     setState(s=>({...s,user,onboarding:false,coins:r.user.eco_coins,streak:r.user.streak})); toastIt("Profilingiz tayyor. Smart Eco'ga xush kelibsiz!");
   }catch(e){setState(s=>({...s,user,onboarding:false}));toastIt("Demo rejim yoqildi — server bilan ulanish kutilmoqda.","info")}
 };
 if(state.onboarding||!state.user)return <Onboarding finish={finish}/>;
 const scan=async code=>{
   const id=String(code).toUpperCase().trim(); setScanner(false);
   try{
     const r=await api.scan(id,`${crypto.randomUUID()}-${Date.now()}`);
     setState(s=>({...s,coins:r.eco_coins,scans:s.scans+1,impact:+(s.impact+.7).toFixed(1),streak:r.streak}));
     createCoinBurst({amount:r.reward,origin:{x:window.innerWidth/2,y:window.innerHeight*.42}}); showToast("Eco-Coin olindi",`+${r.reward} Eco-Coin hisobingizga qo‘shildi.`);
   }catch(e){
     const bin=bins.find(b=>id.includes(String(b.id))); setState(s=>({...s,coins:s.coins+25,scans:s.scans+1,impact:+(s.impact+.7).toFixed(1),streak:s.streak+1}));
     createCoinBurst({amount:25,origin:{x:window.innerWidth/2,y:window.innerHeight*.42}}); showToast("Demo reward",`${bin?.id||id} • +25 Eco-Coin`);
   }
 };
 const pages={home:<Home state={state} go={go} T={T}/>,map:<MapPage go={go} T={T}/>,rewards:<Rewards state={state} setState={setState} T={T} toast={toastIt}/>,profile:<Profile state={state} setState={setState} T={T} toast={toastIt}/>,leader:<Leader state={state} T={T}/>,events:<Events T={T} toast={toastIt}/>,settings:<Settings toast={toastIt}/>};
 return <div className="platform"><Sidebar active={active} go={go} labels={T}/><div className="workspace"><header className="desktop-top"><Logo/><div className="top-actions"><button onClick={()=>setNotice(v=>!v)} className="notify"><Bell/><i/></button><button className="top-user" onClick={()=>go("profile")}><span>{state.user.initials}</span><b>{state.user.name}</b></button></div>{notice&&<div className="notice-panel"><b>Bildirishnomalar</b><p>Bugun 2 ta Eco-Coin bonusini olishingiz mumkin.</p><p>Smart Bin #003 91% to‘ldi.</p></div>}</header><main>{pages[active]||pages.home}</main></div><MobileNav active={active} go={go} labels={T}/>{scanner&&<QRScanner close={()=>setScanner(false)} detected={scan}/>}<Toast item={toast} close={()=>setToast(null)}/></div>
}