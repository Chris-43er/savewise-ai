"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import Papa from "papaparse";
import { Home, BarChart3, FileText, Upload, Settings } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

type Transaction = {
  name: string;
  amount: number;
  category: string;
};

const defaultTransactions: Transaction[] = [
  { name: "Netflix", amount: -12.99, category: "Streaming" },
  { name: "REWE", amount: -48.2, category: "Lebensmittel" },
  { name: "Gehalt", amount: 3200, category: "Einkommen" }
];

export default function Page() {
  const [activeTab, setActiveTab] = useState("home");
  const [showSettings, setShowSettings] = useState(false);
const [isLightMode, setIsLightMode] = useState(false);

  const [uploadedFile, setUploadedFile] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");

  const [savingScore, setSavingScore] = useState(82);
  const [monthlySavings, setMonthlySavings] = useState(120);
  const [monthlyBudget, setMonthlyBudget] = useState(1200);
  const [budgetInput, setBudgetInput] = useState("1200");
  const [spentThisMonth, setSpentThisMonth] = useState(840);
  const [topCategory, setTopCategory] = useState("Streaming");
  const [history, setHistory] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions);

  const [chatMessage, setChatMessage] = useState("");
  const [chatReply, setChatReply] = useState("Hallo 👋 Ich bin dein AI Finanzassistent.");
