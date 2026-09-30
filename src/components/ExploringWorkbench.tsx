"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { BookOpen, Box, Check, ChevronRight, ExternalLink, FileText, FolderOpen, Grip, RotateCcw, X, Zap } from "lucide-react";
import exploringContent from "../../content/exploring.json";
import styles from "./ExploringWorkbench.module.css";

type CellState = "done" | "update" | "attention";
type Cell = { label: string; view: string; description: string; status: CellState };
type System = { id: string; name: string; cells: Cell[]; x: number; y: number };
const viewNames = Object.fromEntries(exploringContent.topics.map(t => [t.id, t.label]));
type TopicDetails = (typeof exploringContent.topics)[number];
const topicDetails: Record<string, TopicDetails> = Object.fromEntries(exploringContent.topics.map(topic => [topic.id, topic]));
const references: Record<string, { label: string; url: string }> = {
  openrocket: { label: "OpenRocket tutorials", url: "https://openrocket.info/tutorials/" },
  fem: { label: "Ansys mesh convergence reference", url: "https://ansyshelp.ansys.com/public/Views/Secured/corp/v252/en/wb_sim/ds_Convergence.html" },
  matlab: { label: "MATLAB getting started", url: "https://www.mathworks.com/help/matlab/getting-started-with-matlab.htm" },
  gis: { label: "QGIS training manual", url: "https://documentation.qgis.org/3.22/pdf/en/QGIS-3.22-TrainingManual-en.pdf" },
};
const groups = [
  { id: "A", name: "Physics & Simulation", x: 36, y: 40, topics: ["computational-physics", "fem", "multiphysics"], labels: ["Computational Physics", "Finite Element Method", "Multiphysics Modeling"] },
  { id: "B", name: "Design & Engineering", x: 330, y: 40, topics: ["cad", "openrocket", "circuit-design"], labels: ["CAD / 3D Modeling", "OpenRocket", "Circuit Design"] },
  { id: "C", name: "Computing & Analysis", x: 624, y: 40, topics: ["matlab", "data-viz"], labels: ["MATLAB", "Data Visualization"] },
  { id: "D", name: "Other Explorations", x: 330, y: 340, topics: ["arduino", "gis", "latex", "cooking"], labels: ["Arduino", "GIS", "LaTeX", "Cooking"] },
];
const systems: System[] = groups.flatMap(g => g.topics.map((view, i) => ({ view, name: g.labels[i] }))).map((topic, i) => ({
  id: String.fromCharCode(65+i), name: topic.name, x: 36+(i%3)*294, y: 40+Math.floor(i/3)*210,
  cells: [
    { label: "Overview", view: topic.view, description: topicDetails[topic.view].overview, status: "done" },
    { label: "Learning", view: topic.view, description: topicDetails[topic.view].learning, status: "update" },
    { label: "Next Steps", view: topic.view, description: topicDetails[topic.view].nextSteps, status: "attention" },
  ],
}));
const canvasHeight = 40+Math.ceil(systems.length/3)*210+100;
const stateLabels: Record<CellState, string> = { done: "Done / Up to Date", update: "Needs Update", attention: "Needs Attention" };
function StatusGlyph({ status }: { status: CellState }) {
  return <span role="img" aria-label={stateLabels[status]} title={stateLabels[status]} className={styles["state_"+status]}>
    {status === "done" ? <Check size={16} strokeWidth={3} aria-hidden="true"/> : status === "update" ? <Zap size={16} fill="currentColor" strokeWidth={1} aria-hidden="true"/> : <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4.5 4.5C4.5.5 12 .5 12 4.5c0 2.5-4 2.5-4 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/><circle cx="8" cy="13" r="1.3" fill="currentColor"/></svg>}
  </span>;
}
type Endpoint = { system: string; cell: number };
type Connection = { from: Endpoint; to: Endpoint };
const initialConnections: Connection[] = [];
function sameCell(a: Endpoint, b: Endpoint) { return a.system === b.system && a.cell === b.cell; }
const initialPositions = Object.fromEntries(systems.map(s => [s.id, { x: s.x, y: s.y }]));

