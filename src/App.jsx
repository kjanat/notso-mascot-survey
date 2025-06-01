import React, { useState, useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { QUESTIONS } from "./data/questions";
import SortableMascot from "./components/SortableMascot";
import CaptchaVerification from "./components/CaptchaVerification";
import { hasUserSubmitted, markAsSubmitted } from "./utils/submissionTracker";

const CONTEXT = {
  sales: "Welke mascotte mag jouw stylist zijn voor één dag?",
  friend: "Welke mascotte zou jij kiezen als digitale vriend(in)?",
  lover: "Met welke mascotte zou jij een digitale relatie willen hebben?",
  coach:
    "Met welke mascotte zou jij het liefst zwetend in de sportschool staan?",
  child: "Welke mascotte zou je kiezen om een kind te helpen bij het leren?",
  hr: "Welke mascotte zou je het liefst zien als je eerste aanspreekpunt bij HR?",
  onboarding:
    "Welke mascotte zou jij willen als je persoonlijke onboardingbuddy?",
  support:
    "Welke mascotte zou jij bellen als je een probleem hebt met je bestelling?",
  finance: "Welke mascotte zou jij vertrouwen met je financiële vragen?",
  mental: "Met welke mascotte zou jij het liefst een meditatiesessie doen?",
};

export default function App() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 639);
  const [isVerified, setIsVerified] = React.useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [step, setStep] = useState("intro");
  const [answers, setAnswers] = useState({});
  const [order, setOrder] = useState([]);
  const [form, setForm] = useState({ age: "", gender: "", education: "" });
  const [submitted, setSubmitted] = useState(false);

  // Check if user has already submitted when component mounts
  useEffect(() => {
    const checkSubmission = async () => {
      const submitted = await hasUserSubmitted();
      setHasSubmitted(submitted);
    };
    checkSubmission();
  }, []);

  useEffect(() => {
    if (typeof step === "number") {
      const qid = QUESTIONS[step].id;
      setOrder(answers[qid] ?? QUESTIONS[step].options);
    }
  }, [step]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  function handleDragEnd(e) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const old = order.indexOf(active.id);
    const nu = order.indexOf(over.id);
    const newOrder = [...order];
    newOrder.splice(old, 1);
    newOrder.splice(nu, 0, active.id);
    setOrder(newOrder);
  }
  function next() {
    if (typeof step === "number") {
      const qid = QUESTIONS[step].id;
      setAnswers((prev) => ({ ...prev, [qid]: order }));
      setStep(step < QUESTIONS.length - 1 ? step + 1 : "form");
    }
  }
  function back() {
    if (typeof step === "number" && step > 0) {
      setStep(step - 1);
    }
  }

  async function submit() {
    const orderStrings = Object.fromEntries(
      Object.entries(answers).map(([qid, arr]) => {
        const orig = QUESTIONS.find((q) => q.id === qid).options;
        return [qid, arr.map((opt) => orig.indexOf(opt) + 1).join("")];
      })
    );
    const payload = {
      data: {
        ...form,
        ...orderStrings,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      },
    };
    await fetch("https://sheetdb.io/api/v1/h1bwcita99si3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await markAsSubmitted();
    setSubmitted(true);
  }

  if (hasSubmitted || submitted) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-xl">Je hebt deze enquête al ingevuld.</div>
        <div className="text-gray-600">
          Het is niet mogelijk om de enquête meerdere keren in te vullen.
        </div>
        <div className="text-gray-600">Bedankt voor je deelname! 🎉</div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 text-center space-y-6">
        <h1 className="text-3xl font-bold">Mascotte‑Survey</h1>
        <CaptchaVerification onVerify={setIsVerified} />
      </div>
    );
  }

  if (submitted)
    return (
      <div className="p-8 text-center text-xl">
        Bedankt voor je deelname! 🎉
      </div>
    );
  if (step === "intro")
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 text-center space-y-6">
        <h1 className="text-3xl font-bold">Mascotte‑Survey</h1>
        <p className="text-gray-700">
          👋 Welkom en bedankt dat je meedoet! Deze korte en interactieve
          enquête bestaat uit 10 vragen. Bij elke vraag zie je 5 mascottes.
          Sleep ze in de volgorde die voor jou het meest logisch voelt — van 1
          (meest passend) tot 5. Niet te lang over nadenken: vertrouw op je
          eerste indruk!
        </p>

        <div className="max-w-2xl mx-auto bg-gray-50 p-4 rounded-lg text-left text-sm text-gray-600">
          <h2 className="font-bold mb-2">Privacy Verklaring</h2>
          <p className="mb-4">
            Door deel te nemen aan deze enquête ga je akkoord met het volgende:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>We verzamelen je antwoorden op de enquêtevragen</li>
            <li>We slaan basis demografische gegevens op (leeftijd, geslacht, opleiding)</li>
            <li>We gebruiken een browser fingerprint om dubbele inzendingen te voorkomen</li>
            <li>Je gegevens worden anoniem verwerkt en alleen voor onderzoeksdoeleinden gebruikt</li>
            <li>Je kunt maar één keer deelnemen aan deze enquête</li>
          </ul>
          <div className="flex items-start gap-2 mt-4">
            <input
              type="checkbox"
              id="privacy-consent"
              className="mt-1"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
            />
            <label htmlFor="privacy-consent">
              Ik ga akkoord met het verzamelen en verwerken van mijn gegevens zoals hierboven beschreven
            </label>
          </div>
        </div>

        <button
          onClick={() => setStep(0)}
          disabled={!privacyConsent}
          className="bg-green-600 text-white py-3 px-8 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Start
        </button>
      </div>
    );
  if (step === "form")
    return (
      <div className="max-w-md mx-auto p-8 space-y-4">
        <h2 className="text-2xl font-semibold text-center">
          Nog een paar vragen 🙂
        </h2>
        <input
          type="number"
          min="1"
          max="99"
          placeholder="Leeftijd"
          className="w-full p-3 border rounded"
          value={form.age}
          onInput={(e) => {
            const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
            setForm({ ...form, age: v });
          }}
        />
        <select
          className="w-full p-3 border rounded"
          defaultValue=""
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
        >
          <option value="" disabled>
            Geslacht
          </option>
          <option>Man</option>
          <option>Vrouw</option>
          <option>Anders</option>
        </select>
        <select
          className="w-full p-3 border rounded"
          defaultValue=""
          onChange={(e) => setForm({ ...form, education: e.target.value })}
        >
          <option value="" disabled>
            Hoogst behaalde Opleiding
          </option>
          <option>Basisonderwijs</option>
          <option>VMBO/MBO</option>
          <option>HAVO</option>
          <option>VWO</option>
          <option>HBO</option>
          <option>WO</option>
        </select>
        <button
          disabled={!form.age || !form.gender || !form.education}
          onClick={submit}
          className="w-full py-3 rounded text-white disabled:bg-gray-400 bg-blue-600 hover:bg-blue-700"
        >
          Versturen
        </button>
      </div>
    );
  const q = QUESTIONS[step];
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-bold">{CONTEXT[q.id]}</h1>
      <p className="text-sm text-gray-600">
        Sleep om te rangschikken: <strong>1 = beste</strong>
      </p>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={order}
          strategy={
            isMobile ? verticalListSortingStrategy : rectSortingStrategy
          }
        >
          <div className="flex flex-col gap-2 sm:grid sm:grid-cols-5 sm:gap-4">
            {order.map((file, idx) => (
              <SortableMascot
                key={file}
                id={file}
                rank={idx + 1}
                src={`/mascots/${q.id}/${file}`}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex justify-between">
        <button
          onClick={back}
          disabled={step === 0}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Terug
        </button>
        <button
          onClick={next}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {step < QUESTIONS.length - 1 ? "Volgende" : "Achtergrondvragen"}
        </button>
      </div>
    </div>
  );
}
