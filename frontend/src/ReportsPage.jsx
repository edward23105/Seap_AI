// src/ReportsPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { getData ,DelogUser, getUsername} from "./api";

export default function ReportsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // any init logic later
  }, []);

  const onLogout = () => {
    navigate("/login");
    DelogUser();
  };

  // View switcher
  const [view, setView] = useState("cards"); // "cards" | "board" | "compact"

  // Form state
  const [q, setQ] = useState("");
  const [cpv, setCPV] = useState("");
  const [minVal, setMinVal] = useState("");
  const [maxVal, setMaxVal] = useState("");
  const [deadlineChip, setDeadlineChip] = useState(null); // 7 | 14 | null
  const [valueChip, setValueChip] = useState(null); // "high" | "low" | null
  const [sort, setSort] = useState("");

  // UX state
  const [guardMsg, setGuardMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState([]); // saved searches

  // Results
  const [rawResults, setRawResults] = useState([]);

  // Handle chips
  const toggleDeadline = (days) =>
    setDeadlineChip((prev) => (prev === days ? null : days));
  const toggleValue = (level) =>
    setValueChip((prev) => (prev === level ? null : level));

  // Perform search
  const onSearch = async (e) => {
    e.preventDefault();
    setGuardMsg("");
    setLoading(true);
    try {
      // Save the search locally (UI only)
      const newSaved = [
        { q, cpv, min: minVal, max: maxVal, deadlineChip, valueChip, sort, ts: Date.now() },
        ...saved,
      ].slice(0, 6);
      setSaved(newSaved);

      // term for keywords
      const term = q?.trim() || null;

      // Map UI sort option to backend sort_by + order
      let sort_by = null;
      let order = "asc";

      switch (sort) {
        case "deadlineAsc":
          sort_by = "deadlineDays"; // adjust field name in backend ES query
          order = "asc";
          break;
        case "deadlineDesc":
          sort_by = "deadlineDays";
          order = "desc";
          break;
        case "valueDesc":
          sort_by = "value";       // adjust to ES field (ex: "value" / "estimatedValue")
          order = "desc";
          break;
        case "valueAsc":
          sort_by = "value";
          order = "asc";
          break;
        default:
          sort_by = null;
          order = "asc";
      }

      // Payload expected by backend (DataRequest)
      const payload = {
        keywords: term,                           // string or null
        cpv: cpv || null,                         // string or null
        minvalue: minVal ? Number(minVal) : null, // number or null
        maxvalue: maxVal ? Number(maxVal) : null, // number or null
        date: null,                               // TODO: hook up date filter later
        size: 50,                                 // how many results you want from ES
        sort_by,
        order,
      };

      // Call API
      const data = await getData(payload);
      
      // Expecting shape { deals: [...] }
      const deals = Array.isArray(data?.deals.deals) ? data.deals.deals : [];

      setRawResults(deals);
      if (!deals.length) {
        setGuardMsg("Nicio potrivire găsită pentru căutarea curentă.");
      }
    } catch (err) {
      setGuardMsg(err.message || "Eroare la căutare.");
    } finally {
      setLoading(false);
    }
  };

  const onClear = () => {
    setQ(""); setCPV(""); setMinVal(""); setMaxVal("");
    setDeadlineChip(null); setValueChip(null); setSort("deadlineAsc");
    setGuardMsg("");
  };

  // Derived results (filter + sort) — purely client-side
  const results = useMemo(() => {
    let list = [...rawResults];

    if (q) {
      const qq = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.title?.toLowerCase().includes(qq) ||
          r.description?.toLowerCase().includes(qq) ||
          r.authority?.toLowerCase().includes(qq)
      );
    }
    if (cpv) {
      const cc = cpv.replace(/\s+/g, "");
      list = list.filter((r) => String(r.cpv || "").includes(cc));
    }
    if (minVal) list = list.filter((r) => (r.value ?? 0) >= Number(minVal));
    if (maxVal) list = list.filter((r) => (r.value ?? 0) <= Number(maxVal));

    if (deadlineChip) {
      list = list.filter((r) => (r.deadlineDays ?? 999) <= deadlineChip);
    }
    if (valueChip === "high") {
      list = list.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    } else if (valueChip === "low") {
      list = list.sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
    }

    switch (sort) {
      case "deadlineAsc":
        list = list.sort((a, b) => (a.deadlineDays ?? 999) - (b.deadlineDays ?? 999));
        break;
      case "deadlineDesc":
        list = list.sort((a, b) => (b.deadlineDays ?? -1) - (a.deadlineDays ?? -1));
        break;
      case "valueDesc":
        list = list.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
        break;
      case "valueAsc":
        list = list.sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
        break;
      default:
        break;
    }
    return list;
  }, [rawResults, q, cpv, minVal, maxVal, deadlineChip, valueChip, sort]);

  // Export CSV (client-side)
  const onExportCSV = () => {
    if (!results.length) return;
    const rows = [
      ["Titlu", "Autoritate", "Valoare", "Deadline (zile)", "CPV", "Economii (%)"],
      ...results.map((r) => [
        sanitize(r.title),
        sanitize(r.authority),
        String(r.value ?? ""),
        String(r.deadlineDays ?? ""),
        String(r.cpv ?? ""),
        String(r.savings ?? ""),
      ]),
    ];
    const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "rapoarte.csv";
    document.body.appendChild(a); a.click();
    URL.revokeObjectURL(url); a.remove();
  };

  const SavedCount = saved.length;

  return (
    <>
      <Helmet>
        <title>Rapoartele mele — SEAP AI Alerts</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          .badge{display:inline-flex;align-items:center;border-radius:9999px;padding:.125rem .5rem;font-size:.75rem;font-weight:500}
          .chip{display:inline-flex;align-items:center;border-radius:9999px;padding:.25rem .625rem;font-size:.75rem;border:1px solid #e5e7eb;background:#fff;cursor:pointer}
          .chip.active{background:#e0f2fe;border-color:#bae6fd}
          .scroll-snap-x{scroll-snap-type:x mandatory}
          .snap-start{scroll-snap-align:start}
        `}</style>
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-2xl">📄</span>
            <span>SEAP AI Alerts</span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#saved" className="hover:text-cyan-700">Căutări salvate</a>
            <a href="#latest" className="hover:text-cyan-700">Rezultate recente</a>
          </nav>
          <div className="flex items-center gap-3">
            {/* FIXED: just call getUsername() */}
            <span className="text-sm text-gray-600">{getUsername()}</span>
            <button onClick={onLogout} className="text-sm rounded-lg border px-3 py-1.5 hover:bg-gray-100">
              Delogare
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-10">
        {/* Guard / status */}
        {guardMsg && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
            {guardMsg}
          </div>
        )}

        {/* Search / Filters / View Switcher */}
        <section className="rounded-2xl bg-white p-5 shadow space-y-5">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Rapoartele mele</h1>
              <p className="text-gray-600">Căutări salvate, rezultate filtrabile și export rapid.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setView("cards")} className={`viewBtn rounded-lg border px-3 py-1.5 hover:bg-gray-100 ${view==="cards"?"bg-gray-50":""}`}> Carduri</button>
              <button onClick={() => setView("board")} className={`viewBtn rounded-lg border px-3 py-1.5 hover:bg-gray-100 ${view==="board"?"bg-gray-50":""}`}> Board</button>
              <button onClick={() => setView("compact")} className={`viewBtn rounded-lg border px-3 py-1.5 hover:bg-gray-100 ${view==="compact"?"bg-gray-50":""}`}> Compact</button>
            </div>
          </div>

          <form onSubmit={onSearch} className="grid md:grid-cols-4 gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="rounded-lg border px-4 py-2"
              placeholder="Cuvinte-cheie (ex: software, drumuri)"
            />
            <input
              value={cpv}
              onChange={(e) => setCPV(e.target.value)}
              className="rounded-lg border px-4 py-2"
              placeholder="CPV (ex: 72200000)"
            />
            <input
              value={minVal}
              onChange={(e) => setMinVal(e.target.value)}
              type="number"
              className="rounded-lg border px-4 py-2"
              placeholder="Valoare min (RON)"
            />
            <input
              value={maxVal}
              onChange={(e) => setMaxVal(e.target.value)}
              type="number"
              className="rounded-lg border px-4 py-2"
              placeholder="Valoare max (RON)"
            />

            <div className="md:col-span-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 mr-2">Filtre rapide:</span>
              <button type="button" className={`chip ${deadlineChip===7?"active":""}`} onClick={() => toggleDeadline(7)}>Deadline ≤ 7 zile</button>
              <button type="button" className={`chip ${deadlineChip===14?"active":""}`} onClick={() => toggleDeadline(14)}>Deadline ≤ 14 zile</button>
              <button type="button" className={`chip ${valueChip==="high"?"active":""}`} onClick={() => toggleValue("high")}>Valoare mare</button>
              <button type="button" className={`chip ${valueChip==="low"?"active":""}`} onClick={() => toggleValue("low")}>Valoare mică</button>

              <select value={sort} onChange={(e) => setSort(e.target.value)} className="ml-auto rounded-lg border px-3 py-2">
                <option value="deadlineAsc">Sortează: Deadline ↑</option>
                <option value="deadlineDesc">Sortează: Deadline ↓</option>
                <option value="valueDesc">Sortează: Valoare ↓</option>
                <option value="valueAsc">Sortează: Valoare ↑</option>
              </select>
            </div>

            <div className="md:col-span-4 flex gap-3">
              <button
                className="rounded-lg bg-cyan-600 text-white px-5 py-2 font-semibold hover:bg-cyan-700 disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                {loading ? "Se caută…" : "Caută & salvează"}
              </button>
              <button
                type="button"
                onClick={onClear}
                className="rounded-lg border px-5 py-2 hover:bg-gray-100"
              >
                Curăță
              </button>
              <button
                type="button"
                onClick={onExportCSV}
                className="rounded-lg border px-5 py-2 hover:bg-gray-100"
                disabled={!results.length}
              >
                Export CSV
              </button>
            </div>
          </form>
        </section>

        {/* Saved */}
        <section id="saved" className="rounded-2xl bg-white p-5 shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Căutări salvate</h2>
            <span className="text-sm text-gray-500">{SavedCount} salvate</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {saved.map((s, i) => (
              <article key={i} className="rounded-xl border bg-gray-50 p-4">
                <div className="text-sm text-gray-600">
                  <b>{s.q || "—"}</b>{s.cpv ? ` • CPV ${s.cpv}` : ""}{s.min ? ` • ≥ ${s.min}` : ""}{s.max ? ` • ≤ ${s.max}` : ""}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(s.ts).toLocaleString()}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Results */}
        <section id="latest" className="rounded-2xl bg-white p-5 shadow space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Rezultate recente</h2>
            <div className="text-sm text-gray-500">
              Sursă: <span className="badge" style={{ background: "#d1fae5", color: "#065f46" }}>API</span>
            </div>
          </div>

          {/* VIEW 1: Cards */}
 {view === "cards" && (
  <div id="view-cards" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {results.map((r, i) => (
      <article
        key={i}
        className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
      >
        {/* Title + Savings */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-800 leading-tight text-base line-clamp-3">
            {r.title}
          </h3>
          {!!r.savings && (
            <span className="text-emerald-700 bg-emerald-50 text-[11px] px-2 py-0.5 rounded-full shrink-0">
              Save {r.savings}%
            </span>
          )}
        </div>

        {/* Authority + CPV */}
        <p className="text-sm text-gray-600 mt-2 leading-snug">
          {r.authority || "—"}
          {r.cpv && (
            <span className="text-gray-400"> • CPV {r.cpv}</span>
          )}
        </p>

        {/* Description */}
        <div className="mt-3 bg-slate-50 rounded-lg p-3 text-sm text-gray-700 leading-5 min-h-[70px]">
          {truncate(r.description, 180)}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-sm pt-3 border-t">
          <span className="font-semibold text-gray-800">
            {fmtRON(r.value)}
          </span>
          <span className="text-gray-500">
            Deadline:{" "}
            <span className="font-medium text-gray-700">
              {r.deadlineDays ?? "—"}
            </span>{" "}
            zile
          </span>
        </div>
      </article>
    ))}
  </div>
)}


          {/* VIEW 2: Board */}
          {view === "board" && (
            <div id="view-board" className="grid md:grid-cols-3 gap-4">
              <BoardCol title=" Urgent (≤ 7 zile)" items={results.filter((r) => (r.deadlineDays ?? 99) <= 7)} />
              <BoardCol title=" În curând (8–14 zile)" items={results.filter((r) => (r.deadlineDays ?? 99) >= 8 && (r.deadlineDays ?? 99) <= 14)} />
              <BoardCol title=" Mai târziu (> 14 zile)" items={results.filter((r) => (r.deadlineDays ?? 0) > 14)} />
            </div>
          )}

          {/* VIEW 3: Compact */}
          {view === "compact" && (
            <div id="view-compact">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="px-3 py-2">Titlu</th>
                      <th className="px-3 py-2">Autoritate</th>
                      <th className="px-3 py-2">Valoare</th>
                      <th className="px-3 py-2">Deadline</th>
                      <th className="px-3 py-2">CPV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {results.map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{r.title}</td>
                        <td className="px-3 py-2">{r.authority || "—"}</td>
                        <td className="px-3 py-2">{fmtRON(r.value)}</td>
                        <td className="px-3 py-2">{r.deadlineDays ?? "—"} zile</td>
                        <td className="px-3 py-2">{r.cpv || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

/* --- Small presentational helpers --- */
function truncate(str, n = 200) {
  if (!str) return "—";
  return str.length > n ? str.slice(0, n) + "…" : str;
}



function BoardCol({ title, items }) {
  return (
    <div className="rounded-xl border bg-gray-50 p-4">
      <div className="font-semibold mb-2">{title}</div>
      <div className="space-y-3">
        {items.length === 0 && <div className="text-sm text-gray-500">—</div>}
        {items.map((r, i) => (
          <article key={i} className="rounded-lg border bg-white p-3">
            <div className="font-medium">{r.title}</div>
            <div className="text-xs text-gray-600 mt-1">
              {r.authority || "—"} • {fmtRON(r.value)} {r.cpv ? `• CPV ${r.cpv}` : ""}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function fmtRON(n) {
  if (n == null) return "—";
  try {
    return new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${n} RON`;
  }
}

function sanitize(s) {
  return (s ?? "").toString().replace(/\n|\r/g, " ").trim();
}

function csvEscape(s) {
  const v = (s ?? "").toString();
  if (/[,"\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
