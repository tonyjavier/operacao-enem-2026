export type TimerMode = 'essay' | 'pomodoro';
export type TimerPhase = 'focus' | 'break';

export function timerSeconds(mode: TimerMode, phase: TimerPhase, writingMinutes: number): number {
  if (mode === 'essay') return writingMinutes * 60;
  return (phase === 'focus' ? 25 : 5) * 60;
}

export function nextPomodoroPhase(phase: TimerPhase): TimerPhase {
  return phase === 'focus' ? 'break' : 'focus';
}
