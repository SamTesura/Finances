const { useState, useEffect, useRef } = React;

/* Traducciones extendidas */
const translations = {
  en: {
    title: "Finance Control App",
    subtitle: "Plan, track and adjust your budgets, payments and events",
    balanceTab: "Balance",
    transactionsTab: "Transactions",
    eventsTab: "Events",
    calendarTab: "Calendar",
    addIncome: "+ Income",
    addCredit: "+ Credit Card",
    addExpense: "+ Expense",
    addAccount: "+ Debit Account",
    addCash: "+ Cash",
    balance: "Balance",
    cumulative: "Cumulative Balance",
    meta: "Set Target",
    metaSet: "Target balance set for",
    clearMeta: "Clear Target",
    addTransaction: "Add Transaction",
    addEvent: "Add Event",
    enterMeta: "Enter your target balance and date (YYYY-MM-DD) separated by a comma. Example: 10000,2023-09-15",
    detailsFor: "Budget details for",
    recurringQuestion: "Is this row recurrent?",
    recurringValue: "Enter the value to be repeated:",
    noDetails: "No details available for this day.",
    creditTitle: "Credit Card",
    expenseTitle: "Expenses",
    debitTitle: "Debit Account",
    cashTitle: "Cash",
    incomeTitle: "Income"
  },
  es: {
    title: "Finance Control App",
    subtitle: "Planee, controle y ajuste sus presupuestos, pagos y eventos",
    balanceTab: "Balance",
    transactionsTab: "Transacciones",
    eventsTab: "Eventos",
    calendarTab: "Calendario",
    addIncome: "+ Ingreso",
    addCredit: "+ Tarjeta",
    addExpense: "+ Gasto",
    addAccount: "+ Cuenta Débito",
    addCash: "+ Cash",
    balance: "Balance",
    cumulative: "Balance Acumulado",
    addTransaction: "Añadir Transacción",
    addEvent: "Añadir Evento",
    enterMeta: "Ingrese su balance meta y la fecha (AAAA-MM-DD) separados por coma. Ejemplo: 10000,2023-09-15",
    meta: "Establecer Meta",
    metaSet: "Balance meta establecido para",
    clearMeta: "Borrar Meta",
    detailsFor: "Detalles presupuestarios para",
    recurringQuestion: "¿Esta fila es recurrente?",
    recurringValue: "Ingrese el valor que se repetirá:",
    noDetails: "No hay detalles disponibles para este día.",
    creditTitle: "Tarjeta de Crédito",
    expenseTitle: "Gastos",
    debitTitle: "Cuenta de Débito",
    cashTitle: "Cash",
    incomeTitle: "Ingresos"
  },
};

