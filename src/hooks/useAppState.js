import {useMemo,useState} from "react";
import {getState,setState as persist} from "../lib/store";
export function useAppState(){
 const [state,setRaw]=useState(getState);
 const setState=next=>setRaw(prev=>{const value=typeof next==="function"?next(prev):{...prev,...next};persist(value);return value});
 return [state,setState];
}
export const fmt=n=>new Intl.NumberFormat("uz-UZ").format(n);
