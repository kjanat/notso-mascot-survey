import { describe, it, expect } from 'vitest'
import { QUESTIONS, CHARACTER_TYPES, STYLE_TYPES, TOPICS } from '../data/questions.js'
import { translations } from '../data/translations.js'

describe('Questions Data Integrity', () => {
  it('has the correct number of questions', () => {
    expect(QUESTIONS).toHaveLength(12)
  })

  it('all questions have valid structure', () => {
    QUESTIONS.forEach(question => {
      expect(question).toHaveProperty('id')
      expect(question).toHaveProperty('options')
      expect(question.id).toMatch(/^(friend|sales|support|coach|hr|mental)_(type|style)$/)
      expect(question.options).toHaveLength(5)
    })
  })

  it('type questions have character type options', () => {
    const typeQuestions = QUESTIONS.filter(q => q.id.endsWith('_type'))
    typeQuestions.forEach(question => {
      CHARACTER_TYPES.forEach(type => {
        const expectedOption = `${question.id}-${type}.webp`
        expect(question.options).toContain(expectedOption)
      })
    })
  })

  it('style questions have style type options', () => {
    const styleQuestions = QUESTIONS.filter(q => q.id.endsWith('_style'))
    styleQuestions.forEach(question => {
      STYLE_TYPES.forEach(style => {
        const expectedOption = `${question.id}-${style}.webp`
        expect(question.options).toContain(expectedOption)
      })
    })
  })

  it('TOPICS array matches generated questions', () => {
    const questionIds = QUESTIONS.map(q => q.id).sort()
    const sortedTopics = [...TOPICS].sort()
    expect(questionIds).toEqual(sortedTopics)
  })

  it('has balanced type and style questions', () => {
    const typeQuestions = QUESTIONS.filter(q => q.id.endsWith('_type'))
    const styleQuestions = QUESTIONS.filter(q => q.id.endsWith('_style'))
    
    expect(typeQuestions).toHaveLength(6)
    expect(styleQuestions).toHaveLength(6)
  })
})

describe('Translations Data Integrity', () => {
  it('has both nl and en translations', () => {
    expect(translations).toHaveProperty('nl')
    expect(translations).toHaveProperty('en')
  })

  it('both languages have the same structure', () => {
    const nlKeys = Object.keys(translations.nl).sort()
    const enKeys = Object.keys(translations.en).sort()
    expect(nlKeys).toEqual(enKeys)
  })

  it('both languages have question translations for all question IDs', () => {
    const languages = ['nl', 'en']
    
    languages.forEach(lang => {
      expect(translations[lang]).toHaveProperty('questions')
      
      QUESTIONS.forEach(question => {
        expect(translations[lang].questions).toHaveProperty(question.id)
        expect(typeof translations[lang].questions[question.id]).toBe('string')
        expect(translations[lang].questions[question.id].length).toBeGreaterThan(0)
      })
    })
  })

  it('has all required form field translations', () => {
    const requiredFields = ['age', 'gender', 'education', 'submitButton']
    const languages = ['nl', 'en']
    
    languages.forEach(lang => {
      requiredFields.forEach(field => {
        expect(translations[lang]).toHaveProperty(field)
        expect(typeof translations[lang][field]).toBe('string')
        expect(translations[lang][field].length).toBeGreaterThan(0)
      })
    })
  })

  it('has gender options for both languages', () => {
    const languages = ['nl', 'en']
    const requiredGenderOptions = ['placeholder', 'male', 'female', 'other']
    
    languages.forEach(lang => {
      expect(translations[lang]).toHaveProperty('genderOptions')
      requiredGenderOptions.forEach(option => {
        expect(translations[lang].genderOptions).toHaveProperty(option)
        expect(typeof translations[lang].genderOptions[option]).toBe('string')
      })
    })
  })

  it('has education options for both languages', () => {
    const languages = ['nl', 'en']
    const requiredEducationOptions = ['placeholder', 'primary', 'vmbo', 'havo', 'vwo', 'hbo', 'uni']
    
    languages.forEach(lang => {
      expect(translations[lang]).toHaveProperty('educationOptions')
      requiredEducationOptions.forEach(option => {
        expect(translations[lang].educationOptions).toHaveProperty(option)
        expect(typeof translations[lang].educationOptions[option]).toBe('string')
      })
    })
  })
})
