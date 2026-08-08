const KEY="smart-eco-platform-v2";
const defaults={
 user:null, theme:"dark", lang:"uz", onboarding:true,
 coins:740, scans:12, impact:8.4, streak:6, completed:[], coupons:[],
 notifications:true, location:false
};
export function getState(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||"null")}}catch{return defaults}}
export function setState(s){localStorage.setItem(KEY,JSON.stringify(s))}
export function clearState(){localStorage.removeItem(KEY)}
