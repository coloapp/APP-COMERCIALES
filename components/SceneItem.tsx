import React from 'react';
import type { Scene } from '../types';

interface SceneItemProps {
  scene: Scene;
  isSelected: boolean;
  onSelect: (id: string) => void;
  index: number;
}

const SkeletonLoader = () => (
    <div className="w-12 h-7 rounded bg-gray-300 animate-pulse"></div>
);

const SceneItem: React.FC<SceneItemProps> = ({ scene, isSelected, onSelect, index }) => {
  const selectedClasses = 'bg-blue-100 ring-2 ring-blue-500';
  const baseClasses = 'bg-gray-50 hover:bg-gray-100 border border-gray-200';

  return (
    <div
      onClick={() => onSelect(scene.id)}
      className={`p-3 rounded-lg shadow-sm cursor-pointer transition-all duration-200 ${isSelected ? selectedClasses : baseClasses}`}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-blue-600">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{scene.description}</p>
          <p className="text-xs text-gray-500">{scene.duration} seconds</p>
        </div>
        <div className="flex-shrink-0 flex space-x-2">
            {scene.isLoading ? (
                <>
                    <SkeletonLoader />
                    <SkeletonLoader />
                </>
            ) : (
                <>
                    <img src={scene.startFrame} alt="Start" className="w-12 h-7 rounded object-cover bg-gray-300" />
                    <img src={scene.endFrame} alt="End" className="w-12 h-7 rounded object-cover bg-gray-300" />
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default SceneItem;