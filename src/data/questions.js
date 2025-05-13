export const TYPES = ["man", "woman", "animal", "blob", "robot"];
export const TOPICS = [
  "sales",
  "friend",
  "lover",
  "coach",
  "child",
  "hr",
  "onboarding",
  "support",
  "finance",
  "mental",
];
export const QUESTIONS = TOPICS.map((id) => ({
  id,
  options: TYPES.map((t) => `${id}-${t}.png`),
}));
export const LABEL_MAP = {
  man: "Man",
  woman: "Vrouw",
  animal: "Dier",
  blob: "Blob",
  robot: "Robot",
};
