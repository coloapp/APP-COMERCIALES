import React from 'react';
import type { Model } from '../types';
import { PlusIcon, UserGroupIcon, EditIcon } from '../constants';
import { useLocalization } from '../hooks/useLocalization';

interface ModelPanelProps {
  models: Model[];
  onAddModel: () => void;
  onEditModel: (id: string) => void;
}

const ModelPanel: React.FC<ModelPanelProps> = ({ models, onAddModel, onEditModel }) => {
    const { t } = useLocalization();

  return (
    <div className="bg-white/80 backdrop-blur-lg p-4 rounded-lg shadow-md border border-gray-200 flex flex-col h-1/2">
      <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2 shrink-0"><UserGroupIcon /> {t('models')}</h2>
      <div className="space-y-3 overflow-y-auto pr-2 flex-grow min-h-0">
        {models.length === 0 ? (
             <div className="flex-grow flex items-center justify-center text-center text-gray-500 h-full">
                <p className="text-sm">{t('addModelPrompt')}</p>
            </div>
        ) : models.map(model => (
            <div 
                key={model.id}
                className={`group flex items-center gap-3 p-2 rounded-lg transition-all relative bg-gray-100 hover:bg-gray-200`}
            >
                <img src={model.modelSheet || model.referenceImages[0]} alt={model.name} className="w-10 h-10 rounded-full object-cover"/>
                <span className="font-semibold text-gray-800 truncate flex-1">{model.name}</span>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onEditModel(model.id); }} 
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-full text-gray-600 hover:text-gray-900 shadow"
                    aria-label={t('editModelLabel', { modelName: model.name })}
                 >
                    <EditIcon />
                </button>
            </div>
        ))}
      </div>
      <button 
        onClick={onAddModel}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center space-x-2 shrink-0"
      >
        <PlusIcon />
        <span>{t('addModel')}</span>
      </button>
    </div>
  );
};

export default ModelPanel;
