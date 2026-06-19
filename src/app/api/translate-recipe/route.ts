import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, ingredients, steps, points } = body;

    if (!process.env.DEEPL_API_KEY) {
      return NextResponse.json(
        { error: "Translation API key is not configured." },
        { status: 400 }
      );
    }

    // Flatten all strings to translate in stable order
    const textsToTranslate = [
      title,
      description,
      ...(ingredients || []),
      ...(steps || []),
      ...(points || []),
    ];

    if (textsToTranslate.length === 0) {
      return NextResponse.json({
        titleEn: "",
        descriptionEn: "",
        ingredientsEn: [],
        stepsEn: [],
        pointsEn: [],
      });
    }

    const response = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: textsToTranslate,
        source_lang: "JA",
        target_lang: "EN-US",
        context: "Cafe drink recipe for staff training. Keep recipe terms clear and practical.",
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `DeepL API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    interface DeepLTranslation {
      text: string;
    }

    interface DeepLResponse {
      translations: DeepLTranslation[];
    }

    const deeplData: DeepLResponse = await response.json();
    const translations = deeplData.translations.map((t) => t.text);

    // Reconstruct the response based on original structure
    const ingredientsCount = ingredients?.length || 0;
    const stepsCount = steps?.length || 0;
    const pointsCount = points?.length || 0;

    let index = 0;

    const result = {
      titleEn: translations[index] || "",
      descriptionEn: translations[++index] || "",
      ingredientsEn: translations.slice(++index, index + ingredientsCount) || [],
      stepsEn: translations.slice(index + ingredientsCount, index + ingredientsCount + stepsCount) || [],
      pointsEn: translations.slice(
        index + ingredientsCount + stepsCount,
        index + ingredientsCount + stepsCount + pointsCount
      ) || [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Translation failed. Please try again." },
      { status: 500 }
    );
  }
}
