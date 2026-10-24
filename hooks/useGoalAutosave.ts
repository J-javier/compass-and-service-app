import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '@/lib/apiError';
import { goalKey } from '@/lib/compass';
import { CompassGoalCreate, CompassGoalResponse } from '@/types/api';

export type FieldStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

interface KnownGoal {
  id: number;
  goal: string;
}

interface AutosaveApi {
  /** Goal currently stored on the server for (subcategory, year), if any. */
  findGoal: (subcategoryId: number, year: number) => CompassGoalResponse | undefined;
  createGoal: (body: CompassGoalCreate) => Promise<CompassGoalResponse>;
  updateGoal: (id: number, goal: string) => Promise<unknown>;
  deleteGoal: (id: number) => Promise<void>;
}

const DEBOUNCE_MS = 1500;
const SAVED_VISIBLE_MS = 2000;

/**
 * Per-field debounced autosave for Brújula goals (one field = subcategory × year):
 *  - empty + existed  → DELETE
 *  - text  + missing  → POST
 *  - text  + existed  → PATCH (no-op if unchanged)
 * Saves for the same field are chained so a POST in flight can't race a
 * second POST (409 duplicate_goal). Call flush/flushAll before switching
 * year/category or leaving the screen.
 */
export function useGoalAutosave(api: AutosaveApi) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, FieldStatus>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const apiRef = useRef(api);
  apiRef.current = api;
  const draftsRef = useRef<Record<string, string>>({});
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const savedTimersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const chainsRef = useRef(new Map<string, Promise<void>>());
  /**
   * Server state as known after our own mutations (wins over findGoal, whose
   * backing React state may lag a render behind).
   */
  const knownRef = useRef(new Map<string, KnownGoal | null>());

  /** Sets a field's status, skipping no-op updates. */
  const setStatus = useCallback((key: string, status: FieldStatus) => {
    setStatuses((prev) => (prev[key] === status ? prev : { ...prev, [key]: status }));
  }, []);

  /** Last known server goal for a field (own mutations win over findGoal). */
  const known = (key: string, subId: number, year: number): KnownGoal | null => {
    if (knownRef.current.has(key)) return knownRef.current.get(key)!;
    const g = apiRef.current.findGoal(subId, year);
    return g ? { id: g.id, goal: g.goal } : null;
  };

  /** Saves one field, chained after any save already in flight for it. */
  const persist = useCallback((key: string): Promise<void> => {
    const [subId, year] = key.split(':').map(Number);

    /** Deletes, creates, updates or skips, depending on the field's draft. */
    const run = async () => {
      const text = (draftsRef.current[key] ?? '').trim();
      const existing = known(key, subId, year);

      if ((!existing && !text) || (existing && existing.goal === text)) {
        if (!timersRef.current.has(key)) setStatus(key, 'idle');
        return;
      }

      setStatus(key, 'saving');
      try {
        if (!text && existing) {
          await apiRef.current.deleteGoal(existing.id);
          knownRef.current.set(key, null);
        } else if (!existing) {
          const created = await apiRef.current.createGoal({ subcategory_id: subId, year, goal: text });
          knownRef.current.set(key, { id: created.id, goal: created.goal ?? text });
        } else {
          await apiRef.current.updateGoal(existing.id, text);
          knownRef.current.set(key, { id: existing.id, goal: text });
        }
        setErrors((prev) => {
          if (!(key in prev)) return prev;
          const { [key]: _removed, ...rest } = prev;
          return rest;
        });
        /* If the user kept typing meanwhile, the pending debounce owns the status. */
        if (!timersRef.current.has(key)) {
          setStatus(key, 'saved');
          clearTimeout(savedTimersRef.current.get(key));
          savedTimersRef.current.set(
            key,
            setTimeout(() => {
              savedTimersRef.current.delete(key);
              setStatuses((prev) => (prev[key] === 'saved' ? { ...prev, [key]: 'idle' } : prev));
            }, SAVED_VISIBLE_MS),
          );
        }
      } catch (e) {
        setStatus(key, 'error');
        setErrors((prev) => ({ ...prev, [key]: getApiErrorMessage(e, 'No se pudo guardar') }));
      }
    };

    const next = (chainsRef.current.get(key) ?? Promise.resolve()).then(run);
    chainsRef.current.set(key, next);
    return next;
  }, [setStatus]);

  /** Updates a draft and (re)starts its debounced save. */
  const setValue = useCallback((subcategoryId: number, year: number, text: string) => {
    const key = goalKey(subcategoryId, year);
    draftsRef.current = { ...draftsRef.current, [key]: text };
    setDrafts(draftsRef.current);
    setStatus(key, 'pending');
    clearTimeout(timersRef.current.get(key));
    timersRef.current.set(
      key,
      setTimeout(() => {
        timersRef.current.delete(key);
        persist(key);
      }, DEBOUNCE_MS),
    );
  }, [persist, setStatus]);

  /** Saves every field with a pending debounce now and waits for all in-flight saves. */
  const flushAll = useCallback(async () => {
    for (const [key, timer] of timersRef.current) {
      clearTimeout(timer);
      timersRef.current.delete(key);
      persist(key);
    }
    await Promise.all(chainsRef.current.values());
  }, [persist]);

  /** Re-runs the save of one field (e.g. after a network error). */
  const retry = useCallback(
    (subcategoryId: number, year: number) => persist(goalKey(subcategoryId, year)),
    [persist],
  );

  /** Draft value if edited, otherwise the saved goal. */
  const getValue = useCallback((subcategoryId: number, year: number): string => {
    const key = goalKey(subcategoryId, year);
    if (key in drafts) return drafts[key];
    return apiRef.current.findGoal(subcategoryId, year)?.goal ?? '';
  }, [drafts]);

  /** Save status of a field. */
  const getStatus = useCallback(
    (subcategoryId: number, year: number): FieldStatus => statuses[goalKey(subcategoryId, year)] ?? 'idle',
    [statuses],
  );

  /** Last save error of a field, if any. */
  const getError = useCallback(
    (subcategoryId: number, year: number): string | undefined => errors[goalKey(subcategoryId, year)],
    [errors],
  );

  /** Don't lose a pending edit when the screen unmounts. */
  useEffect(() => {
    const savedTimers = savedTimersRef.current;
    return () => {
      flushAll();
      savedTimers.forEach(clearTimeout);
    };
  }, [flushAll]);

  return { getValue, setValue, getStatus, getError, flushAll, retry };
}
