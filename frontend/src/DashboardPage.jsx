// src/DashboardPage.jsx
import React , { useState , useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link , useNavigate } from "react-router-dom";
import { getUsername , DelogUser, getLoggedStatus } from "./api";

export default function DashboardPage() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const [logged,setLogged] = useState(null);

  useEffect( ()=>{
    getLoggedStatus().then((status) => setLogged(status));
  },[])


  return (
    <div>
      <Helmet>
        <title>Panou utilizator — SEAP AI Alerts</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="text-2xl">📄</span>
            <span>SEAP AI Alerts</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/reports" className="hover:text-cyan-700">
              Rapoarte
            </Link>
            <Link to="/settings" className="hover:text-cyan-700">
              Setări
            </Link>
          </nav>
          <div className="flex items-center gap-3"> 
            <span className="text-sm text-gray-600">{getUsername()}</span>
            <button onClick={(e) => {e.preventDefault(); DelogUser(); navigate("/"); }} className="text-sm rounded-lg border px-3 py-1.5 hover:bg-gray-100">
              Delogare
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-10 space-y-10">
        <h1 className="text-3xl font-bold">Bun venit în contul tău 👋</h1>

        {/* Quick links */}
        <section className="grid md:grid-cols-3 gap-6">
          <Link
            to="/reports"
            className="rounded-2xl bg-white border p-6 shadow hover:shadow-md transition"
          >
            <div className="text-3xl mb-3">📊</div>
            <h2 className="font-semibold text-xl mb-2">Rapoartele mele</h2>
            <p className="text-gray-600 text-sm">
              Accesează căutările salvate și rezultatele recente filtrabile.
            </p>
          </Link>
          <Link
            to="/settings"
            className="rounded-2xl bg-white border p-6 shadow hover:shadow-md transition"
          >
            <div className="text-3xl mb-3">⚙️</div>
            <h2 className="font-semibold text-xl mb-2">Setările contului</h2>
            <p className="text-gray-600 text-sm">
              Actualizează adresa de email, preferințele și parola.
            </p>
          </Link>
          <Link
            to="/alerts"
            className="rounded-2xl bg-white border p-6 shadow hover:shadow-md transition"
          >
            <div className="text-3xl mb-3">🔔</div>
            <h2 className="font-semibold text-xl mb-2">Alertele mele</h2>
            <p className="text-gray-600 text-sm">
              Gestionează notificările pe email și Telegram.
            </p>
          </Link>
        </section>

        {/* Recent activity */}
        <section className="rounded-2xl bg-white border shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Activitate recentă</h2>
          <ul className="divide-y text-sm text-gray-700">
            <li className="py-2 flex justify-between">
              <span>Ai salvat o nouă căutare: „software CRM”</span>
              <span className="text-gray-500">ieri</span>
            </li>
            <li className="py-2 flex justify-between">
              <span>Ai descărcat un raport CSV</span>
              <span className="text-gray-500">2 zile în urmă</span>
            </li>
            <li className="py-2 flex justify-between">
              <span>Ai setat o alertă pentru categoria CPV 72200000</span>
              <span className="text-gray-500">săptămâna trecută</span>
            </li>
          </ul>
        </section>
      </main>


      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500">
        © {year} SEAP AI Alerts — Dezvoltat în România 🇷🇴
      </footer>
    </div>
  );
}

