// src/LoginPage.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { authUser } from "./api";

export default function LoginPage() {
  const navigate = useNavigate();

  // mode toggle: false = login, true = create account
  const [create, setCreate] = useState(false);

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const [remember, setRemember] = useState(true); // remember me button ( boolean )
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setLoading(true);

    try {
      const payload = {
        email,
        password,
        username: create ? username : "", // only send username if creating
        type: create ? 1 : 0, // backend convention: 1 = create, 0 = login
      };

      const res = await authUser(payload);
        
      setMsg({
        type: "success",
        text: create
          ? "Cont creat cu succes. Redirecționare..."
          : "Autentificare reușită. Redirecționare...",
      });

      navigate(`/dashboardpage`);        
      


    } catch (err) {
      setMsg({ type: "error", text: err.message || "Eroare autentificare" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{create ? "Crează cont" : "Autentificare"} — SEAP AI Alerts</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-4">
            {create ? "Crează un cont nou" : "Autentificare"}
          </h1>
          <p className="text-gray-600 text-center mb-6">
            {create
              ? "Completează datele pentru a-ți crea contul."
              : "Introduceți emailul și parola pentru a continua."}
          </p>

          {/* Status messages */}
          {msg.text && (
            <div
              className={`text-center text-sm mb-4 ${
                msg.type === "error" ? "text-red-600" : "text-emerald-700"
              }`}
            >
              {msg.text}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={onSubmit}>
            {create && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm px-3 py-2"
                  placeholder="ex: softcorp"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Parolă
              </label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm px-3 py-2"
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Ține-mă minte
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-600 px-4 py-2 text-white font-medium hover:bg-cyan-700 disabled:opacity-60"
            >
              {loading ? "Se procesează…" : create ? "Crează cont" : "Autentificare"}
            </button>
          </form>

          {/* Toggle link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {create ? (
              <>
                Ai deja cont?{" "}
                <button
                  type="button"
                  onClick={() => setCreate(false)}
                  className="text-cyan-700 hover:underline"
                >
                  Autentifică-te
                </button>
              </>
            ) : (
              <>
                Nu ai cont?{" "}
                <button
                  type="button"
                  onClick={() => setCreate(true)}
                  className="text-cyan-700 hover:underline"
                >
                  Crează unul
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
}