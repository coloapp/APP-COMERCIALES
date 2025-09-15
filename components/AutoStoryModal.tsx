import React, { useState } from 'react';
import { SparklesIcon } from '../constants';
import { useLocalization } from '../hooks/useLocalization';

interface AutoStoryModalProps {
  onClose: () => void;
  onGenerate: (topic: string, duration: number) => void;
}

const AutoStoryModal: React.FC<AutoStoryModalProps> = ({ onClose, onGenerate }) => {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(15);
  const { t } = useLocalization();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || duration < 3) {
        alert(t('alertAutoStoryValidation'));
        return;
    }
    onGenerate(topic, duration);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('autoStoryTitle')}</h2>
        <p className="text-gray-600 mb-6">
          {t('autoStoryDesc')}
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">{t('autoStoryTopicLabel')}</label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t('autoStoryTopicPlaceholder')}
              className="w-full bg-gray-50 text-gray-900 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">{t('autoStoryDurationLabel')}</label>
             <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              min="3"
              className="w-full bg-gray-50 text-gray-900 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-2">{t('autoStoryDurationHelp')}</p>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition-colors"
            >
              {t('characterModalCancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-500 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              disabled={!topic.trim() || duration < 3}
            >
                <SparklesIcon />
              {t('autoStorySubmit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutoStoryModal;