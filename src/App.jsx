import React, { useState, useEffect } from 'react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  rectSortingStrategy
} from '@dnd-kit/sortable'
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

  return errors
}

export const validateMascotRankings = (answers, questions) => {
  // Check if we have answers for all questions
  const missingQuestions = questions.filter(q => !answers[q.id] || answers[q.id].length !== 5)
  if (missingQuestions.length > 0) {
    return false
  }

  // Check if each question has valid rankings (all mascots ranked)
  for (const [qid, ranking] of Object.entries(answers)) {
    const question = questions.find(q => q.id === qid)
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
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 639)
  const [isVerified, setIsVerified] = React.useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [step, setStep] = useState('intro')
  const [answers, setAnswers] = useState({})
  const [order, setOrder] = useState([])
  const [form, setForm] = useState({ age: '', gender: '', education: '' })
  const [submitted, setSubmitted] = useState(false)
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'nl')
  const [formErrors, setFormErrors] = useState({})

  // Update localStorage when language changes
  React.useEffect(() => {
    localStorage.setItem('lang', lang)
  }, [lang])

  const t = translations[lang]

  // Language selector component
  const LanguageSelector = () => (
    <div className='flex gap-1'>
      <button
        onClick={() => setLang('nl')}
        className={`w-7 h-5 overflow-hidden rounded-sm border ${lang === 'nl' ? 'border-blue-500 shadow' : 'border-gray-300'}`}
      >
        <img
          src='/flags/nl.svg'
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
          src='/flags/gb.svg'
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
      setOrder(answers[qid] ?? QUESTIONS[step].options)

      // Prefetch images for the next question
      if (step + 1 < QUESTIONS.length) {
        const nextQ = QUESTIONS[step + 1]
        nextQ.options.forEach(file => {
          const img = new Image()
          img.src = `mascots/${nextQ.id}/${file}`
        })
      }
    }
  }, [step])

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
        alert('Zorg ervoor dat alle mascottes zijn gerangschikt voordat je de enquête verstuurt.')
        return
      }

      // Format the answers into individual columns
      const formattedAnswers = Object.entries(answers).reduce((acc, [qid, arr]) => {
        const orig = QUESTIONS.find((q) => q.id === qid).options
        const rankString = arr.map(opt => (orig.indexOf(opt) + 1).toString()).join('')
        acc[qid] = rankString
        return acc
      }, {})

      // Prepare the data in SheetDB format
      const payload = {
        data: [{
          timestamp: new Date().toISOString(),
          age: form.age,
          gender: form.gender,
          education: form.education,
          userAgent: navigator.userAgent,
          ...formattedAnswers
        }]
      }

      console.log('Submitting data:', payload)

      const response = await fetch(import.meta.env.VITE_SHEET_DB_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Submission failed: ${response.status}`)
      }

      const result = await response.json()
      console.log('Submission successful:', result)

      await markAsSubmitted()
      setSubmitted(true)
    } catch (error) {
      console.error('Submission error:', error)
      alert('Er is een fout opgetreden bij het versturen van de gegevens. Probeer het opnieuw.')
    }
  }

  if (hasSubmitted || submitted) {
    return (
      <div className='p-8 space-y-4'>
        <EnvironmentCheck />
        <div className='flex justify-end mb-8'>
          <LanguageSelector />
        </div>
        <div className='text-center'>
          <div className='text-xl'>{t.alreadySubmitted}</div>
          <div className='text-gray-600'>{t.noMultiple}</div>
          <div className='text-gray-600'>{t.thanks}</div>
        </div>
        <div className='flex justify-center mt-8'>
          <img
            src='logo/notsoAI-logoLine.svg'
            alt='NotSoAI Logo'
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
          <CaptchaVerification onVerify={setIsVerified} />
        </div>
        <div className='flex justify-center mt-8'>
          <img
            src='logo/notsoAI-logoLine.svg'
            alt='NotSoAI Logo'
            className='h-5 w-auto'
          />
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className='p-8'>
        <div className='flex justify-end mb-8'>
          <LanguageSelector />
        </div>
        <div className='text-center text-xl'>
          {t.thanks}
        </div>
        <div className='flex justify-center mt-8'>
          <img
            src='logo/notsoAI-logoLine.svg'
            alt='NotSoAI Logo'
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
            alt='NotSoAI Logo'
            className='h-5 w-auto'
          />
        </div>
      </div>
    )
  }

  if (step === 'form') {
    return (
      <div className='max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6'>
        <div className='flex justify-end mb-8'>
          <LanguageSelector />
        </div>
        <div className='text-center mb-8'>
          <h1 className='text-2xl font-bold'>{t.finalQuestions}</h1>
        </div>
        <div className='max-w-md mx-auto space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              {t.age}
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
              {t.gender}
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
              {t.education}
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
              <p className='mt-1 text-sm text-red-600'>{formErrors.education}</p>
            )}
          </div>
          <div className='pt-4'>
            <button
              onClick={submit}
              disabled={!form.age || !form.gender || !form.education}
              className='w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
            >
              {t.submitButton}
            </button>
          </div>
        </div>
        <div className='flex justify-center mt-8'>
          <img
            src='logo/notsoAI-logoLine.svg'
            alt='NotSoAI Logo'
            className='h-5 w-auto'
          />
        </div>
      </div>
    )
  }

  const q = QUESTIONS[step]
  return (
    <div className='fixed inset-0 flex flex-col'>
      {/* Header - minimal fixed height */}
      <div className='flex justify-between items-center h-8 px-2 shrink-0'>
        <img
          src='logo/notsoAI-logoLine.svg'
          alt='NotSoAI Logo'
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
        <h1 className='text-base md:text-lg font-bold leading-tight mt-2 mb-1 shrink-0'>{t.questions[q.id]}</h1>
        <p className='text-[11px] text-gray-600 leading-tight shrink-0 mb-2'>
          {t.dragInstructions}
        </p>

        {/* Cards container - fills remaining space */}
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={order}
            strategy={rectSortingStrategy}
          >
            <div className='
              grid gap-1.5
              grid-cols-1
              h-[calc(100%-0.5rem)]
              portrait:grid-rows-5 portrait:grid-cols-1
              landscape:grid-cols-5 landscape:grid-rows-1
            '
            >
              {order.map((file, idx) => (
                <SortableMascot
                  key={file}
                  id={file}
                  rank={idx + 1}
                  src={`mascots/${q.id}/${file}`}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Navigation buttons - minimal height */}
        <div className='flex justify-between mt-1 h-8 shrink-0'>
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
            {step < QUESTIONS.length - 1 ? t.nextButton : t.backgroundQuestions}
          </button>
        </div>
      </div>
    </div>
  )
}
