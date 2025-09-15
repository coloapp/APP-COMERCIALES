



import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { AISuggestions, InitialSceneData, Model, Product, VideoModelId, Scene, SceneAnalysis } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function base64ToGeminiPart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64.split(',')[1],
      mimeType,
    },
  };
}

// Schema for generating suggestions
const suggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        transition: {
            type: Type.STRING,
            description: "A creative video transition name (e.g., 'Whip Pan', 'Glitch Cut', 'Morph')."
        },
        vfx: { 
            type: Type.STRING,
            description: "A visual effect to apply (e.g., '8mm Film Grain', 'Chromatic Aberration', 'Slow Motion')."
        },
        camera: { 
            type: Type.STRING,
            description: "A camera movement or angle (e.g., 'Dolly Zoom In', 'Low Angle Shot', 'Crane Shot Up')."
        },
        narrative: {
            type: Type.STRING,
            description: "A brief, one-sentence description of a dynamic action that connects the start and end frames, implying noticeable change over the scene's duration."
        }
    },
    required: ["transition", "vfx", "camera", "narrative"]
};

// Schema for the commercial storyboard generation
export const commercialStoryboardSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            sceneDescription: { 
                type: Type.STRING,
                description: 'A detailed, cinematic prompt for an AI image generator to create the first frame of a commercial scene. Describe models, setting, action, mood, lighting, and camera angles.'
            },
            narrative: {
                type: Type.STRING,
                description: 'A brief, one-sentence description of the dynamic action that occurs during this scene.'
            },
            duration: {
                type: Type.NUMBER,
                description: 'The estimated duration of this scene in seconds (e.g., 1, 3, 5). The sum of all scene durations MUST strictly equal the total duration specified by the user.'
            },
            modelsInScene: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'A list of model names present in this scene, based on the provided model list. Can be an empty list.'
            },
            productsInScene: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'A list of product names present in this scene, based on the provided product list. Can be an empty list.'
            },
            transitionToNextScene: {
                type: Type.STRING,
                description: 'A creative suggestion for how this scene visually transitions to the next one. For the last scene, this can describe the final fade out.'
            }
        },
        required: ["sceneDescription", "narrative", "duration", "modelsInScene", "productsInScene", "transitionToNextScene"]
    }
};

export const generateModelSheet = async (
    referenceImages: { data: string; mimeType: string }[],
    modelName: string,
    modelDescription: string,
    style: 'monochrome' | 'color'
): Promise<string> => { // returns base64 string
    const imageParts = referenceImages.map(img => base64ToGeminiPart(img.data, img.mimeType));

    const prompt = `You are a professional AI fashion photographer. Your task is to create a professional model composite sheet (comp card) for a model named "${modelName}".

**Model Details:**
- **Name:** "${modelName}"
- **Description:** "${modelDescription}"

**Instructions:**
1.  **Layout:** Create a single, well-composed image containing 3-4 distinct shots of the same model. The layout should be clean and professional, similar to a real-world model agency comp card.
2.  **Poses & Shots:** Include a variety of shots to showcase the model's range:
    - A full-body shot in a confident, natural pose.
    - A three-quarter shot with a warm, engaging smile.
    - A close-up headshot highlighting their facial features and a specific expression (e.g., thoughtful, joyful, determined).
3.  **Style & Lighting:** The overall style must be **ultra-photorealistic and cinematic**, suitable for a high-end commercial. Use professional studio lighting (e.g., softbox, key light, fill light) to create a flattering, polished look with soft shadows. The background should be a neutral, seamless studio backdrop (light gray or off-white).
4.  **Consistency:** It is CRITICAL to maintain perfect consistency of the model's appearance, facial features, and body type across all shots, based on the provided reference image(s). The reference images are the ground truth for the model's look.
5.  **Output Format:** The final output must be a single image file. **Do not add any text, logos, or borders to the image.** The focus is purely on the photographic shots of the model. The style is ${style === 'color' ? 'vibrant, full-color' : 'classic, high-contrast black and white'}.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                ...imageParts,
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }

    const textPart = response.candidates?.[0]?.content?.parts.find(p => p.text);
    if (textPart?.text) {
        throw new Error(`AI did not return an image. Response: "${textPart.text}"`);
    }
    throw new Error("AI did not return an image for the model sheet.");
};

export const recommendVideoModel = async (
    sceneDescription: string,
    narrative: string,
): Promise<{ model: VideoModelId, reasoning: string }> => {
    const prompt = `
You are an expert AI video generation consultant. Your task is to recommend the best video model for a specific scene based on the models' strengths.

Here are the available models and their specialties:
- **Seedance Pro 1.0**: Best for multi-shot narrative sequences with high character and style consistency.
- **Hailuo 02**: Excels at complex physics, dynamic motion, and action sequences.
- **Veo 3**: Uniquely capable of generating video and synchronized audio. Best for concept films with sound.
- **Kling**: Strong at maintaining consistency when provided with multiple reference images.

**Scene to Analyze:**
- **Visuals & Setting:** "${sceneDescription}"
- **Key Action/Narrative:** "${narrative}"

Based on the scene, choose the single most suitable model from the list ['seedance', 'hailuo', 'veo', 'kling'] and provide a brief reasoning.
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    model: { type: Type.STRING, description: "One of: 'seedance', 'hailuo', 'veo', 'kling'." },
                    reasoning: { type: Type.STRING, description: "A brief explanation for the choice." }
                },
                required: ["model", "reasoning"]
            }
        }
    });
    return JSON.parse(response.text.trim()) as { model: VideoModelId, reasoning: string };
}

