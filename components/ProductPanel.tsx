import React from 'react';
import type { Product } from '../types';
import { PlusIcon, BoxIcon } from '../constants';
import { useLocalization } from '../hooks/useLocalization';

interface ProductPanelProps {
  products: Product[];
  onAddProduct: () => void;
}

const ProductPanel: React.FC<ProductPanelProps> = ({ products, onAddProduct }) => {
    const { t } = useLocalization();

  return (
    <div className="bg-white/80 backdrop-blur-lg p-4 rounded-lg shadow-md border border-gray-200 flex flex-col h-1/2">
      <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2 shrink-0"><BoxIcon /> {t('products')}</h2>
      <div className="space-y-3 overflow-y-auto pr-2 flex-grow min-h-0">
        {products.length === 0 ? (
             <div className="flex-grow flex items-center justify-center text-center text-gray-500 h-full">
                <p className="text-sm">{t('addProductPrompt')}</p>
            </div>
        ) : products.map(prod => (
            <div 
                key={prod.id}
                className={`group flex items-center gap-3 p-2 rounded-lg transition-all relative bg-gray-100 hover:bg-gray-200`}
            >
                <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg object-contain bg-white p-1"/>
                <span className="font-semibold text-gray-800 truncate flex-1">{prod.name}</span>
            </div>
        ))}
      </div>
      <button 
        onClick={onAddProduct}
        className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center space-x-2 shrink-0"
      >
        <PlusIcon />
        <span>{t('addProduct')}</span>
      </button>
    </div>
  );
};

export default ProductPanel;
