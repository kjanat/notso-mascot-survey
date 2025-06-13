/* eslint-env browser */
import React, { useState, useEffect } from 'react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { QUESTIONS } from './data/questions'
import SortableMascot from './components/SortableMascot'
import CaptchaVerification from './components/CaptchaVerification'
import EnvironmentCheck from './components/EnvironmentCheck'
import { hasUserSubmitted, markAsSubmitted } from './utils/submissionTracker'
import { translations } from './data/translations'

const validateForm = (form) => {
  const errors = {}
  // Age validation
  if (!form.age) {
    errors.age = 'Leeftijd is verplicht'
  } else if (form.age < 12 || form.age > 99) {
    errors.age = 'Leeftijd moet tussen 12 en 99 jaar zijn'
  }

  // Gender validation
  if (!form.gender) {
    errors.gender = 'Geslacht is verplicht'
  }

  // Education validation
  if (!form.education) {
    errors.education = 'Opleiding is verplicht'
  }

  // Email validation (only if provided)
  if (form.prizeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.prizeEmail)) {
    errors.prizeEmail = 'Voer een geldig emailadres in'
  }

  return errors
}

export const validateMascotRankings = (answers, questions) => {
  // Check if we have answers for all questions
  const missingQuestions = questions.filter(
    (q) => !answers[q.id] || answers[q.id].length !== 5
  )
  if (missingQuestions.length > 0) {
    return false
  }

  // Check if each question has valid rankings (all mascots ranked)
  for (const [qid, ranking] of Object.entries(answers)) {
    const question = questions.find((q) => q.id === qid)
    if (!question) continue

    // Check if we have exactly 5 unique rankings
    const uniqueRankings = new Set(ranking)
    if (uniqueRankings.size !== 5) {
      return false
    }
  }

  return true
}

