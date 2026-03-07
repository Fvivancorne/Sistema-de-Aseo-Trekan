import { useState, useMemo, useCallback } from "react";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const initialFamilias = [
  { id: "f1", nombre: "Familia González", participaciones_totales: 8, ultima_participacion: "2025-01-17", participaciones_por_mes: {"0":2,"1":2,"2":1,"3":1,"4":1,"5":1}, activa: true },
  { id: "f2", nombre: "Familia Martínez", participaciones_totales: 6, ultima_participacion: "2025-01-24", participaciones_por_mes: {"0":1,"1":2,"2":1,"3":1,"4":1}, activa: true },
  { id: "f3", nombre: "Familia López", participaciones_totales: 9, ultima_participacion: "2025-01-10", participaciones_por_mes: {"0":2,"1":2,"2":2,"3":1,"4":1,"5":1}, activa: true },
  { id: "f4", nombre: "Familia Rodríguez", participaciones_totales: 5, ultima_participacion: "2025-01-03", participaciones_por_mes: {"0":1,"1":1,"2":1,"3":1,"4":1}, activa: true },
  { id: "f5", nombre: "Familia Hernández", participaciones_totales: 7, ultima_participacion: "2025-01-17", participaciones_por_mes: {"0":2,"1":2,"2":1,"3":1,"4":1}, activa: true },
  { id: "f6", nombre: "Familia Jiménez", participaciones_totales: 4, ultima_participacion: "2024-12-20", participaciones_por_mes: {"0":1,"1":1,"2":1,"3":1}, activa: false },
];

const initialSemanas = [
  { id: "s1", fecha: "2025-01-03", numero_semana: 1, anio: 2025, bloqueado: false, familia1_id: "f1", familia1_nombre: "González", familia2_id: "f3", familia2_nombre: "López", familia3_id: "f4", familia3_nombre: "Rodríguez" },
  { id: "s2", fecha: "2025-01-10", numero_semana: 2, anio: 2025, bloqueado: false, familia1_id: "f2", familia1_nombre: "Martínez", familia2_id: "f5", familia2_nombre: "Hernández", familia3_id: "f3", familia3_nombre: "López" },
  { id: "s3", fecha: "2025-01-17", numero_semana: 3, anio: 2025, bloqueado: false, familia1_id: "f1", familia1_nombre: "González", familia2_id: "f5", familia2_nombre: "Hernández", familia3_id: "f4", familia3_nombre: "Rodríguez" },
  { id: "s4", fecha: "2025-01-24", numero_semana: 4, anio: 2025, bloqueado: false, familia1_id: "f2", familia1_nombre: "Martínez", familia2_id: "f3", familia2_nombre: "López", familia3_id: "f1", familia3_nombre: "González" },
  { id: "s5", fecha: "2025-01-31", numero_semana: 5, anio: 2025, bloqueado: true },
  { id: "s6", fecha: "2025-02-07", numero_semana: 6, anio: 2025, bloqueado: false, familia1_id: "f4", familia1_nombre: "Rodríguez", familia2_id: "f5", familia2_nombre: "Hernández", familia3_id: "f2", familia3_nombre: "Martínez" },
  { id: "s7", fecha: "2025-02-14", numero_semana: 7, anio: 2025, bloqueado: false, familia1_id: "f1", familia1_nombre: "González", familia2_id: "f3", familia2_nombre: "López", familia3_id: "f2", familia3_nombre: "Martínez" },
  { id: "s8", fecha: "2025-02-21", numero_semana: 8, anio: 2025, bloqueado: false, familia1_id: "f5", familia5_nombre: "Hernández", familia2_id: "f4", familia2_nombre: "Rodríguez", familia3_id: "f1", familia3_nombre: "González" },
  { id: "s9", fecha: "2025-02-28", numero_semana: 9, anio: 2025, bloqueado: false, familia1_id: "f3", familia1_nombre: "López", familia2_id: "f2", familia2_nombre: "Martínez", familia3_id: "f5", familia3_nombre: "Hernández" },
  { id: "s10", fecha: "2025-03-07", numero_semana: 10, anio: 2025, bloqueado: false, familia1_id: "f1", familia1_nombre: "González", familia2_id: "f4", familia2_nombre: "Rodríguez", familia3_id: "f3", familia3_nombre: "López" },
  { id: "s11", fecha: "2025-03-14", numero_semana: 11, anio: 2025, bloqueado: false, familia1_id: "f2", familia1_nombre: "Martínez", familia2_id: "f5", familia2_nombre: "Hernández", familia3_id: "f1", familia3_nombre: "González" },
  { id: "s12", fecha: "2025-03-21", numero_semana: 12, anio: 2025, bloqueado: true },
];

const initialPeriodos = [
  { id: "p1", nombre: "Semana Santa 2025", fecha_inicio: "2025-01-28", fecha_fin: "2025-02-02", tipo: "festivo", activo: true },
  { id: "p2", nombre: "Vacaciones Julio", fecha_inicio: "2025-07-14", fecha_fin: "2025-07-28", tipo: "vacaciones", activo: true },
  { id: "p3", nombre: "Cierre Diciembre", fecha_inicio: "2025-12-22", fecha_fin: "2025-12-31", tipo: "cierre", activo: false },
];

const initialIntercambios = [
  { id: "i1", familia_a_id: "f1", familia_a_nombre: "González", fecha_a: "2025-02-07", familia_b_id: "f2", familia_b_nombre: "Martínez", fecha_b: "2025-02-14", observacion: "Viaje de trabajo", estado: "aplicado" },
  { id: "i2", familia_a_id: "f3", familia_a_nombre: "López", fecha_a: "2025-03-07", familia_b_id: "f4", familia_b_nombre: "Rodríguez", fecha_b: "2025-03-14", observacion: "", estado: "pendiente" },
];