// 1. Generate the initial storyboard structure from a prompt
export const generateCommercialStoryboard = async (
    idea: string,
    totalDuration: number,
    models: Pick<Model, 'name' | 'description'>[],
    products: Pick<Product, 'name'>[],
    pacing: 'standard' | 'fast'
): Promise<InitialSceneData[]> => {
    const modelList = models.length > 0
        ? models.map(c => `- ${c.name}: ${c.description || 'No description'}`).join('\n')
        : 'No specific models provided. You may invent them if needed.';
    
    const productList = products.length > 0
        ? products.map(p => `- ${p.name}`).join('\n')
        : 'No specific products provided. You may invent a generic product if needed.';


    const systemInstruction = `You are a world-class AI creative director. Your task is to transform a user's idea into a professional, cinematic commercial storyboard.

**Key Directives:**
1.  **Strict Duration Adherence:** The sum of all scene durations MUST strictly equal the target of ${totalDuration} seconds. Do not deviate.
2.  **Pacing:** The user has selected '${pacing}' pacing.
    - If 'standard': Create 3-5 emotionally resonant scenes.
    - If 'fast': Create many (e.g., up to ${totalDuration}) very short, 1-2 second scenes to create a high-energy, quick-cut feel.
3.  **Product as Hero:** The product(s) are the central focus. They must be showcased in a highly appealing, desirable way. At least one scene must be a dedicated, stunning "hero shot" of the product.

**Your Thought Process (Agent Chaining):**
1.  **Define Your Persona:** Based on the user's core idea, first, internally define your expert persona. Are you a director for gritty, fast-paced action ads or for elegant, emotional luxury brand films? This persona will guide all your creative choices.
2.  **Create a Cohesive Narrative Arc:** Deconstruct the idea into a sequence of scenes that tell a complete, compelling story, strictly adhering to the specified duration and pacing.
3.  **Flesh out Each Scene with Cinematic Detail:** For each scene, generate the required JSON object. Your output must be a valid JSON array.

**Detailed Instructions for JSON fields:**
-   **sceneDescription**: Write a highly detailed, vivid prompt for an AI image generator. Act as a master cinematographer. Specify camera lenses (e.g., wide-angle, 85mm prime), depth of field, specific lighting setups (e.g., golden hour, three-point lighting), composition (e.g., rule of thirds, leading lines), precise model expressions/actions, and how the product is masterfully integrated. The style must be **photorealistic and cinematic**, suitable for a high-end live-action commercial. DO NOT use anime or cartoon styles.
-   **narrative**: Describe the key action that happens *during* the scene in a single, dynamic sentence.
-   **duration**: Assign a duration for this scene. Remember, the total must sum to exactly ${totalDuration} seconds. For 'fast' pacing, most durations should be 1 or 2.
-   **modelsInScene** & **productsInScene**: List the exact names from the provided lists.
-   **transitionToNextScene**: Describe the specific visual or narrative link to the *next* scene (e.g., "Match cut from the spinning car wheel to a spinning watch face," or "J-cut, where the audio from the next scene starts before the video changes."). For the final scene, describe the end card or fade out.

**Available Models:**
${modelList}

**Available Products:**
${productList}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Core Idea: "${idea}"`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: commercialStoryboardSchema,
        },
    });

    try {
        const panels = JSON.parse(response.text.trim()) as Omit<InitialSceneData, 'recommendedModel' | 'reasoning' | 'sourcePageIndex'>[];
        
        const enrichedPanels = await Promise.all(panels.map(async (panel) => {
            const { model, reasoning } = await recommendVideoModel(panel.sceneDescription, panel.narrative);
            return {
                ...panel,
                duration: Math.min(Math.round(panel.duration), 10),
                recommendedModel: model,
                reasoning: reasoning,
                sourcePageIndex: 0, // Not applicable here, but needed for type compatibility
            };
        }));
        return enrichedPanels;
    } catch (e) {
        console.error("Failed to parse commercial storyboard:", e);
        throw new Error("Failed to get a valid storyboard from AI.");
    }
};

