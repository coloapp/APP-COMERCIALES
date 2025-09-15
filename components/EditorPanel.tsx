

import React, { useState, useEffect } from 'react';
import type { Scene, Model, Product } from '../types';
import { SceneAction } from '../types';
import FrameView from './FrameView';
import SuggestionCard from './SuggestionCard';
import { ChainBreakIcon, LinkIcon, PlusIcon, SparklesIcon, UserGroupIcon, BoxIcon, TransitionOutIcon } from '../constants';
import Loader from './Loader';
import CopyButton from './CopyButton';
import { useLocalization } from '../hooks/useLocalization';

interface EditorPanelProps {
  scene: Scene | null;
  allModels: Model[];
  allProducts: Product[];
  onAddScene: (action: SceneAction, prompt: string, previousScene?: Scene) => void;
  onUpdateFrame: (sceneId: string, frameType: 'start' | 'end', productFile: File) => Promise<void>;
  onEditScene: (sceneId: string, newPrompt: string) => Promise<void>;
  onGenerateVideo: (sceneId: string) => Promise<void>;
}

const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const MagicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l.707.707M6.343 17.657l.707.707m12.728 0l-.707-.707M12 21v-1m0-16a9 9 0 100 18 9 9 0 000-18z" /></svg>;
const TransitionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>;
const NarrativeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ToolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm12 10a1 1 0 01-1 1H9a1 1 0 110-2h4.001A5.002 5.002 0 004.398 8.434a1 1 0 11-1.885-.666A7.002 7.002 0 0115 6.899V9a1 1 0 011 1v2z" clipRule="evenodd" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center space-x-2">
        {icon}
        <span>{label}</span>
    </button>
);

const modelNames: Record<string, string> = {
    seedance: "Seedance Pro 1.0",
    hailuo: "Hailuo 02",
    veo: "Veo 3",
    kling: "Kling",
};

