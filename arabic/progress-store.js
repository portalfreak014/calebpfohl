/**
 * Local-first, unit-agnostic progress store.
 *
 * Single versioned profile in localStorage under one key. No unit or
 * subject-specific logic lives here — callers pass unitId/chapterId.
 * See arabic/CHAPTER_PROGRESS_IMPLEMENTATION.md for the full spec.
 */
(function () {
  const STORAGE_KEY = 'arabicStudy.profile.v1';
  const SCHEMA_VERSION = 1;
  const LEGACY_KEY_PREFIX = 'arabicStudyProgress:';
  const KNOWN_STREAK_THRESHOLD = 2;

  function nowIso() {
    return new Date().toISOString();
  }

  function defaultProfile() {
    const ts = nowIso();
    return {
      schemaVersion: SCHEMA_VERSION,
      userId: null,
      syncVersion: 0,
      createdAt: ts,
      updatedAt: ts,
      lastActive: null,
      units: {}
    };
  }

  function clone(obj) {
    return obj == null ? obj : JSON.parse(JSON.stringify(obj));
  }

  function readRaw() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.units) return null;
      return parsed;
    } catch (err) {
      return null;
    }
  }

  function writeRaw(profile) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      return true;
    } catch (err) {
      return false;
    }
  }

  function migrateLegacyKeys(profile) {
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key || key.indexOf(LEGACY_KEY_PREFIX) !== 0) continue;
        const parts = key.slice(LEGACY_KEY_PREFIX.length).split(':');
        if (parts.length !== 2) continue;
        const [unitId, chapterId] = parts;
        if (profile.units[unitId] && profile.units[unitId].chapters[chapterId]) continue;
        let legacy;
        try {
          legacy = JSON.parse(localStorage.getItem(key));
        } catch (err) {
          continue;
        }
        if (!legacy) continue;
        if (!profile.units[unitId]) profile.units[unitId] = { chapters: {} };
        profile.units[unitId].chapters[chapterId] = {
          status: legacy.completed >= legacy.total && legacy.total > 0 ? 'completed' : 'in_progress',
          totalQuestions: legacy.total || 0,
          answeredCount: legacy.completed || 0,
          correctCount: legacy.score || 0,
          resumeIndex: legacy.completed || 0,
          questionOrder: [],
          bestScore: legacy.score || 0,
          latestScore: legacy.score || 0,
          attempts: 1,
          startedAt: legacy.updatedAt || nowIso(),
          lastActivityAt: legacy.updatedAt || nowIso(),
          completedAt: legacy.completed >= legacy.total && legacy.total > 0 ? legacy.updatedAt : null,
          knownWords: {}
        };
      }
    } catch (err) {
      // If migration fails for any reason, continue with whatever profile we have.
    }
    return profile;
  }

  function getProfile() {
    let profile = readRaw();
    if (!profile) {
      profile = defaultProfile();
      profile = migrateLegacyKeys(profile);
      writeRaw(profile);
    }
    return clone(profile);
  }

  function saveProfile(profile) {
    const next = clone(profile);
    next.schemaVersion = SCHEMA_VERSION;
    next.updatedAt = nowIso();
    return writeRaw(next);
  }

  function ensureUnitChapter(profile, unitId, chapterId) {
    if (!profile.units[unitId]) profile.units[unitId] = { chapters: {} };
    if (!profile.units[unitId].chapters[chapterId]) {
      const ts = nowIso();
      profile.units[unitId].chapters[chapterId] = {
        status: 'not_started',
        totalQuestions: 0,
        answeredCount: 0,
        correctCount: 0,
        resumeIndex: 0,
        questionOrder: [],
        bestScore: 0,
        latestScore: 0,
        attempts: 0,
        startedAt: ts,
        lastActivityAt: ts,
        completedAt: null,
        knownWords: {}
      };
    }
    if (!profile.units[unitId].chapters[chapterId].knownWords) {
      profile.units[unitId].chapters[chapterId].knownWords = {};
    }
    return profile.units[unitId].chapters[chapterId];
  }

  function ensureKnownWordEntry(chapter, wordId) {
    if (!chapter.knownWords) chapter.knownWords = {};
    if (!chapter.knownWords[wordId]) {
      chapter.knownWords[wordId] = { known: false, streak: 0, source: null };
    }
    return chapter.knownWords[wordId];
  }

  function getChapter(unitId, chapterId) {
    const profile = getProfile();
    if (!profile.units[unitId] || !profile.units[unitId].chapters[chapterId]) return null;
    return clone(profile.units[unitId].chapters[chapterId]);
  }

  function updateChapter(unitId, chapterId, patch) {
    const profile = getProfile();
    const chapter = ensureUnitChapter(profile, unitId, chapterId);
    Object.assign(chapter, patch, { lastActivityAt: nowIso() });
    saveProfile(profile);
    return clone(chapter);
  }

  function setLastActive(unitId, chapterId) {
    const profile = getProfile();
    profile.lastActive = { unitId, chapterId, updatedAt: nowIso() };
    saveProfile(profile);
    return clone(profile.lastActive);
  }

  function resetCurrentAttempt(unitId, chapterId) {
    const profile = getProfile();
    const chapter = ensureUnitChapter(profile, unitId, chapterId);
    chapter.status = 'in_progress';
    chapter.answeredCount = 0;
    chapter.correctCount = 0;
    chapter.resumeIndex = 0;
    chapter.questionOrder = [];
    chapter.latestScore = 0;
    chapter.attempts = (chapter.attempts || 0) + 1;
    chapter.startedAt = nowIso();
    chapter.lastActivityAt = nowIso();
    // knownWords is intentionally left untouched: restarting a quiz attempt
    // must never reset per-word known/streak state.
    saveProfile(profile);
    return clone(chapter);
  }

  /**
   * Records the outcome of answering a single word and applies the
   * two-attempt confirmation rule: a word is marked known automatically
   * once its correct-streak reaches KNOWN_STREAK_THRESHOLD (2), and any
   * incorrect answer resets that streak to 0. Never touches bestScore,
   * status, or any other existing chapter-level field.
   */
  function recordAnswer(unitId, chapterId, wordId, wasCorrect) {
    const profile = getProfile();
    const chapter = ensureUnitChapter(profile, unitId, chapterId);
    const entry = ensureKnownWordEntry(chapter, wordId);

    if (wasCorrect) {
      entry.streak = (entry.streak || 0) + 1;
      if (!entry.known && entry.streak >= KNOWN_STREAK_THRESHOLD) {
        entry.known = true;
        entry.source = 'streak';
      }
    } else {
      entry.streak = 0;
      // An incorrect answer never un-marks a word that is already known
      // (whether by streak or manual override); it only affects the streak
      // counter used for future automatic marking.
    }

    chapter.lastActivityAt = nowIso();
    saveProfile(profile);
    return clone(entry);
  }

  function markWordKnown(unitId, chapterId, wordId) {
    const profile = getProfile();
    const chapter = ensureUnitChapter(profile, unitId, chapterId);
    const entry = ensureKnownWordEntry(chapter, wordId);
    entry.known = true;
    entry.source = 'manual';
    chapter.lastActivityAt = nowIso();
    saveProfile(profile);
    return clone(entry);
  }

  function markWordUnknown(unitId, chapterId, wordId) {
    const profile = getProfile();
    const chapter = ensureUnitChapter(profile, unitId, chapterId);
    const entry = ensureKnownWordEntry(chapter, wordId);
    entry.known = false;
    entry.streak = 0;
    entry.source = null;
    chapter.lastActivityAt = nowIso();
    saveProfile(profile);
    return clone(entry);
  }

  function isWordKnown(unitId, chapterId, wordId) {
    const profile = getProfile();
    const chapter = profile.units[unitId] && profile.units[unitId].chapters[chapterId];
    if (!chapter || !chapter.knownWords || !chapter.knownWords[wordId]) return false;
    return !!chapter.knownWords[wordId].known;
  }

  function getKnownWords(unitId, chapterId) {
    const profile = getProfile();
    const chapter = profile.units[unitId] && profile.units[unitId].chapters[chapterId];
    if (!chapter || !chapter.knownWords) return {};
    return clone(chapter.knownWords);
  }

  function getKnownWordCount(unitId, chapterId) {
    const knownWords = getKnownWords(unitId, chapterId);
    return Object.keys(knownWords).filter((wordId) => knownWords[wordId].known).length;
  }

  function exportProfile() {
    return getProfile();
  }

  function importProfile(profile) {
    if (!profile || typeof profile !== 'object' || !profile.units) return getProfile();
    saveProfile(profile);
    return getProfile();
  }

  function mergeKnownWords(localWords, remoteWords) {
    const merged = clone(localWords || {});
    Object.keys(remoteWords || {}).forEach((wordId) => {
      const remoteEntry = remoteWords[wordId];
      const localEntry = merged[wordId];
      if (!localEntry) {
        merged[wordId] = clone(remoteEntry);
        return;
      }
      merged[wordId] = {
        known: !!(localEntry.known || remoteEntry.known),
        streak: Math.max(localEntry.streak || 0, remoteEntry.streak || 0),
        source: localEntry.known ? localEntry.source : (remoteEntry.known ? remoteEntry.source : null)
      };
    });
    return merged;
  }

  function mergeProfile(remoteProfile) {
    const local = getProfile();
    if (!remoteProfile || typeof remoteProfile !== 'object') return local;
    const merged = clone(local);

    Object.keys(remoteProfile.units || {}).forEach((unitId) => {
      if (!merged.units[unitId]) merged.units[unitId] = { chapters: {} };
      const remoteChapters = remoteProfile.units[unitId].chapters || {};
      Object.keys(remoteChapters).forEach((chapterId) => {
        const remote = remoteChapters[chapterId];
        const localChapter = merged.units[unitId].chapters[chapterId];
        if (!localChapter) {
          merged.units[unitId].chapters[chapterId] = clone(remote);
          if (!merged.units[unitId].chapters[chapterId].knownWords) {
            merged.units[unitId].chapters[chapterId].knownWords = {};
          }
          return;
        }
        const statusRank = { completed: 2, in_progress: 1, not_started: 0 };
        merged.units[unitId].chapters[chapterId] = {
          ...localChapter,
          bestScore: Math.max(localChapter.bestScore || 0, remote.bestScore || 0),
          attempts: Math.max(localChapter.attempts || 0, remote.attempts || 0),
          lastActivityAt: (remote.lastActivityAt || '') > (localChapter.lastActivityAt || '')
            ? remote.lastActivityAt : localChapter.lastActivityAt,
          completedAt: [remote.completedAt, localChapter.completedAt].filter(Boolean).sort().pop() || null,
          status: (statusRank[remote.status] || 0) > (statusRank[localChapter.status] || 0)
            ? remote.status : localChapter.status,
          questionOrder: (remote.lastActivityAt || '') > (localChapter.lastActivityAt || '')
            ? remote.questionOrder : localChapter.questionOrder,
          resumeIndex: (remote.lastActivityAt || '') > (localChapter.lastActivityAt || '')
            ? remote.resumeIndex : localChapter.resumeIndex,
          knownWords: mergeKnownWords(localChapter.knownWords, remote.knownWords)
        };
      });
    });

    if (remoteProfile.lastActive && local.lastActive) {
      merged.lastActive = remoteProfile.lastActive.updatedAt > local.lastActive.updatedAt
        ? remoteProfile.lastActive : local.lastActive;
    } else {
      merged.lastActive = remoteProfile.lastActive || local.lastActive;
    }

    merged.syncVersion = Math.max(local.syncVersion || 0, remoteProfile.syncVersion || 0) + 1;
    saveProfile(merged);
    return getProfile();
  }

  function clearLocalProfile() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      // ignore
    }
  }

  window.ProgressStore = {
    getProfile,
    saveProfile,
    getChapter,
    updateChapter,
    setLastActive,
    resetCurrentAttempt,
    recordAnswer,
    markWordKnown,
    markWordUnknown,
    isWordKnown,
    getKnownWordCount,
    getKnownWords,
    exportProfile,
    importProfile,
    mergeProfile,
    clearLocalProfile
  };
})();
