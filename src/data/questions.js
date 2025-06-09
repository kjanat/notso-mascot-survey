export const CHARACTER_TYPES = ['man', 'woman', 'animal', 'blob', 'robot']
export const STYLE_TYPES = ['toy', 'figurative', 'cartoony', 'pixar', 'realistic']

export const TOPICS = [
  'friend_type',
  'sales_type',
  'support_type',
  'coach_type',
  'hr_type',
  'mental_type',
  'friend_style',
  'sales_style',
  'support_style',
  'coach_style',
  'hr_style',
  'mental_style'
]

export const QUESTIONS = TOPICS.map((id) => ({
  id,
  options: id.endsWith('_type')
    ? CHARACTER_TYPES.map((t) => `${id}-${t}.png`)
    : STYLE_TYPES.map((s) => `${id}-${s}.png`)
}))

export const LABEL_MAP = {
  nl: {
    // Character types
    man: 'Man',
    woman: 'Vrouw',
    animal: 'Dier',
    blob: 'Blob',
    robot: 'Robot',
    // Style types
    realistic: 'Realistisch',
    pixar: 'Gestileerd',
    cartoony: 'Cartoony-stijl',
    figurative: 'Figuratief',
    toy: 'Toy-stijl'
  },
  en: {
    // Character types
    man: 'Man',
    woman: 'Woman',
    animal: 'Animal',
    blob: 'Blob',
    robot: 'Robot',
    // Style types
    realistic: 'Realistic',
    pixar: 'Stylized',
    cartoony: 'Cartoony-style',
    figurative: 'Figurative',
    toy: 'Toy-style'
  }
}
