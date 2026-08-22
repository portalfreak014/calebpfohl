/**
 * Unit-agnostic chapter/unit manifest.
 *
 * This file is the single source of truth for which units and chapters
 * exist, their display metadata, and whether they are available yet.
 * It does NOT contain question content — that lives in
 * arabic/data/{unitId}.json and conforms to the Content Contract
 * documented in CHAPTER_PROGRESS_IMPLEMENTATION.md.
 *
 * Adding a new unit:
 *   1. Create arabic/data/{unitId}.json following the Content Contract.
 *   2. Add one entry below under the new unitId key.
 *   3. No changes to quiz.html, arabic.html, or progress-store.js required.
 */
window.UNITS_MANIFEST = {
  unit6: {
    title: 'Unit 6 Vocabulary',
    chapters: [
      { id: 'ch26', number: 26, title: 'Chapter 26', available: true },
      { id: 'ch27', number: 27, title: 'Chapter 27', available: true },
      { id: 'ch28', number: 28, title: 'Chapter 28', available: true },
      { id: 'ch29', number: 29, title: 'Chapter 29', available: true },
      { id: 'ch30', number: 30, title: 'Chapter 30', available: true }
    ]
  },
  unit7: {
    title: 'Unit 7 Vocabulary',
    chapters: [
      { id: 'ch31', number: 31, title: 'Chapter 31', available: true },
      { id: 'ch32', number: 32, title: 'Chapter 32', available: true }
    ]
  }
  // Future units are added the same way, e.g.:
  // unit8: {
  //   title: 'Unit 8 Vocabulary',
  //   chapters: [
  //     { id: 'ch36', number: 36, title: 'Chapter 36', available: true }
  //   ]
  // }
};

/**
 * Small helper API so callers never reach into window.UNITS_MANIFEST
 * directly. Keeps homepage/quiz code decoupled from the manifest's
 * internal shape.
 */
window.UnitsManifest = {
  listUnits() {
    return Object.keys(window.UNITS_MANIFEST);
  },
  getUnit(unitId) {
    return window.UNITS_MANIFEST[unitId] || null;
  },
  listChapters(unitId) {
    const unit = window.UnitsManifest.getUnit(unitId);
    return unit ? unit.chapters : [];
  },
  getChapter(unitId, chapterId) {
    const chapters = window.UnitsManifest.listChapters(unitId);
    return chapters.find((c) => c.id === chapterId) || null;
  },
  getAvailableChapters(unitId) {
    return window.UnitsManifest.listChapters(unitId).filter((c) => c.available);
  },
  getNextAvailableChapter(unitId, currentChapterId) {
    const chapters = window.UnitsManifest.listChapters(unitId);
    const idx = chapters.findIndex((c) => c.id === currentChapterId);
    if (idx === -1) return null;
    for (let i = idx + 1; i < chapters.length; i += 1) {
      if (chapters[i].available) return chapters[i];
    }
    return null;
  }
};