const initialHistorial = [
  { id: "h1", fecha_cambio: "2025-01-15T10:30:00", tipo_cambio: "intercambio_voluntario", familia_anterior_id: "f1", familia_anterior_nombre: "González", familia_nueva_id: "f2", familia_nueva_nombre: "Martínez", fecha_turno: "2025-02-07", descripcion: "Intercambio voluntario: González ↔ Martínez" },
  { id: "h2", fecha_cambio: "2025-01-20T14:15:00", tipo_cambio: "ausencia", familia_anterior_id: "f3", familia_anterior_nombre: "López", familia_nueva_id: "f4", familia_nueva_nombre: "Rodríguez", fecha_turno: "2025-01-24", descripcion: "Ausencia registrada: López reemplazada por Rodríguez" },
  { id: "h3", fecha_cambio: "2025-01-22T09:00:00", tipo_cambio: "ajuste_automatico", familia_anterior_id: "f5", familia_anterior_nombre: "Hernández", familia_nueva_id: "f1", familia_nueva_nombre: "González", fecha_turno: "2025-03-07", descripcion: "Rebalanceo automático del calendario" },
];

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const MONTH_FULL = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str + (str.length === 10 ? "T00:00:00" : ""));
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function getMonth(str) {
  if (!str) return -1;
  return new Date(str + "T00:00:00").getMonth();
}

const FAMILY_COLORS = [
  { bg: "#E8F4FD", text: "#1A5276", border: "#AED6F1" },
  { bg: "#FEF9E7", text: "#7D6608", border: "#F9E79F" },
  { bg: "#EAFAF1", text: "#1D6A39", border: "#A9DFBF" },
  { bg: "#FDEDEC", text: "#78281F", border: "#F5B7B1" },
  { bg: "#F4ECF7", text: "#512E5F", border: "#D2B4DE" },
];

function familyColor(name) {
  if (!name) return FAMILY_COLORS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % FAMILY_COLORS.length;
  return FAMILY_COLORS[h];
}

function uid() { return Math.random().toString(36).slice(2); }

function equityStatus(familias) {
  const active = familias.filter(f => f.activa);
  if (!active.length) return { label: "Sin datos", color: "#888" };
  const avg = active.reduce((s, f) => s + f.participaciones_totales, 0) / active.length;
  const maxDiff = Math.max(...active.map(f => Math.abs(f.participaciones_totales - avg)));
  if (maxDiff <= 1) return { label: "Equilibrado", color: "#27AE60" };
  if (maxDiff <= 2) return { label: "Leve diferencia", color: "#F39C12" };
  return { label: "Desbalance", color: "#E74C3C" };
}

// ─── ICONS (inline SVG) ────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, color = "currentColor", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const Icons = {
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  users: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75","M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  arrows: "M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4",
  ban: ["M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"],
  history: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M12 7v5l4 2",
  chart: ["M18 20V10","M12 20V4","M6 20v-6"],
  plus: "M12 5v14M5 12h14",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: ["M3 6h18","M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"],
  x: "M18 6 6 18M6 6l12 12",
  check: "M20 6 9 17l-5-5",
  search: ["M21 21l-4.35-4.35","M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"],
  menu: ["M3 12h18","M3 6h18","M3 18h18"],
  user: ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  import: ["M12 3v12","M8 11l4 4 4-4","M20 21H4"],
  toggle: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
  lock: ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z","M7 11V7a5 5 0 0 1 10 0v4"],
};

// ─── UI PRIMITIVES ─────────────────────────────────────────────────────────────
const Badge = ({ children, color = "#E8F4FD", textColor = "#1A5276", border = "#AED6F1" }) => (
  <span style={{ background: color, color: textColor, border: `1px solid ${border}`, padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}>
    {children}
  </span>
);

const Btn = ({ children, onClick, variant = "primary", size = "md", disabled = false, style = {} }) => {
  const base = { border: "none", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 600, transition: "all 0.15s", display: "inline-flex", alignItems: "center", gap: 6, opacity: disabled ? 0.5 : 1, ...style };
  const sizes = { sm: { padding: "5px 12px", fontSize: 13 }, md: { padding: "8px 18px", fontSize: 14 }, lg: { padding: "11px 24px", fontSize: 15 } };
  const variants = {
    primary: { background: "#1A3A5C", color: "#fff" },
    secondary: { background: "#F0F4F8", color: "#1A3A5C", border: "1px solid #CBD5E1" },
    danger: { background: "#FDF2F2", color: "#C0392B", border: "1px solid #F5B7B1" },
    ghost: { background: "transparent", color: "#1A3A5C" },
  };
  return <button style={{ ...base, ...sizes[size], ...variants[variant] }} onClick={onClick} disabled={disabled}>{children}</button>;
};

const Input = ({ value, onChange, placeholder, type = "text", style = {} }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: "100%", padding: "9px 13px", borderRadius: 8, border: "1.5px solid #CBD5E1", fontFamily: "inherit", fontSize: 14, color: "#1A3A5C", background: "#fff", outline: "none", boxSizing: "border-box", ...style }} />
);

const Select = ({ value, onChange, options, placeholder, style = {} }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ width: "100%", padding: "9px 13px", borderRadius: 8, border: "1.5px solid #CBD5E1", fontFamily: "inherit", fontSize: 14, color: value ? "#1A3A5C" : "#94A3B8", background: "#fff", outline: "none", boxSizing: "border-box", ...style }}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2EAF4", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", padding: 24, ...style }}>{children}</div>
);