const [savingGoal, setSavingGoal] = useState("");
const [goalAmount, setGoalAmount] = useState(0);
const [savedAmount, setSavedAmount] = useState(0);

  useEffect(() => {
    const savedGoal = localStorage.getItem("savewise_goal_name");
    const savedGoalAmount = localStorage.getItem("savewise_goal_amount");
    const savedSavedAmount = localStorage.getItem("savewise_saved_amount");

    if (savedGoal) setSavingGoal(savedGoal);
    if (savedGoalAmount) setGoalAmount(Number(savedGoalAmount));
    if (savedSavedAmount) setSavedAmount(Number(savedSavedAmount));
  }, []);

  useEffect(() => {
    const savedBudget = localStorage.getItem("savewise_budget");
    const savedData = localStorage.getItem("savewise_data");

    if (savedBudget) {
      setMonthlyBudget(Number(savedBudget));
      setBudgetInput(savedBudget);
    }

    if (savedData) {
      const data = JSON.parse(savedData);
      setSavingScore(data.savingScore ?? 82);
      setMonthlySavings(data.monthlySavings ?? 120);
      setSpentThisMonth(data.spentThisMonth ?? 840);
      setTopCategory(data.topCategory ?? "Streaming");
      setHistory(data.history ?? []);
      setTransactions(data.transactions ?? defaultTransactions);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "savewise_data",
      JSON.stringify({
        savingScore,
        monthlySavings,
        spentThisMonth,
        topCategory,
        history,
        transactions
      })
    );
  }, [savingScore, monthlySavings, spentThisMonth, topCategory, history, transactions]);

  useEffect(() => {
    localStorage.setItem("savewise_goal_name", savingGoal);
    localStorage.setItem("savewise_goal_amount", String(goalAmount));
    localStorage.setItem("savewise_saved_amount", String(savedAmount));
  }, [savingGoal, goalAmount, savedAmount]);

  function askAI() {
  if (!chatMessage.trim()) return;

  setChatReply("AI analysiert dein Dashboard...");

  const text = chatMessage.toLowerCase();

  setTimeout(() => {
    if (text.includes("sparscore") || text.includes("gesunken")) {
      setChatReply(
        `Dein aktueller Sparscore liegt bei ${savingScore}/100. Wahrscheinlich beeinflussen vor allem Ausgaben in der Kategorie "${topCategory}" und dein aktuelles Budget-Verhältnis den Score.`
      );
    } else if (text.includes("budget")) {
      setChatReply(
        `Dein Monatsbudget liegt bei ${monthlyBudget}€. Davon hast du bereits ${spentThisMonth}€ genutzt. Übrig vom Ausgabenlimit sind ${monthlyBudget - spentThisMonth}€.`
      );
    } else if (text.includes("sparen") || text.includes("300")) {
      setChatReply(
        `Aktuell liegt dein Sparpotenzial bei ca. ${monthlySavings}€. Um mehr zu sparen, prüfe zuerst ${topCategory}, Abos und spontane Ausgaben.`
      );
    } else if (text.includes("abo") || text.includes("streaming")) {
      setChatReply(
        `Bei Streaming und Abos solltest du prüfen, welche Dienste du wirklich nutzt. Kleine monatliche Beträge senken oft unbemerkt deinen Sparscore.`
      );
    } else {
      setChatReply(
        `Ich sehe aktuell einen Sparscore von ${savingScore}/100, ${spentThisMonth}€ Ausgaben und "${topCategory}" als auffällige Kategorie. Mein Tipp: Prüfe zuerst regelmäßige Abbuchungen.`
      );
    }

    setChatMessage("");
  }, 900);
}

  function detectCategory(text: string) {
    const value = text.toLowerCase();

    if (value.includes("netflix") || value.includes("spotify") || value.includes("disney")) return "Streaming";
    if (value.includes("rewe") || value.includes("edeka") || value.includes("aldi") || value.includes("lidl")) return "Lebensmittel";
    if (value.includes("amazon") || value.includes("zalando")) return "Shopping";
    if (value.includes("uber") || value.includes("lieferando")) return "Lieferdienste";

    return "Allgemein";
  }

  function analyzeCsv(file: File) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const rows = results.data;

        let income = 0;
        let expenses = 0;

        const parsedTransactions = rows.map((row: any) => {
          const name = row.name || row.Name || row.text || row.Text || row.Beschreibung || "Transaktion";

          const amount = Number(
            String(row.amount || row.betrag || row.Betrag || row.Amount || 0)
              .replace("€", "")
              .replace(",", ".")
              .trim()
          );

          if (amount > 0) income += amount;
          else expenses += Math.abs(amount);

          return {
            name,
            amount,
            category: row.category || row.Kategorie || detectCategory(name)
          };
        });

        const savings = Math.max(0, Math.round(income - expenses));
        const score = Math.min(95, Math.max(50, Math.round(100 - expenses / 30)));

        setTransactions(parsedTransactions);
        setMonthlySavings(savings);
        setSpentThisMonth(Math.round(expenses));
        setSavingScore(score);
        setTopCategory("CSV Import");

        setAnalysisResult(`📊 CSV Analyse abgeschlossen

• Einnahmen: ${income.toFixed(2)}€
• Ausgaben: ${expenses.toFixed(2)}€
• Übrig: ${savings}€

💡 Empfehlung:
Prüfe die größten Ausgaben und reduziere wiederkehrende Abbuchungen.`);

        setHistory((old) => ["CSV Analyse erfolgreich durchgeführt", ...old.slice(0, 4)]);
      }
    });
  }

  function startAnalysis() {
  setAnalysisResult("AI analysiert deine Finanzdaten...");

  setTimeout(() => {
    const riskLevel =
      spentThisMonth / monthlyBudget > 0.9
        ? "hoch"
        : spentThisMonth / monthlyBudget > 0.7
          ? "mittel"
          : "niedrig";

    const biggestExpense = transactions
      .filter((item) => item.amount < 0)
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0];

const categoryTotals = transactions
  .filter((item) => item.amount < 0)
  .reduce((acc: Record<string, number>, item) => {
    acc[item.category] =
      (acc[item.category] || 0) + Math.abs(item.amount);

    return acc;
  }, {});

const topRiskCategory =
  Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || topCategory;

const topRiskAmount =
  Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])[0]?.[1] || 0;

const warning =
  topRiskAmount > 150
    ? `"${topRiskCategory}" ist diesen Monat besonders auffällig.`
    : "Deine Ausgaben wirken aktuell stabil.";