const getImageParts = (images: string[]) => {
    return images.map(imgBase64 => {
        const mimeType = imgBase64.match(/data:(image\/.*?);/)?.[1] || 'image/png';
        return base64ToGeminiPart(imgBase64, mimeType);
    });
};

const createBlankCanvasDataUrl = (width: number, height: number): string => {
    if (typeof document === 'undefined') {
        return '';
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
    }
    return canvas.toDataURL('image/png');
};


// 2. Generate a single image (start frame) from a text prompt
export const generateVideoFrame = async (prompt: string, modelReferenceImages: string[] = [], modelSheets: string[] = [], productImages: string[] = []): Promise<string> => {
    const modelRefImageParts = getImageParts(modelReferenceImages);
    const modelSheetParts = getImageParts(modelSheets);
    const productImageParts = getImageParts(productImages);
    const referenceImageParts = [...modelRefImageParts, ...modelSheetParts, ...productImageParts];

    const blankCanvasBase64 = createBlankCanvasDataUrl(1280, 720);
    const blankCanvasPart = base64ToGeminiPart(blankCanvasBase64, 'image/png');

    let textPrompt = `You are an AI cinematographer. A blank white 16:9 canvas is provided. Your task is to generate a single, photorealistic, cinematic, full-screen frame ON THIS CANVAS based on the following description. The result must look like a real, high-quality photograph from a commercial, not an animation or drawing.
    Description: "${prompt}".`;
    
    if (modelRefImageParts.length > 0) {
        textPrompt += "\n\nCRITICAL: You are provided with original reference images for the models. Prioritize these original images above all else to ensure perfect character consistency. The model sheets are for secondary reference on poses and angles but the core likeness MUST come from the original photos.";
    } else if (modelSheetParts.length > 0) {
        textPrompt += "\n\nCRITICAL: Use the provided model sheets to ensure model appearance is consistent.";
    }

    if (productImageParts.length > 0) {
        textPrompt += "\n\nCRITICAL: Use the provided product images to ensure product appearance is perfectly consistent.";
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                blankCanvasPart,
                ...referenceImageParts,
                { text: textPrompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("AI did not return an image for the video frame.");
};

// 3. Generate the end frame based on the start frame and narrative
export const generateEndFrame = async (startFrameBase64: string, narrative: string, duration: number, modelReferenceImages: string[] = [], modelSheets: string[] = [], productImages: string[] = []): Promise<string> => {
    const mimeType = startFrameBase64.match(/data:(image\/.*?);/)?.[1] || 'image/png';
    const startFramePart = base64ToGeminiPart(startFrameBase64, mimeType);
    const modelRefImageParts = getImageParts(modelReferenceImages);
    const modelSheetParts = getImageParts(modelSheets);
    const productImageParts = getImageParts(productImages);
    const referenceImageParts = [...modelRefImageParts, ...modelSheetParts, ...productImageParts];

    let prompt = `This is the start frame of a ${duration}-second commercial scene. The key action during the scene is: "${narrative}".
    Generate the end frame that shows the result of this action.
    The end frame MUST be visually distinct from the start frame, showing a clear, significant change in pose, expression, or position. Maintain perfect consistency for character design, products, and background. The style must remain photorealistic and cinematic.`;
    
    if (duration >= 5) {
        prompt += `\n\nCRITICAL: Because this scene is ${duration} seconds long, the transformation from the start frame to the end frame must be dramatic and substantial. Avoid subtle changes. Show a major development in the action.`;
    }

    if (modelRefImageParts.length > 0) {
        prompt += "\n\nCRITICAL: You are provided with original reference images for the models. Prioritize these original images above all else to ensure perfect character consistency. The model sheets are for secondary reference on poses and angles but the core likeness MUST come from the original photos.";
    } else if (modelSheetParts.length > 0) {
        prompt += "\n\nCRITICAL: Use the provided model sheets to ensure model appearance is consistent.";
    }

    if (productImageParts.length > 0) {
        prompt += "\n\nCRITICAL: Use the provided product images to ensure product appearance is perfectly consistent.";
    }


    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [startFramePart, ...referenceImageParts, { text: prompt }] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("AI did not return an end frame for the scene.");
};

export const regenerateVideoFrame = async (originalFrameBase64: string, editPrompt: string): Promise<string> => {
    const mimeType = originalFrameBase64.match(/data:(image\/.*?);/)?.[1] || 'image/png';
    const originalFramePart = base64ToGeminiPart(originalFrameBase64, mimeType);

    const prompt = `You are an expert photo editor.
        **Base Image:** The provided image is the original frame.
        **Instruction:** Modify the image based on this specific request: "${editPrompt || 'Generate a creative alternative version.'}".
        **Task:** Re-render the image, applying the modification while maintaining the original photorealistic style, character designs, and overall composition. The output must be ONLY the edited 16:9 image.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalFramePart, { text: prompt }] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("AI did not return a regenerated image.");
};

// 4. Generate AI Suggestions
export const generateSuggestionsForScene = async (sceneDescription: string, duration: number): Promise<AISuggestions> => {
    const promptContent = `Based on the commercial scene idea "${sceneDescription}", generate creative suggestions for a ${duration}-second cinematic clip. The narrative must describe a clear, dynamic action with a visible outcome.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptContent,
        config: {
            responseMimeType: "application/json",
            responseSchema: suggestionsSchema,
        },
    });
    return JSON.parse(response.text.trim()) as AISuggestions;
};

