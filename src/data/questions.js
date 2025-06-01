export const CHARACTER_TYPES = ["man", "woman", "animal", "blob", "robot"];
export const STYLE_TYPES = ["realistic", "pixar", "cartoony", "figurative", "toy"];

export const TOPICS = [
  "sales_type",
  "friend_type",
  "coach_type",
  "support_type",
  "mental_type",
  "hr_type",
  "sales_style",
  "friend_style",
  "coach_style",
  "support_style",
  "mental_style",
  "hr_style",
];

export const QUESTIONS = TOPICS.map((id) => ({
  id,
  options: id.endsWith('_type') 
    ? CHARACTER_TYPES.map((t) => `${id}-${t}.png`)
    : STYLE_TYPES.map((s) => `${id}-${s}.png`),
}));

export const LABEL_MAP = {
  // Character types
  man: "Man",
  woman: "Vrouw",
  animal: "Dier",
  blob: "Blob",
  robot: "Robot",
  // Style types
  realistic: "Realistisch",
  pixar: "Pixar-stijl",
  cartoony: "Cartoony-stijl",
  figurative: "Figuratief",
  toy: "Toy-stijl",
};
