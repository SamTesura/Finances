/* global React, ReactDOM, Recharts, XLSX */
const { useEffect, useMemo, useState, useRef } = React;
const {
  LineChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} = Recharts;

/**************************************
 * FINANCE APP — JS (v5)
 * - Formulas unchanged
 * - Dynamic timeline cadence (daily / 3d / 7d / 14d / 15d / monthly)
 * - Reproject rows when cadence changes
 * - Calendar click -> Add item on this date
 * - Enter submits, Esc closes; modal lock (single modal at a time)
 * - Target line on chart (only up to target date)
 * - Weekly summary table at end (always 7d cadence) with negative highlight
 * - Concept name non-editable after add (Rename button opens modal)
 * - X-axis labels rotated for readability
 **************************************/

/* ---------- i18n ---------- */
const messages = {
  en: {
    appTitle: "Finance Control",
    appTag: "Plan, track, and visualize cash flow with recurring items and targets.",
    balanceTab: "Balance",
    transactionsTab: "Transactions",
    eventsTab: "Events",
    calendarTab: "Calendar",
    kpiThisWeek: "This Period Balance",
    kpiYtd: "YTD Cumulative",
    target: "Target",
    targetDesc: "Set a target balance and date; chart shows progression up to that date.",
    setTarget: "Set Target",
    amount: "Amount",
    date: "Date",
    save: "Save",
    clear: "Clear",
    cashFlow: "Cash Flow",
    cashFlowDesc: "Balance per column and cumulative total.",
    add: "Add",
    label: "Label",
    startDate: "Start date",
    recurrence: "Recurrence",
    oneTime: "One-time",
    daily: "Daily",
    every3: "Every 3 days",
    weekly: "Weekly",
    biweekly: "Every 2 weeks",
    every15: "Every 15 days",
    monthly: "Monthly",
    bimonthly: "Every 2 months",
    quarterly: "Quarterly",
    yearly: "Yearly",
    income: "Income",
    creditCard: "Credit Card",
    expenses: "Expenses",
    debitAccount: "Debit Account",
    cash: "Cash",
    concept: "Concept",
    actions: "Actions",
    transactionsDesc: "Card cutoffs auto-calculated; credits/debits and difference preserved.",
    tFecha: "Date",
    tSemana: "Week #",
    tConcepto: "Description",
    tMonto: "Amount",
    tMetodo: "Payment method",
    tCuentas: "Account/Category",
    tDiaPlazo: "Planned day",
    tDiaCorte: "Billing cycle day",
    tCorteInput: "Cycle day (input)",
    tProxCorte: "Next statement date",
    tCreditosCorte: "Charges on statement (credit card)",
    tDebitosCorte: "Immediate debits (cash/debit)",
    tDif: "Difference vs. Current Balance",
    tBalanceAl: "Current balance",
    eventsDesc: "List upcoming events and a simple budget.",
    mes: "Month",
    dia: "Day",
    evento: "Event",
    presupuesto: "Budget",
    calendarTitle: "Calendar",
    calendarSelect: "Select a day to see details.",
    dueIncome: "Income due",
    dueOutflow: "Outflows due",
    onDay: "on",
    importedRows: (n)=>`Imported ${n} rows.`,
    importedJSON: "Data imported.",
    invalidJSON: "Invalid JSON.",
    exportJSON: "Export JSON",
    importData: "Import",
    exportData: "Export",
    addOnThisDate: "Add item on this date",
    section: "Section",
    cadence: "Timeline scale",
    cadence_daily: "Daily",
    cadence_3d: "Every 3 days",
    cadence_7d: "Weekly",
    cadence_14d: "Every 2 weeks",
    cadence_15d: "Every 15 days",
    cadence_1m: "Monthly",
    language: "Language",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    help: "Help",
    helpIntroTitle: "How this app works",
    helpIntroBody: `Add rows to any section. Each row has a start date and a recurrence (daily, every 3 days, weekly, etc.). The timeline columns follow the chosen scale above. We project each item into the correct columns for the current year. The Balance formula per column is: Income − Credit Card − Expenses + Debit Account + Cash. The Cumulative line is the running total.`,
    helpSectionsTitle: "Sections",
    helpSectionsBody: `Income: money you receive. Credit Card: statement charges. Expenses: immediate outflows. Debit Account: bank inflows/outflows. Cash: cash on hand.`,
    helpTransactionsTitle: "Transactions tab",
    helpTransactionsBody: `If method is Credit Card, amount is counted toward “Charges on statement”. Otherwise it’s an immediate debit. “Next statement date” is derived from the cycle day.`,
    helpTargetsTitle: "Targets",
    helpTargetsBody: `Set a target amount and date; the chart shows your progress.`,
    rename: "Rename",
    newName: "New name",
    weeklySummary: "Summary",
    balance: "Balance",
    cumulative: "Cumulative",
  },
  es: {
    appTitle: "Control Financiero",
    appTag: "Planifica, registra y visualiza tu flujo de caja con ítems recurrentes y metas.",
    balanceTab: "Balance",
    transactionsTab: "Transacciones",
    eventsTab: "Eventos",
    calendarTab: "Calendario",
    kpiThisWeek: "Balance de este periodo",
    kpiYtd: "Acumulado del año",
    target: "Meta",
    targetDesc: "Define una meta y fecha; el gráfico muestra el progreso.",
    setTarget: "Definir meta",
    amount: "Monto",
    date: "Fecha",
    save: "Guardar",
    clear: "Limpiar",
    cashFlow: "Flujo de caja",
    cashFlowDesc: "Balance por columna y total acumulado.",
    add: "Agregar",
    label: "Etiqueta",
    startDate: "Fecha de inicio",
    recurrence: "Recurrencia",
    oneTime: "Única vez",
    daily: "Diaria",
    every3: "Cada 3 días",
    weekly: "Semanal",
    biweekly: "Cada 2 semanas",
    every15: "Cada 15 días",
    monthly: "Mensual",
    bimonthly: "Bimestral",
    quarterly: "Trimestral",
    yearly: "Anual",
    income: "Ingresos",
    creditCard: "Tarjeta de crédito",
    expenses: "Gastos",
    debitAccount: "Cuenta débito",
    cash: "Efectivo",
    concept: "Concepto",
    actions: "Acciones",
    transactionsDesc: "Cortes automáticos; créditos/débitos y diferencia preservados.",
    tFecha: "Fecha",
    tSemana: "Semana #",
    tConcepto: "Descripción",
    tMonto: "Monto",
    tMetodo: "Método de pago",
    tCuentas: "Cuenta/Categoría",
    tDiaPlazo: "Día planificado",
    tDiaCorte: "Día de ciclo",
    tCorteInput: "Día de ciclo (entrada)",
    tProxCorte: "Próximo estado",
    tCreditosCorte: "Cargos al estado",
    tDebitosCorte: "Débitos inmediatos",
    tDif: "Dif. vs. balance actual",
    tBalanceAl: "Balance actual",
    eventsDesc: "Lista de eventos con presupuesto simple.",
    mes: "Mes",
    dia: "Día",
    evento: "Evento",
    presupuesto: "Presupuesto",
    calendarTitle: "Calendario",
    calendarSelect: "Selecciona un día para ver detalles.",
    dueIncome: "Ingresos",
    dueOutflow: "Pagos",
    onDay: "el",
    importedRows: (n)=>`Se importaron ${n} filas.`,
    importedJSON: "Datos importados.",
    invalidJSON: "JSON inválido.",
    exportJSON: "Exportar JSON",
    importData: "Importar",
    exportData: "Exportar",
    addOnThisDate: "Agregar ítem en esta fecha",
    section: "Sección",
    cadence: "Escala de tiempo",
    cadence_daily: "Diario",
    cadence_3d: "Cada 3 días",
    cadence_7d: "Semanal",
    cadence_14d: "Cada 2 semanas",
    cadence_15d: "Cada 15 días",
    cadence_1m: "Mensual",
    language: "Idioma",
    themeLight: "Claro",
    themeDark: "Oscuro",
    themeSystem: "Sistema",
    help: "Ayuda",
    helpIntroTitle: "Cómo funciona esta app",
    helpIntroBody: `Agrega filas a cualquier sección con fecha de inicio y recurrencia (diaria, cada 3 días, semanal, etc.). Las columnas del timeline siguen la escala elegida arriba. Proyectamos cada ítem en las columnas correctas del año actual. El Balance por columna usa: Ingresos − Tarjeta − Gastos + Cuenta débito + Efectivo. “Acumulado” es la suma corrida.`,
    helpSectionsTitle: "Secciones",
    helpSectionsBody: `Ingresos: dinero que recibes. Tarjeta: cargos al estado. Gastos: salidas inmediatas. Cuenta débito: movimientos bancarios. Efectivo: dinero en mano.`,
    helpTransactionsTitle: "Pestaña Transacciones",
    helpTransactionsBody: `Si el método es Tarjeta, cuenta como “Cargos al estado”. Si no, es débito inmediato. “Próximo estado” viene del día de ciclo.`,
    helpTargetsTitle: "Metas",
    helpTargetsBody: `Define monto y fecha; el gráfico muestra tu avance.`,
    rename: "Renombrar",
    newName: "Nuevo nombre",
    weeklySummary: "Resumen",
    balance: "Balance",
    cumulative: "Acumulado",
  }
};

function useLocale() {
  const system = (typeof navigator !== 'undefined' && navigator.language && navigator.language.toLowerCase().startsWith('es')) ? 'es' : 'en';
  const [locale, setLocale] = useState(localStorage.getItem('finance-app-locale') || system);
  useEffect(()=>{ localStorage.setItem('finance-app-locale', locale); }, [locale]);
  return {
    locale,
    setLocale,
    t: (k, ...args) => {
      const dict = messages[locale] || messages.en;
      const v = dict[k] ?? k;
      return (typeof v === 'function') ? v(...args) : v;
    }
  };
}

/* ---------- Theme ---------- */
function useTheme(){
  const systemDark = typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [mode, setMode] = useState(localStorage.getItem('finance-app-theme') || 'system');
  useEffect(()=>{ localStorage.setItem('finance-app-theme', mode); }, [mode]);
  useEffect(()=>{
    const root = document.documentElement;
    const effectiveDark = mode==='system' ? systemDark : (mode==='dark');
    root.classList.toggle('dark', !!effectiveDark);
  }, [mode, systemDark]);
  return { mode, setMode };
}

/* ---------- Data + utils ---------- */
const SECTIONS = [
  { key: "ingresos", labelKey: "income", icon: "💸" },
  { key: "tarjeta", labelKey: "creditCard", icon: "💳" },
  { key: "gastos", labelKey: "expenses", icon: "🧾" },
  { key: "cuenta", labelKey: "debitAccount", icon: "🏦" },
  { key: "cash", labelKey: "cash", icon: "💵" },
];

const RECURRENCE = [
  { key: "none", labelKey: "oneTime" },
  { key: "daily", labelKey: "daily" },
  { key: "every3", labelKey: "every3" },
  { key: "weekly", labelKey: "weekly" },
  { key: "biweekly", labelKey: "biweekly" },   // 14 days
  { key: "every15", labelKey: "every15" },     // 15 days
  { key: "monthly", labelKey: "monthly" },
  { key: "bimonthly", labelKey: "bimonthly" },
  { key: "quarterly", labelKey: "quarterly" },
  { key: "yearly", labelKey: "yearly" },
];

const STORAGE_KEY = "finance-app-v2";

