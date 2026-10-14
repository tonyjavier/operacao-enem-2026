import { useEffect, useState } from 'react';
import { Check, Play, Square } from 'lucide-react';
import { Button } from '../../components/UI';

type Props = { onFinish: (durationMinutes: number) => void };

function clock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function EssayTimer({ onFinish }: Props) {
  const [targetMinutes, setTargetMinutes] = useState(90);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startedAt === null) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  const elapsed = startedAt === null ? 0 : Math.max(0, Math.floor((now - startedAt) / 1000));
  const remaining = Math.max(0, targetMinutes * 60 - elapsed);

  function start() {
    const timestamp = Date.now();
    setStartedAt(timestamp);
    setNow(timestamp);
  }

  function finish() {
    if (startedAt === null) return;
    const minutes = Math.max(1, Math.ceil((Date.now() - startedAt) / 60_000));
    setStartedAt(null);
    onFinish(minutes);
  }

  return <div className="essay-timer"><div className="essay-timer-copy"><strong>Cronômetro da redação</strong><p>Escolha 80–90 min. Só funciona enquanto esta tela estiver aberta; o tempo só será salvo ao enviar a ficha.</p></div><label className="essay-timer-target"><span className="sr-only">Duração-alvo</span><select value={targetMinutes} disabled={startedAt !== null} onChange={(event) => setTargetMinutes(Number(event.target.value))}><option value={80}>80 min</option><option value={85}>85 min</option><option value={90}>90 min</option></select></label><output className="essay-timer-clock" role="timer" aria-label={`${Math.floor(remaining / 60)} minutos e ${remaining % 60} segundos restantes`}>{startedAt === null ? `${targetMinutes}:00` : clock(remaining)}</output>{startedAt === null ? <Button type="button" variant="secondary" onClick={start}><Play size={15} />Iniciar</Button> : <Button type="button" onClick={finish}><Square size={14} />Finalizar e registrar <Check size={15} /></Button>}</div>;
}
