'use client';

import { AlertCircle } from 'lucide-react';
import { Editor } from '@/components/studio/Editor';
import { Preview } from '@/components/studio/Preview';
import { TerraformOutput } from '@/components/studio/TerraformOutput';
import { MobileTab } from '@/app/studio/hooks/useStudioState';
import { AWSResource } from '@/types/aws';
import { TerraformOutput as TerraformOutputType } from '@/types/aws';

interface MobileContentProps {
  activeTab: MobileTab;
  code: string;
  onCodeChange: (code: string) => void;
  resources: AWSResource[];
  terraformFiles: TerraformOutputType | null;
  errorCount: number;
}

export function MobileContent({
  activeTab,
  code,
  onCodeChange,
  resources,
  terraformFiles,
  errorCount,
}: MobileContentProps) {
  return (
    <div className="flex flex-1 flex-col md:hidden overflow-hidden">
      {errorCount > 0 && (
        <div className="flex items-center gap-2 border-b border-red-900/30 bg-red-950/30 px-3 py-1.5">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="text-xs text-red-400">
            {errorCount} parsing error{errorCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-hidden bg-background">
        {activeTab === 'editor' && (
          <Editor value={code} onChange={onCodeChange} />
        )}
        {activeTab === 'preview' && (
          <div className="h-full p-4">
            <Preview resources={resources} />
          </div>
        )}
        {activeTab === 'terraform' && (
          <TerraformOutput files={terraformFiles} />
        )}
      </div>
    </div>
  );
}
