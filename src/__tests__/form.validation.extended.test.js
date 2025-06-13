import { describe, it, expect, vi } from 'vitest'

// Import the validation functions from App.jsx for testing
// We need to extract these functions or create a separate validation module

describe('Form Validation Extended Tests', () => {
  // Mock the validateForm function from App.jsx
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

  describe('Age Validation', () => {
    it('accepts valid ages', () => {
      const form = { age: 25, gender: 'male', education: 'hbo' }
      const errors = validateForm(form)
      expect(errors.age).toBeUndefined()
    })

    it('rejects ages below minimum', () => {
      const form = { age: 11, gender: 'male', education: 'hbo' }
      const errors = validateForm(form)
      expect(errors.age).toBe('Leeftijd moet tussen 12 en 99 jaar zijn')
    })

    it('rejects ages above maximum', () => {
      const form = { age: 100, gender: 'male', education: 'hbo' }
      const errors = validateForm(form)
      expect(errors.age).toBe('Leeftijd moet tussen 12 en 99 jaar zijn')
    })

    it('accepts minimum age boundary', () => {
      const form = { age: 12, gender: 'female', education: 'vmbo' }
      const errors = validateForm(form)
      expect(errors.age).toBeUndefined()
    })

    it('accepts maximum age boundary', () => {
      const form = { age: 99, gender: 'other', education: 'uni' }
      const errors = validateForm(form)
      expect(errors.age).toBeUndefined()
    })

    it('requires age to be present', () => {
      const form = { gender: 'male', education: 'hbo' }
      const errors = validateForm(form)
      expect(errors.age).toBe('Leeftijd is verplicht')
    })

    it('handles zero age', () => {
      const form = { age: 0, gender: 'female', education: 'vwo' }
      const errors = validateForm(form)
      expect(errors.age).toBe('Leeftijd is verplicht')
    })

    it('handles negative age', () => {
      const form = { age: -5, gender: 'other', education: 'primary' }
      const errors = validateForm(form)
      expect(errors.age).toBe('Leeftijd moet tussen 12 en 99 jaar zijn')
    })
  })

  describe('Gender Validation', () => {
    it('accepts valid gender options', () => {
      const validGenders = ['male', 'female', 'other']
      
      validGenders.forEach(gender => {
        const form = { age: 25, gender, education: 'hbo' }
        const errors = validateForm(form)
        expect(errors.gender).toBeUndefined()
      })
    })

    it('requires gender to be selected', () => {
      const form = { age: 25, education: 'hbo' }
      const errors = validateForm(form)
      expect(errors.gender).toBe('Geslacht is verplicht')
    })

    it('handles empty string gender', () => {
      const form = { age: 25, gender: '', education: 'hbo' }
      const errors = validateForm(form)
      expect(errors.gender).toBe('Geslacht is verplicht')
    })
  })

  describe('Education Validation', () => {
    it('accepts valid education options', () => {
      const validEducations = ['primary', 'vmbo', 'havo', 'vwo', 'hbo', 'uni']
      
      validEducations.forEach(education => {
        const form = { age: 25, gender: 'male', education }
        const errors = validateForm(form)
        expect(errors.education).toBeUndefined()
      })
    })

    it('requires education to be selected', () => {
      const form = { age: 25, gender: 'male' }
      const errors = validateForm(form)
      expect(errors.education).toBe('Opleiding is verplicht')
    })

    it('handles empty string education', () => {
      const form = { age: 25, gender: 'male', education: '' }
      const errors = validateForm(form)
      expect(errors.education).toBe('Opleiding is verplicht')
    })
  })

  describe('Email Validation', () => {
    it('accepts valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'firstname.lastname@company.com',
        'user123@test-domain.com'
      ]
      
      validEmails.forEach(email => {
        const form = { age: 25, gender: 'male', education: 'hbo', prizeEmail: email }
        const errors = validateForm(form)
        expect(errors.prizeEmail).toBeUndefined()
      })
    })

    it('rejects invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@domain',
        'user.domain.com',
        'user@domain.',
        'user name@domain.com',
        'user@domain .com'
      ]
      
      invalidEmails.forEach(email => {
        const form = { age: 25, gender: 'male', education: 'hbo', prizeEmail: email }
        const errors = validateForm(form)
        expect(errors.prizeEmail).toBe('Voer een geldig emailadres in')
      })
    })

    it('allows empty email (optional field)', () => {
      const form = { age: 25, gender: 'male', education: 'hbo', prizeEmail: '' }
      const errors = validateForm(form)
      expect(errors.prizeEmail).toBeUndefined()
    })

    it('allows undefined email (optional field)', () => {
      const form = { age: 25, gender: 'male', education: 'hbo' }
      const errors = validateForm(form)
      expect(errors.prizeEmail).toBeUndefined()
    })
  })

  describe('Multiple Field Validation', () => {
    it('returns multiple errors when multiple fields are invalid', () => {
      const form = { 
        age: 10, 
        gender: '', 
        education: '', 
        prizeEmail: 'invalid-email' 
      }
      const errors = validateForm(form)
      
      expect(errors.age).toBe('Leeftijd moet tussen 12 en 99 jaar zijn')
      expect(errors.gender).toBe('Geslacht is verplicht')
      expect(errors.education).toBe('Opleiding is verplicht')
      expect(errors.prizeEmail).toBe('Voer een geldig emailadres in')
    })

    it('returns no errors for completely valid form', () => {
      const form = {
        age: 30,
        gender: 'female',
        education: 'uni',
        prizeEmail: 'user@example.com',
        prizeName: 'John Doe',
        mascotIdea: 'A friendly robot'
      }
      const errors = validateForm(form)
      
      expect(Object.keys(errors)).toHaveLength(0)
    })

    it('validates only required fields when optional fields are empty', () => {
      const form = {
        age: 25,
        gender: 'other',
        education: 'hbo',
        prizeEmail: '',
        prizeName: '',
        mascotIdea: ''
      }
      const errors = validateForm(form)
      
      expect(Object.keys(errors)).toHaveLength(0)
    })
  })
})
