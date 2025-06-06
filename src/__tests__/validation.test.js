import { describe, it, expect } from 'vitest'
import { validateMascotRankings } from '../App.jsx'

const questions = [
  { id: 'q1', options: ['a', 'b', 'c', 'd', 'e'] },
  { id: 'q2', options: ['a', 'b', 'c', 'd', 'e'] }
]

describe('validateMascotRankings', () => {
  it('returns false when rankings are missing', () => {
    const answers = { q1: ['a', 'b', 'c', 'd', 'e'] }
    expect(validateMascotRankings(answers, questions)).toBe(false)
  })

  it('returns false when rankings contain duplicates', () => {
    const answers = {
      q1: ['a', 'b', 'b', 'd', 'e'],
      q2: ['a', 'b', 'c', 'd', 'e']
    }
    expect(validateMascotRankings(answers, questions)).toBe(false)
  })

  it('returns true for valid rankings', () => {
    const answers = {
      q1: ['a', 'b', 'c', 'd', 'e'],
      q2: ['e', 'd', 'c', 'b', 'a']
    }
    expect(validateMascotRankings(answers, questions)).toBe(true)
  })
})
