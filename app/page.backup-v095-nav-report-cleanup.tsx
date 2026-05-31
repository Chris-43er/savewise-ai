"use client"


;

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import Papa from "papaparse";
import { Home, BarChart3, FileText, Upload, Settings } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, Tooltip } from "recharts";

type Transaction = {
  name: string;
  amount: number;
  category: string;
};

const defaultTransactions: Transaction[] = [];

export default function Page() {



  const [activeTab, setActiveTab] = useState("home");
  const [homeSection, setHomeSection] = useState("overview");
  const [analyseSection, setAnalyseSection] = useState("menu");
  const [financeSection, setFinanceSection] = useState("menu");
  const [showSettings, setShowSettings] = useState(false);
  const [isAiHubOpen, setIsAiHubOpen] = useState(false);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [showAppSplash, setShowAppSplash] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [introStep, setIntroStep] = useState(0);
const [isLightMode, setIsLightMode] = useState(false);

  const [uploadedFile, setUploadedFile] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");

  const [savingScore, setSavingScore] = useState(0);
  const [monthlySavings, setMonthlySavings] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(1200);
  const [budgetInput, setBudgetInput] = useState("1200");
  const [spentThisMonth, setSpentThisMonth] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [incomeInput, setIncomeInput] = useState("");
  const [expenseInput, setExpenseInput] = useState("");

  useEffect(() => {
    const income = Number(incomeInput);
    const expenses = Number(expenseInput);

    setMonthlyIncome(!isNaN(income) && income > 0 ? income : 0);
    setSpentThisMonth(!isNaN(expenses) && expenses > 0 ? expenses : 0);
  }, [incomeInput, expenseInput]);
  const [manualSaved, setManualSaved] = useState(false);
  const [topCategory, setTopCategory] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [manualExpenseName, setManualExpenseName] = useState("");
  const [manualExpenseCategory, setManualExpenseCategory] = useState("Handy");
  const [manualExpenseAmount, setManualExpenseAmount] = useState("");
  const [manualExpenseRecurring, setManualExpenseRecurring] = useState(true);
  const [manualExpenseInterval, setManualExpenseInterval] = useState("monatlich");

  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);


  const [manualExpenses, setManualExpenses] = useState<
    {
    id: number;
    name: string;
    category: string;
    amount: number;
    recurring: boolean;
    interval?: string;
    aiDetected?: boolean;
    aiHint?: string;
    confirmed?: boolean;
    createdAt: string;
  }[]
  >([]);

  const [chatMessage, setChatMessage] = useState("");
  const [chatReply, setChatReply] = useState("Hallo 👋 Ich bin dein AI Finanzassistent.");
const [aiApiKey, setAiApiKey] = useState("");
const [savingGoal, setSavingGoal] = useState("");
const [goalAmount, setGoalAmount] = useState(0);
const [savedAmount, setSavedAmount] = useState(0);

/* =========================================================
   SAVEWISE FOUNDATION V1
========================================================= */

type AIInsight = {
  id: string;
  type: "warning" | "opportunity" | "info";
  title: string;
  description: string;
  priority: number;
};

type BudgetGoal = {
  id: string;
  title: string;
  target: number;
  current: number;
};

type SmartContract = {
  id: string;
  name: string;
  amount: number;
  category: string;
  recurring: boolean;
};

const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
const [smartContracts, setSmartContracts] = useState<SmartContract[]>([]);

