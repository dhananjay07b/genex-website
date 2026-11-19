import type { QuizQuestion } from '@/types/learning'

/** Mirrors backend learning.models (MAX_QUIZ_QUESTIONS, MIN/MAX_QUIZ_OPTIONS). */
export const QUIZ_LIMITS = { questions: 30, minOptions: 2, maxOptions: 6 }

export const blankQuestion = (): QuizQuestion => ({ prompt: '', options: ['', ''], correct: [], explanation: '' })

/** What a question still needs, or '' (the server checks the same). */
export function questionProblem(q: QuizQuestion): string {
  if (!q.prompt.trim()) return 'Write the question.'
  const options = q.options.map(o => o.trim())
  if (options.length < QUIZ_LIMITS.minOptions || options.some(o => !o)) return 'Fill in every answer, or remove the empty one.'
  if (new Set(options.map(o => o.toLowerCase())).size !== options.length) return 'Two answers are the same.'
  if (!q.correct.length) return 'Mark the right answer.'
  return ''
}

/** What's wrong with the quiz before it's sent, or ''. */
export function quizProblem(questions: QuizQuestion[]): string {
  for (const [i, q] of questions.entries()) {
    const problem = questionProblem(q)
    if (problem) return `Question ${i + 1}: ${problem.charAt(0).toLowerCase()}${problem.slice(1)}`
  }
  return ''
}
