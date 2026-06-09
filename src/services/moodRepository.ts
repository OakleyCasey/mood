import {
  BALL_VALUES,
  DEFAULT_PREFERENCES,
  BallSize,
  MoodEntry,
  MoodKind,
  Subject,
  SubjectPreference,
  createDefaultSubject,
  createId,
} from "../domain/mood";
import { supabase } from "../lib/supabase";

type LocalState = {
  subjects: Subject[];
  entries: MoodEntry[];
  preferences: SubjectPreference[];
};

const LOCAL_KEY = "mood-pool:v1";
export const LOCAL_USER_ID = "local-user";

const emptyLocalState: LocalState = {
  subjects: [],
  entries: [],
  preferences: [],
};

function readLocalState(): LocalState {
  const raw = localStorage.getItem(LOCAL_KEY);
  if (!raw) return emptyLocalState;

  try {
    return { ...emptyLocalState, ...JSON.parse(raw) } as LocalState;
  } catch {
    return emptyLocalState;
  }
}

function writeLocalState(state: LocalState) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
}

function now() {
  return new Date().toISOString();
}

function toSubject(row: {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}): Subject {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toEntry(row: {
  id: string;
  user_id: string;
  subject_id: string;
  kind: MoodKind;
  size: BallSize;
  value: number;
  note: string;
  created_at: string;
}): MoodEntry {
  return {
    id: row.id,
    userId: row.user_id,
    subjectId: row.subject_id,
    kind: row.kind,
    size: row.size,
    value: row.value,
    note: row.note,
    createdAt: row.created_at,
  };
}

function toPreference(row: {
  subject_id: string;
  user_id: string;
  positive_color: string;
  negative_color: string;
  updated_at: string;
}): SubjectPreference {
  return {
    subjectId: row.subject_id,
    userId: row.user_id,
    positiveColor: row.positive_color,
    negativeColor: row.negative_color,
    updatedAt: row.updated_at,
  };
}

async function ensureLocalSubject(userId: string) {
  const state = readLocalState();
  if (state.subjects.some((subject) => subject.userId === userId)) return;

  const subject = createDefaultSubject(userId);
  state.subjects.push(subject);
  state.preferences.push({
    subjectId: subject.id,
    userId,
    ...DEFAULT_PREFERENCES,
    updatedAt: now(),
  });
  writeLocalState(state);
}

async function ensureRemoteSubject(userId: string) {
  if (!supabase) return;

  const { count, error } = await supabase
    .from("subjects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  if (count && count > 0) return;

  const { data, error: insertError } = await supabase
    .from("subjects")
    .insert({ user_id: userId, name: "我的工作" })
    .select("id, user_id, name, created_at, updated_at")
    .single();

  if (insertError) throw insertError;

  await supabase.from("subject_preferences").insert({
    subject_id: data.id,
    user_id: userId,
    positive_color: DEFAULT_PREFERENCES.positiveColor,
    negative_color: DEFAULT_PREFERENCES.negativeColor,
  });
}

export async function ensureStarterData(userId: string, useRemote: boolean) {
  if (useRemote) {
    await ensureRemoteSubject(userId);
  } else {
    await ensureLocalSubject(userId);
  }
}

export async function listSubjects(userId: string, useRemote: boolean): Promise<Subject[]> {
  if (useRemote && supabase) {
    const { data, error } = await supabase
      .from("subjects")
      .select("id, user_id, name, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data.map(toSubject);
  }

  return readLocalState().subjects.filter((subject) => subject.userId === userId);
}

export async function createSubject(userId: string, name: string, useRemote: boolean) {
  if (useRemote && supabase) {
    const { data, error } = await supabase
      .from("subjects")
      .insert({ user_id: userId, name })
      .select("id, user_id, name, created_at, updated_at")
      .single();

    if (error) throw error;

    await supabase.from("subject_preferences").insert({
      subject_id: data.id,
      user_id: userId,
      positive_color: DEFAULT_PREFERENCES.positiveColor,
      negative_color: DEFAULT_PREFERENCES.negativeColor,
    });

    return toSubject(data);
  }

  const state = readLocalState();
  const createdAt = now();
  const subject: Subject = {
    id: createId("subject"),
    userId,
    name,
    createdAt,
    updatedAt: createdAt,
  };

  state.subjects.push(subject);
  state.preferences.push({
    subjectId: subject.id,
    userId,
    ...DEFAULT_PREFERENCES,
    updatedAt: createdAt,
  });
  writeLocalState(state);
  return subject;
}

export async function renameSubject(
  subjectId: string,
  name: string,
  useRemote: boolean,
): Promise<void> {
  if (useRemote && supabase) {
    const { error } = await supabase
      .from("subjects")
      .update({ name, updated_at: now() })
      .eq("id", subjectId);

    if (error) throw error;
    return;
  }

  const state = readLocalState();
  state.subjects = state.subjects.map((subject) =>
    subject.id === subjectId ? { ...subject, name, updatedAt: now() } : subject,
  );
  writeLocalState(state);
}

export async function listEntries(userId: string, useRemote: boolean): Promise<MoodEntry[]> {
  if (useRemote && supabase) {
    const { data, error } = await supabase
      .from("mood_entries")
      .select("id, user_id, subject_id, kind, size, value, note, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map(toEntry);
  }

  return readLocalState()
    .entries.filter((entry) => entry.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createEntry(
  userId: string,
  subjectId: string,
  kind: MoodKind,
  size: BallSize,
  note: string,
  useRemote: boolean,
) {
  const value = BALL_VALUES[size];

  if (useRemote && supabase) {
    const { data, error } = await supabase
      .from("mood_entries")
      .insert({
        user_id: userId,
        subject_id: subjectId,
        kind,
        size,
        value,
        note,
      })
      .select("id, user_id, subject_id, kind, size, value, note, created_at")
      .single();

    if (error) throw error;
    return toEntry(data);
  }

  const state = readLocalState();
  const entry: MoodEntry = {
    id: createId("entry"),
    userId,
    subjectId,
    kind,
    size,
    value,
    note,
    createdAt: now(),
  };

  state.entries.unshift(entry);
  writeLocalState(state);
  return entry;
}

export async function listPreferences(
  userId: string,
  useRemote: boolean,
): Promise<SubjectPreference[]> {
  if (useRemote && supabase) {
    const { data, error } = await supabase
      .from("subject_preferences")
      .select("subject_id, user_id, positive_color, negative_color, updated_at")
      .eq("user_id", userId);

    if (error) throw error;
    return data.map(toPreference);
  }

  return readLocalState().preferences.filter((preference) => preference.userId === userId);
}

export async function upsertPreference(
  preference: SubjectPreference,
  useRemote: boolean,
): Promise<void> {
  const nextPreference = {
    ...preference,
    updatedAt: now(),
  };

  if (useRemote && supabase) {
    const { error } = await supabase.from("subject_preferences").upsert({
      subject_id: nextPreference.subjectId,
      user_id: nextPreference.userId,
      positive_color: nextPreference.positiveColor,
      negative_color: nextPreference.negativeColor,
      updated_at: nextPreference.updatedAt,
    });

    if (error) throw error;
    return;
  }

  const state = readLocalState();
  const existingIndex = state.preferences.findIndex(
    (item) => item.subjectId === preference.subjectId,
  );

  if (existingIndex >= 0) {
    state.preferences[existingIndex] = nextPreference;
  } else {
    state.preferences.push(nextPreference);
  }

  writeLocalState(state);
}
