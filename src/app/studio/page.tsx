'use client';

import { useStudioState } from './hooks/useStudioState';
import { StatusBar } from '@/components/studio/StatusBar';
import {
  TitleBar,
  MobileTabBar,
  MobileSidePanel,
  MobileContent,
  DesktopLayout,
} from '@/components/studio/layout';

export default function StudioPage() {
  const {
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
  } = useStudioState();

  return (
    <div className="h-screen flex flex-col bg-background">
      <TitleBar
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        shareStatus={shareStatus}
        onShare={handleShare}
        onDownload={handleDownload}
      />

      <MobileTabBar
        activeTab={mobileTab}
        onTabChange={setMobileTab}
        resourceCount={resourceCount}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <MobileSidePanel
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          activePanel={mobilePanel}
          onPanelChange={setMobilePanel}
          onSelectExample={handleTemplateSelect}
          selectedExampleId={selectedTemplateId}
        />

        <MobileContent
          activeTab={mobileTab}
          code={code}
          onCodeChange={handleCodeChange}
          resources={parseResult.resources}
          terraformFiles={terraformFiles}
          errorCount={parseResult.errors.length}
        />

        <DesktopLayout
          code={code}
          onCodeChange={handleCodeChange}
          resources={parseResult.resources}
          terraformFiles={terraformFiles}
          errorCount={parseResult.errors.length}
          resourceCount={resourceCount}
          activePanel={activePanel}
          onPanelChange={setActivePanel}
          rightPanelTab={rightPanelTab}
          onRightPanelTabChange={setRightPanelTab}
          onSelectExample={handleTemplateSelect}
          selectedExampleId={selectedTemplateId}
        />
      </div>

      <StatusBar
        resourceCount={resourceCount}
        errorCount={parseResult.errors.length}
      />
    </div>
  );
}
