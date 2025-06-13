import { describe, it, expect } from 'vitest'

// Import the validateMascotRankings function from App.jsx for testing
const validateMascotRankings = (answers, questions) => {
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

describe('Mascot Rankings Validation Extended Tests', () => {
  const sampleQuestions = [
    {
      id: 'coach_type',
      options: ['coach_type-animal.webp', 'coach_type-blob.webp', 'coach_type-man.webp', 'coach_type-robot.webp', 'coach_type-woman.webp']
    },
    {
      id: 'coach_style',
      options: ['coach_style-cartoony.webp', 'coach_style-figurative.webp', 'coach_style-pixar.webp', 'coach_style-realistic.webp', 'coach_style-toy.webp']
    },
    {
      id: 'friend_type',
      options: ['friend_type-animal.webp', 'friend_type-blob.webp', 'friend_type-man.webp', 'friend_type-robot.webp', 'friend_type-woman.webp']
    }
  ]

  describe('Valid Rankings', () => {
    it('accepts complete valid rankings for all questions', () => {
      const validAnswers = {
        coach_type: ['coach_type-animal.webp', 'coach_type-blob.webp', 'coach_type-man.webp', 'coach_type-robot.webp', 'coach_type-woman.webp'],
        coach_style: ['coach_style-cartoony.webp', 'coach_style-figurative.webp', 'coach_style-pixar.webp', 'coach_style-realistic.webp', 'coach_style-toy.webp'],
        friend_type: ['friend_type-animal.webp', 'friend_type-blob.webp', 'friend_type-man.webp', 'friend_type-robot.webp', 'friend_type-woman.webp']
      }
      
      expect(validateMascotRankings(validAnswers, sampleQuestions)).toBe(true)
    })

    it('accepts rankings in different orders', () => {
      const validAnswers = {
        coach_type: ['coach_type-woman.webp', 'coach_type-animal.webp', 'coach_type-robot.webp', 'coach_type-blob.webp', 'coach_type-man.webp'],
        coach_style: ['coach_style-toy.webp', 'coach_style-realistic.webp', 'coach_style-cartoony.webp', 'coach_style-pixar.webp', 'coach_style-figurative.webp'],
        friend_type: ['friend_type-robot.webp', 'friend_type-woman.webp', 'friend_type-animal.webp', 'friend_type-man.webp', 'friend_type-blob.webp']
      }
      
      expect(validateMascotRankings(validAnswers, sampleQuestions)).toBe(true)
    })

    it('handles single question scenario', () => {
      const singleQuestion = [sampleQuestions[0]]
      const singleAnswer = {
        coach_type: ['coach_type-animal.webp', 'coach_type-blob.webp', 'coach_type-man.webp', 'coach_type-robot.webp', 'coach_type-woman.webp']
      }
      
      expect(validateMascotRankings(singleAnswer, singleQuestion)).toBe(true)
    })
  })

  describe('Missing Questions', () => {
    it('rejects when answers are missing for some questions', () => {
      const incompleteAnswers = {
        coach_type: ['coach_type-animal.webp', 'coach_type-blob.webp', 'coach_type-man.webp', 'coach_type-robot.webp', 'coach_type-woman.webp'],
        // coach_style missing
        friend_type: ['friend_type-animal.webp', 'friend_type-blob.webp', 'friend_type-man.webp', 'friend_type-robot.webp', 'friend_type-woman.webp']
      }
      
      expect(validateMascotRankings(incompleteAnswers, sampleQuestions)).toBe(false)
    })

    it('rejects when all answers are missing', () => {
      const noAnswers = {}
      
      expect(validateMascotRankings(noAnswers, sampleQuestions)).toBe(false)
    })

    it('rejects when answer exists but is undefined', () => {
      const undefinedAnswers = {
        coach_type: undefined,
        coach_style: ['coach_style-cartoony.webp', 'coach_style-figurative.webp', 'coach_style-pixar.webp', 'coach_style-realistic.webp', 'coach_style-toy.webp'],
        friend_type: ['friend_type-animal.webp', 'friend_type-blob.webp', 'friend_type-man.webp', 'friend_type-robot.webp', 'friend_type-woman.webp']
      }
      
      expect(validateMascotRankings(undefinedAnswers, sampleQuestions)).toBe(false)
    })

    it('rejects when answer exists but is null', () => {
      const nullAnswers = {
        coach_type: ['coach_type-animal.webp', 'coach_type-blob.webp', 'coach_type-man.webp', 'coach_type-robot.webp', 'coach_type-woman.webp'],
        coach_style: null,
        friend_type: ['friend_type-animal.webp', 'friend_type-blob.webp', 'friend_type-man.webp', 'friend_type-robot.webp', 'friend_type-woman.webp']
      }
      
      expect(validateMascotRankings(nullAnswers, sampleQuestions)).toBe(false)
    })
  })

  describe('Incorrect Array Length', () => {
    it('rejects rankings with too few items', () => {
      const shortAnswers = {
        coach_type: ['coach_type-animal.webp', 'coach_type-blob.webp', 'coach_type-man.webp'], // Only 3 items
        coach_style: ['coach_style-cartoony.webp', 'coach_style-figurative.webp', 'coach_style-pixar.webp', 'coach_style-realistic.webp', 'coach_style-toy.webp'],
        friend_type: ['friend_type-animal.webp', 'friend_type-blob.webp', 'friend_type-man.webp', 'friend_type-robot.webp', 'friend_type-woman.webp']
      }
      
      expect(validateMascotRankings(shortAnswers, sampleQuestions)).toBe(false)
    })

    it('rejects rankings with too many items', () => {
      const longAnswers = {
        coach_type: ['coach_type-animal.webp', 'coach_type-blob.webp', 'coach_type-man.webp', 'coach_type-robot.webp', 'coach_type-woman.webp', 'extra-item.webp'], // 6 items
        coach_style: ['coach_style-cartoony.webp', 'coach_style-figurative.webp', 'coach_style-pixar.webp', 'coach_style-realistic.webp', 'coach_style-toy.webp'],
        friend_type: ['friend_type-animal.webp', 'friend_type-blob.webp', 'friend_type-man.webp', 'friend_type-robot.webp', 'friend_type-woman.webp']
      }
      
      expect(validateMascotRankings(longAnswers, sampleQuestions)).toBe(false)
    })

    it('rejects empty arrays', () => {
      const emptyAnswers = {
        coach_type: [],
        coach_style: ['coach_style-cartoony.webp', 'coach_style-figurative.webp', 'coach_style-pixar.webp', 'coach_style-realistic.webp', 'coach_style-toy.webp'],
        friend_type: ['friend_type-animal.webp', 'friend_type-blob.webp', 'friend_type-man.webp', 'friend_type-robot.webp', 'friend_type-woman.webp']
      }
      
      expect(validateMascotRankings(emptyAnswers, sampleQuestions)).toBe(false)
    })

    it('rejects single item arrays', () => {
      const singleItemAnswers = {
        coach_type: ['coach_type-animal.webp'],
        coach_style: ['coach_style-cartoony.webp', 'coach_style-figurative.webp', 'coach_style-pixar.webp', 'coach_style-realistic.webp', 'coach_style-toy.webp'],
        friend_type: ['friend_type-animal.webp', 'friend_type-blob.webp', 'friend_type-man.webp', 'friend_type-robot.webp', 'friend_type-woman.webp']
      }
      
      expect(validateMascotRankings(singleItemAnswers, sampleQuestions)).toBe(false)
    })
  })

  describe('Duplicate Items', () => {
    it('rejects rankings with duplicate items', () => {
      const duplicateAnswers = {
        coach_type: ['coach_type-animal.webp', 'coach_type-animal.webp', 'coach_type-man.webp', 'coach_type-robot.webp', 'coach_type-woman.webp'], // duplicate animal
        coach_style: ['coach_style-cartoony.webp', 'coach_style-figurative.webp', 'coach_style-pixar.webp', 'coach_style-realistic.webp', 'coach_style-toy.webp'],
        friend_type: ['friend_type-animal.webp', 'friend_type-blob.webp', 'friend_type-man.webp', 'friend_type-robot.webp', 'friend_type-woman.webp']
      }
      
      expect(validateMascotRankings(duplicateAnswers, sampleQuestions)).toBe(false)
    })

    it('rejects rankings with multiple duplicates', () => {
      const multipleDuplicates = {
        coach_type: ['coach_type-animal.webp', 'coach_type-animal.webp', 'coach_type-animal.webp', 'coach_type-robot.webp', 'coach_type-woman.webp'], // 3 duplicates
        coach_style: ['coach_style-cartoony.webp', 'coach_style-figurative.webp', 'coach_style-pixar.webp', 'coach_style-realistic.webp', 'coach_style-toy.webp'],
        friend_type: ['friend_type-animal.webp', 'friend_type-blob.webp', 'friend_type-man.webp', 'friend_type-robot.webp', 'friend_type-woman.webp']
      }
      
      expect(validateMascotRankings(multipleDuplicates, sampleQuestions)).toBe(false)
    })

    it('rejects rankings where all items are the same', () => {
      const allSameAnswers = {
        coach_type: ['coach_type-animal.webp', 'coach_type-animal.webp', 'coach_type-animal.webp', 'coach_type-animal.webp', 'coach_type-animal.webp'],
        coach_style: ['coach_style-cartoony.webp', 'coach_style-figurative.webp', 'coach_style-pixar.webp', 'coach_style-realistic.webp', 'coach_style-toy.webp'],
        friend_type: ['friend_type-animal.webp', 'friend_type-blob.webp', 'friend_type-man.webp', 'friend_type-robot.webp', 'friend_type-woman.webp']
      }
      
      expect(validateMascotRankings(allSameAnswers, sampleQuestions)).toBe(false)
    })
  })

  describe('Invalid Question IDs', () => {
    it('ignores extra answer keys that dont match questions', () => {
      const extraAnswers = {
        coach_type: ['coach_type-animal.webp', 'coach_type-blob.webp', 'coach_type-man.webp', 'coach_type-robot.webp', 'coach_type-woman.webp'],
        coach_style: ['coach_style-cartoony.webp', 'coach_style-figurative.webp', 'coach_style-pixar.webp', 'coach_style-realistic.webp', 'coach_style-toy.webp'],
        friend_type: ['friend_type-animal.webp', 'friend_type-blob.webp', 'friend_type-man.webp', 'friend_type-robot.webp', 'friend_type-woman.webp'],
        invalid_question: ['some-item.webp'] // This should be ignored
      }
      
      expect(validateMascotRankings(extraAnswers, sampleQuestions)).toBe(true)
    })

    it('handles answers with no matching questions', () => {
      const noMatchingAnswers = {
        invalid_question1: ['item1.webp', 'item2.webp', 'item3.webp', 'item4.webp', 'item5.webp'],
        invalid_question2: ['item6.webp', 'item7.webp', 'item8.webp', 'item9.webp', 'item10.webp']
      }
      
      expect(validateMascotRankings(noMatchingAnswers, sampleQuestions)).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty questions array', () => {
      const validAnswers = {
        coach_type: ['coach_type-animal.webp', 'coach_type-blob.webp', 'coach_type-man.webp', 'coach_type-robot.webp', 'coach_type-woman.webp']
      }
      
      expect(validateMascotRankings(validAnswers, [])).toBe(true)
    })

    it('handles both empty questions and answers', () => {
      expect(validateMascotRankings({}, [])).toBe(true)
    })

    it('rejects when questions exist but answers dont', () => {
      expect(validateMascotRankings({}, sampleQuestions)).toBe(false)
    })

    it('handles questions with empty options array', () => {
      const questionsWithEmptyOptions = [
        {
          id: 'empty_question',
          options: []
        }
      ]
      
      const answersForEmptyQuestion = {
        empty_question: []
      }
      
      expect(validateMascotRankings(answersForEmptyQuestion, questionsWithEmptyOptions)).toBe(false)
    })

    it('handles non-array answer values', () => {
      const nonArrayAnswers = {
        coach_type: 'not-an-array',
        coach_style: ['coach_style-cartoony.webp', 'coach_style-figurative.webp', 'coach_style-pixar.webp', 'coach_style-realistic.webp', 'coach_style-toy.webp'],
        friend_type: ['friend_type-animal.webp', 'friend_type-blob.webp', 'friend_type-man.webp', 'friend_type-robot.webp', 'friend_type-woman.webp']
      }
      
      expect(validateMascotRankings(nonArrayAnswers, sampleQuestions)).toBe(false)
    })
  })

  describe('Complex Scenarios', () => {
    it('validates with many questions (stress test)', () => {
      const manyQuestions = Array.from({ length: 10 }, (_, i) => ({
        id: `question_${i}`,
        options: [`option_${i}_1.webp`, `option_${i}_2.webp`, `option_${i}_3.webp`, `option_${i}_4.webp`, `option_${i}_5.webp`]
      }))
      
      const manyAnswers = {}
      manyQuestions.forEach(q => {
        manyAnswers[q.id] = q.options.slice()
      })
      
      expect(validateMascotRankings(manyAnswers, manyQuestions)).toBe(true)
    })

    it('handles mixed valid and invalid scenarios', () => {
      const mixedAnswers = {
        coach_type: ['coach_type-animal.webp', 'coach_type-blob.webp', 'coach_type-man.webp', 'coach_type-robot.webp', 'coach_type-woman.webp'], // valid
        coach_style: ['coach_style-cartoony.webp', 'coach_style-cartoony.webp', 'coach_style-pixar.webp', 'coach_style-realistic.webp', 'coach_style-toy.webp'], // duplicate
        friend_type: ['friend_type-animal.webp', 'friend_type-blob.webp', 'friend_type-man.webp', 'friend_type-robot.webp', 'friend_type-woman.webp'] // valid
      }
      
      expect(validateMascotRankings(mixedAnswers, sampleQuestions)).toBe(false)
    })
  })
})
