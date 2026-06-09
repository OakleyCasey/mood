export type MoodKind = "positive" | "negative";
export type BallSize = "small" | "medium" | "large";
export type Atmosphere = "positive" | "negative" | "balanced";

export type Subject = {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type MoodEntry = {
  id: string;
  userId: string;
  subjectId: string;
  kind: MoodKind;
  size: BallSize;
  value: number;
  note: string;
  createdAt: string;
};

export type SubjectPreference = {
  subjectId: string;
  userId: string;
  positiveColor: string;
  negativeColor: string;
  updatedAt: string;
};

export const BALL_VALUES: Record<BallSize, number> = {
  small: 1,
  medium: 2,
  large: 3,
};

export const DEFAULT_PREFERENCES = {
  positiveColor: "#E9A15F",
  negativeColor: "#424247",
};

export const BALL_SIZE_LABELS: Record<BallSize, string> = {
  small: "小",
  medium: "中",
  large: "大",
};

export const KIND_LABELS: Record<MoodKind, string> = {
  positive: "积极",
  negative: "消极",
};

export function createId(prefix = "id") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getNetScore(entries: MoodEntry[]) {
  return entries.reduce((total, entry) => {
    return total + (entry.kind === "positive" ? entry.value : -entry.value);
  }, 0);
}

export function getTotals(entries: MoodEntry[]) {
  return entries.reduce(
    (totals, entry) => {
      if (entry.kind === "positive") {
        totals.positive += entry.value;
      } else {
        totals.negative += entry.value;
      }
      return totals;
    },
    { positive: 0, negative: 0 },
  );
}

export function getAtmosphere(netScore: number): Atmosphere {
  if (netScore > 0) return "positive";
  if (netScore < 0) return "negative";
  return "balanced";
}

export function createDefaultSubject(userId: string): Subject {
  const now = new Date().toISOString();
  return {
    id: createId("subject"),
    userId,
    name: "我的工作",
    createdAt: now,
    updatedAt: now,
  };
}