function startOfYear(d = new Date()) { return new Date(d.getFullYear(), 0, 1); }
function endOfYear(d = new Date()) { return new Date(d.getFullYear(), 11, 31); }
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function addMonths(date, n) { return new Date(date.getFullYear(), date.getMonth()+n, date.getDate()); }
function startOfMonth(date){ return new Date(date.getFullYear(), date.getMonth(), 1); }
function fmt(d) { return `${String(d.getDate()).padStart(2, "0")}-${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]}`; }
function money(n) { if (n == null || isNaN(n)) return ""; return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function uid(){ return (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`; }

/* Generate columns for the whole current year based on cadence */
function genColumns(cadenceKey){
  const s = startOfYear(); const e = endOfYear();
  const out = [];
  if (cadenceKey === '1m'){
    let t = startOfMonth(s);
    while (t <= e){ out.push({ full: new Date(t), label: `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][t.getMonth()]} ${t.getFullYear()}` }); t = addMonths(t, 1); }
    return out;
  }
  const step = ({ 'daily':1, '3d':3, '7d':7, '14d':14, '15d':15 }[cadenceKey]) || 7;
  let t = new Date(s);
  while (t <= e){ out.push({ full: new Date(t), label: fmt(t) }); t = addDays(t, step); }
  return out;
}

/* Bucket start for a date under a cadence (so occurrences land in the right column) */
function bucketStartFor(date, cadenceKey){
  const y = date.getFullYear();
  if (cadenceKey === '1m') return new Date(y, date.getMonth(), 1);
  const s = startOfYear(date);
  const step = ({ 'daily':1, '3d':3, '7d':7, '14d':14, '15d':15 }[cadenceKey]) || 7;
  const msPerDay = 86400000;
  const days = Math.floor((date - s)/msPerDay);
  const bucketIndex = Math.floor(days/step);
  const bucketStart = addDays(s, bucketIndex*step);
  return new Date(bucketStart.getFullYear(), bucketStart.getMonth(), bucketStart.getDate());
}

/* Iterate occurrences for a row across the year */
function* iterateOccurrences({ startDate, recurrence }){
  const s = startOfYear(); const e = endOfYear();
  if (!startDate) return;
  let d = new Date(startDate);
  if (d > e) return;
  const stepMap = {
    'daily': (dt)=> addDays(dt,1),
    'every3': (dt)=> addDays(dt,3),
    'weekly': (dt)=> addDays(dt,7),
    'biweekly': (dt)=> addDays(dt,14),
    'every15': (dt)=> addDays(dt,15),
    'monthly': (dt)=> addMonths(dt,1),
    'bimonthly': (dt)=> addMonths(dt,2),
    'quarterly': (dt)=> addMonths(dt,3),
    'yearly': (dt)=> new Date(dt.getFullYear()+1, dt.getMonth(), dt.getDate()),
    'none': null
  };
  if (recurrence !== 'none'){
    while (d < s) d = stepMap[recurrence](d);
  }
  if (recurrence === 'none'){
    if (d >= s && d <= e) yield d;
    return;
  }
  while (d <= e){
    yield d;
    d = stepMap[recurrence](d);
  }
}

/* Project a row onto current columns given cadence */
function projectRowToColumns({ columns, cadenceKey, row }){
  const amount = Number(row?.meta?.amount || 0);
  const startDate = row?.meta?.startDate ? new Date(row.meta.startDate) : null;
  const recurrence = row?.meta?.recurrence || 'none';
  const base = Array(columns.length).fill(null);
  if (!amount || !startDate) return base;

  const mapIndex = new Map(columns.map((c, i)=> [c.full.toDateString(), i]));
  for (const occ of iterateOccurrences({ startDate, recurrence })){
    const bucketStart = bucketStartFor(occ, cadenceKey);
    const idx = mapIndex.get(bucketStart.toDateString());
    if (idx != null){
      base[idx] = (base[idx] ?? 0) + amount;
    }
  }
  return base;
}

/* Recompute all rows for given columns/cadence */
function recomputeAll(prev, columns, cadence){
  const out = {};
  for (const s of SECTIONS){
    const list = (prev[s.key]||[]).map(row=>{
      const projected = projectRowToColumns({ columns, cadenceKey: cadence, row });
      return { ...row, values: projected };
    });
    out[s.key] = list;
  }
  return out;
}

/* ---------- modal lock (single-open) ---------- */
function modalIsOpen(){ return !!window.__modalOpenFlag; }
function openModalLock(){ window.__modalOpenFlag = true; document.body.style.overflow = 'hidden'; }
function closeModalLock(){ window.__modalOpenFlag = false; document.body.style.overflow = ''; }

/* ---------- App ---------- */
function App() {
  const { locale, setLocale, t } = useLocale();
  const { mode, setMode } = useTheme();

  const [cadence, setCadence] = useState(localStorage.getItem('finance-app-cadence') || '7d');
  useEffect(()=> localStorage.setItem('finance-app-cadence', cadence), [cadence]);

  const columns = useMemo(() => genColumns(cadence), [cadence]);

  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const init = saved ? JSON.parse(saved) : Object.fromEntries(SECTIONS.map(s => [s.key, []]));
    return recomputeAll(init, columns, cadence);
  });

  const [target, setTarget] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY+"/target");
    return saved ? JSON.parse(saved) : null;
  });
  const [transactions, setTransactions] = useState([]);

  // calendar add modal
  const [calendarAdd, setCalendarAdd] = useState({ open:false, date:null });

  // toasts
  const [toasts, setToasts] = useState([]);
  function toast(msg){ setToasts(prev=> [...prev, { id: Date.now()+Math.random(), msg }]); setTimeout(()=> setToasts(prev=> prev.slice(1)), 2500); }

  // persist
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); }, [rows]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY+"/target", JSON.stringify(target)); }, [target]);

  // recompute when cadence/columns change
  useEffect(() => {
    setRows(prev => recomputeAll(prev, columns, cadence));
  }, [cadence, columns]);

  // formulas unchanged
  function sumSection(sectionKey, col) {
    return (rows[sectionKey]||[]).reduce((acc, r) => acc + (parseFloat(String(r.values[col] ?? 0)) || 0), 0);
  }

  const balanceRow = columns.map((_, i) =>
    sumSection("ingresos", i) -
    sumSection("tarjeta", i) -
    sumSection("gastos", i) +
    sumSection("cuenta", i) +
    sumSection("cash", i)
  );
  let running = 0; const cumulativeRow = balanceRow.map(v => (running += v));

  // ---- Target line series in chart (only up to target date) ----
  const chartData = useMemo(() => {
    const end = target && target.date ? new Date(target.date) : null;
    return columns.map((c, i) => ({
      date: c.label,
      Balance: Number((balanceRow?.[i] ?? 0).toFixed(2)),
      Cumulative: Number((cumulativeRow?.[i] ?? 0).toFixed(2)),
      Target: end && Number(target?.amount) > 0 && c.full <= end ? Number(target.amount) : null,
    }));
  }, [columns, balanceRow, cumulativeRow, target]);

  // safe guards for KPI values and chart data
  const firstBalance = (Array.isArray(balanceRow) && balanceRow.length) ? balanceRow[0] : 0;
  const lastCum = (Array.isArray(cumulativeRow) && cumulativeRow.length) ? cumulativeRow[cumulativeRow.length-1] : 0;
  const safeChartData = Array.isArray(chartData) ? chartData : [];

  // section mutations
  function addRow(sectionKey, payload){
    const id = uid();
    const projected = projectRowToColumns({ columns, cadenceKey: cadence, row: { meta: payload }});
    setRows(prev => ({
      ...prev,
      [sectionKey]: [...(prev[sectionKey]||[]), { id, label: (payload && payload.label) || "", values: projected, meta: payload }]
    }));
  }
  function updateCell(sectionKey, rowId, col, value){
    setRows(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map(r => r.id===rowId
        ? { ...r, values: r.values.map((v,i)=> i===col? (value===""||value==null? null : Number(value)) : v) }
        : r)
    }));
  }
  function updateLabel(sectionKey, rowId, label){
    setRows(prev => ({ ...prev, [sectionKey]: prev[sectionKey].map(r => r.id===rowId ? { ...r, label } : r) }));
  }
  function updateMeta(sectionKey, rowId, nextMeta){
    setRows(prev => {
      const list = prev[sectionKey]||[];
      const idx = list.findIndex(r=> r.id===rowId);
      if (idx<0) return prev;
      const row = list[idx];
      const meta = { ...(row.meta||{}), ...nextMeta };
      const values = projectRowToColumns({ columns, cadenceKey: cadence, row: { meta }});
      const next = { ...row, meta, values };
      const newList = list.slice(); newList[idx] = next;
      return { ...prev, [sectionKey]: newList };
    });
  }
  function removeRow(sectionKey, rowId){
    setRows(prev => ({ ...prev, [sectionKey]: prev[sectionKey].filter(r => r.id!==rowId) }));
  }

  // Export/Import helpers
  function exportJSON(){
    const payload = { rows, target, transactions, locale, theme: mode, cadence };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'finance-data.json'; a.click(); URL.revokeObjectURL(url);
  }
  function exportTransactionsToXLSX(){
    const wsData = [["date","week","description","amount","method","account","planDay","cycleDay","cycleInput","nextStatement","chargesOnStatement","immediateDebits","diff","currentBalance"]];
    transactions.forEach(r=>{
      wsData.push([r.fecha,r.semana,r.concepto,r.monto,r.metodo,r.cuentas,r.diaplazo,r.diacorta,r.corte,r.proxCorte,r.creditosAlCorte,r.debitosAlCorte,r.dif,r.balanceAl]);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "transactions.xlsx");
  }
  function exportSectionsToXLSX(){
    const wb = XLSX.utils.book_new();
    const cols = ["Concept", ...columns.map(c=>c.label)];
    SECTIONS.forEach(s=>{
      const data = [cols];
      (rows[s.key]||[]).forEach(r=>{
        data.push([r.label, ...r.values.map(v=> v==null? "" : v)]);
      });
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, s.labelKey);
    });
    XLSX.writeFile(wb, "sections.xlsx");
  }
  function importExcelOrCsv(file){
    const reader = new FileReader();
    reader.onload = (e)=>{
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data, { type:'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval:'' });
      const mapped = json.map(r=>({
        fecha: r.date||r.Fecha||'', semana: r.week||r.Semana||'',
        concepto: r.description||r.Descripción||'',
        monto: r.amount||r.Monto||'',
        metodo: r.method||r.Método||'',
        cuentas: r.account||r.Cuenta||'',
        diaplazo: r.planDay||r['Día planificado']||'',
        diacorta: r.cycleDay||r['Día de ciclo']||'',
        corte: r.cycleInput||r['Día de ciclo (entrada)']||'',
        proxCorte:'', creditosAlCorte:'', debitosAlCorte:'', dif:'', balanceAl: r.balanceAt||r['Balance actual']||''
      }));
      setTransactions(mapped);
      toast(messages[locale].importedRows(mapped.length));
    };
    reader.readAsArrayBuffer(file);
  }
  function importJSON(file){
    const reader = new FileReader();
    reader.onload = ()=>{
      try {
        const obj = JSON.parse(String(reader.result));
        if (obj.rows) setRows(recomputeAll(obj.rows, columns, cadence));
        if (obj.target) setTarget(obj.target);
        if (obj.transactions) setTransactions(obj.transactions);
        if (obj.locale) setLocale(obj.locale);
        if (obj.theme) setMode(obj.theme);
        if (obj.cadence) setCadence(obj.cadence);
        toast(messages[locale].importedJSON);
      } catch(err){ toast(messages[locale].invalidJSON); }
    };
    reader.readAsText(file);
  }

  return (
    <div className="container">
      {/* Toasts */}
      <div className="toast-stack">
        {toasts.map(ti=>(<div key={ti.id} className="toast">{String(ti.msg)}</div>))}
      </div>

      <header className="header">
        <div className="flex items-center gap-3">
          <div className="text-3xl">📊</div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{messages[locale].appTitle}</h1>
            <p className="text-sm opacity-80">{messages[locale].appTag}</p>
          </div>
        </div>
        <div className="header-actions">
          <CadenceMenu t={(k)=>messages[locale][k]} cadence={cadence} setCadence={setCadence} />
          <ImportMenu t={(k)=>messages[locale][k]} onImportExcel={importExcelOrCsv} onImportJSON={importJSON} />
          <ExportMenu t={(k)=>messages[locale][k]} onExportJSON={exportJSON} onExportTx={exportTransactionsToXLSX} onExportSections={exportSectionsToXLSX} />
          <HelpDialog t={(k)=>messages[locale][k]} />
          <ThemeMenu t={(k)=>messages[locale][k]} mode={mode} setMode={setMode} />
          <button className="btn" onClick={()=> setLocale(locale==='en'?'es':'en')} title={messages[locale].language}>🌐 {locale.toUpperCase()}</button>
        </div>
      </header>

      <main className="space-y-6">
        <Tabs
          tabs={[
            { key:'balance', label:messages[locale].balanceTab },
            { key:'transactions', label:messages[locale].transactionsTab },
            { key:'events', label:messages[locale].eventsTab },
            { key:'calendar', label:messages[locale].calendarTab },
          ]}
          render={(active)=>(
            <>
              {active==='balance' && (
                <BalanceTab
                  t={(k)=>messages[locale][k]}
                  columns={columns}
                  target={target}
                  setTarget={setTarget}
                  rows={rows}
                  addRow={addRow}
                  updateCell={updateCell}
                  updateLabel={updateLabel}
                  updateMeta={updateMeta}
                  removeRow={removeRow}
                  chartData={safeChartData}
                  balanceRow={balanceRow}
                  cumulativeRow={cumulativeRow}
                  cadence={cadence}
                  firstBalance={firstBalance}
                  lastCum={lastCum}
                />
              )}
              {active==='transactions' && (
                <TransactionsCard t={(k)=>messages[locale][k]} transactions={transactions} setTransactions={setTransactions} />
              )}
              {active==='events' && <EventsCard t={(k)=>messages[locale][k]} />}
              {active==='calendar' && (
                <CalendarCard
                  t={(k)=>messages[locale][k]}
                  rows={rows}
                  onDayClick={(dateObj)=> {
                    if (modalIsOpen()) return;
                    setCalendarAdd({ open:true, date: dateObj });
                  }}
                />
              )}
            </>
          )}
        />
      </main>

      {/* Add-from-calendar modal */}
      {calendarAdd.open && (
        <AddFromCalendarModal
          t={(k)=>messages[locale][k]}
          defaultDate={calendarAdd.date}
          onCancel={()=> { setCalendarAdd({ open:false, date:null }); }}
          onSave={(sectionKey, payload)=>{
            addRow(sectionKey, payload);
            setCalendarAdd({ open:false, date:null });
            toast(messages[locale].addOnThisDate);
          }}
        />
      )}
    </div>
  );
}

/* ---------- UI basics ---------- */
function Tabs({ tabs, render }){
  const [active, setActive] = useState(tabs[0]?.key || '');
  return (
    <div className="w-full">
      <div className="tabs-grid">
        {tabs.map(tb=>(
          <button key={tb.key} onClick={()=> setActive(tb.key)} className={`btn ${active===tb.key ? 'btn-primary' : ''}`}>
            {tb.label}
          </button>
        ))}
      </div>
      <div>{render(active)}</div>
    </div>
  );
}

function CadenceMenu({ t, cadence, setCadence }){
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm opacity-80" htmlFor="cadence">{t('cadence')}</label>
      <select id="cadence" value={cadence} onChange={(e)=> setCadence(e.target.value)}>
        <option value="daily">{t('cadence_daily')}</option>
        <option value="3d">{t('cadence_3d')}</option>
        <option value="7d">{t('cadence_7d')}</option>
        <option value="14d">{t('cadence_14d')}</option>
        <option value="15d">{t('cadence_15d')}</option>
        <option value="1m">{t('cadence_1m')}</option>
      </select>
    </div>
  );
}

/* ---------- Balance Tab (with clamp + target line + weekly summary) ---------- */
function BalanceTab({
  t, columns, target, setTarget, rows,
  addRow, updateCell, updateLabel, updateMeta, removeRow,
  chartData, balanceRow, cumulativeRow, cadence,
  firstBalance, lastCum
}){
  return (
    <>
      {/* Clamped summary area */}
      <div className="pre-sections">
        <div className="summary-grid">
          <TargetCard t={t} target={target} setTarget={setTarget} />
          <KpiCard title={t('kpiThisWeek')} value={money(firstBalance)} />
          <KpiCard title={t('kpiYtd')} value={money(lastCum)} />
        </div>

        <div className="card p-4 chart-card">
          <div className="mb-2">
            <div className="text-lg font-semibold">📈 {t('cashFlow')}</div>
            <div className="opacity-80 text-sm">{t('cashFlowDesc')}</div>
          </div>
          <div style={{height:'100%'}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 15 }}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="currentColor" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, angle: -45, textAnchor: 'end' }}
                  height={54}
                  margin={{ top: 15, right: 15, left: 15, bottom: 15 }}
                  interval={Math.max(0, Math.floor(columns.length/24))}
                />
                <YAxis tickFormatter={(v)=>money(v)} tick={{ fontSize: 12 }} width={80} />
                <Tooltip formatter={(v)=>money(Number(v))} contentStyle={{ background: "#0b1020", border:"1px solid #1f2b4d"}}/>
                <Legend />
                <Area type="monotone" dataKey="Cumulative" strokeWidth={2} stroke="#7dd3fc" fill="url(#grad1)" />
                <Line type="monotone" dataKey="Balance" strokeWidth={2} stroke="#a78bfa" dot={false} />
                {/* Target series (only up to date) */}
                {target && Number(target.amount)>0 && (
                  <Line type="monotone" dataKey="Target" stroke="#f59e0b" strokeDasharray="6 3" dot={false} isAnimationActive={false}/>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="sections-grid">
        {SECTIONS.map(s => (
          <SectionTable
            key={s.key}
            t={t}
            icon={s.icon}
            sectionKey={s.key}
            label={t(s.labelKey)}
            columns={columns}
            rows={rows}
            addRow={addRow}
            updateCell={updateCell}
            updateLabel={updateLabel}
            updateMeta={updateMeta}
            removeRow={removeRow}
            cadence={cadence}
          />
        ))}
      </div>

      {/* Weekly summary table (ALWAYS 7d cadence) */}
      <WeeklySummary t={t} rows={rows} />
    </>
  );
}

function KpiCard({ title, value }){
  return (
    <div className="card p-4">
      <div className="uppercase tracking-wide text-xs opacity-70">{title}</div>
      <div className="text-3xl font-semibold">{value || "—"}</div>
    </div>
  );
}

function TargetCard({ t, target, setTarget }){
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(target && target.amount ? target.amount : "");
  const [date, setDate] = useState(target && target.date ? target.date : new Date().toISOString().slice(0,10));
  useEffect(()=>{ setAmount(target && target.amount ? target.amount : ""); setDate(target && target.date ? target.date : new Date().toISOString().slice(0,10)); }, [target]);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-lg font-semibold">🎯 {t('target')}</div>
          <div className="opacity-80 text-sm">{t('targetDesc')}</div>
        </div>
        <button className="btn btn-primary" onClick={()=> { if (!modalIsOpen()) setOpen(true); }}>
          {t('setTarget')}
        </button>
      </div>
      <button className="btn btn-ghost" onClick={()=> setTarget(null)}>{t('clear')}</button>
      {target && <p className="text-sm opacity-80 mt-2">{t('target')}: <span className="font-semibold">{money(target.amount)}</span> — {new Date(target.date).toDateString()}</p>}
      {open && (
        <Modal onClose={()=> setOpen(false)} title={t('setTarget')}>
          <form onSubmit={(e)=>{ e.preventDefault(); setTarget({ amount: parseFloat(String(amount)), date }); setOpen(false); }}>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <label className="text-sm">{t('amount')}</label>
                <input autoFocus type="number" step="any" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="1250.00" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm">{t('date')}</label>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn" onClick={()=> setOpen(false)}>{t('clear')}</button>
              <button type="submit" className="btn btn-primary">{t('save')}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Section table (concept non-editable + Rename) ---------- */
/* ---------- Section table (hide past empty columns) ---------- */
function SectionTable({
  t, icon, sectionKey, label, columns, rows,
  addRow, updateCell, updateLabel, updateMeta, removeRow, cadence
}) {
  const data = rows[sectionKey] || [];
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    label: "",
    amount: "",
    startDate: new Date().toISOString().slice(0, 10),
    recurrence: "none"
  });

  const [renameRow, setRenameRow] = useState(null);
  const [renameText, setRenameText] = useState("");

  // Current bucket for the chosen cadence (month/week/3d/daily…)
  const todayBucket = useMemo(() => bucketStartFor(new Date(), cadence), [cadence]);

  // Only show columns that are NOT in the past OR (if in the past) have data in this section
  const visibleIdxs = useMemo(() => {
    return columns
      .map((c, i) => {
        const isPast = c.full < todayBucket;
        if (!isPast) return i; // current/future always visible
        // Past column: only show if this section has any value there
        const hasValue = (data || []).some(r => r?.values?.[i] != null && r.values[i] !== 0);
        return hasValue ? i : null;
      })
      .filter(i => i !== null);
  }, [columns, data, todayBucket]);

  function onCellKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid #23304d' }}>
        <div className="flex items-center gap-2">
          <div className="text-xl">{icon}</div>
          <div className="text-lg font-semibold">{label}</div>
        </div>
        <button className="btn btn-primary" onClick={() => { if (!modalIsOpen()) setOpen(true); }}>
          + {t('add')}
        </button>
      </div>

      <div className="table-wrap p-2">
        <div style={{ minWidth: '760px' }}>
          <table className="text-sm">
            <thead>
              <tr>
                <th className="sticky-col">{t('concept')}</th>
                {visibleIdxs.map(i => (
                  <th key={i}>{columns[i].label}</th>
                ))}
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 && (
                <tr>
                  <td colSpan={visibleIdxs.length + 2} style={{ height: '.5rem' }} />
                </tr>
              )}

              {data.map(row => (
                <tr key={row.id}>
                  <td className="sticky-col">
                    <div className="concept-lock">
                      <span className="concept-text" title={row.label || ''}>{row.label || ''}</span>
                      <button
                        className="btn btn-xs"
                        onClick={() => { if (modalIsOpen()) return; setRenameRow(row); setRenameText(row.label || ''); }}
                      >
                        ✏️ {t('rename')}
                      </button>
                    </div>
                  </td>

                  {visibleIdxs.map(i => (
                    <td key={i}>
                      <input
                        className="cell-input"
                        type="number"
                        value={row.values[i] ?? ""}
                        onChange={e => updateCell(
                          sectionKey,
                          row.id,
                          i,
                          e.target.value === "" ? null : Number(e.target.value)
                        )}
                        onKeyDown={onCellKeyDown}
                      />
                    </td>
                  ))}

                  <td>
                    <button className="btn btn-danger" onClick={() => removeRow(sectionKey, row.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add item modal */}
      {open && (
        <Modal onClose={() => setOpen(false)} title={`${t('add')} ${label}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addRow(sectionKey, {
                label: form.label,
                amount: parseFloat(String(form.amount)),
                startDate: form.startDate,
                recurrence: form.recurrence
              });
              setForm({
                label: "",
                amount: "",
                startDate: new Date().toISOString().slice(0, 10),
                recurrence: "none"
              });
              setOpen(false);
            }}
          >
            <div className="grid gap-3">
              <div className="grid gap-2">
                <label className="text-sm">{t('label')}</label>
                <input
                  autoFocus
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="e.g., Rent, Salary, Groceries"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm">{t('amount')}</label>
                <input
                  type="number"
                  step="any"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="1250.00"
                />
              </div>
              <div className="grid md-grid-2 gap-3">
                <div className="grid gap-2">
                  <label className="text-sm">{t('startDate')}</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm">{t('recurrence')}</label>
                  <select
                    value={form.recurrence}
                    onChange={e => setForm(f => ({ ...f, recurrence: e.target.value }))}
                  >
                    {RECURRENCE.map(r => (<option key={r.key} value={r.key}>{t(r.labelKey)}</option>))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button type="button" className="btn" onClick={() => setOpen(false)}>{t('clear')}</button>
              <button type="submit" className="btn btn-primary">{t('add')}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Rename modal */}
      {renameRow && (
        <Modal onClose={() => setRenameRow(null)} title={t('rename')}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateLabel(sectionKey, renameRow.id, renameText);
              setRenameRow(null);
            }}
          >
            <div className="grid gap-2">
              <label className="text-sm">{t('newName')}</label>
              <input autoFocus value={renameText} onChange={e => setRenameText(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button type="button" className="btn" onClick={() => setRenameRow(null)}>{t('clear')}</button>
              <button type="submit" className="btn btn-primary">{t('save')}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}


/* ---------- Weekly Summary (always 7d cadence) ---------- */
/* ---------- Balance & Cumulative (custom start + cadence) ---------- */
function WeeklySummary({ t, rows }) {
  // Local controls for this section only
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10)); // today by default
  const [cadenceKey, setCadenceKey] = useState('7d'); // keep old behavior initially

  // Helpers specific to this view (anchor the timeline at the chosen startDate)
  function genColumnsFrom(startISO, cadence) {
    const s = new Date(startISO || new Date());
    const e = endOfYear(s);
    const out = [];

    if (cadence === '1m') {
      // start at the first of the start month
      let t = startOfMonth(s);
      while (t <= e) {
        out.push({
          full: new Date(t),
          label: `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][t.getMonth()]} ${t.getFullYear()}`
        });
        t = addMonths(t, 1);
      }
      return out;
    }

    const step = ({ daily:1, "3d":3, "7d":7, "14d":14, "15d":15 }[cadence]) || 7;
    let t = new Date(s);
    while (t <= e) {
      out.push({ full: new Date(t), label: fmt(t) });
      t = addDays(t, step);
    }
    return out;
  }

  function bucketStartFrom(anchor, date, cadence) {
    if (cadence === '1m') {
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    const step = ({ daily:1, "3d":3, "7d":7, "14d":14, "15d":15 }[cadence]) || 7;
    const msPerDay = 86400000;
    const days = Math.floor((date - anchor) / msPerDay);
    const bucketIndex = Math.floor(days / step);
    const bucketStart = addDays(anchor, bucketIndex * step);
    return new Date(bucketStart.getFullYear(), bucketStart.getMonth(), bucketStart.getDate());
  }

  function projectRowToColumnsFrom({ columns, cadenceKey, startAnchor, row }) {
    const amount = Number(row?.meta?.amount || 0);
    const start = row?.meta?.startDate ? new Date(row.meta.startDate) : null;
    const recurrence = row?.meta?.recurrence || 'none';
    const base = Array(columns.length).fill(null);
    if (!amount || !start) return base;

    const anchor = new Date(startAnchor);
    const mapIndex = new Map(columns.map((c, i) => [c.full.toDateString(), i]));

    for (const occ of iterateOccurrences({ startDate: start, recurrence })) {
      if (occ < anchor) continue; // hide everything before selected start
      const b = bucketStartFrom(anchor, occ, cadenceKey);
      const idx = mapIndex.get(b.toDateString());
      if (idx != null) base[idx] = (base[idx] ?? 0) + amount;
    }
    return base;
  }

  // Build anchored columns and reproject all sections onto them
  const anchoredColumns = useMemo(
    () => genColumnsFrom(startDate, cadenceKey),
    [startDate, cadenceKey]
  );

  const projectedBySection = useMemo(() => {
    const out = {};
    for (const s of SECTIONS) {
      out[s.key] = (rows[s.key] || []).map(r => {
        const values = projectRowToColumnsFrom({
          columns: anchoredColumns,
          cadenceKey,
          startAnchor: startDate,
          row: r
        });
        return { ...r, values };
      });
    }
    return out;
  }, [rows, anchoredColumns, cadenceKey, startDate]);

  function sumSection(sectionKey, i) {
    return (projectedBySection[sectionKey] || []).reduce(
      (acc, r) => acc + (parseFloat(String(r.values[i] ?? 0)) || 0),
      0
    );
  }

  // Balance & cumulative using the anchored columns
  const balanceRow = anchoredColumns.map((_, i) =>
    sumSection("ingresos", i) -
    sumSection("tarjeta", i) -
    sumSection("gastos", i) +
    sumSection("cuenta", i) +
    sumSection("cash", i)
  );
  let running = 0;
  const cumulativeRow = balanceRow.map(v => (running += v));

  return (
    <div className="card p-4 mt-4">
      <div className="section-head">
        <div className="text-lg font-semibold">🧮 {t('weeklySummary')}</div>

        {/* Aside controls (only for this section) */}
        <div className="flex items-center" style={{ gap: '10px', flexWrap: 'wrap' }}>
          <div className="flex items-center" style={{ gap: '6px' }}>
            <label className="text-sm opacity-80">{t('date')}</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ minWidth: 150 }}
            />
          </div>

          <div className="flex items-center" style={{ gap: '6px' }}>
            <label className="text-sm opacity-80">{t('cadence')}</label>
            <select value={cadenceKey} onChange={e => setCadenceKey(e.target.value)}>
              <option value="daily">{t('cadence_daily')}</option>
              <option value="3d">{t('cadence_3d')}</option>
              <option value="7d">{t('cadence_7d')}</option>
              <option value="14d">{t('cadence_14d')}</option>
              <option value="15d">{t('cadence_15d')}</option>
              <option value="1m">{t('cadence_1m')}</option>
            </select>
          </div>
        </div>

        <div className="text-sm opacity-80" style={{ marginTop: 6 }}>
          {/* Small hint: shows that we’re anchoring at the chosen start */}
          Showing from <strong>{new Date(startDate).toDateString()}</strong> forward
          ({{
            daily: 'Daily',
            '3d': 'Every 3 days',
            '7d': 'Weekly',
            '14d': 'Every 2 weeks',
            '15d': 'Every 15 days',
            '1m': 'Monthly'
          }[cadenceKey]}).
        </div>
      </div>

      <div className="table-wrap">
        <div style={{ minWidth: '760px' }}>
          <table className="text-sm">
            <thead>
              <tr>
                <th style={{ position: 'sticky', left: 0, background: 'var(--panel)', zIndex: 1 }}>&nbsp;</th>
                {anchoredColumns.map((c, i) => <th key={i}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ position: 'sticky', left: 0, background: 'var(--panel)', fontWeight: 600 }}>
                  {t('balance')}
                </td>
                {balanceRow.map((v, i) => (
                  <td key={i} className={v < 0 ? 'neg' : ''}>{money(v)}</td>
                ))}
              </tr>
              <tr>
                <td style={{ position: 'sticky', left: 0, background: 'var(--panel)', fontWeight: 600 }}>
                  {t('cumulative')}
                </td>
                {cumulativeRow.map((v, i) => (
                  <td key={i} className={v < 0 ? 'neg' : ''}>{money(v)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------- Transactions ---------- */
function TransactionsCard({ t, transactions, setTransactions }){
  function up(i, k, v) { setTransactions(prev => prev.map((r,idx)=> idx!==i? r : calc({ ...r, [k]: v }))); }
  function add() {
    setTransactions(prev => [...prev, calc({
      fecha: "", semana: "", concepto: "", monto: "", metodo: "",
      cuentas: "", diaplazo: "", diacorta: "", corte: "",
      proxCorte: "", creditosAlCorte: "", debitosAlCorte: "", dif: "", balanceAl: ""
    })]);
  }
  function del(i) { setTransactions(prev => prev.filter((_,idx)=>idx!==i)); }

  function calc(r) {
    const cutoffDay = parseInt(r.corte) || parseInt(r.diacorta) || 1;
    const tranDate = r.fecha ? new Date(r.fecha) : new Date();
    let nextCutoff = new Date(tranDate.getFullYear(), tranDate.getMonth(), cutoffDay);
    if (nextCutoff <= tranDate) nextCutoff.setMonth(nextCutoff.getMonth() + 1);
    r.proxCorte = nextCutoff.toISOString().split("T")[0];

    const isCreditCard =
      r.metodo === "Credit Card" || r.metodo === "Tarjeta de crédito";
    r.creditosAlCorte = isCreditCard ? parseFloat(r.monto) || 0 : 0;
    r.debitosAlCorte = !isCreditCard ? parseFloat(r.monto) || 0 : 0;

    r.dif = (parseFloat(r.monto) || 0) - (parseFloat(r.balanceAl) || 0);
    return r;
  }

  function onCellKeyDown(e){ if (e.key==='Enter'){ e.preventDefault(); e.currentTarget.blur(); } }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between p-4" style={{borderBottom:'1px solid #23304d'}}>
        <div>
          <div className="text-lg font-semibold">💳 {t('transactionsTab')}</div>
          <div className="text-sm opacity-80">{t('transactionsDesc')}</div>
        </div>
        <button className="btn btn-primary" onClick={add}>+ {t('add')}</button>
      </div>

      <div className="table-wrap p-2">
        <div style={{ minWidth:'1080px' }}>
          <table className="text-sm">
            <thead>
              <tr>
                {[t('tFecha'),t('tSemana'),t('tConcepto'),t('tMonto'),t('tMetodo'),t('tCuentas'),t('tDiaPlazo'),t('tDiaCorte'),t('tCorteInput'),t('tProxCorte'),t('tCreditosCorte'),t('tDebitosCorte'),t('tDif'),t('tBalanceAl'),''].map((h,i)=> <th key={i}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {transactions.map((r, i) => (
                <tr key={i}>
                  <td><input type="date" value={r.fecha} onChange={e=>up(i,'fecha', e.target.value)} onKeyDown={onCellKeyDown}/></td>
                  <td><input value={r.semana} onChange={e=>up(i,'semana', e.target.value)} placeholder="1-52" onKeyDown={onCellKeyDown}/></td>
                  <td><input value={r.concepto} onChange={e=>up(i,'concepto', e.target.value)} placeholder="Description" onKeyDown={onCellKeyDown}/></td>
                  <td><input type="number" value={r.monto} onChange={e=>up(i,'monto', e.target.value)} placeholder="1250.00" onKeyDown={onCellKeyDown}/></td>
                  <td>
                    <select value={r.metodo} onChange={(e)=>up(i,'metodo', e.target.value)}>
                      <option value="">{t('tMetodo')}</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Digital Wallet">Digital Wallet</option>
                      <option value="Tarjeta de crédito">Tarjeta de crédito</option>
                      <option value="Tarjeta de débito">Tarjeta de débito</option>
                      <option value="Transferencia bancaria">Transferencia bancaria</option>
                      <option value="Efectivo">Efectivo</option>
                      <option value="Billetera digital">Billetera digital</option>
                    </select>
                  </td>
                  <td><input value={r.cuentas} onChange={e=>up(i,'cuentas', e.target.value)} placeholder="Account / Category" onKeyDown={onCellKeyDown}/></td>
                  <td><input type="number" value={r.diaplazo} onChange={e=>up(i,'diaplazo', e.target.value)} placeholder="1-31" onKeyDown={onCellKeyDown}/></td>
                  <td><input type="number" value={r.diacorta} onChange={e=>up(i,'diacorta', e.target.value)} placeholder="1-31" onKeyDown={onCellKeyDown}/></td>
                  <td><input type="number" value={r.corte} onChange={e=>up(i,'corte', e.target.value)} placeholder="1-31" onKeyDown={onCellKeyDown}/></td>
                  <td><input value={r.proxCorte} readOnly /></td>
                  <td><input type="number" value={r.creditosAlCorte} readOnly /></td>
                  <td><input type="number" value={r.debitosAlCorte} readOnly /></td>
                  <td><input type="number" value={r.dif} readOnly /></td>
                  <td><input type="number" value={r.balanceAl} onChange={e=>up(i,'balanceAl', e.target.value)} onKeyDown={onCellKeyDown}/></td>
                  <td><button className="btn btn-danger" onClick={()=>del(i)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------- Events ---------- */
function EventsCard({ t }){
  const [rows, setRows] = useState([]);
  function up(i, k, v){ setRows(prev=> prev.map((r,idx)=> idx!==i? r : { ...r, [k]: v })); }
  function add(){ setRows(prev=> [...prev, { mes: "", dia:"", evento:"", presupuesto:"" }]); }
  function del(i){ setRows(prev=> prev.filter((_,idx)=>idx!==i)); }
  function onCellKeyDown(e){ if (e.key==='Enter'){ e.preventDefault(); e.currentTarget.blur(); } }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between p-4" style={{borderBottom:'1px solid #23304d'}}>
        <div>
          <div className="text-lg font-semibold">🗓️ {t('eventsTab')}</div>
          <div className="text-sm opacity-80">{t('eventsDesc')}</div>
        </div>
        <button className="btn btn-primary" onClick={add}>+ {t('add')}</button>
      </div>
      <div className="table-wrap p-2">
        <div style={{ minWidth:'720px' }}>
          <table className="text-sm">
            <thead>
              <tr>
                {[t('mes'),t('dia'),t('evento'),t('presupuesto'),''].map((h,i)=> <th key={i}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i)=> (
                <tr key={i}>
                  <td><input type="number" value={r.mes} onChange={e=>up(i,'mes', e.target.value)} placeholder="1-12" onKeyDown={onCellKeyDown}/></td>
                  <td><input type="number" value={r.dia} onChange={e=>up(i,'dia', e.target.value)} placeholder="1-31" onKeyDown={onCellKeyDown}/></td>
                  <td><input value={r.evento} onChange={e=>up(i,'evento', e.target.value)} placeholder="Event" onKeyDown={onCellKeyDown}/></td>
                  <td><input type="number" value={r.presupuesto} onChange={e=>up(i,'presupuesto', e.target.value)} placeholder="1250.00" onKeyDown={onCellKeyDown}/></td>
                  <td><button className="btn btn-danger" onClick={()=>del(i)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------- Calendar WITH CLICK-TO-ADD ---------- */
function CalendarCard({ t, rows, onDayClick }){
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selected, setSelected] = useState(null);

  function getMatrix(date){
    const y = date.getFullYear(); const m = date.getMonth();
    const first = new Date(y,m,1).getDay();
    const days = new Date(y,m+1,0).getDate();
    const mat = []; let row = [];
    for (let i=0;i<first;i++) row.push(0);
    for (let d=1; d<=days; d++){ row.push(d); if(row.length===7){ mat.push(row); row=[]; } }
    if (row.length){ while(row.length<7) row.push(0); mat.push(row); }
    return mat;
  }
  const matrix = useMemo(()=> getMatrix(currentDate), [currentDate]);

  const monthStats = useMemo(()=>{
    const y = currentDate.getFullYear(); const m = currentDate.getMonth();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    const incomeCounts = Array(daysInMonth+1).fill(0);
    const outflowCounts = Array(daysInMonth+1).fill(0);

    const allSections = Object.entries(rows);
    for (const [sectionKey, list] of allSections){
      for (const row of (list||[])){
        for (const occ of iterateOccurrences({ startDate: row?.meta?.startDate ? new Date(row.meta.startDate) : null, recurrence: row?.meta?.recurrence || 'none' })){
          if (occ.getMonth()===m && occ.getFullYear()===y){
            const d = occ.getDate();
            if (sectionKey === 'ingresos') incomeCounts[d] += 1;
            else outflowCounts[d] += 1;
          }
        }
      }
    }
    return { incomeCounts, outflowCounts };
  }, [rows, currentDate]);

  return (
    <div className="card">
      <div className="flex items-center justify-between p-4" style={{borderBottom:'1px solid #23304d'}}>
        <div className="text-lg font-semibold">📅 {t('calendarTitle')}</div>
        <div className="flex items-center gap-2">
          <button className="btn" onClick={()=> setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()-1, 1))}>Prev</button>
          <div className="px-2 py-2 text-sm opacity-80">
            {currentDate.toLocaleString(undefined, { month:'long', year:'numeric' })}
          </div>
          <button className="btn" onClick={()=> setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 1))}>Next</button>
        </div>
      </div>

      <div className="p-4">
        <div className="calendar-grid mb-2 text-center text-sm">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d)=> (
            <div key={d} className="py-2 font-semibold opacity-80">{d}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {matrix.flat().map((d, i)=> {
            const isEmpty = d===0;
            let income = 0, outflow = 0;
            if (!isEmpty){
              income = monthStats.incomeCounts[d];
              outflow = monthStats.outflowCounts[d];
            }
            return (
              <div
                key={i}
                className={[
                  "calendar-day",
                  isEmpty ? "calendar-day--empty" : "",
                  d===selected ? "calendar-day--selected" : ""
                ].join(' ')}
                onClick={()=>{
                  if (isEmpty) return;
                  setSelected(d);
                  const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
                  onDayClick && onDayClick(dateObj);
                }}
                title={isEmpty ? "" : (new Date(currentDate.getFullYear(), currentDate.getMonth(), d)).toDateString()}
              >
                <div className="text-sm font-medium">{d || ''}</div>
                {!isEmpty && (
                  <div className="flex gap-1 mt-1">
                    {income>0 && (<span className="calendar-badge badge-income">{income}</span>)}
                    {outflow>0 && (<span className="calendar-badge badge-outflow">{outflow}</span>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-sm opacity-90">
          {selected ? t('onDay') + " " + selected : t('calendarSelect')}
        </div>
      </div>
    </div>
  );
}

/* ---------- Add From Calendar Modal ---------- */
function AddFromCalendarModal({ t, defaultDate, onCancel, onSave }){
  const iso = (d)=> d?.toISOString?.().slice(0,10) || new Date().toISOString().slice(0,10);
  const [sectionKey, setSectionKey] = useState(SECTIONS[0].key);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState(iso(defaultDate));
  const [recurrence, setRecurrence] = useState("none");

  useEffect(()=> {
    const first = document.querySelector('#afc-label');
    if (first) first.focus();
  }, []);

  return (
    <Modal onClose={onCancel} title={"📌 " + t('addOnThisDate')}>
      <form onSubmit={(e)=>{ e.preventDefault();
        const payload = { label, amount: parseFloat(String(amount)), startDate, recurrence };
        onSave(sectionKey, payload);
      }}>
        <div className="grid md-grid-2 gap-3">
          <div className="grid gap-2">
            <label className="text-sm">{t('section')}</label>
            <select value={sectionKey} onChange={(e)=> setSectionKey(e.target.value)}>
              {SECTIONS.map(s=> <option key={s.key} value={s.key}>{s.icon} {t(s.labelKey)}</option>)}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm">{t('label')}</label>
            <input id="afc-label" value={label} onChange={e=> setLabel(e.target.value)} placeholder="e.g., Rent, Salary, Groceries" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">{t('amount')}</label>
            <input type="number" step="any" value={amount} onChange={e=> setAmount(e.target.value)} placeholder="1250.00" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">{t('startDate')}</label>
            <input type="date" value={startDate} onChange={e=> setStartDate(e.target.value)} />
          </div>
          <div className="grid gap-2 md-col-span-2">
            <label className="text-sm">{t('recurrence')}</label>
            <select value={recurrence} onChange={(e)=> setRecurrence(e.target.value)}>
              {RECURRENCE.map(r=> <option key={r.key} value={r.key}>{t(r.labelKey)}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="btn" onClick={onCancel}>{t('clear')}</button>
          <button type="submit" className="btn btn-primary">{t('save')}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Menus + Help + Modal ---------- */
function ImportMenu({ t, onImportExcel, onImportJSON }){
  const excelInputId = "excel-upload";
  const jsonInputId = "json-upload";
  return (
    <div className="flex items-center gap-2">
      <input
        id={excelInputId}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{display:'none'}}
        onChange={(e)=>{ const f = e.target.files?.[0]; if (f) onImportExcel(f); e.target.value=''; }}
      />
      <input
        id={jsonInputId}
        type="file"
        accept=".json"
        style={{display:'none'}}
        onChange={(e)=>{ const f = e.target.files?.[0]; if (f) onImportJSON(f); e.target.value=''; }}
      />
      <button className="btn" onClick={()=> document.getElementById(excelInputId).click()}>
        {t('importData')} (.xls/.csv)
      </button>
      <button className="btn" onClick={()=> document.getElementById(jsonInputId).click()}>
        {t('importData')} (.json)
      </button>
    </div>
  );
}

function ExportMenu({ t, onExportJSON, onExportTx, onExportSections }){
  return (
    <div className="flex items-center gap-2">
      <button className="btn" onClick={onExportJSON}>{t('exportJSON')}</button>
      <button className="btn" onClick={onExportTx}>{t('exportData')} TX</button>
      <button className="btn" onClick={onExportSections}>{t('exportData')} Tables</button>
    </div>
  );
}

function ThemeMenu({ t, mode, setMode }){
  return (
    <div className="flex items-center gap-1">
      <button className={`btn ${mode==='light' ? 'btn-primary':''}`} onClick={()=> setMode('light')} title={t('themeLight')}>☀️ {t('themeLight')}</button>
      <button className={`btn ${mode==='dark' ? 'btn-primary':''}`} onClick={()=> setMode('dark')} title={t('themeDark')}>🌙 {t('themeDark')}</button>
      <button className={`btn ${mode==='system' ? 'btn-primary':''}`} onClick={()=> setMode('system')} title={t('themeSystem')}>🖥️ {t('themeSystem')}</button>
    </div>
  );
}

function HelpDialog({ t }){
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn" onClick={()=> { if (!modalIsOpen()) setOpen(true); }}>❔ {t('help')}</button>
      {open && (
        <Modal onClose={()=> setOpen(false)} title={t('helpIntroTitle')}>
          <div className="space-y-4 text-sm opacity-90">
            <p>{t('helpIntroBody')}</p>
            <h4 className="font-semibold">{t('helpSectionsTitle')}</h4>
            <p>{t('helpSectionsBody')}</p>
            <h4 className="font-semibold">{t('helpTransactionsTitle')}</h4>
            <p>{t('helpTransactionsBody')}</p>
            <h4 className="font-semibold">{t('helpTargetsTitle')}</h4>
            <p>{t('helpTargetsBody')}</p>
          </div>
          <div className="flex justify-end mt-3">
            <button className="btn btn-primary" onClick={()=> setOpen(false)}>OK</button>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ---------- Modal (single, top-most) ---------- */
function Modal({ title, onClose, children }){
  const escRef = useRef(null);

  useEffect(()=>{
    openModalLock();
    const onKey = (e)=>{ if (e.key==='Escape'){ e.preventDefault(); onClose && onClose(); } };
    window.addEventListener('keydown', onKey);
    return ()=> { window.removeEventListener('keydown', onKey); closeModalLock(); };
  }, [onClose]);

  return (
    <div className="modal" style={{ zIndex: 9999 }}>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-card card p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div id="modal-title" className="text-lg font-semibold mb-3">{title}</div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Mount ---------- */
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
