import React, { createContext, useContext, useState, useMemo } from 'react';

const koTranslations: Record<string, string> = {
  appTitle: 'AI 광고 영상 제작기',
  commercialIdeaPlaceholder: '광고 아이디어 또는 컨셉을 입력하세요...',
  youtubeUrlPlaceholder: '참고할 YouTube 영상 URL 입력 (선택 사항)',
  totalVideoDuration: '총 영상 길이(초)',
  generate: '생성하기',
  generating: '생성 중...',
  pacingTitle: '영상 속도',
  pacingStandard: '표준',
  pacingFast: '빠른 컷',
  
  models: '모델',
  addModelPrompt: '광고에 사용할 모델을 추가하세요.',
  addModel: '모델 추가',
  editModelLabel: '{modelName} 편집',
  
  products: '제품',
  addProductPrompt: '광고할 제품을 추가하세요.',
  addProduct: '제품 추가',
  editProductLabel: '{productName} 편집',

  storyboard: '스토리보드',
  storyboardLoading: '장면이 여기에 표시됩니다. <br/> 시작하려면 위에서 아이디어를 입력하세요.',

  selectScenePrompt: '세부 정보를 보려면 장면을 선택하세요',
  selectSceneSubPrompt: '또는 새 프로젝트를 생성하여 시작하세요.',
  
  sceneDetails: '장면 세부 정보',
  editScenePromptPlaceholder: '장면 프롬프트 수정...',
  regenerateScene: '다시 생성',
  sceneFrames: '장면 프레임 및 영상',
  startFrame: '시작 프레임',
  endFrame: '종료 프레임',
  transitionToNextScene: '다음 장면으로 전환',
  
  aiSuggestions: 'AI 제안',
  transition: '전환',
  vfx: '특수효과',
  camera: '카메라',
  narrative: '내러티브',
  
  finalVideoPrompt: '최종 비디오 프롬프트',
  generatingFinalPrompt: '최종 프롬프트 생성 중...',
  recommendedAITool: '추천 AI 도구',
  generatingRecommendation: '추천 생성 중...',
  
  nextScene: '다음 장면',
  newScenePromptPlaceholder: '관련/무관한 새 장면에 대한 프롬프트...',
  extendScene: '장면 확장',
  addRelatedScene: '관련 장면 추가',
  addUnrelatedScene: '무관한 장면 추가',

  modelsInScene: '장면 내 모델',
  productsInScene: '장면 내 제품',
  noModelsInScene: '모델 없음',
  noProductsInScene: '제품 없음',
  
  loaderGenerating: '생성 중...',
  loaderUpdatingFrame: '프레임 업데이트 중...',
  loaderGeneratingFrame: '{title} 생성 중...',
  loaderRegeneratingScene: '장면 다시 생성 중...',
  loaderGeneratingFrames: '프레임 생성 중...',
  loaderCreatingNextScene: '다음 장면 생성 중...',

  frameViewDownloadLabel: '{title} 다운로드',
  frameViewMaskLabel: '{title}에 제품 마스킹',
  
  modelModalCreateTitle: '새 모델 생성',
  modelModalEditTitle: '모델 수정',
  modelModalSubTitle: '모델의 이름과 참고 이미지를 입력하세요. AI를 사용해 모델 시트를 선택적으로 생성할 수도 있습니다.',
  modelModalNameLabel: '모델 이름',
  modelModalNamePlaceholder: '예: 비바',
  modelModalDescLabel: '모델 설명 (선택 사항)',
  modelModalDescPlaceholder: '예: 활기찬 성격의 20대 여성 모델...',
  modelModalUploadLabel: '참고 이미지 업로드 ({count}/4)',
  modelModalAddImage: '+ 추가',
  modelModalGenerateSheet: '모델 시트 생성',
  modelModalMonochrome: '흑백',
  modelModalColor: '컬러',
  modelModalReset: '이미지 및 시트 재설정',
  modelModalSheetLoading: '시트 생성 중...',
  modelModalSheetPlaceholder: '생성된 시트가 여기에 표시됩니다.',
  modelModalError: '시트를 생성하지 못했습니다. 다시 시도해 주세요.',
  modelModalCancel: '취소',
  modelModalSave: '모델 저장',

  productModalTitle: '제품 추가',
  productModalSubTitle: '광고에 사용할 제품의 이름과 이미지를 업로드하세요.',
  productModalNameLabel: '제품명',
  productModalNamePlaceholder: '예: 갤럭시 워치 9',
  productModalImageLabel: '제품 이미지',
  productModalImagePrompt: '클릭 또는 드래그하여 업로드',
  productModalCancel: '취소',
  productModalSave: '제품 저장',
  
  alertEnterPrompt: '새 장면에 대한 프롬프트를 입력하세요.',
  alertActionNotImplemented: '작업: {action} (프롬프트: "{prompt}")은(는) 아직 구현되지 않았습니다.',
  alertUpdateFrameNotImplemented: '장면 {sceneId}의 {frameType} 프레임 업데이트는 아직 구현되지 않았습니다.',
  alertStoryboardFailed: '스토리보드 생성 실패: {error}',
  alertRegenerateFailed: '장면 다시 생성 실패: {error}',
  alertMissingNameModel: '모델 이름을 입력하세요.',
  alertMissingSheetOrImage: '모델을 저장하려면 모델 시트 또는 하나 이상의 참고 이미지가 필요합니다.',
  alertMaxImages: '최대 4개의 참고 이미지를 업로드할 수 있습니다.',
  alertMissingImageOrDescModel: '시트를 생성하려면 하나 이상의 참고 이미지를 업로드하거나 설명을 제공하세요.',
  alertMissingProductName: '제품 이름을 입력하세요.',
  alertMissingProductImage: '제품 이미지를 업로드하세요.',
  alertVideoGenerationFailed: '비디오 생성 실패: {error}',

  storyboardStatusGenerating: '스토리보드 생성 중...',
  storyboardStatusAnalyzingYT: 'YouTube 영상 분석 중...',
  storyboardStatusReconstructing: '분석 기반으로 스토리보드 재구성 중...',
  storyboardStatusGeneratingScenes: '{count}개의 장면 생성 중...',
  storyboardStatusGeneratingFrames: '장면 {current}/{total}의 프레임 생성 중...',
  storyboardStatusVideoInitializing: '비디오 생성 초기화 중...',

  generateVideo: '영상 생성하기',
  generatingVideo: '영상 생성 중...',
  videoReady: '영상 준비 완료!',
  videoGenerationError: '영상 생성 오류',

  autoStoryTitle: '스토리보드 자동 생성',
  autoStoryDesc: '핵심 아이디어와 총 비디오 길이를 제공하세요. AI가 자동으로 여러 장면으로 구성된 스토리보드를 생성합니다.',
  autoStoryTopicLabel: '핵심 아이디어 / 주제',
  autoStoryTopicPlaceholder: '예: 사이버펑크 도시를 여행하는 고양이',
  autoStoryDurationLabel: '총 비디오 길이 (초)',
  autoStoryDurationHelp: 'AI는 스토리를 가장 잘 전달하기 위해 다양한 길이의 장면을 만듭니다.',
  autoStorySubmit: '생성',
  alertAutoStoryValidation: '주제와 3초 이상의 길이를 입력하세요.',

  webtoonTitle: '웹툰으로 영상 만들기',
  webtoonDesc: '웹툰 페이지를 업로드하고 순서를 조정한 후 스토리보드를 생성하세요. AI가 흑백 이미지를 기반으로 채색된 동영상 씬을 생성합니다.',
  webtoonDropzone: '이미지를 여기에 드래그하거나 클릭하여 업로드하세요',
  webtoonDropzoneSub: 'PNG, JPG, WEBP',
  alertWebtoonUpload: '웹툰 페이지를 하나 이상 업로드하세요.',
  webtoonSubmit: '스토리보드 생성',
  webtoonSubmitting: '생성 중...',
};

