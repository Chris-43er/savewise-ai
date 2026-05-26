"use client";
import {
  LineChart,
  Line,
  ResponsiveContainer
} from "recharts";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";

type Transaction = {
  name: string;
  amount: number;
  category: string;
};

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");

  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [savingScore, setSavingScore] = useState(82);

  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("Frag mich, wie du Geld sparen kannst.");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState("home");
useEffect(() => {
  const savedEmail = localStorage.getItem("savewise_email");

  if (savedEmail) {
    setEmail(savedEmail);
    setLoggedIn(true);
  }
}, []);
  function login() {
    if (!email.trim()) return;
   localStorage.setItem("savewise_email", email);  setLoggedIn(true);
  }

  function logout() {
   localStorage.removeItem("savewise_email");  setLoggedIn(false);
    setEmail("");
  }

  function loadDemo() {
    setIncome(3200);
    setExpenses(190);
    setRemaining(3010);
    setSavingScore(82);

    setTransactions([
      { name: "Gehalt", amount: 3200, category: "Einkommen" },
      { name: "Netflix", amount: -15, category: "Abos" },
      { name: "Amazon", amount: -120, category: "Shopping" },
      { name: "Lieferdienst", amount: -45, category: "Essen" },
      { name: "Spotify", amount: -10, category: "Abos" }
    ]);
  }

  function askAI() {
    const text = message.toLowerCase();

    if (text.includes("abo")) {
      setReply("Prüfe deine Abos. Dort kannst du oft 20-50€ monatlich sparen.");
    } else if (text.includes("essen") || text.includes("liefer")) {
      setReply("Reduziere Lieferdienste. Zwei Bestellungen weniger pro Woche sparen oft über 80€ monatlich.");
    } else {
      setReply("Starte mit Abos, Lieferdiensten und Impulskäufen. Dort liegt meist das größte Sparpotenzial.");
    }

    setMessage("");
  }

  function createPdf() {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("SaveWise AI Finanzreport", 20, 20);

    doc.setFontSize(14);
    doc.text("Einkommen: " + income + " Euro", 20, 50);
    doc.text("Ausgaben: " + expenses + " Euro", 20, 65);
    doc.text("Uebrig: " + remaining + " Euro", 20, 80);
    doc.text("Sparscore: " + savingScore + "/100", 20, 95);
    doc.text("Empfehlung: Abos und Lieferdienste pruefen.", 20, 120);

    doc.save("savewise-report.pdf");
  }

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-[#060816] text-white overflow-hidden">
<div className="fixed inset-0 -z-10">
  <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/20 blur-3xl rounded-full"></div>
  <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500/20 blur-3xl rounded-full"></div>
</div>
        <div className="bg-white/5 backdrop-blur-2xl7 border border-white/10 rounded-[32px] p-8 shadow-2xl shadow-emerald-500/10">
          <h1 className="text-6xl tracking-tight font-black text-emerald-400">SaveWise AI</h1>

          <p className="text-gray-400 mt-4">
            Login zu deinem AI Finanzdashboard
          </p>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-Mail eingeben"
            className="w-full mt-8 bg-black/30 border border-white/10 rounded-2xl p-4 outline-none"
          />

          <button
            onClick={login}
            className="w-full mt-4 bg-emerald-400 text-black rounded-2xl p-4 font-black"
          >
            Einloggen
          </button>
        </div>
      </main>
    );
  }

  return(
<main className="min-h-screen bg-[#060816] text-white overflow-hidden p-6 md:p-10">
<div className="fixed inset-0 -z-10">
  <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/20 blur-3xl rounded-full"></div>
  <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500/20 blur-3xl rounded-full"></div>
</div>      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center gap-4">
          <div>
           <h1 className="text-7xl tracking-tight font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-400 drop-shadow-[0_0_25px_rgba(16,185,129,0.7)]">
  SaveWise AI
</h1>
            <p className="text-gray-400 mt-3">Eingeloggt als {email}</p>
<div className="mt-5 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
  <p className="text-gray-400 text-sm">
    Aktueller Bereich
  </p>

  <h2 className="text-2xl font-black text-emerald-400 mt-1">
    {activeTab === "home" && "Home Dashboard"}
    {activeTab === "analyse" && "Analyse Bereich"}
    {activeTab === "report" && "Report Center"}
  </h2>
</div>
          </div>
<div className="mt-8 bg-gradient-to-br from-emerald-400/20 via-white/5 to-cyan-400/10 border border-emerald-400/30 rounded-3xl p-6 shadow-2xl shadow-emerald-400/10">
  <p className="text-gray-400">
    Monatliches Sparpotenzial
  </p>

  <h2 className="text-5xl font-black text-emerald-400 mt-3">
    312€
  </h2>

  <div className="mt-5 inline-flex bg-emerald-400/20 text-emerald-400 px-4 py-2 rounded-full font-bold">
    AI Analyse aktiv
  </div>
</div>
          <button
            onClick={logout}
            className="bg-red-400 text-black px-5 py-3 rounded-2xl font-bold"
          >
            Logout
          </button>
        </div>

{activeTab === "home" && ( <div className="grid md:grid-cols-4 gap-6 mt-10">
          <Card title="Einkommen" value={income + "€"} color="text-emerald-400" />
          <Card title="Ausgaben" value={expenses + "€"} color="text-red-400" />
          <Card title="Übrig" value={remaining + "€"} color="text-yellow-400" />
          <Card title="Sparscore" value={savingScore + "/100"} color="text-cyan-400" />
        </div>
 )}
<div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/30 hover:shadow-emerald-400/20 hover:border-emerald-400/40 hover:-translate-y-1 transition-all duration-300 p-8 rounded-3xl">
  <h2 className="text-3xl font-bold">Sparscore Analyse</h2>

  <div className="flex items-center justify-center mt-8">
    <div className="w-48 h-48 rounded-full border-[18px] border-emerald-400 flex items-center justify-center shadow-2xl shadow-emerald-400/30">
      <div className="text-center">
        <p className="text-5xl font-black text-emerald-400">
          {savingScore}
        </p>
        <p className="text-gray-400 mt-1">
          von 100
        </p>
      </div>
    </div>
  </div>

  <p className="text-gray-400 text-center mt-6">
    Dein aktueller Finanzstatus ist stabil. Kleine Optimierungen bei Abos und Lieferdiensten können dein Sparpotenzial erhöhen.
  </p>
</div>
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-emerald-500/10 to-[#07111f] p-8 rounded-3xl hover:scale-[1.02] transition duration-300 border-2 border-emerald-400/50 shadow-2xl shadow-emerald-400/30 mt-8">
          <h2 className="text-3xl font-bold">AI Spar-Assistent</h2>

          <p className="text-gray-400 mt-4">{reply}</p>

          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="z.B. Wie spare ich bei Abos?"
              className="flex-1 bg-black/30 border border-white/10 rounded-2xl p-4 outline-none"
            />

            <button
              onClick={askAI}
              className="bg-emerald-400 text-black px-6 py-4 rounded-2xl font-black"
            >
              Fragen
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-emerald-500/10 to-[#07111f] p-8 rounded-3xl hover:scale-[1.02] transition duration-300 border-2 border-emerald-400/50 shadow-2xl shadow-emerald-400/30">
            <h2 className="text-3xl font-bold">Demo Analyse</h2>

            <p className="text-gray-400 mt-4">
              Lade Beispieldaten und teste dein Dashboard.
            </p>

            <button
              onClick={loadDemo}
              className="mt-6 bg-emerald-400 text-black px-6 py-4 rounded-2xl font-black"
            >
              Demo Daten laden
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-emerald-500/10 to-[#07111f] p-8 rounded-3xl hover:scale-[1.02] transition duration-300 border-2 border-emerald-400/50 shadow-2xl shadow-emerald-400/30 hover:border-emerald-400/40 hover:scale-[1.02] transition">
            <h2 className="text-3xl font-bold">PDF Report</h2>

            <p className="text-gray-400 mt-4">
              Erstelle einen Finanzreport als PDF.
            </p>

            <button
              onClick={createPdf}
              className="mt-6 bg-white text-black px-6 py-4 rounded-2xl font-black"
            >
              PDF erstellen
            </button>
          </div>
        </div>
<div className="bg-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl shadow-black/30 mt-8">
  <h2 className="text-3xl font-bold">
    Ausgaben Analyse
  </h2>
<div className="h-40 mt-6">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart
      data={[
        { value: 400 },
        { value: 300 },
        { value: 500 },
        { value: 450 },
        { value: 700 },
        { value: 650 },
        { value: 820 },
      ]}
    >
      <Line
        type="monotone"
        dataKey="value"
        stroke="#00ff99"
        strokeWidth={4}
        dot={false}
      />
    </LineChart>
  </ResponsiveContainer>
</div>

  <div className="space-y-6 mt-8">

    <div>
      <div className="flex justify-between mb-2">
        <span>Wohnen</span>
        <span className="text-emerald-400">900€</span>
      </div>

      <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-400 rounded-full w-[85%]"></div>
      </div>
    </div>

    <div>
      <div className="flex justify-between mb-2">
        <span>Essen</span>
        <span className="text-cyan-400">320€</span>
      </div>

      <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-cyan-400 rounded-full w-[55%]"></div>
      </div>
    </div>

    <div>
      <div className="flex justify-between mb-2">
        <span>Abos</span>
        <span className="text-pink-400">25€</span>
      </div>

      <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-pink-400 rounded-full w-[20%]"></div>
      </div>
    </div>

    <div>
      <div className="flex justify-between mb-2">
        <span>Shopping</span>
        <span className="text-yellow-400">120€</span>
      </div>

      <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full w-[40%]"></div>
      </div>
    </div>

  </div>
</div>
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-emerald-500/10 to-[#07111f] p-8 rounded-3xl hover:scale-[1.02] transition duration-300 border-2 border-emerald-400/50 shadow-2xl shadow-emerald-400/30 mt-8">
          <h2 className="text-3xl font-bold">Letzte Transaktionen</h2>

          <div className="space-y-4 mt-6">
            {transactions.map((item, index) => (
              <div
                key={index}
                className="bg-black/30 p-5 rounded-2xl flex justify-between items-center"
              >
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-gray-500 text-sm">{item.category}</p>
                </div>

                <p className={item.amount >= 0 ? "text-emerald-400 font-black" : "text-red-400 font-black"}>
                  {item.amount}€
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
<div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-4 flex gap-8 shadow-2xl z-50">
  <button onClick={() => setActiveTab("home")} className={activeTab === "home" ? "text-emerald-400 font-black" : "text-gray-400"}>
    Home
  </button>

  <button onClick={() => setActiveTab("analyse")} className={activeTab === "analyse" ? "text-emerald-400 font-black" : "text-gray-400"}>
    Analyse
  </button>

  <button onClick={() => setActiveTab("report")} className={activeTab === "report" ? "text-emerald-400 font-black" : "text-gray-400"}>
    Report
  </button>
</div> 
   </main>
  );
}

function Card(props: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-xl  p-8 rounded-3xl border border-white/10">
      <p className="text-gray-400">{props.title}</p>
      <h2 className={"text-5xl font-black mt-4 " + props.color}>
        {props.value}
      </h2>
    </div>
  );
}
