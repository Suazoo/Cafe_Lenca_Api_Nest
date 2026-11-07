import { CircleCheck, FileCode } from 'lucide-react';
import type { DemoParadigmaDto } from '@cafe-lenca/shared';
import CodeBlock from './CodeBlock';

export default function DemoView({ demo }: { demo: DemoParadigmaDto }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-display text-lg font-bold">Lo que cumple</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {demo.cumple.map((c) => (
              <li key={c} className="flex gap-2">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {c}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-display text-lg font-bold">Dónde se usa en el proyecto</h3>
          <ul className="mt-3 space-y-2">
            {demo.usadoEn.map((u) => (
              <li key={u} className="flex gap-2 text-sm">
                <FileCode className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <code className="break-all font-mono text-xs">{u}</code>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {demo.bloques.map((b, i) => (
        <CodeBlock key={`${b.titulo}-${i}`} bloque={b} />
      ))}
    </div>
  );
}