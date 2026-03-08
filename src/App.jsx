import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";

// ─── HELPERS ────────────────────────────────────────────────────────────────
const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str + "T00:00:00");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function getMonth(str) { return str ? new Date(str+"T00:00:00").getMonth() : -1; }
function uid() { return Math.random().toString(36).slice(2); }

const FAMILY_COLORS = [
  { bg:"#E8F4FD", text:"#1A5276", border:"#AED6F1" },
  { bg:"#FEF9E7", text:"#7D6608", border:"#F9E79F" },
  { bg:"#EAFAF1", text:"#1D6A39", border:"#A9DFBF" },
  { bg:"#FDEDEC", text:"#78281F", border:"#F5B7B1" },
  { bg:"#F4ECF7", text:"#512E5F", border:"#D2B4DE" },
];
function familyColor(name) {
  if (!name) return FAMILY_COLORS[0];
  let h = 0;
  for (let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))%FAMILY_COLORS.length;
  return FAMILY_COLORS[h];
}

function equityStatus(familias) {
  const active = familias.filter(f=>f.activa);
  if (!active.length) return { label:"Sin datos", color:"#888" };
  const avg = active.reduce((s,f)=>s+f.participaciones_totales,0)/active.length;
  const maxDiff = Math.max(...active.map(f=>Math.abs(f.participaciones_totales-avg)));
  if (maxDiff<=1) return { label:"Equilibrado",     color:"#27AE60" };
  if (maxDiff<=2) return { label:"Leve diferencia", color:"#F39C12" };
  return               { label:"Desbalance",        color:"#E74C3C" };
}

function slotsUsed(s) {
  let n=0;
  if(s.familia1_id)n++;
  if(s.familia2_id)n++;
  if(s.familia3_id)n++;
  return n;
}
function addFamilyToSlot(sem, famId, famName) {
  const s = {...sem};
  if(!s.familia1_id){s.familia1_id=famId;s.familia1_nombre=famName;}
  else if(!s.familia2_id){s.familia2_id=famId;s.familia2_nombre=famName;}
  else if(!s.familia3_id){s.familia3_id=famId;s.familia3_nombre=famName;}
  return s;
}

// ─── AUSENCIA ALGORITHM ─────────────────────────────────────────────────────
function calcularAusencia(famId, fechaAusencia, allSemanas, allFamilias) {
  const absFam = allFamilias.find(f=>f.id===famId);
  if (!absFam) return null;
  const today = new Date().toISOString().slice(0,10);
  const shortName = n => n.replace("Familia ","");
  const absName = shortName(absFam.nombre);

  let newSemanas = allSemanas.map(s => {
    if (s.fecha !== fechaAusencia) return s;
    const ausentes = [...(s.ausentes_ids||[])];
    if (!ausentes.includes(famId)) ausentes.push(famId);
    return {...s, ausentes_ids: ausentes};
  });

  const candidates = newSemanas.filter(s =>
    !s.bloqueado && s.fecha > today && s.fecha !== fechaAusencia &&
    ![s.familia1_id,s.familia2_id,s.familia3_id].includes(famId)
  );

  if (!candidates.length) {
    const newFamilias = allFamilias.map(f =>
      f.id===famId ? {...f, ausencias:(f.ausencias||0)+1} : f
    );
    return {
      updatedSemanas: newSemanas, updatedFamilias: newFamilias,
      historialEntry: {
        tipo_cambio:"ausencia", familia_anterior_id:famId,
        familia_anterior_nombre:absName, familia_nueva_nombre:null,
        fecha_turno:fechaAusencia, deuda_pendiente:true,
        descripcion:`Ausencia de ${absName} el ${formatDate(fechaAusencia)}. Sin semanas futuras — deuda pendiente.`,
      },
      resultMsg:`Sin semanas futuras disponibles. Deuda de ${absName} registrada.`,
    };
  }

  const withOpen = candidates.filter(s=>slotsUsed(s)<3);
  const twoSlot  = withOpen.filter(s=>slotsUsed(s)===2);
  const pool     = twoSlot.length>0 ? twoSlot : (withOpen.length>0 ? withOpen : candidates);
  pool.sort((a,b)=>a.fecha.localeCompare(b.fecha));
  const targetWeek = pool[0];
  const slots = slotsUsed(targetWeek);

  newSemanas = newSemanas.map(s =>
    s.id===targetWeek.id ? addFamilyToSlot(s, famId, absName) : s
  );

  const newFamilias = allFamilias.map(f =>
    f.id===famId ? {...f, ausencias:(f.ausencias||0)+1} : f
  );

  const slotLabel = slots===2 ? "3ra familia" : `${slots+1}ta familia`;
  return {
    updatedSemanas: newSemanas, updatedFamilias: newFamilias,
    targetWeekId: targetWeek.id,
    targetWeekData: newSemanas.find(s=>s.id===targetWeek.id),
    historialEntry: {
      tipo_cambio:"ausencia", familia_anterior_id:famId,
      familia_anterior_nombre:absName, familia_nueva_nombre:null,
      fecha_turno:fechaAusencia, fecha_compensacion:targetWeek.fecha,
      descripcion:`Ausencia de ${absName} el ${formatDate(fechaAusencia)}. Compensación: ${formatDate(targetWeek.fecha)} como ${slotLabel}.`,
    },
    resultMsg:`Ausencia registrada. ${absName} asignada el ${formatDate(targetWeek.fecha)} como ${slotLabel}.`,
  };
}

// ─── ICONS ──────────────────────────────────────────────────────────────────
const Icon = ({ d, size=16, color="currentColor", strokeWidth=1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d)?d.map((p,i)=><path key={i} d={p}/>):<path d={d}/>}
  </svg>
);
const Icons = {
  calendar:"M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  users:   ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75","M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  arrows:  "M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4",
  ban:     ["M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"],
  history: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M12 7v5l4 2",
  chart:   ["M18 20V10","M12 20V4","M6 20v-6"],
  plus:    "M12 5v14M5 12h14",
  edit:    "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:   ["M3 6h18","M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"],
  x:       "M18 6 6 18M6 6l12 12",
  check:   "M20 6 9 17l-5-5",
  search:  ["M21 21l-4.35-4.35","M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"],
  menu:    ["M3 12h18","M3 6h18","M3 18h18"],
  user:    ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  import:  ["M12 3v12","M8 11l4 4 4-4","M20 21H4"],
  lock:    ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z","M7 11V7a5 5 0 0 1 10 0v4"],
  alert:   ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"],
  clock:   ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 6v6l4 2"],
  loader:  "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
};

// ─── PRIMITIVES ─────────────────────────────────────────────────────────────
const Badge = ({ children, color="#E8F4FD", textColor="#1A5276", border="#AED6F1", style={} }) => (
  <span style={{ background:color, color:textColor, border:`1px solid ${border}`, padding:"2px 10px", borderRadius:99, fontSize:12, fontWeight:600, letterSpacing:"0.02em", whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:4, ...style }}>{children}</span>
);

const Btn = ({ children, onClick, variant="primary", size="md", disabled=false, style={} }) => {
  const sizes = { sm:{padding:"5px 12px",fontSize:13}, md:{padding:"8px 18px",fontSize:14}, lg:{padding:"11px 24px",fontSize:15} };
  const variants = {
    primary:   {background:"#1A3A5C",color:"#fff",border:"none"},
    secondary: {background:"#F0F4F8",color:"#1A3A5C",border:"1px solid #CBD5E1"},
    danger:    {background:"#FDF2F2",color:"#C0392B",border:"1px solid #F5B7B1"},
    ghost:     {background:"transparent",color:"#1A3A5C",border:"none"},
  };
  return <button style={{ borderRadius:8, cursor:disabled?"not-allowed":"pointer", fontFamily:"inherit", fontWeight:600, transition:"all 0.15s", display:"inline-flex", alignItems:"center", gap:6, opacity:disabled?0.5:1, ...sizes[size], ...variants[variant], ...style }} onClick={onClick} disabled={disabled}>{children}</button>;
};

const Input = ({ value, onChange, placeholder, type="text", style={} }) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{ width:"100%", padding:"9px 13px", borderRadius:8, border:"1.5px solid #CBD5E1", fontFamily:"inherit", fontSize:14, color:"#1A3A5C", background:"#fff", outline:"none", boxSizing:"border-box", ...style }}/>
);