function FinanceApp() {
  const [activeTab, setActiveTab] = useState("balance");
  const [lang, setLang] = useState("es");
  const t = translations[lang];

  function toggleLanguage() {
    setLang((prev) => (prev === "en" ? "es" : "en"));
  }

  return (
    <div className="app-container animate__animated animate__fadeIn">
      <header className="header">
        <button className="lang-toggle" onClick={toggleLanguage}>
          {lang === "en" ? "ES" : "EN"}
        </button>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>
      <nav className="nav-tabs">
        <div
          className={`nav-tab ${activeTab === "balance" ? "active" : ""}`}
          onClick={() => setActiveTab("balance")}
        >
          {t.balanceTab}
        </div>
        <div
          className={`nav-tab ${activeTab === "transactions" ? "active" : ""}`}
          onClick={() => setActiveTab("transactions")}
        >
          {t.transactionsTab}
        </div>
        <div
          className={`nav-tab ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          {t.eventsTab}
        </div>
        <div
          className={`nav-tab ${activeTab === "calendar" ? "active" : ""}`}
          onClick={() => setActiveTab("calendar")}
        >
          {t.calendarTab}
        </div>
      </nav>
      <div className="section">
        {activeTab === "balance" && <BalanceTab t={t} lang={lang} />}
        {activeTab === "transactions" && <TransactionsTab t={t} />}
        {activeTab === "events" && <EventsTab t={t} />}
        {activeTab === "calendar" && <CalendarView t={t} />}
      </div>
    </div>
  );
}

/************************************************
 * BALANCE TAB
 ************************************************/
function BalanceTab({ t, lang }) {
  // Genera fechas semanales como objeto {formatted, full}
  const [dates, setDates] = useState([]);
  const tableRef = useRef(null);
  const chartRef = useRef(null);

  // Para desplazar la tabla automáticamente a la fecha actual
  useEffect(() => {
    const d = generateWeeklyDates();
    setDates(d);
    loadData();
    setTimeout(() => {
      const now = new Date();
      const idx = d.findIndex(dObj =>
        dObj.full.getDate() === now.getDate() &&
        dObj.full.getMonth() === now.getMonth()
      );
      if (idx !== -1 && tableRef.current) {
        const cellWidth = 120;
        tableRef.current.scrollLeft = idx * cellWidth;
      }
    }, 500);
  }, []);

  // Estados de secciones y meta única (editable)
  const [ingresos, setIngresos] = useState([]);
  const [tarjeta, setTarjeta] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [cuenta, setCuenta] = useState([]);
  const [cash, setCash] = useState([]);
  // Estado único para balance meta
  const [balanceMeta, setBalanceMeta] = useState(null);

  // Persistir cambios en localStorage
  useEffect(() => {
    const data = { ingresos, tarjeta, gastos, cuenta, cash, balanceMeta };
    localStorage.setItem("financeData", JSON.stringify(data));
  }, [ingresos, tarjeta, gastos, cuenta, cash, balanceMeta]);

  // Cargar datos persistidos
  function loadData() {
    const data = JSON.parse(localStorage.getItem("financeData"));
    if (data) {
      setIngresos(data.ingresos || []);
      setTarjeta(data.tarjeta || []);
      setGastos(data.gastos || []);
      setCuenta(data.cuenta || []);
      setCash(data.cash || []);
      if (data.balanceMeta) {
        data.balanceMeta.raw = new Date(data.balanceMeta.raw);
        setBalanceMeta(data.balanceMeta);
      } else {
        setBalanceMeta(null);
      }
    }
  }

  // Agregar fila a una sección con modal para recurrencia
  function addRowToSection(setter) {
    // Agregar la nueva fila vacía
    setter((prev) => [...prev, { label: "", values: Array(dates.length).fill("") }]);
    // Lanzar modal para preguntar si es recurrente
    Swal.fire({
      title: t.recurringQuestion,
      html: `
        <label style="display: flex; align-items: center; justify-content: center; gap: 10px;">
          <input type="checkbox" id="recurrent-checkbox" /> ${t.recurringQuestion}
        </label>
        <input type="text" id="recurrent-value" class="swal2-input" placeholder="${t.recurringValue}">
      `,
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => {
        return {
          recurrent: document.getElementById("recurrent-checkbox").checked,
          value: document.getElementById("recurrent-value").value
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value.recurrent) {
        // Se actualiza la última fila con el valor recurrente en todas las celdas
        setter((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].values = Array(dates.length).fill(result.value.value);
          return updated;
        });
      }
    });
  }

  // Función para formatear números en vivo con separación de miles
  function formatNumber(value) {
    const cleanValue = value.toString().replace(/[^0-9.]/g, "");
    const number = parseFloat(cleanValue);
    if (isNaN(number)) return "";
    return number.toLocaleString();
  }

  // Actualizar label de la fila
  function updateLabel(section, setter, rowIndex, newLabel) {
    setter(section.map((row, i) => (i === rowIndex ? { ...row, label: newLabel } : row)));
  }
  // Actualizar valor de celda; se quitan las comas al guardar y se formatea al mostrar
  function updateValue(section, setter, rowIndex, colIndex, newValue) {
    setter(section.map((row, i) => {
      if (i === rowIndex) {
        const updated = row.values.map((val, j) =>
          j === colIndex ? newValue.replace(/,/g, "") : val
        );
        return { ...row, values: updated };
      }
      return row;
    }));
  }

  // Eliminar fila
  function deleteRow(section, setter, rowIndex) {
    setter(section.filter((_, i) => i !== rowIndex));
  }

  // Sumar columna de una sección
  function sumSection(section, colIndex) {
    return section.reduce((acc, row) => acc + (parseFloat(row.values[colIndex]) || 0), 0);
  }

  // Calcular Balance y Balance Acumulado
  const balanceRow = dates.map((_, colIndex) =>
    sumSection(ingresos, colIndex) -
    sumSection(tarjeta, colIndex) -
    sumSection(gastos, colIndex) +
    sumSection(cuenta, colIndex) +
    sumSection(cash, colIndex)
  );
  let runningTotal = 0;
  const cumulativeRow = balanceRow.map((val) => (runningTotal += val));

  // Modal para establecer (o editar) el Balance Meta único
  async function handleSetMeta() {
    const defaultDate = new Date().toISOString().split("T")[0];
    const defaultDateValue = balanceMeta ? new Date(balanceMeta.raw).toISOString().split("T")[0] : defaultDate;
    const defaultAmount = balanceMeta ? balanceMeta.amount : "";
  
    const { value: formValues } = await Swal.fire({
      title: t.meta,
      html:
        `<input id="meta-amount" type="number" class="swal2-input" placeholder="${t.meta} amount" value="${defaultAmount}">` +
        `<input id="meta-date" type="date" class="swal2-input" placeholder="Select target date" value="${defaultDateValue}">`,
      focusConfirm: false,
      preConfirm: () => {
        return {
          amount: document.getElementById("meta-amount").value,
          date: document.getElementById("meta-date").value
        };
      }
    });
    if (formValues) {
      const amount = parseFloat(formValues.amount);
      const metaDateRaw = new Date(formValues.date);
      if (isNaN(amount) || isNaN(metaDateRaw)) {
        Swal.fire("Error", "Invalid amount or date", "error");
        return;
      }
      const dayMeta = String(metaDateRaw.getDate()).padStart(2, "0");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formatted = `${dayMeta}-${monthNames[metaDateRaw.getMonth()]}`;
      setBalanceMeta({ raw: metaDateRaw, formatted, amount, enabled: true });
      Swal.fire("Success", `${t.metaSet} ${formatted}: ${amount}`, "success");
    }
  }

  // Configurar gráfica, traza la línea meta progresiva hasta la fecha meta
  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");
    if (chartRef.current.chartInstance) chartRef.current.chartInstance.destroy();

    let filteredDates = dates;
    let filteredCumulativeRow = cumulativeRow;
    const datasets = [
      {
        label: t.cumulative,
        data: filteredCumulativeRow,
        borderColor: "#4a90e2",
        fill: false,
      },
    ];

    if (balanceMeta && balanceMeta.enabled) {
      const targetIndex = dates.findIndex(d => d.full >= balanceMeta.raw);
      if (targetIndex !== -1) {
        filteredDates = dates.slice(0, targetIndex + 1);
        filteredCumulativeRow = cumulativeRow.slice(0, targetIndex + 1);
        const progressiveData = filteredDates.map((d, i) => {
          return (balanceMeta.amount / (targetIndex + 1)) * (i + 1);
        });
        datasets.push({
          label: t.meta,
          data: progressiveData,
          borderColor: "#00c853",
          borderDash: [5, 5],
          fill: false,
        });
      }
    }

    const config = {
      type: "line",
      data: {
        labels: filteredDates.map(d => d.formatted),
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          annotation: {
            annotations: balanceMeta && balanceMeta.enabled && filteredDates.length > 0 ? {
              line1: {
                type: "line",
                mode: "horizontal",
                scaleID: "y",
                value: balanceMeta.amount,
                borderColor: "#00c853",
                borderWidth: 2,
                label: {
                  enabled: true,
                  content: `${t.meta}: ${balanceMeta.amount}`,
                  backgroundColor: "rgba(0,200,83,0.7)",
                },
              },
            } : {}
          }
        },
        scales: { x: { display: true }, y: { display: true } },
      },
    };
    chartRef.current.chartInstance = new Chart(ctx, config);
    const handleResize = () => chartRef.current.chartInstance.update();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dates, cumulativeRow, balanceMeta, t]);

  return (
     <div>
      <h2>{t.balanceTab}</h2>
      <div className="add-buttons-container">
        <button className="button" onClick={() => addRowToSection(setIngresos)}>{t.addIncome}</button>
        <button className="button" onClick={() => addRowToSection(setTarjeta)}>{t.addCredit}</button>
        <button className="button" onClick={() => addRowToSection(setGastos)}>{t.addExpense}</button>
        <button className="button" onClick={() => addRowToSection(setCuenta)}>{t.addAccount}</button>
        <button className="button" onClick={() => addRowToSection(setCash)}>{t.addCash}</button>
        <button className="button" onClick={handleSetMeta}>{t.meta}</button>
        <button className="button delete-btn" onClick={() => {
          setBalanceMeta(null);
          localStorage.setItem("financeData", JSON.stringify({
            ingresos,
            tarjeta,
            gastos,
            cuenta,
            cash,
            balanceMeta: null
          }));
          Swal.fire("Success", t.clearMeta + " successfully cleared", "success");
        }}>
          {t.clearMeta}
        </button>
      </div>
      <div className="table-container" ref={tableRef}>
        <table>
          <thead>
            <tr>
              <th style={{ minWidth: "180px" }}>Concepto</th>
              {dates.map((d, idx) => <th key={idx}>{d.formatted}</th>)}
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {/* Ingresos */}
            {ingresos.length > 0 && (
              <tr>
                <td style={{ background: "#e0f7fa", fontWeight: "bold", textAlign: "left" }}>{t.incomeTitle}</td>
                {dates.map((_, idx) => (
                  <td key={idx} style={{ background: "#e0f7fa" }}></td>
                ))}
                <td style={{ background: "#e0f7fa" }}></td>
              </tr>
            )}
            {ingresos.map((row, rowIndex) => (
              <tr key={`ing-${rowIndex}`}>
                <td>
                  <input
                    type="text"
                    placeholder={lang === "en" ? "e.g. Salary" : "Ej. Sueldo"}
                    value={row.label}
                    onChange={(e) => updateLabel(ingresos, setIngresos, rowIndex, e.target.value)}
                  />
                </td>
                {row.values.map((val, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type="text"
                      value={formatNumber(val.toString())}
                      onChange={(e) => updateValue(ingresos, setIngresos, rowIndex, colIndex, e.target.value)}
                    />
                  </td>
                ))}
                <td>
                  <button className="button delete-btn" onClick={() => deleteRow(ingresos, setIngresos, rowIndex)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {/* Tarjeta de Crédito */}
            {tarjeta.length > 0 && (
              <tr>
                <td style={{ background: "#e0f7fa", fontWeight: "bold", textAlign: "left" }}>{t.creditTitle}</td>
                {dates.map((_, idx) => (
                  <td key={idx} style={{ background: "#e0f7fa" }}></td>
                ))}
                <td style={{ background: "#e0f7fa" }}></td>
              </tr>
            )}
            {tarjeta.map((row, rowIndex) => (
              <tr key={`tar-${rowIndex}`}>
                <td>
                  <input
                    type="text"
                    placeholder={lang === "en" ? "e.g. APAP" : "Ej. APAP"}
                    value={row.label}
                    onChange={(e) => updateLabel(tarjeta, setTarjeta, rowIndex, e.target.value)}
                  />
                </td>
                {row.values.map((val, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type="text"
                      value={formatNumber(val.toString())}
                      onChange={(e) => updateValue(tarjeta, setTarjeta, rowIndex, colIndex, e.target.value)}
                    />
                  </td>
                ))}
                <td>
                  <button className="button delete-btn" onClick={() => deleteRow(tarjeta, setTarjeta, rowIndex)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {/* Gastos */}
            {gastos.length > 0 && (
              <tr>
                <td style={{ background: "#e0f7fa", fontWeight: "bold", textAlign: "left" }}>{t.expenseTitle}</td>
                {dates.map((_, idx) => (
                  <td key={idx} style={{ background: "#e0f7fa" }}></td>
                ))}
                <td style={{ background: "#e0f7fa" }}></td>
              </tr>
            )}
            {gastos.map((row, rowIndex) => (
              <tr key={`gas-${rowIndex}`}>
                <td>
                  <input
                    type="text"
                    placeholder={lang === "en" ? "e.g. Electricity" : "Ej. Luz"}
                    value={row.label}
                    onChange={(e) => updateLabel(gastos, setGastos, rowIndex, e.target.value)}
                  />
                </td>
                {row.values.map((val, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type="text"
                      value={formatNumber(val.toString())}
                      onChange={(e) => updateValue(gastos, setGastos, rowIndex, colIndex, e.target.value)}
                    />
                  </td>
                ))}
                <td>
                  <button className="button delete-btn" onClick={() => deleteRow(gastos, setGastos, rowIndex)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {/* Cuenta de Débito */}
            {cuenta.length > 0 && (
              <tr>
                <td style={{ background: "#e0f7fa", fontWeight: "bold", textAlign: "left" }}>{t.debitTitle}</td>
                {dates.map((_, idx) => (
                  <td key={idx} style={{ background: "#e0f7fa" }}></td>
                ))}
                <td style={{ background: "#e0f7fa" }}></td>
              </tr>
            )}
            {cuenta.map((row, rowIndex) => (
              <tr key={`cue-${rowIndex}`}>
                <td>
                  <input
                    type="text"
                    placeholder={lang === "en" ? "e.g. Bank XYZ" : "Ej. Banco XYZ"}
                    value={row.label}
                    onChange={(e) => updateLabel(cuenta, setCuenta, rowIndex, e.target.value)}
                  />
                </td>
                {row.values.map((val, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type="text"
                      value={formatNumber(val.toString())}
                      onChange={(e) => updateValue(cuenta, setCuenta, rowIndex, colIndex, e.target.value)}
                    />
                  </td>
                ))}
                <td>
                  <button className="button delete-btn" onClick={() => deleteRow(cuenta, setCuenta, rowIndex)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {/* Cash */}
            {cash.length > 0 && (
              <tr>
                <td style={{ background: "#e0f7fa", fontWeight: "bold", textAlign: "left" }}>{t.cashTitle}</td>
                {dates.map((_, idx) => (
                  <td key={idx} style={{ background: "#e0f7fa" }}></td>
                ))}
                <td style={{ background: "#e0f7fa" }}></td>
              </tr>
            )}
            {cash.map((row, rowIndex) => (
              <tr key={`cash-${rowIndex}`}>
                <td>
                  <input
                    type="text"
                    placeholder={lang === "en" ? "e.g. Plan" : "Ej. Plan"}
                    value={row.label}
                    onChange={(e) => updateLabel(cash, setCash, rowIndex, e.target.value)}
                  />
                </td>
                {row.values.map((val, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type="text"
                      value={formatNumber(val.toString())}
                      onChange={(e) => updateValue(cash, setCash, rowIndex, colIndex, e.target.value)}
                    />
                  </td>
                ))}
                <td>
                  <button className="button delete-btn" onClick={() => deleteRow(cash, setCash, rowIndex)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {/* Balance y Acumulado */}
            {dates.length > 0 && (
               <React.Fragment>
                <tr style={{ background: "#e8f0fe" }}>
                  <td style={{ fontWeight: "bold" }}>{t.balance}</td>
                  {balanceRow.map((val, i) => (
                    <td key={i} className={val < 0 ? "negative" : ""}>
                      <strong>{val}</strong>
                    </td>
                  ))}
                </tr>
                <tr style={{ background: "#e2efff" }}>
                  <td style={{ fontWeight: "bold" }}>{t.cumulative}</td>
                  {cumulativeRow.map((val, i) => (
                    <td key={i}>
                      <strong>{val}</strong>
                    </td>
                  ))}
                </tr>
              </React.Fragment>
            )}
          </tbody>
        </table>
      </div>
      <p>
        <em>
          {lang === "en"
            ? "Add rows and edit values to update calculations."
            : "Agregue filas y edite los valores para actualizar los cálculos."}
        </em>
      </p>
      <div className="chart-container" style={{ height: "300px" }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}

/************************************************
 * TRANSACTIONS TAB
 ************************************************/
function TransactionsTab({ t }) {
  const [transactions, setTransactions] = useState([]);

  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const [referenceDate, setReferenceDate] = useState(startOfYear);

  // Actualizar transacción y calcular campos derivados
  function updateTransaction(index, field, value) {
    setTransactions((prev) =>
      prev.map((tran, i) => {
        if (i !== index) return tran;
        const updatedTran = { ...tran, [field]: value };

        // Calcular "Próximo Corte" basado en el día de corte
        if (field === "corte" || field === "fecha") {
          const cutoffDay = parseInt(updatedTran.corte) || 1;
          const tranDate = new Date(updatedTran.fecha || referenceDate);
          let nextCutoff = new Date(tranDate.getFullYear(), tranDate.getMonth(), cutoffDay);
          if (nextCutoff <= tranDate) {
            nextCutoff.setMonth(nextCutoff.getMonth() + 1);
          }
          updatedTran.proxCorte = nextCutoff.toISOString().split("T")[0];
        }

        // Calcular "Créditos al Corte" y "Débitos al Corte"
        if (field === "monto" || field === "metodo") {
          updatedTran.creditosAlCorte = updatedTran.metodo === "APAP" ? parseFloat(updatedTran.monto) || 0 : 0;
          updatedTran.debitosAlCorte = updatedTran.metodo !== "APAP" ? parseFloat(updatedTran.monto) || 0 : 0;
        }

        // Calcular "Dif. Plan vs. Act."
        if (field === "monto" || field === "balanceAl") {
          updatedTran.dif = (parseFloat(updatedTran.monto) || 0) - (parseFloat(updatedTran.balanceAl) || 0);
        }

        return updatedTran;
      })
    );
  }

  // Agregar nueva transacción
  function addTransaction() {
    setTransactions((prev) => [
      ...prev,
      {
        fecha: "",
        semana: "",
        concepto: "",
        monto: "",
        metodo: "",
        cuentas: "",
        diaplazo: "",
        diacorta: "",
        proxCorte: "",
        creditosAlCorte: "",
        debitosAlCorte: "",
        dif: "",
        balanceAl: "",
      },
    ]);
  }

  // Eliminar transacción
  function deleteTransaction(index) {
    setTransactions((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <h2>{t.transactionsTab}</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Semana</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Método de pago</th>
              <th>Cuentas</th>
              <th>Día de Plazo</th>
              <th>Día de Corte</th>
              <th>Próximo Corte</th>
              <th>Créditos al Corte</th>
              <th>Débitos al Corte</th>
              <th>Diferencia Plan vs Actual</th>
              <th>Balance Actual</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tran, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="date"
                    value={tran.fecha}
                    onChange={(e) => updateTransaction(index, "fecha", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={tran.semana}
                    onChange={(e) => updateTransaction(index, "semana", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={tran.concepto}
                    onChange={(e) => updateTransaction(index, "concepto", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={tran.monto}
                    onChange={(e) => updateTransaction(index, "monto", e.target.value)}
                  />
                </td>
                <td>
                  <select value={tran.metodo} onChange={(e) => updateTransaction(index, "metodo", e.target.value)}>
                    <option value="">Seleccionar</option>
                    <option value="APAP">APAP</option>
                    <option value="Banco Popular">Banco Popular</option>
                    <option value="BR">BR</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={tran.cuentas}
                    onChange={(e) => updateTransaction(index, "cuentas", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={tran.diaplazo}
                    onChange={(e) => updateTransaction(index, "diaplazo", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={tran.diacorta}
                    onChange={(e) => updateTransaction(index, "diacorta", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={tran.proxCorte}
                    onChange={(e) => updateTransaction(index, "corte", e.target.value)}
                  />
                </td>
                <td>
                  <input type="text" value={tran.proxCorte} readOnly />
                </td>
                <td>
                  <input type="number" value={tran.creditosAlCorte} readOnly />
                </td>
                <td>
                  <input type="number" value={tran.debitosAlCorte} readOnly />
                </td>
                <td>
                  <input type="number" value={tran.dif} readOnly />
                </td>
                <td>
                  <input
                    type="number"
                    value={tran.balanceAl}
                    onChange={(e) => updateTransaction(index, "balanceAl", e.target.value)}
                  />
                </td>
                <td>
                  <button className="button delete-btn" onClick={() => deleteTransaction(index)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="button" onClick={addTransaction}>
        {t.addTransaction}
      </button>
    </div>
  );
}

/************************************************
 * EVENTS TAB
 ************************************************/
function EventsTab({ t }) {
  const [events, setEvents] = useState([]);

  function updateEvent(index, field, value) {
    setEvents((prev) =>
      prev.map((ev, i) => (i === index ? { ...ev, [field]: value } : ev))
    );
  }

  function addEvent() {
    setEvents((prev) => [...prev, { mes: "", dia: "", evento: "", presupuesto: "" }]);
  }

  function deleteEvent(index) {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <h2>{t.eventsTab}</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Día</th>
              <th>Eventos</th>
              <th>Presupuesto</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="number"
                    value={ev.mes}
                    onChange={(e) => updateEvent(index, "mes", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={ev.dia}
                    onChange={(e) => updateEvent(index, "dia", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={ev.evento}
                    onChange={(e) => updateEvent(index, "evento", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={ev.presupuesto}
                    onChange={(e) => updateEvent(index, "presupuesto", e.target.value)}
                  />
                </td>
                <td>
                  <button className="button delete-btn" onClick={() => deleteEvent(index)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="button" onClick={addEvent}>
        {t.addEvent}
      </button>
    </div>
  );
}

/************************************************
 * CALENDAR VIEW
 ************************************************/
function CalendarView({ t }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  function getCalendarMatrix(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const matrix = [];
    let row = [];
    for (let i = 0; i < firstDay; i++) row.push("");
    for (let d = 1; d <= daysInMonth; d++) {
      row.push(d);
      if (row.length === 7) {
        matrix.push(row);
        row = [];
      }
    }
    if (row.length) {
      while (row.length < 7) row.push("");
      matrix.push(row);
    }
    return matrix;
  }
  const calendarMatrix = getCalendarMatrix(currentDate);

  function handlePrevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }

  function handleDayClick(day) {
    if (day === "") return;
    setSelectedDay(day);
  }

  // Simulación: obtiene detalles del balance para el día (aquí debes integrar tus datos reales)
  function getBalanceDetails(day) {
    return day % 2 === 0 ? `Detalles del balance para el día ${day}` : "";
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="button" onClick={handlePrevMonth}>Prev</button>
        <span style={{ margin: "0 10px" }}>
          {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
        </span>
        <button className="button" onClick={handleNextMonth}>Next</button>
      </div>
      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
          <div key={i} className="calendar-cell" style={{ fontWeight: "bold" }}>
            {d}
          </div>
        ))}
        {calendarMatrix.flat().map((day, idx) => (
          <div key={idx} className="calendar-cell" onClick={() => handleDayClick(day)}>
            {day}
          </div>
        ))}
      </div>
      {selectedDay !== null && (
        <div className="balance-details">
          {getBalanceDetails(selectedDay) || t.noDetails}
        </div>
      )}
    </div>
  );
}

/************************************************
 * UTILITIES
 ************************************************/
function generateWeeklyDates() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const start = new Date(currentYear, 0, 1);
  const end = new Date(currentYear, 11, 31);
  let dates = [];
  let temp = new Date(start);
  while (temp <= end) {
    dates.push({ formatted: formatDate(temp), full: new Date(temp) });
    temp.setDate(temp.getDate() + 7);
  }
  return dates;
}

function formatDate(dateObj) {
  const day = String(dateObj.getDate()).padStart(2, "0");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day}-${monthNames[dateObj.getMonth()]}`;
}

ReactDOM.render(<FinanceApp />, document.getElementById("root"));
