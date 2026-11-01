/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Smartphone, Terminal } from 'lucide-react';
import { SWIFT_SOURCE_FILES, SwiftFile } from '../data/swiftUiSource';
import { feedback } from '../utils/haptics';

interface SwiftExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwiftExportModal: React.FC<SwiftExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<SwiftFile>(SWIFT_SOURCE_FILES[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    feedback.lightTap();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(selectedFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadAll = () => {
    feedback.lightTap();
    // Create combined Swift project bundle file
    const combined = SWIFT_SOURCE_FILES.map(
      (f) => `// ==========================================\n// FILE: ${f.filename}\n// ${f.description}\n// ==========================================\n\n${f.code}\n\n`
    ).join('\n');

    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TawafCounter-SwiftUI-Source.swift';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="swift-export-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in"
    >
      <div className="w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col h-[85vh] overflow-hidden text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h2 id="swift-export-title" className="text-base font-bold text-white flex items-center gap-2">
                <span>Native iOS SwiftUI Project</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Swift 5.9+ / iOS 17+
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Ready-to-run Xcode project files matching the Tawaf app specification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadAll}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Project</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              aria-label="Close export dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar Files + Code Viewer */}
        <div className="flex flex-1 overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-56 sm:w-64 border-r border-stone-800 bg-stone-950/40 p-3 overflow-y-auto no-scrollbar shrink-0">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider px-2 py-1">
              Swift Project Files ({SWIFT_SOURCE_FILES.length})
            </div>
            <div className="space-y-1 mt-1">
              {SWIFT_SOURCE_FILES.map((file) => {
                const isSelected = selectedFile.filename === file.filename;
                return (
                  <button
                    key={file.filename}
                    type="button"
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                    }`}
                  >
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-stone-500'}`} />
                    <span className="truncate">{file.filename}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Xcode Setup Guide */}
            <div className="mt-6 p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-[11px] text-stone-400 space-y-1.5">
              <span className="font-semibold text-stone-200 block">How to run in Xcode:</span>
              <p>1. Open Xcode → Create new SwiftUI iOS App.</p>
              <p>2. Paste each file into the corresponding group.</p>
              <p>3. Build & Run on iPhone Simulator or physical iPhone.</p>
            </div>
          </div>

          {/* Main Code Viewer */}
          <div className="flex-1 flex flex-col bg-stone-900 overflow-hidden">
            {/* Active File Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-800 bg-stone-900/80">
              <div>
                <span className="text-xs font-semibold text-amber-400 font-mono">
                  {selectedFile.filename}
                </span>
                <span className="text-[11px] text-stone-500 ml-2 hidden sm:inline">
                  — {selectedFile.description}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Content */}
            <pre className="flex-1 p-4 font-mono text-xs text-stone-300 overflow-auto whitespace-pre leading-relaxed select-text">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
