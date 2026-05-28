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
  const [reportSection, setReportSection] = useState("menu");
  const [showSettings, setShowSettings] = useState(false);
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
  const [monthlySavings, setMonthlySavings] = useState(120);
  const [monthlyBudget, setMonthlyBudget] = useState(1200);
  const [budgetInput, setBudgetInput] = useState("1200");
  const [spentThisMonth, setSpentThisMonth] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [incomeInput, setIncomeInput] = useState("");
  const [expenseInput, setExpenseInput] = useState("");
  const [manualSaved, setManualSaved] = useState(false);
  const [topCategory, setTopCategory] = useState("Streaming");
  const [history, setHistory] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions);

  const [chatMessage, setChatMessage] = useState("");
  const [chatReply, setChatReply] = useState("Hallo 👋 Ich bin dein AI Finanzassistent.");
const [savingGoal, setSavingGoal] = useState("");
const [goalAmount, setGoalAmount] = useState(0);
const [savedAmount, setSavedAmount] = useState(0);

  useEffect(() => {
    const cleaned = localStorage.getItem("savewise_force_clean");

    if (!cleaned) {
      localStorage.removeItem("savewise_data");
      localStorage.removeItem("savewise_transactions");
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
      `Dein Monatsbudget liegt bei ${monthlyBudget.toFixed(2).replace(".", ",")}€. Davon hast du bereits ${spentThisMonth.toFixed(2).replace(".", ",")}€ genutzt. Übrig vom Ausgabenlimit sind ${(monthlyBudget - spentThisMonth).toFixed(2).replace(".", ",")}€.`
    );

  } else if (text.includes("sparen") || text.includes("300")) {
    setChatReply(
      `Aktuell liegt dein Sparen bei ca. ${monthlySavings}€. Um mehr zu sparen, prüfe zuerst ${topCategory}, Abos und spontane Ausgaben.`
    );

  } else if (text.includes("abo") || text.includes("streaming")) {
    setChatReply(
      `Bei Streaming und Abos solltest du prüfen, welche Dienste du wirklich nutzt. Kleine monatliche Beträge senken oft unbemerkt deinen Sparscore.`
    );

  } else {
    setChatReply(
      `Ich sehe aktuell einen Sparscore von ${savingScore}/100 und analysiere deine Budget- und Ausgabedaten.`
    );
  }

  setChatMessage("");
}, 900);
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
      "Automatische AI Finanzanalyse durchgeführt",
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
  localStorage.removeItem("savewise_data");
  localStorage.setItem("savewise_budget", "1200");

  setSavingScore(0);
  setMonthlySavings(0);
  setMonthlyBudget(1200);
  setBudgetInput("1200");

  setMonthlyIncome(0);
setIncomeInput("");

