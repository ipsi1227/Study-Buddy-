import { Subject, Assignment, Exam, StudyRecommendation } from '../types';

export function generatePersonalizedRecommendations(
  major: string,
  semester: string,
  subjects: Subject[],
  assignments: Assignment[],
  exams: Exam[]
): StudyRecommendation[] {
  const recommendations: StudyRecommendation[] = [];
  const normalizedMajor = (major || '').toLowerCase();
  const normalizedSemester = (semester || '').toLowerCase();

  // 1. Major-Specific Strategic Advice
  if (normalizedMajor.includes('computer') || normalizedMajor.includes('software') || normalizedMajor.includes('cs')) {
    recommendations.push({
      id: 'cs-deep-work',
      category: 'methodology',
      title: 'Algorithmic Synthesis & Code Blocking',
      description: 'Computer science coursework demands high-focus debugging and algorithmic proofs. Context switching damages programming throughput by up to 40%.',
      actionableStep: 'Schedule uninterrupted 90-minute Pomodoro blocks specifically for coding assignments and data structure proofs at least 3 days prior to submission.',
      impact: 'high',
      targetSubject: subjects.find(s => s.code.toLowerCase().includes('cs') || s.name.toLowerCase().includes('algorithm') || s.name.toLowerCase().includes('data'))?.name,
    });
    recommendations.push({
      id: 'cs-concept-mapping',
      category: 'schedule',
      title: 'Lab & Lecture Synchronization',
      description: 'Review lecture notes and trace pointer/memory/complexity diagrams within 4 hours of lecture to cement theoretical intuition.',
      actionableStep: 'Dedicate 20 minutes before each lab session to re-read edge cases and run unit tests on lecture sample code.',
      impact: 'medium',
    });
  } else if (normalizedMajor.includes('med') || normalizedMajor.includes('bio') || normalizedMajor.includes('chem') || normalizedMajor.includes('health')) {
    recommendations.push({
      id: 'premed-spaced-rep',
      category: 'methodology',
      title: 'High-Yield Spaced Repetition (Anki/Recall)',
      description: 'Biomedical curricula require dense nomenclature, metabolic pathways, and anatomical spatial memory that decay rapidly without active recall.',
      actionableStep: 'Implement a 1-3-7 day spaced recall cycle. Never just re-read lecture slides; write active recall question prompts per topic.',
      impact: 'high',
      targetSubject: subjects.find(s => s.name.toLowerCase().includes('bio') || s.name.toLowerCase().includes('chem') || s.name.toLowerCase().includes('anat'))?.name,
    });
    recommendations.push({
      id: 'premed-diagrams',
      category: 'exam_prep',
      title: 'Blind Pathway Schematics',
      description: 'For cellular biology, organic mechanisms, and biochemistry, drawing mechanisms from memory outperforms passive reading by 3x.',
      actionableStep: 'Test yourself on a blank whiteboard: draw biochemical cycles or anatomical systems completely from memory without notes.',
      impact: 'high',
    });
  } else if (normalizedMajor.includes('eng') || normalizedMajor.includes('physics') || normalizedMajor.includes('math')) {
    recommendations.push({
      id: 'eng-problem-sets',
      category: 'methodology',
      title: 'Varied Problem Sets & First Principles',
      description: 'Engineering and mathematical exams reward deep intuition of governing equations rather than rote formula substitution.',
      actionableStep: 'Solve 3 unfamiliar benchmark problems per week under timed conditions without referring to the formula sheet until the end.',
      impact: 'high',
      targetSubject: subjects.find(s => s.name.toLowerCase().includes('math') || s.name.toLowerCase().includes('physics') || s.name.toLowerCase().includes('mechanic'))?.name,
    });
  } else if (normalizedMajor.includes('business') || normalizedMajor.includes('econ') || normalizedMajor.includes('finance')) {
    recommendations.push({
      id: 'econ-case-study',
      category: 'methodology',
      title: 'Case Synthesis & Quantitative Modeling',
      description: 'Economics and business require linking quantitative financial metrics to qualitative strategic arguments.',
      actionableStep: 'Summarize every case study into a 1-page executive memo: Problem, 3 Quantitative Constraints, Decision, and Trade-offs.',
      impact: 'high',
    });
  } else {
    // General academic excellence
    recommendations.push({
      id: 'general-feynman',
      category: 'methodology',
      title: 'The Feynman Explanation Technique',
      description: 'Identify conceptual bottlenecks by translating complex syllabus ideas into clear, jargon-free explanations.',
      actionableStep: 'Explain today’s primary lecture takeaway aloud in 2 minutes as if teaching a peer who missed class.',
      impact: 'high',
    });
  }

  // 2. Semester Phase Specific Guidance
  if (normalizedSemester.includes('1') || normalizedSemester.includes('freshman') || normalizedSemester.includes('first')) {
    recommendations.push({
      id: 'sem1-pacing',
      category: 'schedule',
      title: 'Freshman Transition: Office Hours & Habit Anchors',
      description: 'First-year performance is determined by establishing reliable daily study rhythms and attending professor office hours early.',
      actionableStep: 'Visit at least one professor or TA office hour this week with 2 prepared questions on upcoming assignment rubrics.',
      impact: 'high',
    });
  } else if (normalizedSemester.includes('3') || normalizedSemester.includes('4') || normalizedSemester.includes('sophomore')) {
    recommendations.push({
      id: 'sem4-core',
      category: 'career',
      title: 'Sophomore Heavy-Core Balancing',
      description: 'Intermediate semesters feature dense prerequisite weed-out courses. Protecting GPA while building project portfolios is key.',
      actionableStep: 'Reserve Friday afternoons for consolidating weekly problem sets so your weekends stay balanced for rest and projects.',
      impact: 'medium',
    });
  } else if (normalizedSemester.includes('5') || normalizedSemester.includes('6') || normalizedSemester.includes('junior')) {
    recommendations.push({
      id: 'sem6-internship',
      category: 'career',
      title: 'Junior Year Internship & Capstone Pacing',
      description: 'Upper-division electives demand independent research. Prevent burnout by scheduling non-negotiable downtime.',
      actionableStep: 'Chunk long-range term papers or capstone deliverables into weekly milestones with hard personal deadlines.',
      impact: 'high',
    });
  } else if (normalizedSemester.includes('7') || normalizedSemester.includes('8') || normalizedSemester.includes('senior')) {
    recommendations.push({
      id: 'sem8-capstone',
      category: 'career',
      title: 'Senior Exit & Comprehensive Mastery',
      description: 'Synthesize your degree achievements into capstone defense and career-readiness materials.',
      actionableStep: 'Schedule focused thesis/project blocks in the mornings before daily interruptions begin.',
      impact: 'high',
    });
  }

  // 3. Urgent Exam & Assignment Deadlines Analysis
  const now = new Date();
  const upcomingExams = exams
    .filter(e => e.status === 'upcoming')
    .map(e => ({ ...e, daysLeft: Math.ceil((new Date(e.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (upcomingExams.length > 0) {
    const nextExam = upcomingExams[0];
    const examSubject = subjects.find(s => s.id === nextExam.subjectId)?.name || 'Course';

    if (nextExam.daysLeft <= 7 && nextExam.daysLeft >= 0) {
      recommendations.unshift({
        id: `exam-crunch-${nextExam.id}`,
        category: 'exam_prep',
        title: `Priority Exam Defense: ${examSubject} (${nextExam.daysLeft} days away)`,
        description: `Your ${nextExam.title} is approaching rapidly with a weight of ${nextExam.weightPercent}% and ${nextExam.syllabusCoveragePercent}% current syllabus coverage.`,
        actionableStep: `Shift 60% of your daily study timer to ${examSubject}. Complete at least two full-length timed mock exams before test day.`,
        impact: 'high',
        targetSubject: examSubject,
      });
    } else {
      recommendations.push({
        id: `exam-prep-${nextExam.id}`,
        category: 'exam_prep',
        title: `Proactive Syllabus Pacing: ${nextExam.title}`,
        description: `You have ${nextExam.daysLeft} days until your ${nextExam.title} for ${examSubject}.`,
        actionableStep: `Aim to increase syllabus coverage by 15% this week to avoid the exponential cognitive penalty of last-minute cramming.`,
        impact: 'medium',
        targetSubject: examSubject,
      });
    }
  }

  // 4. Assignments Due Soon Analysis
  const pendingAssignments = assignments
    .filter(a => a.status !== 'completed')
    .map(a => ({ ...a, hoursLeft: (new Date(a.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60) }))
    .filter(a => a.hoursLeft > 0 && a.hoursLeft <= 72);

  if (pendingAssignments.length > 0) {
    const urgentAssn = pendingAssignments[0];
    const assnSubject = subjects.find(s => s.id === urgentAssn.subjectId)?.name || 'Subject';
    recommendations.unshift({
      id: `urgent-assn-${urgentAssn.id}`,
      category: 'schedule',
      title: `Assignment Looming: "${urgentAssn.title}"`,
      description: `Due in less than ${Math.round(urgentAssn.hoursLeft)} hours for ${assnSubject}.`,
      actionableStep: `Break remaining tasks into 2 bite-sized checklists and finish the first milestone in today's next focus session.`,
      impact: 'high',
      targetSubject: assnSubject,
    });
  }

  // 5. Wellness & Cognitive Endurance
  recommendations.push({
    id: 'wellness-circadian',
    category: 'wellness',
    title: 'Circadian Focus & Sleep Consolidation',
    description: 'Neurobiological research shows long-term memory consolidation occurs predominantly in slow-wave REM sleep. An all-nighter reduces retention by up to 50%.',
    actionableStep: 'Cap intense study sessions 45 minutes before sleep to allow your brain to synthesize new concepts.',
    impact: 'medium',
  });

  return recommendations;
}
