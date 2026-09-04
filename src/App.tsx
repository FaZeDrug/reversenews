import {FormEvent,useEffect,useRef,useState} from "react";
import {demoStory} from "./demoStory";
import type {Story} from "./types";

const prompts=["OpenAI launches ChatGPT","Apple announces Vision Pro","Nvidia becomes the world's most valuable company"];
const loadingCopy=["Investigating today’s headline","Finding the immediate trigger","Tracing the story to its origin","Verifying every source"];

export default function App(){
 const [headline,setHeadline]=useState(""); const [story,setStory]=useState<Story|null>(null); const [loading,setLoading]=useState(false); const [step,setStep]=useState(0); const [error,setError]=useState(""); const [audioUrl,setAudioUrl]=useState(""); const [audioLoading,setAudioLoading]=useState(false); const timelineRef=useRef<HTMLElement>(null);
 useEffect(()=>{if(!loading)return;const id=setInterval(()=>setStep(s=>Math.min(s+1,3)),1250);return()=>clearInterval(id)},[loading]);
 useEffect(()=>()=>{if(audioUrl)URL.revokeObjectURL(audioUrl)},[audioUrl]);
 async function investigate(e:FormEvent,selected=headline){e.preventDefault();const query=selected.trim();if(!query)return;setHeadline(query);setLoading(true);setStep(0);setError("");setStory(null);setAudioUrl("");try{const r=await fetch("/api/research",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({headline:query})});const data=await r.json();if(!r.ok)throw new Error(data.error||"Research failed");setStory(data);setTimeout(()=>timelineRef.current?.scrollIntoView({behavior:"smooth"}),100)}catch(err){setError(err instanceof Error?err.message:"Something went wrong.")}finally{setLoading(false)}}
 function loadDemo(){setHeadline(demoStory.headline);setStory(demoStory);setError("");setTimeout(()=>timelineRef.current?.scrollIntoView({behavior:"smooth"}),100)}
 async function narrate(){if(!story)return;setAudioLoading(true);setError("");try{const r=await fetch("/api/narrate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:story.narrationScript})});if(!r.ok){const data=await r.json();throw new Error(data.error||"Narration failed")}const blob=await r.blob();if(audioUrl)URL.revokeObjectURL(audioUrl);setAudioUrl(URL.createObjectURL(blob))}catch(err){setError(err instanceof Error?err.message:"Narration failed.")}finally{setAudioLoading(false)}}
 return <main>
  <nav className="nav"><a className="wordmark" href="#top"><span>R</span> REVERSE NEWS</a><small>EVIDENCE-BACKED CONTEXT</small></nav>
  <section className="hero" id="top"><div className="eyebrow"><i/> THE STORY BEFORE THE STORY</div><h1>Every headline<br/>has a <em>history.</em></h1><p>Enter today’s news. We’ll trace the evidence backward to the moments that made it possible.</p>
   <form className="search" onSubmit={investigate}><label htmlFor="headline">TODAY’S HEADLINE</label><div><input id="headline" value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="e.g. OpenAI announces a new device" autoComplete="off"/><button disabled={loading||!headline.trim()}>{loading?"TRACING…":"TRACE IT BACK"} <b>↘</b></button></div></form>
   <div className="examples"><span>TRY A HEADLINE</span>{prompts.map(p=><button key={p} onClick={e=>investigate(e,p)}>{p}</button>)}</div><button className="demo-link" onClick={loadDemo}>Or open the guaranteed demo story →</button>
  </section>
  {loading&&<section className="loading"><div className="radar"><span/></div><p>{loadingCopy[step]}…</p><div className="track"><span style={{width:`${(step+1)*25}%`}}/></div></section>}
  {error&&<div className="error">{error} <button onClick={loadDemo}>Open demo instead</button></div>}
  {story&&<section className="story" ref={timelineRef}><header><div><span className="kicker">HOW DID WE GET HERE?</span><h2>{story.headline}</h2><p>{story.dek}</p></div><aside><span className={`mode ${story.mode}`}>{story.mode==="live"?"● LIVE RESEARCH":"DEMO STORY"}</span>{!audioUrl&&<button className="narrate" onClick={narrate} disabled={audioLoading}>{audioLoading?"GENERATING…":"▶  PLAY THE STORY"}</button>}{audioUrl&&<audio src={audioUrl} controls autoPlay/>}</aside></header>
   <div className="timeline">{story.events.map((item,index)=><article className="event" key={item.date+item.title}><div className="number">{String(index+1).padStart(2,"0")}</div><div className="dot"><span/></div><div className="card"><time>{index===0?"TODAY · ":""}{item.date}</time><h3>{item.title}</h3><p>{item.description}</p>{index<story.events.length-1&&<div className="because"><b>BECAUSE</b> {item.causalLink}</div>}<a href={item.sourceUrl} target="_blank" rel="noreferrer">Evidence: {item.sourceName} ↗</a></div></article>)}</div><footer><span>THE ORIGIN</span><p>History doesn’t repeat. It accumulates.</p></footer>
  </section>}
 </main>
}
