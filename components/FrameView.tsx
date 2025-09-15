import React, { useRef } from 'react';
import Loader from './Loader';
import { useLocalization } from '../hooks/useLocalization';

interface FrameViewProps {
  title: string;
  imageBase64: string | null;
  isLoading: boolean;
  isUpdating?: boolean;
  onMaskImage?: (file: File) => void;
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const MaskIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);


const FrameView: React.FC<FrameViewProps> = ({ title, imageBase64, isLoading, isUpdating, onMaskImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLocalization();

  const handleDownload = () => {
    if (!imageBase64) return;
    const link = document.createElement('a');
    link.href = imageBase64;
    link.download = `${title.replace(/\s/g, '_')}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onMaskImage) {
        onMaskImage(file);
    }
    if(event.target) {
        event.target.value = '';
    }
  };
  
  const loaderMessage = isUpdating ? t('loaderUpdatingFrame') : t('loaderGeneratingFrame', { title });

  return (
    <div className="w-full bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden relative aspect-video group">
      {(isLoading || isUpdating) && <Loader message={loaderMessage} />}
      {imageBase64 ? (
        <img
          src={imageBase64}
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">{title}</p>
        </div>
      )}
      {imageBase64 && !isLoading && !isUpdating && (
         <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
                onClick={handleDownload}
                className="bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75 focus:outline-none"
                aria-label={t('frameViewDownloadLabel', { title })}
            >
                <DownloadIcon />
            </button>
            {onMaskImage && (
                <>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75 focus:outline-none"
                        aria-label={t('frameViewMaskLabel', { title })}
                    >
                        <MaskIcon />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg"
                    />
                </>
            )}
        </div>
      )}
      <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white px-3 py-1 rounded-tr-lg">
        <h3 className="font-bold text-sm">{title}</h3>
      </div>
    </div>
  );
};

export default FrameView;