'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { Editor } from '@/components/playground/Editor';
import { Preview } from '@/components/playground/Preview';
import { TerraformOutput } from '@/components/playground/TerraformOutput';
import { ExampleSelector } from '@/components/playground/ExampleSelector';
import { Hero } from '@/components/landing/Hero';
import { parseJSX } from '@/lib/parser/jsx-parser';
import { generateTerraformFiles } from '@/lib/generators/terraform';
import { defaultTemplate, ExampleTemplate } from '@/lib/examples/templates';
import { Github, Code, Eye, FileCode } from 'lucide-react';

type MobileTab = 'editor' | 'preview' | 'terraform';
type RightPanelTab = 'preview' | 'terraform';

export default function Home() {
  const [code, setCode] = useState(defaultTemplate.code);
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplate.id);
  const [mobileTab, setMobileTab] = useState<MobileTab>('editor');
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('preview');
  const playgroundRef = useRef<HTMLElement>(null);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const handleTemplateSelect = useCallback((template: ExampleTemplate) => {
    setCode(template.code);
    setSelectedTemplateId(template.id);
  }, []);

  const scrollToPlayground = useCallback(() => {
    playgroundRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const parseResult = useMemo(() => parseJSX(code), [code]);
  const terraformFiles = useMemo(() => generateTerraformFiles(parseResult), [parseResult]);
  const resourceCount = countResources(parseResult.resources);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero onTryIt={scrollToPlayground} />

      {/* Playground Section */}
      <section ref={playgroundRef} id="playground" className="border-y border-border bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Interactive Playground</h2>
              <p className="mt-1 text-muted">Edit the JSX and see Terraform generated in real-time</p>
            </div>
            <div className="flex items-center gap-3">
              <ExampleSelector
                selectedId={selectedTemplateId}
                onSelect={handleTemplateSelect}
              />
              <a
                href="https://github.com/mmarinovic/React2AWS"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </div>

          {/* Mobile Tab Bar */}
          <div className="mb-4 flex lg:hidden rounded-lg border border-border bg-surface p-1">
            <button
              onClick={() => setMobileTab('editor')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
                mobileTab === 'editor'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted'
              }`}
            >
              <Code className="h-4 w-4" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
                mobileTab === 'preview'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
              <span className="rounded-full bg-accent/10 px-1.5 text-xs text-accent">{resourceCount}</span>
            </button>
            <button
              onClick={() => setMobileTab('terraform')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
                mobileTab === 'terraform'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted'
              }`}
            >
              <FileCode className="h-4 w-4" />
              <span>Terraform</span>
            </button>
          </div>

          {/* Mobile Content */}
          <div className="lg:hidden">
            <div className="h-[500px] overflow-hidden rounded-lg border border-border bg-white">
              {mobileTab === 'editor' && (
                <Editor value={code} onChange={handleCodeChange} />
              )}
              {mobileTab === 'preview' && (
                <div className="h-full p-4">
                  <Preview resources={parseResult.resources} />
                </div>
              )}
              {mobileTab === 'terraform' && (
                <div className="h-full">
                  <TerraformOutput files={terraformFiles} />
                </div>
              )}
            </div>
          </div>

          {/* Desktop Content */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
            {/* Left Panel - Editor */}
            <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted" />
                  <span className="text-sm font-medium text-foreground">Component Editor</span>
                </div>
                <span className="text-xs text-muted">JSX + React2AWS</span>
              </div>
              <div className="h-[600px]">
                <Editor value={code} onChange={handleCodeChange} />
              </div>
            </div>

            {/* Right Panel - Preview/Terraform with Tabs */}
            <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              {/* Tab Header */}
              <div className="flex items-center border-b border-border bg-surface">
                <button
                  onClick={() => setRightPanelTab('preview')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    rightPanelTab === 'preview'
                      ? 'border-b-2 border-accent text-accent bg-white'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                  <span className="rounded-full bg-accent/10 px-1.5 text-xs text-accent">{resourceCount}</span>
                </button>
                <button
                  onClick={() => setRightPanelTab('terraform')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    rightPanelTab === 'terraform'
                      ? 'border-b-2 border-accent text-accent bg-white'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <FileCode className="h-4 w-4" />
                  <span>Terraform</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="h-[600px] overflow-hidden">
                {rightPanelTab === 'preview' ? (
                  <div className="h-full p-4">
                    <Preview resources={parseResult.resources} />
                  </div>
                ) : (
                  <TerraformOutput files={terraformFiles} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-900">
                <span className="text-xs font-semibold text-white">R2</span>
              </div>
              <span className="font-medium text-foreground">React2AWS</span>
            </div>
            <p className="text-center text-sm text-muted">
              Made for fun.
            </p>
            <a
              href="https://github.com/mmarinovic/React2AWS"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              <span>View Source</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function countResources(resources: ReturnType<typeof parseJSX>['resources']): number {
  let count = 0;
  for (const resource of resources) {
    if (resource.type !== 'Infrastructure') {
      count++;
    }
    if (resource.children) {
      count += countResources(resource.children);
    }
  }
  return count;
}