const enTranslations: Record<string, string> = {
  appTitle: 'AI Commercial Video Creator',
  commercialIdeaPlaceholder: 'Enter a commercial idea or concept...',
  youtubeUrlPlaceholder: 'Enter a YouTube URL to reference (Optional)',
  totalVideoDuration: 'Total Duration (sec)',
  generate: 'Generate',
  generating: 'Generating...',
  pacingTitle: 'Pacing',
  pacingStandard: 'Standard',
  pacingFast: 'Fast Cuts',
  
  models: 'Models',
  addModelPrompt: 'Add models to use in the commercial.',
  addModel: 'Add Model',
  editModelLabel: 'Edit {modelName}',
  
  products: 'Products',
  addProductPrompt: 'Add products to feature in the ad.',
  addProduct: 'Add Product',
  editProductLabel: 'Edit {productName}',

  storyboard: 'Storyboard',
  storyboardLoading: 'Scenes will appear here. <br/> Enter an idea above to get started.',

  selectScenePrompt: 'Select a scene to see details',
  selectSceneSubPrompt: 'Or create a new project to begin.',
  
  sceneDetails: 'Scene Details',
  editScenePromptPlaceholder: 'Edit the scene prompt...',
  regenerateScene: 'Regenerate',
  sceneFrames: 'Scene Frames & Video',
  startFrame: 'Start Frame',
  endFrame: 'End Frame',
  transitionToNextScene: 'Transition to Next Scene',
  
  aiSuggestions: 'AI Suggestions',
  transition: 'Transition',
  vfx: 'VFX',
  camera: 'Camera',
  narrative: 'Narrative',
  
  finalVideoPrompt: 'Final Video Prompt',
  generatingFinalPrompt: 'Generating final prompt...',
  recommendedAITool: 'Recommended AI Tool',
  generatingRecommendation: 'Generating recommendation...',
  
  nextScene: 'Next Scene',
  newScenePromptPlaceholder: 'Prompt for a new related/unrelated scene...',
  extendScene: 'Extend Scene',
  addRelatedScene: 'Add Related Scene',
  addUnrelatedScene: 'Add Unrelated Scene',

  modelsInScene: 'Models in Scene',
  productsInScene: 'Products in Scene',
  noModelsInScene: 'No models',
  noProductsInScene: 'No products',
  
  loaderGenerating: 'Generating...',
  loaderUpdatingFrame: 'Updating frame...',
  loaderGeneratingFrame: 'Generating {title}...',
  loaderRegeneratingScene: 'Regenerating scene...',
  loaderGeneratingFrames: 'Generating frames...',
  loaderCreatingNextScene: 'Creating next scene...',

  frameViewDownloadLabel: 'Download {title}',
  frameViewMaskLabel: 'Mask product on {title}',
  
  modelModalCreateTitle: 'Create New Model',
  modelModalEditTitle: 'Edit Model',
  modelModalSubTitle: 'Provide a name and reference images for your model. You can also optionally generate a model sheet with AI.',
  modelModalNameLabel: 'Model Name',
  modelModalNamePlaceholder: 'e.g., Viva',
  modelModalDescLabel: 'Model Description (Optional)',
  modelModalDescPlaceholder: 'e.g., A female model in her 20s with a vibrant personality...',
  modelModalUploadLabel: 'Upload Reference Images ({count}/4)',
  modelModalAddImage: '+ Add',
  modelModalGenerateSheet: 'Generate Model Sheet',
  modelModalMonochrome: 'Monochrome',
  modelModalColor: 'Color',
  modelModalReset: 'Reset Images & Sheet',
  modelModalSheetLoading: 'Generating sheet...',
  modelModalSheetPlaceholder: 'Generated sheet will appear here.',
  modelModalError: 'Failed to generate sheet. Please try again.',
  modelModalCancel: 'Cancel',
  modelModalSave: 'Save Model',

  productModalTitle: 'Add Product',
  productModalSubTitle: 'Upload the name and image of the product to be featured.',
  productModalNameLabel: 'Product Name',
  productModalNamePlaceholder: 'e.g., Galaxy Watch 9',
  productModalImageLabel: 'Product Image',
  productModalImagePrompt: 'Click or drag to upload',
  productModalCancel: 'Cancel',
  productModalSave: 'Save Product',
  
  alertEnterPrompt: 'Please enter a prompt for the new scene.',
  alertActionNotImplemented: 'Action: {action} (prompt: "{prompt}") is not yet implemented.',
  alertUpdateFrameNotImplemented: 'Updating the {frameType} frame for scene {sceneId} is not yet implemented.',
  alertStoryboardFailed: 'Storyboard generation failed: {error}',
  alertRegenerateFailed: 'Scene regeneration failed: {error}',
  alertMissingNameModel: 'Please enter a model name.',
  alertMissingSheetOrImage: 'A model sheet or at least one reference image is required to save the model.',
  alertMaxImages: 'You can upload a maximum of 4 reference images.',
  alertMissingImageOrDescModel: 'Please upload at least one reference image or provide a description to generate a sheet.',
  alertMissingProductName: 'Please enter a product name.',
  alertMissingProductImage: 'Please upload a product image.',
  alertVideoGenerationFailed: 'Video generation failed: {error}',

  storyboardStatusGenerating: 'Generating storyboard...',
  storyboardStatusAnalyzingYT: 'Analyzing YouTube video...',
  storyboardStatusReconstructing: 'Reconstructing storyboard from analysis...',
  storyboardStatusGeneratingScenes: 'Generating {count} scenes...',
  storyboardStatusGeneratingFrames: 'Generating frames for scene {current}/{total}...',
  storyboardStatusVideoInitializing: 'Initializing video generation...',

  generateVideo: 'Generate Video',
  generatingVideo: 'Generating video...',
  videoReady: 'Video Ready!',
  videoGenerationError: 'Video Generation Error',

  autoStoryTitle: 'Auto-Generate Storyboard',
  autoStoryDesc: 'Provide a core idea and total video length. The AI will automatically generate a storyboard with multiple scenes.',
  autoStoryTopicLabel: 'Core Idea / Topic',
  autoStoryTopicPlaceholder: 'e.g., A cat journeying through a cyberpunk city',
  autoStoryDurationLabel: 'Total Video Length (seconds)',
  autoStoryDurationHelp: 'The AI will create scenes of varying lengths to best tell the story.',
  autoStorySubmit: 'Generate',
  alertAutoStoryValidation: 'Please provide a topic and a duration of at least 3 seconds.',

  webtoonTitle: 'Create from Webtoon',
  webtoonDesc: 'Upload and order your webtoon pages to generate a storyboard. The AI will create colored video scenes from the black and white images.',
  webtoonDropzone: 'Drag images here or click to upload',
  webtoonDropzoneSub: 'PNG, JPG, WEBP',
  alertWebtoonUpload: 'Please upload at least one webtoon page.',
  webtoonSubmit: 'Generate Storyboard',
  webtoonSubmitting: 'Generating...',
};

type Locale = 'en' | 'ko';

const locales = {
  en: enTranslations,
  ko: koTranslations,
};

interface LocalizationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('ko'); // Default to Korean

  const t = useMemo(() => (key: string, options?: { [key: string]: string | number }) => {
    const translationSet = locales[locale] || locales.en;
    let translation = translationSet[key] || key;
    if (options) {
      Object.keys(options).forEach(optKey => {
        translation = translation.replace(`{${optKey}}`, String(options[optKey]));
      });
    }
    return translation;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);

  // FIX: Replaced JSX with React.createElement to resolve parsing errors in .ts file.
  // The original JSX was causing syntax errors because the file is not being treated as a TSX file.
  return React.createElement(LocalizationContext.Provider, { value }, children);
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};