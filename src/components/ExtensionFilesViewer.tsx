import React, { useState } from 'react';
import JSZip from 'jszip';
import { generateExtensionFiles, ExtensionFile } from '../utils/extensionCodeGenerator';
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  FolderDown,
  Layers,
  Chrome,
  ArrowRight,
  ExternalLink,
  FileArchive,
} from 'lucide-react';

export const ExtensionFilesViewer: React.FC = () => {
  const files = generateExtensionFiles();
  const [selectedFile, setSelectedFile] = useState<ExtensionFile>(files[0]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadSingleFile = (file: ExtensionFile) => {
    const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();
      files.forEach((file) => {
        zip.file(file.name, file.code);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'social-crm-extension.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create zip', err);
      // Fallback
      files.forEach((file, index) => {
        setTimeout(() => handleDownloadSingleFile(file), index * 200);
      });
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Overview Card */}
      <div className="bg-linear-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-white">
                <Chrome className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Google Chrome Extension Package (Manifest V3)</h2>
            </div>
            <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed">
              This CRM is engineered to run seamlessly as a standalone Google Chrome Extension. You can install it directly into Chrome Developer mode to save profiles directly while browsing LinkedIn, X (Twitter), and Instagram!
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold rounded shadow transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FileArchive className="w-4 h-4" />
              <span>{isZipping ? 'Creating Zip...' : 'Download Extension (.zip)'}</span>
            </button>
            <button
              onClick={() => files.forEach((f, i) => setTimeout(() => handleDownloadSingleFile(f), i * 150))}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FolderDown className="w-4 h-4" />
              <span>Download Individual Files</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step by Step Install Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
            1
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">Download & Load Extension</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Download the extension zip or individual files, unzip into a folder, and click <strong>"Load unpacked"</strong> at <code>chrome://extensions</code>.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
            2
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">Link Account (Anyone Can Use)</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sign in on the web dashboard, copy your <strong>Extension Sync Key</strong> from your avatar menu, and paste it into <strong>⚙️ Sync</strong> in the sidebar.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
            3
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">1-Click Live Profile Capture</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Open any LinkedIn, X, or Instagram profile and press <code>Alt+Shift+S</code> to save the contact directly to your live cloud CRM!
            </p>
          </div>
        </div>
      </div>

      {/* Code Browser & Editor Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[480px]">
        {/* File Tree / Selector sidebar */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-3 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Extension Package Files
          </div>
          {files.map((file) => {
            const isSelected = selectedFile.name === file.name;
            return (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Code2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
                <span className={`text-[10px] uppercase ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {file.type}
                </span>
              </button>
            );
          })}
        </div>

        {/* Code Content Area */}
        <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 font-mono text-xs">
          {/* Code Viewer Header */}
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-slate-200 font-bold">{selectedFile.name}</span>
              <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
                — {selectedFile.description}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-sans flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>

              <button
                onClick={() => handleDownloadSingleFile(selectedFile)}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-sans flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          {/* Preformatted Code Content */}
          <div className="p-4 overflow-auto flex-1 max-h-[500px]">
            <pre className="text-xs text-slate-200 leading-relaxed font-mono">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
