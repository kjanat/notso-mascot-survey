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
import { translations } from "./data/translations";

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
  const [lang, setLang] = useState("nl");
  // Update localStorage when language changes
  React.useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = translations[lang];

  // Language selector component
  const LanguageSelector = () => (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      className="absolute top-4 right-4 p-2 border rounded bg-white"
    >
      <option value="nl">Nederlands</option>
      <option value="en">English</option>
    </select>
  );

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
        delay: 250,
        tolerance: 5,
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
      <div className="p-8 space-y-4">
        <div className="flex justify-end mb-8">
          <LanguageSelector />
        </div>
        <div className="text-center">
          <div className="text-xl">{t.alreadySubmitted}</div>
          <div className="text-gray-600">{t.noMultiple}</div>
          <div className="text-gray-600">{t.thanks}</div>
        </div>
        <div className="flex justify-center mt-8">
          <img 
            src="/logo/notsoAI-logoLine.svg" 
            alt="NotSoAI Logo" 
            className="h-5 w-auto"
          />
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex justify-end mb-8">
          <LanguageSelector />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <CaptchaVerification onVerify={setIsVerified} />
        </div>
        <div className="flex justify-center mt-8">
          <img 
            src="/logo/notsoAI-logoLine.svg" 
            alt="NotSoAI Logo" 
            className="h-5 w-auto"
          />
        </div>
      </div>
    );
  }

  if (submitted)
    return (
      <div className="p-8">
        <div className="flex justify-end mb-8">
          <LanguageSelector />
        </div>
        <div className="text-center text-xl">
          {t.thanks}
        </div>
        <div className="flex justify-center mt-8">
          <img 
            src="/logo/notsoAI-logoLine.svg" 
            alt="NotSoAI Logo" 
            className="h-5 w-auto"
          />
        </div>
      </div>
    );

  if (step === "intro")
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex justify-end mb-8">
          <LanguageSelector />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
          <p className="text-gray-700 max-w-xl mx-auto">{t.welcome}</p>
        </div>

        <div className="max-w-2xl mx-auto bg-gray-50 p-4 rounded-lg text-left text-sm text-gray-600">
          <h2 className="font-bold mb-2">{t.privacyTitle}</h2>
          <p className="mb-4">{t.privacyIntro}</p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            {t.privacyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
          <div className="flex items-start gap-2 mt-4">
            <input
              type="checkbox"
              id="privacy-consent"
              className="mt-1"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
            />
            <label htmlFor="privacy-consent">{t.privacyConsent}</label>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => setStep(0)}
            disabled={!privacyConsent}
            className="bg-green-600 text-white py-3 px-8 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {t.startButton}
          </button>
        </div>

        <div className="flex justify-center mt-8">
          <img 
            src="/logo/notsoAI-logoLine.svg" 
            alt="NotSoAI Logo" 
            className="h-5 w-auto"
          />
        </div>
      </div>
    );

  const q = QUESTIONS[step];
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <img 
          src="/logo/notsoAI-logoLine.svg" 
          alt="NotSoAI Logo" 
          className="h-5 w-auto"
        />
        <LanguageSelector />
      </div>
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full relative">
        <div 
          className="absolute left-0 top-0 h-full bg-green-600 transition-all duration-300 ease-out"
          style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
        >
          <div 
            className="absolute right-0 top-0 -translate-y-full translate-x-1/2 -mt-1
                       bg-white shadow-sm border border-gray-200 
                       rounded-full px-2 py-0.5 
                       text-xs text-gray-600 whitespace-nowrap 
                       transition-all duration-300 ease-out"
          >
            {step + 1}/{QUESTIONS.length}
          </div>
        </div>
      </div>
      <h1 className="text-2xl font-bold">{t.questions[q.id]}</h1>
      <p className="text-sm text-gray-600">
        {t.dragInstructions}
      </p>
      <DndContext 
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={order}
          strategy={rectSortingStrategy}
        >
          <div className="
            grid
            grid-cols-5
            [@media(max-width:640px)_and_(orientation:portrait)]:grid-cols-1
            gap-4 min-w-0 w-full
          ">
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
          {t.backButton}
        </button>
        <button
          onClick={next}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {step < QUESTIONS.length - 1 ? t.nextButton : t.backgroundQuestions}
        </button>
      </div>
    </div>
  );
}
