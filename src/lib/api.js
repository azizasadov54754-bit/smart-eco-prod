const API=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'');
const TOKEN_KEY='smart-eco-token';
export const auth={get:()=>localStorage.getItem(TOKEN_KEY),set:t=>localStorage.setItem(TOKEN_KEY,t),clear:()=>localStorage.removeItem(TOKEN_KEY)};
async function request(path, options={}){
 const headers={'Content-Type':'application/json',...(options.headers||{})};
 const token=auth.get(); if(token) headers.Authorization=`Bearer ${token}`;
 const res=await fetch(`${API}${path}`,{...options,headers});
 if(!res.ok) throw new Error((await res.text())||`API ${res.status}`);
 return res.status===204?null:res.json();
}
export const api={
 health:()=>request('/api/health'),
 register:data=>request('/api/auth/register',{method:'POST',body:JSON.stringify(data)}),
 login:phone=>request('/api/auth/login',{method:'POST',body:JSON.stringify({phone,otp:'0000'})}),
 me:()=>request('/api/me'),
 updateProfile:data=>request('/api/me',{method:'PUT',body:JSON.stringify(data)}),
 bins:()=>request('/api/bins'),
 scan:(bin_code,nonce)=>request('/api/scans',{method:'POST',body:JSON.stringify({bin_code,nonce})}),
 leaderboard:()=>request('/api/leaderboard'),
 adminOverview:()=>request('/api/admin/overview')
};
export async function safeApi(fn,fallback){try{return await fn()}catch{return fallback}}
