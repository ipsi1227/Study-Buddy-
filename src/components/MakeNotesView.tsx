import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Check,
  Copy,
  Printer,
  Bookmark,
  Trash2,
  Clock,
  Search,
  CheckCircle2,
  HelpCircle,
  FileText,
  ClipboardPaste,
  RotateCcw,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';
import { Subject, ConciseNote, NotebookPoint, ExpectedQuestion, UniNote } from '../types';
import { fetchTopicNotes, generateOfflineNotebookNotes } from '../utils/notesGenerator';

interface MakeNotesViewProps {
  subjects: Subject[];
  conciseNotes: ConciseNote[];
  notes?: UniNote[]; // Student's current notes stored in app
  onSaveConciseNote: (note: ConciseNote) => void;
  onDeleteConciseNote: (id: string) => void;
  onStartTimerWithSubject?: (subjectId: string) => void;
}

export const MakeNotesView: React.FC<MakeNotesViewProps> = ({
  subjects,
  conciseNotes,
  notes = [],
  onSaveConciseNote,
  onDeleteConciseNote,
  onStartTimerWithSubject,
}) => {
  // Input mode: 'paste' (paste raw notes/lecture text) vs 'topic' (just a topic title)
  const [inputMode, setInputMode] = useState<'paste' | 'topic'>('paste');
  const [topicInput, setTopicInput] = useState('');
  const [notesContentInput, setNotesContentInput] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 'sub-1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'vault'>('create');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [vaultSearch, setVaultSearch] = useState('');

  // Active note state
  const initialNote = conciseNotes[0];
  const [currentTitle, setCurrentTitle] = useState<string>(
    initialNote?.title || "Banker's Algorithm & Deadlock Avoidance"
  );
  const [currentSummary, setCurrentSummary] = useState<string>(
    initialNote?.conciseSummary ||
      "Deadlock avoidance algorithm that guarantees the system never enters an unsafe state by verifying a complete safe sequence exists before granting requests."
  );
  const [currentSubjectId, setCurrentSubjectId] = useState<string>(
    initialNote?.subjectId || subjects[1]?.id || 'sub-2'
  );

  // Initialize notebook points
  const [notebookPoints, setNotebookPoints] = useState<NotebookPoint[]>(() => {
    if (initialNote?.notebookPoints && initialNote.notebookPoints.length > 0) {
      return initialNote.notebookPoints;
    }
    const fallback = generateOfflineNotebookNotes("Banker's Algorithm");
    return fallback.points;
  });

  // Initialize expected questions
  const [expectedQuestions, setExpectedQuestions] = useState<ExpectedQuestion[]>(() => {
    if (initialNote?.expectedQuestions && initialNote.expectedQuestions.length > 0) {
      return initialNote.expectedQuestions;
    }
    const fallback = generateOfflineNotebookNotes("Banker's Algorithm");
    return fallback.expectedQuestions;
  });

  const popularTopics = [
    { title: "Banker's Algorithm", subject: 'sub-2' },
    { title: 'BCNF Normalization', subject: 'sub-3' },
    { title: 'TCP 3-Way Handshake', subject: 'sub-4' },
    { title: "Dijkstra's Algorithm", subject: 'sub-1' },
    { title: 'Virtual Memory & Paging', subject: 'sub-2' },
    { title: 'Process Semaphores & Mutex', subject: 'sub-2' },
  ];

  // Quick load from student's stored notes
  const handleLoadStoredNote = (storedNote: UniNote) => {
    setTopicInput(storedNote.title);
    setNotesContentInput(storedNote.content || '');
    setSelectedSubjectId(storedNote.subjectId);
    setInputMode('paste');
  };

  // Paste from clipboard handler
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setNotesContentInput(text);
        if (!topicInput.trim()) {
          // Attempt to extract title from first line
          const firstLine = text.split('\n')[0].replace(/^#+\s*/, '').trim();
          if (firstLine.length > 3 && firstLine.length < 60) {
            setTopicInput(firstLine);
          }
        }
      }
    } catch (err) {
      console.warn('Clipboard read permission denied or unavailable:', err);
    }
  };

  // Handle generating notes from pasted content OR topic name
  const handleGenerate = async (forcedTopic?: string) => {
    const topicToUse = (forcedTopic || topicInput).trim();
    const contentToUse = notesContentInput.trim();

    if (!topicToUse && !contentToUse) return;

    const effectiveTitle = topicToUse || 'Pasted Revision Notes';
    setIsGenerating(true);
    const subject = subjects.find((s) => s.id === selectedSubjectId);
    const subjectName = subject ? subject.name : 'Computer Science';

    try {
      const result = await fetchTopicNotes(effectiveTitle, subjectName, contentToUse || undefined);
      setCurrentTitle(result.title);
      setCurrentSummary(result.summary);
      setCurrentSubjectId(result.subjectId || selectedSubjectId);
      setNotebookPoints(result.points);
      setExpectedQuestions(result.expectedQuestions);
      setActiveTab('create');
    } catch (err) {
      console.error('Error generating notes:', err);
      const fallback = generateOfflineNotebookNotes(effectiveTitle, subjectName, contentToUse || undefined);
      setCurrentTitle(fallback.title);
      setCurrentSummary(fallback.summary);
      setCurrentSubjectId(selectedSubjectId);
      setNotebookPoints(fallback.points);
      setExpectedQuestions(fallback.expectedQuestions);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle point tick (checkbox)
  // "like if its done then tick it else no need"
  const handleTogglePoint = (pointId: string) => {
    setNotebookPoints((prev) =>
      prev.map((pt) => (pt.id === pointId ? { ...pt, done: !pt.done } : pt))
    );
  };

  // Toggle question tick (checkbox)
  const handleToggleQuestion = (questionId: string) => {
    setExpectedQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, done: !q.done } : q))
    );
  };

  // Save current note to Vault
  const handleSaveToVault = () => {
    const newNote: ConciseNote = {
      id: `cnote-${Date.now()}`,
      subjectId: currentSubjectId,
      title: currentTitle,
      originalText: notesContentInput || currentSummary,
      conciseSummary: currentSummary,
      notebookPoints: notebookPoints,
      expectedQuestions: expectedQuestions,
      keyBullets: notebookPoints.map((p) => p.point),
      definitionsAndFormulas: notebookPoints
        .filter((p) => p.category.includes('Definition') || p.category.includes('Formula'))
        .map((p) => p.point),
      cheatSheetHooks: notebookPoints
        .filter((p) => p.category.includes('Exam') || p.category.includes('Trap'))
        .map((p) => p.point),
      vivaQuestions: expectedQuestions.map((q) => `${q.question} (A: ${q.answer})`),
      dateCreated: new Date().toISOString().split('T')[0],
      tags: [currentTitle, 'Notebook Notes', 'Exam Prep'],
    };

    onSaveConciseNote(newNote);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Load a note from vault
  const handleLoadVaultNote = (note: ConciseNote) => {
    setCurrentTitle(note.title);
    setCurrentSummary(note.conciseSummary);
    setCurrentSubjectId(note.subjectId);

    if (note.notebookPoints && note.notebookPoints.length > 0) {
      setNotebookPoints(note.notebookPoints);
    } else {
      const reconstructed: NotebookPoint[] = (note.keyBullets || []).map((bullet, idx) => ({
        id: `pt-${idx + 1}`,
        category: idx < 2 ? 'Key Concept & Definition' : 'Mechanism / Note',
        point: bullet,
        done: false,
      }));
      setNotebookPoints(reconstructed);
    }

    if (note.expectedQuestions && note.expectedQuestions.length > 0) {
      setExpectedQuestions(note.expectedQuestions);
    } else {
      const reconstructedQ: ExpectedQuestion[] = (note.vivaQuestions || []).map((viva, idx) => {
        const parts = viva.split(' (A:');
        return {
          id: `q-${idx + 1}`,
          marks: idx === 0 ? '2 Marks' : 'Viva / Interview',
          question: parts[0] || viva,
          answer: parts[1] ? parts[1].replace(/\)$/, '') : 'See notes above.',
          done: false,
        };
      });
      setExpectedQuestions(reconstructedQ);
    }

    setActiveTab('create');
  };

  // Copy all notebook points and questions formatted cleanly for student
  const handleCopyAllNotes = () => {
    const textLines = [
      `=== ${currentTitle.toUpperCase()} ===`,
      `Subject: ${subjects.find((s) => s.id === currentSubjectId)?.name || 'CSE'}`,
      '',
      '--- SUMMARY ---',
      currentSummary,
      '',
      '--- NOTES FOR NOTEBOOK (POINTS) ---',
      ...notebookPoints.map(
        (p, idx) => `${idx + 1}. [${p.category}] ${p.point} ${p.done ? '(Done / Written)' : ''}`
      ),
      '',
      '--- EXPECTED QUESTIONS & ANSWERS ---',
      ...expectedQuestions.map(
        (q, idx) => `Q${idx + 1} [${q.marks}]: ${q.question}\nAnswer: ${q.answer}\n`
      ),
    ];

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handlePrintNotes = () => {
    window.print();
  };

  const completedPointsCount = notebookPoints.filter((p) => p.done).length;
  const completedQuestionsCount = expectedQuestions.filter((q) => q.done).length;

  const filteredVaultNotes = conciseNotes.filter(
    (n) =>
      n.title.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      n.conciseSummary.toLowerCase().includes(vaultSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 dark:text-white">
              Notebook Notes & Expected Questions
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-mono-code">
              Notebook Ready
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Copy-paste your current lecture notes or enter any topic to generate a concise summary, clean bullet points to write in your notebook, and expected exam questions.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Generate & View</span>
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'vault'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span>Saved Vault ({conciseNotes.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="space-y-6">
          {/* Note Input Box: Copy-Paste Your Notes or Enter Topic */}
          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620] shadow-xs space-y-4">
            {/* Input Mode Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  Input Source:
                </span>
                <div className="inline-flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-0.5 border border-neutral-200 dark:border-neutral-700">
                  <button
                    onClick={() => setInputMode('paste')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
                      inputMode === 'paste'
                        ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                    }`}
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Paste My Notes / Text</span>
                  </button>
                  <button
                    onClick={() => setInputMode('topic')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
                      inputMode === 'topic'
                        ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Topic Name Only</span>
                  </button>
                </div>
              </div>

              {/* Subject Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Subject:</span>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 outline-none"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code}: {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Load from Student's Stored Notes if available */}
            {notes && notes.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
                <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
                  Load My Stored Notes:
                </span>
                {notes.map((sn) => (
                  <button
                    key={sn.id}
                    onClick={() => handleLoadStoredNote(sn)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-blue-400 hover:text-blue-600 transition truncate max-w-[200px]"
                    title={`Click to paste notes from: ${sn.title}`}
                  >
                    {sn.title}
                  </button>
                ))}
              </div>
            )}

            {/* Topic Input Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Topic / Lecture Title {inputMode === 'paste' ? '(Optional or Auto-Detected)' : '*'}
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (inputMode === 'topic' || !notesContentInput.trim())) {
                      handleGenerate();
                    }
                  }}
                  placeholder={
                    inputMode === 'paste'
                      ? 'e.g. OS Unit 3: Deadlocks & Banker’s Algorithm (or leave empty to auto-extract)'
                      : "Enter any CSE topic (e.g. Banker's Algorithm, BCNF, TCP 3-Way Handshake)..."
                  }
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Paste Raw Notes Textarea (Available when inputMode === 'paste') */}
            {inputMode === 'paste' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Paste Your Current Notes / Lecture Text / Excerpt *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePasteFromClipboard}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" />
                      <span>Paste from Clipboard</span>
                    </button>
                    {notesContentInput && (
                      <button
                        type="button"
                        onClick={() => setNotesContentInput('')}
                        className="text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={notesContentInput}
                  onChange={(e) => setNotesContentInput(e.target.value)}
                  placeholder="Paste your raw lecture notes, textbook paragraphs, code walkthrough, or slides text here... It will automatically generate a clean summary, points to write in your notebook, and expected exam questions!"
                  className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed resize-y"
                />
              </div>
            )}

            {/* Quick Topic Chips (When in topic mode or as suggestions) */}
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-neutral-100 dark:border-neutral-800/80">
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                Suggested Topics:
              </span>
              {popularTopics.map((item) => (
                <button
                  key={item.title}
                  onClick={() => {
                    setTopicInput(item.title);
                    setSelectedSubjectId(item.subject);
                    handleGenerate(item.title);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {item.title}
                </button>
              ))}
            </div>

            {/* Main Action Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating || (!topicInput.trim() && !notesContentInput.trim())}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Notebook Points...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Make Notes (Summary & Points)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active Note Container */}
          <div className="p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620] shadow-sm space-y-7">
            {/* Note Title & Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200/70 dark:border-neutral-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 font-mono-code px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/40">
                    {subjects.find((s) => s.id === currentSubjectId)?.name || 'Computer Science'}
                  </span>
                  <span className="text-xs text-neutral-400">• High-Yield Notebook Revision</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 dark:text-white mt-1">
                  {currentTitle}
                </h2>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCopyAllNotes}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1.5"
                  title="Copy all points to clipboard"
                >
                  <Copy className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{copiedSuccess ? 'Copied!' : 'Copy Notes'}</span>
                </button>

                <button
                  onClick={handlePrintNotes}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1.5"
                  title="Print notebook sheet"
                >
                  <Printer className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Print Sheet</span>
                </button>

                <button
                  onClick={handleSaveToVault}
                  className="px-3.5 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition flex items-center gap-1.5 shadow-xs"
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>{savedSuccess ? 'Saved to Vault!' : 'Save to Vault'}</span>
                </button>

                {onStartTimerWithSubject && (
                  <button
                    onClick={() => onStartTimerWithSubject(currentSubjectId)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition flex items-center gap-1.5"
                    title="Start focus timer on this topic"
                  >
                    <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Study Now</span>
                  </button>
                )}
              </div>
            </div>

            {/* 1. TOPIC / NOTES SUMMARY */}
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 font-mono-code">
                  Notes Summary
                </h3>
              </div>
              <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
                {currentSummary}
              </p>
            </div>

            {/* 2. NOTES FOR NOTEBOOK (WRITTEN IN POINTS) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-mono-code flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Notes for Notebook (Written in Points)</span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Points formatted to write in your physical notebook. Tick each point once you have written it down.
                  </p>
                </div>

                {/* Completion Counter */}
                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-xl text-xs font-mono-code font-bold text-neutral-700 dark:text-neutral-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {completedPointsCount} / {notebookPoints.length} Written
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${
                      notebookPoints.length > 0
                        ? (completedPointsCount / notebookPoints.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>

              {/* Bullet Points List with Checkboxes */}
              <div className="space-y-2.5">
                {notebookPoints.map((pt, idx) => (
                  <div
                    key={pt.id || idx}
                    onClick={() => handleTogglePoint(pt.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 group ${
                      pt.done
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-200/80 dark:border-emerald-900/40'
                        : 'bg-white dark:bg-[#151924] border-neutral-200/80 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    {/* Interactive Checkbox */}
                    {/* "like if its done then tick it else no need" */}
                    <button
                      type="button"
                      aria-label="Toggle point written in notebook"
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                        pt.done
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                          : 'border-neutral-300 dark:border-neutral-700 group-hover:border-blue-500 bg-neutral-50 dark:bg-neutral-900'
                      }`}
                    >
                      {pt.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          {pt.category || `Point ${idx + 1}`}
                        </span>
                        {pt.done && (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 font-mono-code">
                            ✓ Written in Notebook
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs sm:text-sm leading-relaxed font-sans ${
                          pt.done
                            ? 'text-neutral-500 dark:text-neutral-400 line-through decoration-neutral-400'
                            : 'text-neutral-900 dark:text-neutral-100'
                        }`}
                      >
                        {pt.point}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. EXPECTED QUESTIONS SECTION */}
            <div className="space-y-4 pt-4 border-t border-neutral-200/70 dark:border-neutral-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-mono-code flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    <span>Expected Exam Questions & Answers</span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    High-yield expected questions for midsem/endsem exams and viva with model answers based on the notes.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-xl text-xs font-mono-code font-bold text-neutral-700 dark:text-neutral-300">
                  <span>
                    {completedQuestionsCount} / {expectedQuestions.length} Revised
                  </span>
                </div>
              </div>

              {/* Questions List with Model Answers */}
              <div className="space-y-3">
                {expectedQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className={`p-4 rounded-2xl border transition space-y-2.5 ${
                      q.done
                        ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-200/70 dark:border-amber-900/30'
                        : 'bg-white dark:bg-[#151924] border-neutral-200/80 dark:border-neutral-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Checkbox for questions */}
                        <button
                          type="button"
                          onClick={() => handleToggleQuestion(q.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                            q.done
                              ? 'bg-amber-600 border-amber-600 text-white'
                              : 'border-neutral-300 dark:border-neutral-700 hover:border-amber-500 bg-neutral-50 dark:bg-neutral-900'
                          }`}
                        >
                          {q.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                              {q.marks}
                            </span>
                            <span className="text-xs font-bold text-neutral-900 dark:text-white">
                              Question {idx + 1}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                            {q.question}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Model Answer Box */}
                    <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-100 dark:border-neutral-800/80 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                      <strong className="text-emerald-700 dark:text-emerald-400 font-semibold block mb-0.5">
                        Model Answer:
                      </strong>
                      {q.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SAVED NOTES VAULT TAB */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={vaultSearch}
                onChange={(e) => setVaultSearch(e.target.value)}
                placeholder="Search saved notes..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
              />
            </div>
            <span className="text-xs text-neutral-400 font-mono-code">
              {filteredVaultNotes.length} saved
            </span>
          </div>

          {filteredVaultNotes.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620]">
              <BookOpen className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
              <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                No saved notes in vault
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Paste any notes in the Generate tab and click "Save to Vault" to keep your revision notes handy!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVaultNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131620] space-y-3 shadow-xs hover:border-blue-400 dark:hover:border-blue-800 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 font-mono-code">
                        {subjects.find((s) => s.id === note.subjectId)?.name || 'CSE'}
                      </span>
                      <h4 className="text-base font-display font-bold text-neutral-900 dark:text-white mt-0.5">
                        {note.title}
                      </h4>
                    </div>
                    <button
                      onClick={() => onDeleteConciseNote(note.id)}
                      className="p-1.5 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      title="Delete saved note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {note.conciseSummary}
                  </p>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleLoadVaultNote(note)}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Open Notebook Points</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {onStartTimerWithSubject && (
                      <button
                        onClick={() => onStartTimerWithSubject(note.subjectId)}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Study</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
