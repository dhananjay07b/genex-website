"""
Quiz lessons (CourseLesson kind "quiz"): their questions, what learners are
sent, and grading. Grading happens only here, on the server: learners get the
questions without the right answers, submit, and get their result back.

Questions are handled as plain dicts ({prompt, options, correct, explanation})
so a live quiz's edits can wait for review in CourseLesson.pending["questions"]
like any other field (learning/revisions.py).
"""
from django.db import transaction

from .models import QuizAttempt, QuizQuestion


def live_questions(lesson):
    """The approved questions, as learners take them."""
    return [q.as_dict() for q in lesson.questions.all()]


def lesson_questions(lesson):
    """
    The questions of `lesson` as given: the author's version when `lesson` is a
    copy from learning.lessons.with_pending carrying edited questions, else the live ones.
    """
    held = getattr(lesson, "_questions", None)
    return held if held is not None else live_questions(lesson)


@transaction.atomic
def write_questions(lesson, questions):
    """Replace the lesson's questions. Past attempts keep their scores."""
    lesson.questions.all().delete()
    QuizQuestion.objects.bulk_create([
        QuizQuestion(lesson=lesson, position=i, prompt=q["prompt"], options=q["options"],
                     correct=q["correct"], explanation=q.get("explanation", ""))
        for i, q in enumerate(questions)
    ])


def for_learner(questions):
    """What the quiz page shows before submitting: no right answers, no explanations."""
    return [{"prompt": q["prompt"], "options": q["options"], "multiple": len(q["correct"]) > 1} for q in questions]


def answers_problem(questions, answers):
    """Why `answers` ([[option index], …], one list per question) can't be graded, or None."""
    if not isinstance(answers, list) or len(answers) != len(questions):
        return "Answer every question."
    for q, chosen in zip(questions, answers):
        if not isinstance(chosen, list) or not chosen:
            return "Answer every question."
        if any(not isinstance(i, int) or isinstance(i, bool) or not 0 <= i < len(q["options"]) for i in chosen):
            return "One of the answers isn't an option of its question."
        if len(q["correct"]) == 1 and len(chosen) != 1:
            return "Pick one answer for each single-choice question."
    return None


def grade(questions, answers, pass_mark):
    """
    Score `answers`. A question counts only when exactly the right options are
    chosen. Returns (score, percent, passed, results); each result says whether
    that answer was right and gives the author's explanation.
    """
    results, score = [], 0
    for q, chosen in zip(questions, answers):
        right = sorted(set(chosen)) == sorted(q["correct"])
        score += right
        results.append({"correct": right, "explanation": q.get("explanation", "")})
    percent = round(100 * score / len(questions)) if questions else 0
    return score, percent, percent >= pass_mark, results


def best_attempt(user, lesson):
    """The learner's best saved attempt (a pass beats any fail), or None."""
    if not user.is_authenticated:
        return None
    attempt = QuizAttempt.objects.filter(user=user, lesson=lesson).order_by("-passed", "-score", "-created_at").first()
    if attempt is None:
        return None
    return {"score": attempt.score, "total": attempt.total, "passed": attempt.passed}
