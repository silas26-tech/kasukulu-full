/**
 * Subjects where learners use a calculator. The calculator is only shown for these,
 * so it does not appear for languages, history and similar subjects.
 */
const CALCULATOR_SUBJECT = /math|physic|chemist|integrated science|science|accounts|statistic|mechanic|agricultur/i;

export function subjectUsesCalculator(subject: string | null | undefined): boolean {
  return !!subject && CALCULATOR_SUBJECT.test(subject);
}