const smartTip =
  topRiskCategory === "Lieferdienste"
    ? "Plane Mahlzeiten vor und reduziere Lieferdienste auf feste Tage."
    : topRiskCategory === "Shopping"
      ? "Setze dir ein Wochenlimit für spontane Käufe."
      : topRiskCategory === "Streaming"
        ? "Prüfe deine Abos und kündige ungenutzte Dienste."
        : "Behalte deine größten Ausgaben regelmäßig im Blick.";
    const result = `📊 Automatische Finanzanalyse

• Budget-Risiko: ${riskLevel}
• • Auffällige Kategorie: ${topRiskCategory} (${topRiskAmount.toFixed(2)}€)
• Muster erkannt: ${warning}
• Größte Ausgabe: ${biggestExpense?.name || "Keine"} (${biggestExpense?.amount || 0}€)
• Aktueller Sparscore: ${savingScore}/100

💡 Empfehlung:
${smartTip}`;

    setAnalysisResult(result);

    setSavingScore((old) => (old >= 90 ? 74 : old + 5));
    setMonthlySavings((old) => (old >= 250 ? 80 : old + 35));

    setHistory((old) => [
      "Automatische AI Finanzanalyse durchgeführt",
      ...old.slice(0, 4)
    ]);
  }, 1500);
}
 

  function createPdf() {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("SaveWise AI Report", 20, 20);
    doc.setFontSize(14);
    doc.text("Sparscore: " + savingScore + "/100", 20, 50);
    doc.text("Sparpotenzial: " + monthlySavings + " Euro", 20, 65);
    doc.text("Ausgabenlimit: " + monthlyBudget + " Euro", 20, 80);
    doc.text("Top Kategorie: " + topCategory, 20, 95);

    doc.save("savewise-report.pdf");
  }

  function resetAllData() {
    localStorage.removeItem("savewise_data");
    localStorage.setItem("savewise_budget", "1200");

    setSavingScore(82);
    setMonthlySavings(120);
    setMonthlyBudget(1200);
    setBudgetInput("1200");
    setSpentThisMonth(840);
    setTopCategory("Streaming");
    setHistory([]);
    setTransactions(defaultTransactions);
    setUploadedFile("");
    setUploadStatus("");
    setAnalysisResult("");
    setShowSettings(false);
  }

  function exportData() {
    const data = {
      savingScore,
      monthlySavings,
      monthlyBudget,
      spentThisMonth,
      topCategory,
      history,
      transactions
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "savewise-backup.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main
  className={
    "min-h-screen p-6 pb-32 " +
    (isLightMode
      ? "bg-gray-100 text-gray-900"
      : "bg-[#050816] text-gray-900")
  }
>
      <div className="max-w-5xl mx-auto">
        <Header />

        {activeTab === "home" && (
          <div className="space-y-8 mt-8">
            <div className="grid md:grid-cols-4 gap-6">
              <Card title="Einkommen" value="3200€" color="text-emerald-400" />
              <Card title="Ausgaben" value={spentThisMonth + "€"} color="text-red-400" />
              <Card title="Übrig" value={3200 - spentThisMonth + "€"} color="text-yellow-400" />
              <Card title="Sparscore" value={savingScore + "/100"} color="text-cyan-400" />
              <Card title="Sparquote" value={Math.max(0, Math.round(((3200 - spentThisMonth) / 3200) * 100)) + "%"} color="text-purple-400" />
            </div>

            <Panel title="Monatsvergleich">
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <Mini title="Einnahmen" value="3200€" color="text-emerald-400" />
                <Mini title="Ausgaben" value={spentThisMonth + "€"} color="text-red-400" />
                <Mini title="Sparquote" value={Math.max(0, Math.round(((3200 - spentThisMonth) / 3200) * 100)) + "%"} color="text-purple-400" />
              </div>

              <div className="mt-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-[28px] p-6 text-black">
                <p className="font-black text-xl">
                  {spentThisMonth < 1200
                    ? "Sehr guter Monat"
                    : spentThisMonth < 2200
                      ? "Stabiler Monat"
                      : "Achtung: hohe Ausgaben"}
                </p>

                <p className="mt-2 text-black/70">
                  Deine aktuelle Sparquote liegt bei {Math.max(0, Math.round(((3200 - spentThisMonth) / 3200) * 100))}%.
                </p>
              </div>
            </Panel>

<Panel title="Sparziel">
  <div className="grid gap-5 mt-6">
    <div>
      <p className="text-sm font-bold text-gray-500 mb-2">Zielname</p>
      <input
        value={savingGoal}
        onChange={(e) => setSavingGoal(e.target.value)}
        placeholder=""
        className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 outline-none"
      />
    </div>

    <div>
      <p className="text-sm font-bold text-gray-500 mb-2">Zielbetrag</p>
      <input
        type="number"
        value={goalAmount || ""}
        onChange={(e) => {
          const cleanValue = e.target.value.replace(/^0+(?=\d)/, "");
          setGoalAmount(Number(cleanValue) || 0);
        }}
        placeholder=""
        className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 outline-none"
      />
    </div>

    <div>
      <p className="text-sm font-bold text-gray-500 mb-2">Gesparter Betrag</p>
      <input
        type="number"
        value={savedAmount || ""}
        onChange={(e) => {
          const cleanValue = e.target.value.replace(/^0+(?=\d)/, "");
          setSavedAmount(Number(cleanValue) || 0);
        }}
        placeholder=""
        className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 outline-none"
      />
    </div>
  </div>

  <p className="text-gray-600 mt-4">
    Fortschritt: {savedAmount}€ von {goalAmount}€
  </p>

  <p className="text-emerald-400 font-black text-3xl mt-4">
    Noch nötig: {Math.max(0, goalAmount - savedAmount)}€
  </p>

  <div className="w-full h-5 bg-gray-100 rounded-full mt-6 overflow-hidden">
    <div
      className="h-full bg-cyan-400 rounded-full"
      style={{
        width:
          goalAmount > 0
            ? Math.min(100, (savedAmount / goalAmount) * 100) + "%"
            : "0%"
      }}
    />
  </div>
</Panel>
            <Panel title="Monatsbudget">
              <div className="flex gap-3 mt-6">
                <input
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="Budget"
                  className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 w-full outline-none"
                />

                <button
                  onClick={() => {
                    const value = Number(budgetInput);
                    if (!isNaN(value) && value > 0) {
                      setMonthlyBudget(value);
                      localStorage.setItem("savewise_budget", String(value));
                    }
                  }}
                  className="bg-emerald-400 text-black px-5 rounded-2xl font-black"
                >
                  Setzen
                </button>
              </div>

              <p className="text-gray-400 mt-6">Ausgabenlimit: {monthlyBudget}€</p>
              <p className="text-gray-400 mt-2">Ausgegeben: {spentThisMonth}€</p>

              <p className="text-emerald-400 font-black text-3xl mt-4">
                Vom Ausgabenlimit übrig: {monthlyBudget - spentThisMonth}€
              </p>

              <div className="w-full h-5 bg-gray-100 rounded-full mt-6 overflow-hidden">
                <div
                  className={
                    "h-full rounded-full " +
                    (spentThisMonth / monthlyBudget > 0.9
                      ? "bg-red-400"
                      : spentThisMonth / monthlyBudget > 0.7
                        ? "bg-yellow-400"
                        : "bg-emerald-400")
                  }
                  style={{
                    width: Math.min(100, (spentThisMonth / monthlyBudget) * 100) + "%"
                  }}
                />
              </div>

              {spentThisMonth / monthlyBudget > 0.9 ? (
                <BudgetNote color="red" title="🚨 Budget fast erreicht" text="Du hast bereits mehr als 90% deines Monatsbudgets verbraucht." />
              ) : spentThisMonth / monthlyBudget > 0.7 ? (
                <BudgetNote color="yellow" title="⚠️ Budget Hinweis" text="Du hast bereits über 70% deines Monatsbudgets genutzt." />
              ) : (
                <BudgetNote color="emerald" title="✅ Budget im grünen Bereich" text="Deine Ausgaben liegen aktuell im sicheren Bereich." />
              )}
            </Panel>

            <Panel title="Sparscore Analyse">
              <div className="flex justify-center mt-8">
                <div className="w-48 h-48 rounded-full border-[18px] border-emerald-400 flex items-center justify-center shadow-2xl shadow-emerald-400/30">
                  <div className="text-center">
                    <p className="text-5xl font-black text-emerald-400">{savingScore}</p>
                    <p className="text-gray-400 mt-1">von 100</p>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "analyse" && (
          <div className="space-y-8 mt-8">
            <Panel title="AI Finanzassistent">
              <div className="bg-gray-100 border border-gray-200 rounded-2xl p-5 mt-6">
                <p className="text-gray-900 whitespace-pre-line">{chatReply}</p>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-6">
                <input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="z.B. Wie spare ich mehr Geld?"
                  className="flex-1 bg-gray-100 border border-gray-200 rounded-2xl p-4 outline-none"
                />

                <button
                  onClick={askAI}
                  className="bg-emerald-400 text-black px-6 py-4 rounded-2xl font-black"
                >
                  Fragen
                </button>
              </div>
            </Panel>

            <Panel title="AI Empfehlungen">
              <div className="space-y-4 mt-6">
                <Info color="emerald" title="Sparchance erkannt" text="Reduziere Lieferdienste um 2 Bestellungen pro Woche." />
                <Info color="cyan" title="Abo-Check empfohlen" text="Prüfe Streaming- und App-Abos auf ungenutzte Dienste." />
                <Info color="yellow" title="Budget-Hinweis" text="Setze ein Wochenlimit für spontane Shopping-Ausgaben." />
              </div>
            </Panel>

            <Panel title="Monats-Trend">
              <div className="h-64 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { value: 320 },
                    { value: 410 },
                    { value: 380 },
                    { value: 520 },
                    { value: 460 },
                    { value: 610 },
                    { value: 540 }
                  ]}>
                    <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <p className="text-gray-400 mt-4">
                Deine Ausgaben sind diese Woche leicht gestiegen.
              </p>
            </Panel>

            <Panel title="Ausgabenverteilung">
              <div className="h-64 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Shopping", value: 40 },
                        { name: "Streaming", value: 22 },
                        { name: "Lebensmittel", value: 18 },
                        { name: "Transport", value: 20 }
                      ]}
                      dataKey="value"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={5}
                    >
                      {["#22c55e", "#06b6d4", "#facc15", "#f472b6"].map((color, index) => (
                        <Cell key={index} fill={color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <p className="text-emerald-400">● Shopping 40%</p>
                <p className="text-cyan-400">● Streaming 22%</p>
                <p className="text-yellow-400">● Lebensmittel 18%</p>
                <p className="text-pink-400">● Transport 20%</p>
              </div>
            </Panel>

            <Panel title="Monatsübersicht">
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <Mini title="Top Kategorie" value={topCategory} color="text-cyan-400" />
                <Mini title="Analysen" value={String(history.length)} color="text-emerald-400" />
                <Mini title="Transaktionen" value={String(transactions.length)} color="text-yellow-400" />
              </div>
            </Panel>

            <Panel title="Analyse Verlauf">
              <div className="space-y-4 mt-6">
                {history.length === 0 && <p className={showSettings ? "text-emerald-400" : "text-gray-500"}>Noch keine Analysen vorhanden.</p>}
                {history.map((item, index) => (
                  <div key={index} className="bg-gray-100 p-4 rounded-2xl text-gray-300">
                    {item}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Letzte Transaktionen">
              <div className="space-y-4 mt-6">
                {transactions.map((item, index) => (
                  <div key={index} className="bg-gray-100 p-5 rounded-2xl flex justify-between items-center">
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
            </Panel>
          </div>
        )}

        {activeTab === "report" && (
          <div className="space-y-8 mt-8">
            <Panel title="Datei Upload">
              <p className="text-gray-400 mt-4">
                Lade deine Kontoauszüge als PDF oder CSV hoch.
              </p>

              <label className="mt-6 flex items-center gap-3 bg-emerald-400 text-black px-6 py-4 rounded-2xl font-black cursor-pointer w-fit">
                <Upload size={20} />
                Datei auswählen

                <input
                  type="file"
                  accept=".pdf,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    const fileName = file?.name || "";

                    setUploadedFile(fileName);

                    if (fileName.toLowerCase().endsWith(".pdf")) {
                      setUploadStatus("PDF erkannt. Kontoauszug bereit für die Analyse.");
                    } else if (fileName.toLowerCase().endsWith(".csv")) {
                      setUploadStatus("CSV erkannt. Datei wird analysiert.");
                      if (file) analyzeCsv(file);
                    } else {
                      setUploadStatus("Dateiformat erkannt.");
                    }
                  }}
                />
              </label>

              {uploadedFile && (
                <p className="text-emerald-400 mt-4 font-bold break-words">
                  Datei erkannt: {uploadedFile}
                </p>
              )}

              {uploadStatus && (
                <p className="text-cyan-400 mt-2 font-bold">
                  {uploadStatus}
                </p>
              )}

              {uploadedFile && (
                <button
                  onClick={startAnalysis}
                  className="mt-6 bg-cyan-400 text-black px-6 py-4 rounded-2xl font-black"
                >
                  Analyse starten
                </button>
              )}

              {analysisResult && (
                <div className="mt-5 bg-gray-100 border border-cyan-400/30 rounded-2xl p-5 text-gray-900 font-bold whitespace-pre-line">
                  {analysisResult}
                </div>
              )}
            </Panel>

            <Panel title="PDF Report">
              <p className="text-gray-400 mt-4">
                Erstelle einen professionellen Finanzreport.
              </p>

              <button
                onClick={createPdf}
                className="mt-6 bg-white text-black px-6 py-4 rounded-2xl font-black"
              >
                PDF erstellen
              </button>
            </Panel>
          </div>
        )}
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-end md:items-center justify-center p-6">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-[32px] p-8 shadow-2xl">
            <h2 className="text-4xl font-black">Einstellungen</h2>

            <p className="text-gray-400 mt-3">
              Verwalte deine App-Daten und Optionen.
            </p>

            <div className="space-y-4 mt-8">
              <button
                type="button"
                onClick={resetAllData}
                className="w-full bg-red-400 text-black rounded-2xl p-4 font-black"
              >
                Alle App-Daten löschen
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("savewise_budget", "1200");
                  setMonthlyBudget(1200);
                  setBudgetInput("1200");
                  setShowSettings(false);
                }}
                className="w-full bg-yellow-400 text-black rounded-2xl p-4 font-black"
              >
               Nur Budget zurücksetzen
              </button>

              <button
                type="button"
                onClick={exportData}
                className="w-full bg-cyan-400 text-black rounded-2xl p-4 font-black"
              >
                Daten exportieren
              </button>

<button
  type="button"
  onClick={() => setIsLightMode(!isLightMode)}
  className="w-full bg-gray-200 text-gray-900 rounded-2xl p-4 font-black"
>
  {isLightMode ? "Dark Mode aktivieren" : "Light Mode aktivieren"}
</button>

<div className="bg-gray-100 rounded-2xl p-5 text-gray-300">
  SaveWise AI MVP · Lokale Demo-Version
</div>

              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="w-full bg-white text-black rounded-2xl p-4 font-black"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-black/80 border border-gray-200 backdrop-blur-2xl rounded-full px-8 py-4 flex gap-8 shadow-2xl z-50">
        <NavButton active={activeTab === "home"} onClick={() => { setShowSettings(false); setActiveTab("home"); }}>
          <Home size={28} />
        </NavButton>

        <NavButton active={activeTab === "analyse"} onClick={() => { setShowSettings(false); setActiveTab("analyse"); }}>
          <BarChart3 size={28} />
        </NavButton>

        <NavButton active={activeTab === "report"} onClick={() => { setShowSettings(false); setActiveTab("report"); }}>
          <FileText size={28} />
        </NavButton>

        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className={showSettings ? "text-emerald-400" : "text-gray-500"}
        >
          <Settings size={28} />
        </button>
      </div>
    </main>
  );
}

function Header() {
  return (
    <div className="bg-white/5 border border-gray-200 rounded-[32px] p-8 backdrop-blur-2xl shadow-2xl shadow-emerald-500/10">
      <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-400">
        SaveWise AI
      </h1>

      <p className="text-gray-400 mt-4">
        AI Finanzdashboard der nächsten Generation.
      </p>
    </div>
  );
}

function Card(props: { title: string; value: string; color: string }) {
  return (
    <div className="bg-white/5 border border-gray-200 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl shadow-black/30">
      <p className="text-gray-400">{props.title}</p>
      <h2 className={`text-4xl font-black mt-4 ${props.color}`}>{props.value}</h2>
    </div>
  );
}

function Panel(props: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-gray-200 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl shadow-black/30">
      <h2 className="text-4xl font-black">{props.title}</h2>
      {props.children}
    </div>
  );
}

function Mini(props: { title: string; value: string; color: string }) {
  return (
    <div className="bg-gray-100 rounded-2xl p-5">
      <p className="text-gray-400">{props.title}</p>
      <p className={`text-2xl font-black mt-2 ${props.color}`}>{props.value}</p>
    </div>
  );
}

function Info(props: { color: string; title: string; text: string }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-400/10 border-emerald-400/30 text-emerald-400",
    cyan: "bg-cyan-400/10 border-cyan-400/30 text-cyan-400",
    yellow: "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
  };

  return (
    <div className={`border rounded-2xl p-5 ${colorMap[props.color]}`}>
      <p className="font-black">{props.title}</p>
      <p className="text-gray-300 mt-2">{props.text}</p>
    </div>
  );
}

function BudgetNote(props: { color: "red" | "yellow" | "emerald"; title: string; text: string }) {
  const styles = {
    red: "bg-red-400/10 border-red-400/30 text-red-400",
    yellow: "bg-yellow-400/10 border-yellow-400/30 text-yellow-400",
    emerald: "bg-emerald-400/10 border-emerald-400/30 text-emerald-400"
  };

  return (
    <div className={`mt-6 border rounded-2xl p-4 ${styles[props.color]}`}>
      <p className="font-black">{props.title}</p>
      <p className="text-gray-300 mt-2">{props.text}</p>
    </div>
  );
}

function NavButton(props: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={props.active ? "text-emerald-400" : "text-gray-500"}
    >
      {props.children}
    </button>
  );
}

