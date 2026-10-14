import { useEffect, useState } from 'react';
import { Play, RotateCcw, Square } from 'lucide-react';
import { Button } from '../../components/UI';

function clock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function EssayTimer() {
  const [targetMinutes, setTargetMinutes] = useState(90);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (startedAt === null) return;
    const interval = window.setInterval(() => {
      const timestamp = Date.now();
      setNow(timestamp);
      if (timestamp - startedAt >= targetMinutes * 60_000) {
        setStartedAt(null);
        setFinished(true);
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [startedAt, targetMinutes]);

  const elapsed = startedAt === null ? 0 : Math.max(0, Math.floor((now - startedAt) / 1000));
  const remaining = finished ? 0 : Math.max(0, targetMinutes * 60 - elapsed);

  function start() {
    const timestamp = Date.now();
    setStartedAt(timestamp);
    setNow(timestamp);
    setFinished(false);
  }

  function finish() {
    if (startedAt === null) return;
    setStartedAt(null);
    setFinished(true);
  }

  return (
    <div className="essay-timer">
      <div className="essay-timer-copy">
        <strong>Cronômetro</strong>
        <p>{finished ? 'Treino finalizado.' : 'Escolha 80, 85 ou 90 min para treinar.'}</p>
      </div>
      <label className="essay-timer-target">
        <span className="sr-only">Duração do cronômetro</span>
        <select value={targetMinutes} disabled={startedAt !== null} onChange={(event) => setTargetMinutes(Number(event.target.value))}>
          <option value={80}>80 min</option>
          <option value={85}>85 min</option>
          <option value={90}>90 min</option>
        </select>
      </label>
      <output className="essay-timer-clock" role="timer" aria-label={`${Math.floor(remaining / 60)} minutos e ${remaining % 60} segundos restantes`}>
        {startedAt === null && !finished ? `${targetMinutes}:00` : clock(remaining)}
      </output>
      {startedAt === null ? (
        <Button type="button" variant="secondary" onClick={start}>
          {finished ? <RotateCcw size={15} /> : <Play size={15} />}{finished ? 'Recomeçar' : 'Iniciar'}
        </Button>
      ) : (
        <Button type="button" onClick={finish}><Square size={14} />Finalizar</Button>
      )}
    </div>
  );
}
