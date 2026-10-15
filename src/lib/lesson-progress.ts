export function parseResumePositionSeconds(input: string, durationSeconds: number | null): number | null {
  if (input.trim() === '') return null;

  const value = Number(input);
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error('Informe um ponto de retomada inteiro e não negativo em segundos.');
  }
  if (durationSeconds !== null && value > durationSeconds) {
    throw new Error(`O ponto de retomada não pode superar a duração cadastrada (${durationSeconds} s).`);
  }
  return value;
}
