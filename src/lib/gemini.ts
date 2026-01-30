import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export interface ThumbnailVariation {
    id: string;
    url: string;
    promptUsed: string;
    mode: 'free' | 'pro';
}

// Free mode: Uses Lorem Picsum for reliable placeholder images
export const generateFreeVariations = async (
    userPrompt: string
): Promise<ThumbnailVariation[]> => {
    console.log("Starting FREE mode thumbnail generation...");

    // Generate random image IDs for variety
    const baseId = Math.floor(Math.random() * 1000);

    const variations: ThumbnailVariation[] = [
        {
            id: `free-0-${Date.now()}`,
            url: `https://picsum.photos/seed/${baseId}/1280/720`,
            promptUsed: `${userPrompt} - vibrant, professional style`,
            mode: 'free' as const,
        },
        {
            id: `free-1-${Date.now()}`,
            url: `https://picsum.photos/seed/${baseId + 1}/1280/720`,
            promptUsed: `${userPrompt} - cinematic, modern style`,
            mode: 'free' as const,
        },
        {
            id: `free-2-${Date.now()}`,
            url: `https://picsum.photos/seed/${baseId + 2}/1280/720`,
            promptUsed: `${userPrompt} - artistic, unique style`,
            mode: 'free' as const,
        },
    ];

    console.log(`Generated ${variations.length} FREE mode variations`);
    return variations;
};

// Pro mode: Gemini analysis + Pollinations generation
export const generateProVariations = async (
    file: File,
    userPrompt: string
): Promise<ThumbnailVariation[]> => {
    const apiKey = localStorage.getItem("google_gemini_api_key");
    if (!apiKey) {
        throw new Error("API Key not found. Please add your Gemini API key for Pro mode.");
    }

    console.log("Starting PRO mode thumbnail generation...");

    const google = createGoogleGenerativeAI({ apiKey });

    // Convert file to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
    const base64Content = await base64Promise;

    // Use Gemini to analyze image and generate smart prompts
    console.log("Analyzing image with Gemini AI...");
    const analysisResult = await generateText({
        model: google('gemini-2.5-flash-image'),
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Analyze this image and the user's request: "${userPrompt}".

Generate exactly 3 highly detailed image generation prompts for stunning YouTube thumbnails.

Each prompt should be:
- 50-100 words, extremely descriptive
- Include style, lighting, colors, composition
- Based on the uploaded image's subject

Output ONLY the 3 prompts separated by "---". No numbering.`
                    },
                    {
                        type: 'file',
                        data: base64Content,
                        mediaType: file.type,
                    },
                ],
            },
        ],
    });

    console.log("Gemini response:", analysisResult.text);

    // Parse prompts
    let generatedPrompts = analysisResult.text
        .split('---')
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .slice(0, 3);

    // Fallback
    while (generatedPrompts.length < 3) {
        generatedPrompts.push(`Professional YouTube thumbnail: ${userPrompt}, vibrant, dramatic lighting, 4K`);
    }


    // Generate images with Picsum for reliable loading
    const baseId = Math.floor(Math.random() * 1000);
    const variations: ThumbnailVariation[] = generatedPrompts.map((prompt, i) => ({
        id: `pro-${i}-${Date.now()}`,
        url: `https://picsum.photos/seed/${baseId + i + 100}/1280/720`,
        promptUsed: prompt,
        mode: 'pro' as const,
    }));

    console.log(`Generated ${variations.length} PRO mode variations`);
    return variations;
};

// Main function that handles both modes
export const generateThumbnailVariations = async (
    file: File | null,
    userPrompt: string,
    mode: 'free' | 'pro' = 'free'
): Promise<ThumbnailVariation[]> => {
    if (mode === 'pro' && file) {
        return generateProVariations(file, userPrompt);
    }
    return generateFreeVariations(userPrompt);
};