export default function App () {
  const [isVerified, setIsVerified] = React.useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [step, setStep] = useState('intro')
  const [answers, setAnswers] = useState({})
  const [order, setOrder] = useState([])
  const [form, setForm] = useState({
    age: '',
    gender: '',
    education: '',
    prizeName: '',
    prizeEmail: '',
    mascotIdea: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [redirectCountdown, setRedirectCountdown] = useState(5)
  const [lang, setLang] = useState(
    () => window.localStorage.getItem('lang') || 'nl'
  )
  const [formErrors, setFormErrors] = useState({})

  // Update localStorage when language changes
  React.useEffect(() => {
    window.localStorage.setItem('lang', lang)
  }, [lang])

  // Handle redirect countdown after submission
  React.useEffect(() => {
    if (submitted && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (submitted && redirectCountdown === 0) {
      window.location.href = 'https://www.notso.ai'
    }
  }, [submitted, redirectCountdown])

  const t = translations[lang]

  // Language selector component
  const LanguageSelector = () => (
    <div className='flex gap-1'>
      <button
        onClick={() => setLang('nl')}
        className={`w-7 h-5 overflow-hidden rounded-sm border ${lang === 'nl' ? 'border-blue-500 shadow' : 'border-gray-300'}`}
      >
        <img
          src='flags/nl.svg'
          alt='Nederlands'
          className='w-full h-full'
          style={{ objectFit: 'fill' }}
        />
      </button>
      <button
        onClick={() => setLang('en')}
        className={`w-7 h-5 overflow-hidden rounded-sm border ${lang === 'en' ? 'border-blue-500 shadow' : 'border-gray-300'}`}
      >
        <img
          src='flags/gb.svg'
          alt='English'
          className='w-full h-full'
          style={{ objectFit: 'fill' }}
        />
      </button>
    </div>
  )

  // Check if user has already submitted when component mounts
  useEffect(() => {
    const checkSubmission = async () => {
      const submitted = await hasUserSubmitted()
      setHasSubmitted(submitted)
    }
    checkSubmission()
  }, [])

  useEffect(() => {
    if (typeof step === 'number') {
      const qid = QUESTIONS[step].id
      const questionOptions = QUESTIONS[step].options

      // Initialize order immediately to prevent race conditions
      let newOrder = questionOptions

      // Check if stored answer contains valid files for this question
      const storedAnswer = answers[qid]
      if (storedAnswer) {
        // Verify that stored answer contains exactly the files for this question
        const storedSet = new Set(storedAnswer)
        const questionSet = new Set(questionOptions)
        const isValidAnswer =
          storedSet.size === questionSet.size &&
          [...storedSet].every((file) => questionSet.has(file))

        if (isValidAnswer) {
          newOrder = storedAnswer
        }
      }

      // Set order immediately, not in separate if/else blocks
      setOrder(newOrder)

      // Prefetch images for the next question
      if (step + 1 < QUESTIONS.length) {
        const nextQ = QUESTIONS[step + 1]
        nextQ.options.forEach((file) => {
          const img = new window.Image()
          img.src = `mascots/${nextQ.id}/${file}`
        })
      }
    }
  }, [step, answers])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5
      }
    })
  )

  function handleDragEnd (e) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const old = order.indexOf(active.id)
    const nu = order.indexOf(over.id)
    const newOrder = [...order]
    newOrder.splice(old, 1)
    // const newIndex = old < nu ? nu - 1 : nu;
    // newOrder.splice(newIndex, 0, active.id);
    newOrder.splice(nu, 0, active.id)
    setOrder(newOrder)
  }
  function next () {
    if (typeof step === 'number') {
      const qid = QUESTIONS[step].id
      setAnswers((prev) => ({ ...prev, [qid]: order }))
      setStep(step < QUESTIONS.length - 1 ? step + 1 : 'form')
    }
  }
  function back () {
    if (typeof step === 'number' && step > 0) {
      setStep(step - 1)
    }
  }

  async function submit () {
    try {
      // Validate form
      const validationErrors = validateForm(form)
      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors)
        return
      }

      // Validate mascot rankings
      if (!validateMascotRankings(answers, QUESTIONS)) {
        alert(t.rankingsIncomplete)
        return
      }

      // Format the answers into individual columns
      const formattedAnswers = Object.entries(answers).reduce(
        (acc, [qid, arr]) => {
          const orig = QUESTIONS.find((q) => q.id === qid).options
          const rankString = arr
            .map((opt) => (orig.indexOf(opt) + 1).toString())
            .join('')
          acc[qid] = rankString
          return acc
        },
        {}
      )

      // Create the data object with all fields
      const submissionData = {
        timestamp: new Date().toISOString(),
        age: form.age,
        gender: form.gender,
        education: form.education,
        userAgent: navigator.userAgent,
        prize_name: form.prizeName || '',
        prize_email: form.prizeEmail || '',
        mascot_idea: form.mascotIdea || '',
        ...formattedAnswers
      }

      // Log the data being sent
      console.log('Submission data:', submissionData)

      // Prepare the data in SheetDB format
      const payload = {
        data: [submissionData]
      }

      // Log the full payload
      console.log('Full payload:', payload)

      const response = await fetch(import.meta.env.VITE_SHEET_DB_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`Submission failed: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('Submission successful:', result)

      await markAsSubmitted()
      setSubmitted(true)
    } catch (error) {
      console.error('Submission error:', error)
      alert(t.submissionError)
    }
  }
  if (submitted) {
    return (
      <div className='p-8 space-y-4'>
        <EnvironmentCheck />
        <div className='flex justify-end mb-8'>
          <LanguageSelector />
        </div>
        <div className='text-center'>
          <div className='text-gray-600'>{t.thanks}</div>
          <div className='text-sm text-gray-500 mt-4'>
            {t.redirecting.replace('{seconds}', redirectCountdown)}
          </div>
        </div>
        <div className='flex justify-center mt-8'>
          <img
            src='logo/notsoAI-logoLine.svg'
            alt='Notso AI Logo'
            className='h-5 w-auto'
          />
        </div>
      </div>
    )
  }

  if (hasSubmitted) {
    return (
      <div className='p-8 space-y-4'>
        <EnvironmentCheck />
        <div className='flex justify-end mb-8'>
          <LanguageSelector />
        </div>
        <div className='text-center'>
          <div className='text-xl'>{t.alreadySubmitted}</div>
          <div className='text-gray-600'>{t.noMultiple}</div>
        </div>
        <div className='flex justify-center mt-8'>
          <img
            src='logo/notsoAI-logoLine.svg'
            alt='Notso AI Logo'
            className='h-5 w-auto'
          />
        </div>
      </div>
    )
  }

  if (!isVerified) {
    return (
      <div className='max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6'>
        <EnvironmentCheck />
        <div className='flex justify-end mb-8'>
          <LanguageSelector />
        </div>
        <div className='text-center'>
          <h1 className='text-3xl font-bold'>{t.title}</h1>
          <CaptchaVerification
            onVerify={setIsVerified}
            prompt={t.captchaPrompt}
          />
        </div>
        <div className='flex justify-center mt-8'>
          <img
            src='logo/notsoAI-logoLine.svg'
            alt='Notso AI Logo'
            className='h-5 w-auto'
          />
        </div>
      </div>
    )
  }

  if (step === 'intro') {
    return (
      <div className='max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6'>
        <div className='flex justify-end mb-8'>
          <LanguageSelector />
        </div>
        <div className='text-center'>
          <h1 className='text-3xl font-bold mb-6'>{t.title}</h1>
          <p className='text-gray-700 max-w-xl mx-auto'>{t.welcome}</p>
        </div>

        <div className='max-w-2xl mx-auto bg-gray-50 p-4 rounded-lg text-left text-sm text-gray-600'>
          <h2 className='font-bold mb-2'>{t.privacyTitle}</h2>
          <p className='mb-4'>{t.privacyIntro}</p>
          <ul className='list-disc list-inside space-y-2 mb-4'>
            {t.privacyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
          <div className='flex items-start gap-2 mt-4'>
            <input
              type='checkbox'
              id='privacy-consent'
              className='mt-1'
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
            />
            <label htmlFor='privacy-consent'>{t.privacyConsent}</label>
          </div>
        </div>

        <div className='flex justify-center'>
          <button
            onClick={() => setStep(0)}
            disabled={!privacyConsent}
            className='bg-green-600 text-white py-3 px-8 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
          >
            {t.startButton}
          </button>
        </div>

        <div className='flex justify-center mt-8'>
          <img
            src='logo/notsoAI-logoLine.svg'
            alt='Notso AI Logo'
            className='h-5 w-auto'
          />
        </div>
      </div>
    )
  }

  if (step === 'form') {
    return (
      <div className='fixed inset-0 flex flex-col'>
        {/* Header - minimal fixed height */}
        <div className='flex justify-between items-center h-8 px-2 shrink-0'>
          <img
            src='logo/notsoAI-logoLine.svg'
            alt='Notso AI Logo'
            className='h-4 w-auto'
          />
          <LanguageSelector />
        </div>

        {/* Progress bar - minimal fixed height */}
        <div className='w-full h-1 bg-gray-200 relative shrink-0'>
          <div
            className='absolute left-0 top-0 h-full bg-green-600 transition-all duration-300 ease-out'
            style={{ width: '100%' }}
          />
        </div>

        {/* Main content container */}
        <div className='flex flex-col px-4 py-4 grow overflow-y-auto'>
          <div className='text-center mb-6'>
            <h1 className='text-xl font-bold'>{t.finalQuestions}</h1>
          </div>

          <div className='max-w-md mx-auto w-full space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {t.age} <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                min='12'
                max='99'
                value={form.age}
                onChange={(e) => {
                  setForm({ ...form, age: e.target.value })
                  setFormErrors({ ...formErrors, age: null })
                }}
                className={`w-full p-2 border rounded ${formErrors.age ? 'border-red-500' : ''}`}
              />
              {formErrors.age && (
                <p className='mt-1 text-sm text-red-600'>{formErrors.age}</p>
              )}
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {t.gender} <span className='text-red-500'>*</span>
              </label>
              <select
                value={form.gender}
                onChange={(e) => {
                  setForm({ ...form, gender: e.target.value })
                  setFormErrors({ ...formErrors, gender: null })
                }}
                className={`w-full p-2 border rounded ${formErrors.gender ? 'border-red-500' : ''}`}
              >
                <option value=''>{t.genderOptions.placeholder}</option>
                <option value='male'>{t.genderOptions.male}</option>
                <option value='female'>{t.genderOptions.female}</option>
                <option value='other'>{t.genderOptions.other}</option>
              </select>
              {formErrors.gender && (
                <p className='mt-1 text-sm text-red-600'>{formErrors.gender}</p>
              )}
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                {t.education} <span className='text-red-500'>*</span>
              </label>
              <select
                value={form.education}
                onChange={(e) => {
                  setForm({ ...form, education: e.target.value })
                  setFormErrors({ ...formErrors, education: null })
                }}
                className={`w-full p-2 border rounded ${formErrors.education ? 'border-red-500' : ''}`}
              >
                <option value=''>{t.educationOptions.placeholder}</option>
                <option value='primary'>{t.educationOptions.primary}</option>
                <option value='vmbo'>{t.educationOptions.vmbo}</option>
                <option value='havo'>{t.educationOptions.havo}</option>
                <option value='vwo'>{t.educationOptions.vwo}</option>
                <option value='hbo'>{t.educationOptions.hbo}</option>
                <option value='uni'>{t.educationOptions.uni}</option>
              </select>
              {formErrors.education && (
                <p className='mt-1 text-sm text-red-600'>
                  {formErrors.education}
                </p>
              )}
            </div>

            {/* Prize Giveaway Section */}
            <div className='mt-8 pt-6 border-t border-gray-200'>
              <div className='bg-blue-50 p-4 rounded-lg mb-4'>
                <h2 className='text-lg font-semibold text-blue-800 mb-2'>
                  {t.prizeTitle}
                </h2>
                <p className='text-sm text-blue-700 mb-4'>
                  {t.prizeDescription}
                </p>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t.prizeName}
                  </label>
                  <input
                    type='text'
                    value={form.prizeName}
                    onChange={(e) =>
                      setForm({ ...form, prizeName: e.target.value })}
                    className='w-full p-2 border rounded'
                    placeholder={t.prizeNamePlaceholder}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t.prizeEmail}
                  </label>
                  <input
                    type='email'
                    value={form.prizeEmail}
                    onChange={(e) => {
                      setForm({ ...form, prizeEmail: e.target.value })
                      setFormErrors({ ...formErrors, prizeEmail: null })
                    }}
                    className={`w-full p-2 border rounded ${formErrors.prizeEmail ? 'border-red-500' : ''}`}
                    placeholder={t.prizeEmailPlaceholder}
                  />
                  {formErrors.prizeEmail && (
                    <p className='mt-1 text-sm text-red-600'>
                      {formErrors.prizeEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t.prizeIdea}
                  </label>
                  <textarea
                    value={form.mascotIdea}
                    onChange={(e) =>
                      setForm({ ...form, mascotIdea: e.target.value })}
                    className='w-full p-2 border rounded'
                    rows='3'
                    placeholder={t.prizeIdeaPlaceholder}
                  />
                </div>
              </div>
            </div>

            <div className='pt-4'>
              <button
                onClick={submit}
                disabled={!form.age || !form.gender || !form.education}
                className='w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
              >
                {t.submitButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const q = QUESTIONS[step]
  
  // Check if current order belongs to current question to prevent race conditions
  const orderBelongsToCurrentQuestion = order.length > 0 && order.every(file => file.startsWith(q.id))
  
  return (
    <div className='fixed inset-0 flex flex-col'>
      {/* Header - minimal fixed height */}
      <div className='flex justify-between items-center h-8 px-2 shrink-0'>
        <img
          src='logo/notsoAI-logoLine.svg'
          alt='Notso AI Logo'
          className='h-4 w-auto'
        />
        <LanguageSelector />
      </div>

      {/* Progress bar - minimal fixed height */}
      <div className='w-full h-1 bg-gray-200 relative shrink-0'>
        <div
          className='absolute left-0 top-0 h-full bg-green-600 transition-all duration-300 ease-out'
          style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
        >
          <div
            className='absolute right-0 top-0 -translate-y-full translate-x-1/2
                       bg-white shadow-sm border border-gray-200
                       rounded-full px-1.5
                       text-[10px] text-gray-600 whitespace-nowrap'
          >
            {step + 1}/{QUESTIONS.length}
          </div>
        </div>
      </div>

      {/* Main content container - exact height for remaining space */}
      <div className='flex flex-col px-2 pb-2 grow'>
        <div className='flex justify-between items-center shrink-0 mt-2 mb-1'>
          <h1 className='text-base md:text-lg font-bold leading-tight'>
            {t.questions[q.id]}
          </h1>
          <div className='flex gap-2'>
            <button
              onClick={back}
              disabled={step === 0}
              className='bg-gray-300 px-2 py-1 text-xs rounded disabled:opacity-50'
            >
              {t.backButton}
            </button>
            <button
              onClick={next}
              className='bg-green-600 text-white px-2 py-1 text-xs rounded hover:bg-green-700'
            >
              {step < QUESTIONS.length - 1
                ? t.nextButton
                : t.backgroundQuestions}
            </button>
          </div>
        </div>
        <p className='text-[11px] text-gray-600 leading-tight shrink-0 mb-2'>
          {t.dragInstructions}
        </p>

        {/* Cards container - fills remaining space */}
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={order} strategy={rectSortingStrategy}>
            <div
              className='
              grid gap-1.5
              grid-cols-1
              h-[calc(100%-0.5rem)]
              portrait:grid-rows-5 portrait:grid-cols-1 portrait:place-items-center
              landscape:grid-cols-5 landscape:grid-rows-1
            '
            >
              {orderBelongsToCurrentQuestion ? order.map((file, idx) => (
                <SortableMascot
                  key={file}
                  id={file}
                  rank={idx + 1}
                  src={`mascots/${q.id}/${file}`}
                />
              )) : (
                // Show placeholder while order is being updated
                <div className="col-span-full flex items-center justify-center text-gray-500">
                  Loading...
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
