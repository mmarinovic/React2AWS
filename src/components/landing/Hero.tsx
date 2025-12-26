'use client';

import { ArrowDown, Github } from 'lucide-react';

interface HeroProps {
  onTryIt: () => void;
}

export function Hero({ onTryIt }: HeroProps) {
  return (
    <section className="bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            AWS infrastructure as{' '}
            <span className="inline-flex items-baseline">
              <span className="text-orange-400">&lt;</span>
              <span>React</span>
              <span className="text-orange-400">/&gt;</span>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Write JSX with Tailwind CSS-inspired className config. Generate Terraform.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={onTryIt}
              className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
            >
              Start Building
              <ArrowDown className="h-4 w-4" />
            </button>
            <a
              href="https://github.com/mmarinovic/React2AWS"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>

          {/* Code Preview */}
          <div className="mx-auto mt-16 max-w-xl">
            <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
              <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-slate-500">infrastructure.jsx</span>
              </div>
              <div className="p-4 text-left font-mono text-sm leading-relaxed">
                <div className="text-slate-500">{'<'}<span className="text-orange-400">VPC</span> <span className="text-purple-400">className</span>=<span className="text-emerald-400">"cidr-10.0.0.0/16"</span>{'>'}</div>
                <div className="ml-4 text-slate-500">{'<'}<span className="text-orange-400">RDS</span> <span className="text-purple-400">className</span>=<span className="text-emerald-400">"engine-postgres multi-az"</span> {'/>'}</div>
                <div className="ml-4 text-slate-500">{'<'}<span className="text-orange-400">Lambda</span> <span className="text-purple-400">className</span>=<span className="text-emerald-400">"runtime-nodejs20"</span> {'/>'}</div>
                <div className="text-slate-500">{'</'}<span className="text-orange-400">VPC</span>{'>'}</div>
              </div>
            </div>

            {/* Generated files */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['main.tf', 'variables.tf', 'outputs.tf', 'backend.tf'].map((file) => (
                <div key={file} className="flex items-center gap-2 rounded border border-slate-700 bg-slate-800 px-3 py-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  <span className="font-mono text-xs text-slate-400">{file}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
