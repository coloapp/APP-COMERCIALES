import React from 'react';
import type { Scene } from '../types';
import SceneItem from './SceneItem';
import { useLocalization } from '../hooks/useLocalization';

interface ScenePanelProps {
  scenes: Scene[];
  selectedSceneId: string | null;
  onSelectScene: (id: string) => void;
  storyboardGenerationStatus: string | null;
}

const ScenePanel: React.FC<ScenePanelProps> = ({ scenes, selectedSceneId, onSelectScene, storyboardGenerationStatus }) => {
  const { t } = useLocalization();
  return (
    <div className="w-96 shrink-0 bg-white/80 backdrop-blur-lg p-4 rounded-lg shadow-md border border-gray-200 flex flex-col">
       {storyboardGenerationStatus && (
            <div className="p-3 mb-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3 shrink-0">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-sm text-blue-700">{storyboardGenerationStatus}</p>
            </div>
        )}
      <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2 shrink-0">{t('storyboard')}</h2>
      {scenes.length === 0 && !storyboardGenerationStatus ? (
        <div className="flex-grow flex items-center justify-center text-center text-gray-500" dangerouslySetInnerHTML={{ __html: t('storyboardLoading') }}>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-2 flex-grow min-h-0">
          {scenes.map((scene, index) => (
            <SceneItem
              key={scene.id}
              scene={scene}
              index={index}
              isSelected={scene.id === selectedSceneId}
              onSelect={onSelectScene}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ScenePanel;