import type { QuizQuestion } from '@/types/learning'

/** Mirrors backend learning.models (MAX_QUIZ_QUESTIONS, MIN/MAX_QUIZ_OPTIONS). */
export const QUIZ_LIMITS = { questions: 30, minOptions: 2, maxOptions: 6 }

export const blankQuestion = (): QuizQuestion => ({ prompt: '', options: ['', ''], correct: [], explanation: '' })

/** What's wrong with the quiz before it's sent (the server checks the same), or ''. */
export function quizProblem(questions: QuizQuestion[]): string {
  for (const [i, q] of questions.entries()) {
    const n = `Question ${i + 1}`
    if (!q.prompt.trim()) return `${n}: write the question.`
    const options = q.options.map(o => o.trim())
    if (options.length < QUIZ_LIMITS.minOptions || options.some(o => !o)) return `${n}: fill in every answer, or remove the empty one.`
    if (new Set(options.map(o => o.toLowerCase())).size !== options.length) return `${n}: two answers are the same.`
    if (!q.correct.length) return `${n}: tick the right answer.`
  }
  return ''
}
