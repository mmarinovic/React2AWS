'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Editor } from '@/components/playground/Editor';
import { Preview } from '@/components/playground/Preview';
import { TerraformOutput } from '@/components/playground/TerraformOutput';
import { ActivityBar, PanelType } from '@/components/studio/ActivityBar';
import { SidePanel } from '@/components/studio/SidePanel';
import { StatusBar } from '@/components/studio/StatusBar';
import { parseJSX } from '@/lib/parser/jsx-parser';
import { generateTerraformFiles } from '@/lib/generators/terraform';
import { defaultTemplate, ExampleTemplate } from '@/lib/examples/templates';
import { Eye, FileCode, AlertCircle, Home } from 'lucide-react';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import JSZip from 'jszip';
import Link from 'next/link';

type RightPanelTab = 'preview' | 'terraform';

export default function StudioPage() {
  const [code, setCode] = useState(defaultTemplate.code);
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplate.id);
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('preview');
  const [activePanel, setActivePanel] = useState<PanelType>('docs');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  // Load code from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sharedCode = params.get('code');
      if (sharedCode) {
        try {
          const decoded = decompressFromEncodedURIComponent(sharedCode);
          if (decoded) {
            setCode(decoded);
            setSelectedTemplateId('');
          }
        } catch {
          // Invalid code parameter, use default
        }
      }
    }
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    setSelectedTemplateId('');
  }, []);

  const handleTemplateSelect = useCallback((template: ExampleTemplate) => {
    setCode(template.code);
    setSelectedTemplateId(template.id);
  }, []);

  const handleShare = useCallback(async () => {
    const compressed = compressToEncodedURIComponent(code);
    const url = `${window.location.origin}/studio?code=${compressed}`;
    await navigator.clipboard.writeText(url);
    setShareStatus('copied');
    setTimeout(() => setShareStatus('idle'), 2000);
  }, [code]);

  const handleDownload = useCallback(async () => {
    if (!terraformFiles) return;
    const zip = new JSZip();
    zip.file('main.tf', terraformFiles.mainTf);
    zip.file('variables.tf', terraformFiles.variablesTf);
    zip.file('outputs.tf', terraformFiles.outputsTf);
    zip.file('backend.tf', terraformFiles.backendTf);
    zip.file('terraform.tfvars.example', terraformFiles.tfvarsExample);
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'terraform.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const parseResult = useMemo(() => parseJSX(code), [code]);
  const terraformFiles = useMemo(() => generateTerraformFiles(parseResult), [parseResult]);
  const resourceCount = countResources(parseResult.resources);

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded px-2 py-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
            title="Back to home"
          >
            <Home className="h-4 w-4" />
          </Link>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-orange-500">
              <span className="text-xs font-bold text-white">R2</span>
            </div>
            <span className="text-sm font-medium text-slate-200">Infrastructure Studio</span>
          </div>
        </div>
        <div className="text-xs text-slate-500">React2AWS</div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar activePanel={activePanel} onPanelChange={setActivePanel} />

        {/* Side Panel */}
        <SidePanel
          activePanel={activePanel}
          onClose={() => setActivePanel(null)}
          onSelectExample={handleTemplateSelect}
          selectedExampleId={selectedTemplateId}
        />

        {/* Editor + Output Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor Panel */}
          <div className="flex flex-1 flex-col border-r border-slate-700">
            {/* Editor Tab */}
            <div className="flex items-center border-b border-slate-700 bg-slate-800">
              <div className="flex items-center gap-2 border-r border-slate-700 bg-slate-900 px-4 py-2">
                <span className="text-sm text-slate-300">infrastructure.jsx</span>
              </div>
            </div>

            {/* Error Banner */}
            {parseResult.errors.length > 0 && (
              <div className="flex items-center gap-2 border-b border-red-900/50 bg-red-950/50 px-3 py-1.5">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-xs text-red-300">
                  {parseResult.errors.length} parsing error{parseResult.errors.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              <Editor value={code} onChange={handleCodeChange} />
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex w-1/2 flex-col">
            {/* Output Tabs */}
            <div className="flex items-center border-b border-slate-700 bg-slate-800">
              <button
                onClick={() => setRightPanelTab('preview')}
                className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  rightPanelTab === 'preview'
                    ? 'border-b-2 border-orange-500 bg-slate-900 text-slate-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
                <span className="rounded bg-slate-700 px-1.5 text-xs">{resourceCount}</span>
              </button>
              <button
                onClick={() => setRightPanelTab('terraform')}
                className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  rightPanelTab === 'terraform'
                    ? 'border-b-2 border-orange-500 bg-slate-900 text-slate-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="h-4 w-4" />
                <span>Terraform</span>
              </button>
            </div>

            {/* Output Content */}
            <div className="flex-1 overflow-hidden bg-slate-900">
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

      {/* Status Bar */}
      <StatusBar
        resourceCount={resourceCount}
        errorCount={parseResult.errors.length}
        shareStatus={shareStatus}
        onShare={handleShare}
        onDownload={handleDownload}
      />
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
