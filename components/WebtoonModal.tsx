import React, { useState, useCallback } from 'react';
import { BookOpenIcon } from '../constants';
import { useLocalization } from '../hooks/useLocalization';

interface WebtoonModalProps {
  onClose: () => void;
  onGenerate: (imageParts: { data: string, mimeType: string }[]) => void;
}

interface PageState {
    id: string;
    file: File;
    preview: string;
}

const dataURLToParts = (dataURL: string): {data: string, mimeType: string} => {
    const parts = dataURL.split(',');
    const mimeType = parts[0].match(/:(.*?);/)![1];
    const data = parts[1];
    return { data, mimeType };
};


const WebtoonModal: React.FC<WebtoonModalProps> = ({ onClose, onGenerate }) => {
  const { t } = useLocalization();
  const [pages, setPages] = useState<PageState[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const newFileArray = Array.from(newFiles);

    newFileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPage: PageState = {
            id: `${file.name}-${Date.now()}`,
            file,
            preview: reader.result as string,
        };
        setPages(prev => [...prev, newPage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
  };
  
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
        setDraggedIndex(null);
        return;
    }

    const reorderedPages = [...pages];
    const [draggedItem] = reorderedPages.splice(draggedIndex, 1);
    reorderedPages.splice(dropIndex, 0, draggedItem);
    
    setPages(reorderedPages);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleContainerDrag = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleContainerDragIn = useCallback((e: React.DragEvent) => { handleContainerDrag(e); setIsDraggingOver(true); }, [handleContainerDrag]);
  const handleContainerDragOut = useCallback((e: React.DragEvent) => { handleContainerDrag(e); setIsDraggingOver(false); }, [handleContainerDrag]);
  const handleContainerDrop = useCallback((e: React.DragEvent) => {
    handleContainerDrag(e);
    setIsDraggingOver(false);
    if (e.dataTransfer.files?.length > 0) {
      handleFileChange(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, [handleContainerDrag]);
  
  const removeFile = (pageId: string) => {
    setPages(prev => prev.filter(p => p.id !== pageId));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pages.length === 0 || isSubmitting) {
        if(pages.length === 0) alert(t('alertWebtoonUpload'));
        return;
    }

    setIsSubmitting(true);
    
    try {
        const imageParts = pages.map(p => dataURLToParts(p.preview));
        onGenerate(imageParts);
    } catch (error) {
        alert(`An error occurred. Please check the console and try again.`);
        setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl border border-gray-200 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('webtoonTitle')}</h2>
        <p className="text-gray-600 mb-6">{t('webtoonDesc')}</p>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div 
                className={`flex-1 flex flex-col justify-center items-center border-2 border-dashed rounded-lg transition-colors p-4 ${isDraggingOver ? 'border-teal-400 bg-gray-100/50' : 'border-gray-300'}`}
                onDragEnter={handleContainerDragIn} onDragLeave={handleContainerDragOut} onDragOver={handleContainerDrag} onDrop={handleContainerDrop}
            >
                {pages.length === 0 ? (
                     <label htmlFor="webtoon-upload" className="text-center text-gray-500 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className="mt-2">{t('webtoonDropzone')}</p>
                        <p className="text-xs text-gray-400">{t('webtoonDropzoneSub')}</p>
                    </label>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full h-full overflow-y-auto">
                        {pages.map((page, index) => (
                            <div 
                                key={page.id} 
                                className={`relative aspect-[9/16] group bg-gray-200 rounded-md overflow-hidden cursor-grab active:cursor-grabbing transition-opacity ${draggedIndex === index ? 'opacity-30' : 'opacity-100'}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                            >
                                <img src={page.preview} alt={`Preview ${page.file.name}`} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeFile(page.id)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 leading-none w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">&#x2715;</button>
                            </div>
                        ))}
                         <label htmlFor="webtoon-upload" className="aspect-[9/16] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </label>
                    </div>
                )}
                <input type="file" id="webtoon-upload" multiple accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files)} />
            </div>
            <div className="flex justify-end gap-4 pt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition-colors">{t('characterModalCancel')}</button>
                <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-md font-semibold hover:bg-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2" disabled={pages.length === 0 || isSubmitting}>
                    <BookOpenIcon />
                    {isSubmitting ? t('webtoonSubmitting') : t('webtoonSubmit')}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default WebtoonModal;