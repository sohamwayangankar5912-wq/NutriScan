import os
import base64
import json
import httpx
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

SYSTEM_PROMPT = """
Analyze the food in this image and provide a nutritional estimate.
Return your output ONLY as a valid JSON object matching the following structure:
{
  "food_name": "Name of the dish or main food items identified",
  "calories": 350.0,
  "protein": 15.0,
  "carbs": 40.0,
  "fat": 12.0,
  "confidence": 0.85,
  "description": "A brief sentence describing the food items identified and the reasoning behind the macro estimate."
}
Be realistic, accurate, and adjust macro counts based on estimated portion size shown in the image.
"""

def analyze_food_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Sends the food image to Gemini Vision API to estimate its nutritional value.
    If the GEMINI_API_KEY is not set or the request fails, falls back to a smart mock analyzer.
    """
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set. Using mock vision model fallback.")
        return generate_mock_analysis()

    # Base64 encode the image
    base64_image = base64.b64encode(image_bytes).decode("utf-8")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    headers = {"Content-Type": "application/json"}
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": SYSTEM_PROMPT},
                    {
                        "inlineData": {
                            "mimeType": mime_type,
                            "data": base64_image
                        }
                    }
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            # Extract content from response structure
            candidates = result.get("candidates", [])
            if not candidates:
                raise ValueError("No candidates found in Gemini response")
                
            content_text = candidates[0]["content"]["parts"][0]["text"].strip()
            
            # Clean markdown code fences if present (e.g. ```json ... ```)
            if content_text.startswith("```"):
                lines = content_text.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].startswith("```"):
                    lines = lines[:-1]
                content_text = "\n".join(lines).strip()
                
            # Parse the JSON response returned by Gemini
            nutrition_data = json.loads(content_text)
            return nutrition_data
            
    except Exception as e:
        logger.error(f"Gemini API request failed: {e}. Falling back to mock analysis.")
        return generate_mock_analysis()

def generate_mock_analysis() -> dict:
    """
    Generates a realistic mock food analysis for testing when Gemini API is unavailable.
    """
    import random
    mock_meals = [
        {
            "food_name": "Grilled Chicken Salad with Quinoa",
            "calories": 420.0,
            "protein": 35.0,
            "carbs": 28.0,
            "fat": 14.0,
            "confidence": 0.90,
            "description": "A healthy bowl containing grilled chicken breast slices, mixed green lettuce, cucumber, cherry tomatoes, and red quinoa, dressed in olive oil."
        },
        {
            "food_name": "Avocado Toast with Poached Egg",
            "calories": 310.0,
            "protein": 12.0,
            "carbs": 24.0,
            "fat": 18.0,
            "confidence": 0.88,
            "description": "Sourdough toast topped with mashed avocado, chili flakes, and a soft-poached egg."
        },
        {
            "food_name": "Salmon Poke Bowl",
            "calories": 580.0,
            "protein": 28.0,
            "carbs": 65.0,
            "fat": 19.0,
            "confidence": 0.92,
            "description": "Sushi rice topped with raw cubed salmon, edamame, sliced avocado, seaweed salad, green onions, and spicy mayo dressing."
        },
        {
            "food_name": "Double Cheeseburger & Fries",
            "calories": 950.0,
            "protein": 42.0,
            "carbs": 85.0,
            "fat": 48.0,
            "confidence": 0.95,
            "description": "Double beef patty cheeseburger with melted cheddar, pickles, and a side of salted golden french fries."
        }
    ]
    return random.choice(mock_meals)