export function ExploringWorkbench() {
  const [cellStates, setCellStates] = useState<Record<string, CellState>>({});
  const [selection, setSelection] = useState({ system: "A", cell: 0 });
  const [activeTab, setActiveTab] = useState<string>("project");
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [positions, setPositions] = useState(initialPositions);
  const [visibleSystems, setVisibleSystems] = useState<string[]>([]);
  const [showToolbox, setShowToolbox] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [showFiles, setShowFiles] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [connections, setConnections] = useState(initialConnections);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!contextMenu) return;
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    const dismiss = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setContextMenu(null);
    };
    const cancel = (event: Event) => { if (!menuRef.current?.contains(event.target as Node)) setContextMenu(null); };
    document.addEventListener("pointerdown", dismiss);
    window.addEventListener("resize", cancel);
    window.addEventListener("scroll", cancel, true);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("resize", cancel);
      window.removeEventListener("scroll", cancel, true);
    };
  }, [contextMenu]);
  function showMenu(target: Endpoint, x: number, y: number) {
    setSelection(target);
    setContextMenu({ x: Math.max(8, Math.min(x, window.innerWidth - 278)), y: Math.max(8, Math.min(y, window.innerHeight - 340)) });
  }
  function closeMenu() {
    cellRefs.current[selection.system + "-" + selection.cell]?.focus();
    setContextMenu(null);
  }
  function removeSystem(id: string) {
    setVisibleSystems(ids => ids.filter(value => value !== id));
    setConnections(links => links.filter(link => link.from.system !== id && link.to.system !== id));
    setMessage("System removed. Restore it from the Toolbox.");
  }
  const system = systems.find(s => s.id === selection.system)!;
  const cell = system.cells[selection.cell];
  const selectedState = cellStates[system.id+"-"+selection.cell] || cell.status;
  const hasSelection = visibleSystems.includes(selection.system);
  const schematicHeight = Math.max(660, ...visibleSystems.map(id => positions[id].y + 240));

  function open(view: string) {
    setMessage("");
    setContextMenu(null);
    setOpenTabs(tabs => tabs.includes(view) ? tabs : [...tabs, view]);
    setActiveTab(view);
  }
  function addSystem(id: string) {
    if (!systems.some(s => s.id === id)) return;
    if (!visibleSystems.includes(id)) setPositions(p => ({ ...p, [id]: { x: 36+(visibleSystems.length%3)*294, y: 40+Math.floor(visibleSystems.length/3)*210 } }));
    setVisibleSystems(ids => ids.includes(id) ? ids : [...ids, id]);
    setMessage("");
    setSelection({ system: id, cell: 0 });
    setActiveTab("project");
  }
  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    if (!systems.some(s => s.id === id)) return;
    addSystem(id);
    const rect = event.currentTarget.getBoundingClientRect();
    setPositions(p => ({ ...p, [id]: {
      x: Math.max(12, Math.min(684, event.clientX - rect.left - 110)),
      y: Math.max(24, Math.min(canvasHeight - 230, event.clientY - rect.top - 24)),
    } }));
  }
  function reset() {
    setConnections(initialConnections);
    setMessage("Schematic cleared. Add an exploration from the Toolbox.");
    setContextMenu(null);
    setPositions(initialPositions);
    setVisibleSystems([]);
    setOpenTabs([]);
    setSelection({ system: "A", cell: 0 });
    setActiveTab("project");
  }

  return (
    <section id="main-content" className={styles.workbench} aria-label="Currently Exploring Workbench">
      <div className={styles.titlebar}><Box size={17} /><h1>Tanay Mangal — Currently Exploring Workbench</h1><button className={styles.helpButton} onClick={() => setShowHelp(v => !v)} aria-label="How to use the Workbench" title="How to use the Workbench" aria-expanded={showHelp} aria-controls="workbench-help">?</button></div>
      <div className={styles.menubar}>
        <details><summary>File</summary><div className={styles.menu}><a href="/resume">Open résumé</a><a href="https://users.wpi.edu/~tmangal/" target="_blank" rel="noopener noreferrer">Open school website <ExternalLink size={13}/></a></div></details>
        <details><summary>View</summary><div className={styles.menu}><label><input type="checkbox" checked={showToolbox} onChange={e => setShowToolbox(e.target.checked)}/> Toolbox</label><label><input type="checkbox" checked={showProperties} onChange={e => setShowProperties(e.target.checked)}/> Properties</label><label><input type="checkbox" checked={showFiles} onChange={e => setShowFiles(e.target.checked)}/> Files</label></div></details>
        <details><summary>Tools</summary><div className={styles.menu}><button onClick={reset}>Reset schematic layout</button><button disabled={!hasSelection} onClick={() => open(cell.view)}>Open selected cell</button></div></details>
        <button onClick={() => setShowHelp(v => !v)} aria-expanded={showHelp}>Help</button>
      </div>
      <div className={styles.toolbar}>
        <button disabled={!hasSelection} onClick={() => open(cell.view)}><FolderOpen size={16}/> Open cell</button>
        <button onClick={reset}><RotateCcw size={15}/> Reset layout</button>
        <button onClick={() => setShowFiles(v => !v)} aria-pressed={showFiles}><FileText size={15}/> Project files</button>
        <button disabled={!hasSelection} onClick={e => { const r = e.currentTarget.getBoundingClientRect(); showMenu(selection, r.left, r.bottom + 4); }} aria-haspopup="menu">Cell actions</button>
        <span>Select a cell to inspect it. Double-click to open. Right-click for cell actions.</span>
      </div>
      <div className={styles.intro}><p>{exploringContent.supporting}</p><span>Each block is one exploration. Overview checks mean the topic is listed, not that I have finished learning it. Learning is ongoing, and Next Steps are things I want to try, not things I have already finished.</span><div className={styles.legend}><span><StatusGlyph status="done"/> Done / Up to Date</span><span><StatusGlyph status="update"/> Needs Update</span><span><StatusGlyph status="attention"/> Needs Attention</span></div></div>
      {showHelp && <div id="workbench-help" className={styles.help}><div><h2>How to use the Workbench</h2><ol><li>Drag an exploration from the Toolbox on the left into the empty Project Schematic. You can also click its name to add it, including on mobile.</li><li>Drag the block&apos;s title bar to move it around.</li><li>Click a numbered cell to inspect its Properties. Double-click it or press Enter to open its topic.</li><li>Right-click a cell for connections and other actions. On mobile, select a cell and use Cell actions in the toolbar.</li></ol><p>Reset layout clears the schematic so you can start again.</p></div><button onClick={() => setShowHelp(false)} aria-label="Close help"><X size={15}/></button></div>}
      <div className={styles.layout} data-toolbox={showToolbox} style={{ gridTemplateColumns: `${showToolbox ? "180px " : ""}minmax(0, 1fr)${showProperties ? " 250px" : ""}` }}>
        {showToolbox && <aside className={styles.toolbox} aria-label="Toolbox"><div className={styles.paneTitle}>Toolbox</div>
          <details open><summary>Exploration Systems</summary>{systems.map(s => <div key={s.id} className={styles.toolItem} draggable onDragStart={e => e.dataTransfer.setData("text/plain", s.id)}><button onClick={() => addSystem(s.id)} onDoubleClick={() => open(s.cells[0].view)}><Box size={15}/>{s.name}</button><button onClick={() => { addSystem(s.id); open(s.cells[0].view); }} aria-label={`Open ${s.name}`}><ChevronRight size={14}/></button></div>)}</details>
          <details open><summary>External Resources</summary><Link href="/experience"><BookOpen size={15}/> Project portfolio</Link><a href="/resume"><FileText size={15}/> Résumé</a><a href="https://users.wpi.edu/~tmangal/" target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/> School website</a></details>
          <p>Drag or select a system to add it to the Project Schematic.</p>
        </aside>}
        <div className={styles.workspace}>
          <div className={styles.tabs} aria-label="Open workspaces">
            <button className={activeTab === "project" ? styles.activeTab : ""} aria-pressed={activeTab === "project"} onClick={() => setActiveTab("project")}>Project</button>
            {openTabs.map(view => <div key={view} className={activeTab === view ? styles.activeTab : ""}><button aria-pressed={activeTab === view} onClick={() => setActiveTab(view)}>{viewNames[view]}</button><button aria-label={`Close ${viewNames[view]} tab`} onClick={() => { setOpenTabs(t => t.filter(v => v !== view)); if (activeTab === view) setActiveTab("project"); }}><X size={12}/></button></div>)}
          </div>
          <div className={styles.paneTitle}>{activeTab === "project" ? "Project Schematic" : viewNames[activeTab]}</div>
          {activeTab === "project" ? <div className={styles.canvasScroll}><div className={styles.canvas} style={{ minHeight: schematicHeight }} onDragOver={e => e.preventDefault()} onDrop={drop}>
            {visibleSystems.length === 0 && <div className={styles.emptySchematic}><h2>Start your schematic</h2><p>Drag an exploration from the Toolbox into this space, or click its name to add it.</p><p>Need a hand? Use the ? button at the top right.</p></div>}
            <svg className={styles.connections} viewBox={"0 0 930 "+schematicHeight} style={{ height: schematicHeight }} aria-label="Connections between exploring topics">
              {connections.filter(link => visibleSystems.includes(link.from.system) && visibleSystems.includes(link.to.system)).map((link, i) => {
                const from = positions[link.from.system], to = positions[link.to.system];
                const forward = to.x > from.x;
                const x1 = from.x + (forward ? 220 : 0), y1 = from.y + 48 + link.from.cell * 32;
                const x2 = to.x + (forward ? 0 : 220), y2 = to.y + 48 + link.to.cell * 32;
                const bend = forward ? 50 : -50;
                return <path key={i} className={i % 2 ? styles.transfer : ""} d={"M "+x1+" "+y1+" C "+(x1+bend)+" "+y1+", "+(x2-bend)+" "+y2+", "+x2+" "+y2}/>;
              })}
            </svg>
            {systems.filter(s => visibleSystems.includes(s.id)).map(s => <article key={s.id} className={styles.system} style={{ left: positions[s.id].x, top: positions[s.id].y }} aria-label={`System ${s.id}: ${s.name}`}>
              <div className={styles.systemLetter}>{s.id}</div>
              <div className={styles.systemHeader} draggable onDragStart={e => e.dataTransfer.setData("text/plain", s.id)}><span className={styles.number}>1</span><Box size={14}/><span>{s.name}</span><Grip size={13}/><button aria-label={`Remove ${s.name} from schematic`} onClick={() => removeSystem(s.id)}><X size={13}/></button></div>
              {s.cells.map((c, i) => <button key={c.label} className={`${styles.cell} ${selection.system === s.id && selection.cell === i ? styles.selectedCell : ""}`} ref={node => { cellRefs.current[s.id+"-"+i] = node; }} aria-haspopup="menu" onContextMenu={e => { e.preventDefault(); showMenu({ system: s.id, cell: i }, e.clientX, e.clientY); }} aria-label={`${s.id}${i+2} ${c.label}`} aria-pressed={selection.system === s.id && selection.cell === i} onClick={() => { setMessage(""); setContextMenu(null); setSelection({ system: s.id, cell: i }); }} onDoubleClick={() => open(c.view)} onKeyDown={e => { if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) { e.preventDefault(); const r = e.currentTarget.getBoundingClientRect(); showMenu({ system: s.id, cell: i }, r.left, r.bottom); } if(e.key === "Enter") { e.preventDefault(); open(c.view); } }}><span className={styles.number}>{i+2}</span><FileText size={13}/><span>{c.label}</span><StatusGlyph status={cellStates[s.id+"-"+i] || c.status}/></button>)}
              <p className={styles.systemCaption}>{s.name}</p>
            </article>)}
            <div className={styles.parameterBar}><span className="font-mono">P</span><span>Portfolio resources</span><Link href="/experience">Projects <ExternalLink size={12}/></Link><a href="/resume">Résumé <ExternalLink size={12}/></a></div>
          </div></div> : <div className={styles.editor} aria-label={`${viewNames[activeTab]} content`}><h2>{viewNames[activeTab]}</h2><p className={styles.progressNote}>First few tutorials completed · Still exploring</p><div className={styles.topicArticle}><section><h3>What this is about</h3><p>{topicDetails[activeTab].overview}</p></section><section><h3>Where I am with it</h3><p>{topicDetails[activeTab].learning}</p></section><section><h3>What I want to try next</h3><p>{topicDetails[activeTab].nextSteps}</p></section></div>{references[activeTab] && <p className="mb-8 text-sm text-text-muted">Reference: <a href={references[activeTab].url} target="_blank" rel="noopener noreferrer" className="text-blue underline">{references[activeTab].label}</a></p>}<div className={styles.topicList}><h3>Other explorations</h3>{systems.filter(s => s.cells[0].view !== activeTab).map(s => <button key={s.id} onClick={() => open(s.cells[0].view)}><FileText size={15}/>{s.name}</button>)}</div><Link href="/experience" className="text-blue underline">See my projects</Link></div>}
        </div>
        {showProperties && (hasSelection ? <aside className={styles.properties} aria-label="Properties"><div className={styles.paneTitle}>Properties of {system.id}{selection.cell+2}: {cell.label}</div><table><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>System</td><td>{system.name}</td></tr><tr><td>Cell</td><td>{cell.label}</td></tr><tr><td>Workspace</td><td>{viewNames[cell.view]}</td></tr><tr><td>Status</td><td><StatusGlyph status={selectedState}/> {stateLabels[selectedState]}</td></tr></tbody></table><div className={styles.details}><h2>{cell.label}</h2><p>{cell.description}</p><button onClick={() => open(cell.view)}><FolderOpen size={15}/> Open {viewNames[cell.view]}</button></div></aside> : <aside className={styles.properties} aria-label="Properties"><div className={styles.paneTitle}>Properties</div><div className={styles.details}><p>No cell selected. Add an exploration and select a numbered cell to inspect it.</p></div></aside>)}
      </div>
      {showFiles && <div className={styles.files}><div className={styles.paneTitle}>Files</div><table><thead><tr><th>Name</th><th>Type</th><th>Location</th></tr></thead><tbody><tr><td>School assignments & profile</td><td>Website</td><td><a href="https://users.wpi.edu/~tmangal/" target="_blank" rel="noopener noreferrer">users.wpi.edu/~tmangal/</a></td></tr><tr><td>Project portfolio</td><td>Workspace</td><td><Link href="/experience">Open experience</Link></td></tr><tr><td>Résumé</td><td>Document</td><td><a href="/resume">Open résumé</a></td></tr></tbody></table></div>}

      {contextMenu && <div ref={menuRef} role="menu" aria-label={"Actions for "+cell.label} className={styles.contextMenu} style={{ left: contextMenu.x, top: contextMenu.y }} onContextMenu={e => e.preventDefault()} onKeyDown={e => {
        if (e.key === "Escape") { e.preventDefault(); closeMenu(); }
        if (e.key === "Tab") setContextMenu(null);
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') || []).filter(item => item.getClientRects().length > 0);
          const current = items.indexOf(document.activeElement as HTMLButtonElement);
          items[(current + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
        }
      }}>
        <div className={styles.menuHeading}>{system.id}{selection.cell+2}: {cell.label}</div>
        <button role="menuitem" onClick={() => open(cell.view)}>Open topic</button>
        <details><summary>Set cell state (preview)</summary><div role="group" aria-label="Preview cell states">{(["done", "update", "attention"] as CellState[]).map(status => <button role="menuitem" key={status} onClick={() => { setCellStates(values => ({ ...values, [system.id+"-"+selection.cell]: status })); setMessage("Preview state: "+stateLabels[status]+". Changes last until this page is reloaded."); closeMenu(); }}><StatusGlyph status={status}/>{stateLabels[status]}</button>)}</div></details>
        <button role="menuitem" onClick={() => { setShowProperties(true); setMessage("Showing properties for "+cell.label+"."); closeMenu(); }}>Properties</button>
        <details><summary>Connect to…</summary><div role="group" aria-label="Connection targets">{systems.filter(s => visibleSystems.includes(s.id)).flatMap(s => s.cells.map((c, i) => ({ system: s.id, cell: i, label: s.name+" / "+c.label }))).filter(target => !sameCell(target, selection)).map(target => <button key={target.system+"-"+target.cell} role="menuitem" onClick={() => {
          setConnections(links => links.some(link => (sameCell(link.from, selection) && sameCell(link.to, target)) || (sameCell(link.to, selection) && sameCell(link.from, target))) ? links : [...links, { from: selection, to: { system: target.system, cell: target.cell } }]);
          setMessage("Connected "+cell.label+" to "+target.label+"."); closeMenu();
        }}>{target.system}{target.cell+2} · {target.label}</button>)}</div></details>
        <button role="menuitem" disabled={!connections.some(link => sameCell(link.from, selection) || sameCell(link.to, selection))} onClick={() => { setConnections(links => links.filter(link => !sameCell(link.from, selection) && !sameCell(link.to, selection))); setMessage("Disconnected "+cell.label+"."); closeMenu(); }}>Disconnect cell</button>
        <button role="menuitem" onClick={() => { setPositions(p => ({ ...p, [system.id]: initialPositions[system.id] })); setMessage("Reset system position."); closeMenu(); }}>Reset system position</button>
        <button role="menuitem" onClick={() => { removeSystem(system.id); setContextMenu(null); }}>Remove system from schematic</button>
        <button role="menuitem" onClick={closeMenu}>Close menu</button>
      </div>}
      <div className={styles.statusbar} role="status"><Check size={13}/><span>{message || (activeTab === "project" ? (hasSelection ? `${visibleSystems.length} systems · Selected ${system.id}${selection.cell+2}: ${cell.label}` : `${visibleSystems.length} systems · Add an exploration from the Toolbox`) : `Opened ${viewNames[activeTab]}`)}</span></div>
    </section>
  );
}
