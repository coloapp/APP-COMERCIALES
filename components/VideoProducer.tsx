

import React, { useState, useMemo } from 'react';
import type { Model, Product, Scene, SceneAnalysis, InitialSceneData } from '../types';
import { SceneAction } from '../types';
import * as geminiService from '../services/geminiService';
import { useLocalization } from '../hooks/useLocalization';

import Header from './Header';
import ModelPanel from './CharacterPanel'; // Filename is CharacterPanel.tsx, but component is ModelPanel
import ScenePanel from './ScenePanel';
import EditorPanel from './EditorPanel';
import ModelModal from './CharacterModal'; // Filename is CharacterModal.tsx, but component is ModelModal
import ProductPanel from './ProductPanel';
import ProductModal from './ProductModal';

export function VideoProducer({ initialModels }: { initialModels: Model[] }) {
    const { t } = useLocalization();
    const [models, setModels] = useState<Model[]>(initialModels);
    const [products, setProducts] = useState<Product[]>([]);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
    const [storyboardGenerationStatus, setStoryboardGenerationStatus] = useState<string | null>(null);
    
    const [isModelModalOpen, setIsModelModalOpen] = useState(false);
    const [modelToEdit, setModelToEdit] = useState<Model | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    const handleAddModel = () => {
        setModelToEdit(null);
        setIsModelModalOpen(true);
    };

    const handleEditModel = (id: string) => {
        const model = models.find(c => c.id === id);
        if (model) {
            setModelToEdit(model);
            setIsModelModalOpen(true);
        }
    };
    
    const handleSaveModel = (modelData: Model | Omit<Model, 'id'>) => {
        if ('id' in modelData) {
            setModels(chars => chars.map(c => c.id === modelData.id ? modelData : c));
        } else {
            const newModel: Model = {
                ...modelData,
                id: `model-${Date.now()}`
            };
            setModels(chars => [...chars, newModel]);
        }
        setIsModelModalOpen(false);
        setModelToEdit(null);
    };

    const handleAddProduct = () => {
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = (productData: Omit<Product, 'id'>) => {
        const newProduct: Product = {
            ...productData,
            id: `prod-${Date.now()}`
        };
        setProducts(prods => [...prods, newProduct]);
        setIsProductModalOpen(false);
    };

    const handleProjectCreate = async (prompt: string, duration: number, youtubeUrl: string, pacing: 'standard' | 'fast') => {
        setScenes([]);
        setSelectedSceneId(null);
        
        try {
            let analyzedPanels: InitialSceneData[];
            if (youtubeUrl.trim()) {
                setStoryboardGenerationStatus(t('storyboardStatusAnalyzingYT'));
                const analysis: SceneAnalysis[] = await geminiService.analyzeYouTubeVideo(youtubeUrl);
                setStoryboardGenerationStatus(t('storyboardStatusReconstructing'));
                analyzedPanels = await geminiService.generateStoryboardFromAnalysis(analysis, models, products);
            } else {
                setStoryboardGenerationStatus(t('storyboardStatusGenerating'));
                analyzedPanels = await geminiService.generateCommercialStoryboard(prompt, duration, models, products, pacing);
            }
            
            const placeholderScenes: Scene[] = analyzedPanels.map((panel, i) => ({
                id: Date.now().toString() + i,
                description: panel.sceneDescription,
                duration: panel.duration,
                sourcePageIndex: 0,
                modelsInScene: panel.modelsInScene,
                productsInScene: panel.productsInScene,
                recommendedModel: panel.recommendedModel,
                reasoning: panel.reasoning,
                transitionToNextScene: panel.transitionToNextScene,
                isLoading: true,
                videoGenerationStatus: 'idle',
            }));
            setScenes(placeholderScenes);
            setStoryboardGenerationStatus(t('storyboardStatusGeneratingScenes', { count: placeholderScenes.length }));

            for (let i = 0; i < analyzedPanels.length; i++) {
                const panel = analyzedPanels[i];
                const placeholderScene = placeholderScenes[i];
                setStoryboardGenerationStatus(t('storyboardStatusGeneratingFrames', { current: i + 1, total: placeholderScenes.length }));
                
                const modelsForScene = models.filter(m => panel.modelsInScene.includes(m.name));
                const productsForScene = products.filter(p => panel.productsInScene.includes(p.name));
                
                const modelReferenceImages = modelsForScene.flatMap(m => m.referenceImages);
                const modelSheets = modelsForScene.map(m => m.modelSheet).filter((sheet): sheet is string => !!sheet);
                const productImages = productsForScene.map(p => p.image);

                const [startFrame, suggestions] = await Promise.all([
                    geminiService.generateVideoFrame(panel.sceneDescription, modelReferenceImages, modelSheets, productImages),
                    geminiService.generateSuggestionsForScene(panel.sceneDescription, panel.duration),
                ]);
                
                const endFrame = await geminiService.generateEndFrame(startFrame, suggestions.narrative, panel.duration, modelReferenceImages, modelSheets, productImages);
                const finalVideoPrompt = await geminiService.generateFinalVideoPrompt(panel.sceneDescription, suggestions, panel.duration);
                
                setScenes(prevScenes => prevScenes.map(s => 
                    s.id === placeholderScene.id 
                    ? { ...s, startFrame, endFrame, suggestions, finalVideoPrompt, isLoading: false } 
                    : s
                ));
            }
            
            if (placeholderScenes.length > 0) {
                setSelectedSceneId(placeholderScenes[0].id);
            }

        } catch (error) {
            console.error("Storyboard generation failed", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown Error';
            alert(t('alertStoryboardFailed', { error: errorMessage }));
        } finally {
            setStoryboardGenerationStatus(null);
        }
    };

    const handleAddScene = async (action: SceneAction, prompt: string, previousScene?: Scene) => {
        alert(t('alertActionNotImplemented', { action: SceneAction[action], prompt }));
    };

    const handleUpdateFrame = async (sceneId: string, frameType: 'start' | 'end', productFile: File) => {
        alert(t('alertUpdateFrameNotImplemented', { frameType, sceneId }));
    };

    const handleEditScene = async (sceneId: string, newPrompt: string) => {
        setScenes(prev => prev.map(s => s.id === sceneId ? {...s, description: newPrompt, isLoading: true, startFrame: undefined, endFrame: undefined } : s));
        try {
            const scene = scenes.find(s => s.id === sceneId);
            if (!scene) throw new Error("Scene not found");
            
            const modelsForScene = models.filter(m => scene.modelsInScene.includes(m.name));
            const productsForScene = products.filter(p => scene.productsInScene.includes(p.name));
            
            const modelReferenceImages = modelsForScene.flatMap(m => m.referenceImages);
            const modelSheets = modelsForScene.map(m => m.modelSheet).filter((sheet): sheet is string => !!sheet);
            const productImages = productsForScene.map(p => p.image);

            const [startFrame, suggestions] = await Promise.all([
                geminiService.generateVideoFrame(newPrompt, modelReferenceImages, modelSheets, productImages),
                geminiService.generateSuggestionsForScene(newPrompt, scene.duration),
            ]);
                
            const endFrame = await geminiService.generateEndFrame(startFrame, suggestions.narrative, scene.duration, modelReferenceImages, modelSheets, productImages);
            const finalVideoPrompt = await geminiService.generateFinalVideoPrompt(newPrompt, suggestions, scene.duration);

            setScenes(prev => prev.map(s => s.id === sceneId ? {...s, startFrame, endFrame, suggestions, finalVideoPrompt, isLoading: false } : s));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown Error';
            alert(t('alertRegenerateFailed', { error: errorMessage }));
            setScenes(prev => prev.map(s => s.id === sceneId ? {...s, isLoading: false } : s));
        }
    };

    const handleGenerateVideo = async (sceneId: string) => {
        const scene = scenes.find(s => s.id === sceneId);
        if (!scene || !scene.finalVideoPrompt || !scene.startFrame) {
            console.error("Missing required data for video generation");
            return;
        }

        setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, videoGenerationStatus: 'pending', videoGenerationProgress: t('storyboardStatusVideoInitializing') } : s));

        try {
            const videoUrl = await geminiService.generateVeoVideo(
                scene.finalVideoPrompt, 
                (progress: string) => {
                    setScenes(prev => {
                        const currentScenes = [...prev];
                        const sceneIndex = currentScenes.findIndex(s => s.id === sceneId);
                        if (sceneIndex > -1 && currentScenes[sceneIndex].videoGenerationStatus === 'pending') {
                           currentScenes[sceneIndex] = { ...currentScenes[sceneIndex], videoGenerationProgress: progress };
                           return currentScenes;
                        }
                        return prev;
                    });
                },
                scene.startFrame
            );
            setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, videoGenerationStatus: 'done', generatedVideoUrl: videoUrl, videoGenerationProgress: 'Completed' } : s));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown Error';
            console.error("Video generation failed:", error);
            setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, videoGenerationStatus: 'error', videoGenerationProgress: errorMessage } : s));
            alert(t('alertVideoGenerationFailed', { error: errorMessage }));
        }
    };


    const selectedScene = useMemo(() => scenes.find(s => s.id === selectedSceneId) ?? null, [scenes, selectedSceneId]);

    return (
        <div className="h-screen w-screen bg-gray-100 text-gray-800 flex flex-col p-4 font-sans overflow-hidden gap-4">
            <Header 
                onProjectCreate={handleProjectCreate} 
                isLoading={!!storyboardGenerationStatus}
            />
            <main className="flex-1 flex gap-4 min-h-0">
                <div className="w-64 shrink-0 flex flex-col gap-4">
                    <ModelPanel 
                        models={models}
                        onAddModel={handleAddModel}
                        onEditModel={handleEditModel}
                    />
                    <ProductPanel
                        products={products}
                        onAddProduct={handleAddProduct}
                    />
                </div>
                <ScenePanel 
                    scenes={scenes} 
                    selectedSceneId={selectedSceneId}
                    onSelectScene={setSelectedSceneId}
                    storyboardGenerationStatus={storyboardGenerationStatus}
                />
                <EditorPanel 
                    scene={selectedScene}
                    allModels={models}
                    allProducts={products}
                    onAddScene={handleAddScene}
                    onUpdateFrame={handleUpdateFrame}
                    onEditScene={handleEditScene}
                    onGenerateVideo={handleGenerateVideo}
                />
            </main>
            {isModelModalOpen && (
                <ModelModal 
                    onClose={() => setIsModelModalOpen(false)}
                    onSave={handleSaveModel}
                    modelToEdit={modelToEdit}
                />
            )}
            {isProductModalOpen && (
                <ProductModal
                    onClose={() => setIsProductModalOpen(false)}
                    onSave={handleSaveProduct}
                />
            )}
        </div>
    );
}