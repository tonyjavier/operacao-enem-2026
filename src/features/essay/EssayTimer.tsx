import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Pause, Play, RotateCcw, Square, X } from 'lucide-react';
import { Button } from '../../components/UI';
import { nextPomodoroPhase, timerSeconds } from './timer';
import type { TimerMode, TimerPhase } from './timer';

function clock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function EssayTimer() {
  const [mode, setMode] = useState<TimerMode>('essay');
  const [targetMinutes, setTargetMinutes] = useState(90);
  const [phase, setPhase] = useState<TimerPhase>('focus');
  const [remaining, setRemaining] = useState(90 * 60);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [pomodoros, setPomodoros] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!running || deadline === null) return;
    const tick = () => {
      const now = Date.now();
      const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
      setRemaining(seconds);
      if (seconds > 0) return;
      if (mode === 'pomodoro') {
        const nextPhase = nextPomodoroPhase(phase);
        const nextSeconds = timerSeconds(mode, nextPhase, targetMinutes);
        if (phase === 'focus') setPomodoros((count) => count + 1);
        setPhase(nextPhase);
        setRemaining(nextSeconds);
        setDeadline(now + nextSeconds * 1000);
      } else {
        setRunning(false);
        setDeadline(null);
        setFinished(true);
      }
    };
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [deadline, mode, phase, running]);

  useEffect(() => {
    if (!fullScreen) return;
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setFullScreen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = oldOverflow;
      if (returnFocus?.isConnected) returnFocus.focus();
    };
  }, [fullScreen]);

  function start() {
    const now = Date.now();
    const seconds = timerSeconds(mode, 'focus', targetMinutes);
    setPhase('focus');
    setRemaining(seconds);
    setDeadline(now + seconds * 1000);
    setRunning(true);
    setFinished(false);
    setPomodoros(0);
    setFullScreen(true);
  }

  function pause() {
    if (deadline !== null) setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    setDeadline(null);
    setRunning(false);
  }

  function resume() {
    const now = Date.now();
    setDeadline(now + remaining * 1000);
    setRunning(true);
  }

  function stop() {
    setRunning(false);
    setDeadline(null);
    setPhase('focus');
    setRemaining(timerSeconds(mode, 'focus', targetMinutes));
    setPomodoros(0);
    setFinished(false);
    setFullScreen(false);
  }

  function changeMode(nextMode: TimerMode) {
    setMode(nextMode);
    setPhase('focus');
    setFinished(false);
    setRemaining(timerSeconds(nextMode, 'focus', targetMinutes));
  }

  const phaseLabel = mode === 'pomodoro' ? phase === 'focus' ? 'Foco' : 'Pausa' : 'Redação cronometrada';
  const helper = mode === 'pomodoro' ? '25 min de foco e 5 min de pausa. O ciclo se repete até você encerrar.' : 'Escolha 80, 85 ou 90 min para treinar uma redação completa.';

  return (
    <>
      <div className="essay-timer">
        <div className="essay-timer-copy">
          <strong>{mode === 'pomodoro' ? 'Pomodoro' : 'Cronômetro de redação'}</strong>
          <p>{finished ? 'Treino finalizado.' : helper}</p>
        </div>
        {!running && <label className="essay-timer-mode"><span className="sr-only">Modo do cronômetro</span><select value={mode} onChange={(event) => changeMode(event.target.value as TimerMode)}><option value="essay">Redação</option><option value="pomodoro">Pomodoro 25/5</option></select></label>}
        {mode === 'essay' && <label className="essay-timer-target"><span className="sr-only">Duração do cronômetro</span><select value={targetMinutes} disabled={running} onChange={(event) => { const minutes = Number(event.target.value); setTargetMinutes(minutes); setRemaining(minutes * 60); }}><option value={80}>80 min</option><option value={85}>85 min</option><option value={90}>90 min</option></select></label>}
        <output className="essay-timer-clock" role="timer" aria-label={`${Math.floor(remaining / 60)} minutos e ${remaining % 60} segundos restantes`}>
          {clock(remaining)}
        </output>
        {!running ? <Button type="button" variant="secondary" onClick={start}>{finished ? <RotateCcw size={15} /> : <Play size={15} />}{finished ? 'Recomeçar' : 'Iniciar cronômetro'}</Button> : <Button type="button" onClick={() => setFullScreen(true)}><Maximize2 size={15} />Voltar ao timer</Button>}
      </div>

      {fullScreen && createPortal(<div className="essay-focus-screen" role="dialog" aria-modal="true" aria-labelledby="essay-focus-title">
        <button ref={closeRef} type="button" className="essay-focus-minimize" onClick={() => setFullScreen(false)} aria-label="Minimizar cronômetro"><X size={20} /><span>Minimizar</span></button>
        <div className="essay-focus-content">
          <p className="essay-focus-kicker" id="essay-focus-title">{mode === 'pomodoro' ? `Pomodoro · ${phaseLabel}` : phaseLabel}</p>
          <output className="essay-focus-clock" role="timer" aria-label={`${Math.floor(remaining / 60)} minutos e ${remaining % 60} segundos restantes`}>{clock(remaining)}</output>
          <p className="essay-focus-message">{mode === 'pomodoro' ? phase === 'focus' ? 'Uma coisa de cada vez. Foque no seu texto.' : 'Pausa curta. Respire e descanse os olhos.' : 'Escreva no seu ritmo. O cronômetro continua enquanto esta tela estiver aberta.'}</p>
          {mode === 'pomodoro' && <span className="essay-focus-count">{pomodoros} {pomodoros === 1 ? 'ciclo de foco concluído' : 'ciclos de foco concluídos'}</span>}
          {finished ? <><p className="essay-focus-finished">Tempo concluído.</p><div className="essay-focus-actions"><Button type="button" onClick={start}><RotateCcw size={16} />Recomeçar</Button></div></> : <div className="essay-focus-actions">
            {running ? <Button type="button" variant="secondary" onClick={pause}><Pause size={17} />Pausar</Button> : <Button type="button" variant="secondary" onClick={resume}><Play size={17} />Continuar</Button>}
            <Button type="button" onClick={stop}><Square size={15} />Encerrar</Button>
          </div>}
        </div>
      </div>, document.body)}
    </>
  );
}