const Select = ({ value, onChange, options, placeholder, style={} }) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{ width:"100%", padding:"9px 13px", borderRadius:8, border:"1.5px solid #CBD5E1", fontFamily:"inherit", fontSize:14, color:value?"#1A3A5C":"#94A3B8", background:"#fff", outline:"none", boxSizing:"border-box", ...style }}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Card = ({ children, style={} }) => (
  <div style={{ background:"#fff", borderRadius:14, border:"1px solid #E2EAF4", boxShadow:"0 1px 6px rgba(0,0,0,0.05)", padding:24, ...style }}>{children}</div>
);

const Modal = ({ open, onClose, title, children, width=480 }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,28,46,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:width, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", overflow:"hidden" }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid #E2EAF4", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontWeight:700, fontSize:17, color:"#1A3A5C" }}>{title}</span>
          <button onClick={onClose} style={{ border:"none", background:"none", cursor:"pointer", color:"#64748B", padding:4 }}><Icon d={Icons.x} size={18}/></button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
};

const Spinner = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:64, flexDirection:"column", gap:16 }}>
    <div style={{ width:36, height:36, border:"3px solid #E2EAF4", borderTop:"3px solid #1A3A5C", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <span style={{ color:"#94A3B8", fontSize:14, fontWeight:600 }}>Cargando…</span>
  </div>
);

const ToastStack = ({ toasts }) => (
  <div style={{ position:"fixed", bottom:24, right:24, zIndex:2000, display:"flex", flexDirection:"column", gap:10 }}>
    {toasts.map(t=>(
      <div key={t.id} style={{ background:t.type==="error"?"#C0392B":"#1A3A5C", color:"#fff", padding:"12px 20px", borderRadius:10, fontSize:14, fontWeight:600, boxShadow:"0 4px 20px rgba(0,0,0,0.2)", minWidth:280, display:"flex", alignItems:"center", gap:10 }}>
        <Icon d={t.type==="error"?Icons.x:Icons.check} size={15} color="#fff"/>
        {t.message}
      </div>
    ))}
  </div>
);

function FamilyBadge({ name, absent=false }) {
  if (!name) return <span style={{ color:"#CBD5E1" }}>—</span>;
  const col = familyColor(name);
  if (absent) return (
    <span title="Faltó sin avisar" style={{ background:"#FEF2F2", color:"#94A3B8", border:"1px dashed #FECACA", padding:"2px 10px", borderRadius:99, fontSize:12, fontWeight:600, whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:5, textDecoration:"line-through", textDecorationColor:"#E74C3C", textDecorationThickness:2 }}>
      <Icon d={Icons.alert} size={11} color="#E74C3C" strokeWidth={2.2}/>{name}
    </span>
  );
  return <Badge color={col.bg} textColor={col.text} border={col.border}>{name}</Badge>;
}

// ─── EMAILJS CONFIG ──────────────────────────────────────────────────────────
const EMAILJS_SERVICE  = "service_t8z9tg2";
const EMAILJS_TEMPLATE = "template_2e0xwll";
const EMAILJS_KEY      = "fx8koe6zjiUo8SAuW";

// ─── CALENDARIO ─────────────────────────────────────────────────────────────
function Calendario({ semanas, familias, periodos, reload, addToast }) {
  const [monthFilter, setMonthFilter] = useState(null);
  const [showGen, setShowGen]         = useState(false);
  const [genDate, setGenDate]         = useState(new Date().toISOString().slice(0,10));
  const [generating, setGenerating]   = useState(false);
  const [sending, setSending]         = useState(false);
  const today = new Date().toISOString().slice(0,10);
  const filtered = monthFilter===null ? semanas : semanas.filter(s=>getMonth(s.fecha)===monthFilter);

  // Encuentra la semana próxima (la más cercana al día de hoy hacia adelante)
  function getNextWeek() {
    return semanas
      .filter(s => !s.bloqueado && s.fecha >= today)
      .sort((a,b) => a.fecha.localeCompare(b.fecha))[0] || null;
  }

  async function sendReminders() {
    const nextWeek = getNextWeek();
    if (!nextWeek) { addToast("No hay semana próxima para recordar","error"); return; }

    const slots = [
      { id: nextWeek.familia1_id, nombre: nextWeek.familia1_nombre },
      { id: nextWeek.familia2_id, nombre: nextWeek.familia2_nombre },
      { id: nextWeek.familia3_id, nombre: nextWeek.familia3_nombre },
    ].filter(s => s.id);

    if (!slots.length) { addToast("La semana próxima no tiene familias asignadas","error"); return; }

    // Formato de fecha legible
    const fechaTexto = formatDate(nextWeek.fecha);

    setSending(true);
    let enviados = 0;
    let errores  = 0;

    for (const slot of slots) {
      const familia = familias.find(f => f.id === slot.id);
      if (!familia) continue;

      const emails = [familia.email, familia.email2].filter(Boolean);
      if (!emails.length) { errores++; continue; }

      for (const email of emails) {
        try {
          const res = await fetch(`https://api.emailjs.com/api/v1.0/email/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              service_id:  EMAILJS_SERVICE,
              template_id: EMAILJS_TEMPLATE,
              user_id:     EMAILJS_KEY,
              template_params: {
                email,
                nombre:  slot.nombre,
                fecha:   fechaTexto,
              }
            })
          });
          if (res.ok) enviados++;
          else errores++;
        } catch { errores++; }
      }
    }

    setSending(false);
    if (enviados > 0) addToast(`✉️ ${enviados} recordatorio${enviados>1?"s":""} enviado${enviados>1?"s":""}`);
    if (errores  > 0) addToast(`${errores} email${errores>1?"s":""} sin dirección o con error`,"error");
  }

  async function generateCalendar() {
    setGenerating(true);
    try {
      const start   = new Date(genDate+"T00:00:00");
      const year    = start.getFullYear();
      const yearEnd = new Date(year,11,31);
      let d         = new Date(start);
      while(d.getDay()!==5) d.setDate(d.getDate()+1);
      const fridays = [];
      while(d<=yearEnd){ fridays.push(new Date(d)); d.setDate(d.getDate()+7); }

      const active = familias.filter(f=>f.activa);
      if(active.length<3){ addToast("Se necesitan al menos 3 familias activas","error"); setGenerating(false); return; }

      // Delete all existing semanas
      await supabase.from("semanas").delete().neq("id","00000000-0000-0000-0000-000000000000");

      const stats = {};
      active.forEach(f=>{ stats[f.id]={total:0,monthCount:{},lastWeek:-999}; });

      const rows = fridays.map((fri,idx)=>{
        const dateStr = fri.toISOString().slice(0,10);
        const month   = fri.getMonth();
        const blocked = periodos.some(p=>p.activo&&dateStr>=p.fecha_inicio&&dateStr<=p.fecha_fin);
        if(blocked) return {fecha:dateStr,numero_semana:idx+1,anio:year,bloqueado:true,ausentes_ids:[]};

        const scores = active.map(f=>{ const s=stats[f.id]; const c=(idx-s.lastWeek)<=1?1000:0; return {f,score:s.total*100+(s.monthCount[month]||0)*50-(idx-s.lastWeek)*2+c}; });
        scores.sort((a,b)=>a.score-b.score);
        const chosen = scores.slice(0,3).map(s=>s.f);
        chosen.forEach(f=>{ stats[f.id].total++; stats[f.id].monthCount[month]=(stats[f.id].monthCount[month]||0)+1; stats[f.id].lastWeek=idx; });
        const sn = n=>n.replace("Familia ","");
        return { fecha:dateStr, numero_semana:idx+1, anio:year, bloqueado:false, ausentes_ids:[],
          familia1_id:chosen[0].id, familia1_nombre:sn(chosen[0].nombre),
          familia2_id:chosen[1].id, familia2_nombre:sn(chosen[1].nombre),
          familia3_id:chosen[2].id, familia3_nombre:sn(chosen[2].nombre) };
      });

      // Insert in batches of 20
      for(let i=0;i<rows.length;i+=20){
        const { error } = await supabase.from("semanas").insert(rows.slice(i,i+20));
        if(error) throw error;
      }

      // Update family stats
      for(const f of active){
        const s = stats[f.id];
        await supabase.from("familias").update({
          participaciones_totales: s.total,
          participaciones_por_mes: s.monthCount,
        }).eq("id",f.id);
      }

      await reload();
      setShowGen(false);
      addToast(`Calendario generado: ${rows.length} semanas`);
    } catch(e) {
      addToast("Error al generar: "+e.message,"error");
    }
    setGenerating(false);
  }

  async function rebalancear() {
    const today2 = new Date().toISOString().slice(0,10);
    const past   = semanas.filter(s=>s.fecha<=today2);
    const future = semanas.filter(s=>s.fecha>today2&&!s.bloqueado);
    const active = familias.filter(f=>f.activa);
    if(!active.length) return;

    const stats = {};
    active.forEach(f=>{ stats[f.id]={total:0,monthCount:{},lastWeek:-999}; });
    past.filter(s=>!s.bloqueado).forEach((s,idx)=>{
      [s.familia1_id,s.familia2_id,s.familia3_id].filter(Boolean).forEach(fid=>{
        if(!stats[fid]) return;
        const month = getMonth(s.fecha);
        stats[fid].total++;
        stats[fid].monthCount[month]=(stats[fid].monthCount[month]||0)+1;
        stats[fid].lastWeek=idx;
      });
    });

    try {
      for(let i=0;i<future.length;i++){
        const s     = future[i];
        const month = getMonth(s.fecha);
        const scores = active.map(f=>{ const st=stats[f.id]; const c=(i-st.lastWeek)<=1?1000:0; return {f,score:st.total*100+(st.monthCount[month]||0)*50-(i-st.lastWeek)*2+c}; });
        scores.sort((a,b)=>a.score-b.score);
        const chosen = scores.slice(0,3).map(x=>x.f);
        chosen.forEach(f=>{ stats[f.id].total++; stats[f.id].monthCount[month]=(stats[f.id].monthCount[month]||0)+1; stats[f.id].lastWeek=i; });
        const sn = n=>n.replace("Familia ","");
        await supabase.from("semanas").update({
          familia1_id:chosen[0].id, familia1_nombre:sn(chosen[0].nombre),
          familia2_id:chosen[1].id, familia2_nombre:sn(chosen[1].nombre),
          familia3_id:chosen[2].id, familia3_nombre:sn(chosen[2].nombre),
          ausentes_ids:[],
        }).eq("id",s.id);
      }
      for(const f of active){
        const s=stats[f.id];
        await supabase.from("familias").update({participaciones_totales:s.total,participaciones_por_mes:s.monthCount}).eq("id",f.id);
      }
      await reload();
      addToast("Calendario rebalanceado");
    } catch(e){ addToast("Error: "+e.message,"error"); }
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div style={{ color:"#64748B", fontSize:14, fontWeight:600 }}>
          <span style={{ color:"#1A3A5C", fontSize:22, fontWeight:800, fontFamily:"Georgia,serif" }}>{semanas.length}</span> semanas &nbsp;·&nbsp;
          <span style={{ color:"#1A3A5C", fontSize:22, fontWeight:800, fontFamily:"Georgia,serif" }}>{familias.filter(f=>f.activa).length}</span> familias
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {semanas.length>0 && <Btn variant="secondary" size="sm" onClick={rebalancear}><Icon d={Icons.refresh} size={14}/> Rebalancear</Btn>}
          {semanas.length>0 && <Btn variant="secondary" size="sm" onClick={sendReminders} disabled={sending} style={{ color:"#1D6A39", borderColor:"#A9DFBF" }}><Icon d={Icons.check} size={14} color="#1D6A39"/> {sending?"Enviando…":"Enviar Recordatorios"}</Btn>}
          <Btn onClick={()=>setShowGen(true)}><Icon d={Icons.calendar} size={14}/> Generar Calendario</Btn>
        </div>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:14, overflowX:"auto", paddingBottom:4 }}>
        {[{label:"Todos",v:null},...MONTHS.map((m,i)=>({label:m,v:i}))].map(({label,v})=>(
          <button key={label} onClick={()=>setMonthFilter(v)} style={{ padding:"5px 14px", borderRadius:99, border:"1.5px solid", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap",
            background:monthFilter===v?"#1A3A5C":"#F8FAFC", color:monthFilter===v?"#fff":"#475569", borderColor:monthFilter===v?"#1A3A5C":"#CBD5E1" }}>{label}</button>
        ))}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, fontSize:12, color:"#94A3B8" }}>
        <FamilyBadge name="Familia" absent={true}/>
        <span>= faltó sin avisar · turno de compensación asignado automáticamente</span>
      </div>

      {semanas.length===0 ? (
        <Card style={{ textAlign:"center", padding:64 }}>
          <Icon d={Icons.calendar} size={48} color="#CBD5E1"/>
          <div style={{ marginTop:16, color:"#94A3B8", fontWeight:600, fontSize:15 }}>Sin calendario generado</div>
          <div style={{ marginTop:16 }}><Btn onClick={()=>setShowGen(true)}><Icon d={Icons.calendar} size={14}/> Generar Calendario</Btn></div>
        </Card>
      ) : (
        <Card style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#F8FAFC", borderBottom:"1.5px solid #E2EAF4" }}>
                {["#","Fecha","Familia 1","Familia 2","Familia 3"].map(h=>(
                  <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:12, fontWeight:700, color:"#94A3B8", letterSpacing:"0.05em", textTransform:"uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s=>{
                const isToday=s.fecha===today; const isPast=s.fecha<today;
                const ausIds=s.ausentes_ids||[];
                const fams=[{id:s.familia1_id,name:s.familia1_nombre},{id:s.familia2_id,name:s.familia2_nombre},{id:s.familia3_id,name:s.familia3_nombre}];
                return (
                  <tr key={s.id} style={{ borderBottom:"1px solid #F1F5F9", background:isToday?"#EBF5FB":"transparent", opacity:isPast&&!isToday?0.55:1 }}>
                    <td style={{ padding:"10px 16px", fontSize:13, color:"#94A3B8", fontWeight:700, whiteSpace:"nowrap" }}>
                      {s.numero_semana}
                      {isToday&&<Badge color="#1A3A5C" textColor="#fff" border="#1A3A5C" style={{ marginLeft:6 }}>HOY</Badge>}
                    </td>
                    <td style={{ padding:"10px 16px", fontSize:14, fontWeight:600, color:"#334155", whiteSpace:"nowrap" }}>{formatDate(s.fecha)}</td>
                    {s.bloqueado ? (
                      <td colSpan={3} style={{ padding:"10px 16px" }}>
                        <span style={{ display:"flex", alignItems:"center", gap:8, color:"#94A3B8", fontStyle:"italic", fontSize:13 }}>
                          <Icon d={Icons.lock} size={14} color="#CBD5E1"/> Periodo bloqueado
                          <Badge color="#FEF9E7" textColor="#7D6608" border="#F9E79F">Cerrado</Badge>
                        </span>
                      </td>
                    ) : fams.map((fam,fi)=>(
                      <td key={fi} style={{ padding:"10px 16px" }}>
                        <FamilyBadge name={fam.name} absent={!!(fam.id&&ausIds.includes(fam.id))}/>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={showGen} onClose={()=>setShowGen(false)} title="Generar Calendario">
        {semanas.length>0&&<div style={{ background:"#FEF9E7", border:"1px solid #F9E79F", borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#7D6608", display:"flex", gap:8 }}><Icon d={Icons.alert} size={15} color="#F39C12"/> El calendario existente será reemplazado.</div>}
        <label style={{ fontSize:13, fontWeight:600, color:"#475569", display:"block", marginBottom:6 }}>Fecha de inicio</label>
        <Input type="date" value={genDate} onChange={setGenDate}/>
        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <Btn onClick={generateCalendar} disabled={generating} style={{ flex:1 }}>{generating?"Generando…":<><Icon d={Icons.calendar} size={14}/> Generar Calendario</>}</Btn>
          <Btn variant="secondary" onClick={()=>setShowGen(false)}>Cancelar</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─── FAMILIAS ────────────────────────────────────────────────────────────────
function Familias({ familias, reload, addToast }) {
  const [search,setSearch]           = useState("");
  const [showDialog,setShowDialog]   = useState(false);
  const [editing,setEditing]         = useState(null);
  const [form,setForm]               = useState({nombre:"",activa:true,email:"",telefono:""});
  const [showBulk,setShowBulk]       = useState(false);
  const [bulkText,setBulkText]       = useState("");
  const [saving,setSaving]           = useState(false);

  const avg = familias.filter(f=>f.activa).length ? familias.filter(f=>f.activa).reduce((s,f)=>s+f.participaciones_totales,0)/familias.filter(f=>f.activa).length : 0;
  const filtered = familias.filter(f=>f.nombre.toLowerCase().includes(search.toLowerCase()));

  async function saveFamily() {
    if(!form.nombre.trim()) return;
    setSaving(true);
    if(editing){
      const {error} = await supabase.from("familias").update({nombre:form.nombre.trim(),activa:form.activa,email:form.email.trim()||null,telefono:form.telefono.trim()||null}).eq("id",editing.id);
      if(error){addToast("Error: "+error.message,"error");}else{addToast("Familia actualizada");}
    } else {
      const {error} = await supabase.from("familias").insert({nombre:form.nombre.trim(),activa:form.activa,email:form.email.trim()||null,telefono:form.telefono.trim()||null,participaciones_totales:0,ausencias:0,participaciones_por_mes:{}});
      if(error){addToast("Error: "+error.message,"error");}else{addToast("Familia creada");}
    }
    await reload(); setSaving(false); setShowDialog(false);
  }

  async function deleteFamily(id) {
    const {error} = await supabase.from("familias").delete().eq("id",id);
    if(error){addToast("Error: "+error.message,"error");}else{addToast("Familia eliminada"); await reload();}
  }

  async function bulkImport() {
    const names = bulkText.split("\n").map(s=>s.trim()).filter(Boolean);
    const rows  = names.map(nombre=>({nombre,activa:true,participaciones_totales:0,ausencias:0,participaciones_por_mes:{}}));
    const {error} = await supabase.from("familias").insert(rows);
    if(error){addToast("Error: "+error.message,"error");}else{addToast(`${names.length} familias importadas`); await reload();}
    setShowBulk(false); setBulkText("");
  }

  function eqBadge(f) {
    const diff=Math.abs(f.participaciones_totales-avg);
    if(diff<=1) return <Badge color="#EAFAF1" textColor="#1D6A39" border="#A9DFBF">Equilibrado</Badge>;
    if(diff<=2) return <Badge color="#FEF9E7" textColor="#7D6608" border="#F9E79F">Leve diferencia</Badge>;
    return             <Badge color="#FDEDEC" textColor="#78281F" border="#F5B7B1">Desbalance</Badge>;
  }
  const bulkPreview = bulkText.split("\n").map(s=>s.trim()).filter(Boolean);

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div style={{ color:"#64748B", fontSize:14, fontWeight:600 }}><span style={{ color:"#1A3A5C", fontSize:22, fontWeight:800, fontFamily:"Georgia,serif" }}>{familias.length}</span> familias</div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}><Icon d={Icons.search} size={15} color="#94A3B8"/></span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar…" style={{ paddingLeft:34,padding:"8px 13px 8px 34px",borderRadius:8,border:"1.5px solid #CBD5E1",fontFamily:"inherit",fontSize:14,color:"#1A3A5C",outline:"none",width:200 }}/>
          </div>
          <Btn variant="secondary" onClick={()=>setShowBulk(true)}><Icon d={Icons.import} size={14}/> Importar lista</Btn>
          <Btn onClick={()=>{setEditing(null);setForm({nombre:"",activa:true});setShowDialog(true);}}><Icon d={Icons.plus} size={14}/> Nueva</Btn>
        </div>
      </div>

      {filtered.length===0 ? (
        <Card style={{ textAlign:"center", padding:64 }}>
          <Icon d={Icons.users} size={48} color="#CBD5E1"/>
          <div style={{ marginTop:16, color:"#94A3B8", fontWeight:600 }}>Sin familias registradas</div>
          <div style={{ marginTop:16 }}><Btn onClick={()=>{setEditing(null);setForm({nombre:"",activa:true});setShowDialog(true);}}><Icon d={Icons.plus} size={14}/> Agregar Familia</Btn></div>
        </Card>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:16 }}>
          {filtered.map(f=>{
            const col=familyColor(f.nombre.replace("Familia ","")); const aus=f.ausencias||0;
            return (
              <Card key={f.id}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:12 }}>
                  <div style={{ width:42,height:42,borderRadius:12,background:col.bg,border:`1.5px solid ${col.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Icon d={Icons.user} size={20} color={col.text}/></div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:"#1A3A5C" }}>{f.nombre}</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:3 }}>
                      {!f.activa&&<Badge color="#F1F5F9" textColor="#94A3B8" border="#E2E8F0">Inactiva</Badge>}
                      {aus>0&&<Badge color="#FEF2F2" textColor="#C0392B" border="#FECACA"><Icon d={Icons.alert} size={10} color="#C0392B"/> {aus} ausencia{aus>1?"s":""}</Badge>}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                  <div>
                    <div style={{ fontSize:12, color:"#94A3B8", marginBottom:2 }}>Última participación</div>
                    <div style={{ fontSize:13, color:"#475569", fontWeight:600 }}>{formatDate(f.ultima_participacion)}</div>
                    {f.email && <div style={{ fontSize:12, color:"#64748B", marginTop:4, display:"flex", alignItems:"center", gap:4 }}><Icon d={Icons.user} size={11} color="#94A3B8"/> {f.email}</div>}
                    <div style={{ marginTop:8 }}>{eqBadge(f)}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:38, fontWeight:800, color:"#1A3A5C", fontFamily:"Georgia,serif", lineHeight:1 }}>{f.participaciones_totales}</div>
                    <div style={{ fontSize:11, color:"#94A3B8" }}>turnos</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, marginTop:16, paddingTop:14, borderTop:"1px solid #F1F5F9" }}>
                  <Btn variant="secondary" size="sm" onClick={()=>{setEditing(f);setForm({nombre:f.nombre,activa:f.activa,email:f.email||"",telefono:f.telefono||""});setShowDialog(true);}} style={{ flex:1 }}><Icon d={Icons.edit} size={13}/> Editar</Btn>
                  <Btn variant="danger" size="sm" onClick={()=>deleteFamily(f.id)}><Icon d={Icons.trash} size={13}/></Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showDialog} onClose={()=>setShowDialog(false)} title={editing?"Editar Familia":"Nueva Familia"}>
        <label style={{ fontSize:13, fontWeight:600, color:"#475569", display:"block", marginBottom:6 }}>Nombre</label>
        <Input value={form.nombre} onChange={v=>setForm(p=>({...p,nombre:v}))} placeholder="Ej. Familia García"/>
        <label style={{ fontSize:13, fontWeight:600, color:"#475569", display:"block", marginBottom:6, marginTop:14 }}>Email <span style={{ fontWeight:400, color:"#94A3B8" }}>(para recordatorios)</span></label>
        <Input value={form.email} onChange={v=>setForm(p=>({...p,email:v}))} placeholder="familia@correo.com" type="email"/>
        <label style={{ fontSize:13, fontWeight:600, color:"#475569", display:"block", marginBottom:6, marginTop:14 }}>Teléfono <span style={{ fontWeight:400, color:"#94A3B8" }}>(opcional, futuro WhatsApp)</span></label>
        <Input value={form.telefono} onChange={v=>setForm(p=>({...p,telefono:v}))} placeholder="+56 9 1234 5678"/>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:"#475569" }}>Activa</div>
          <button onClick={()=>setForm(p=>({...p,activa:!p.activa}))} style={{ width:44,height:24,borderRadius:99,border:"none",cursor:"pointer",background:form.activa?"#1A3A5C":"#CBD5E1",position:"relative",transition:"background 0.2s" }}>
            <span style={{ position:"absolute",top:2,left:form.activa?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
          </button>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <Btn onClick={saveFamily} disabled={!form.nombre.trim()||saving} style={{ flex:1 }}>{saving?"Guardando…":editing?"Guardar":"Crear"}</Btn>
          <Btn variant="secondary" onClick={()=>setShowDialog(false)}>Cancelar</Btn>
        </div>
      </Modal>

      <Modal open={showBulk} onClose={()=>setShowBulk(false)} title="Importar Lista">
        <label style={{ fontSize:13, fontWeight:600, color:"#475569", display:"block", marginBottom:6 }}>Pegar nombres (uno por línea)</label>
        <textarea value={bulkText} onChange={e=>setBulkText(e.target.value)} rows={8} placeholder={"Familia García\nFamilia Ruiz\nFamilia Torres"} style={{ width:"100%",padding:"10px 13px",borderRadius:8,border:"1.5px solid #CBD5E1",fontFamily:"inherit",fontSize:14,resize:"vertical",outline:"none",boxSizing:"border-box" }}/>
        {bulkPreview.length>0&&<div style={{ marginTop:12,background:"#F8FAFC",borderRadius:8,padding:"10px 14px",maxHeight:140,overflowY:"auto" }}>
          {bulkPreview.map((n,i)=><div key={i} style={{ display:"flex",alignItems:"center",gap:8,fontSize:13,padding:"3px 0",color:"#334155" }}><Icon d={Icons.check} size={13} color="#27AE60"/>{n}</div>)}
        </div>}
        <div style={{ display:"flex", gap:10, marginTop:16 }}>
          <Btn onClick={bulkImport} disabled={!bulkPreview.length} style={{ flex:1 }}><Icon d={Icons.import} size={14}/> Importar {bulkPreview.length||""} familias</Btn>
          <Btn variant="secondary" onClick={()=>setShowBulk(false)}>Cancelar</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─── INTERCAMBIOS ────────────────────────────────────────────────────────────
function Intercambios({ familias, semanas, intercambios, reload, addToast }) {
  const [famA,setFamA]=useState(""); const [fechaA,setFechaA]=useState("");
  const [famB,setFamB]=useState(""); const [fechaB,setFechaB]=useState("");
  const [obs,setObs]=useState(""); const [saving,setSaving]=useState(false);
  const today=new Date().toISOString().slice(0,10);

  function turnsFor(famId){
    return semanas.filter(s=>!s.bloqueado&&s.fecha>=today&&[s.familia1_id,s.familia2_id,s.familia3_id].includes(famId)&&!(s.ausentes_ids||[]).includes(famId));
  }

  async function applySwap(){
    const sA=semanas.find(s=>s.fecha===fechaA); const sB=semanas.find(s=>s.fecha===fechaB);
    if(!sA||!sB){addToast("No se encontraron las semanas","error");return;}
    const nA=familias.find(f=>f.id===famA)?.nombre.replace("Familia ","");
    const nB=familias.find(f=>f.id===famB)?.nombre.replace("Familia ","");
    function sw(sem,oId,nId,nName){ const s={...sem}; if(s.familia1_id===oId){s.familia1_id=nId;s.familia1_nombre=nName;}else if(s.familia2_id===oId){s.familia2_id=nId;s.familia2_nombre=nName;}else if(s.familia3_id===oId){s.familia3_id=nId;s.familia3_nombre=nName;} return s; }
    const updA=sw({...sA},famA,famB,nB); const updB=sw({...sB},famB,famA,nA);
    setSaving(true);
    try {
      await supabase.from("semanas").update({familia1_id:updA.familia1_id,familia1_nombre:updA.familia1_nombre,familia2_id:updA.familia2_id,familia2_nombre:updA.familia2_nombre,familia3_id:updA.familia3_id,familia3_nombre:updA.familia3_nombre}).eq("id",sA.id);
      await supabase.from("semanas").update({familia1_id:updB.familia1_id,familia1_nombre:updB.familia1_nombre,familia2_id:updB.familia2_id,familia2_nombre:updB.familia2_nombre,familia3_id:updB.familia3_id,familia3_nombre:updB.familia3_nombre}).eq("id",sB.id);
      await supabase.from("intercambios").insert({familia_a_id:famA,familia_a_nombre:nA,fecha_a:fechaA,familia_b_id:famB,familia_b_nombre:nB,fecha_b:fechaB,observacion:obs,estado:"aplicado"});
      await supabase.from("historial_cambios").insert({tipo_cambio:"intercambio_voluntario",familia_anterior_id:famA,familia_anterior_nombre:nA,familia_nueva_id:famB,familia_nueva_nombre:nB,fecha_turno:fechaA,descripcion:`Intercambio: ${nA} ↔ ${nB}`});
      await reload(); setFamA("");setFechaA("");setFamB("");setFechaB("");setObs("");
      addToast("Intercambio aplicado");
    } catch(e){addToast("Error: "+e.message,"error");}
    setSaving(false);
  }

  const sc={aplicado:{bg:"#EAFAF1",text:"#1D6A39",border:"#A9DFBF"},pendiente:{bg:"#FEF9E7",text:"#7D6608",border:"#F9E79F"},rechazado:{bg:"#FDEDEC",text:"#78281F",border:"#F5B7B1"}};

  return (
    <div style={{ display:"grid", gap:20 }}>
      <Card>
        <div style={{ fontWeight:700, fontSize:16, color:"#1A3A5C", marginBottom:10 }}>Intercambio Voluntario de Turno</div>
        <div style={{ background:"#EBF5FB", border:"1px solid #AED6F1", borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#1A5276", display:"flex", gap:8 }}>
          <Icon d={Icons.alert} size={15} color="#2E86C1"/> Para cuando la familia avisa con anticipación. Faltas sin aviso → <strong>Registrar Ausencia</strong> en Resumen.
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:16 }}>
          {[{label:"Familia A",famId:famA,setFam:setFamA,fecha:fechaA,setFecha:setFechaA,exclude:famB},{label:"Familia B",famId:famB,setFam:setFamB,fecha:fechaB,setFecha:setFechaB,exclude:famA}].map(({label,famId,setFam,fecha,setFecha,exclude})=>(
            <div key={label} style={{ background:"#F8FAFC", borderRadius:12, padding:16 }}>
              <div style={{ fontWeight:700, fontSize:13, color:"#64748B", marginBottom:12, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</div>
              <Select value={famId} onChange={v=>{setFam(v);setFecha("");}} options={familias.filter(f=>f.activa&&f.id!==exclude).map(f=>({value:f.id,label:f.nombre}))} placeholder="Seleccionar…" style={{marginBottom:10}}/>
              <Select value={fecha} onChange={setFecha} options={famId?turnsFor(famId).map(s=>({value:s.fecha,label:formatDate(s.fecha)})):[]} placeholder="Seleccionar turno…"/>
            </div>
          ))}
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:13, fontWeight:600, color:"#475569", display:"block", marginBottom:6 }}>Observación (opcional)</label>
          <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={2} placeholder="Motivo…" style={{ width:"100%",padding:"9px 13px",borderRadius:8,border:"1.5px solid #CBD5E1",fontFamily:"inherit",fontSize:14,resize:"none",outline:"none",boxSizing:"border-box" }}/>
        </div>
        <Btn onClick={applySwap} disabled={!famA||!fechaA||!famB||!fechaB||saving} style={{ width:"100%" }}><Icon d={Icons.arrows} size={14}/> {saving?"Aplicando…":"Aplicar Intercambio"}</Btn>
      </Card>
      <Card>
        <div style={{ fontWeight:700, fontSize:16, color:"#1A3A5C", marginBottom:16 }}>Historial de Intercambios</div>
        {intercambios.length===0 ? <div style={{ textAlign:"center",padding:"32px 0",color:"#94A3B8",fontSize:14 }}>Sin intercambios</div>
          : intercambios.map(ic=>{ const c=sc[ic.estado]||sc.pendiente; return (
            <div key={ic.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #F1F5F9",gap:12,flexWrap:"wrap" }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:36,height:36,borderRadius:10,background:"#EBF5FB",display:"flex",alignItems:"center",justifyContent:"center" }}><Icon d={Icons.arrows} size={16} color="#1A5276"/></div>
                <div>
                  <div style={{ fontWeight:700,fontSize:14,color:"#1A3A5C" }}>{ic.familia_a_nombre} ↔ {ic.familia_b_nombre}</div>
                  <div style={{ fontSize:12,color:"#94A3B8" }}>{formatDate(ic.fecha_a)} ↔ {formatDate(ic.fecha_b)}</div>
                </div>
              </div>
              <Badge color={c.bg} textColor={c.text} border={c.border}>{ic.estado}</Badge>
            </div>
          );})}
      </Card>
    </div>
  );
}

// ─── PERIODOS ────────────────────────────────────────────────────────────────
function Periodos({ periodos, reload, addToast }) {
  const [showDialog,setShowDialog]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({nombre:"",fecha_inicio:"",fecha_fin:"",tipo:"festivo",activo:true});

  async function save(){
    if(!form.nombre||!form.fecha_inicio||!form.fecha_fin)return;
    if(editing){ await supabase.from("periodos_bloqueados").update(form).eq("id",editing.id); addToast("Periodo actualizado"); }
    else        { await supabase.from("periodos_bloqueados").insert(form); addToast("Periodo creado"); }
    await reload(); setShowDialog(false);
  }
  async function toggle(p){ await supabase.from("periodos_bloqueados").update({activo:!p.activo}).eq("id",p.id); await reload(); }
  async function del(id)  { await supabase.from("periodos_bloqueados").delete().eq("id",id); addToast("Periodo eliminado"); await reload(); }

  const tc={vacaciones:{bg:"#FEF9E7",text:"#7D6608",border:"#F9E79F"},festivo:{bg:"#FEF4EB",text:"#7E5109",border:"#FAD7A0"},cierre:{bg:"#FDEDEC",text:"#78281F",border:"#F5B7B1"}};

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div style={{ color:"#64748B",fontSize:14,fontWeight:600 }}><span style={{ color:"#1A3A5C",fontSize:22,fontWeight:800,fontFamily:"Georgia,serif" }}>{periodos.length}</span> periodos</div>
        <Btn onClick={()=>{setEditing(null);setForm({nombre:"",fecha_inicio:"",fecha_fin:"",tipo:"festivo",activo:true});setShowDialog(true);}}><Icon d={Icons.plus} size={14}/> Agregar Periodo</Btn>
      </div>
      <div style={{ background:"#EBF5FB",border:"1px solid #AED6F1",borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:13,color:"#1A5276",display:"flex",gap:8 }}>
        <Icon d={Icons.ban} size={15} color="#2E86C1"/> Los periodos activos excluyen semanas al generar el calendario.
      </div>
      {periodos.length===0 ? <Card style={{ textAlign:"center",padding:64 }}><Icon d={Icons.ban} size={48} color="#CBD5E1"/><div style={{ marginTop:16,color:"#94A3B8",fontWeight:600 }}>Sin periodos</div></Card>
        : <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {periodos.map(p=>{ const c=tc[p.tipo]||tc.festivo; return (
            <Card key={p.id} style={{ opacity:p.activo?1:0.5 }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
                <div style={{ display:"flex",alignItems:"center",gap:14 }}>
                  <div style={{ width:42,height:42,borderRadius:12,background:c.bg,border:`1.5px solid ${c.border}`,display:"flex",alignItems:"center",justifyContent:"center" }}><Icon d={Icons.ban} size={20} color={c.text}/></div>
                  <div>
                    <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                      <span style={{ fontWeight:700,fontSize:15,color:"#1A3A5C" }}>{p.nombre}</span>
                      <Badge color={c.bg} textColor={c.text} border={c.border}>{p.tipo}</Badge>
                      {!p.activo&&<Badge color="#F1F5F9" textColor="#94A3B8" border="#E2E8F0">Desactivado</Badge>}
                    </div>
                    <div style={{ fontSize:13,color:"#64748B",marginTop:3 }}>{formatDate(p.fecha_inicio)} → {formatDate(p.fecha_fin)}</div>
                  </div>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <button onClick={()=>toggle(p)} style={{ width:44,height:24,borderRadius:99,border:"none",cursor:"pointer",background:p.activo?"#1A3A5C":"#CBD5E1",position:"relative",transition:"background 0.2s" }}>
                    <span style={{ position:"absolute",top:2,left:p.activo?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.2s" }}/>
                  </button>
                  <Btn variant="secondary" size="sm" onClick={()=>{setEditing(p);setForm({nombre:p.nombre,fecha_inicio:p.fecha_inicio,fecha_fin:p.fecha_fin,tipo:p.tipo,activo:p.activo});setShowDialog(true);}}><Icon d={Icons.edit} size={13}/></Btn>
                  <Btn variant="danger" size="sm" onClick={()=>del(p.id)}><Icon d={Icons.trash} size={13}/></Btn>
                </div>
              </div>
            </Card>
          );})}
        </div>}
      <Modal open={showDialog} onClose={()=>setShowDialog(false)} title={editing?"Editar Periodo":"Nuevo Periodo"}>
        <label style={{ fontSize:13,fontWeight:600,color:"#475569",display:"block",marginBottom:6 }}>Nombre</label>
        <Input value={form.nombre} onChange={v=>setForm(p=>({...p,nombre:v}))} placeholder="Ej. Semana Santa 2026" style={{marginBottom:14}}/>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14 }}>
          <div><label style={{ fontSize:13,fontWeight:600,color:"#475569",display:"block",marginBottom:6 }}>Inicio</label><Input type="date" value={form.fecha_inicio} onChange={v=>setForm(p=>({...p,fecha_inicio:v}))}/></div>
          <div><label style={{ fontSize:13,fontWeight:600,color:"#475569",display:"block",marginBottom:6 }}>Fin</label><Input type="date" value={form.fecha_fin} onChange={v=>setForm(p=>({...p,fecha_fin:v}))}/></div>
        </div>
        <label style={{ fontSize:13,fontWeight:600,color:"#475569",display:"block",marginBottom:6 }}>Tipo</label>
        <Select value={form.tipo} onChange={v=>setForm(p=>({...p,tipo:v}))} options={[{value:"festivo",label:"Festivo"},{value:"vacaciones",label:"Vacaciones"},{value:"cierre",label:"Cierre"}]}/>
        <div style={{ display:"flex",gap:10,marginTop:20 }}>
          <Btn onClick={save} disabled={!form.nombre||!form.fecha_inicio||!form.fecha_fin} style={{ flex:1 }}>{editing?"Guardar":"Crear"}</Btn>
          <Btn variant="secondary" onClick={()=>setShowDialog(false)}>Cancelar</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─── HISTORIAL ───────────────────────────────────────────────────────────────
function Historial({ historial }) {
  const [filter,setFilter]=useState("");
  const tipoIcons ={intercambio_voluntario:Icons.arrows,ausencia:Icons.alert,cambio_manual:Icons.edit,ajuste_automatico:Icons.refresh};
  const tipoColors={intercambio_voluntario:"#1A5276",ausencia:"#C0392B",cambio_manual:"#7D6608",ajuste_automatico:"#1D6A39"};
  const tipoBg    ={intercambio_voluntario:"#EBF5FB",ausencia:"#FDEDEC",cambio_manual:"#FEF9E7",ajuste_automatico:"#EAFAF1"};
  const tipoLabels={intercambio_voluntario:"Intercambio",ausencia:"Ausencia",cambio_manual:"Manual",ajuste_automatico:"Automático"};
  const filtered=historial.filter(h=>!filter||h.tipo_cambio===filter);
  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12 }}>
        <div style={{ color:"#64748B",fontSize:14,fontWeight:600 }}><span style={{ color:"#1A3A5C",fontSize:22,fontWeight:800,fontFamily:"Georgia,serif" }}>{historial.length}</span> registros</div>
        <Select value={filter} onChange={setFilter} style={{ width:220 }} options={[{value:"intercambio_voluntario",label:"Intercambios"},{value:"ausencia",label:"Ausencias"},{value:"cambio_manual",label:"Manuales"},{value:"ajuste_automatico",label:"Automáticos"}]} placeholder="Todos los tipos"/>
      </div>
      {filtered.length===0 ? <Card style={{ textAlign:"center",padding:64 }}><Icon d={Icons.history} size={48} color="#CBD5E1"/><div style={{ marginTop:16,color:"#94A3B8",fontWeight:600 }}>Sin historial</div></Card>
        : <Card style={{ padding:0,overflow:"hidden" }}>
          {filtered.map((h,i)=>{ const ic=tipoIcons[h.tipo_cambio]||Icons.edit; const col=tipoColors[h.tipo_cambio]||"#1A3A5C"; const bg=tipoBg[h.tipo_cambio]||"#EBF5FB"; const lbl=tipoLabels[h.tipo_cambio]||h.tipo_cambio; return (
            <div key={h.id} style={{ display:"flex",alignItems:"flex-start",gap:14,padding:"16px 20px",borderBottom:i<filtered.length-1?"1px solid #F1F5F9":"none" }}>
              <div style={{ width:38,height:38,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2 }}><Icon d={ic} size={16} color={col}/></div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4 }}>
                  <Badge color={bg} textColor={col} border={bg}>{lbl}</Badge>
                  <span style={{ fontSize:13,color:"#94A3B8" }}>Falta: {formatDate(h.fecha_turno)}</span>
                  {h.fecha_compensacion&&<span style={{ fontSize:12,color:"#27AE60",fontWeight:600,display:"flex",alignItems:"center",gap:4 }}><Icon d={Icons.clock} size={12} color="#27AE60"/> Compensación: {formatDate(h.fecha_compensacion)}</span>}
                  {h.deuda_pendiente&&<Badge color="#FEF9E7" textColor="#7D6608" border="#F9E79F">Deuda pendiente</Badge>}
                </div>
                <div style={{ fontSize:14,color:"#334155",fontWeight:600,marginBottom:3 }}>{h.descripcion}</div>
                <div style={{ fontSize:12,color:"#94A3B8" }}>
                  {h.familia_anterior_nombre&&<span style={{ color:"#E74C3C" }}>{h.familia_anterior_nombre}</span>}
                  {h.familia_nueva_nombre&&<><span style={{ color:"#94A3B8" }}> → </span><span style={{ color:"#27AE60" }}>{h.familia_nueva_nombre}</span></>}
                </div>
              </div>
              <div style={{ fontSize:12,color:"#CBD5E1",whiteSpace:"nowrap",flexShrink:0 }}>
                {h.created_at?new Date(h.created_at).toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"2-digit"}):""}
              </div>
            </div>
          );})}
        </Card>}
    </div>
  );
}

