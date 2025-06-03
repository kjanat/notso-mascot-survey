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
      <div className="p-8 text-center space-y-4">
        <LanguageSelector />
        <div className="text-xl">{t.alreadySubmitted}</div>
        <div className="text-gray-600">{t.noMultiple}</div>
        <div className="text-gray-600">{t.thanks}</div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 text-center space-y-6">
        <LanguageSelector />
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <CaptchaVerification onVerify={setIsVerified} />
      </div>
    );
  }

  if (submitted)
    return (
      <div className="p-8 text-center text-xl">
        <LanguageSelector />
        {t.thanks}
      </div>
    );

  if (step === "intro")
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 text-center space-y-6">
        <LanguageSelector />
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-gray-700">{t.welcome}</p>

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

        <button
          onClick={() => setStep(0)}
          disabled={!privacyConsent}
          className="bg-green-600 text-white py-3 px-8 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {t.startButton}
        </button>
      </div>
    );

  if (step === "form")
    return (
      <div className="max-w-md mx-auto p-8 space-y-4">
        <LanguageSelector />
        <h2 className="text-2xl font-semibold text-center">{t.finalQuestions}</h2>
        <input
          type="number"
          min="1"
          max="99"
          placeholder={t.age}
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
          <option value="" disabled>{t.genderOptions.placeholder}</option>
          <option>{t.genderOptions.male}</option>
          <option>{t.genderOptions.female}</option>
          <option>{t.genderOptions.other}</option>
        </select>
        <select
          className="w-full p-3 border rounded"
          defaultValue=""
          onChange={(e) => setForm({ ...form, education: e.target.value })}
        >
          <option value="" disabled>{t.educationOptions.placeholder}</option>
          <option>{t.educationOptions.primary}</option>
          <option>{t.educationOptions.vmbo}</option>
          <option>{t.educationOptions.havo}</option>
          <option>{t.educationOptions.vwo}</option>
          <option>{t.educationOptions.hbo}</option>
          <option>{t.educationOptions.uni}</option>
        </select>
        <button
          disabled={!form.age || !form.gender || !form.education}
          onClick={submit}
          className="w-full py-3 rounded text-white disabled:bg-gray-400 bg-blue-600 hover:bg-blue-700"
        >
          {t.submitButton}
        </button>
      </div>
    );

  const q = QUESTIONS[step];
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      <LanguageSelector />
      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-green-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>
      <div className="text-sm text-gray-600 text-right">
        {step + 1} / {QUESTIONS.length}
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
            portrait:grid-cols-1
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
