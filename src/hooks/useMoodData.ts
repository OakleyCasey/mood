import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { User } from "@supabase/supabase-js";
import {
  DEFAULT_PREFERENCES,
  MoodEntry,
  MoodKind,
  Subject,
  SubjectPreference,
  BallSize,
} from "../domain/mood";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  LOCAL_USER_ID,
  createEntry,
  createSubject,
  ensureStarterData,
  listEntries,
  listPreferences,
  listSubjects,
  renameSubject,
  upsertPreference,
} from "../services/moodRepository";

export function useMoodData() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [preferences, setPreferences] = useState<SubjectPreference[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState("");
  const hasLoadedRef = useRef(false);

  const useRemote = isSupabaseConfigured && Boolean(user);
  const userId = useRemote ? user!.id : LOCAL_USER_ID;

  useEffect(() => {
    if (!supabase) return;

    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const authError =
      searchParams.get("error_description") ??
      hashParams.get("error_description") ??
      searchParams.get("error") ??
      hashParams.get("error");

    if (authError) {
      setError(authError);
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setUser(data.session?.user ?? null);
      })
      .catch((caught) => {
        setError(caught instanceof Error ? caught.message : "登录状态读取失败");
      })
      .finally(() => {
        setAuthReady(true);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        hasLoadedRef.current = false;
        setIsLoading(true);
      }

      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    if (!authReady) return;

    const isInitialLoad = !hasLoadedRef.current;

    if (isInitialLoad) {
      setIsLoading(true);
    } else {
      setIsSyncing(true);
    }

    setError("");

    try {
      await ensureStarterData(userId, useRemote);
      const [nextSubjects, nextEntries, nextPreferences] = await Promise.all([
        listSubjects(userId, useRemote),
        listEntries(userId, useRemote),
        listPreferences(userId, useRemote),
      ]);

      setSubjects(nextSubjects);
      setEntries(nextEntries);
      setPreferences(nextPreferences);
      setSelectedSubjectId((current) => {
        if (current && nextSubjects.some((subject) => subject.id === current)) {
          return current;
        }
        return nextSubjects[0]?.id ?? "";
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "数据加载失败");
    } finally {
      hasLoadedRef.current = true;
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [authReady, useRemote, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectedSubject = useMemo(() => {
    return subjects.find((subject) => subject.id === selectedSubjectId) ?? subjects[0] ?? null;
  }, [selectedSubjectId, subjects]);

  const selectedEntries = useMemo(() => {
    if (!selectedSubject) return [];
    return entries.filter((entry) => entry.subjectId === selectedSubject.id);
  }, [entries, selectedSubject]);

  const selectedPreference = useMemo(() => {
    if (!selectedSubject) {
      return null;
    }

    return (
      preferences.find((preference) => preference.subjectId === selectedSubject.id) ?? {
        subjectId: selectedSubject.id,
        userId,
        ...DEFAULT_PREFERENCES,
        updatedAt: new Date().toISOString(),
      }
    );
  }, [preferences, selectedSubject, userId]);

  const addSubject = useCallback(
    async (name: string) => {
      const subject = await createSubject(userId, name.trim(), useRemote);
      await refresh();
      setSelectedSubjectId(subject.id);
    },
    [refresh, useRemote, userId],
  );

  const updateSubjectName = useCallback(
    async (subjectId: string, name: string) => {
      await renameSubject(subjectId, name.trim(), useRemote);
      await refresh();
    },
    [refresh, useRemote],
  );

  const addEntry = useCallback(
    async (kind: MoodKind, size: BallSize, note: string) => {
      if (!selectedSubject) return;
      await createEntry(userId, selectedSubject.id, kind, size, note.trim(), useRemote);
      await refresh();
    },
    [refresh, selectedSubject, useRemote, userId],
  );

  const updatePreference = useCallback(
    async (positiveColor: string, negativeColor: string) => {
      if (!selectedSubject) return;
      await upsertPreference(
        {
          subjectId: selectedSubject.id,
          userId,
          positiveColor,
          negativeColor,
          updatedAt: new Date().toISOString(),
        },
        useRemote,
      );
      await refresh();
    },
    [refresh, selectedSubject, useRemote, userId],
  );

  const signIn = useCallback(async (email: string) => {
    if (!supabase) return;

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (signInError) throw signInError;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return {
    isSupabaseConfigured,
    useRemote,
    user,
    subjects,
    entries,
    selectedSubject,
    selectedEntries,
    selectedPreference,
    selectedSubjectId,
    isLoading,
    isSyncing,
    error,
    setSelectedSubjectId,
    addSubject,
    updateSubjectName,
    addEntry,
    updatePreference,
    signIn,
    signOut,
  };
}