setSpentThisMonth(0);

  setSpentThisMonth(0);
  setTopCategory("Streaming");
  setHistory([]);
  setTransactions(defaultTransactions);
  setUploadedFile("");
  setUploadStatus("");
  setAnalysisResult("");
  setShowSettings(false);
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
      text: "Dein intelligentes Premium-Finanzdashboard für Budget, Sparziele und KI-gestützte Finanzanalyse."
    },
    {
      title: "Behalte alles im Blick",
      text: "Analysiere Einnahmen, Ausgaben, Sparquote, Monatsbudget und Finanztrend in einer modernen App-Ansicht."
    },
    {
      title: "Setze smarte Sparziele",
      text: "Lege Ziele fest, verfolge deinen Fortschritt und erkenne sofort, wie viel dir noch fehlt."
    },
    {
      title: "KI unterstützt dich",
      text: "SaveWise AI gibt dir Spartipps, erkennt Risiken und hilft dir, bessere finanzielle Entscheidungen zu treffen."
    }
  ];

  useEffect(() => {
    document.body.style.overflow = showSettings || showIntro ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSettings, showIntro]);

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

  const spendingRatio =
    monthlyBudget > 0 ? Math.round((spentThisMonth / monthlyBudget) * 100) : 0;

  const savingsRate =
    monthlyIncome > 0 ? Math.max(0, Math.round(((monthlyIncome - spentThisMonth) / monthlyIncome) * 100)) : 0;

  const aiInsight =
    transactions.length === 0
      ? "Daten hochladen"
      : spentThisMonth > monthlyBudget
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
      ? "Potenzial erkannt"
      : "Finanzen stabil";

  const aiRecommendation =
    transactions.length === 0
      ? "Lade einen Kontoauszug hoch, damit SaveWise echte Muster erkennt."
      : spentThisMonth > monthlyBudget
      ? "Du liegst über deinem Monatsbudget. Prüfe zuerst flexible Ausgaben."
      : savingsRate >= 30
      ? "Sehr gut: Deine Sparquote ist stark. Halte diesen Kurs."
      : topCategory === "Streaming"
      ? "Prüfe Abos, Testphasen und doppelte Streaming-Dienste."
      : topCategory === "Shopping"
      ? "Setze ein Wochenlimit für spontane Käufe."
      : topCategory === "Essen"
      ? "Plane 2–3 Mahlzeiten vor, um Ausgaben zu glätten."
      : "Deine Daten zeigen Sparpotenzial bei variablen Ausgaben.";

  return (
    <>

      <style>{`
        .savewise-light-fix p,
        .savewise-light-fix h1,
        .savewise-light-fix h2,
        .savewise-light-fix h3,
        .savewise-light-fix button p {
          color: #000000 !important;
        }

        .savewise-light-fix .text-emerald-400 {
          color: #10b981 !important;
        }

        .savewise-light-fix .text-red-400 {
          color: #f87171 !important;
        }

        .savewise-light-fix .text-yellow-400 {
          color: #eab308 !important;
        }

        .savewise-light-fix .text-purple-400 {
          color: #c084fc !important;
        }

        .savewise-light-fix .text-cyan-400,
        .savewise-light-fix .text-cyan-300 {
          color: #06b6d4 !important;
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

          <h1 className="mt-8 text-4xl font-black text-white tracking-wide">
            SaveWise
          </h1>

          <p className="mt-2 text-emerald-300 font-bold tracking-widest text-sm">
            AI FINANCE DASHBOARD
          </p>



          <p className="mt-4 text-white text-sm">
            Lade Premium Dashboard...
          </p>
        </div>
      )}

      <main
  className={
    "min-h-screen p-6 pb-32 " +
    (isLightMode
      ? "bg-gray-100 text-white"
      : "bg-[#050816] text-white")
  }
>
      <div className="max-w-5xl mx-auto space-y-1">
        {homeSection === "overview" && activeTab === "home" && <Header monthlySavings={monthlySavings} savingScore={savingScore} topCategory={topCategory} />}

        {activeTab === "home" && (
          <div className="space-y-6 mt-6">
            {homeSection === "overview" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card isLightMode={isLightMode} title="Einkommen" value={monthlyIncome > 0 ? monthlyIncome.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€" : "—"} color="text-emerald-400" />
              <Card isLightMode={isLightMode} title="Ausgaben" value={spentThisMonth > 0 ? spentThisMonth.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€" : "—"} color="text-red-400" />
              <Card isLightMode={isLightMode}
                title="Übrig"
                value={
                  Number.isFinite(monthlyIncome) && Number.isFinite(spentThisMonth) && monthlyIncome > 0
                    ? (monthlyIncome - spentThisMonth).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€"
                    : "—"
                }
                color="text-yellow-400"
              />
              <Card isLightMode={isLightMode}
                title="KI Insight"
                value={aiInsight}
                color="text-cyan-400"
                note={aiRecommendation}
              />
              <Card isLightMode={isLightMode} title="Sparquote" value={transactions.length > 0 && monthlyIncome > 0 ? Math.max(0, Math.round(((monthlyIncome - spentThisMonth) / monthlyIncome) * 100)) + "%" : "—"} color="text-purple-400" />
            </div>
            )}


            {homeSection === "overview" && (
<div id="home-menu" className="grid gap-4">
  {[
    {
      key: "overview",
      label: "Übersicht",
      text: "Alle wichtigen Finanzdaten auf einen Blick"
    },
    {
      key: "compare",
      label: "Monatsvergleich",
      text: "Vergleiche Einnahmen, Ausgaben und Sparquote"
    },
    {
      key: "goal",
      label: "Sparziel",
      text: "Verfolge dein aktuelles Sparziel"
    },
    {
      key: "budget",
      label: "Monatsbudget",
      text: "Kontrolliere dein monatliches Ausgabenlimit"
    },
    {
      key: "trend",
      label: "Finanztrend",
      text: "Analysiere deine finanzielle Entwicklung"
    }
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
        "relative overflow-hidden rounded-[28px] border p-4 text-left transition-all duration-300 active:scale-[0.98] shadow-xl " +
        (homeSection === item.key
          ? "bg-emerald-400 text-black border-emerald-300 shadow-2xl shadow-emerald-400/25"
          : isLightMode ? "bg-white/80 text-black border-gray-200 shadow-black/10" : "bg-white/5 text-white border-white/10 shadow-black/20")
      }
    >
      <p
        className={
          homeSection === item.key
            ? "text-xl font-black text-black"
            : isLightMode
            ? "text-xl font-black text-black"
            : isLightMode ? "text-xl font-black text-black" : "text-xl font-black text-white"
        }
      >
        {item.label}
      </p>

      <p className={
        homeSection === item.key
          ? "mt-2 text-white"
          : isLightMode ? "mt-1 text-black" : "mt-1 text-gray-300"
      }>
        {item.text}
      </p>
    </button>
  ))}
</div>
)}

            {homeSection !== "overview" && (
              <div className="fixed top-6 left-0 right-0 z-[9999] px-6">
                <button
                  type="button"
                  onClick={() => {
                    setHomeSection("overview");
                    setTimeout(() => {
                      const menu = document.getElementById("home-menu");
                      if (menu) {
                        const y = menu.getBoundingClientRect().top + window.scrollY - 10;
                        window.scrollTo({ top: y, behavior: "auto" });
                      }
                    }, 50);
                  }}
                  className="bg-[#1f1f24] text-white px-6 py-4 rounded-[24px] font-black shadow-2xl"
                >
                  <span className="text-white"><span className="text-white">← Zurück zur Übersicht</span></span>
                </button>
              </div>
            )}

            <div className={homeSection === "overview" ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 gap-4 pt-28"}>

              <div className={homeSection === "compare" ? "block" : "hidden"}>
              <Panel isLightMode={isLightMode} title="Monatsvergleich">
                <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                  <Mini title="Einnahmen" value={monthlyIncome > 0 ? monthlyIncome.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€" : "—"} color="text-emerald-400" />
                  <Mini title="Ausgaben" value={transactions.length > 0 ? spentThisMonth.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€" : "—"} color="text-red-400" />
                  <Mini title="Sparquote" value={Math.max(0, Math.round(((monthlyIncome - spentThisMonth) / monthlyIncome) * 100)) + "%"} color="text-purple-400" />
                </div>

                <div className="mt-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-[28px] p-6 text-white">
                  <p className="font-black text-xl">
                    {spentThisMonth < 1200
                      ? "Sehr guter Monat"
                      : spentThisMonth < 2200
                        ? "Stabiler Monat"
                        : "Achtung: hohe Ausgaben"}
                  </p>

                  <p className="mt-2 text-white">
                    Deine aktuelle Sparquote liegt bei {Math.max(0, Math.round(((monthlyIncome - spentThisMonth) / 3200) * 100))}%.
                  </p>
                </div>
              </Panel>
              </div>

<div className={homeSection === "goal" ? "block" : "hidden"}>
<Panel isLightMode={isLightMode} title="Sparziel">
  <div className="grid gap-5 mt-6">
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
</div>
              <div className={homeSection === "budget" ? "block" : "hidden"}>
              <Panel isLightMode={isLightMode} title="Monatsbudget">
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

                <p className="text-white mt-6">Ausgabenlimit: {monthlyBudget}€</p>
                <p className="text-white mt-2">Ausgegeben: {spentThisMonth}€</p>

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
              </div>


            </div>

            
            <div className={homeSection === "trend" ? "block" : "hidden"}>
            <Panel isLightMode={isLightMode} title="Finanztrend">
              <div className="h-72 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Jan", ausgaben: 980, sparen: 420 },
                      { name: "Feb", ausgaben: 1120, sparen: 360 },
                      { name: "Mär", ausgaben: 870, sparen: 520 },
                      { name: "Apr", ausgaben: spentThisMonth, sparen: Math.max(0, monthlyIncome - spentThisMonth) }
                    ]}
                  >
                    <XAxis dataKey="name" />
                    <Tooltip />
                    <Bar dataKey="ausgaben" radius={[12, 12, 0, 0]} />
                    <Bar dataKey="sparen" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="text-gray-600 mt-4">
                Deine aktuelle Finanzentwicklung wird automatisch mit deinem Monatsbudget verglichen.
              </p>
            </Panel>
            </div>

            <div className={homeSection === "overview" ? "block" : "hidden"}>
            
            </div>
          </div>
        )}

        {activeTab === "analyse" && (
          <>
            {analyseSection === "menu" && <Header monthlySavings={monthlySavings} savingScore={savingScore} topCategory={topCategory} />}
          <div className="space-y-6 mt-6">

            {analyseSection === "menu" && (
              <div className="grid gap-4">
                {[
                  { key: "assistant", label: "AI Finanzassistent", text: "Stelle Fragen zu deinen Finanzen" },
                  { key: "smart", label: "Smart Insights", text: "Empfehlungen, Sparen, Fixkosten und Trends" },
                  { key: "transactions", label: "Transaktionen", text: "Aktuelle Buchungen prüfen" }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setAnalyseSection(item.key)}
                    className="rounded-[28px] border p-6 text-left transition-all duration-300 active:scale-[0.98] bg-white/5 text-white border-white/10"
                  >
                    <p className="text-xl font-black">{item.label}</p>
                    <p className={homeSection === item.key ? "mt-1 text-white" : isLightMode ? "mt-1 text-black" : "mt-1 text-gray-300"}>{item.text}</p>
                  </button>
                ))}
              </div>
            )}

            {analyseSection !== "menu" && (
              <div className="fixed top-6 left-0 right-0 z-[9999] px-6">
                <button
                  type="button"
                  onClick={() => {
                    setAnalyseSection("menu");
                    window.scrollTo({ top: 0, behavior: "auto" });
                  }}
                  className="bg-[#1f1f24] text-white px-6 py-4 rounded-[24px] font-black shadow-2xl"
                >
                  <span className="text-white"><span className="text-white">← Zurück zur Analyse</span></span>
                </button>
              </div>
            )}

            <div className={analyseSection === "assistant" ? "block pt-28" : "hidden"}>
            <Panel isLightMode={isLightMode} title="AI Finanzassistent">
              <div className="bg-gray-100 border border-gray-200 rounded-2xl p-5 mt-6">
                <p className="text-white whitespace-pre-line">{chatReply}</p>
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
            </div>

            <div className={analyseSection === "smart" ? "block pt-8" : "hidden"}>
            <Panel isLightMode={isLightMode} title="AI Empfehlungen">
              <div className="space-y-4 mt-6">
                {monthlyIncome <= 0 && spentThisMonth <= 0 && (
                  <Info
                    color="cyan"
                    title="Noch keine Finanzdaten"
                    text="Trage Einkommen und Ausgaben manuell ein oder lade einen Report hoch, damit SaveWise AI persönliche Empfehlungen erstellen kann."
                  />
                )}

                {monthlyIncome > 0 && spentThisMonth > 0 && spentThisMonth / monthlyIncome > 0.8 && (
                  <Info
                    color="red"
                    title="Hohe Ausgaben erkannt"
                    text="Deine Ausgaben liegen über 80% deines Einkommens. Prüfe variable Kosten und setze ein Wochenlimit."
                  />
                )}

                {monthlyIncome > 0 && spentThisMonth > 0 && spentThisMonth / monthlyIncome <= 0.8 && (
                  <Info
                    color="emerald"
                    title="Solide Finanzlage"
                    text="Deine Ausgaben liegen im kontrollierten Bereich. Du kannst den Überschuss gezielt für Sparziele nutzen."
                  />
                )}

                {monthlyBudget > 0 && spentThisMonth > monthlyBudget * 0.9 && (
                  <Info
                    color="yellow"
                    title="Budget fast erreicht"
                    text="Du hast bereits mehr als 90% deines Monatsbudgets verbraucht. Reduziere spontane Ausgaben bis Monatsende."
                  />
                )}

                {transactions.length > 0 && (
                  <Info
                    color="cyan"
                    title="Transaktionen erkannt"
                    text="SaveWise AI analysiert deine Buchungen automatisch für Kategorien, Budget und Sparene."
                  />
                )}

                {transactions.some((t) => t.category === "Lebensmittel") && (
                  <Info
                    color="emerald"
                    title="Lebensmittel-Ausgaben erkannt"
                    text="Prüfe wöchentliche Supermarkt-Ausgaben und vergleiche Preise, um zusätzliches Sparen zu nutzen."
                  />
                )}

                {transactions.some((t) => t.category === "Shopping") && (
                  <Info
                    color="yellow"
                    title="Shopping-Ausgaben erkannt"
                    text="Shopping-Ausgaben wurden erkannt. Ein festes Monatslimit kann helfen, spontane Käufe zu reduzieren."
                  />
                )}

                {transactions.some((t) => t.category === "Streaming & Medien") && (
                  <Info
                    color="cyan"
                    title="Streaming-Abos erkannt"
                    text="Überprüfe aktive Streaming- und Medien-Abos auf ungenutzte Dienste oder doppelte Kosten."
                  />
                )}

                {transactions.some((t) => t.category === "Mobilität") && (
                  <Info
                    color="yellow"
                    title="Mobilitätskosten erkannt"
                    text="Transport- und Mobilitätskosten wurden erkannt. Monatstickets oder Fahrgemeinschaften könnten Kosten senken."
                  />
                )}

                {transactions.some((t) => t.category === "Kredite & Finanzierung") && (
                  <Info
                    color="red"
                    title="Finanzierungs-Kosten erkannt"
                    text="Kredit- oder Finanzierungszahlungen wurden erkannt. Prüfe Zinssätze und mögliche Umschuldungen."
                  />
                )}

                {transactions.some((t) => t.category === "Versicherungen") && (
                  <Info
                    color="cyan"
                    title="Versicherungen erkannt"
                    text="Vergleiche regelmäßig Versicherungsbeiträge und prüfe mögliche Einsparungen."
                  />
                )}

                {transactions.some((t) => t.category === "PayPal / Online") && (
                  <Info
                    color="yellow"
                    title="Onlinezahlungen erkannt"
                    text="Viele kleine Onlinezahlungen können sich summieren. Kontrolliere regelmäßige Abbuchungen besonders aufmerksam."
                  />
                )}

                {transactions.some((t) => t.category === "Wohnen & Fixkosten") && (
                  <Info
                    color="emerald"
                    title="Fixkosten erkannt"
                    text="Fixkosten wurden erkannt. Bereits kleine Einsparungen bei Strom, Gas oder Verträgen können langfristig helfen."
                  />
                )}

                {transactions.filter((t) =>
                  ["Wohnen & Fixkosten", "Versicherungen", "Kredite & Finanzierung", "Streaming & Medien"].includes(t.category)
                ).length >= 3 && (
                  <Info
                    color="red"
                    title="Viele wiederkehrende Kosten erkannt"
                    text="Mehrere Fixkosten oder regelmäßige Zahlungen wurden erkannt. Prüfe Verträge, Raten, Versicherungen und Abos auf Einsparpotenzial."
                  />
                )}

                {transactions
                  .filter((t) => ["Kredite & Finanzierung", "Versicherungen", "Wohnen & Fixkosten"].includes(t.category))
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0) > monthlyIncome * 0.5 && monthlyIncome > 0 && (
                  <Info
                    color="yellow"
                    title="Hohe Fixkostenquote"
                    text="Deine Fixkosten liegen über 50% deines Einkommens. Das reduziert deinen finanziellen Spielraum deutlich."
                  />
                )}
              </div>
            </Panel>
            </div>

            <div className="hidden">
            <Panel isLightMode={isLightMode} title="Monats-Trend">
              <div className="h-64 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={
                    transactions.length > 0
                      ? transactions.map((item, index) => ({ value: Math.abs(item.amount), name: String(index + 1) }))
                      : [{ value: 0 }]
                  }>
                    <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <p className="text-white mt-4">
                {transactions.length > 0 ? "Dein Monats-Trend basiert auf deinen hinterlegten Daten." : "Noch keine Daten vorhanden. Trage Daten manuell ein oder lade eine Datei hoch."}
              </p>
            </Panel>
            </div>

            
            <div className={analyseSection === "smart" ? "block pt-8" : "hidden"}>
            <Panel isLightMode={isLightMode} title="Fixkosten-Analyse">

              {(() => {
                const fixedTransactions = transactions.filter((t) =>
                  ["Wohnen & Fixkosten", "Versicherungen", "Kredite & Finanzierung", "Streaming & Medien"].includes(t.category)
                );

                const fixedCosts = fixedTransactions.reduce(
                  (sum, t) => sum + Math.abs(t.amount),
                  0
                );

                const fixedRatio =
                  monthlyIncome > 0
                    ? Math.round((fixedCosts / monthlyIncome) * 100)
                    : 0;

                return (
                  <>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <Mini
                        title="Fixkosten"
                        value={
                          fixedCosts > 0
                            ? fixedCosts.toLocaleString("de-DE", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              }) + "€"
                            : "—"
                        }
                        color="text-red-400"
                      />

                      <Mini
                        title="Fixkostenquote"
                        value={
                          monthlyIncome > 0
                            ? fixedRatio + "%"
                            : "—"
                        }
                        color="text-yellow-400"
                      />
                    </div>

                    <div className="space-y-3 mt-6">
                      {fixedTransactions.length === 0 && (
                        <Info
                          color="cyan"
                          title="Keine Fixkosten erkannt"
                          text="Noch keine regelmäßigen Kosten erkannt."
                        />
                      )}

                      {fixedTransactions.length > 0 && (
                        <Info
                          color="emerald"
                          title="Wiederkehrende Kosten erkannt"
                          text={fixedTransactions.length + " regelmäßige Zahlungen wurden erkannt."}
                        />
                      )}

                      {fixedRatio >= 50 && (
                        <Info
                          color="red"
                          title="Hohe Fixkostenquote"
                          text="Mehr als 50% deines Einkommens gehen für Fixkosten drauf."
                        />
                      )}

                      {fixedRatio > 0 && fixedRatio < 50 && (
                        <Info
                          color="emerald"
                          title="Fixkosten im gesunden Bereich"
                          text="Deine Fixkostenquote liegt aktuell im stabilen Bereich."
                        />
                      )}
                    </div>

                    <div className="mt-6 bg-gray-100 rounded-3xl p-5">
                      <p className="text-gray-300 font-bold mb-3">
                        Erkannte Kategorien
                      </p>

                      <div className="flex flex-wrap gap-3">
                        {[...new Set(fixedTransactions.map((t) => t.category))].map((cat, index) => (
                          <div
                            key={index}
                            className="bg-white border border-gray-200 px-4 py-2 rounded-2xl text-sm font-bold"
                          >
                            {cat}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}

            </Panel>
            </div>



            <div className={analyseSection === "smart" ? "block pt-8" : "hidden"}>
            <Panel isLightMode={isLightMode} title="Sparen">

              {(() => {
                const shopping = transactions.filter((t) => t.category === "Shopping").reduce((s, t) => s + Math.abs(t.amount), 0);
                const streaming = transactions.filter((t) => t.category === "Streaming & Medien").reduce((s, t) => s + Math.abs(t.amount), 0);
                const online = transactions.filter((t) => t.category === "PayPal / Online").reduce((s, t) => s + Math.abs(t.amount), 0);

                const potential = Math.round((shopping * 0.15 + streaming * 0.25 + online * 0.10) * 100) / 100;

                return (
                  <div className="space-y-5 mt-6">
                    <Mini
                      title="Geschätztes Sparen"
                      value={potential > 0 ? potential.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€" : "—"}
                      color="text-emerald-400"
                    />

                    {potential > 0 ? (
                      <Info
                        color="emerald"
                        title="Sparen erkannt"
                        text={"Du könntest geschätzt ca. " + potential.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€ sparen, wenn du Shopping, Streaming und Onlinezahlungen optimierst."}
                      />
                    ) : (
                      <Info
                        color="cyan"
                        title="Noch kein Sparen berechnet"
                        text="Lade einen Kontoauszug hoch oder erfasse Ausgaben, damit SaveWise dein Sparen berechnen kann."
                      />
                    )}

                    <Info color="yellow" title="Hinweis" text="Die Berechnung ist eine erste Schätzung und wird später durch KI-Analyse weiter verbessert." />
                  </div>
                );
              })()}

            </Panel>
            </div>


<div className={analyseSection === "smart" ? "block pt-8" : "hidden"}>
            <Panel isLightMode={isLightMode} title="Ausgabenverteilung">
              <div className="h-64 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        transactions.length > 0
                          ? Object.values(
                                transactions
                                  .filter((item) => item.amount < 0)
                                  .reduce((groups: any, item) => {
                                    const category = item.category || "Sonstiges";
                                    groups[category] = groups[category] || { name: category, value: 0 };
                                    groups[category].value += Math.abs(item.amount);
                                    return groups;
                                  }, {})
                              )
                          : [{ name: "Keine Daten", value: 1 }]
                      }
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

              <div className="grid gap-3 mt-4 text-sm">
                {transactions.length > 0 ? (
                  Object.values(
                    transactions
                      .filter((item) => item.amount < 0)
                      .reduce((groups: any, item) => {
                        const category = item.category || "Sonstiges";
                        groups[category] = groups[category] || { name: category, value: 0 };
                        groups[category].value += Math.abs(item.amount);
                        return groups;
                      }, {})
                  ).map((item: any, index) => (
                    <p key={index} className="text-white">
                      ● {item.name}: {item.value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                    </p>
                  ))
                ) : (
                  <p className="text-white">Noch keine Ausgaben vorhanden.</p>
                )}
              </div>
            </Panel>
            </div>

            <div className="hidden">
            <Panel isLightMode={isLightMode} title="Monatsübersicht">
              <div className="grid gap-4 mt-6">
                <Mini title="Kategorie" value={transactions.length > 0 ? topCategory : "—"} color="text-cyan-400" />
                <Mini title="Analysen" value={history.length > 0 ? String(history.length) : "—"} color="text-emerald-400" />
                <Mini title="Transaktionen" value={transactions.length > 0 ? String(transactions.length) : "—"} color="text-yellow-400" />
              </div>
            </Panel>
            </div>

            <div className="hidden">
            <Panel isLightMode={isLightMode} title="Analyse Verlauf">
              <div className="space-y-4 mt-6">
                {history.length === 0 && <p className={showSettings ? "text-emerald-400" : "text-gray-300"}>Noch keine Analysen vorhanden.</p>}
                {history.map((item, index) => (
                  <div key={index} className="bg-gray-100 p-4 rounded-2xl text-gray-300">
                    {item}
                  </div>
                ))}
              </div>
            </Panel>
            </div>

            <div className={analyseSection === "transactions" ? "block pt-28" : "hidden"}>
            <Panel isLightMode={isLightMode} title="Letzte Transaktionen">
              <div className="space-y-4 mt-6">
                {transactions.map((item, index) => (
                  <div key={index} className="bg-gray-100 p-5 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-gray-300 text-sm">{item.category}</p>
                    </div>

                    <p className={item.amount >= 0 ? "text-emerald-400 font-black" : "text-red-400 font-black"}>
                      {item.amount}€
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
            </div>
          </div>
          </>
        )}

        {activeTab === "report" && (
          <div className="space-y-6 mt-6">

            {reportSection === "menu" && <Header monthlySavings={monthlySavings} savingScore={savingScore} topCategory={topCategory} />}
            {reportSection === "menu" && (
              <>
                <div className="grid gap-4">
                  {[
                    {
                      key: "upload",
                      label: "Datei-Upload",
                      text: "Kontoauszüge als PDF oder CSV hochladen und analysieren"
                    },
                    {
                      key: "manual",
                      label: "Manuelle Eingabe",
                      text: "Einkommen und Ausgaben händisch eintragen"
                    },
                    {
                      key: "pdf",
                      label: "PDF-Report",
                      text: "Professionellen Finanzreport erstellen"
                    }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setReportSection(item.key)}
                      className="rounded-[28px] border p-6 text-left transition-all duration-300 active:scale-[0.98] bg-white/5 text-white border-white/10"
                    >
                      <p className="text-xl font-black">{item.label}</p>
                      <p className={homeSection === item.key ? "mt-1 text-white" : isLightMode ? "mt-1 text-black" : "mt-1 text-gray-300"}>{item.text}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {reportSection !== "menu" && (
              <div className="fixed top-6 left-0 right-0 z-[9999] px-6">
                <button
                  type="button"
                  onClick={() => {
                    setReportSection("menu");
                    window.scrollTo({ top: 0, behavior: "auto" });
                  }}
                  className="bg-[#1f1f24] text-white px-6 py-4 rounded-[24px] font-black shadow-2xl"
                >
                  <span className="text-white">← Zurück</span> zum Report
                </button>
              </div>
            )}

            <div className={reportSection === "upload" ? "block pt-28" : "hidden"}>
              <Panel isLightMode={isLightMode} title="Datei-Upload">
                <p className="text-white mt-4">
                  Lade deine Kontoauszüge als PDF oder CSV hoch.
                </p>

                <label className="mt-6 flex items-center gap-3 bg-emerald-400 text-black px-6 py-4 rounded-2xl font-black cursor-pointer w-fit">
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
                    className="mt-6 bg-cyan-400 text-white px-6 py-4 rounded-2xl font-black"
                  >
                    Analyse starten
                  </button>
                )}

                {analysisResult && (
                  <div className="mt-5 bg-gray-100 border border-cyan-400/30 rounded-2xl p-5 text-white font-bold whitespace-pre-line">
                    {analysisResult}
                  </div>
                )}
              </Panel>
            </div>

            
            <div className={reportSection === "manual" ? "block pt-28" : "hidden"}>
              <Panel isLightMode={isLightMode} title="Manuelle Eingabe">
                <p className="text-white mt-4">
                  Trage dein monatliches Einkommen und deine bisherigen Ausgaben manuell ein, falls nichts aus einer Datei erkannt wurde.
                </p>

                <div className="grid gap-5 mt-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
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
                    <div className="flex items-center gap-2 mb-2">
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

                <button
                  type="button"
                  onClick={() => {
                    const income = Number(incomeInput);
                    const expenses = Number(expenseInput);

                    setMonthlyIncome(!isNaN(income) && income > 0 ? income : 0);
                    setSpentThisMonth(!isNaN(expenses) && expenses > 0 ? expenses : 0);

                    if ((!isNaN(income) && income > 0) || (!isNaN(expenses) && expenses > 0)) {
                      setTransactions([
                        ...(income > 0 ? [{ name: "Manuelles Einkommen", amount: income, category: "Einkommen" }] : []),
                        ...(expenses > 0 ? [{ name: "Manuelle Ausgaben", amount: -expenses, category: "Ausgaben" }] : [])
                      ]);

                      setSavingScore(income > 0 ? Math.max(0, Math.min(100, Math.round(((income - expenses) / income) * 100))) : 0);
                      setManualSaved(true);
                    }
                  }}
                  className="w-full mt-6 bg-emerald-400 text-black rounded-3xl p-4 font-black"
                >
                  Daten speichern
                </button>
              </Panel>
            </div>

            <div className={reportSection === "pdf" ? "block pt-28" : "hidden"}>
              <Panel isLightMode={isLightMode} title="PDF-Report">
                <p className="text-white mt-4">
                  Erstelle einen professionellen Finanzreport.
                </p>

                <button
                  onClick={createPdf}
                  className="mt-6 bg-white text-white px-6 py-4 rounded-2xl font-black"
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
          <div className="w-full max-w-lg bg-[#111827] border border-white/10 rounded-[36px] p-7 shadow-2xl text-center">
            <div className="text-7xl mb-6">
              {["💸", "📊", "🎯", "🤖"][introStep]}
            </div>

            <h2 className={isLightMode ? "text-4xl font-black text-black" : "text-4xl font-black text-white"}>
              {[
                "Willkommen bei SaveWise AI",
                "Finanzen verstehen",
                "Sparziele erreichen",
                "KI-Unterstützung nutzen"
              ][introStep]}
            </h2>

            <p className="text-white mt-5 text-lg leading-relaxed">
              {[
                "SaveWise AI hilft dir, Budget, Ausgaben und Sparziele smarter zu verwalten.",
                "Behalte Einnahmen, Ausgaben, Sparquote, Monatsbudget und Trends im Blick.",
                "Lege Sparziele fest und verfolge deinen Fortschritt Schritt für Schritt.",
                "Nutze KI-Empfehlungen, um Sparene zu erkennen und bessere Entscheidungen zu treffen."
              ][introStep]}
            </p>

            <div className="flex justify-center gap-2 mt-8">
              {[0,1,2,3].map((i) => (
                <div
                  key={i}
                  className={
                    "h-2 rounded-full transition-all " +
                    (introStep === i ? "w-10 bg-emerald-400" : "w-2 bg-white/20")
                  }
                />
              ))}
            </div>

            <div className="flex gap-3 mt-10">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("savewise_intro_seen", "true");
                  setShowIntro(false);
                  setIntroStep(0);
                }}
                className="flex-1 bg-white/10 text-white rounded-2xl py-4 font-black"
              >
                Überspringen
              </button>

              <button
                type="button"
                onClick={() => {
                  if (introStep < 3) {
                    setIntroStep(introStep + 1);
                  } else {
                    localStorage.setItem("savewise_intro_seen", "true");
                    setShowIntro(false);
                    setIntroStep(0);
                  }
                }}
                className="flex-1 bg-emerald-400 text-black rounded-2xl py-4 font-black"
              >
                {introStep < 3 ? "Weiter" : "Loslegen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 overflow-y-auto p-6 pt-10 pb-32 flex items-start justify-center">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-[28px] p-5 shadow-2xl my-6">
            <h2 className="text-4xl font-black">Einstellungen</h2>

            <p className="text-white mt-3">
              Verwalte deine App-Daten und Optionen.
            </p>

            <div className="space-y-4 mt-8">
              <button
                type="button"
                onClick={resetAllData}
                className="w-full bg-red-400 text-white rounded-2xl p-4 font-black"
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
                className="w-full bg-yellow-400 text-white rounded-2xl p-4 font-black"
              >
               Nur Budget zurücksetzen
              </button>

              <button
                type="button"
                onClick={exportData}
                className="w-full bg-cyan-400 text-white rounded-2xl p-4 font-black"
              >
                Daten exportieren
              </button>

<button
  type="button"
  onClick={() => setIsLightMode(!isLightMode)}
  className="w-full bg-gray-200 text-white rounded-2xl p-4 font-black"
>
  {isLightMode ? "Dark Mode aktivieren" : "Light Mode aktivieren"}
</button>

<div className="bg-gray-100 rounded-2xl p-5 text-gray-300">
  SaveWise AI MVP · Lokale Demo-Version
</div>

              
              <div className="bg-gray-100 rounded-3xl p-6 text-white">
                <h3 className="text-xl font-black mb-3">
                  Was kann SaveWise AI?
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  SaveWise AI hilft dir, deine Finanzen besser zu verstehen,
                  Budgets zu kontrollieren, Sparziele zu verfolgen und deine
                  Ausgaben mit KI-gestützten Empfehlungen zu optimieren.
                </p>

                <div className="grid gap-2 mt-5 text-sm font-bold text-white">
                  <p>✅ Monatsbudget & Ausgabenlimit</p>
                  <p>✅ Sparziele mit Fortschritt</p>
                  <p>✅ Finanztrend & Diagramme</p>
                  <p>✅ KI-Finanzassistent</p>
                  <p>✅ Backup Export</p>
                  <p>✅ Premium Android-App Erlebnis</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIntroStep(0);
                  setShowIntro(true);
                }}
                className="w-full bg-emerald-400 text-black rounded-3xl p-4 font-black"
              >
                Einführung erneut ansehen
              </button>

              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="w-full bg-white text-white rounded-2xl p-4 font-black"
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
          className={showSettings ? "text-emerald-400" : "text-gray-300"}
        >
          <Settings size={28} />
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
}) {
  return (
    <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-[36px] p-10 shadow-2xl shadow-emerald-500/10">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl" />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-[48px] bg-emerald-400/20 blur-2xl" />

          <img
            src="/savewise-icon.png"
            alt="SaveWise Logo"
            className="relative w-64 h-64 rounded-[46px] object-cover shadow-2xl shadow-emerald-400/30"
          />
        </div>
<div className="mt-6 w-full max-w-3xl rounded-[30px] border border-white/10 bg-white/70 p-4 backdrop-blur-xl shadow-2xl shadow-emerald-400/10 text-white">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[22px] border border-emerald-400/20 bg-emerald-400/25 px-3 py-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300">
                Sparen
              </p>
              <p className="mt-2 text-lg font-black text-black whitespace-nowrap">
                {props.monthlySavings}€
              </p>
            </div>

            <div className="rounded-[22px] border border-cyan-400/20 bg-cyan-400/25 px-3 py-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-300">
                Score
              </p>
              <p className="mt-2 text-lg font-black text-black whitespace-nowrap">
                {props.savingScore}/100
              </p>
            </div>

            <div className="rounded-[22px] border border-purple-400/20 bg-purple-400/25 px-3 py-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-purple-300">
                Kategorie
              </p>
              <p className="mt-2 text-sm font-black text-black whitespace-nowrap">
                {props.topCategory}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card(props: { title: string; value: string; color: string; note?: string; isLightMode?: boolean }) {
  const isAI = props.title === "KI Insight";

  return (
    <div
      className={
        "relative overflow-hidden min-h-[118px] rounded-[30px] border p-5 backdrop-blur-2xl shadow-2xl transition-all duration-300 active:scale-[0.98] " +
        (isAI
          ? props.isLightMode
            ? "border-cyan-300 bg-cyan-100/80 shadow-cyan-200/40"
            : "border-cyan-400/30 bg-cyan-400/25 shadow-cyan-400/10"
          : props.isLightMode
          ? "border-gray-200 bg-white/90 shadow-black/10"
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
        <p
          className={
            isAI
              ? props.isLightMode
                ? "text-sm font-bold text-cyan-700"
                : "text-sm font-bold text-cyan-300"
              : props.isLightMode
              ? "text-sm font-semibold text-black"
              : "text-sm font-medium text-white"
          }
        >
          {props.title}
        </p>

        <h2 className={`mt-4 text-xl font-black leading-tight ${props.color}`}>
          {props.value}
        </h2>

        {isAI && (
          <p
            className={
              props.isLightMode
                ? "mt-3 text-xs leading-relaxed text-slate-800"
                : "mt-3 text-xs leading-relaxed text-cyan-100/70"
            }
          >
            {props.note || "Automatisch aus deinen aktuellen Finanzdaten erkannt."}
          </p>
        )}
      </div>
    </div>
  );
}

function Panel(props: {
  title: string;
  children: React.ReactNode;
  isLightMode?: boolean;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[32px] p-7 backdrop-blur-2xl shadow-xl shadow-black/25">
      <h2
        className={
          props.isLightMode ? "text-4xl font-black text-white" : "text-4xl font-black text-white"
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
    <div className="bg-gray-100 rounded-2xl p-5">
      <p className="text-gray-300">{props.title}</p>
      <p className={`text-xl font-black mt-2 ${props.color}`}>{props.value}</p>
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
      className={props.active ? "text-emerald-400" : "text-gray-300"}
    >
      {props.children}
    </button>
  );
}


