import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export interface ThumbnailVariation {
    id: string;
    url: string;
    promptUsed: string;
}

export const generateThumbnailVariations = async (
    file: File,
    userPrompt: string
): Promise<ThumbnailVariation[]> => {
    const apiKey = localStorage.getItem("google_gemini_api_key");
    if (!apiKey) {
        throw new Error("API Key not found. Please provide it in the input at the top right.");
    }

    console.log("Starting thumbnail generation...");

    const google = createGoogleGenerativeAI({
        apiKey,
    });

    // Convert file to base64 for vision processing
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
    const base64Content = await base64Promise;
    console.log("Image converted to base64");

    // Step 1: Use Gemini to analyze the image and generate 3 creative prompts
    console.log("Analyzing image with Gemini...");
    const analysisResult = await generateText({
        model: google('gemini-2.0-flash'),
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Analyze this image and the user's request: "${userPrompt}".
                        
Generate exactly 3 highly detailed image generation prompts for creating stunning YouTube thumbnails.

Each prompt should be:
- Extremely detailed and descriptive (50-100 words)
- Focused on creating a visually striking thumbnail
- Include style, lighting, colors, composition details
- Based on the uploaded image's subject matter

Output ONLY the 3 prompts, each on its own paragraph, separated by "---". No numbering, no preamble.`
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

    // Parse the prompts
    const generatedPrompts = analysisResult.text
        .split('---')
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .slice(0, 3);

    // Fallback prompts
    while (generatedPrompts.length < 3) {
        generatedPrompts.push(`Professional YouTube thumbnail: ${userPrompt}, vibrant colors, dramatic lighting, 4K quality`);
    }

    console.log("Generated prompts:", generatedPrompts);

    // Step 2: Generate images using Pollinations.ai (free, no API key needed)
    const variations: ThumbnailVariation[] = [];

    for (let i = 0; i < generatedPrompts.length; i++) {
        try {
            console.log(`Generating image ${i + 1} with Pollinations...`);
            const prompt = encodeURIComponent(generatedPrompts[i]);
            const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1280&height=720&nologo=true&seed=${Date.now() + i}`;

            variations.push({
                id: `var-${i}-${Date.now()}`,
                url: imageUrl,
                promptUsed: generatedPrompts[i],
            });
        } catch (error) {
            console.error(`Error generating image ${i + 1}:`, error);
        }
    }

    console.log(`Generated ${variations.length} variations`);
    return variations;
};
