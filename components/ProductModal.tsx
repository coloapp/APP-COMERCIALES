import React, { useState, useRef } from 'react';
import type { Product } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface ProductModalProps {
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => void;
}

const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const ProductModal: React.FC<ProductModalProps> = ({ onClose, onSave }) => {
  const { t } = useLocalization();
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const dataUrl = await fileToDataURL(file);
      setImage(dataUrl);
    }
  };
  
  const handleSave = () => {
    if (!name.trim()) {
        alert(t('alertMissingProductName'));
        return;
    }
    if (!image) {
      alert(t('alertMissingProductImage'));
      return;
    }
    onSave({ name, image });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col border border-gray-200" onClick={e => e.stopPropagation()}>
        <header className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{t('productModalTitle')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('productModalSubTitle')}</p>
        </header>

        <main className="flex-grow p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('productModalNameLabel')}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('productModalNamePlaceholder')} className="w-full bg-white text-gray-800 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('productModalImageLabel')}</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                {image ? (
                    <img src={image} alt="Product Preview" className="max-w-full max-h-full object-contain" />
                ) : (
                    <span>{t('productModalImagePrompt')}</span>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
        </main>
        
        <footer className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition-colors">{t('productModalCancel')}</button>
          <button onClick={handleSave} className="px-6 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-500 transition-colors">{t('productModalSave')}</button>
        </footer>
      </div>
    </div>
  );
};

export default ProductModal;