// 5. Generate Final Consolidated Prompt
export const generateFinalVideoPrompt = async (sceneDescription: string, suggestions: AISuggestions, duration: number): Promise<string> => {
     const systemInstruction = `You are an expert prompt engineer for an AI video generator. Combine a scene idea and creative suggestions into a single, cohesive, and detailed video prompt for a ${duration}-second cinematic commercial scene.`;
    
    const userPrompt = `
      Scene Idea: "${sceneDescription}"
      Transition: "${suggestions.transition}"
      VFX: "${suggestions.vfx}"
      Camera: "${suggestions.camera}"
      Narrative: "${suggestions.narrative}"
      Combine these into one detailed video prompt.
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: { systemInstruction },
    });
    return response.text.trim();
};

export const analyzeYouTubeVideo = async (youtubeUrl: string): Promise<SceneAnalysis[]> => {
    const systemInstruction = `You are an expert video analyst with direct access to YouTube. Your task is to watch the video at the provided URL and create a detailed storyboard breakdown.
- **Analyze the video's pacing, narrative, and visual style.** Deconstruct the video into a sequence of key scenes.
- For each scene, provide a detailed description of the visuals, the core narrative action, an estimated duration, and a transition idea. The sum of durations should approximate the video's length.
- For 'modelsInScene' and 'productsInScene', use generic but descriptive names (e.g., ['Main Actor', 'Friend'], ['Hero Product']).
- Respond in valid JSON format using the provided schema.`;

    const userPrompt = `Please analyze the video from this URL and generate a storyboard: ${youtubeUrl}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: commercialStoryboardSchema,
        },
    });
    return JSON.parse(response.text.trim()) as SceneAnalysis[];
};

