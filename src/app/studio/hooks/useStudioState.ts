'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { parseJSX } from '@/lib/parser/jsx-parser';
import { generateTerraformFiles } from '@/lib/generators/terraform';
import { defaultTemplate, ExampleTemplate } from '@/lib/examples/templates';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import JSZip from 'jszip';
import { PanelType } from '@/components/studio/ActivityBar';
import { TerraformOutput as TerraformOutputType, AWSResource } from '@/types/aws';
import { countResources } from '@/lib/utils/resources';

export type RightPanelTab = 'preview' | 'terraform';
export type MobileTab = 'editor' | 'preview' | 'terraform';
export type MobilePanelType = 'docs' | 'reference' | 'examples';

export interface StudioState {
  code: string;
  selectedTemplateId: string;
  rightPanelTab: RightPanelTab;
  activePanel: PanelType;
  shareStatus: 'idle' | 'copied';
  mobileTab: MobileTab;
  mobileMenuOpen: boolean;
  mobilePanel: MobilePanelType;
  parseResult: { resources: AWSResource[]; errors: string[] };
  terraformFiles: TerraformOutputType | null;
  resourceCount: number;
}

export interface StudioActions {
  handleCodeChange: (newCode: string) => void;
  handleTemplateSelect: (template: ExampleTemplate) => void;
  handleShare: () => Promise<void>;
  handleDownload: () => Promise<void>;
  setRightPanelTab: (tab: RightPanelTab) => void;
  setActivePanel: (panel: PanelType) => void;
  setMobileTab: (tab: MobileTab) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setMobilePanel: (panel: MobilePanelType) => void;
}

export function useStudioState(): StudioState & StudioActions {
  const [code, setCode] = useState(defaultTemplate.code);
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplate.id);
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('preview');
  const [activePanel, setActivePanel] = useState<PanelType>('docs');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const [mobileTab, setMobileTab] = useState<MobileTab>('editor');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanelType>('examples');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sharedCode = params.get('code');
      if (sharedCode) {
        try {
          const decoded = decompressFromEncodedURIComponent(sharedCode);
          if (decoded) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCode(decoded);
            setSelectedTemplateId('');
          }
        } catch {
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
    setMobileMenuOpen(false);
  }, []);

  const parseResult = useMemo(() => parseJSX(code), [code]);
  const terraformFiles = useMemo(() => generateTerraformFiles(parseResult), [parseResult]);
  const resourceCount = countResources(parseResult.resources);

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

    for (const [path, content] of Object.entries(terraformFiles.fileTree)) {
      zip.file(path, content);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'terraform.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [terraformFiles]);

  return {
    code,
    selectedTemplateId,
    rightPanelTab,
    activePanel,
    shareStatus,
    mobileTab,
    mobileMenuOpen,
    mobilePanel,
    parseResult,
    terraformFiles,
    resourceCount,
    handleCodeChange,
    handleTemplateSelect,
    handleShare,
    handleDownload,
    setRightPanelTab,
    setActivePanel,
    setMobileTab,
    setMobileMenuOpen,
    setMobilePanel,
  };
}
