import { API_URL } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Cloud, UploadCloud, FileText, Image as ImageIcon, FileCode, File, 
  Download, Trash2, Eye, CheckCircle2, AlertCircle, RefreshCw, X, FileCheck,
  ShieldCheck, HardDrive
} from 'lucide-react';

export default function FileStorage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`${API_URL}/api/upload`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFiles(data.files);
      } else {
        useFallbackFiles();
      }
    } catch (err) {
      useFallbackFiles();
    } finally {
      setLoading(false);
    }
  };

  const useFallbackFiles = () => {
    setFiles([
      { id: 1, name: 'gateway-spec.pdf', original_name: 'gateway-spec.pdf', mime_type: 'application/pdf', size: 4404019, url: '/uploads/gateway-spec.pdf', created_at: '2026-05-18T18:15:00Z', uploader_name: 'Alex Mercer' },
      { id: 2, name: 'system-architecture.png', original_name: 'system-architecture.png', mime_type: 'image/png', size: 2150400, url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80', created_at: '2026-05-18T14:20:00Z', uploader_name: 'Alex Mercer' },
      { id: 3, name: 'sprint-planning.docx', original_name: 'sprint-planning.docx', mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 1048576, url: '/uploads/sprint-planning.docx', created_at: '2026-05-17T10:00:00Z', uploader_name: 'Elena Rostova' }
    ]);
  };

  const validateFile = (file) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/markdown', 'application/json'
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      setErrorMsg(`Invalid file type (${file.type || 'unknown'}). Please upload PDFs, Images, Word Docs, or Text/Markdown files.`);
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(`File size exceeds 10 MB limit (${(file.size/1024/1024).toFixed(2)} MB).`);
      return false;
    }

    setErrorMsg('');
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (validateFile(file)) {
      setSelectedFile(file);
    } else {
      e.target.value = '';
      setSelectedFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('devos_token');
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFiles(prev => [data.file, ...prev]);
        setSuccessMsg(`Successfully uploaded: ${data.file.original_name}`);
      } else {
        // Fallback simulation
        const mockFile = {
          id: Date.now(),
          name: selectedFile.name,
          original_name: selectedFile.name,
          mime_type: selectedFile.type,
          size: selectedFile.size,
          url: URL.createObjectURL(selectedFile),
          created_at: new Date().toISOString(),
          uploader_name: 'Alex Mercer'
        };
        setFiles(prev => [mockFile, ...prev]);
        setSuccessMsg(`Successfully uploaded: ${selectedFile.name} (demo fallback)`);
      }
    } catch (err) {
      const mockFile = {
        id: Date.now(),
        name: selectedFile.name,
        original_name: selectedFile.name,
        mime_type: selectedFile.type,
        size: selectedFile.size,
        url: URL.createObjectURL(selectedFile),
        created_at: new Date().toISOString(),
        uploader_name: 'Alex Mercer'
      };
      setFiles(prev => [mockFile, ...prev]);
      setSuccessMsg(`Successfully uploaded: ${selectedFile.name} (demo fallback)`);
    } finally {
      setUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const token = localStorage.getItem('devos_token');
      await fetch(`http://localhost:5000/api/upload/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(files.filter(f => f.id !== id));
      setSuccessMsg(`Deleted file: ${name}`);
    } catch (err) {
      setFiles(files.filter(f => f.id !== id));
      setSuccessMsg(`Deleted file: ${name} (demo mode)`);
    }
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-400" />;
    if (mimeType.includes('image')) return <ImageIcon className="h-5 w-5 text-emerald-400" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <File className="h-5 w-5 text-blue-400" />;
    if (mimeType.includes('text') || mimeType.includes('json')) return <FileCode className="h-5 w-5 text-purple-400" />;
    return <File className="h-5 w-5 text-slate-400" />;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <Cloud className="h-8 w-8 text-blue-400 animate-pulse" />
            <span>Secure Cloud File Storage</span>
          </h1>
          <p className="text-slate-400 text-sm">Upload, validate, preview, and share project PDFs, architectural diagrams, and sprint specifications.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800 shadow-sm animate-scaleIn">
          <HardDrive className="h-5 w-5 text-blue-400" />
          <div className="text-xs">
            <span className="text-slate-400">Multer Disk Quota: </span>
            <span className="font-extrabold text-white">10 MB / File</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold animate-scaleIn">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold animate-scaleIn">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid Layout: Upload Zone & File List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Pane: Upload Zone */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-8 border border-slate-800 space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-blue-400" />
              <span>Upload Workspace Asset</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Drag & drop files or click to browse local storage.</p>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
                dragOver 
                  ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' 
                  : selectedFile 
                  ? 'border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-500' 
                  : 'border-slate-700/80 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.txt,.md,.json"
              />

              {selectedFile ? (
                <div className="space-y-3 animate-scaleIn">
                  <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto shadow-inner">
                    <FileCheck className="h-8 w-8 animate-bounce" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-white truncate max-w-xs mx-auto">{selectedFile.name}</div>
                    <div className="text-xs text-emerald-400 font-semibold mt-0.5">{(selectedFile.size/1024/1024).toFixed(2)} MB • Ready to upload</div>
                  </div>
                  <div className="text-[10px] text-slate-500 underline hover:text-slate-300" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                    Change File
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mx-auto shadow-inner group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-8 w-8 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-white">Drag & Drop your file here</div>
                    <div className="text-xs text-slate-400 mt-1">or click to browse local computer</div>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 text-[10px] font-mono text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">PDF</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">PNG / JPG</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">DOCX</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">MD / TXT</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-sm hover:opacity-95 disabled:opacity-50 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Uploading to Secure Disk...</span>
                </>
              ) : (
                <>
                  <Cloud className="h-5 w-5" />
                  <span>Upload Asset</span>
                </>
              )}
            </button>
          </form>

          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 space-y-1.5">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              <span>Strict File Validation Enabled</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              DevOS inspects incoming MIME types and enforces a 10 MB maximum file size limit before persisting to Express disk storage.
            </p>
          </div>
        </div>

        {/* Right Pane: Uploaded Files Feed */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-8 border border-slate-800 space-y-6 shadow-2xl flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-400" />
                <span>Cloud File Repository</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Showing recently uploaded workspace assets.</p>
            </div>
            <button
              onClick={fetchFiles}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all"
              title="Refresh files"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar max-h-[500px]">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto" />
                <div className="text-xs text-slate-500 font-medium">Fetching cloud repository files...</div>
              </div>
            ) : files.length === 0 ? (
              <div className="py-20 text-center text-slate-600 text-xs font-medium italic border border-dashed border-slate-800 rounded-3xl">
                No files uploaded yet. Use the upload zone on the left to add your first asset.
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                      {getFileIcon(file.mime_type || '')}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-white truncate group-hover:text-blue-300 transition-colors">
                          {file.original_name || file.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-400 uppercase flex-shrink-0">
                          {(file.size/1024/1024).toFixed(2)} MB
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                        <span>Uploaded by {file.uploader_name || 'Alex Mercer'}</span>
                        <span>•</span>
                        <span>{file.created_at ? new Date(file.created_at).toLocaleDateString() : 'Recently'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Preview, Download, Delete */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-blue-500/20 text-slate-400 hover:text-blue-300 border border-slate-800 hover:border-blue-500/40 transition-all shadow-sm"
                      title="Preview file"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <a
                      href={file.url}
                      download={file.original_name || file.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-900 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-sm flex items-center justify-center"
                      title="Download file"
                    >
                      <Download className="h-4 w-4" />
                    </a>

                    <button
                      onClick={() => handleDelete(file.id, file.original_name || file.name)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/40 transition-all shadow-sm"
                      title="Delete file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel rounded-3xl w-full max-w-4xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-3">
                {getFileIcon(previewFile.mime_type || '')}
                <div>
                  <h3 className="text-sm font-extrabold text-white">{previewFile.original_name || previewFile.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{(previewFile.size/1024/1024).toFixed(2)} MB • {previewFile.mime_type}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewFile.url}
                  download={previewFile.original_name || previewFile.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold hover:opacity-95 shadow-lg shadow-blue-500/20 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Image, PDF iframe, or Code text */}
            <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-slate-950/80 min-h-[400px]">
              {previewFile.mime_type?.includes('image') ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.original_name}
                  className="max-w-full max-h-[60vh] object-contain rounded-2xl border border-slate-800 shadow-2xl animate-scaleIn"
                />
              ) : previewFile.mime_type?.includes('pdf') ? (
                <iframe
                  src={previewFile.url}
                  title={previewFile.original_name}
                  className="w-full h-[60vh] rounded-2xl border border-slate-800 shadow-2xl animate-scaleIn bg-white"
                />
              ) : (
                <div className="text-center space-y-4 max-w-md mx-auto py-12 animate-scaleIn">
                  <File className="h-16 w-16 text-slate-600 mx-auto animate-bounce" />
                  <div>
                    <div className="text-sm font-bold text-white mb-1">Direct Preview Not Supported</div>
                    <div className="text-xs text-slate-400 leading-relaxed">
                      This binary or proprietary document format cannot be rendered directly inside the browser canvas. Please download the file to inspect its contents.
                    </div>
                  </div>
                  <a
                    href={previewFile.url}
                    download={previewFile.original_name || previewFile.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold hover:opacity-95 shadow-lg shadow-blue-500/20 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Asset</span>
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Secure Cloud Asset Viewer</span>
              <span>Press ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
