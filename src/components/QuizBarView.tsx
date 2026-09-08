import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Brain,
  Sparkles,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Award,
  Clock,
  Trash2,
  ChevronRight,
  FileText,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { UniNote, Subject, QuizQuestion, QuizResult } from '../types';
import { generateQuizFromNote } from '../utils/quizEngine';
import { soundFx } from '../utils/audio';

interface QuizBarViewProps {
  notes: UniNote[];
  subjects: Subject[];
  quizResults: QuizResult[];
  onAddNote: (note: UniNote) => void;
  onDeleteNote: (id: string) => void;
  onSaveQuizResult: (result: QuizResult) => void;
}

export const QuizBarView: React.FC<QuizBarViewProps> = ({
  notes,
  subjects,
  quizResults,
  onAddNote,
  onDeleteNote,
  onSaveQuizResult,
}) => {
  // Quiz active state
  const [activeQuiz, setActiveQuiz] = useState<{
    noteTitle: string;
    subjectId: string;
    questions: QuizQuestion[];
  } | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  // Add Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubjectId, setNoteSubjectId] = useState(subjects[0]?.id || '');
  const [noteUnit, setNoteUnit] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');

  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  const launchQuizForNote = (note: UniNote) => {
    soundFx.playTick();
    const questions = generateQuizFromNote(note);
    setActiveQuiz({
      noteTitle: note.title,
      subjectId: note.subjectId,
      questions,
    });
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizFinished(false);
    setUserAnswers([]);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !activeQuiz) return;
    setIsAnswerSubmitted(true);

    const currentQ = activeQuiz.questions[currentQIndex];
    const isCorrect = selectedOption === currentQ.correctIndex;
    setUserAnswers([...userAnswers, selectedOption]);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      soundFx.playTick();
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;

    if (currentQIndex + 1 < activeQuiz.questions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Finished quiz!
      setIsQuizFinished(true);
      const total = activeQuiz.questions.length;
      const finalScore = score + (selectedOption === activeQuiz.questions[currentQIndex].correctIndex ? 1 : 0);
      const percentage = Math.round((finalScore / total) * 100);

      // Trigger celebratory confetti if passed well
      if (percentage >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        soundFx.playCompletionBell();
      }

      onSaveQuizResult({
        id: `qres-${Date.now()}`,
        noteTitle: activeQuiz.noteTitle,
        subjectId: activeQuiz.subjectId,
        score: finalScore,
        totalQuestions: total,
        percentage,
        date: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleSaveNewNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const newNote: UniNote = {
      id: `note-${Date.now()}`,
      subjectId: noteSubjectId,
      title: noteTitle.trim(),
      unitOrModule: noteUnit.trim() || 'Unit 1: Lecture Concepts',
      content: noteContent.trim(),
      dateAdded: new Date().toISOString().split('T')[0],
      tags: noteTags
        ? noteTags.split(',').map((t) => t.trim()).filter(Boolean)
        : ['College Notes'],
    };

    onAddNote(newNote);
    setIsNoteModalOpen(false);
    setNoteTitle('');
    setNoteContent('');
    setNoteUnit('');
    setNoteTags('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* PERSISTENT QUIZ BAR BANNER */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold shadow-sm shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 font-mono-code px-2 py-0.5 rounded-md bg-amber-500/20">
                Self-Test Readiness Bar
              </span>
              <span className="text-[11px] text-neutral-500 flex items-center gap-1 font-mono-code">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                {quizResults.length} Quizzes Completed
              </span>
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
              Ready to test your concept mastery?
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Generate instant multiple-choice quizzes directly from your shared college notes & lecture slides.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#121620] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload / Paste Notes</span>
          </button>

          {notes.length > 0 && !activeQuiz && (
            <button
              onClick={() => launchQuizForNote(notes[0])}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-400 transition flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Quick Quiz Now</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE QUIZ MODAL / IN-LINE EXPERIENCE */}
      {activeQuiz && (
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#10141e] p-6 sm:p-8 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
          {!isQuizFinished ? (
            <div>
              {/* Quiz Header */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-6">
                <div>
                  <span className="text-[10px] font-bold font-mono-code uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Quiz in Progress • {activeQuiz.noteTitle}
                  </span>
                  <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
                    Question {currentQIndex + 1} of {activeQuiz.questions.length}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-neutral-400">Current Score</span>
                    <div className="text-sm font-bold font-mono-code text-amber-700 dark:text-amber-400">
                      {score} / {activeQuiz.questions.length}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs font-semibold"
                  >
                    Exit
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-6">
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Topic: {activeQuiz.questions[currentQIndex].topic}
                </span>
                <p className="font-display text-base sm:text-lg font-bold text-neutral-900 dark:text-white mt-1.5 leading-snug">
                  {activeQuiz.questions[currentQIndex].question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {activeQuiz.questions[currentQIndex].options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === activeQuiz.questions[currentQIndex].correctIndex;

                  let borderClass = 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300';
                  let bgClass = 'bg-neutral-50/70 dark:bg-neutral-900/40';

                  if (isSelected && !isAnswerSubmitted) {
                    borderClass = 'border-amber-500 ring-1 ring-amber-500/50';
                    bgClass = 'bg-amber-500/10 text-neutral-900 dark:text-white';
                  }

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      borderClass = 'border-emerald-500 ring-2 ring-emerald-500/30';
                      bgClass = 'bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      borderClass = 'border-rose-500';
                      bgClass = 'bg-rose-500/15 text-rose-950 dark:text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition flex items-start justify-between gap-3 ${borderClass} ${bgClass}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg text-xs font-bold font-mono-code flex items-center justify-center bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box after submit */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 mb-6 space-y-1">
                  <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Concept Breakdown & Explanation:</span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed">
                    {activeQuiz.questions[currentQIndex].explanation}
                  </p>
                </div>
              )}

              {/* Bottom Action */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="px-6 py-2.5 rounded-xl font-semibold text-xs bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 disabled:opacity-40 transition shadow-xs"
                  >
                    Verify Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl font-semibold text-xs bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 transition flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{currentQIndex + 1 === activeQuiz.questions.length ? 'View Final Results' : 'Next Question'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* RESULTS SCREEN */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Quiz Completed
                </span>
                <h3 className="font-display text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                  You scored {score} / {activeQuiz.questions.length} (
                  {Math.round((score / activeQuiz.questions.length) * 100)}%)
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {score === activeQuiz.questions.length
                    ? 'Flawless mastery! Your university exam readiness is in top shape.'
                    : 'Great effort! Review the tricky concepts in your lecture notes.'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => launchQuizForNote(notes.find((n) => n.title === activeQuiz.noteTitle) || notes[0])}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-400 transition"
                >
                  Done & Close Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SHARED UNIVERSITY NOTES GRID */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
              Shared University Lecture Notes & Flash Decks
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Each note automatically fuels self-assessment quizzes to test your understanding.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => {
            const sub = getSubject(note.subjectId);
            return (
              <div
                key={note.id}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] p-5 shadow-2xs flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sub?.accentColor || '#10b981' }}
                      />
                      <span className="text-xs font-bold font-mono-code text-neutral-900 dark:text-white">
                        {sub?.code || 'CSE'}
                      </span>
                      {note.unitOrModule && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 truncate max-w-[160px]">
                          {note.unitOrModule}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 text-neutral-400 hover:text-rose-500 transition"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-display text-base font-bold text-neutral-900 dark:text-white">
                    {note.title}
                  </h4>

                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 line-clamp-3 leading-relaxed whitespace-pre-line font-mono-code text-[11px] bg-neutral-50 dark:bg-neutral-900/50 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800/80">
                    {note.content}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {note.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400 font-mono-code">
                    Added {note.dateAdded}
                  </span>

                  <button
                    onClick={() => launchQuizForNote(note)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-400 transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Take Note Quiz</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADD / PASTE NOTE MODAL */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121620] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
                  Add / Paste University Notes
                </h3>
                <p className="text-xs text-neutral-500">
                  Paste lecture concepts or formulas. The quiz engine will generate practice questions automatically!
                </p>
              </div>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewNote} className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. OS Unit 4: Paging & Virtual Memory"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Associated Subject *
                  </label>
                  <select
                    value={noteSubjectId}
                    onChange={(e) => setNoteSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Unit / Module Label
                  </label>
                  <input
                    type="text"
                    value={noteUnit}
                    onChange={(e) => setNoteUnit(e.target.value)}
                    placeholder="e.g. Unit 3: Deadlocks"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Note Content / Key Definitions & Proofs *
                </label>
                <textarea
                  required
                  rows={8}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder={`Paste definitions, bullet points, algorithm invariants or formulas here...
Example:
- Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait
- Banker's Algorithm: Need Matrix = Max - Allocation`}
                  className="w-full px-3.5 py-2.5 text-xs font-mono-code rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={noteTags}
                  onChange={(e) => setNoteTags(e.target.value)}
                  placeholder="Midsem, GATE, Viva, Formulas"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 font-bold text-xs hover:bg-neutral-800 dark:hover:bg-amber-400 transition"
                >
                  Save Notes & Ready for Quizzing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
