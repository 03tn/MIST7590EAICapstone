import { useEffect,useState } from "react";
import Workspace from "./Workspace";
import { connected,supabase } from "./lib/data";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";

export default function App(){
  const[ready,setReady]=useState(!connected),[signedIn,setSignedIn]=useState(!connected);
  useEffect(()=>{if(!supabase)return;supabase.auth.getSession().then(({data})=>{setSignedIn(Boolean(data.session));setReady(true)});const {data}=supabase.auth.onAuthStateChange((_e,s)=>setSignedIn(Boolean(s)));return()=>data.subscription.unsubscribe()},[]);
  useEffect(()=>{const signOut=(event:MouseEvent)=>{const link=(event.target as HTMLElement).closest('a[href^="/signout-with-chatgpt"]');if(!link)return;event.preventDefault();if(supabase)supabase.auth.signOut();else{localStorage.removeItem("calder-demo-v1");location.reload()}};document.addEventListener("click",signOut);return()=>document.removeEventListener("click",signOut)},[]);
  if(!ready)return <div className="loading"><div className="loader"/><p>Preparing Calder workspace…</p></div>;
  if(!signedIn)return <SignIn/>;
  return <Workspace/>;
}

function SignIn(){const[email,setEmail]=useState(""),[password,setPassword]=useState(""),[name,setName]=useState(""),[createMode,setCreateMode]=useState(false),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
  const submit=async()=>{setBusy(true);setMessage("");const result=createMode?await supabase!.auth.signUp({email,password,options:{data:{full_name:name}}}):await supabase!.auth.signInWithPassword({email,password});setMessage(result.error?.message||(createMode?"Account created with Submitter access. An administrator must assign any additional permissions.":"Signed in."));setBusy(false)};
  return <main className="auth-page"><section className="auth-card"><div className="brand-mark">C</div><h1>Calder Agreement Review</h1><p>{createMode?"Create your organization profile.":"Sign in with your organization account."}</p>{createMode&&<><Label>Full name</Label><Input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/><span className="field-help">All new accounts begin as Submitters. Only an Administrator can change role permissions.</span></>}<Label>Email</Label><Input type="email" value={email} onChange={e=>setEmail(e.target.value)}/><Label>Password</Label><Input type="password" value={password} onChange={e=>setPassword(e.target.value)}/><Button disabled={busy||!email||!password||(createMode&&!name)} onClick={submit}>{busy?"Please wait…":createMode?"Create account":"Sign in"}</Button><Button variant="outline" disabled={busy} onClick={()=>{setCreateMode(!createMode);setMessage("")}}>{createMode?"Back to sign in":"Create an account"}</Button>{message&&<small>{message}</small>}</section></main>}