export const generateStoryboardFromAnalysis = async (
    analysis: SceneAnalysis[],
    models: Pick<Model, 'name' | 'description'>[],
    products: Pick<Product, 'name'>[]
): Promise<InitialSceneData[]> => {
     const modelList = models.map(c => `- ${c.name}: ${c.description || 'No description'}`).join('\n');
     const productList = products.map(p => `- ${p.name}`).join('\n');

    const systemInstruction = `You are a creative director reimagining a commercial based on an analysis of another video.
    You are given a scene-by-scene breakdown of a reference video.
    Your task is to recreate this storyboard but replace the original generic models and products with the new, specific ones provided.
    For each scene from the analysis:
    1. Rewrite the 'sceneDescription' to feature the new models and products. **CRITICAL: The new products are the heroes. Ensure they are featured prominently and appealingly. If the original analysis lacks a dedicated product 'hero shot', you MUST add one.**
    2. Maintain the pacing and structure from the original analysis by keeping the 'duration' and 'transitionToNextScene' ideas.
    3. In 'modelsInScene' and 'productsInScene', list the names of the new models and products you've included in the rewritten description, ensuring the names match the provided lists exactly.

    Your response must be a valid JSON array.

    **Available Models:**
    ${modelList}

    **Available Products:**
    ${productList}
    `;
    const userPrompt = `Here is the reference video analysis. Recreate it with the new models and products.
    Analysis:
    ${JSON.stringify(analysis, null, 2)}`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: commercialStoryboardSchema,
        },
    });
    
    try {
        const panels = JSON.parse(response.text.trim()) as Omit<InitialSceneData, 'recommendedModel' | 'reasoning' | 'sourcePageIndex'>[];
        
        const enrichedPanels = await Promise.all(panels.map(async (panel) => {
            const { model, reasoning } = await recommendVideoModel(panel.sceneDescription, panel.narrative);
            return {
                ...panel,
                duration: Math.min(Math.round(panel.duration), 10),
                recommendedModel: model,
                reasoning: reasoning,
                sourcePageIndex: 0,
            };
        }));
        return enrichedPanels;
    } catch (e) {
        console.error("Failed to parse reconstructed storyboard:", e);
        throw new Error("Failed to get a valid reconstructed storyboard from AI.");
    }
};


export const generateVeoVideo = async (
    prompt: string,
    onProgressUpdate: (progress: string) => void,
    startFrameBase64?: string
): Promise<string> => {
    onProgressUpdate("Starting video generation...");

    const requestPayload: {
        model: string;
        prompt: string;
        config: { numberOfVideos: number };
        image?: { imageBytes: string; mimeType: string; };
    } = {
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        config: { numberOfVideos: 1 }
    };

    if (startFrameBase64) {
        const [header, base64Data] = startFrameBase64.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
        requestPayload.image = {
            imageBytes: base64Data,
            mimeType: mimeType,
        };
    }

    let operation = await ai.models.generateVideos(requestPayload);

    const progressMessages = ["Casting models...", "Setting up the scene...", "Director is shouting 'Action!'...", "Rendering photons...", "Compositing layers..."];
    let pollCount = 0;

    while (!operation.done) {
        onProgressUpdate(progressMessages[pollCount % progressMessages.length]);
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
        pollCount++;
    }

    if (operation.error) throw new Error(`Video generation failed: ${operation.error.message}`);

    onProgressUpdate("Fetching video...");
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation completed, but no download link was provided.");
    
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);
    
    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
};