const EditorPanel: React.FC<EditorPanelProps> = ({ scene, allModels, allProducts, onAddScene, onUpdateFrame, onEditScene, onGenerateVideo }) => {
  const { t } = useLocalization();
  const [newPrompt, setNewPrompt] = useState('');
  const [isCreatingScene, setIsCreatingScene] = useState(false);
  const [isUpdatingFrame, setIsUpdatingFrame] = useState<'start' | 'end' | null>(null);
  const [editablePrompt, setEditablePrompt] = useState('');

  useEffect(() => {
    if (scene) {
      setEditablePrompt(scene.description);
    }
  }, [scene]);

  const handleAction = async (action: SceneAction) => {
    if ((action === SceneAction.ADD_RELATED || action === SceneAction.ADD_UNRELATED) && !newPrompt.trim()) {
      alert(t('alertEnterPrompt'));
      return;
    }
    setIsCreatingScene(true);
    await onAddScene(action, newPrompt, scene ?? undefined);
    setNewPrompt('');
    setIsCreatingScene(false);
  };

  const handleMaskImage = async (frameType: 'start' | 'end', file: File) => {
    if (!scene) return;
    setIsUpdatingFrame(frameType);
    try {
        await onUpdateFrame(scene.id, frameType, file);
    } catch (error) {
        console.error("Failed to update frame with product:", error);
        alert("Error: Could not update frame. See console for details.");
    } finally {
        setIsUpdatingFrame(null);
    }
  };

  const handleRegenerate = async () => {
    if (!scene || !editablePrompt.trim()) return;
    await onEditScene(scene.id, editablePrompt);
  };
  
  if (!scene) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white/80 backdrop-blur-lg rounded-lg shadow-md border border-gray-200 text-gray-500 min-h-[300px]">
        <div className="text-center">
            <SparklesIcon />
            <h2 className="mt-2 text-xl font-medium">{t('selectScenePrompt')}</h2>
            <p className="text-sm">{t('selectSceneSubPrompt')}</p>
        </div>
      </div>
    );
  }
  
  const toolName = scene.recommendedModel ? modelNames[scene.recommendedModel] : t('generatingRecommendation');
  const modelsInScene = allModels.filter(m => scene.modelsInScene.includes(m.name));
  const productsInScene = allProducts.filter(p => scene.productsInScene.includes(p.name));

  return (
    <div className="flex-1 bg-white/80 backdrop-blur-lg p-6 rounded-lg shadow-md border border-gray-200 flex flex-col space-y-6 relative overflow-y-auto">
      {isCreatingScene && <Loader message={t('loaderCreatingNextScene')} />}
      
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('sceneFrames')}</h2>
        <div className="grid grid-cols-2 gap-6">
            <FrameView title={t('startFrame')} imageBase64={scene.startFrame ?? null} isLoading={scene.isLoading || !scene.startFrame} isUpdating={isUpdatingFrame === 'start'} onMaskImage={(file) => handleMaskImage('start', file)} />
            <FrameView title={t('endFrame')} imageBase64={scene.endFrame ?? null} isLoading={scene.isLoading || !scene.endFrame} isUpdating={isUpdatingFrame === 'end'} onMaskImage={(file) => handleMaskImage('end', file)} />
        </div>
        <div className="mt-6 text-center border-t border-gray-200 pt-6">
          {scene.videoGenerationStatus === 'done' && scene.generatedVideoUrl ? (
            <div>
              <h4 className="font-semibold text-lg text-green-700 mb-2">{t('videoReady')}</h4>
              <video key={scene.generatedVideoUrl} controls src={scene.generatedVideoUrl} className="w-full rounded-lg shadow-md aspect-video bg-black"></video>
            </div>
          ) : scene.videoGenerationStatus === 'pending' ? (
            <div className="bg-gray-100 p-4 rounded-lg inline-block">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                <span className="text-blue-700 font-semibold">{scene.videoGenerationProgress || t('generatingVideo')}</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onGenerateVideo(scene.id)}
              // FIX: Removed redundant `scene.videoGenerationStatus === 'pending'` check which caused a TypeScript error.
              // The button is not rendered when status is 'pending', so this check is unnecessary.
              disabled={!scene.startFrame || !scene.finalVideoPrompt}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed mx-auto"
            >
              <PlayIcon />
              <span>{t('generateVideo')}</span>
            </button>
          )}
          {scene.videoGenerationStatus === 'error' && (
              <p className="text-red-500 mt-2 font-semibold">{t('videoGenerationError')}: {scene.videoGenerationProgress}</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('sceneDetails')}</h2>
        <div className="relative">
          <textarea
            value={editablePrompt}
            onChange={(e) => setEditablePrompt(e.target.value)}
            rows={3}
            className="w-full bg-gray-50 text-gray-800 text-sm rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-40"
            placeholder={t('editScenePromptPlaceholder')}
          />
          <button 
            onClick={handleRegenerate}
            disabled={scene.isLoading}
            className="absolute top-1/2 right-3 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 disabled:bg-gray-400"
          >
            <RefreshIcon />
            <span>{t('regenerateScene')}</span>
          </button>
        </div>
        {scene.transitionToNextScene && (
            <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-start gap-3">
                <div className="text-indigo-500 pt-0.5"><TransitionOutIcon /></div>
                <div>
                    <h5 className="font-semibold text-indigo-800 text-sm">{t('transitionToNextScene')}</h5>
                    <p className="text-indigo-700 text-xs">{scene.transitionToNextScene}</p>
                </div>
            </div>
        )}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><UserGroupIcon /> {t('modelsInScene')}</h4>
                <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-lg border min-h-[4rem]">
                    {modelsInScene.length > 0 ? modelsInScene.map(model => (
                        <div key={model.id} className="flex items-center gap-2 bg-white p-1 rounded-md border text-xs shadow-sm">
                           <img src={model.modelSheet || model.referenceImages[0]} alt={model.name} className="w-6 h-6 rounded-full object-cover"/>
                           <span>{model.name}</span>
                        </div>
                    )) : <span className="text-gray-500 text-xs self-center p-2">{t('noModelsInScene')}</span>}
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><BoxIcon /> {t('productsInScene')}</h4>
                <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-lg border min-h-[4rem]">
                    {productsInScene.length > 0 ? productsInScene.map(product => (
                        <div key={product.id} className="flex items-center gap-2 bg-white p-1 rounded-md border text-xs shadow-sm">
                           <img src={product.image} alt={product.name} className="w-6 h-6 rounded-md object-contain"/>
                           <span>{product.name}</span>
                        </div>
                    )) : <span className="text-gray-500 text-xs self-center p-2">{t('noProductsInScene')}</span>}
                </div>
            </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">{t('aiSuggestions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SuggestionCard icon={<TransitionIcon />} title={t('transition')} content={scene.suggestions?.transition ?? '...'} />
          <SuggestionCard icon={<MagicIcon />} title={t('vfx')} content={scene.suggestions?.vfx ?? '...'} />
          <SuggestionCard icon={<CameraIcon />} title={t('camera')} content={scene.suggestions?.camera ?? '...'} />
          <SuggestionCard icon={<NarrativeIcon />} title={t('narrative')} content={scene.suggestions?.narrative ?? '...'} />
        </div>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">{t('finalVideoPrompt')}</h3>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-inner relative">
            <p className="text-gray-700 text-sm leading-relaxed pr-10">
                {scene.finalVideoPrompt || t('generatingFinalPrompt')}
            </p>
            <div className="absolute top-3 right-3">
                <CopyButton textToCopy={scene.finalVideoPrompt ?? ''} />
            </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">{t('recommendedAITool')}</h3>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-inner flex items-start space-x-4">
            <div className="flex-shrink-0 text-indigo-500 pt-1">
                <ToolIcon />
            </div>
            <div>
                <h4 className="font-bold text-lg text-gray-800">{toolName}</h4>
                <p className="text-gray-600 text-sm mt-1">{scene.reasoning || t('generatingRecommendation')}</p>
            </div>
        </div>
      </section>

      <div className="flex-grow"></div>
      
      <section className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-inner mt-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('nextScene')}</h3>
        <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              placeholder={t('newScenePromptPlaceholder')}
              className="flex-grow bg-white text-gray-800 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
         <div className="flex flex-col md:flex-row gap-4 mt-4">
          <ActionButton icon={<PlusIcon/>} label={t('extendScene')} onClick={() => handleAction(SceneAction.EXTEND)} />
          <ActionButton icon={<LinkIcon/>} label={t('addRelatedScene')} onClick={() => handleAction(SceneAction.ADD_RELATED)} />
          <ActionButton icon={<ChainBreakIcon/>} label={t('addUnrelatedScene')} onClick={() => handleAction(SceneAction.ADD_UNRELATED)} />
        </div>
      </section>
    </div>
  );
};

export default EditorPanel;