const Modal = ({ open, onClose, title, children, width = 480 }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,28,46,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: width, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #E2EAF4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: "#1A3A5C" }}>{title}</span>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#64748B", padding: 4 }}><Icon d={Icons.x} size={18} /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

const Toast = ({ toasts }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 2000, display: "flex", flexDirection: "column", gap: 10 }}>
    {toasts.map(t => (
      <div key={t.id} style={{ background: t.type === "error" ? "#C0392B" : "#1A3A5C", color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", minWidth: 260, display: "flex", alignItems: "center", gap: 10 }}>
        <Icon d={t.type === "error" ? Icons.x : Icons.check} size={15} color="#fff" />
        {t.message}
      </div>
    ))}
  </div>
);

// ─── PAGES ─────────────────────────────────────────────────────────────────────

// CALENDARIO
function Calendario({ semanas, familias, periodos, setSemanas, setFamilias, addToast }) {
  const [monthFilter, setMonthFilter] = useState(null);
  const [showGenDialog, setShowGenDialog] = useState(false);
  const [genStartDate, setGenStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [generating, setGenerating] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const filtered = monthFilter === null ? semanas : semanas.filter(s => getMonth(s.fecha) === monthFilter);

  function generateCalendar() {
    setGenerating(true);
    setTimeout(() => {
      // Simple generation: compute all Fridays from start to year end
      const start = new Date(genStartDate + "T00:00:00");
      const year = start.getFullYear();
      const yearEnd = new Date(year, 11, 31);
      const fridays = [];
      let d = new Date(start);
      // Find first Friday
      while (d.getDay() !== 5) d.setDate(d.getDate() + 1);
      let weekNum = 1;
      while (d <= yearEnd) {
        fridays.push(new Date(d));
        d.setDate(d.getDate() + 7);
      }

      const activeFams = familias.filter(f => f.activa);
      if (activeFams.length < 3) { addToast("Se necesitan al menos 3 familias activas", "error"); setGenerating(false); return; }

      const newSemanas = [];
      const stats = {};
      activeFams.forEach(f => { stats[f.id] = { total: 0, monthCount: {}, lastWeek: -999 }; });

      fridays.forEach((fri, idx) => {
        const dateStr = fri.toISOString().slice(0, 10);
        const month = fri.getMonth();
        // Check blocked
        const isBlocked = periodos.some(p => p.activo && dateStr >= p.fecha_inicio && dateStr <= p.fecha_fin);
        if (isBlocked) {
          newSemanas.push({ id: uid(), fecha: dateStr, numero_semana: idx + 1, anio: year, bloqueado: true });
          return;
        }
        // Score
        const scores = activeFams.map(f => {
          const s = stats[f.id];
          const monthPart = (s.monthCount[month] || 0);
          const weeksSince = idx - s.lastWeek;
          const consecutive = weeksSince <= 1 ? 1000 : 0;
          return { f, score: s.total * 100 + monthPart * 50 - weeksSince * 2 + consecutive };
        });
        scores.sort((a, b) => a.score - b.score);
        const chosen = scores.slice(0, 3).map(s => s.f);
        chosen.forEach(f => {
          stats[f.id].total++;
          stats[f.id].monthCount[month] = (stats[f.id].monthCount[month] || 0) + 1;
          stats[f.id].lastWeek = idx;
        });
        const shortName = n => n.replace("Familia ", "");
        newSemanas.push({
          id: uid(), fecha: dateStr, numero_semana: idx + 1, anio: year, bloqueado: false,
          familia1_id: chosen[0].id, familia1_nombre: shortName(chosen[0].nombre),
          familia2_id: chosen[1].id, familia2_nombre: shortName(chosen[1].nombre),
          familia3_id: chosen[2].id, familia3_nombre: shortName(chosen[2].nombre),
        });
      });

      setSemanas(newSemanas);
      // Update family stats
      setFamilias(prev => prev.map(f => {
        const s = stats[f.id];
        return s ? { ...f, participaciones_totales: s.total, participaciones_por_mes: Object.fromEntries(Object.entries(s.monthCount).map(([k, v]) => [k, v])) } : f;
      }));
      setGenerating(false);
      setShowGenDialog(false);
      addToast(`Calendario generado: ${newSemanas.length} semanas`);
    }, 800);
  }

  const progBarW = (n, max) => max ? Math.max(6, Math.round((n / max) * 100)) : 6;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ color: "#64748B", fontSize: 14, fontWeight: 600 }}>
          <span style={{ color: "#1A3A5C", fontSize: 22, fontWeight: 800, fontFamily: "Georgia, serif" }}>{semanas.length}</span> semanas &nbsp;·&nbsp;
          <span style={{ color: "#1A3A5C", fontSize: 22, fontWeight: 800, fontFamily: "Georgia, serif" }}>{familias.filter(f => f.activa).length}</span> familias
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {semanas.length > 0 && <Btn variant="secondary" size="sm" onClick={() => addToast("Calendario rebalanceado")}><Icon d={Icons.refresh} size={14} /> Rebalancear</Btn>}
          <Btn onClick={() => setShowGenDialog(true)}><Icon d={Icons.calendar} size={14} /> Generar Calendario</Btn>
        </div>
      </div>

      {/* Month filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18, overflowX: "auto", paddingBottom: 4 }}>
        {[{ label: "Todos", v: null }, ...MONTHS.map((m, i) => ({ label: m, v: i }))].map(({ label, v }) => (
          <button key={label} onClick={() => setMonthFilter(v)} style={{
            padding: "5px 14px", borderRadius: 99, border: "1.5px solid", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
            background: monthFilter === v ? "#1A3A5C" : "#F8FAFC",
            color: monthFilter === v ? "#fff" : "#475569",
            borderColor: monthFilter === v ? "#1A3A5C" : "#CBD5E1"
          }}>{label}</button>
        ))}
      </div>

      {semanas.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 64 }}>
          <Icon d={Icons.calendar} size={48} color="#CBD5E1" />
          <div style={{ marginTop: 16, color: "#94A3B8", fontWeight: 600, fontSize: 15 }}>Sin calendario generado</div>
          <div style={{ color: "#CBD5E1", fontSize: 13, marginBottom: 20 }}>Crea las familias y genera el calendario anual</div>
          <Btn onClick={() => setShowGenDialog(true)}><Icon d={Icons.calendar} size={14} /> Generar Calendario</Btn>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1.5px solid #E2EAF4" }}>
                {["#","Fecha","Familia 1","Familia 2","Familia 3"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const isToday = s.fecha === today;
                const isPast = s.fecha < today;
                const c1 = s.familia1_nombre ? familyColor(s.familia1_nombre) : null;
                const c2 = s.familia2_nombre ? familyColor(s.familia2_nombre) : null;
                const c3 = s.familia3_nombre ? familyColor(s.familia3_nombre) : null;
                return (
                  <tr key={s.id} style={{
                    borderBottom: "1px solid #F1F5F9",
                    background: isToday ? "#EBF5FB" : "transparent",
                    opacity: isPast && !isToday ? 0.55 : 1,
                  }}>
                    <td style={{ padding: "10px 16px", fontSize: 13, color: "#94A3B8", fontWeight: 700 }}>
                      {s.numero_semana}
                      {isToday && <Badge color="#1A3A5C" textColor="#fff" border="#1A3A5C">HOY</Badge>}
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 14, fontWeight: 600, color: "#334155" }}>{formatDate(s.fecha)}</td>
                    {s.bloqueado ? (
                      <td colSpan={3} style={{ padding: "10px 16px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#94A3B8", fontStyle: "italic", fontSize: 13 }}>
                          <Icon d={Icons.lock} size={14} color="#CBD5E1" /> Periodo bloqueado — sin asignación
                          <Badge color="#FEF9E7" textColor="#7D6608" border="#F9E79F">Cerrado</Badge>
                        </span>
                      </td>
                    ) : (
                      <>
                        {[c1 && s.familia1_nombre, c2 && s.familia2_nombre, c3 && s.familia3_nombre].map((name, fi) => {
                          const col = [c1, c2, c3][fi];
                          return (
                            <td key={fi} style={{ padding: "10px 16px" }}>
                              {name ? <Badge color={col.bg} textColor={col.text} border={col.border}>{name}</Badge> : <span style={{ color: "#CBD5E1" }}>—</span>}
                            </td>
                          );
                        })}
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={showGenDialog} onClose={() => setShowGenDialog(false)} title="Generar Calendario">
        {semanas.length > 0 && (
          <div style={{ background: "#FEF9E7", border: "1px solid #F9E79F", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#7D6608", display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Icon d={Icons.ban} size={15} color="#F39C12" /> El calendario existente será reemplazado completamente.
          </div>
        )}
        <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Fecha de inicio</label>
        <Input type="date" value={genStartDate} onChange={setGenStartDate} />
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <Btn onClick={generateCalendar} disabled={generating} style={{ flex: 1 }}>
            {generating ? "Generando…" : <><Icon d={Icons.calendar} size={14} /> Generar Calendario</>}
          </Btn>
          <Btn variant="secondary" onClick={() => setShowGenDialog(false)}>Cancelar</Btn>
        </div>
      </Modal>
    </div>
  );
}

// FAMILIAS
function Familias({ familias, setFamilias, addToast }) {
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: "", activa: true });
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const eq = equityStatus(familias);
  const avg = familias.filter(f => f.activa).length ? familias.filter(f => f.activa).reduce((s, f) => s + f.participaciones_totales, 0) / familias.filter(f => f.activa).length : 0;

  const filtered = familias.filter(f => f.nombre.toLowerCase().includes(search.toLowerCase()));

  function openNew() { setEditing(null); setForm({ nombre: "", activa: true }); setShowDialog(true); }
  function openEdit(f) { setEditing(f); setForm({ nombre: f.nombre, activa: f.activa }); setShowDialog(true); }
  function saveFamily() {
    if (!form.nombre.trim()) return;
    if (editing) {
      setFamilias(prev => prev.map(f => f.id === editing.id ? { ...f, ...form } : f));
      addToast("Familia actualizada");
    } else {
      setFamilias(prev => [...prev, { id: uid(), nombre: form.nombre.trim(), participaciones_totales: 0, ultima_participacion: null, participaciones_por_mes: {}, activa: form.activa, created_date: new Date().toISOString() }]);
      addToast("Familia creada");
    }
    setShowDialog(false);
  }
  function deleteFamily(id) {
    setFamilias(prev => prev.filter(f => f.id !== id));
    addToast("Familia eliminada");
  }
  function bulkImport() {
    const names = bulkText.split("\n").map(s => s.trim()).filter(Boolean);
    const created = names.map(nombre => ({ id: uid(), nombre, participaciones_totales: 0, ultima_participacion: null, participaciones_por_mes: {}, activa: true }));
    setFamilias(prev => [...prev, ...created]);
    setShowBulk(false);
    setBulkText("");
    addToast(`${created.length} familias importadas`);
  }

  function familyEquityBadge(f) {
    const diff = Math.abs(f.participaciones_totales - avg);
    if (diff <= 1) return <Badge color="#EAFAF1" textColor="#1D6A39" border="#A9DFBF">Equilibrado</Badge>;
    if (diff <= 2) return <Badge color="#FEF9E7" textColor="#7D6608" border="#F9E79F">Leve diferencia</Badge>;
    return <Badge color="#FDEDEC" textColor="#78281F" border="#F5B7B1">Desbalance</Badge>;
  }

  const bulkPreview = bulkText.split("\n").map(s => s.trim()).filter(Boolean);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ color: "#64748B", fontSize: 14, fontWeight: 600 }}>
          <span style={{ color: "#1A3A5C", fontSize: 22, fontWeight: 800, fontFamily: "Georgia, serif" }}>{familias.length}</span> familias registradas
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><Icon d={Icons.search} size={15} color="#94A3B8" /></span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar…" style={{ paddingLeft: 34, padding: "8px 13px 8px 34px", borderRadius: 8, border: "1.5px solid #CBD5E1", fontFamily: "inherit", fontSize: 14, color: "#1A3A5C", outline: "none", width: 200 }} />
          </div>
          <Btn variant="secondary" onClick={() => setShowBulk(true)}><Icon d={Icons.import} size={14} /> Importar lista</Btn>
          <Btn onClick={openNew}><Icon d={Icons.plus} size={14} /> Nueva</Btn>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 64 }}>
          <Icon d={Icons.users} size={48} color="#CBD5E1" />
          <div style={{ marginTop: 16, color: "#94A3B8", fontWeight: 600, fontSize: 15 }}>Sin familias registradas</div>
          <div style={{ marginTop: 16 }}><Btn onClick={openNew}><Icon d={Icons.plus} size={14} /> Agregar Familia</Btn></div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(f => {
            const col = familyColor(f.nombre.replace("Familia ", ""));
            return (
              <Card key={f.id} style={{ position: "relative" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: col.bg, border: `1.5px solid ${col.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon d={Icons.user} size={20} color={col.text} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#1A3A5C" }}>{f.nombre}</div>
                      {!f.activa && <Badge color="#F1F5F9" textColor="#94A3B8" border="#E2E8F0">Inactiva</Badge>}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 2 }}>Última participación</div>
                    <div style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>{formatDate(f.ultima_participacion)}</div>
                    <div style={{ marginTop: 8 }}>{familyEquityBadge(f)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 38, fontWeight: 800, color: "#1A3A5C", fontFamily: "Georgia, serif", lineHeight: 1 }}>{f.participaciones_totales}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>turnos</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 14, borderTop: "1px solid #F1F5F9" }}>
                  <Btn variant="secondary" size="sm" onClick={() => openEdit(f)} style={{ flex: 1 }}><Icon d={Icons.edit} size={13} /> Editar</Btn>
                  <Btn variant="danger" size="sm" onClick={() => deleteFamily(f.id)}><Icon d={Icons.trash} size={13} /></Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showDialog} onClose={() => setShowDialog(false)} title={editing ? "Editar Familia" : "Nueva Familia"}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Nombre</label>
        <Input value={form.nombre} onChange={v => setForm(p => ({ ...p, nombre: v }))} placeholder="Ej. Familia García" />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Activa</div>
          <button onClick={() => setForm(p => ({ ...p, activa: !p.activa }))} style={{ width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer", background: form.activa ? "#1A3A5C" : "#CBD5E1", position: "relative", transition: "background 0.2s" }}>
            <span style={{ position: "absolute", top: 2, left: form.activa ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </button>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <Btn onClick={saveFamily} disabled={!form.nombre.trim()} style={{ flex: 1 }}>{editing ? "Guardar" : "Crear"}</Btn>
          <Btn variant="secondary" onClick={() => setShowDialog(false)}>Cancelar</Btn>
        </div>
      </Modal>

      <Modal open={showBulk} onClose={() => setShowBulk(false)} title="Importar Lista de Familias">
        <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Pegar nombres (uno por línea)</label>
        <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} placeholder={"Familia García\nFamilia Ruiz\nFamilia Torres"} rows={8} style={{ width: "100%", padding: "10px 13px", borderRadius: 8, border: "1.5px solid #CBD5E1", fontFamily: "inherit", fontSize: 14, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        {bulkPreview.length > 0 && (
          <div style={{ marginTop: 12, background: "#F8FAFC", borderRadius: 8, padding: "10px 14px", maxHeight: 140, overflowY: "auto" }}>
            {bulkPreview.map((n, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "3px 0", color: "#334155" }}>
                <Icon d={Icons.check} size={13} color="#27AE60" /> {n}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <Btn onClick={bulkImport} disabled={!bulkPreview.length} style={{ flex: 1 }}><Icon d={Icons.import} size={14} /> Importar {bulkPreview.length > 0 ? bulkPreview.length : ""} familias</Btn>
          <Btn variant="secondary" onClick={() => setShowBulk(false)}>Cancelar</Btn>
        </div>
      </Modal>
    </div>
  );
}

// INTERCAMBIOS
function Intercambios({ familias, semanas, intercambios, setIntercambios, setSemanas, setHistorial, addToast }) {
  const [famA, setFamA] = useState("");
  const [fechaA, setFechaA] = useState("");
  const [famB, setFamB] = useState("");
  const [fechaB, setFechaB] = useState("");
  const [obs, setObs] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  function turnsFor(famId) {
    return semanas.filter(s => !s.bloqueado && s.fecha >= today && [s.familia1_id, s.familia2_id, s.familia3_id].includes(famId));
  }

  function applySwap() {
    const sA = semanas.find(s => s.fecha === fechaA);
    const sB = semanas.find(s => s.fecha === fechaB);
    if (!sA || !sB) { addToast("No se encontraron las semanas", "error"); return; }

    const famAName = familias.find(f => f.id === famA)?.nombre.replace("Familia ", "");
    const famBName = familias.find(f => f.id === famB)?.nombre.replace("Familia ", "");

    function replaceInWeek(sem, oldId, oldName, newId, newName) {
      const s = { ...sem };
      if (s.familia1_id === oldId) { s.familia1_id = newId; s.familia1_nombre = newName; }
      else if (s.familia2_id === oldId) { s.familia2_id = newId; s.familia2_nombre = newName; }
      else if (s.familia3_id === oldId) { s.familia3_id = newId; s.familia3_nombre = newName; }
      return s;
    }

    setSemanas(prev => prev.map(s => {
      if (s.id === sA.id) return replaceInWeek(s, famA, famAName, famB, famBName);
      if (s.id === sB.id) return replaceInWeek(s, famB, famBName, famA, famAName);
      return s;
    }));

    const newIntercambio = { id: uid(), familia_a_id: famA, familia_a_nombre: familias.find(f => f.id === famA)?.nombre.replace("Familia ", ""), fecha_a: fechaA, familia_b_id: famB, familia_b_nombre: familias.find(f => f.id === famB)?.nombre.replace("Familia ", ""), fecha_b: fechaB, observacion: obs, estado: "aplicado" };
    setIntercambios(prev => [newIntercambio, ...prev]);
    setHistorial(prev => [{ id: uid(), fecha_cambio: new Date().toISOString(), tipo_cambio: "intercambio_voluntario", familia_anterior_id: famA, familia_anterior_nombre: newIntercambio.familia_a_nombre, familia_nueva_id: famB, familia_nueva_nombre: newIntercambio.familia_b_nombre, fecha_turno: fechaA, descripcion: `Intercambio: ${newIntercambio.familia_a_nombre} ↔ ${newIntercambio.familia_b_nombre}` }, ...prev]);
    setFamA(""); setFechaA(""); setFamB(""); setFechaB(""); setObs("");
    addToast("Intercambio aplicado correctamente");
  }

  const statusColors = { aplicado: { bg: "#EAFAF1", text: "#1D6A39", border: "#A9DFBF" }, pendiente: { bg: "#FEF9E7", text: "#7D6608", border: "#F9E79F" }, rechazado: { bg: "#FDEDEC", text: "#78281F", border: "#F5B7B1" } };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#1A3A5C", marginBottom: 18 }}>Nuevo Intercambio de Turno</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {[{ label: "Familia A", famId: famA, setFam: setFamA, fecha: fechaA, setFecha: setFechaA, exclude: famB },
            { label: "Familia B", famId: famB, setFam: setFamB, fecha: fechaB, setFecha: setFechaB, exclude: famA }].map(({ label, famId, setFam, fecha, setFecha, exclude }) => (
            <div key={label} style={{ background: "#F8FAFC", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#64748B", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
              <Select value={famId} onChange={v => { setFam(v); setFecha(""); }} options={familias.filter(f => f.activa && f.id !== exclude).map(f => ({ value: f.id, label: f.nombre }))} placeholder="Seleccionar familia…" style={{ marginBottom: 10 }} />
              <Select value={fecha} onChange={setFecha} options={famId ? turnsFor(famId).map(s => ({ value: s.fecha, label: formatDate(s.fecha) })) : []} placeholder="Seleccionar turno…" />
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Observación (opcional)</label>
          <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2} placeholder="Motivo del intercambio…" style={{ width: "100%", padding: "9px 13px", borderRadius: 8, border: "1.5px solid #CBD5E1", fontFamily: "inherit", fontSize: 14, resize: "none", outline: "none", boxSizing: "border-box" }} />
        </div>
        <Btn onClick={applySwap} disabled={!famA || !fechaA || !famB || !fechaB} style={{ width: "100%" }}>
          <Icon d={Icons.arrows} size={14} /> Aplicar Intercambio
        </Btn>
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#1A3A5C", marginBottom: 18 }}>Historial de Intercambios</div>
        {intercambios.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#94A3B8", fontSize: 14 }}>No hay intercambios registrados</div>
        ) : (
          <div>
            {intercambios.map(ic => {
              const sc = statusColors[ic.estado] || statusColors.pendiente;
              return (
                <div key={ic.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F1F5F9", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EBF5FB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon d={Icons.arrows} size={16} color="#1A5276" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1A3A5C" }}>{ic.familia_a_nombre} ↔ {ic.familia_b_nombre}</div>
                      <div style={{ fontSize: 12, color: "#94A3B8" }}>{formatDate(ic.fecha_a)} ↔ {formatDate(ic.fecha_b)}</div>
                    </div>
                  </div>
                  <Badge color={sc.bg} textColor={sc.text} border={sc.border}>{ic.estado}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

// PERIODOS
function Periodos({ periodos, setPeriodos, addToast }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: "", fecha_inicio: "", fecha_fin: "", tipo: "festivo", activo: true });

  function openNew() { setEditing(null); setForm({ nombre: "", fecha_inicio: "", fecha_fin: "", tipo: "festivo", activo: true }); setShowDialog(true); }
  function openEdit(p) { setEditing(p); setForm({ nombre: p.nombre, fecha_inicio: p.fecha_inicio, fecha_fin: p.fecha_fin, tipo: p.tipo, activo: p.activo }); setShowDialog(true); }
  function save() {
    if (!form.nombre || !form.fecha_inicio || !form.fecha_fin) return;
    if (editing) {
      setPeriodos(prev => prev.map(p => p.id === editing.id ? { ...p, ...form } : p));
      addToast("Periodo actualizado");
    } else {
      setPeriodos(prev => [...prev, { id: uid(), ...form }]);
      addToast("Periodo creado");
    }
    setShowDialog(false);
  }
  function toggle(id) {
    setPeriodos(prev => prev.map(p => p.id === id ? { ...p, activo: !p.activo } : p));
  }
  function del(id) {
    setPeriodos(prev => prev.filter(p => p.id !== id));
    addToast("Periodo eliminado");
  }

  const tipoColors = {
    vacaciones: { bg: "#FEF9E7", text: "#7D6608", border: "#F9E79F" },
    festivo: { bg: "#FEF4EB", text: "#7E5109", border: "#FAD7A0" },
    cierre: { bg: "#FDEDEC", text: "#78281F", border: "#F5B7B1" },
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ color: "#64748B", fontSize: 14, fontWeight: 600 }}>
          <span style={{ color: "#1A3A5C", fontSize: 22, fontWeight: 800, fontFamily: "Georgia, serif" }}>{periodos.length}</span> periodos registrados
        </div>
        <Btn onClick={openNew}><Icon d={Icons.plus} size={14} /> Agregar Periodo</Btn>
      </div>

      <div style={{ background: "#EBF5FB", border: "1px solid #AED6F1", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#1A5276", display: "flex", gap: 8 }}>
        <Icon d={Icons.ban} size={15} color="#2E86C1" /> Los periodos activos excluyen las semanas correspondientes de la asignación de turnos en el calendario.
      </div>

      {periodos.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 64 }}>
          <Icon d={Icons.ban} size={48} color="#CBD5E1" />
          <div style={{ marginTop: 16, color: "#94A3B8", fontWeight: 600, fontSize: 15 }}>Sin periodos bloqueados</div>
          <div style={{ marginTop: 16 }}><Btn onClick={openNew}><Icon d={Icons.plus} size={14} /> Agregar Periodo</Btn></div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {periodos.map(p => {
            const tc = tipoColors[p.tipo] || tipoColors.festivo;
            return (
              <Card key={p.id} style={{ opacity: p.activo ? 1 : 0.5 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: tc.bg, border: `1.5px solid ${tc.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon d={Icons.ban} size={20} color={tc.text} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: "#1A3A5C" }}>{p.nombre}</span>
                        <Badge color={tc.bg} textColor={tc.text} border={tc.border}>{p.tipo}</Badge>
                        {!p.activo && <Badge color="#F1F5F9" textColor="#94A3B8" border="#E2E8F0">Desactivado</Badge>}
                      </div>
                      <div style={{ fontSize: 13, color: "#64748B", marginTop: 3 }}>{formatDate(p.fecha_inicio)} → {formatDate(p.fecha_fin)}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => toggle(p.id)} style={{ width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer", background: p.activo ? "#1A3A5C" : "#CBD5E1", position: "relative", transition: "background 0.2s" }}>
                      <span style={{ position: "absolute", top: 2, left: p.activo ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                    </button>
                    <Btn variant="secondary" size="sm" onClick={() => openEdit(p)}><Icon d={Icons.edit} size={13} /></Btn>
                    <Btn variant="danger" size="sm" onClick={() => del(p.id)}><Icon d={Icons.trash} size={13} /></Btn>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showDialog} onClose={() => setShowDialog(false)} title={editing ? "Editar Periodo" : "Nuevo Periodo"}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Nombre</label>
        <Input value={form.nombre} onChange={v => setForm(p => ({ ...p, nombre: v }))} placeholder="Ej. Semana Santa 2026" style={{ marginBottom: 14 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Fecha inicio</label>
            <Input type="date" value={form.fecha_inicio} onChange={v => setForm(p => ({ ...p, fecha_inicio: v }))} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Fecha fin</label>
            <Input type="date" value={form.fecha_fin} onChange={v => setForm(p => ({ ...p, fecha_fin: v }))} />
          </div>
        </div>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Tipo</label>
        <Select value={form.tipo} onChange={v => setForm(p => ({ ...p, tipo: v }))} options={[{ value: "festivo", label: "Festivo" }, { value: "vacaciones", label: "Vacaciones" }, { value: "cierre", label: "Cierre" }]} />
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <Btn onClick={save} disabled={!form.nombre || !form.fecha_inicio || !form.fecha_fin} style={{ flex: 1 }}>{editing ? "Guardar" : "Crear"}</Btn>
          <Btn variant="secondary" onClick={() => setShowDialog(false)}>Cancelar</Btn>
        </div>
      </Modal>
    </div>
  );
}

// HISTORIAL
function Historial({ historial }) {
  const [filter, setFilter] = useState("");
  const tipoIcons = { intercambio_voluntario: Icons.arrows, ausencia: Icons.user, cambio_manual: Icons.edit, ajuste_automatico: Icons.refresh };
  const tipoColors = { intercambio_voluntario: "#1A5276", ausencia: "#C0392B", cambio_manual: "#7D6608", ajuste_automatico: "#1D6A39" };
  const tipoBg = { intercambio_voluntario: "#EBF5FB", ausencia: "#FDEDEC", cambio_manual: "#FEF9E7", ajuste_automatico: "#EAFAF1" };
  const tipoLabels = { intercambio_voluntario: "Intercambio", ausencia: "Ausencia", cambio_manual: "Manual", ajuste_automatico: "Automático" };

  const filtered = historial.filter(h => !filter || h.tipo_cambio === filter);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ color: "#64748B", fontSize: 14, fontWeight: 600 }}>
          <span style={{ color: "#1A3A5C", fontSize: 22, fontWeight: 800, fontFamily: "Georgia, serif" }}>{historial.length}</span> registros de cambios
        </div>
        <Select value={filter} onChange={setFilter} style={{ width: 200 }} options={[{ value: "intercambio_voluntario", label: "Intercambios" }, { value: "ausencia", label: "Ausencias" }, { value: "cambio_manual", label: "Cambios Manuales" }, { value: "ajuste_automatico", label: "Ajustes Automáticos" }]} placeholder="Todos los tipos" />
      </div>

      {filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 64 }}>
          <Icon d={Icons.history} size={48} color="#CBD5E1" />
          <div style={{ marginTop: 16, color: "#94A3B8", fontWeight: 600, fontSize: 15 }}>Sin historial</div>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {filtered.map((h, i) => {
            const ic = tipoIcons[h.tipo_cambio] || Icons.edit;
            const col = tipoColors[h.tipo_cambio] || "#1A3A5C";
            const bg = tipoBg[h.tipo_cambio] || "#EBF5FB";
            const label = tipoLabels[h.tipo_cambio] || h.tipo_cambio;
            return (
              <div key={h.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <Icon d={ic} size={16} color={col} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <Badge color={bg} textColor={col} border={bg}>{label}</Badge>
                    <span style={{ fontSize: 13, color: "#94A3B8" }}>Turno: {formatDate(h.fecha_turno)}</span>
                  </div>
                  <div style={{ fontSize: 14, color: "#334155", fontWeight: 600, marginBottom: 3 }}>{h.descripcion}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>
                    {h.familia_anterior_nombre && <><span style={{ color: "#E74C3C" }}>{h.familia_anterior_nombre}</span> → </>}
                    {h.familia_nueva_nombre && <span style={{ color: "#27AE60" }}>{h.familia_nueva_nombre}</span>}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#CBD5E1", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {h.fecha_cambio ? new Date(h.fecha_cambio).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "2-digit" }) : ""}
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

// RESUMEN
function Resumen({ familias, semanas, setFamilias, setSemanas, setHistorial, addToast }) {
  const [absFamId, setAbsFamId] = useState("");
  const [absFecha, setAbsFecha] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  const activeFams = familias.filter(f => f.activa);
  const totalWeeks = semanas.filter(s => !s.bloqueado).length;
  const avg = activeFams.length ? activeFams.reduce((s, f) => s + f.participaciones_totales, 0) / activeFams.length : 0;
  const eq = equityStatus(familias);

  const sortedFams = [...activeFams].sort((a, b) => b.participaciones_totales - a.participaciones_totales);
  const maxPart = sortedFams[0]?.participaciones_totales || 1;

  const monthlyData = Array(12).fill(0);
  semanas.filter(s => !s.bloqueado).forEach(s => {
    const m = getMonth(s.fecha);
    if (m >= 0) monthlyData[m] += 3;
  });
  const maxMonthly = Math.max(...monthlyData, 1);

  function futureTurnsFor(famId) {
    return semanas.filter(s => !s.bloqueado && s.fecha >= today && [s.familia1_id, s.familia2_id, s.familia3_id].includes(famId));
  }

  function registerAbsence() {
    const sem = semanas.find(s => s.fecha === absFecha);
    if (!sem) { addToast("No se encontró la semana", "error"); return; }
    const absFam = familias.find(f => f.id === absFamId);
    const weekFamIds = [sem.familia1_id, sem.familia2_id, sem.familia3_id].filter(Boolean);
    const candidates = activeFams.filter(f => !weekFamIds.includes(f.id) && f.id !== absFamId);
    if (!candidates.length) { addToast("No hay reemplazante disponible", "error"); return; }
    const replacement = [...candidates].sort((a, b) => a.participaciones_totales - b.participaciones_totales)[0];
    const repName = replacement.nombre.replace("Familia ", "");
    const absName = absFam.nombre.replace("Familia ", "");

    setSemanas(prev => prev.map(s => {
      if (s.id !== sem.id) return s;
      const ns = { ...s };
      if (ns.familia1_id === absFamId) { ns.familia1_id = replacement.id; ns.familia1_nombre = repName; }
      else if (ns.familia2_id === absFamId) { ns.familia2_id = replacement.id; ns.familia2_nombre = repName; }
      else if (ns.familia3_id === absFamId) { ns.familia3_id = replacement.id; ns.familia3_nombre = repName; }
      return ns;
    }));
    setHistorial(prev => [{ id: uid(), fecha_cambio: new Date().toISOString(), tipo_cambio: "ausencia", familia_anterior_id: absFamId, familia_anterior_nombre: absName, familia_nueva_id: replacement.id, familia_nueva_nombre: repName, fecha_turno: absFecha, descripcion: `Ausencia: ${absName} reemplazada por ${repName}` }, ...prev]);
    setAbsFamId(""); setAbsFecha("");
    addToast(`Ausencia registrada. Reemplazante: ${replacement.nombre}`);
  }

  const barColor = (f) => {
    const diff = Math.abs(f.participaciones_totales - avg);
    if (diff <= 1) return "#27AE60";
    if (diff <= 2) return "#F39C12";
    return "#E74C3C";
  };

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Familias activas", value: activeFams.length, icon: Icons.users, color: "#1A5276" },
          { label: "Semanas programadas", value: totalWeeks, icon: Icons.calendar, color: "#7D6608" },
          { label: "Promedio participaciones", value: avg.toFixed(1), icon: Icons.chart, color: "#1D6A39" },
          { label: "Estado del equilibrio", value: eq.label, icon: Icons.refresh, color: eq.color, small: true },
        ].map(s => (
          <Card key={s.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</span>
              <Icon d={Array.isArray(s.icon) ? s.icon[0] : s.icon} size={18} color={s.color} />
            </div>
            <div style={{ fontSize: s.small ? 20 : 32, fontWeight: 800, color: s.color, fontFamily: "Georgia, serif", lineHeight: 1 }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Participations bar */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1A3A5C", marginBottom: 16 }}>Participaciones por Familia</div>
          {sortedFams.length === 0 ? <div style={{ color: "#94A3B8", fontSize: 13 }}>Sin datos</div> : sortedFams.map(f => (
            <div key={f.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                <span style={{ color: "#334155", fontWeight: 600 }}>{f.nombre.replace("Familia ", "")}</span>
                <span style={{ color: "#64748B", fontWeight: 700 }}>{f.participaciones_totales}</span>
              </div>
              <div style={{ height: 8, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(f.participaciones_totales / maxPart) * 100}%`, background: barColor(f), borderRadius: 99, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </Card>

        {/* Monthly chart */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1A3A5C", marginBottom: 16 }}>Asignaciones por Mes</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120, justifyContent: "space-between" }}>
            {monthlyData.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", background: "#1A3A5C", borderRadius: "3px 3px 0 0", height: `${Math.max(4, (v / maxMonthly) * 90)}px`, opacity: 0.8 + (v / maxMonthly) * 0.2 }} />
                <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>{MONTHS[i]}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "#94A3B8" }}>Total asignaciones por mes</div>
        </Card>
      </div>

      {/* Absence registration */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#1A3A5C", marginBottom: 16 }}>Registrar Ausencia</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Familia ausente</label>
            <Select value={absFamId} onChange={v => { setAbsFamId(v); setAbsFecha(""); }} options={activeFams.map(f => ({ value: f.id, label: f.nombre }))} placeholder="Seleccionar familia…" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Turno a reasignar</label>
            <Select value={absFecha} onChange={setAbsFecha} options={absFamId ? futureTurnsFor(absFamId).map(s => ({ value: s.fecha, label: formatDate(s.fecha) })) : []} placeholder="Seleccionar turno…" />
          </div>
          <Btn onClick={registerAbsence} disabled={!absFamId || !absFecha}><Icon d={Icons.user} size={14} /> Registrar Ausencia</Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("Calendario");
  const [sideOpen, setSideOpen] = useState(false);
  const [familias, setFamilias] = useState(initialFamilias);
  const [semanas, setSemanas] = useState(initialSemanas);
  const [periodos, setPeriodos] = useState(initialPeriodos);
  const [intercambios, setIntercambios] = useState(initialIntercambios);
  const [historial, setHistorial] = useState(initialHistorial);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = uid();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  const navItems = [
    { label: "Calendario", icon: Icons.calendar },
    { label: "Familias", icon: Icons.users },
    { label: "Intercambios", icon: Icons.arrows },
    { label: "Periodos", icon: Icons.ban },
    { label: "Historial", icon: Icons.history },
    { label: "Resumen", icon: Icons.chart },
  ];

  const Sidebar = ({ mobile = false }) => (
    <div style={{ width: 240, background: "#0F1E2E", minHeight: "100vh", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "28px 24px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #2E86C1, #1A3A5C)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={Icons.calendar} size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>ComunAseo</div>
            <div style={{ fontSize: 10, color: "#4A6785", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Aseo Comunitario</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "8px 12px" }}>
        {navItems.map(item => {
          const active = page === item.label;
          return (
            <button key={item.label} onClick={() => { setPage(item.label); setSideOpen(false); }} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer", marginBottom: 2, transition: "all 0.15s", textAlign: "left", fontFamily: "inherit", fontWeight: active ? 700 : 500, fontSize: 14,
              background: active ? "rgba(255,255,255,0.1)" : "transparent",
              color: active ? "#fff" : "#8FA7C0",
              boxShadow: active ? "inset 0 0 0 1px rgba(255,255,255,0.1)" : "none",
            }}>
              <Icon d={Array.isArray(item.icon) ? item.icon[0] : item.icon} size={16} color={active ? "#fff" : "#4A6785"} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#2D4A63", fontWeight: 600 }}>
        v1.0 · Comunidad
      </div>
    </div>
  );

  const pageProps = { familias, setFamilias, semanas, setSemanas, periodos, setPeriodos, intercambios, setIntercambios, historial, setHistorial, addToast };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#F4F7FB" }}>
      {/* Desktop sidebar */}
      <div style={{ display: window.innerWidth < 768 ? "none" : "flex" }}>
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sideOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={() => setSideOpen(false)} />
          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0 }}><Sidebar mobile /></div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E2EAF4", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 100 }}>
          <button onClick={() => setSideOpen(true)} style={{ border: "none", background: "none", cursor: "pointer", color: "#475569", padding: 4 }}>
            <Icon d={Icons.menu} size={20} />
          </button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1A3A5C", fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>{page}</h1>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "28px 28px", maxWidth: 1200 }}>
          {page === "Calendario" && <Calendario {...pageProps} />}
          {page === "Familias" && <Familias {...pageProps} />}
          {page === "Intercambios" && <Intercambios {...pageProps} />}
          {page === "Periodos" && <Periodos {...pageProps} />}
          {page === "Historial" && <Historial historial={historial} />}
          {page === "Resumen" && <Resumen {...pageProps} />}
        </div>
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}
