import { describe, it, expect } from 'vitest'
import { isEnvVariableTrue } from '../utils/env.js'

describe('isEnvVariableTrue', () => {
  it('returns true for string "true"', () => {
    expect(isEnvVariableTrue('true')).toBe(true)
  })

  it('returns false for string "false"', () => {
    expect(isEnvVariableTrue('false')).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isEnvVariableTrue(undefined)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isEnvVariableTrue(null)).toBe(false)
  })

  it('returns false for boolean true (not string)', () => {
    expect(isEnvVariableTrue(true)).toBe(false)
  })

  it('returns false for boolean false', () => {
    expect(isEnvVariableTrue(false)).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isEnvVariableTrue('')).toBe(false)
  })

  it('returns false for "TRUE" (case sensitive)', () => {
    expect(isEnvVariableTrue('TRUE')).toBe(false)
  })

  it('returns false for "True"', () => {
    expect(isEnvVariableTrue('True')).toBe(false)
  })

  it('returns false for number 1', () => {
    expect(isEnvVariableTrue(1)).toBe(false)
  })

  it('returns false for number 0', () => {
    expect(isEnvVariableTrue(0)).toBe(false)
  })

  it('returns false for arbitrary strings', () => {
    expect(isEnvVariableTrue('yes')).toBe(false)
    expect(isEnvVariableTrue('on')).toBe(false)
    expect(isEnvVariableTrue('enabled')).toBe(false)
  })
})
