// types.ts

export interface Model {
  id: string;
  name: string;
  description: string;
  modelSheet?: string; // base64 data URL
  referenceImages: string[];
}

export interface Product {
  id: string;
  name: string;
  image: string; // base64 data URL
}

export type VideoModelId = 'seedance' | 'hailuo' | 'veo' | 'kling';

export interface AISuggestions {
    transition: string;
    vfx: string;
    camera: string;
    narrative: string;
}

export interface SceneAnalysis {
    sceneDescription: string;
    narrative: string;
    duration: number;
    modelsInScene: string[];
    productsInScene: string[];
    transitionToNextScene?: string;
}

export interface InitialSceneData extends SceneAnalysis {
    recommendedModel: VideoModelId;
    reasoning: string;
    sourcePageIndex: number;
}

export interface Scene {
    id:string;
    description: string;
    duration: number;
    sourcePageIndex: number;
    modelsInScene: string[];
    productsInScene: string[];
    recommendedModel: VideoModelId;
    reasoning: string;
    isLoading: boolean;
    transitionToNextScene?: string;

    startFrame?: string; // base64
    endFrame?: string; // base64
    prompts?: Record<VideoModelId, string>;
    
    videoGenerationStatus: 'idle' | 'pending' | 'done' | 'error';
    videoGenerationProgress?: string;
    generatedVideoUrl?: string; // Object URL
    
    suggestions?: AISuggestions;
    finalVideoPrompt?: string;
}

export enum SceneAction {
    EXTEND,
    ADD_RELATED,
    ADD_UNRELATED,
}