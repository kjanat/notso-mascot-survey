import { describe, it, expect } from 'vitest'

// Extracted validation functions for testing
const validateForm = (form) => {
  const errors = {}
  
  // Age validation
  if (!form.age || form.age === '' || form.age === 0) {
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

const validateMascotRankings = (answers, questions) => {
  // Check if we have answers for all questions
  const missingQuestions = questions.filter(
    (q) => !answers[q.id] || answers[q.id].length !== 5
  )
  if (missingQuestions.length > 0) {
    return false
  }

  // Check for duplicates within each ranking
  for (const questionId of Object.keys(answers)) {
    const ranking = answers[questionId]
    const uniqueRankings = new Set(ranking)
    if (uniqueRankings.size !== 5) {
      return false
    }
  }

  return true
}

const questions = [
  { id: 'q1', options: ['a', 'b', 'c', 'd', 'e'] },
  { id: 'q2', options: ['a', 'b', 'c', 'd', 'e'] }
]

describe('validateForm', () => {
  it('returns errors for empty form', () => {
    const form = { age: '', gender: '', education: '', prizeEmail: '' }
    const errors = validateForm(form)
    
    expect(errors.age).toBe('Leeftijd is verplicht')
    expect(errors.gender).toBe('Geslacht is verplicht')
    expect(errors.education).toBe('Opleiding is verplicht')
    expect(errors.prizeEmail).toBeUndefined() // Email is optional
  })

  it('validates age boundaries correctly', () => {
    // Test valid ages
    const validAges = [12, 25, 99]
    validAges.forEach(age => {
      const form = { age, gender: 'male', education: 'hbo', prizeEmail: '' }
      const errors = validateForm(form)
      expect(errors.age).toBeUndefined()
    })

    // Test invalid ages (out of range)
    const invalidAges = [11, 100, -5]
    invalidAges.forEach(age => {
      const form = { age, gender: 'male', education: 'hbo', prizeEmail: '' }
      const errors = validateForm(form)
      expect(errors.age).toBe('Leeftijd moet tussen 12 en 99 jaar zijn')
    })

    // Test required ages (missing/empty)
    const emptyAges = [null, undefined, '', 0]
    emptyAges.forEach(age => {
      const form = { age, gender: 'male', education: 'hbo', prizeEmail: '' }
      const errors = validateForm(form)
      expect(errors.age).toBe('Leeftijd is verplicht')
    })
  })

  it('validates email format when provided', () => {
    const validEmails = ['test@example.com', 'user.name+tag@domain.co.uk', 'test123@test-domain.com']
    const invalidEmails = ['invalid', 'test@', '@domain.com', 'test@domain', 'test.domain.com']

    validEmails.forEach(email => {
      const form = { age: 25, gender: 'male', education: 'hbo', prizeEmail: email }
      const errors = validateForm(form)
      expect(errors.prizeEmail).toBeUndefined()
    })

    invalidEmails.forEach(email => {
      const form = { age: 25, gender: 'male', education: 'hbo', prizeEmail: email }
      const errors = validateForm(form)
      expect(errors.prizeEmail).toBe('Voer een geldig emailadres in')
    })
  })

  it('allows empty email', () => {
    const form = { age: 25, gender: 'male', education: 'hbo', prizeEmail: '' }
    const errors = validateForm(form)
    expect(errors.prizeEmail).toBeUndefined()
  })

  it('returns no errors for valid complete form', () => {
    const form = {
      age: 25,
      gender: 'female',
      education: 'university',
      prizeEmail: 'test@example.com'
    }
    const errors = validateForm(form)
    expect(Object.keys(errors)).toHaveLength(0)
  })
})

describe('validateMascotRankings', () => {
  it('returns false when rankings are missing', () => {
    const answers = {}
    expect(validateMascotRankings(answers, questions)).toBe(false)
  })

  it('returns false when rankings contain duplicates', () => {
    const answers = {
      'q1': ['a', 'a', 'b', 'c', 'd'], // duplicate 'a'
      'q2': ['a', 'b', 'c', 'd', 'e']
    }
    expect(validateMascotRankings(answers, questions)).toBe(false)
  })

  it('returns false when rankings are incomplete', () => {
    const answers = {
      'q1': ['a', 'b', 'c'], // only 3 items
      'q2': ['a', 'b', 'c', 'd', 'e']
    }
    expect(validateMascotRankings(answers, questions)).toBe(false)
  })

  it('returns false when rankings have too many items', () => {
    const answers = {
      'q1': ['a', 'b', 'c', 'd', 'e', 'f'], // 6 items
      'q2': ['a', 'b', 'c', 'd', 'e']
    }
    expect(validateMascotRankings(answers, questions)).toBe(false)
  })

  it('returns false when answers object is empty', () => {
    expect(validateMascotRankings({}, questions)).toBe(false)
  })

  it('returns true for valid rankings', () => {
    const answers = {
      'q1': ['a', 'b', 'c', 'd', 'e'],
      'q2': ['e', 'd', 'c', 'b', 'a']
    }
    expect(validateMascotRankings(answers, questions)).toBe(true)
  })

  it('handles single question correctly', () => {
    const singleQuestion = [{ id: 'q1', options: ['a', 'b', 'c', 'd', 'e'] }]
    const answers = { 'q1': ['c', 'a', 'e', 'b', 'd'] }
    expect(validateMascotRankings(answers, singleQuestion)).toBe(true)
  })
})