const [dynamicPriority, setDynamicPriority] = useState("overview");
const [smartNotifications, setSmartNotifications] = useState<string[]>([]);




  useEffect(() => {
    const savedAiKey = localStorage.getItem("savewise_ai_api_key");
    if (savedAiKey) setAiApiKey(savedAiKey);

    const cleaned = localStorage.getItem("savewise_force_clean");

    if (!cleaned) {
      localStorage.removeItem("savewise_data");
    localStorage.removeItem("savewise_budget");
      localStorage.removeItem("savewise_transactions");
    localStorage.removeItem("savewise_manual_expenses");
      localStorage.setItem("savewise_force_clean", "true");
    }

    const splashTimer = setInterval(() => {
      setSplashProgress((old) => {
        if (old >= 100) {
          clearInterval(splashTimer);
          setTimeout(() => setShowAppSplash(false), 50);
          return 100;
        }

        return old + 20;
      });
    }, 15);

    const smartNotifications =
    aiWarnings.length > 0
      ? [aiWarnings[0]]
      : savingScore >= 80
      ? ["Sehr gute Finanzstruktur"]
      : [];

  return () => clearInterval(splashTimer);
  }, []);

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
      setSavingScore(data.savingScore ?? 0);
      setMonthlySavings(data.monthlySavings ?? 120);
      setSpentThisMonth(data.spentThisMonth ?? 0);
      setMonthlyIncome(data.monthlyIncome ?? 0);
      setIncomeInput(data.monthlyIncome ? String(data.monthlyIncome) : "");
      setExpenseInput(data.spentThisMonth ? String(data.spentThisMonth) : "");
      setTopCategory(data.topCategory ?? "");
      setHistory(data.history ?? []);
      setTransactions(data.transactions ?? []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "savewise_data",
      JSON.stringify({
  savingScore,
  monthlySavings,
  spentThisMonth,
  monthlyIncome,
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

  useEffect(() => {
    const savedManualExpenses = localStorage.getItem("savewise_manual_expenses");
    if (savedManualExpenses) {
      try {
        setManualExpenses(JSON.parse(savedManualExpenses));
      } catch {
        setManualExpenses([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("savewise_manual_expenses", JSON.stringify(manualExpenses));
  }, [manualExpenses]);

  function buildFinanceContext() {
    return {
      einkommen: monthlyIncome,
      ausgaben: totalMonthlyExpenses,
      uebrig: monthlyIncome > 0 ? monthlyIncome - totalMonthlyExpenses : 0,
      sparquote: savingsRate,
      score: savingScore,
      topKategorie: topCategory || "Keine Kategorie erkannt",
      budget: monthlyBudget,
      budgetStatus: totalMonthlyExpenses > monthlyBudget ? "über Budget" : "im Budget",
      fixkostenMonatlich: contractMonthlyTotal,
      fixkostenQuote: contractRatio,
      vertraege: contractExpenses.map((item) => ({
        name: item.name,
        kategorie: item.category,
        betrag: item.amount,
        intervall: item.interval || "monatlich"
      })),
      ausgabenListe: allExpenseItems.map((item) => ({
        name: item.name,
        kategorie: item.category,
        betrag: Math.abs(item.amount)
      }))
    };
  }

  function localFinanceAnswer(question: string) {
    const q = question.toLowerCase();
    const context = buildFinanceContext();

    if (context.einkommen <= 0 && context.ausgaben <= 0) {
      return "Mir fehlen noch Finanzdaten. Trage zuerst Einkommen, Ausgaben oder Verträge ein, damit ich deine Situation sinnvoll analysieren kann.";
    }

    if (q.includes("sparen") || q.includes("sparpotenzial") || q.includes("geld sparen")) {
      if (context.sparquote >= 25) {
        return `Deine Sparquote liegt bei ${context.sparquote}%. Das ist stark. Weiteres Sparpotenzial findest du vor allem bei variablen Ausgaben und wiederkehrenden Kosten. Deine monatlichen Fixkosten liegen bei ${context.fixkostenMonatlich.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€.`;
      }

      return `Deine Sparquote liegt aktuell bei ${context.sparquote}%. Ich würde zuerst wiederkehrende Kosten, Abos und flexible Ausgaben prüfen. Ziel sollte mindestens 20% Nettoüberschuss sein.`;
    }

    if (q.includes("fixkosten") || q.includes("vertrag") || q.includes("abo")) {
      return `Deine monatlichen Fixkosten liegen bei ${context.fixkostenMonatlich.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€. Das entspricht ca. ${context.fixkostenQuote}% deines Einkommens. ${context.fixkostenQuote > 50 ? "Das ist recht hoch und sollte geprüft werden." : "Das wirkt aktuell noch kontrollierbar."}`;
    }

    if (q.includes("score") || q.includes("finanzscore")) {
      return `Dein Finanzscore liegt bei ${context.score}/100. Er wird durch Einkommen, Ausgaben, Sparquote, Budgetstatus und Fixkosten beeinflusst. Aktuell ist deine Sparquote ${context.sparquote}% und dein Budgetstatus ist: ${context.budgetStatus}.`;
    }

    if (q.includes("budget")) {
      return `Dein Monatsbudget liegt bei ${context.budget.toLocaleString("de-DE")}€. Deine aktuellen Ausgaben liegen bei ${context.ausgaben.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€. Du bist damit ${context.budgetStatus}.`;
    }

    if (q.includes("urlaub") || q.includes("leisten") || q.includes("kaufen")) {
      return `Aktuell bleiben dir rechnerisch ${context.uebrig.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ übrig. Für größere Ausgaben solltest du zuerst prüfen, ob Fixkosten, Rücklagen und Sparziel abgesichert sind.`;
    }

    if (q.includes("ausgaben") || q.includes("wofür") || q.includes("kategorie")) {
      return `Deine Ausgaben liegen aktuell bei ${context.ausgaben.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€. Die auffälligste Kategorie ist: ${context.topKategorie}. Öffne "Alle Ausgaben", um einzelne Positionen zu prüfen.`;
    }

    return `Ich sehe aktuell ${context.einkommen.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ Einkommen, ${context.ausgaben.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€ Ausgaben, ${context.sparquote}% Sparquote und einen Score von ${context.score}/100. Frage mich z.B. "Wo kann ich sparen?", "Wie hoch sind meine Fixkosten?" oder "Warum ist mein Score so?".`;
  }

  function askQuickAI(question: string) {
    setChatMessage(question);
    setChatReply(localFinanceAnswer(question));
  }

  async function askAI() {
    if (!chatMessage.trim()) return;

    const question = chatMessage.trim();
    const context = buildFinanceContext();

    setChatReply("SaveWise AI analysiert deine echten App-Daten...");

    try {
      const key = aiApiKey || localStorage.getItem("savewise_ai_api_key") || "";

      if (key) {
        const prompt = `Du bist SaveWise AI, ein verständlicher Finanzcoach. Antworte kurz, konkret und auf Deutsch. Nutze diese echten App-Daten: ${JSON.stringify(context)}. Frage des Nutzers: ${question}`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "google/gemma-3-4b-it:free",
            messages: [
              {
                role: "user",
                content: prompt
              }
            ]
          })
        });

        const data = await response.json();
        const answer = data?.choices?.[0]?.message?.content;

        if (answer) {
          setChatReply(answer);
          setChatMessage("");
          return;
        }
      }

      setChatReply(localFinanceAnswer(question));
      setChatMessage("");
    } catch (error) {
      setChatReply(localFinanceAnswer(question));
      setChatMessage("");
    }
  }

  function detectCategory(text: string) {
    const value = text.toLowerCase();

    if (value.includes("gehalt") || value.includes("lohn") || value.includes("rente") || value.includes("dataport")) return "Einkommen";

    if (value.includes("rewe") || value.includes("edeka") || value.includes("aldi") || value.includes("lidl") || value.includes("nahkauf") || value.includes("market")) return "Lebensmittel";

    if (value.includes("amazon") || value.includes("zalando") || value.includes("klarna") || value.includes("aliexpress") || value.includes("pvh")) return "Shopping";

    if (value.includes("netflix") || value.includes("spotify") || value.includes("disney") || value.includes("wow") || value.includes("telekom")) return "Streaming & Medien";

    if (value.includes("team ts") || value.includes("shell") || value.includes("aral") || value.includes("parking") || value.includes("bahn") || value.includes("uber")) return "Mobilität";

    if (value.includes("apotheke") || value.includes("debeka") || value.includes("kranken")) return "Gesundheit";

    if (value.includes("bausparkasse") || value.includes("ib sh") || value.includes("targobank") || value.includes("barclays") || value.includes("mercedes-benz bank")) return "Kredite & Finanzierung";

    if (value.includes("provinzial") || value.includes("hansemerkur") || value.includes("oerag")) return "Versicherungen";

    if (value.includes("yippie") || value.includes("strom") || value.includes("gas") || value.includes("zweckverband") || value.includes("amt probstei") || value.includes("miete")) return "Wohnen & Fixkosten";

    if (value.includes("sabrio") || value.includes("pizza") || value.includes("lieferando")) return "Freizeit & Essen";

    if (value.includes("paypal")) return "PayPal / Online";

    return "Sonstiges";
  }



async function analyzePdf(file: File) {
  try {
    setUploadStatus("PDF wird analysiert...");

    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.mjs";

    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      disableWorker: false
    }).promise;

    function euro(value: string) {
      return Math.abs(Number(value.replace(/\./g, "").replace(",", ".").replace(/[^0-9.-]/g, "")));
    }

    let income = 0;
    let expenses = 0;
    const transactionsFromPdf: Transaction[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items.map((item: any) => item.str).join(" ");

      if (
        pageText.includes("Entgeltinformation") ||
        pageText.includes("Gesamtumsatzsummen") ||
        pageText.includes("Kontostand am") && pageText.includes("Gesamtumsatzsummen")
      ) {
        continue;
      }

      let lastDescription = "";

      for (const item of content.items as any[]) {
        const raw = String(item.str || "").trim();

        if (!raw) continue;

        if (/^-?\d{1,3}(?:\.\d{3})*,\d{2}$/.test(raw)) {
          const value = euro(raw);

          if (value === 0 || value > 10000) continue;

          const cleanName = lastDescription || (raw.startsWith("-") ? "PDF Ausgabe" : "PDF Einnahme");

          if (raw.startsWith("-")) {
            expenses += value;
            transactionsFromPdf.push({
              name: cleanName,
              amount: -value,
              category: detectCategory(cleanName)
            });
          } else {
            income += value;
            transactionsFromPdf.push({
              name: cleanName,
              amount: value,
              category: "Einkommen"
            });
          }

          lastDescription = "";
        } else if (
          !raw.match(/^\d{2}\.\d{2}\.\d{4}$/) &&
          !raw.toLowerCase().includes("betrag soll") &&
          !raw.toLowerCase().includes("betrag haben") &&
          !raw.toLowerCase().includes("datum erläuterung")
        ) {
          lastDescription = raw.length > 80 ? raw.slice(0, 80) : raw;
        }
      }
    }

    income = Math.round(income * 100) / 100;
    expenses = Math.round(expenses * 100) / 100;

    setMonthlyIncome(income);
    setIncomeInput(income > 0 ? income.toFixed(2) : "");

    setSpentThisMonth(expenses);
    setExpenseInput(expenses > 0 ? expenses.toFixed(2) : "");

    setTransactions(transactionsFromPdf);

    setSavingScore(
      income > 0
        ? Math.max(0, Math.min(100, Math.round(((income - expenses) / income) * 100)))
        : 0
    );

    setUploadStatus(
      "PDF analysiert: " +
      transactionsFromPdf.length +
      " Buchungen erkannt. Einnahmen " +
      income.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
      "€, Ausgaben " +
      expenses.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
      "€."
    );
  } catch (error) {
    console.error("PDF Analyse Fehler:", error);
    setUploadStatus("PDF konnte nicht analysiert werden. Bitte manuell eintragen.");
  }
}



async function analyzeImage(file: File) {
  try {
    setUploadStatus("Bild wird per OCR gelesen...");

    const Tesseract = await import("tesseract.js");
    const result = await Tesseract.recognize(file, "deu+eng");

    const found = result.data.text.match(/-?\d{1,3}(?:\.\d{3})*,\d{2}/g) || [];

    const values = found
      .map((v) => Number(v.replace(/\./g, "").replace(",", ".")))
      .filter((v) => !isNaN(v) && Math.abs(v) > 0 && Math.abs(v) < 10000);

    const income = Math.round(values.filter((v) => v > 0).reduce((a, b) => a + b, 0) * 100) / 100;
    const expenses = Math.round(Math.abs(values.filter((v) => v < 0).reduce((a, b) => a + b, 0)) * 100) / 100;

    setMonthlyIncome(income);
    setIncomeInput(income > 0 ? income.toFixed(2) : "");
    setSpentThisMonth(expenses);
    setExpenseInput(expenses > 0 ? expenses.toFixed(2) : "");

    setTransactions([
      ...(income > 0 ? [{ name: "OCR Einnahmen", amount: income, category: "Einkommen" }] : []),
      ...(expenses > 0 ? [{ name: "OCR Ausgaben", amount: -expenses, category: "Ausgaben" }] : [])
    ]);

    setUploadStatus("Bild analysiert: Einnahmen " + income.toLocaleString("de-DE", { minimumFractionDigits: 2 }) + "€, Ausgaben " + expenses.toLocaleString("de-DE", { minimumFractionDigits: 2 }) + "€.");
  } catch (error) {
    console.error("OCR Fehler:", error);
    setUploadStatus("Bild konnte nicht automatisch gelesen werden. Bitte Werte manuell eintragen.");
  }
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
• Übrig: ${Number.isFinite(monthlyIncome - spentThisMonth)
  ? (monthlyIncome - spentThisMonth).toFixed(2).replace(".", ",")
  : "0,00"}€

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
      "Automatische AI Insights durchgeführt",
      ...old.slice(0, 4)
    ]);
  }, 1500);
}
 

  function createPdf() {
    const doc = new jsPDF();

    const income = monthlyIncome || 0;
    const expenses = spentThisMonth || 0;
    const remaining = income - expenses;
    const savingsRate = income > 0 ? Math.max(0, Math.round((remaining / income) * 100)) : 0;

    const categoryGroups = transactions
      .filter((item) => item.amount < 0)
      .reduce((groups: any, item) => {
        const category = item.category || "Sonstiges";
        groups[category] = (groups[category] || 0) + Math.abs(item.amount);
        return groups;
      }, {});

    const topCategories = Object.entries(categoryGroups)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5);

    doc.setFontSize(22);
    doc.text("SaveWise AI Finanzreport", 20, 20);

    doc.setFontSize(11);
    doc.text("Erstellt am: " + new Date().toLocaleDateString("de-DE"), 20, 30);

    doc.setFontSize(16);
    doc.text("Finanzübersicht", 20, 50);

    doc.setFontSize(12);
    doc.text("Einkommen: " + income.toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " Euro", 20, 65);
    doc.text("Ausgaben: " + expenses.toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " Euro", 20, 78);
    doc.text("Übrig: " + remaining.toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " Euro", 20, 91);
    doc.text("Sparquote: " + savingsRate + "%", 20, 104);
    doc.text("Sparscore: " + (savingScore > 0 ? savingScore + "/100" : "nicht berechnet"), 20, 117);

    doc.setFontSize(16);
    doc.text("Top Ausgabenkategorien", 20, 140);

    doc.setFontSize(12);
    if (topCategories.length === 0) {
      doc.text("Noch keine Kategorien erkannt.", 20, 155);
    } else {
      topCategories.forEach(([category, amount]: any, index) => {
        doc.text(
          (index + 1) + ". " + category + ": " + amount.toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " Euro",
          20,
          155 + index * 12
        );
      });
    }

    const aiY = topCategories.length > 0 ? 225 : 175;

    doc.setFontSize(16);
    doc.text("AI Einschätzung", 20, aiY);

    doc.setFontSize(12);

    let assessment = "Noch keine ausreichenden Finanzdaten vorhanden.";

    if (income > 0 && expenses > 0) {
      if (expenses / income > 0.9) {
        assessment = "Kritisch: Deine Ausgaben liegen sehr nah an deinem Einkommen.";
      } else if (expenses / income > 0.75) {
        assessment = "Achtung: Deine Ausgaben sind erhöht. Prüfe variable Kosten und Fixkosten.";
      } else {
        assessment = "Stabil: Deine Finanzen wirken aktuell kontrolliert.";
      }
    }

    doc.text(assessment, 20, aiY + 15, { maxWidth: 170 });

    doc.setFontSize(10);
    doc.text("Dieser Report basiert auf lokal hinterlegten oder hochgeladenen Daten.", 20, 285);

    doc.save("savewise-ai-finanzreport.pdf");
  }

  function resetAllData() {
    Object.keys(localStorage).forEach((key) => {
      const keepKeys = ["savewise_intro_seen", "savewise_onboarding_done", "savewise_ai_api_key"];

      if (key.startsWith("savewise_") && !keepKeys.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    setSavingScore(0);
    setMonthlySavings(0);
    setMonthlyBudget(1200);
    setBudgetInput("1200");

    setMonthlyIncome(0);
    setIncomeInput("");
    setExpenseInput("");
    setSpentThisMonth(0);

    setTopCategory("");
    setHistory([]);
    setTransactions([]);
    setManualExpenses([]);

    setManualExpenseName("");
    setManualExpenseCategory("Handy");
    setManualExpenseAmount("");
    setManualExpenseRecurring(true);
    setManualExpenseInterval("monatlich");

    setUploadedFile("");
    setUploadStatus("");
    setAnalysisResult("");

    setSavingGoal("");
    setGoalAmount(0);
    setSavedAmount(0);

    setHomeSection("overview");
    setFinanceSection("menu");
    setShowSettings(false);

    localStorage.setItem("savewise_intro_seen", "true");
    localStorage.setItem("savewise_onboarding_done", "true");

    setShowIntro(false);
    setShowOnboarding(false);
  }


  useEffect(() => {
    let listener: { remove: () => void } | undefined;

    import("@capacitor/app").then(({ App }) => {
      App.addListener("backButton", () => {
        if (showSettings) {
          setShowSettings(false);
          return;
        }

        if (homeSection !== "overview") {
          setHomeSection("overview");

          setTimeout(() => {
            const menu = document.getElementById("home-menu");
            if (menu) {
              const y = menu.getBoundingClientRect().top + window.scrollY - 10;
              window.scrollTo({ top: y, behavior: "auto" });
            }
          }, 50);

          return;
        }

        if (activeTab !== "home") {
          setActiveTab("home");
          return;
        }

        App.exitApp();
      }).then((handle) => {
        listener = handle;
      });
    });

    return () => {
      listener?.remove();
    };
  }, [showSettings, homeSection, activeTab]);

  useEffect(() => {
    const introSeen = localStorage.getItem("savewise_intro_seen");

    if (!introSeen) {
      setShowIntro(true);
    }

    const done = localStorage.getItem("savewise_onboarding_done");
    if (!done) {
      setShowOnboarding(true);
    }
  }, []);

  const onboardingSlides = [
    {
      title: "Willkommen bei SaveWise AI",
      text: "Dein persönliches Finanzdashboard mit BudgetFlow, Sparscore, Verträgen, Upload-Analyse und smarter AI-Unterstützung."
    },
    {
      title: "BudgetFlow verstehen",
      text: "Auf der Startseite siehst du sofort Einkommen, Ausgaben und verfügbares Geld als klare Balken. Tippe auf die Bereiche, um direkt zu den passenden Details zu springen."
    },
    {
      title: "Daten erfassen",
      text: "Lade Kontoauszüge als PDF oder CSV hoch oder trage Einkommen, Ausgaben und Verträge manuell ein. Änderungen werden automatisch in deiner Übersicht berücksichtigt."
    },
    {
      title: "Verträge & Fixkosten prüfen",
      text: "SaveWise zeigt dir wiederkehrende Kosten, Fixkostenquote, Jahresbelastung und erkannte Verträge übersichtlich im App-Design."
    },
    {
      title: "Ziele, Trends und Reports",
      text: "Nutze Monatsvergleich, Sparziel und PDF-Export, um deine Entwicklung zu verfolgen und Ergebnisse zu sichern."
    },
    {
      title: "SaveWise AI nutzen",
      text: "Über ✨ in der unteren Navigation kannst du Fragen zu deinen Finanzen stellen. Die AI nutzt deine lokalen Finanzwerte für Einschätzungen und Spartipps."
    }
  ];

  useEffect(() => {
    document.body.style.overflow = showSettings || showIntro || showScoreInfo ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSettings, showIntro, showScoreInfo]);

  function exportData() {
    const data = {
      savingScore,
      monthlySavings,
      monthlyBudget,
      spentThisMonth,
      topCategory,
      history,
      transactions,
      manualExpenses
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

  const manualExpenseTotal = manualExpenses.reduce((sum, item) => sum + item.amount, 0);
  const manualRecurringTotal = manualExpenses
    .filter((item) => item.recurring)
    .reduce((sum, item) => sum + item.amount, 0);

  const totalMonthlyExpenses = spentThisMonth + manualExpenseTotal;
  const remainingAfterManual = monthlyIncome - totalMonthlyExpenses;

  const fixedCostRatio =
    monthlyIncome > 0 ? Math.round((manualRecurringTotal / monthlyIncome) * 100) : 0;

  const spendingRatio =
    monthlyBudget > 0 ? Math.round((totalMonthlyExpenses / monthlyBudget) * 100) : 0;

  const savingsRate =
    monthlyIncome > 0 ? Math.max(0, Math.round(((monthlyIncome - totalMonthlyExpenses) / monthlyIncome) * 100)) : 0;

  const aiInsight =
    transactions.length === 0
      ? "Datenbasis fehlt"
      : totalMonthlyExpenses > monthlyBudget
      ? "Budget kritisch"
      : savingsRate >= 30
      ? "Starke Sparquote"
      : topCategory === "Streaming"
      ? "Abo-Check empfohlen"
      : topCategory === "Shopping"
      ? "Kaufverhalten prüfen"
      : topCategory === "Essen"
      ? "Essensbudget prüfen"
      : spendingRatio > 80
      ? "Ausgaben im Blick"
      : monthlySavings > 250
      ? "Sparpotenzial erkannt"
      : "Finanzen stabil";

  const aiRecommendation =
    transactions.length === 0
      ? "Lade einen Kontoauszug hoch, damit SaveWise echte Muster erkennt."
      : totalMonthlyExpenses > monthlyBudget
      ? "Du liegst über deinem Monatsbudget. Prüfe zuerst flexible Ausgaben."
      : savingsRate >= 30
      ? "Sehr gut: Deine Sparquote ist stark. Halte diesen Kurs."
      : topCategory === "Streaming"
      ? "Prüfe Abos, Testphasen und doppelte Streaming-Dienste."
      : topCategory === "Shopping"
      ? "Setze ein Wochenlimit für spontane Käufe."
      : topCategory === "Essen"
      ? "Plane 2–3 Mahlzeiten vor, um Ausgaben zu glätten."
      : "Deine Daten zeigen Sparpotenzial bei variablen Ausgaben und wiederkehrenden Kosten.";

  const allExpenseItems = [
    ...transactions
      .filter((item) => item.amount < 0)
      .map((item) => ({
        name: item.name,
        category: item.category,
        amount: Math.abs(item.amount)
      })),
    ...manualExpenses.map((item) => ({
      name: item.name,
      category: item.category + (item.recurring ? " · monatlich" : " · einmalig"),
      amount: item.amount
    }))
  ];

  const contractExpenses = manualExpenses.filter((item) => item.recurring);

  const contractMonthlyTotal = contractExpenses.reduce((sum, item) => {
    const interval = item.interval || "monatlich";

    if (interval === "jährlich") return sum + item.amount / 12;
    if (interval === "vierteljährlich") return sum + item.amount / 3;
    return sum + item.amount;
  }, 0);

  const contractAnnualTotal = contractMonthlyTotal * 12;

  const contractRatio =
    monthlyIncome > 0 ? Math.round((contractMonthlyTotal / monthlyIncome) * 100) : 0;



  const streamingCosts = manualExpenses
    .filter((item) =>
      item.category.toLowerCase().includes("stream") ||
      item.name.toLowerCase().includes("netflix") ||
      item.name.toLowerCase().includes("spotify") ||
      item.name.toLowerCase().includes("disney")
    )
    .reduce((sum, item) => sum + item.amount, 0);

  const restaurantCosts = manualExpenses
    .filter((item) =>
      item.category.toLowerCase().includes("restaurant")
    )
    .reduce((sum, item) => sum + item.amount, 0);

  const insuranceCosts = manualExpenses
    .filter((item) =>
      item.category.toLowerCase().includes("versicherung")
    )
    .reduce((sum, item) => sum + item.amount, 0);

  const estimatedMonthEnd =
    monthlyIncome - totalMonthlyExpenses;

  const budgetHealth =
    totalMonthlyExpenses > monthlyBudget
      ? "kritisch"
      : totalMonthlyExpenses > monthlyBudget * 0.85
      ? "angespannt"
      : "stabil";

  const aiFinanceStatus =
    savingsRate >= 25 && contractRatio < 40
      ? "Sehr stabil"
      : savingsRate >= 10
      ? "Solide"
      : "Optimierbar";

  const aiWarnings = [];

  if (streamingCosts > 40) {
    aiWarnings.push(
      "Mehrere Streamingdienste erkannt. Prüfe ungenutzte Abos."
    );
  }

  if (restaurantCosts > 150) {
    aiWarnings.push(
      "Restaurantkosten sind diesen Monat auffällig hoch."
    );
  }

  if (contractRatio > 50) {
    aiWarnings.push(
      "Deine Fixkostenquote ist kritisch hoch."
    );
  }

  if (insuranceCosts > 250) {
    aiWarnings.push(
      "Versicherungskosten wirken überdurchschnittlich hoch."
    );
  }

  if (totalMonthlyExpenses > monthlyBudget) {
    aiWarnings.push(
      "Du liegst aktuell über deinem Monatsbudget."
    );
  }

  const aiRecommendations = [];

  if (streamingCosts > 0) {
    aiRecommendations.push(
      "Streaming-Abos regelmäßig prüfen und ungenutzte Dienste kündigen."
    );
  }

  if (restaurantCosts > 0) {
    aiRecommendations.push(
      "Restaurant- und Lieferkosten durch Wochenlimits reduzieren."
    );
  }

  if (contractRatio > 35) {
    aiRecommendations.push(
      "Fixkosten optimieren: Versicherungen, Strom und Verträge vergleichen."
    );
  }

  if (savingsRate < 15) {
    aiRecommendations.push(
      "Sparquote verbessern: Ziel mindestens 20% Nettoüberschuss."
    );
  }

  const contractInsight =
    contractExpenses.length === 0
      ? "Noch keine Verträge erfasst. Füge wiederkehrende Kosten hinzu oder importiere einen Kontoauszug zur automatischen Erkennung."
      : contractRatio >= 50
      ? `Deine monatlichen Fixkosten betragen ${contractMonthlyTotal.toLocaleString("de-DE", { maximumFractionDigits: 0 })}€ und entsprechen ${contractRatio}% deines Einkommens. Prüfe insbesondere Wohnen, Versicherungen und Mobilität.`
      : contractRatio >= 35
      ? `Deine monatlichen Fixkosten betragen ${contractMonthlyTotal.toLocaleString("de-DE", { maximumFractionDigits: 0 })}€ und entsprechen ${contractRatio}% deines Einkommens. Einzelne Verträge könnten optimierbar sein.`
      : contractRatio >= 20
      ? `Deine monatlichen Fixkosten betragen ${contractMonthlyTotal.toLocaleString("de-DE", { maximumFractionDigits: 0 })}€ und entsprechen ${contractRatio}% deines Einkommens. Die Belastung wirkt aktuell kontrollierbar.`
      : `Deine monatlichen Fixkosten betragen ${contractMonthlyTotal.toLocaleString("de-DE", { maximumFractionDigits: 0 })}€ und entsprechen nur ${contractRatio}% deines Einkommens. Deine finanzielle Flexibilität ist sehr hoch.`;

  const contractRisk =
    contractRatio >= 50
      ? { label: "Kritisch", icon: "🔴", bg: "bg-red-400/10", border: "border-red-400/25" }
      : contractRatio >= 35
      ? { label: "Erhöht", icon: "🟠", bg: "bg-yellow-400/10", border: "border-yellow-400/25" }
      : { label: "Gesund", icon: "🟢", bg: "bg-emerald-400/10", border: "border-emerald-400/25" };

    const manualExpenseInsight =
    manualExpenses.length === 0
      ? "Noch keine eigenen Ausgaben eingetragen."
      : fixedCostRatio >= 40
      ? "Deine Fixkosten sind sehr hoch. Prüfe Verträge, Versicherungen und Abos."
      : fixedCostRatio >= 25
      ? "Deine Fixkosten sind spürbar. Hier liegt mögliches Sparpotenzial."
      : "Deine manuellen Ausgaben wirken aktuell kontrollierbar.";

  function detectSmartContract(input: string) {
    const value = input.toLowerCase();

    if (value.includes("netflix") || value.includes("spotify") || value.includes("disney") || value.includes("prime") || value.includes("wow") || value.includes("dazn")) {
      return { category: "Streaming", recurring: true, interval: "monatlich", hint: "Streaming-Abo erkannt" };
    }

    if (value.includes("vodafone") || value.includes("telekom") || value.includes("o2") || value.includes("1&1") || value.includes("handy")) {
      return { category: "Handy", recurring: true, interval: "monatlich", hint: "Mobilfunkvertrag erkannt" };
    }

    if (value.includes("allianz") || value.includes("huk") || value.includes("axa") || value.includes("ergo") || value.includes("versicherung")) {
      return { category: "Versicherung", recurring: true, interval: "monatlich", hint: "Versicherung erkannt" };
    }

    if (value.includes("strom") || value.includes("eon") || value.includes("vattenfall") || value.includes("stadtwerke")) {
      return { category: "Strom", recurring: true, interval: "monatlich", hint: "Stromvertrag erkannt" };
    }

    if (value.includes("miete") || value.includes("abtrag") || value.includes("darlehen") || value.includes("kreditrate")) {
      return { category: "Miete/Abtrag", recurring: true, interval: "monatlich", hint: "Wohnkosten erkannt" };
    }

    if (value.includes("tanken") || value.includes("shell") || value.includes("aral") || value.includes("esso")) {
      return { category: "Tanken", recurring: false, interval: "einmalig", hint: "Mobilitätsausgabe erkannt" };
    }

    if (value.includes("restaurant") || value.includes("lieferando") || value.includes("mcdonald") || value.includes("burger") || value.includes("cafe")) {
      return { category: "Restaurant", recurring: false, interval: "einmalig", hint: "Restaurant-Ausgabe erkannt" };
    }

    if (value.includes("urlaub") || value.includes("hotel") || value.includes("booking") || value.includes("airbnb")) {
      return { category: "Urlaub", recurring: false, interval: "einmalig", hint: "Urlaubs-/Reisekosten erkannt" };
    }

    return null;
  }

  function addManualExpense() {
    const cleanedAmount = manualExpenseAmount
      .trim()
      .replace(/\s/g, "")
      .replace(/€/g, "")
      .replace(/\./g, "")
      .replace(",", ".");

    const amount = Number(cleanedAmount);

    if (!manualExpenseName.trim() || !Number.isFinite(amount) || amount <= 0) {
      alert("Bitte gib einen Namen und einen gültigen Betrag ein, z.B. 1539,46.");
      return;
    }

    const detected = detectSmartContract(manualExpenseName);

    const finalCategory = detected?.category || manualExpenseCategory;
    const finalRecurring = detected?.recurring ?? manualExpenseRecurring;
    const finalInterval = detected?.interval || manualExpenseInterval;

    setManualExpenses([
      {
        id: Date.now(),
        name: manualExpenseName.trim(),
        category: finalCategory,
        amount,
        recurring: finalRecurring,
        interval: finalInterval,
        aiDetected: !!detected,
        aiHint: detected?.hint || "",
        confirmed: false,
        createdAt: new Date().toISOString()
      },
      ...manualExpenses
    ]);

    if (detected?.hint) {
      setUploadStatus("AI erkannt: " + detected.hint + " · Kategorie: " + finalCategory);
    }

    setManualExpenseName("");
    setManualExpenseAmount("");
    setManualExpenseRecurring(true);
    setManualExpenseInterval("monatlich");
  }

  function deleteManualExpense(id: number) {
    setManualExpenses(manualExpenses.filter((item) => item.id !== id));
  }

  function confirmExpense(id: number) {
    setManualExpenses(
      manualExpenses.map((item) =>
        item.id === id ? { ...item, confirmed: true } : item
      )
    );
  }

  return (
    <>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes softPulse {
          0%, 100% { box-shadow: 0 0 0 rgba(16,185,129,0.0); }
          50% { box-shadow: 0 0 35px rgba(16,185,129,0.22); }
        }

        .savewise-glow {
          animation: softPulse 2.4s ease-in-out infinite;
        }
.bg-gray-100,
        .bg-white {
          color: #111827 !important;
        }

        .bg-gray-100 p,
        .bg-gray-100 h1,
        .bg-gray-100 h2,
        .bg-gray-100 h3,
        .bg-gray-100 label,
        .bg-white p,
        .bg-white h1,
        .bg-white h2,
        .bg-white h3,
        .bg-white label {
          color: #111827 !important;
        }

        input,
        textarea,
        input.bg-gray-100,
        textarea.bg-gray-100 {
          color: #111827 !important;
          background-color: #f3f4f6 !important;
        }

        input::placeholder,
        textarea::placeholder {
          color: #6b7280 !important;
          opacity: 1 !important;
        }

        .text-emerald-400 {
          color: #10b981 !important;
        }

        .text-red-400 {
          color: #f87171 !important;
        }

        .text-yellow-400 {
          color: #eab308 !important;
        }

        .text-purple-400 {
          color: #c084fc !important;
        }

        .text-cyan-400,
        .text-cyan-300 {
          color: #06b6d4 !important;
        }
`}</style>
      
      <style jsx global>{`
        html,
        body {
          background: ${isLightMode ? "#f3f4f6" : "#050816"} !important;
          overscroll-behavior: none;
        }

        body {
          min-height: 100svh;
        }

        main {
          background: ${isLightMode ? "#f3f4f6" : "#050816"} !important;
        }
      `}</style>

      <style jsx global>{`
        html, body {
          background: #050816 !important;
          overscroll-behavior: none;
        }
        main {
          background: ${isLightMode ? "#f3f4f6" : "#050816"} !important;
        }
      `}</style>

      {showAppSplash && (
        <div className="fixed inset-0 z-[99999] bg-[#050816] flex flex-col items-center justify-center px-10">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />

            <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin shadow-lg shadow-emerald-400/40" />

            <img
              src="/savewise-icon.png"
              alt="SaveWise AI"
              className="w-36 h-36 rounded-[32px] transition-all duration-500"
              style={{
                opacity: 1,
                filter:
                  splashProgress >= 100
                    ? "brightness(1.2) drop-shadow(0 0 36px rgba(16,185,129,0.9))"
                    : "brightness(1) drop-shadow(0 0 16px rgba(16,185,129,0.35))",
                transform:
                  splashProgress >= 100
                    ? "scale(1.06)"
                    : "scale(1)"
              }}
            />
          </div>

          <h1 className="mt-2 text-2xl font-black text-white tracking-wide">
            SaveWise
          </h1>

          <p className="mt-2 text-emerald-300 font-bold tracking-widest text-sm">
            AI FINANCE DASHBOARD
          </p>



          
        </div>
      )}

      <main
  className={
    "min-h-0 p-6 pb-4 " +
    (isLightMode
      ? "savewise-light-fix bg-gray-100 text-black"
      : "bg-[#050816] text-white")
  }
>
      <div className="max-w-5xl mx-auto space-y-1">
        {homeSection === "overview" && activeTab === "home" && <Header monthlySavings={monthlySavings} savingScore={savingScore} topCategory={topCategory} onScoreClick={() => setShowScoreInfo(true)} onSavingsClick={() => { setActiveTab("home"); setHomeSection("goal"); window.scrollTo({ top: 0, behavior: "smooth" }); }} />}

        {activeTab === "home" && homeSection !== "overview" && (
          <button
            type="button"
            onClick={() => {
              setHomeSection("overview");
              window.scrollTo({ top: 0, behavior: "auto" });
            }}
            className="mb-4 ml-2 inline-flex h-12 px-5 rounded-[22px] bg-[#1f1d24]/95 text-white font-black shadow-2xl backdrop-blur-xl items-center justify-center whitespace-nowrap active:scale-[0.98] transition-all"
          >
            ← Zurück
          </button>
        )}

        {activeTab === "home" && (
          <div className="space-y-1 mt-2 pb-28">
            {homeSection === "aihub" && (
              <div className="space-y-1 pt-4">

                <Panel isLightMode={isLightMode} title="Analyse & AI">

                  <div className="grid grid-cols-2 gap-4 mt-2">

                    <div className="rounded-3xl bg-cyan-400/10 border border-cyan-400/20 p-5">
                      <p className="text-cyan-300 text-sm font-black uppercase tracking-wider">
                        Sparquote
                      </p>

                      <h2 className="text-2xl font-black text-white mt-3">
                        {savingsRate}%
                      </h2>
                    </div>

                    <div className="rounded-3xl bg-emerald-400/10 border border-emerald-400/20 p-5">
                      <p className="text-emerald-300 text-sm font-black uppercase tracking-wider">
                        Finanzscore
                      </p>

                      <h2 className="text-2xl font-black text-white mt-3">
                        {savingScore}/100
                      </h2>
                    </div>

                  </div>

                  <div className="mt-2 rounded-3xl bg-white/5 border border-white/10 p-6">

                    <p className="text-white text-xl font-black">
                      AI Einschätzung
                    </p>

                    <p className="text-white/80 mt-3 leading-relaxed">
                      {aiRecommendations?.[0] || aiInsight}
                    </p>

                  </div>

                  {false && aiWarnings.length > 0 && (
                    <div className="mt-3 rounded-3xl bg-red-400/10 border border-red-400/20 p-6">

                      <p className="text-red-300 font-black">
                        Wichtigster Hinweis
                      </p>

                      <p className="text-white/80 mt-3">
                        ⚠ {aiWarnings[0]}
                      </p>

                    </div>
                  )}

                </Panel>

              </div>
            )}


            {false && homeSection === "contracts" && (
              <div className="space-y-1 pt-4">

                <Panel isLightMode={isLightMode} title="Verträge & Budget">

                  <div className="grid grid-cols-2 gap-4 mt-2">

                    <div className="rounded-3xl bg-fuchsia-400/10 border border-fuchsia-400/20 p-5">
                      <p className="text-fuchsia-300 text-sm font-black uppercase tracking-wider">
                        Fixkosten
                      </p>

                      <h2 className="text-3xl font-black text-white mt-3">
                        {contractMonthlyTotal.toLocaleString("de-DE", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })}€
                      </h2>
                    </div>

                    <div className="rounded-3xl bg-yellow-400/10 border border-yellow-400/20 p-5">
                      <p className="text-yellow-300 text-sm font-black uppercase tracking-wider">
                        Budget
                      </p>

                      <h2 className="text-3xl font-black text-white mt-3">
                        {monthlyBudget.toLocaleString("de-DE", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })}€
                      </h2>
                    </div>

                  </div>

                  <div className="mt-2 rounded-3xl bg-white/5 border border-white/10 p-6">

                    <p className="text-white text-xl font-black">
                      Verträge & Abos
                    </p>

                    <p className="text-white/70 mt-3 leading-relaxed">
                      SaveWise erkennt automatisch wiederkehrende Kosten,
                      Abos und Verträge aus deinen Finanzdaten.
                    </p>

                  </div>

                </Panel>

              </div>
            )}


            {activeTab === "home" && homeSection === "overview" && (
              <div className="space-y-4 mb-6">

                <div className="hidden">

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black tracking-[0.18em] text-emerald-300 uppercase">
                        AI Finanzstatus
                      </p>

                      <h2 className="text-3xl font-black text-white mt-2">
                        {aiFinanceStatus}
                      </h2>
                    </div>

                    <div className="w-16 h-16 rounded-3xl bg-emerald-400/20 flex items-center justify-center text-3xl">
                      🤖
                    </div>
                  </div>

                  <p className="text-white/80 mt-3 leading-relaxed">
                    {aiRecommendations?.[0] || "Deine Finanzstruktur wirkt aktuell stabil."}
                  </p>

                </div>

                {false && aiWarnings.length > 0 && (
                  <div className="rounded-[30px] bg-red-400/10 border border-red-400/20 p-5">

                    <p className="text-red-400 font-black">
                      Wichtigster Hinweis
                    </p>

                    <p className="text-white mt-2 leading-relaxed">
                      ⚠ {aiWarnings[0]}
                    </p>

                  </div>
                )}

              </div>
            )}

            <div className="hidden">
              <p className="text-white text-xl font-black">
                Frage SaveWise AI
              </p>

              <p className="text-white/50 mt-1 text-sm">
                Stelle Fragen zu deinen echten Finanzdaten.
              </p>

              <div className="grid grid-cols-2 gap-1 mt-3">
                <button
                  type="button"
                  onClick={() => askQuickAI("Wo kann ich sparen?")}
                  className="bg-white/10 border border-white/10 rounded-2xl p-3 text-white font-bold text-sm"
                >
                  Sparpotenzial
                </button>

                <button
                  type="button"
                  onClick={() => askQuickAI("Wie hoch sind meine Fixkosten?")}
                  className="bg-white/10 border border-white/10 rounded-2xl p-3 text-white font-bold text-sm"
                >
                  Fixkosten
                </button>

                <button
                  type="button"
                  onClick={() => askQuickAI("Warum ist mein Score so?")}
                  className="bg-white/10 border border-white/10 rounded-2xl p-3 text-white font-bold text-sm"
                >
                  Score
                </button>

                <button
                  type="button"
                  onClick={() => askQuickAI("Kann ich mir Urlaub leisten?")}
                  className="bg-white/10 border border-white/10 rounded-2xl p-3 text-white font-bold text-sm"
                >
                  Urlaub
                </button>
              </div>

              <div className="flex gap-1 mt-3 items-center">
                <input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="z.B. Wo kann ich sparen?"
                  className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder:text-white/40 outline-none"
                />

                <button
                  type="button"
                  onClick={askAI}
                  className="fixed top-[104px] left-5 z-[9999] h-14 px-6 rounded-[24px] bg-[#1f1d24]/95 text-white font-black shadow-2xl backdrop-blur-xl flex items-center justify-center whitespace-nowrap active:scale-[0.98] transition-all"
                >
                  Fragen
                </button>
              </div>

              <div className="mt-3 rounded-2xl bg-black/20 border border-white/10 p-4">
                <p className="text-emerald-300 text-xs font-black uppercase tracking-[0.18em]">
                  Antwort
                </p>

                <p className="text-white/80 mt-3 leading-relaxed">
                  {chatReply}
                </p>
              </div>
            </div>

            <div className={activeTab === "home" && homeSection === "overview" ? "relative -mx-6 -mt-14 rounded-[24px] border border-emerald-400/5 bg-white/[0.012] p-1 shadow-[0_0_8px_rgba(16,185,129,0.03)]" : "hidden"}>
              <div className="absolute -inset-1 rounded-[30px] bg-emerald-400/[0.03] blur-md pointer-events-none" />
              <div className="rounded-[22px] border border-emerald-400/5 bg-white/[0.012] p-1 shadow-none backdrop-blur-xl">

              <div className="mb-3 rounded-[20px] border border-white/10 bg-white/[0.03] p-3 shadow-lg backdrop-blur-xl overflow-hidden">
                <div className="flex items-center justify-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 w-full">
                      <img
                        src="/savewise-icon.png"
                        alt="SaveWise"
                        className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-emerald-400/10"
                      />

                      <h2 className="text-[30px] font-black tracking-[0.12em] uppercase text-white">
                        BudgetFlow
                      </h2>
                    </div>
                  </div>

                  <div className="hidden">
                    📊
                  </div>
                </div>

                <div className="mt-3 rounded-[18px] bg-white/[0.04] border border-white/10 p-2 space-y-1">
                  {(() => {
                    const income = monthlyIncome || 0;
                    const expenses = totalMonthlyExpenses || 0;
                    const available = income > 0 ? remainingAfterManual : 0;
                    const maxValue = Math.max(income, expenses, available, 1);
                    const availableRate = income > 0 ? Math.max(0, Math.round((available / income) * 100)) : 0;
                    const expenseRate = income > 0 ? Math.max(0, Math.round((expenses / income) * 100)) : 0;

                    const rows = [
                      {
                        label: "Einkommen",
                        value: income,
                        percent: income > 0 ? 100 : 0,
                        color: "bg-emerald-400",
                        text: "text-emerald-400",
                        hint: "Bearbeiten →",
                        onClick: () => {
                          setActiveTab("finance");
                          setFinanceSection("manual");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      },
                      {
                        label: "Ausgaben",
                        value: expenses,
                        percent: income > 0 ? Math.min(100, expenseRate) : Math.round((expenses / maxValue) * 100),
                        color: "bg-red-400",
                        text: "text-red-400",
                        hint: "Details →",
                        onClick: () => {
                          setActiveTab("finance");
                          setFinanceSection("transactions");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      },
                      {
                        label: "Verfügbar",
                        value: available,
                        percent: income > 0 ? availableRate : Math.round((available / maxValue) * 100),
                        color: "bg-yellow-400",
                        text: "text-yellow-400",
                        hint: "Analyse →",
                        onClick: () => {
                          setHomeSection("monthly");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }
                    ];

                    const insight =
                      income <= 0
                        ? "Trage dein Einkommen ein, damit SaveWise deine Finanzlage bewerten kann."
                        : expenses > income
                          ? `Deine Ausgaben übersteigen dein Einkommen aktuell um ${(expenses - income).toLocaleString("de-DE", { maximumFractionDigits: 0 })}€ pro Monat.`
                        : availableRate >= 50
                          ? `Du verfügst aktuell über ${available.toLocaleString("de-DE", { maximumFractionDigits: 0 })}€ monatlichen Überschuss. Deine finanzielle Flexibilität ist sehr hoch.`
                          : availableRate >= 20
                            ? `${availableRate}% deines Einkommens bleiben verfügbar. Deine Finanzlage wirkt stabil.`
                            : `Nur ${availableRate}% deines Einkommens bleiben verfügbar. Prüfe variable Ausgaben und Fixkosten.`;

                    return (
                      <>
                        {rows.map((row) => (
                          <button
                            key={row.label}
                            type="button"
                            onClick={row.onClick}
                            className="w-full rounded-[15px] bg-white/[0.028] border border-white/10 px-3 py-1.5 text-left active:scale-[0.985] transition-all"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <div>
                                <p className="text-white/45 text-xs uppercase tracking-[0.18em] font-black">
                                  {row.label}
                                </p>
                                <p className="text-white/35 text-xs mt-1">
                                  {row.hint}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className={`${row.text} text-xl font-black`}>
                                  {row.value > 0
                                    ? row.value.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + "€"
                                    : "—"}
                                </p>
                                <p className="text-white/35 text-xs font-bold">
                                  {row.percent}% →
                                </p>
                              </div>
                            </div>

                            <div className="mt-1.5 h-3 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className={`${row.color} h-full rounded-full transition-all duration-700`}
                                style={{ width: `${Math.max(6, Math.min(100, row.percent))}%` }}
                              />
                            </div>
                          </button>
                        ))}

                        <div className="rounded-[14px] bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5">
                          <p className="text-[9px] uppercase tracking-[0.16em] text-emerald-300 font-black">
                            BudgetFlow Insight
                          </p>
                          <p className="text-white/70 mt-1 leading-snug text-xs">
                            {insight}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="hidden">
                  {(() => {
                    const grouped = allExpenseItems.reduce((acc: Record<string, number>, item) => {
                      const key = item.category || "Sonstiges";
                      acc[key] = (acc[key] || 0) + Math.abs(item.amount || 0);
                      return acc;
                    }, {});

                    const rows = Object.entries(grouped)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5);

                    const max = Math.max(...rows.map(([, value]) => value), 1);

                    if (rows.length === 0) {
                      return (
                        <div className="rounded-[28px] bg-white/[0.04] border border-white/10 p-5 text-white/60">
                          Noch keine Ausgaben vorhanden. Lade Daten hoch oder trage Ausgaben ein.
                        </div>
                      );
                    }

                    return rows.map(([category, value]) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setActiveTab("finance");
                          setFinanceSection("transactions");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="w-full rounded-[24px] bg-white/[0.045] border border-white/10 p-4 text-left active:scale-[0.98] transition-all"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div>
                            <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>
                              {category}
                            </p>
                            <p className="text-white/40 text-xs mt-1">
                              Monatliche Ausgaben
                            </p>
                          </div>

                          <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>
                            {value.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}€
                          </p>
                        </div>

                        <div className="mt-3 h-3 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-400"
                            style={{ width: `${Math.max(8, Math.round((value / max) * 100))}%` }}
                          />
                        </div>
                      </button>
                    ));
                  })()}
                </div>
              </div>

              <div className="hidden">

                <button
                  type="button"
                  onClick={() => {
                    setHomeSection("monthly");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="relative w-44 h-44 shrink-0 rounded-full border-[14px] border-emerald-400/35 shadow-[0_0_55px_rgba(16,185,129,0.42)] flex items-center justify-center active:scale-95 transition-all"
                  aria-label="Analyse →"
                >

                  <div className="absolute inset-2 rounded-full border-[10px] border-cyan-400/20" />
                  <div className="absolute inset-8 rounded-full bg-[#050816] border border-white/10 shadow-inner" />

                  <div className="relative text-center">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-300 font-black">
                      Übrig
                    </p>

                    <p className="text-xl font-black text-yellow-400 mt-2">
                      {monthlyIncome > 0
                        ? remainingAfterManual.toLocaleString("de-DE", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }) + "€"
                        : "—"}
                    </p>
                  </div>
                </button>

                <div className="flex-1 space-y-4">

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("finance");
                      setFinanceSection("manual");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full text-left rounded-3xl border border-emerald-400/10 bg-emerald-400/5 p-4 active:scale-[0.98] transition-all"
                  >
                    <p className="text-white/50 text-sm font-bold">
                      Einkommen
                    </p>

                    <p className="text-3xl font-black text-emerald-400 mt-1">
                      {monthlyIncome > 0
                        ? monthlyIncome.toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }) + "€"
                        : "—"}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("finance");
                      setFinanceSection("transactions");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full text-left rounded-3xl border border-red-400/10 bg-red-400/5 p-4 active:scale-[0.98] transition-all"
                  >
                    <p className="text-white/50 text-sm font-bold">
                      Ausgaben
                    </p>

                    <p className="text-3xl font-black text-red-400 mt-1">
                      {totalMonthlyExpenses > 0
                        ? totalMonthlyExpenses.toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }) + "€"
                        : "—"}
                    </p>
                  </button>

                </div>

              </div>

              <div className="hidden">

                <Card
                  isLightMode={isLightMode}
                  title="AI Status"
                  value={aiFinanceStatus || aiInsight}
                  color="text-cyan-400"
                />

                <Card
                  isLightMode={isLightMode}
                  title="Finanzscore"
                  value={`${savingScore}/100 · ${savingsRate}%`}
                  color="text-purple-400"
                  onClick={() => setShowScoreInfo(true)}
                />

              </div>

            </div>
            </div>




            {false && (
              <div className="space-y-1 pt-2">

                <button
                  type="button"
                  onClick={() => setHomeSection("overview")}
                  className="bg-[#1f1f24] text-white px-6 py-4 rounded-[24px] font-black shadow-2xl active:scale-[0.98] transition-all duration-300"
                >
                  ← Zurück
                </button>

                <Panel isLightMode={isLightMode} title="AI Insights">

                  <div className="grid grid-cols-2 gap-3 mt-3">

                    <div className={isLightMode ? "rounded-2xl bg-white border border-gray-200 p-4 shadow-sm" : "rounded-2xl bg-white/[0.055] border border-white/10 p-4"}>
                      <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>
                        Finanzstatus
                      </p>

                      <p className="text-3xl font-black text-emerald-400 mt-3">
                        {aiFinanceStatus}
                      </p>
                    </div>

                    <div className={isLightMode ? "rounded-2xl bg-white border border-gray-200 p-4 shadow-sm" : "rounded-2xl bg-white/[0.055] border border-white/10 p-4"}>
                      <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>
                        Budgetstatus
                      </p>

                      <p className="text-3xl font-black text-cyan-400 mt-3">
                        {budgetHealth}
                      </p>
                    </div>

                    <div className={isLightMode ? "rounded-2xl bg-white border border-gray-200 p-4 shadow-sm" : "rounded-2xl bg-white/[0.055] border border-white/10 p-4"}>
                      <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>
                        Monatsprognose
                      </p>

                      <p className="text-3xl font-black text-yellow-400 mt-3">
                        {estimatedMonthEnd.toLocaleString("de-DE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}€
                      </p>
                    </div>

                  </div>

                  <div className="mt-2 rounded-3xl bg-red-400/10 border border-red-400/20 p-5">

                    <p className="font-black text-red-400">
                      AI Warnungen
                    </p>

                    <div className="space-y-1 mt-3">

                      {aiWarnings.length === 0 && (
                        <p className="text-white">
                          Keine kritischen Risiken erkannt.
                        </p>
                      )}

                      {aiWarnings.map((item, index) => (
                        <div
                          key={index}
                          className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white"
                        >
                          ⚠ {item}
                        </div>
                      ))}

                    </div>

                  </div>

                  <div className="mt-2 rounded-3xl bg-emerald-400/10 border border-emerald-400/20 p-5">

                    <p className="font-black text-emerald-400">
                      AI Empfehlungen
                    </p>

                    <div className="space-y-1 mt-3">

                      {aiRecommendations.length === 0 && (
                        <p className="text-white">
                          Deine Finanzstruktur wirkt aktuell stabil.
                        </p>
                      )}

                      {aiRecommendations.map((item, index) => (
                        <div
                          key={index}
                          className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white"
                        >
                          💡 {item}
                        </div>
                      ))}

                    </div>

                  </div>

                </Panel>

              </div>
            )}


            {homeSection === "contracts" && (
              <div className="space-y-1 pt-6 pb-32">
<Panel isLightMode={isLightMode} title="Verträge & Fixkosten">
                  <p className={isLightMode ? "text-black/70 mt-0" : "text-white mt-0"}>
                    Hier siehst du deine wiederkehrenden Kosten, Verträge und monatlichen Belastungen.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className={isLightMode ? "rounded-2xl bg-white border border-gray-200 px-4 py-3 shadow-sm" : "rounded-2xl bg-white/[0.055] border border-white/10 px-4 py-3"}>
                      <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>Monatliche Fixkosten</p>
                      <p className="text-xs font-black text-red-400 mt-0">
                        {contractMonthlyTotal.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                      </p>
                    </div>

                    <div className={isLightMode ? "rounded-2xl bg-white border border-gray-200 p-4 shadow-sm" : "rounded-2xl bg-white/[0.055] border border-white/10 p-4"}>
                      <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>Jahresbelastung</p>
                      <p className="text-xs font-black text-yellow-400 mt-0">
                        {contractAnnualTotal.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                      </p>
                    </div>

                    <div className={isLightMode ? "rounded-2xl bg-white border border-gray-200 p-4 shadow-sm" : "rounded-2xl bg-white/[0.055] border border-white/10 p-4"}>
                      <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>Fixkostenquote</p>
                      <p className="text-xs font-black text-cyan-400 mt-0">
                        {contractRatio}% · {contractRisk.icon} {contractRisk.label}
                      </p>
                    </div>
                  </div>

                  <div className={(isLightMode ? "mt-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 shadow-sm" : "mt-2 rounded-2xl border p-4 ") + (!isLightMode ? contractRisk.bg + " " + contractRisk.border : "")}>
                    <p className={isLightMode ? "font-black text-emerald-900" : "font-black text-white"}>
                      {contractRisk.icon} AI Bewertung · {contractRisk.label}
                    </p>
                    <p className={isLightMode ? "text-emerald-950/70 mt-2 leading-relaxed" : "text-white/75 mt-2 leading-relaxed"}>
                      {contractInsight}
                    </p>
                  </div>

                  <div className="space-y-1 mt-2">
                    {contractExpenses.length > 0 && (
                      <p className={isLightMode ? "text-xs font-black uppercase tracking-[0.18em] text-black/45 mb-1" : "text-xs font-black uppercase tracking-[0.18em] text-white/40 mb-1"}>
                        Einzelne Verträge
                      </p>
                    )}

                    {contractExpenses.length === 0 && (
                      <p className="text-white">
                        Noch keine Verträge erfasst. Füge wiederkehrende Kosten hinzu oder importiere einen Kontoauszug zur automatischen Erkennung.
                      </p>
                    )}

                    {[...contractExpenses].sort((a, b) => b.amount - a.amount).map((item) => (
                      <div key={item.id} className={isLightMode ? "rounded-2xl bg-white border border-gray-200 px-4 py-3 shadow-sm" : "rounded-2xl bg-white/[0.055] border border-white/10 px-4 py-3"}>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className={isLightMode ? "font-black text-black" : "font-black text-white"}>{item.name}</p>
                            <p className={isLightMode ? "text-xs text-black/60 mt-0" : "text-xs text-white/55 mt-0"}>
                              {item.category} · {item.interval || "monatlich"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-black text-red-400">
                              {item.amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                            </p>
                            <p className={isLightMode ? "text-xs text-black/60 mt-0" : "text-xs text-white/55 mt-0"}>
                              {item.interval === "jährlich"
                                ? "≈ " + (item.amount / 12).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€ / Monat"
                                : item.interval === "vierteljährlich"
                                ? "≈ " + (item.amount / 3).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€ / Monat"
                                : "monatlich"}
                            </p>
                          </div>
                        </div>

                        {item.aiDetected && !item.confirmed && (
                          <div className="mt-0 rounded-2xl bg-yellow-400/15 border border-yellow-400/30 p-4">
                            <p className="font-black text-black">AI Erkennung</p>
                            <p className="text-black mt-0">
                              {item.aiHint || "AI hat diesen Vertrag automatisch erkannt."}
                            </p>

                            <button
                              type="button"
                              onClick={() => confirmExpense(item.id)}
                              className="mt-0 bg-emerald-400 text-black px-5 py-3 rounded-2xl font-black"
                            >
                              AI-Erkennung bestätigen
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => deleteManualExpense(item.id)}
                          className={isLightMode ? "mt-1.5 text-xs font-black text-red-600/80 underline underline-offset-4 active:scale-[0.98] transition-all" : "mt-1.5 text-xs font-black text-red-300/80 underline underline-offset-4 active:scale-[0.98] transition-all"}
                        >
                          Löschen
                        </button>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            )}

            {homeSection === "overview" && (
<div id="home-menu" className="grid gap-2 -mt-2 pb-24">
  {[
    {
      key: "compare",
      label: "Monatsvergleich",
      text: "Einnahmen · Ausgaben · Sparquote"
    },
    {
      key: "goal",
      label: "Sparziel",
      text: "Ziel & Fortschritt"
    },

    {
      key: "contracts",
      label: "Verträge & Fixkosten",
      text: "Fixkosten & Abos prüfen"
    },

  ].map((item) => (
    <button
      key={item.key}
      onClick={() => {
                    setHomeSection(item.key);
                    setTimeout(() => {
                      const menu = document.getElementById("home-menu");
                      if (menu) {
                        const y = menu.getBoundingClientRect().top + window.scrollY - 10;
                        window.scrollTo({ top: y, behavior: "auto" });
                      }
                    }, 50);
                  }}
      className={
        "relative overflow-hidden rounded-[24px] border p-4 text-left transition-all duration-300 active:scale-[0.98] shadow-xl " +
        (homeSection === item.key
          ? "bg-emerald-400 text-black border-emerald-300 shadow-xl shadow-emerald-400/25"
          : isLightMode ? "bg-white/80 text-black border-gray-200 shadow-black/10" : "bg-white/5 text-white border-white/10 shadow-black/20")
      }
    >
      <p
        className={
          homeSection === item.key
            ? "text-xs font-black text-black"
            : isLightMode
            ? "text-xs font-black text-black"
            : isLightMode ? "text-xs font-black text-black" : "text-xs font-black text-white"
        }
      >
        {item.label}
      </p>

      <p className={
        homeSection === item.key
          ? "mt-0 text-white"
          : isLightMode ? "mt-0 text-black" : "mt-0 text-gray-300"
      }>
        {item.text}
      </p>
    </button>
  ))}
</div>
)}

            {homeSection !== "overview" && (
              <div className="fixed top-6 left-0 right-0 z-[9999] px-6">
              </div>
            )}

            <div className={homeSection === "overview" ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 gap-4 pt-24"}>

              <div className={homeSection === "compare" ? "block" : "hidden"}>
              <Panel isLightMode={isLightMode} title="Monatsvergleich">
                {monthlyIncome <= 0 && totalMonthlyExpenses <= 0 ? (
                  <div className={isLightMode ? "rounded-3xl bg-white border border-gray-200 p-5 shadow-sm" : "rounded-3xl bg-white/[0.045] border border-white/10 p-5"}>
                    <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>
                      Noch keine Finanzdaten vorhanden.
                    </p>
                    <p className={isLightMode ? "text-black/60 mt-2" : "text-white/60 mt-2"}>
                      Trage Einkommen und Ausgaben ein, um deinen Monatsvergleich zu aktivieren.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-3 mt-2">
                      <div className={isLightMode ? "rounded-2xl bg-white border border-gray-200 px-4 py-3 shadow-sm" : "rounded-2xl bg-white/[0.055] border border-white/10 px-4 py-3"}>
                        <p className={isLightMode ? "text-xs font-black uppercase tracking-[0.18em] text-black/45" : "text-xs font-black uppercase tracking-[0.18em] text-white/40"}>Monatseinnahmen</p>
                        <p className="text-2xl font-black text-emerald-400 mt-1">{monthlyIncome > 0 ? monthlyIncome.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + "€" : "—"}</p>
                      </div>

                      <div className={isLightMode ? "rounded-2xl bg-white border border-gray-200 px-4 py-3 shadow-sm" : "rounded-2xl bg-white/[0.055] border border-white/10 px-4 py-3"}>
                        <p className={isLightMode ? "text-xs font-black uppercase tracking-[0.18em] text-black/45" : "text-xs font-black uppercase tracking-[0.18em] text-white/40"}>Monatsausgaben</p>
                        <p className="text-2xl font-black text-red-400 mt-1">{totalMonthlyExpenses > 0 ? totalMonthlyExpenses.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + "€" : "—"}</p>
                      </div>

                      <div className={isLightMode ? "rounded-2xl bg-white border border-gray-200 px-4 py-3 shadow-sm" : "rounded-2xl bg-white/[0.055] border border-white/10 px-4 py-3"}>
                        <p className={isLightMode ? "text-xs font-black uppercase tracking-[0.18em] text-black/45" : "text-xs font-black uppercase tracking-[0.18em] text-white/40"}>Sparquote</p>
                        <p className="text-2xl font-black text-purple-400 mt-1">{savingsRate}%</p>
                      </div>
                    </div>

                    <div className={isLightMode ? "mt-3 rounded-3xl bg-emerald-50 border border-emerald-200 p-5" : "mt-3 rounded-3xl bg-emerald-400/10 border border-emerald-400/25 p-5"}>
                      <p className={isLightMode ? "font-black text-emerald-950" : "font-black text-white"}>
                        {remainingAfterManual < 0 ? "Defizit erkannt" : savingsRate >= 25 ? "Starker Monat" : "Monat im Blick"}
                      </p>
                      <p className={isLightMode ? "text-emerald-950/70 mt-2" : "text-white/70 mt-2"}>
                        {remainingAfterManual < 0
                          ? `Deine Ausgaben übersteigen dein Einkommen um ${Math.abs(remainingAfterManual).toLocaleString("de-DE", { maximumFractionDigits: 0 })}€.`
                          : `Aktuell bleiben dir ${remainingAfterManual.toLocaleString("de-DE", { maximumFractionDigits: 0 })}€ verfügbar.`}
                      </p>
                    </div>
                  </>
                )}
              </Panel>
              </div>

<div className={homeSection === "goal" ? "block" : "hidden"}>
<Panel isLightMode={isLightMode} title="Sparziel">
  <div className="grid gap-1 mt-2">
    <div>
      <p className="text-sm font-bold text-gray-300 mb-2">Zielname</p>
      <input
        value={savingGoal}
        onChange={(e) => setSavingGoal(e.target.value)}
        placeholder=""
        className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 outline-none"
      />
    </div>

    <div>
      <p className="text-sm font-bold text-gray-300 mb-2">Zielbetrag</p>
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
      <p className="text-sm font-bold text-gray-300 mb-2">Gesparter Betrag</p>
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

  <p className="text-gray-600 mt-3">
    Fortschritt: {savedAmount}€ von {goalAmount}€
  </p>

  <p className="text-emerald-400 font-black text-3xl mt-3">
    Noch nötig: {Math.max(0, goalAmount - savedAmount)}€
  </p>

  <div className="w-full h-5 bg-gray-100 rounded-full mt-2 overflow-hidden">
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
</div>
              <div className={false ? "block" : "hidden"}>
              <Panel isLightMode={isLightMode} title="Monatsbudget">
                <div className="flex gap-1 mt-2">
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

                <p className="text-white mt-2">Ausgabenlimit: {monthlyBudget}€</p>
                <p className="text-white mt-2">Ausgegeben: {spentThisMonth}€</p>

                <p className="text-emerald-400 font-black text-3xl mt-3">
                  Vom Ausgabenlimit übrig: {(monthlyBudget - totalMonthlyExpenses).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                </p>

                <div className="w-full h-5 bg-gray-100 rounded-full mt-2 overflow-hidden">
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
                      width: Math.min(100, (totalMonthlyExpenses / monthlyBudget) * 100) + "%"
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
              </div>


            </div>

            
            <div className={false && homeSection === "trend" ? "block" : "hidden"}>
            <Panel isLightMode={isLightMode} title="Finanztrend">
              <div className="h-72 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Jan", ausgaben: 980, sparen: 420 },
                      { name: "Feb", ausgaben: 1120, sparen: 360 },
                      { name: "Mär", ausgaben: 870, sparen: 520 },
                      { name: "Apr", ausgaben: totalMonthlyExpenses, sparen: Math.max(0, monthlyIncome - spentThisMonth) }
                    ]}
                  >
                    <XAxis dataKey="name" />
                    <Tooltip />
                    <Bar dataKey="ausgaben" radius={[12, 12, 0, 0]} />
                    <Bar dataKey="sparen" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="text-gray-600 mt-3">
                Deine aktuelle Finanzentwicklung wird automatisch mit deinem Monatsbudget verglichen.
              </p>
            </Panel>
            </div>

            <div className={homeSection === "overview" ? "block" : "hidden"}>
            
            </div>
          </div>
        )}

        {activeTab === "finance" && (
          <div className="space-y-1 mt-2">

            {financeSection === "menu" && <Header monthlySavings={monthlySavings} savingScore={savingScore} topCategory={topCategory} onScoreClick={() => setShowScoreInfo(true)} onSavingsClick={() => { setActiveTab("home"); setHomeSection("goal"); window.scrollTo({ top: 0, behavior: "smooth" }); }} />}
            {financeSection === "menu" && (
              <>
                <div className="px-1 mb-2">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
                  Übersicht
                </p>
                <p className="mt-1 text-sm text-white/45">
                  Deine Finanzen kompakt
                </p>
              </div>

              <div className="mb-4">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-emerald-300 font-black">
                      SaveWise AI
                    </p>

                    <h2 className="text-xl font-black text-white mt-2">
                      {aiFinanceStatus || aiInsight || 'Finanzlage stabil'}
                    </h2>
                  </div>

                  <div className="w-14 h-14 rounded-3xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-2xl">
                    🤖
                  </div>

                </div>

                {smartNotifications.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">

                    {smartNotifications.map((note, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70"
                      >
                        {note}
                      </div>
                    ))}

                  </div>
                )}

              </div>

              <div className="grid gap-4">
                  {[
                    {
                      key: "upload",
                      label: "Kontoauszüge & Uploads",
                      text: "Kontoauszüge als PDF oder CSV hochladen und analysieren"
                    },
                    {
                      key: "manual",
                      label: "Ausgaben & Verträge",
                      text: "Einkommen und Ausgaben händisch eintragen"
                    },
                    {
                      key: "transactions",
                      label: "Alle Ausgaben",
                      text: "Manuelle Ausgaben und erkannte Transaktionen anzeigen"
                    },
                    {
                      key: "pdf",
                      label: "Finanzexport",
                      text: "Daten exportieren und Reports erstellen"
                    }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setFinanceSection(item.key)}
                      className={
                        "rounded-[28px] border p-6 text-left transition-all duration-300 active:scale-[0.98] " +
                        (isLightMode
                          ? "bg-white/90 text-black border-gray-200 shadow-xl shadow-black/10"
                          : "bg-white/5 text-white border-white/10")
                      }
                    >
                      <p className={isLightMode ? "text-xl font-black text-black" : "text-xl font-black text-white"}>{item.label}</p>
                      <p className={isLightMode ? "mt-1 text-black" : "mt-1 text-gray-300"}>{item.text}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {financeSection !== "menu" && (<div className="pt-24">
              <div className="fixed top-6 left-0 right-0 z-[9999] px-6">
                <button
                  type="button"
                  onClick={() => {
                    setFinanceSection("menu");
                    window.scrollTo({ top: 0, behavior: "auto" });
                  }}
                  className="bg-[#1f1f24] text-white px-6 py-4 rounded-[24px] font-black shadow-2xl active:scale-[0.98] transition-all duration-300"
                >
                  <span className="text-white">← Zurück</span>
                </button>
              </div>
            </div>
            )}


            <div className={financeSection === "transactions" ? "block pt-6" : "hidden"}>
              <Panel isLightMode={isLightMode} title="Alle Ausgaben">
                <div className="space-y-1.5 mt-0">
                  {allExpenseItems.length === 0 && (
                    <p className="text-white">Noch keine Ausgaben vorhanden.</p>
                  )}

                  {allExpenseItems.map((item, index) => (
                    <div key={index} className={(isLightMode ? "bg-white border border-gray-200 text-black shadow-sm " : "bg-white/[0.055] border border-white/10 text-white ") + "px-4 py-3 rounded-2xl flex justify-between items-center"}>
                      <div>
                        <p className={isLightMode ? "font-bold text-black" : "font-bold text-white"}>{item.name}</p>
                        <p className={isLightMode ? "text-black/60 text-sm" : "text-white/55 text-sm"}>{item.category}</p>
                      </div>

                      <p className="text-red-400 font-black">
                        {Math.abs(item.amount).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                      </p>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <div className={financeSection === "upload" ? "block pt-6" : "hidden"}>
              <Panel isLightMode={isLightMode} title="Kontoauszüge & Uploads">
                <p className="text-white mt-3">
                  Lade deine Kontoauszüge als PDF oder CSV hoch.
                </p>

                <label className="mt-2 flex items-center gap-1 bg-emerald-400 text-black px-6 py-4 rounded-2xl font-black cursor-pointer w-fit">
                  <Upload size={20} />
                  Datei auswählen

                  <input
                    type="file"
                    accept=".pdf,.csv,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      const fileName = file?.name || "";

                      setUploadedFile(fileName);

                      if (fileName.toLowerCase().endsWith(".pdf")) {
                        setUploadStatus("PDF erkannt. Analyse startet...");
                        if (file) analyzePdf(file);
                      } else if (fileName.toLowerCase().endsWith(".csv")) {
                        setUploadStatus("CSV erkannt. Datei wird analysiert.");
                        if (file) analyzeCsv(file);
                      } else if (
                        fileName.toLowerCase().endsWith(".png") ||
                        fileName.toLowerCase().endsWith(".jpg") ||
                        fileName.toLowerCase().endsWith(".jpeg")
                      ) {
                        setUploadStatus("Bild erkannt. OCR startet...");
                        if (file) analyzeImage(file);
                      } else {
                        setUploadStatus("Dateiformat erkannt.");
                      }
                    }}
                  />
                </label>

                {uploadedFile && (
                  <p className="text-emerald-400 mt-3 font-bold break-words">
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
                    className="mt-2 bg-cyan-400 text-white px-6 py-4 rounded-2xl font-black"
                  >
                    Analyse starten
                  </button>
                )}

                {analysisResult && (
                  <div className="mt-3 bg-gray-100 border border-cyan-400/30 rounded-2xl p-5 text-white font-bold whitespace-pre-line">
                    {analysisResult}
                  </div>
                )}
              </Panel>
            </div>

            
            <div className={financeSection === "manual" ? "block pt-6" : "hidden"}>
              <Panel isLightMode={isLightMode} title="Ausgaben & Verträge">
                <p className="text-white mt-3">
                  Trage dein monatliches Einkommen und deine bisherigen Ausgaben manuell ein, falls nichts aus einer Datei erkannt wurde.
                </p>

                <div className="grid gap-1 mt-2">
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <p className="text-sm font-bold text-gray-300">
                        Monatliches Einkommen
                      </p>

                      {manualSaved && incomeInput && (
                        <span className="text-emerald-400 text-lg">✅</span>
                      )}
                    </div>
                    <input
                      type="number"
                      value={incomeInput}
                      onChange={(e) => { setIncomeInput(e.target.value); setManualSaved(false); }}
                      placeholder="z.B. 3200"
                      className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 outline-none text-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <p className="text-sm font-bold text-gray-300">
                        Bisherige Ausgaben
                      </p>

                      {manualSaved && expenseInput && (
                        <span className="text-emerald-400 text-lg">✅</span>
                      )}
                    </div>
                    <input
                      type="number"
                      value={expenseInput}
                      onChange={(e) => { setExpenseInput(e.target.value); setManualSaved(false); }}
                      placeholder="z.B. 840"
                      className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 outline-none text-white"
                    />
                  </div>
                </div>


                <div className="mt-2 rounded-[28px] border border-gray-200 bg-gray-100 p-5">
                  <h3 className="text-xl font-black text-black">
                    Eigene Ausgaben
                  </h3>

                  <p className="mt-2 text-black">
                    Trage regelmäßige oder einmalige Kosten ein, z.B. Handy, Versicherungen, Miete oder Abos.
                  </p>

                  <div className="grid gap-4 mt-3">
                    <input
                      value={manualExpenseName}
                      onChange={(e) => {
                        setManualExpenseName(e.target.value);
                        const detected = detectSmartContract(e.target.value);
                        if (detected) {
                          setManualExpenseCategory(detected.category);
                          setManualExpenseRecurring(detected.recurring);
                          setManualExpenseInterval(detected.interval);
                        }
                      }}
                      placeholder="z.B. Netflix, Vodafone, Allianz, Miete"
                      className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-black placeholder:text-gray-500 outline-none focus:border-emerald-400"
                    />

                    {detectSmartContract(manualExpenseName) && (
                      <div className="rounded-2xl bg-emerald-400/15 border border-emerald-400/30 p-4">
                        <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>
                          AI Erkennung
                        </p>
                        <p className="text-black mt-1">
                          {detectSmartContract(manualExpenseName)?.hint} · Kategorie wird automatisch gesetzt.
                        </p>
                      </div>
                    )}

                    <select
                      value={manualExpenseCategory}
                      onChange={(e) => setManualExpenseCategory(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-black outline-none focus:border-emerald-400"
                    >
                      <option>Handy</option>
                      <option>Versicherung</option>
                      <option>Miete/Abtrag</option>
                      <option>Strom</option>
                      <option>Internet</option>
                      <option>Streaming</option>
                      <option>Fitness</option>
                      <option>Auto</option>
                      <option>Lebensmittel</option>
                      <option>Shopping</option>
                      <option>Kosmetik</option>
                      <option>Tanken</option>
                      <option>KFZ-Steuer</option>
                      <option>Abfallgebühren</option>
                      <option>Restaurant</option>
                      <option>Urlaub</option>
                      <option>Sonstiges</option>
                    </select>

                    <input
                      value={manualExpenseAmount}
                      onChange={(e) => setManualExpenseAmount(e.target.value)}
                      placeholder="Betrag pro Monat, z.B. 39,99"
                      inputMode="decimal"
                      className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-black placeholder:text-gray-500 outline-none focus:border-emerald-400"
                    />

                    <select
                      value={manualExpenseInterval}
                      onChange={(e) => {
                        setManualExpenseInterval(e.target.value);
                        setManualExpenseRecurring(e.target.value !== "einmalig");
                      }}
                      className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-black outline-none focus:border-emerald-400"
                    >
                      <option value="monatlich">Monatlich</option>
                      <option value="jährlich">Jährlich</option>
                      <option value="vierteljährlich">Vierteljährlich</option>
                      <option value="einmalig">Einmalig</option>
                    </select>

                    <label className="flex items-center gap-1 text-black font-bold">
                      <input
                        type="checkbox"
                        checked={manualExpenseRecurring}
                        onChange={(e) => {
                          setManualExpenseRecurring(e.target.checked);
                          if (!e.target.checked) setManualExpenseInterval("einmalig");
                          if (e.target.checked && manualExpenseInterval === "einmalig") setManualExpenseInterval("monatlich");
                        }}
                      />
                      Als Fixkosten / Vertrag berücksichtigen
                    </label>

                    <button
                      type="button"
                      onClick={addManualExpense}
                      className="w-full bg-emerald-400 text-black rounded-2xl p-4 font-black active:scale-[0.98] transition-all"
                    >
                      Ausgabe hinzufügen
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1 mt-3">
                    <div className="rounded-2xl bg-white p-4 border border-gray-200">
                      <p className="text-black font-bold">Eigene Ausgaben</p>
                      <p className="text-xl font-black text-red-400 mt-2">
                        {manualExpenseTotal.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4 border border-gray-200">
                      <p className="text-black font-bold">Fixkostenquote</p>
                      <p className="text-xl font-black text-cyan-400 mt-2">
                        {fixedCostRatio}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl bg-white border border-gray-200 p-4">
                    <p className="font-black text-black">AI Einschätzung</p>
                    <p className="text-black mt-2">
                      {manualExpenseInsight}
                    </p>
                  </div>

                  <div className="space-y-1 mt-3">
                    {manualExpenses.length === 0 && (
                      <p className="text-black">
                        Noch keine eigenen Ausgaben eingetragen.
                      </p>
                    )}

                    {manualExpenses.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-1 rounded-2xl bg-white border border-gray-200 p-4">
                        <div>
                          <p className={isLightMode ? "font-black text-black" : "font-black text-white"}>{item.name}</p>
                          <p className="text-sm text-black">
                            {item.category} · {item.interval || (item.recurring ? "monatlich" : "einmalig")}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-black text-red-400">
                            {Math.abs(item.amount).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                          </p>

                          <button
                            type="button"
                            onClick={() => deleteManualExpense(item.id)}
                            className="text-xs font-black text-black underline mt-1"
                          >
                            Löschen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>


              </Panel>
            </div>

            <div className={financeSection === "pdf" ? "block pt-6" : "hidden"}>
              <Panel isLightMode={isLightMode} title="PDF-Report">
                <p className="text-white mt-3">
                  Erstelle einen professionellen Finanzreport.
                </p>

                <button
                  onClick={createPdf}
                  className="mt-2 bg-white text-white px-6 py-4 rounded-2xl font-black"
                >
                  PDF erstellen
                </button>
              </Panel>
            </div>
          </div>
        )}

      </div>

      
      {showIntro && !showAppSplash && (
        <div className="fixed inset-0 z-[99999] bg-[#050816] flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-[#111827] border border-white/10 rounded-[36px] p-7 shadow-2xl text-center animate-[fadeIn_0.35s_ease-out] shadow-emerald-400/10">
            <div className="text-6xl mb-4">
              {["💸", "🏠", "📊", "🤖", "📄", "🎯", "⚙️"][introStep]}
            </div>

            <p className="text-emerald-300 text-xs font-black tracking-[0.25em] uppercase mb-3">
              Schritt {introStep + 1} von 7
            </p>

            <h2 className="text-3xl font-black text-white leading-tight mt-6">
              {[
                "Willkommen bei SaveWise AI",
                "Startseite",
                "Analyse",
                "AI Assistent",
                "Report",
                "Budget & Sparziel",
                "Einstellungen"
              ][introStep]}
            </h2>

            <p className="text-white mt-3 text-base leading-relaxed">
              {[
                "Dein Finanzdashboard für Budget, Sparen und KI-gestützte Auswertung.",
                "Hier siehst du deine wichtigsten Werte: Sparen, Score, Kategorie, Einkommen und Ausgaben.",
                "Hier findest du Smart Insights, Transaktionen und automatische Auswertungen.",
                "Stelle Fragen zu Budget, Ausgaben, Sparscore oder Sparpotenzial.",
                "Lade Dateien hoch, trage Daten manuell ein oder erstelle einen PDF-Report.",
                "Setze Limits, verfolge Ziele und erkenne deinen Fortschritt.",
                "Wechsle den Modus, exportiere Daten oder setze die App zurück."
              ][introStep]}
            </p>

            <div className="mt-2 rounded-3xl bg-white/5 border border-white/10 p-4">
              {introStep === 0 && (
                <div className="grid grid-cols-3 gap-1">
                  <div className="rounded-2xl bg-emerald-400/20 p-3">
                    <p className="text-xs text-emerald-300 font-black">SPAREN</p>
                    <p className="text-white font-black mt-2">155€</p>
                  </div>
                  <div className="rounded-2xl bg-cyan-400/20 p-3">
                    <p className="text-xs text-cyan-300 font-black">SCORE</p>
                    <p className="text-white font-black mt-2">5/100</p>
                  </div>
                  <div className="rounded-2xl bg-purple-400/20 p-3">
                    <p className="text-xs text-purple-300 font-black">KI</p>
                    <p className="text-white font-black mt-2">Insight</p>
                  </div>
                </div>
              )}

              {introStep === 1 && (
                <div className="grid grid-cols-2 gap-1 text-left">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>Einkommen</p>
                    <p className="text-emerald-300 font-black mt-2">3.743€</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>Ausgaben</p>
                    <p className="text-red-300 font-black mt-2">1.577€</p>
                  </div>
                </div>
              )}

              {introStep === 2 && (
                <div className="grid gap-1 text-left">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>Smart Insights</p>
                    <p className="text-gray-300 text-sm mt-1">Empfehlungen & Trends</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>Transaktionen</p>
                    <p className="text-gray-300 text-sm mt-1">Buchungen prüfen</p>
                  </div>
                </div>
              )}

              {introStep === 3 && (
                <div className="rounded-2xl bg-white/10 p-4 text-left">
                  <p className="text-emerald-300 font-black">Beispielfrage</p>
                  <p className="text-white mt-2">„Wie kann ich diesen Monat mehr sparen?“</p>
                </div>
              )}

              {introStep === 4 && (
                <div className="grid gap-1 text-left">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>Kontoauszüge & Uploads</p>
                    <p className="text-gray-300 text-sm mt-1">PDF, CSV oder Screenshot</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>PDF-Report</p>
                    <p className="text-gray-300 text-sm mt-1">Finanzreport erstellen</p>
                  </div>
                </div>
              )}

              {introStep === 5 && (
                <div className="rounded-2xl bg-white/10 p-4 text-left">
                  <p className="text-white font-black mt-6">Sparziel Urlaub</p>
                  <div className="mt-3 h-3 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-[35%] bg-emerald-400 rounded-full" />
                  </div>
                  <p className="text-emerald-300 font-black mt-3">35% erreicht</p>
                </div>
              )}

              {introStep === 6 && (
                <div className="grid gap-1 text-left">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>Modus wechseln</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>Daten exportieren</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>App zurücksetzen</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-1 mt-7">
              {[0,1,2,3,4,5,6].map((i) => (
                <div
                  key={i}
                  className={
                    "h-2 rounded-full transition-all " +
                    (introStep === i ? "w-9 bg-emerald-400" : "w-2 bg-white/20")
                  }
                />
              ))}
            </div>

            <div className="flex gap-1 mt-2">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("savewise_intro_seen", "true");
                  setShowIntro(false);
                  setIntroStep(0);
                }}
                className="flex-1 bg-white/10 text-white rounded-2xl py-4 font-black active:scale-[0.98] transition-all"
              >
                Überspringen
              </button>
      <button
        type="button"
        className="flex h-12 w-12 items-center justify-center text-emerald-300"
      >
        ✨
      </button>

              <button
                type="button"
                onClick={() => {
                  if (introStep < 6) {
                    setIntroStep(introStep + 1);
                  } else {
                    localStorage.setItem("savewise_intro_seen", "true");
                    setShowIntro(false);
                    setIntroStep(0);
                  }
                }}
                className="flex-1 bg-emerald-400 text-black rounded-2xl py-4 font-black active:scale-[0.98] transition-all savewise-glow"
              >
                {introStep < 6 ? "Weiter" : "Loslegen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showScoreInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[99999] flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-[34px] p-8 shadow-2xl text-black">
            <h2 className="text-4xl font-black text-black">
              Finanzscore
            </h2>

            <p className="mt-3 text-black leading-relaxed">
              Der Finanzscore kombiniert deine finanzielle Gesamtsituation mit deiner aktuellen Sparquote.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className={isLightMode ? "rounded-2xl bg-white border border-gray-200 p-4 shadow-sm" : "rounded-2xl bg-white/[0.055] border border-white/10 p-4"}>
                <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>Score</p>
                <p className="mt-3 text-3xl font-black text-emerald-400">
                  {savingScore}/100
                </p>
                <p className="mt-2 text-sm text-black">
                  Bewertet Budget, Ausgaben, Risiken und finanzielle Stabilität.
                </p>
              </div>

              <div className={isLightMode ? "rounded-2xl bg-white border border-gray-200 p-4 shadow-sm" : "rounded-2xl bg-white/[0.055] border border-white/10 p-4"}>
                <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>Sparquote</p>
                <p className="mt-3 text-3xl font-black text-purple-400">
                  {savingsRate}%
                </p>
                <p className="mt-2 text-sm text-black">
                  Zeigt, wie viel Prozent deines Einkommens nach Ausgaben übrig bleibt.
                </p>
              </div>
            </div>

            <div className="mt-2 rounded-2xl bg-emerald-400/15 border border-emerald-400/30 p-4">
              <p className="font-black text-black">
                Deine aktuelle Einschätzung
              </p>

              <p className="mt-2 text-black leading-relaxed">
                {savingsRate >= 25
                  ? "Sehr stark: Deine Sparquote ist gesund und dein finanzieller Spielraum ist gut."
                  : savingsRate >= 10
                  ? "Solide: Du sparst bereits etwas, könntest aber einzelne Ausgaben weiter optimieren."
                  : "Achtung: Deine Sparquote ist niedrig. Prüfe Fixkosten, Abos und variable Ausgaben."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowScoreInfo(false)}
              className="w-full mt-2 bg-black text-white rounded-2xl p-4 font-black active:scale-[0.98] transition-all"
            >
              Verstanden
            </button>
          </div>
        </div>
      )}

     {showSettings && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-6">
    <div className="w-full max-w-lg bg-white border border-gray-200 rounded-[34px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-4xl font-black text-black">
        Einstellungen
      </h2>

      <p className="text-black mt-3">
        Verwalte deine App-Daten und Optionen.
      </p>

      <div className="mt-2 rounded-3xl bg-white/[0.045] border border-white/10 p-5">
        <p className={isLightMode ? "text-black font-black" : "text-white font-black"}>
          Echte AI optional
        </p>

        <p className="text-black text-sm mt-2 leading-relaxed">
          Ohne Key nutzt SaveWise lokale Datenlogik. Mit kostenlosem OpenRouter-Key kann der Fragenbereich ein echtes AI-Modell nutzen.
        </p>

        <input
          value={aiApiKey}
          onChange={(e) => {
            setAiApiKey(e.target.value);
            localStorage.setItem("savewise_ai_api_key", e.target.value);
          }}
          placeholder="Optionaler OpenRouter API-Key"
          className="w-full mt-3 bg-white border border-gray-300 rounded-2xl p-4 text-black placeholder:text-gray-500 outline-none focus:border-emerald-400"
        />
      </div>

      <div className="space-y-1.5 mt-0">
        <button
          type="button"
          onClick={resetAllData}
          className="w-full bg-red-400 text-white rounded-2xl p-4 font-black active:scale-[0.98] transition-all duration-300"
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
          className="w-full bg-yellow-400 text-white rounded-2xl p-4 font-black active:scale-[0.98] transition-all duration-300"
        >
          Nur Budget zurücksetzen
        </button>

        <button
          type="button"
          onClick={exportData}
          className="w-full bg-cyan-400 text-white rounded-2xl p-4 font-black active:scale-[0.98] transition-all duration-300"
        >
          Daten exportieren
        </button>

        <button
          type="button"
          onClick={() => setIsLightMode(!isLightMode)}
          className="w-full bg-gray-200 text-black rounded-2xl p-4 font-black active:scale-[0.98] transition-all duration-300"
        >
          {isLightMode ? "Dark Mode aktivieren" : "Light Mode aktivieren"}
        </button>

        <button
          type="button"
          onClick={() => {
            setIntroStep(0);
            setShowIntro(true);
          }}
          className="w-full bg-emerald-400 text-black rounded-3xl p-4 font-black active:scale-[0.98] transition-all duration-300"
        >
          Einführung erneut ansehen
        </button>

        <button
          type="button"
          onClick={() => setShowSettings(false)}
          className="w-full bg-black text-white rounded-2xl p-4 font-black active:scale-[0.98] transition-all duration-300"
        >
          Schließen
        </button>
      </div>
    </div>
  </div>
)}

      {isAiHubOpen && (
        <div className="fixed left-4 right-4 bottom-32 z-[9998] rounded-[34px] bg-[#101522]/95 border border-emerald-400/20 p-5 shadow-[0_0_80px_rgba(16,185,129,0.35)] backdrop-blur-xl">

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-white text-xl font-black">
                Frage SaveWise AI
              </p>

              <p className="text-white/50 text-sm mt-1">
                Nutzt deine echten Finanzdaten lokal.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAiHubOpen(false)}
              className="w-11 h-11 rounded-2xl bg-white/10 text-white font-black"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1 mt-3">
            {[
              "Wo kann ich sparen?",
              "Wie hoch sind meine Fixkosten?",
              "Warum ist mein Score so?",
              "Kann ich mir Urlaub leisten?"
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => askQuickAI(q)}
                className="rounded-2xl bg-white/10 border border-white/10 p-3 text-white text-sm font-bold"
              >
                {q.replace("?", "")}
              </button>
            ))}
          </div>

          <div className="flex gap-1 mt-3">
            <input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="z.B. Wo kann ich sparen?"
              className="flex-1 bg-white text-black border border-white/20 rounded-2xl px-4 py-4 placeholder:text-gray-500 outline-none"
            />

            <button
              type="button"
              onClick={askAI}
              className="bg-emerald-400 text-black rounded-2xl px-5 font-black"
            >
              Fragen
            </button>
          </div>

          <div className="mt-3 rounded-2xl bg-black/20 border border-white/10 p-4 max-h-40 overflow-y-auto">
            <p className="text-emerald-300 text-xs font-black uppercase tracking-[0.18em]">
              Antwort
            </p>

            <p className="text-white/85 mt-3 leading-relaxed">
              {chatReply}
            </p>
          </div>
        </div>
      )}

      <div className="fixed left-1/2 bottom-3 z-[9999] -translate-x-1/2 rounded-full border border-white/10 bg-black/85 px-7 py-2.5 shadow-2xl backdrop-blur-2xl flex items-center gap-8">
        <NavButton active={activeTab === "home"} onClick={() => { setShowSettings(false); setActiveTab("home"); }}>
          <Home size={28} />
        </NavButton>

        <NavButton active={activeTab === "finance"} onClick={() => { setShowSettings(false); setActiveTab("finance"); }}>
          <FileText size={28} />
        </NavButton>

        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className={showSettings ? "text-emerald-400" : "text-gray-300"}
        >
          <Settings size={28} />
        </button>
        <button
          type="button"
          onClick={() => setIsAiHubOpen((open) => !open)}
          className="w-11 h-11 rounded-full flex items-center justify-center text-2xl active:scale-95 transition-all"
          aria-label="SaveWise AI öffnen"
        >
          ✨
        </button>

      </div>
    </main>
    </>
  );
}

function Header(props: {
  monthlySavings: number;
  savingScore: number;
  topCategory: string;
  onScoreClick?: () => void;
  onSavingsClick?: () => void;
}) {
  return null;
}

function Card(props: {
  title: string;
  value: string;
  color: string;
  note?: string;
  isLightMode?: boolean;
  onClick?: () => void;
}) {
  const isAI = props.title === "KI Insight";

  return (
    <button
      type="button"
      onClick={props.onClick}
      className={
        "relative text-left w-full overflow-hidden min-h-[118px] rounded-[30px] border p-5 backdrop-blur-2xl shadow-2xl transition-all duration-300 active:scale-[0.98] " +
        (props.onClick ? "cursor-pointer " : "") +
        (isAI
          ? "border-cyan-400/40 bg-cyan-400/20 shadow-cyan-400/20"
          : "border-white/10 bg-white/5 shadow-black/30")
      }
    >
      {isAI && (
        <>
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-4 right-5 text-5xl opacity-10">✦</div>
        </>
      )}

      <div className="relative">
        <p className={isAI ? "text-sm font-bold text-cyan-300" : "text-sm font-medium text-white"}>
          {props.title}
        </p>

        <h2 className={`mt-3 text-xl font-black leading-tight ${props.color}`}>
          {props.value}
        </h2>

        {isAI && (
          <p className={props.isLightMode ? "mt-3 text-xs leading-relaxed text-slate-700" : "mt-3 text-xs leading-relaxed text-cyan-100/80"}>
            {props.note || "Automatisch aus deinen aktuellen Finanzdaten erkannt."}
          </p>
        )}
      </div>
    </button>
  );
}

function Panel(props: {
  title: string;
  children: React.ReactNode;
  isLightMode?: boolean;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[34px] p-7 backdrop-blur-2xl shadow-2xl shadow-black/30">
      <h2
        className={
          props.isLightMode ? "text-2xl font-black text-white" : "text-2xl font-black text-white"
        }
      >
        {props.title}
      </h2>
      {props.children}
    </div>
  );
}

function Mini(props: { title: string; value: string; color: string }) {
  return (
    <div className="bg-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center min-h-[118px] overflow-hidden">
      <p className="text-gray-300">{props.title}</p>
      <p className={`text-base font-black mt-1 ${props.color}`}>{props.value}</p>
    </div>
  );
}

function Info(props: { color: string; title: string; text: string }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-400/25 border-emerald-400/30 text-emerald-400",
    cyan: "bg-cyan-400/25 border-cyan-400/30 text-cyan-400",
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
    emerald: "bg-emerald-400/25 border-emerald-400/30 text-emerald-400"
  };

  return (
    <div className={`mt-2 border rounded-2xl p-4 ${styles[props.color]}`}>
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
      className={props.active ? "text-emerald-400" : "text-gray-300"}
    >
      {props.children}
    </button>
  );
}


