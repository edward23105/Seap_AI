// src/FrontPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import { getLoggedStatus } from "./api"

export default function FrontPage() {
  // mobile menu
  const [open, setOpen] = useState(false);
  const [logged, setLogged] = useState(false);

  // hero search → /deals?business=...
  const [business, setBusiness] = useState("");
  const navigate = useNavigate();
  const onSubmit = (e) => {
    e.preventDefault();
    if (!business.trim()) return;
    navigate(`/deals?business=${encodeURIComponent(business.trim())}`);
  };
  
  // charts
  const lineRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => { // RANDARE TABELE 
    // (async () => {const status = await getLoggedStatus(); setLogged(status); })();
    getLoggedStatus().then(status => setLogged(status));

    const line = new Chart(lineRef.current, {
      type: "line",
      data: {
        labels: ["S1","S2","S3","S4","S5","S6","S7","S8"],
        datasets: [
          { label: "Licitații / săptămână", data: [12,14,15,18,17,21,25,27], tension: 0.35, pointRadius: 3 }
        ]
      }, 
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    const bar = new Chart(barRef.current, {
      type: "bar",
      data: {
        labels: ["72200000","48800000","32400000","30200000","45300000"],
        datasets: [{ label: "Nr. licitații (30 zile)", data: [34,27,22,18,15] }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    return () => { line.destroy(); bar.destroy(); };
  }, []);

  const year = new Date().getFullYear();

  return (
    <main className="bg-slate-50 text-slate-800">
      {/* HEAD (moved here via Helmet) */}
      <Helmet>
        <title>SEAPIntel — AI pentru licitații SEAP</title>
        <meta
          name="description"
          content="SEAPIntel: găsește licitații SEAP relevante cu AI. Filtre smart, alerte, rapoarte și grafice de tendințe."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style>{`
          html { scroll-behavior: smooth; }
          body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; }
        `}</style>
      </Helmet>

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="text-2xl">🧭</span>
            <span>SEAP<span className="text-cyan-700">Intel</span></span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-cyan-700">Funcții</a>
            <a href="#insights" className="hover:text-cyan-700">Insights</a>
            <a href="#cases" className="hover:text-cyan-700">Studii de caz</a>
            <a href="#pricing" className="hover:text-cyan-700">Prețuri</a>
            <a href="#faq" className="hover:text-cyan-700">FAQ</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            {!logged ?(<a href="/login" className="px-4 py-2 rounded-lg border hover:bg-slate-100">Login</a>) : null}
            {!logged ?(<a href="/login" className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700">Încearcă gratuit</a>) : null}
            {logged ? (<a href="/dashboardpage"className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition">Dashboard</a>) : null}
          </div>
          <button
            className="md:hidden p-2 rounded-lg border hover:bg-slate-100"
            aria-label="Deschide meniul"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
        <div className={`md:hidden border-t ${open ? "" : "hidden"}`}>
          <nav className="px-4 py-3 flex flex-col gap-3 text-sm">
            <a href="#features" className="hover:text-cyan-700">Funcții</a>
            <a href="#insights" className="hover:text-cyan-700">Insights</a>
            <a href="#cases" className="hover:text-cyan-700">Studii de caz</a>
            <a href="#pricing" className="hover:text-cyan-700">Prețuri</a>
            <a href="#faq" className="hover:text-cyan-700">FAQ</a>
            <div className="pt-2 border-t flex gap-3">
              <a href="/login" className="flex-1 px-4 py-2 rounded-lg border text-center">Login</a>
              <a href="/signup" className="flex-1 px-4 py-2 rounded-lg bg-cyan-600 text-white text-center">Încearcă gratuit</a>
            </div>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-indigo-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">
              <span>Nou</span><span className="w-1 h-1 rounded-full bg-emerald-600" /><span>AI îmbunătățit.</span>
            </span>
            <h1 className="mt-4 text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Găsește licitații SEAP <span className="text-cyan-700">relevante</span> în secunde, nu zile
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-2xl">
              Sumarizări AI, potrivire CPV & bugete, alerte și rapoarte — tot ce-ți trebuie ca să intri la timp cu oferta.
            </p>

            {/* REACT form (navigate to /deals) */}
            <form onSubmit={onSubmit} className="mt-8 flex gap-3">
              <input
                type="text"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                placeholder="Introdu business-ul..."
                className="flex-1 rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-600"
              />
              <button className="px-6 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700">
                Caută
              </button>
            </form>

            <p className="mt-3 text-sm text-slate-500">Fără card • Încercare gratuită 14 zile</p>

            {/* KPIs */}
            <div className="mt-10 grid grid-cols-3 gap-6">
              <div className="rounded-xl border bg-white p-4">
                <div className="text-2xl font-extrabold">3×</div>
                <div className="text-sm text-slate-600">mai rapid la filtrare</div>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <div className="text-2xl font-extrabold">−40%</div>
                <div className="text-sm text-slate-600">timp pe anunțuri irelevante</div>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <div className="text-2xl font-extrabold">24/7</div>
                <div className="text-sm text-slate-600">alerte în timp util</div>
              </div>
            </div>
          </div>

          {/* Product Preview */}
          <div className="rounded-2xl border bg-white shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Flux zilnic — potriviri pentru tine</div>
              <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-1 rounded">DEMO</span>
            </div>
            <div className="mt-4 space-y-4">
              <article className="p-4 rounded-xl border hover:shadow transition">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Modernizare infrastructură IT</h3>
                  <span className="text-emerald-700 bg-emerald-50 text-xs px-2 py-1 rounded">Potrivire 92%</span>
                </div>
                <p className="text-sm text-slate-600">CJ Iași • 1.200.000 RON • CPV 48800000</p>
                <p className="mt-2 text-sm bg-slate-50 p-3 rounded">Sumar: upgrade servere + rețea, 12 luni mentenanță.</p>
              </article>
              <article className="p-4 rounded-xl border hover:shadow transition">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Aplicație mobilă campus</h3>
                  <span className="text-emerald-700 bg-emerald-50 text-xs px-2 py-1 rounded">Potrivire 87%</span>
                </div>
                <p className="text-sm text-slate-600">Univ. București • 220.000 RON • CPV 72200000</p>
                <p className="mt-2 text-sm bg-slate-50 p-3 rounded">Sumar: iOS/Android, integrări SSO, suport 12 luni.</p>
              </article>
              <article className="p-4 rounded-xl border hover:shadow transition">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">CRM documente administrație</h3>
                  <span className="text-emerald-700 bg-emerald-50 text-xs px-2 py-1 rounded">Potrivire 84%</span>
                </div>
                <p className="text-sm text-slate-600">Primăria Cluj • 350.000 RON • CPV 72212100</p>
                <p className="mt-2 text-sm bg-slate-50 p-3 rounded">Sumar: fluxuri documente, audit trail, training.</p>
              </article>
            </div>
            <div className="mt-4 text-right">
              <a href="/login" className="text-cyan-700 font-medium hover:underline">Vezi toate potrivirile →</a>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">De ce SEAPIntel</h2>
            <p className="mt-3 text-slate-600">Tot fluxul tău — din căutare până la ofertă — într-un singur loc.</p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Feature icon="🔎" title="Căutare inteligentă" desc="Filtre CPV, buget, autoritate, perioadă, cuvinte cheie." />
            <Feature icon="🤖" title="Sumarizare AI" desc="3 propoziții clare: obiect, valoare, deadline & cerințe cheie." />
            <Feature icon="⚡" title="Alerte în timp util" desc="Email/Telegram când apare ceva relevant pentru tine." />
            <Feature icon="📊" title="Rapoarte & Export" desc="CSV rapid și dashboarduri pentru management." />
          </div>
        </div>
      </section>

      {/* INSIGHTS (GRAPHS) */}
      <section id="insights" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-extrabold">Insights & Tendințe</h2>
            <a href="/reports" className="text-cyan-700 hover:underline font-medium">Vezi rapoarte detaliate →</a>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl border bg-slate-50 p-6">
              <h3 className="font-semibold mb-3">Licitații pe săptămână (demo)</h3>
              <canvas ref={lineRef} height="160" />
            </div>
            <div className="rounded-2xl border bg-slate-50 p-6">
              <h3 className="font-semibold mb-3">Top categorii CPV (demo)</h3>
              <canvas ref={barRef} height="160" />
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-500">* Date demonstrative. În produs, graficele se alimentează din căutările tale salvate.</p>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Cum arată o zi cu SEAPIntel</h2>
            <p className="mt-3 text-slate-600">De la alertă la ofertă, în 4 pași simpli.</p>
          </div>
          <ol className="mt-10 relative border-s before:absolute before:left-2 before:top-0 before:bottom-0 before:w-1 before:bg-cyan-600/20 pl-10 space-y-8">
            <li><h3 className="font-semibold">07:30 — Primești alertele</h3><p className="text-slate-600 text-sm">Email/Telegram cu 5–10 potriviri curate, sumarizate de AI.</p></li>
            <li><h3 className="font-semibold">08:30 — Filtrezi rapid</h3><p className="text-slate-600 text-sm">Aplici filtre pe CPV, buget, autoritate; salvezi căutările.</p></li>
            <li><h3 className="font-semibold">10:00 — Analiză & decizie</h3><p className="text-slate-600 text-sm">Despici cerințele cheie, vezi istoricul achizițiilor similare.</p></li>
            <li><h3 className="font-semibold">14:00 — Pregătești oferta</h3><p className="text-slate-600 text-sm">Export CSV, checklist cerințe, împărtășești cu echipa.</p></li>
          </ol>
        </div>
      </section>

      {/* CASE STUDIES */}
      <section id="cases" className="py-20 bg-slate-100/60">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center">Studii de caz</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <Case tag="IT Services" title="SoftCorp" subtitle="+2 contracte/lună, -6 ore/săptămână pe analiză." quote="Primim potrivirile corecte, la timp. Echipa intră devreme cu întrebări & ofertă." />
            <Case tag="Echipamente" title="TechSupply" subtitle="-30% timp pierdut, +15% marjă medie." quote="Comparăm rapid cantități & prețuri, știm pe ce să licităm." />
            <Case tag="Consultanță" title="BidPartners" subtitle="Pipeline automat, rapoarte executive săptămânale." quote="Calendar clar, alerte curate, export pentru ofertare în 1 click." />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center">Planuri transparente</h2>
          <p className="text-center text-slate-600 mt-2">Începi gratuit. Scalezi când ai nevoie.</p>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <PriceCard title="Starter" price="0 RON" features={["5 potriviri/zi","Sumarizare AI","Export CSV"]} cta="Încearcă gratuit" href="/signup" />
            <PriceCard title="Pro" price="199 RON/lună" highlight features={["Nelimitat potriviri","Alerte email/Telegram","Rapoarte avansate","Support prioritar"]} cta="Activează Pro" href="/checkout" />
            <PriceCard title="Enterprise" price="Custom" features={["Acces API","SSO & audit","SLA dedicat"]} cta="Contactează-ne" href="/contact" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-3xl font-extrabold text-center">Întrebări frecvente</h2>
          <div className="mt-10 divide-y rounded-2xl border bg-white">
            <Faq q="Datele mele părăsesc compania?" a="Nu. AI rulează local, iar datele rămân în infrastructura ta." />
            <Faq q="Pot integra cu CRM-ul nostru?" a="Da. Planul Enterprise include API și webhook-uri." />
            <Faq q="Aveți perioadă de probă?" a="Da, 14 zile gratuit fără card." />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-to-br from-cyan-600 to-indigo-700 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold">Începe azi cu SEAPIntel</h2>
          <p className="mt-3 text-cyan-100">Alerte curate, potriviri reale și rapoarte utile. Fără zgomot.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/signup" className="inline-flex items-center justify-center rounded-xl bg-white text-cyan-700 px-7 py-3 font-semibold hover:bg-cyan-50">Creează cont</a>
            <a href="/contact" className="inline-flex items-center justify-center rounded-xl border border-white/50 px-7 py-3 font-semibold hover:bg-white/10">Contact sales</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div>© {year} SEAPIntel • Cluj-Napoca, RO</div>
          <div className="flex gap-4">
            <a href="/terms" className="hover:text-slate-700">Termeni</a>
            <a href="/privacy" className="hover:text-slate-700">Confidențialitate</a>
            <a href="/contact" className="hover:text-slate-700">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* Helpers */
function Feature({ icon, title, desc }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-slate-600">{desc}</p>
    </div>
  );
}

function Case({ tag, title, subtitle, quote }) {
  return (
    <article className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="text-xs bg-emerald-50 text-emerald-700 inline-block px-2 py-1 rounded">{tag}</div>
      <h3 className="font-semibold text-lg mt-3">{title}</h3>
      <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
      <hr className="my-4" />
      <p className="text-sm">“{quote}”</p>
    </article>
  );
}

function PriceCard({ title, price, features, cta, href, highlight }) {
  return (
    <div className={`rounded-2xl border bg-white p-6 shadow-sm ${highlight ? "ring-2 ring-cyan-600" : ""}`}>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-3xl font-extrabold mt-2">{price}</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {features.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
      <a href={href} className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 ${highlight ? "bg-cyan-600 text-white hover:bg-cyan-700" : "border hover:bg-slate-50"}`}>
        {cta}
      </a>
    </div>
  );
}

function Faq({ q, a }) {
  return (
    <details className="group p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between">
        <span className="font-semibold">{q}</span>
        <span className="transition group-open:rotate-180">⌄</span>
      </summary>
      <p className="mt-3 text-slate-600">{a}</p>
    </details>
  );
}

































