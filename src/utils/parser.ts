import { Question, PracticeSet } from '../types/exam';

export interface ParseResult {
  success: boolean;
  questions: Question[];
  error?: string;
  inferredTitle?: string;
  inferredDescription?: string;
}

/**
 * Parses free-form text or markdown assessment into structured Question array
 */
export function parseTextAssessment(rawText: string): ParseResult {
  if (!rawText || !rawText.trim()) {
    return { success: false, questions: [], error: 'Input text is empty.' };
  }

  const lines = rawText.split('\n');
  const questions: Question[] = [];
  let currentSection = 'General Section';
  let inferredTitle = '';

  let currentQText = '';
  let currentCodeSnippet: string | undefined = undefined;
  let currentOptions: string[] = [];
  let currentCorrectIndex = -1;
  let currentExplanation = '';
  let currentConcept = '';
  let insideCodeBlock = false;
  let codeBuffer: string[] = [];

  const finalizeQuestion = () => {
    if (currentQText.trim() && currentOptions.length >= 2) {
      // If no explicit answer was parsed, default to 0 with note
      const correctIdx = currentCorrectIndex >= 0 ? currentCorrectIndex : 0;
      const qId = 'gen-q-' + (questions.length + 1) + '-' + Math.random().toString(36).substring(2, 6);

      questions.push({
        id: qId,
        sectionTitle: currentSection,
        questionText: currentQText.trim(),
        codeSnippet: currentCodeSnippet,
        options: currentOptions.slice(0, 5), // take up to 5 options
        correctIndex: correctIdx,
        explanation: currentExplanation.trim() || 'No detailed explanation provided for this question.',
        keyConcept: currentConcept.trim() || undefined,
        difficulty: 'medium',
      });
    }

    // Reset current question buffer
    currentQText = '';
    currentCodeSnippet = undefined;
    currentOptions = [];
    currentCorrectIndex = -1;
    currentExplanation = '';
    currentConcept = '';
    insideCodeBlock = false;
    codeBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check title hint if on first few lines
    if (!inferredTitle && (trimmed.startsWith('# ') || trimmed.startsWith('Title:'))) {
      inferredTitle = trimmed.replace(/^#\s*|^Title:\s*/i, '').trim();
      continue;
    }

    // Code block fences
    if (trimmed.startsWith('```')) {
      if (insideCodeBlock) {
        currentCodeSnippet = codeBuffer.join('\n');
        insideCodeBlock = false;
        codeBuffer = [];
      } else {
        insideCodeBlock = true;
        codeBuffer = [];
      }
      continue;
    }

    if (insideCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Section detection e.g. "### Section A" or "Section B: Calculations" or "--- Sec A ---"
    const sectionMatch = trimmed.match(/^(?:###\s*|---\s*|Section\s+|Sec\s+)([A-Z0-9\s:\-_]+)/i);
    if (sectionMatch && !trimmed.toLowerCase().includes('question') && trimmed.length < 60) {
      currentSection = trimmed.replace(/^[#\-*\s]+|[#\-*\s]+$/g, '').trim();
      continue;
    }

    // Question start pattern: "1. ", "Q1:", "Question 2 -", "1) "
    const qStartMatch = trimmed.match(/^(?:Q(?:uestion)?\s*\d*[:.-]?\s*|\d+[\.\)]\s+)(.+)/i);
    if (qStartMatch && !trimmed.match(/^[A-Ea-e][\.\)]/)) {
      finalizeQuestion();
      currentQText = qStartMatch[1] || trimmed;
      continue;
    }

    // Choice / Option pattern: "A) ...", "A. ...", "(A) ...", "a) ..."
    const optionMatch = trimmed.match(/^[\(\[]?([A-Ea-e])[\)\]\.\:\-]\s*(.+)/);
    if (optionMatch && currentQText) {
      const optionText = optionMatch[2].trim();
      currentOptions.push(optionText);
      continue;
    }

    // Correct Answer detection: "Answer: B", "Correct: B", "Ans: A", "Correct Answer: B"
    const answerMatch = trimmed.match(/^(?:Answer|Correct\s*Answer|Ans|Key)[\s:\-_]+([A-Ea-e0-9])/i);
    if (answerMatch) {
      const char = answerMatch[1].toUpperCase();
      if (char >= 'A' && char <= 'E') {
        currentCorrectIndex = char.charCodeAt(0) - 65;
      } else {
        const num = parseInt(char, 10);
        if (!isNaN(num) && num >= 1 && num <= 5) {
          currentCorrectIndex = num - 1;
        }
      }
      continue;
    }

    // Explanation detection: "Explanation: ...", "Rationale: ..."
    const explMatch = trimmed.match(/^(?:Explanation|Rationale|Reason|Why)[\s:\-_]+(.+)/i);
    if (explMatch) {
      currentExplanation = explMatch[1];
      continue;
    }

    // Key concept: "Concept: ...", "Topic: ..."
    const conceptMatch = trimmed.match(/^(?:Key\s*Concept|Concept|Topic)[\s:\-_]+(.+)/i);
    if (conceptMatch) {
      currentConcept = conceptMatch[1];
      continue;
    }

    // Continuation lines
    if (currentExplanation) {
      if (trimmed) currentExplanation += ' ' + trimmed;
    } else if (currentOptions.length > 0) {
      // Continuation of the last option if indented or text
      if (trimmed) {
        currentOptions[currentOptions.length - 1] += ' ' + trimmed;
      }
    } else if (currentQText) {
      // Continuation of question text
      if (trimmed) {
        currentQText += ' ' + trimmed;
      }
    }
  }

  // Finalize last question in buffer
  finalizeQuestion();

  if (questions.length === 0) {
    return {
      success: false,
      questions: [],
      error: 'Could not detect any questions. Make sure questions start with "1. " or "Q1:" and options start with "A)", "B)", etc.',
    };
  }

  return {
    success: true,
    questions,
    inferredTitle: inferredTitle || `Practice Exam (${questions.length} Questions)`,
  };
}

/**
 * Parses JSON format
 */
export function parseJsonAssessment(jsonString: string): ParseResult {
  try {
    const parsed = JSON.parse(jsonString);

    let rawQuestions: any[] = [];
    let inferredTitle = '';
    let inferredDescription = '';

    if (Array.isArray(parsed)) {
      rawQuestions = parsed;
    } else if (parsed && Array.isArray(parsed.questions)) {
      rawQuestions = parsed.questions;
      inferredTitle = parsed.title || '';
      inferredDescription = parsed.description || '';
    } else {
      return {
        success: false,
        questions: [],
        error: 'JSON must either be an array of questions or an object with a "questions" array property.',
      };
    }

    const questions: Question[] = rawQuestions.map((q, idx) => {
      const qId = q.id || `json-q-${idx + 1}-${Date.now().toString(36)}`;
      const options = Array.isArray(q.options) ? q.options.map(String) : [];

      let correctIndex = 0;
      if (typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < options.length) {
        correctIndex = q.correctIndex;
      } else if (typeof q.answer === 'string') {
        const char = q.answer.trim().toUpperCase();
        if (char >= 'A' && char <= 'E') {
          correctIndex = char.charCodeAt(0) - 65;
        }
      }

      return {
        id: qId,
        sectionTitle: q.sectionTitle || 'General',
        questionText: q.questionText || q.question || `Question ${idx + 1}`,
        codeSnippet: q.codeSnippet || undefined,
        options,
        correctIndex,
        explanation: q.explanation || q.rationale || 'No explanation provided.',
        keyConcept: q.keyConcept || q.topic || undefined,
        difficulty: (['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium') as any,
      };
    });

    return {
      success: true,
      questions,
      inferredTitle: inferredTitle || `Imported Assessment (${questions.length} Questions)`,
      inferredDescription,
    };
  } catch (err: any) {
    return {
      success: false,
      questions: [],
      error: `Invalid JSON format: ${err.message}`,
    };
  }
}

export const SAMPLE_TEXT_TEMPLATE = `Title: Distributed Systems & Consensus Basics

### Section A: Foundations
1. What does the CAP theorem state regarding distributed data stores?
A) Consistency, Availability, and Partition Tolerance cannot all be simultaneously guaranteed
B) All nodes must have continuous AC power
C) Networks can never drop packets if TCP is used
D) Centralized master-slave systems always deliver infinite throughput
Answer: A
Explanation: The CAP theorem proves that in the presence of a network partition (P), a distributed system must choose between Consistency (C) and Availability (A).
Key Concept: CAP Theorem Trade-offs

2. In the Raft consensus algorithm, which mechanism is used to detect leader failure and initiate a new election term?
A) Periodic randomized heartbeat timeouts
B) Constant disk polling
C) Manual administrator intervention
D) Three-way TCP handshake termination
Answer: A
Explanation: Raft uses randomized heartbeat timeouts (typically 150ms-300ms) so that candidate nodes do not split votes simultaneously when a leader misses heartbeats.
Key Concept: Raft Election Timeouts

### Section B: Applied Scenarios
3. When is optimistic concurrency control preferred over pessimistic locking in a high-concurrency database?
A) When write-write collisions and transaction conflicts are rare
B) When all operations require multi-hour exclusive table locks
C) When the database runs exclusively in single-user mode
D) When network latency is infinite
Answer: A
Explanation: Optimistic concurrency control allows transactions to execute without locking resources, verifying consistency only at commit time. It shines when collision probability is low, avoiding heavy locking overhead.
Key Concept: Optimistic vs Pessimistic Locking
`;

export const SAMPLE_JSON_TEMPLATE = JSON.stringify(
  {
    title: 'Modern Web Performance & Browser Internals',
    description: 'High-yield practice test covering Critical Rendering Path, Web Vitals, and caching.',
    questions: [
      {
        sectionTitle: 'Sec A: Critical Rendering Path',
        questionText: 'Which Web Vital metric measures visual stability and unexpected layout shifts during page load?',
        options: [
          'Largest Contentful Paint (LCP)',
          'Cumulative Layout Shift (CLS)',
          'First Input Delay (FID)',
          'Time to First Byte (TTFB)',
        ],
        correctIndex: 1,
        explanation: 'CLS measures the cumulative score of all unexpected layout shifts that occur during the entire lifespan of the page, ensuring users do not accidentally click moved elements.',
        keyConcept: 'Core Web Vitals - CLS',
        difficulty: 'medium',
      },
      {
        sectionTitle: 'Sec B: Caching & Headers',
        questionText: 'What HTTP Cache-Control directive instructs browsers and CDNs to check back with the origin server before using a cached copy?',
        options: [
          'no-store',
          'no-cache',
          'public, max-age=31536000',
          'immutable',
        ],
        correctIndex: 1,
        explanation: 'no-cache does NOT mean do not cache; rather it requires caches to submit the request to the origin server for validation (e.g. using ETag or If-Modified-Since) before releasing a cached copy. no-store forbids caching entirely.',
        keyConcept: 'HTTP Caching Directives',
        difficulty: 'hard',
      },
    ],
  },
  null,
  2
);

export const AI_PROMPT_TEMPLATE = (subjectTitle: string, topic: string, questionCount: number = 8) => {
  return `Generate an interactive practice exam on "${topic}" for the subject "${subjectTitle}" containing ${questionCount} multiple-choice questions.

Follow this exact format for each question so that it parses cleanly into ReviseIQ:

Title: ${subjectTitle} - ${topic} Practice Exam

### Section A: Core Principles
1. [Clear question text here]
A) [Option 1]
B) [Option 2]
C) [Option 3]
D) [Option 4]
Answer: [A, B, C, or D]
Explanation: [Detailed verbatim rationale explaining why the correct choice is true and why the key distractors are false]
Key Concept: [Core topic or theorem]

2. [Next question...]
...

Include realistic technical scenarios, rigorous explanations, and 2 sections (Sec A: Principles, Sec B: Applied Problem Solving).`;
};
