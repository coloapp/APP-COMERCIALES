import React, { useState, useRef, useEffect } from 'react';
import type { Model } from '../types';
import * as geminiService from '../services/geminiService';
import Loader from './Loader';
import { useLocalization } from '../hooks/useLocalization';

interface ModelModalProps {
  onClose: () => void;
  onSave: (model: Model | Omit<Model, 'id'>) => void;
  modelToEdit?: Model | null;
}

const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const dataURLToParts = (dataURL: string): {data: string, mimeType: string} => {
    const parts = dataURL.split(',');
    const mimeType = parts[0].match(/:(.*?);/)![1];
    return { data: dataURL, mimeType };
};

const ModelModal: React.FC<ModelModalProps> = ({ onClose, onSave, modelToEdit }) => {
  const { t } = useLocalization();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [modelSheet, setModelSheet] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (modelToEdit) {
      setName(modelToEdit.name);
      setDescription(modelToEdit.description);
      setReferenceImages(modelToEdit.referenceImages);
      setModelSheet(modelToEdit.modelSheet ?? null);
    }
  }, [modelToEdit]);


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    
    if (referenceImages.length + files.length > 4) {
        alert(t('alertMaxImages'));
        return;
    }

    const dataUrls = await Promise.all(files.map(fileToDataURL));
    setReferenceImages(prev => [...prev, ...dataUrls]);
  };
  
  const handleGenerateSheet = async (style: 'monochrome' | 'color') => {
    if (referenceImages.length === 0 && !description.trim()) {
        alert(t('alertMissingImageOrDescModel'));
        return;
    }
    setIsGenerating(true);
    setError(null);
    try {
        const imageParts = referenceImages.map(dataURLToParts);
        const generatedSheetData = await geminiService.generateModelSheet(imageParts, name, description, style);
        setModelSheet(`data:image/jpeg;base64,${generatedSheetData}`);
    } catch (e) {
        console.error("Failed to generate model sheet:", e);
        setError(t('modelModalError'));
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleSave = () => {
    if (!name.trim()) {
        alert(t('alertMissingNameModel'));
        return;
    }
    if (!modelSheet && referenceImages.length === 0) {
      alert(t('alertMissingSheetOrImage'));
      return;
    }
    
    const modelData = { name, description, referenceImages, modelSheet: modelSheet ?? undefined };

    if (modelToEdit) {
      onSave({ ...modelData, id: modelToEdit.id });
    } else {
      onSave(modelData);
    }
  };

  const isEditing = !!modelToEdit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col border border-gray-200" onClick={e => e.stopPropagation()}>
        <header className="p-6 border-b border-gray-200 shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">{isEditing ? t('modelModalEditTitle') : t('modelModalCreateTitle')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('modelModalSubTitle')}</p>
        </header>

        <main className="flex-grow flex p-6 gap-6 overflow-y-auto bg-gray-50">
          {/* Left Panel */}
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('modelModalNameLabel')}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('modelModalNamePlaceholder')} className="w-full bg-white text-gray-800 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('modelModalDescLabel')}</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder={t('modelModalDescPlaceholder')} className="w-full bg-white text-gray-800 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('modelModalUploadLabel', { count: referenceImages.length })}</label>
                <div className="grid grid-cols-4 gap-4">
                    {referenceImages.map((src, index) => (
                        <div key={index} className="relative aspect-square">
                            <img src={src} alt={`Reference ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                             <button onClick={() => setReferenceImages(imgs => imgs.filter((_, i) => i !== index))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">X</button>
                        </div>
                    ))}
                    {referenceImages.length < 4 && (
                         <button onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V8m0 4h.01" /></svg>
                            <span className="text-sm mt-2">{t('modelModalAddImage')}</span>
                         </button>
                    )}
                </div>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('modelModalGenerateSheet')}</label>
                <div className="flex gap-4">
                    <button onClick={() => handleGenerateSheet('monochrome')} disabled={isGenerating} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed">{t('modelModalMonochrome')}</button>
                    <button onClick={() => handleGenerateSheet('color')} disabled={isGenerating} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-cyan-300 disabled:cursor-not-allowed">{t('modelModalColor')}</button>
                </div>
            </div>
             <button onClick={() => {setModelSheet(null); setReferenceImages([])}} className="text-sm text-gray-500 hover:text-red-500 text-center">{t('modelModalReset')}</button>
          </div>

          {/* Right Panel */}
          <div className="w-1/2 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden border border-gray-300">
            {isGenerating && <Loader message={t('modelModalSheetLoading')}/>}
            {error && !isGenerating && <p className="text-red-500">{error}</p>}
            {!modelSheet && !isGenerating && !error && <p className="text-gray-500">{t('modelModalSheetPlaceholder')}</p>}
            {modelSheet && !isGenerating && <img src={modelSheet} alt="Generated Model Sheet" className="w-full h-full object-contain"/>}
          </div>
        </main>
        
        <footer className="flex justify-end gap-4 p-6 border-t border-gray-200 shrink-0 bg-white rounded-b-xl">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition-colors">{t('modelModalCancel')}</button>
          <button onClick={handleSave} className="px-6 py-2 bg-cyan-600 text-white rounded-md font-semibold hover:bg-cyan-500 transition-colors">{t('modelModalSave')}</button>
        </footer>
      </div>
    </div>
  );
};

export default ModelModal;