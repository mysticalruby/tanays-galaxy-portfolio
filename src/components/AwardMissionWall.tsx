"use client";
import { useId, useState, type CSSProperties } from "react";
import type { Award } from "@/types/content";
import styles from "./AwardMissionWall.module.css";

function category(a: Award) {
  if (a.constellation.startsWith("Mathematical")) return "Mathematics";
  if (a.constellation.startsWith("Engineering")) return "Engineering";
  if (a.constellation.startsWith("Leadership")) return "Community";
  return "Personal achievement";
}
function label(a: Award) {
  if(a.id.startsWith("hanmadang")) return a.id.includes("team") ? "HANMADANG · ELITE TEAM" : "HANMADANG · INDIVIDUAL";
  if(a.id.startsWith("mtfc")) return a.id.includes("cra") ? "MTFC · CLIMATE RESILIENCE" : a.id.includes("semi") ? "MTFC · SEMIFINALS" : "MTFC · NATIONAL FINALS";
  const labels: Record<string,string> = {
    "purple-comet-1st":"PURPLE COMET", "m3c-top-20":"MATHWORKS · M3C", "acsl-finals-bronze":"ACSL · SENIOR FINALS",
    "first-leadership":"FIRST · LEADERSHIP", "nyt-ai-top-20":"NYT · GROWING UP WITH AI", "himcm-meritorious":"HiMCM · COMAP",
    "imc-prosperity-top-25":"IMC · PROSPERITY", "maml-finalist":"MAML · FINALS", "wocomal-top5-varsity":"WOCOMAL · VARSITY",
    "wocomal-4th-freshman":"WOCOMAL · FRESHMAN", "chess-nathanael-green-1st":"NATHANAEL GREENE · CHESS",
    "jhu-cty-grand":"JOHNS HOPKINS · CTY", "chess-ne-scholastic-1st":"NEW ENGLAND · CHESS", "chess-mass-state-2nd":"STATE · CHESS",
    "pvsa-gold-3x":"VOLUNTEER SERVICE · GOLD", "usmo-podium-7x":"U.S. MASTERS OPEN", "mathcon-national":"MATHCON · NATIONAL FINALS",
    "science-olympiad-fermi":"SCIENCE OLYMPIAD · FERMI", "taekwondo-2nd-dan":"KUKKIWON · SECOND DAN",
    "mams-tournament":"MAMS · MATH TOURNAMENT", "chess-uscf-td":"USCF · TOURNAMENT DIRECTOR"
  };
  return labels[a.id] ?? a.organization.toUpperCase();
}
function Patch({award:a}:{award:Award}) {
  const uid=useId().replace(/:/g,"");
  const field=category(a);
  const shield=field==="Engineering"||field==="Community";
  return <svg viewBox="0 0 220 220" aria-hidden="true" className={styles.patch}>
    <defs><path id={uid+"arc"} d="M29 111A81 81 0 0 1 191 111"/><pattern id={uid+"weave"} width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 0L5 5M5 0L0 5" stroke="currentColor" strokeWidth=".4" opacity=".18"/></pattern></defs>
    {shield?<path d="M110 9L199 42V123Q197 173 110 211Q23 173 21 123V42Z" fill="#111820" stroke="currentColor" strokeWidth="5"/>:<circle cx="110" cy="110" r="101" fill="#111820" stroke="currentColor" strokeWidth="5"/>}
    {shield?<path d="M110 17L191 48V122Q190 168 110 201Q30 168 29 122V48Z" fill={"url(#"+uid+"weave)"} stroke="currentColor" strokeDasharray="2 4"/>:<circle cx="110" cy="110" r="94" fill={"url(#"+uid+"weave)"} stroke="currentColor" strokeDasharray="2 4"/>}
    <circle cx="110" cy="111" r="64" fill="#080c11" stroke="currentColor" strokeWidth="1.5"/>
    <text fontSize="11" letterSpacing="1" fill="currentColor" className={styles.arcText}><textPath href={"#"+uid+"arc"} startOffset="50%" textAnchor="middle">{label(a)}</textPath></text>
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {field==="Mathematics"?<><ellipse cx="110" cy="110" rx="45" ry="18" transform="rotate(-35 110 110)"/><ellipse cx="110" cy="110" rx="45" ry="18" transform="rotate(35 110 110)"/><path d="M110 66V154M66 110H154" opacity=".35"/><circle cx="110" cy="110" r="7" fill="currentColor"/></>:field==="Engineering"?<><path d="M98 128V90L110 70L122 90V128ZM98 112L86 136L98 130M122 112L134 136L122 130M103 137L110 153L117 137"/><circle cx="110" cy="97" r="5"/><path d="M64 143Q110 165 155 80" opacity=".45"/></>:field==="Community"?<><circle cx="110" cy="87" r="10"/><circle cx="82" cy="103" r="8"/><circle cx="138" cy="103" r="8"/><path d="M91 133V120Q110 102 129 120V133M65 138V125Q80 111 91 123M155 138V125Q140 111 129 123M72 150H148"/></>:a.id.includes("chess")?<><path d="M88 144H137L131 134H94ZM98 132V115L91 109L99 84L117 73L113 86L130 96L136 112L118 107L111 117V132"/><circle cx="119" cy="96" r="1.5" fill="currentColor"/></>:<><path d="M110 71L121 96L148 99L128 117L134 145L110 131L86 145L92 117L72 99L99 96Z"/><path d="M80 72L70 88M140 72L150 88"/></>}
    </g>
    <rect x="52" y="155" width="116" height="20" rx="4" fill="#080c11"/>
    <text x="110" y="166" dominantBaseline="middle" style={{textAnchor:"middle",fontFamily:"var(--font-mono-family), monospace"}} fill="currentColor" fontSize="11" letterSpacing=".5">{a.year??"Undated"}</text>
  </svg>;
}
function years(a:Award){return (a.year?.match(/\d{4}/g)??[]).map(Number);}
function lastYear(a:Award){return Math.max(0,...years(a));}
export function AwardMissionWall({awards}:{awards:Award[]}) {
  const [selected,setSelected]=useState<string|null>(null);
  const [tracking,setTracking]=useState(true);
  const allYears=awards.flatMap(years);
  const latest=Math.max(...allYears),earliest=Math.min(...allYears);
  const sorted=[...awards].sort((a,b)=>b.rarity-a.rarity || lastYear(b)-lastYear(a));
  return <section className={styles.console} aria-label="Awards mission patch wall">
    <header className={styles.header}><h2>Mission patches</h2><button className={styles.toggle} aria-pressed={tracking} onClick={()=>setTracking(!tracking)}>Tracking {tracking?"on":"paused"} <span aria-hidden="true">●</span></button></header>
    <div className={styles.wallHeading}><p>Rarer awards first · Amber / ice blue / slate</p></div>
    <ul className={styles.grid+" "+(!tracking?styles.paused:"")}>
    {sorted.map((a,index)=>{
      const active=selected===a.id;
      // This is a decorative recency indicator, not a ranking of award prestige.
      const strength=Math.round(46+48*(lastYear(a)-earliest)/Math.max(1,latest-earliest));
      return <li key={a.id} className={styles.item} style={{"--patch-color":a.rarity>=.8?"#D8AA6A":a.rarity>=.65?"#8DBCD4":"#A3AFBD","--delay":index*.19+"s"} as CSSProperties}>
      <button id={"patch-"+a.id} className={styles.patchButton+" "+(active?styles.active:"")} aria-expanded={active} aria-controls={"log-"+a.id} onClick={()=>setSelected(active?null:a.id)}>
      <span className={styles.missionCode}>{category(a)}</span><Patch award={a}/><span className={styles.awardName}>{a.name}</span><span className={styles.organization}>{a.organization} · {a.year}</span>
      <span className={styles.signal} aria-hidden="true"><span className={styles.linkLine} aria-hidden="true"/><span className={styles.bars} aria-hidden="true">{[1,2,3,4,5].map(n=><i key={n} style={{height:n*3+"px",opacity:n<=Math.ceil(strength/20)?1:.2}}/>)}</span> <span aria-hidden="true">{active?"−":"+"}</span></span>
      </button>
      <div id={"log-"+a.id} hidden={!active} className={styles.detail}>
      <h4>{a.name}</h4><p>{a.description}</p><dl><div><dt>Organization</dt><dd>{a.organization}</dd></div><div><dt>Date</dt><dd>{a.year??"Not recorded"}</dd></div><div><dt>Category</dt><dd>{category(a)}</dd></div></dl>{!a.verified&&<p>Details to be verified.</p>}<button onClick={()=>{setSelected(null);document.getElementById("patch-"+a.id)?.focus();}}>Close log ↑</button>
      </div></li>;
    })}
    </ul>
  </section>;
}