// ─── RESUMEN ─────────────────────────────────────────────────────────────────
function Resumen({ familias, semanas, reload, addToast }) {
  const [absFamId,setAbsFamId]=useState("");
  const [absFecha,setAbsFecha]=useState("");
  const [saving,setSaving]=useState(false);
  const today=new Date().toISOString().slice(0,10);

  const active    =familias.filter(f=>f.activa);
  const totalWeeks=semanas.filter(s=>!s.bloqueado).length;
  const avg       =active.length?active.reduce((s,f)=>s+f.participaciones_totales,0)/active.length:0;
  const eq        =equityStatus(familias);
  const sorted    =[...familias].sort((a,b)=>b.participaciones_totales-a.participaciones_totales);
  const maxPart   =sorted[0]?.participaciones_totales||1;

  const monthlyData=Array(12).fill(0);
  semanas.filter(s=>!s.bloqueado).forEach(s=>{ const m=getMonth(s.fecha); if(m>=0) monthlyData[m]+=3; });
  const maxMonthly=Math.max(...monthlyData,1);

  function futureTurnsFor(famId){
    return semanas.filter(s=>!s.bloqueado&&s.fecha>today&&[s.familia1_id,s.familia2_id,s.familia3_id].includes(famId)&&!(s.ausentes_ids||[]).includes(famId));
  }

  async function handleRegisterAbsence(){
    const result=calcularAusencia(absFamId,absFecha,semanas,familias);
    if(!result){addToast("Error al procesar","error");return;}
    setSaving(true);
    try {
      // Update absence week (mark ausentes_ids)
      const absWeek=result.updatedSemanas.find(s=>s.fecha===absFecha);
      await supabase.from("semanas").update({ausentes_ids:absWeek.ausentes_ids}).eq("id",absWeek.id);

      // Update compensation week if found
      if(result.targetWeekId){
        const tw=result.targetWeekData;
        await supabase.from("semanas").update({
          familia1_id:tw.familia1_id,familia1_nombre:tw.familia1_nombre,
          familia2_id:tw.familia2_id,familia2_nombre:tw.familia2_nombre,
          familia3_id:tw.familia3_id,familia3_nombre:tw.familia3_nombre,
        }).eq("id",result.targetWeekId);
      }

      // Update family ausencias count
      const updFam=result.updatedFamilias.find(f=>f.id===absFamId);
      await supabase.from("familias").update({ausencias:updFam.ausencias}).eq("id",absFamId);

      // Insert historial
      await supabase.from("historial_cambios").insert(result.historialEntry);

      await reload();
      setAbsFamId(""); setAbsFecha("");
      addToast(result.resultMsg);
    } catch(e){addToast("Error: "+e.message,"error");}
    setSaving(false);
  }

  const barColor=f=>{ const d=Math.abs(f.participaciones_totales-avg); if(d<=1)return"#27AE60"; if(d<=2)return"#F39C12"; return"#E74C3C"; };

  return (
    <div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))",gap:16,marginBottom:24 }}>
        {[
          {label:"Familias activas",        value:active.length,  icon:Icons.users,   color:"#1A5276"},
          {label:"Semanas programadas",      value:totalWeeks,     icon:Icons.calendar,color:"#7D6608"},
          {label:"Promedio participaciones", value:avg.toFixed(1), icon:Icons.chart,   color:"#1D6A39"},
          {label:"Estado del equilibrio",    value:eq.label,       icon:Icons.refresh, color:eq.color, small:true},
        ].map(s=>(
          <Card key={s.label} style={{ display:"flex",flexDirection:"column",gap:8 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <span style={{ fontSize:12,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em" }}>{s.label}</span>
              <Icon d={Array.isArray(s.icon)?s.icon[0]:s.icon} size={18} color={s.color}/>
            </div>
            <div style={{ fontSize:s.small?20:32,fontWeight:800,color:s.color,fontFamily:"Georgia,serif",lineHeight:1 }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24 }}>
        <Card>
          <div style={{ fontWeight:700,fontSize:15,color:"#1A3A5C",marginBottom:16 }}>Participaciones por Familia</div>
          {sorted.map(f=>(
            <div key={f.id} style={{ marginBottom:12 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13 }}>
                <span style={{ color:"#334155",fontWeight:600,display:"flex",alignItems:"center",gap:6 }}>
                  {f.nombre.replace("Familia ","")}
                  {!f.activa&&<Badge color="#F1F5F9" textColor="#94A3B8" border="#E2E8F0" style={{ fontSize:10,padding:"1px 6px" }}>inactiva</Badge>}
                  {(f.ausencias||0)>0&&<Badge color="#FEF2F2" textColor="#C0392B" border="#FECACA" style={{ fontSize:10,padding:"1px 6px" }}>{f.ausencias} aus.</Badge>}
                </span>
                <span style={{ color:"#64748B",fontWeight:700 }}>{f.participaciones_totales}</span>
              </div>
              <div style={{ height:8,background:"#F1F5F9",borderRadius:99,overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${(f.participaciones_totales/maxPart)*100}%`,background:barColor(f),borderRadius:99,transition:"width 0.5s" }}/>
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontWeight:700,fontSize:15,color:"#1A3A5C",marginBottom:16 }}>Asignaciones por Mes</div>
          <div style={{ display:"flex",alignItems:"flex-end",gap:4,height:120,justifyContent:"space-between" }}>
            {monthlyData.map((v,i)=>(
              <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                <div style={{ width:"100%",background:"#1A3A5C",borderRadius:"3px 3px 0 0",height:`${Math.max(4,(v/maxMonthly)*90)}px`,opacity:0.7+(v/maxMonthly)*0.3 }}/>
                <span style={{ fontSize:10,color:"#94A3B8",fontWeight:600 }}>{MONTHS[i]}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign:"center",marginTop:8,fontSize:12,color:"#94A3B8" }}>Total asignaciones por mes</div>
        </Card>
      </div>

      <Card>
        <div style={{ fontWeight:700,fontSize:15,color:"#1A3A5C",marginBottom:6 }}>Registrar Ausencia sin Aviso</div>
        <div style={{ fontSize:13,color:"#64748B",marginBottom:12,lineHeight:1.6 }}>
          La semana quedará con <strong>2 familias</strong> y la ausente aparecerá <span style={{ textDecoration:"line-through",color:"#E74C3C",fontWeight:600 }}>tachada</span>. Se le asignará automáticamente la semana futura más adecuada para compensar.
        </div>
        <div style={{ background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#7F1D1D",display:"flex",gap:8 }}>
          <Icon d={Icons.alert} size={15} color="#C0392B"/> Si avisó antes → usar <strong>Intercambio Voluntario</strong>.
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:12,alignItems:"end" }}>
          <div>
            <label style={{ fontSize:13,fontWeight:600,color:"#475569",display:"block",marginBottom:6 }}>Familia ausente</label>
            <Select value={absFamId} onChange={v=>{setAbsFamId(v);setAbsFecha("");}} options={active.map(f=>({value:f.id,label:f.nombre}))} placeholder="Seleccionar familia…"/>
          </div>
          <div>
            <label style={{ fontSize:13,fontWeight:600,color:"#475569",display:"block",marginBottom:6 }}>Semana donde faltó</label>
            <Select value={absFecha} onChange={setAbsFecha} options={absFamId?futureTurnsFor(absFamId).map(s=>({value:s.fecha,label:formatDate(s.fecha)})):[]} placeholder="Seleccionar semana…"/>
          </div>
          <Btn onClick={handleRegisterAbsence} disabled={!absFamId||!absFecha||saving} variant="danger">
            <Icon d={Icons.alert} size={14}/> {saving?"Registrando…":"Registrar Ausencia"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page,setPage]         = useState("Calendario");
  const [sideOpen,setSideOpen] = useState(false);
  const [loading,setLoading]   = useState(true);
  const [toasts,setToasts]     = useState([]);

  const [familias,setFamilias]         = useState([]);
  const [semanas,setSemanas]           = useState([]);
  const [periodos,setPeriodos]         = useState([]);
  const [intercambios,setIntercambios] = useState([]);
  const [historial,setHistorial]       = useState([]);

  const addToast = useCallback((message,type="success")=>{
    const id=uid(); setToasts(p=>[...p,{id,message,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),4000);
  },[]);

  async function loadAll() {
    const [f,s,p,i,h] = await Promise.all([
      supabase.from("familias").select("*").order("nombre"),
      supabase.from("semanas").select("*").order("fecha"),
      supabase.from("periodos_bloqueados").select("*").order("fecha_inicio"),
      supabase.from("intercambios").select("*").order("created_at",{ascending:false}),
      supabase.from("historial_cambios").select("*").order("created_at",{ascending:false}),
    ]);
    if(f.data) setFamilias(f.data);
    if(s.data) setSemanas(s.data);
    if(p.data) setPeriodos(p.data);
    if(i.data) setIntercambios(i.data);
    if(h.data) setHistorial(h.data);
    setLoading(false);
  }

  const [rtConnected, setRtConnected] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    loadAll();

    channelRef.current = supabase
      .channel('aseo-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'familias' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'semanas' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'intercambios' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'historial_cambios' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'periodos_bloqueados' }, loadAll)
      .subscribe((status) => {
        setRtConnected(status === 'SUBSCRIBED');
      });

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  const navItems=[
    {label:"Calendario",   icon:Icons.calendar},
    {label:"Familias",     icon:Icons.users},
    {label:"Intercambios", icon:Icons.arrows},
    {label:"Periodos",     icon:Icons.ban},
    {label:"Historial",    icon:Icons.history},
    {label:"Resumen",      icon:Icons.chart},
  ];

  const Sidebar = () => (
    <div style={{ width:240,background:"#0F1E2E",minHeight:"100vh",display:"flex",flexDirection:"column",flexShrink:0 }}>
      <div style={{ padding:"28px 24px 20px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:34,height:34,background:"linear-gradient(135deg,#2E86C1,#1A3A5C)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center" }}><Icon d={Icons.calendar} size={18} color="#fff"/></div>
          <div>
            <div style={{ fontWeight:800,fontSize:15,color:"#fff",fontFamily:"Georgia,serif",letterSpacing:"-0.02em" }}>Waldorf Trekan</div>
            <div style={{ fontSize:10,color:"#4A6785",fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase" }}>Aseo Comunitario</div>
          </div>
        </div>
      </div>
      <nav style={{ flex:1,padding:"8px 12px" }}>
        {navItems.map(item=>{ const active=page===item.label; return (
          <button key={item.label} onClick={()=>{setPage(item.label);setSideOpen(false);}} style={{ width:"100%",display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,border:"none",cursor:"pointer",marginBottom:2,transition:"all 0.15s",textAlign:"left",fontFamily:"inherit",fontWeight:active?700:500,fontSize:14,background:active?"rgba(255,255,255,0.1)":"transparent",color:active?"#fff":"#8FA7C0",boxShadow:active?"inset 0 0 0 1px rgba(255,255,255,0.1)":"none" }}>
            <Icon d={Array.isArray(item.icon)?item.icon[0]:item.icon} size={16} color={active?"#fff":"#4A6785"}/>
            {item.label}
          </button>
        );})}
      </nav>
      <div style={{ padding:"16px 24px",borderTop:"1px solid rgba(255,255,255,0.06)",fontSize:11,color:"#2D4A63",fontWeight:600 }}>v1.1 · Colegio Waldorf Trekan</div>
    </div>
  );

  const pageProps={ familias, semanas, periodos, intercambios, historial, reload:loadAll, addToast };

  return (
    <div style={{ display:"flex",minHeight:"100vh",fontFamily:"'Segoe UI',system-ui,sans-serif",background:"#F4F7FB" }}>
      <div style={{ display:"flex" }}><Sidebar/></div>
      {sideOpen&&(
        <div style={{ position:"fixed",inset:0,zIndex:500 }}>
          <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.5)" }} onClick={()=>setSideOpen(false)}/>
          <div style={{ position:"absolute",top:0,left:0,bottom:0 }}><Sidebar/></div>
        </div>
      )}
      <div style={{ flex:1,display:"flex",flexDirection:"column",minWidth:0 }}>
        <div style={{ background:"#fff",borderBottom:"1px solid #E2EAF4",padding:"14px 24px",display:"flex",alignItems:"center",gap:16,position:"sticky",top:0,zIndex:100 }}>
          <button onClick={()=>setSideOpen(true)} style={{ border:"none",background:"none",cursor:"pointer",color:"#475569",padding:4 }}><Icon d={Icons.menu} size={20}/></button>
          <h1 style={{ margin:0,fontSize:20,fontWeight:800,color:"#1A3A5C",fontFamily:"Georgia,serif",letterSpacing:"-0.02em" }}>{page}</h1>
          <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:rtConnected?"#22C55E":"#CBD5E1",boxShadow:rtConnected?"0 0 6px #22C55E":"none",transition:"all 0.5s" }}/>
            <span style={{ fontSize:12,fontWeight:600,color:rtConnected?"#16A34A":"#94A3B8" }}>
              {rtConnected ? "En vivo" : "Conectando…"}
            </span>
          </div>
        </div>
        <div style={{ flex:1,padding:28,maxWidth:1200 }}>
          {loading ? <Spinner/> : <>
            {page==="Calendario"   && <Calendario   {...pageProps}/>}
            {page==="Familias"     && <Familias     {...pageProps}/>}
            {page==="Intercambios" && <Intercambios {...pageProps}/>}
            {page==="Periodos"     && <Periodos     {...pageProps}/>}
            {page==="Historial"    && <Historial    historial={historial}/>}
            {page==="Resumen"      && <Resumen      {...pageProps}/>}
          </>}
        </div>
      </div>
      <ToastStack toasts={toasts}/>
    </div>
  );
}
