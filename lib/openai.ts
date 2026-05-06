import OpenAI from "openai";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// Keep named export for backwards compat — lazy proxy
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getOpenAI() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const UI_FUNCTIONS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "generate_ui_card",
      description:
        "Generate a product or service card with image, title, description, price and CTA button",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Card title" },
          description: { type: "string", description: "Short description" },
          price: { type: "string", description: "Price if applicable" },
          imageUrl: { type: "string", description: "Image URL if available" },
          ctaText: { type: "string", description: "Call to action button text" },
          ctaUrl: { type: "string", description: "URL for the CTA button" },
        },
        required: ["title", "description", "ctaText"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_ui_gallery",
      description: "Generate a scrollable image gallery with caption",
      parameters: {
        type: "object",
        properties: {
          images: {
            type: "array",
            items: {
              type: "object",
              properties: {
                url: { type: "string" },
                alt: { type: "string" },
              },
            },
          },
          caption: { type: "string" },
        },
        required: ["images", "caption"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_ui_booking",
      description: "Show a booking button that opens a calendar",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", description: "Context message before booking button" },
          calUrl: { type: "string", description: "Cal.com booking URL" },
        },
        required: ["message"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_ui_pricing",
      description: "Display a pricing comparison table",
      parameters: {
        type: "object",
        properties: {
          plans: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                price: { type: "string" },
                features: { type: "array", items: { type: "string" } },
                highlighted: { type: "boolean" },
                ctaUrl: { type: "string" },
              },
            },
          },
        },
        required: ["plans"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_ui_contact",
      description: "Show a contact form for the visitor",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string" },
          fields: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                label: { type: "string" },
                type: { type: "string" },
                required: { type: "boolean" },
              },
            },
          },
        },
        required: ["message", "fields"],
      },
    },
  },
];
