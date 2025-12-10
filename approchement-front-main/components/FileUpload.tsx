
import React, { useState, useCallback, useRef } from 'react';

interface FileUploadProps {
  id: string;
  title: string;
  description: string;
  onFileSelect: (file: File) => void;
  icon: React.ReactNode;
}

const FileUpload: React.FC<FileUploadProps> = ({ id, title, description, onFileSelect, icon }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validExtensions = ['.csv', '.pdf', '.xlsx', '.xls', '.png', '.jpg', '.jpeg'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (validExtensions.includes(fileExt)) {
        setFileName(file.name);
        onFileSelect(file);
      } else {
        alert("Format non supporté. Formats: CSV, PDF, Excel, Images");
        setFileName(null);
        event.target.value = '';
      }
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const validExtensions = ['.csv', '.pdf', '.xlsx', '.xls', '.png', '.jpg', '.jpeg'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (validExtensions.includes(fileExt)) {
        setFileName(file.name);
        onFileSelect(file);
        if (fileInputRef.current) {
          fileInputRef.current.files = event.dataTransfer.files;
        }
      } else {
        alert("Format non supporté. Formats: CSV, PDF, Excel, Images");
        setFileName(null);
      }
    }
  }, [onFileSelect]);

  return (
    <div className="w-full bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 hover:bg-white/15 transition-all">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-white/70 mt-1">{description}</p>
      <label
        htmlFor={id}
        className="mt-4 flex justify-center w-full h-32 px-6 pt-5 pb-6 border-2 border-white/30 border-dashed rounded-md cursor-pointer hover:border-white/60 hover:bg-white/5 transition-all"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          {icon}
          <div className="flex text-sm text-white/90">
            <span className="relative rounded-md font-medium text-white hover:text-white/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-white/60">
              <span>Téléchargez un fichier</span>
              <input id={id} name={id} type="file" className="sr-only" onChange={handleFileChange} accept=".csv,.pdf,.xlsx,.xls,.png,.jpg,.jpeg" ref={fileInputRef} />
            </span>
            <p className="pl-1">ou glissez-déposez</p>
          </div>
          <p className="text-xs text-white/60">CSV, PDF, Excel, Images (max 50MB)</p>
          {fileName && <p className="text-xs text-green-400 font-medium pt-2">✓ Fichier: {fileName}</p>}
        </div>
      </label>
    </div>
  );
};

export default FileUpload;
