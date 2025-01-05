"use server";

import { openai } from "@ai-sdk/openai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { streamText } from "ai";
import OpenAI from "openai";

const {
  OPENAI_API_KEY,
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION = "",
  ASTRA_DB_API_ENDPOINT = "",
  ASTRA_DB_APPLICATION_TOKEN,
} = process.env;

const chatgpt = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages?.length - 1]?.content;

    let docContext = "";

    const embedding = await chatgpt.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
      encoding_format: "float",
      dimensions: 1024,
    });

    try {
      const collection = await db.collection(ASTRA_DB_COLLECTION);
      const cursor = await collection.find(
        {},
        {
          sort: {
            $vector: embedding.data[0].embedding,
          },
          limit: 10,
        }
      );

      const documents = await cursor.toArray();
      const docsMap = documents?.map((doc) => doc.text);

      docContext = JSON.stringify(docsMap);
    } catch (error) {
      console.log("Something went wrong with collection", error);
    }

    const template = {
      role: "system",
      content: `You are a knowledgeable Assistant for Midwestern Career College (MCC). Your role is to provide accurate, helpful information to prospective and current students based on the following context.

Instructions:
- Provide detailed, accurate information based ONLY on the provided context
- If specific contact information (phone, email, location) is present in the context, include it in your response
- If specific contact information is NOT in the context, instead direct users to visit mccollege.edu or call the main campus
- Never use placeholder text like [Insert phone number]
- Present information in a clear, organized manner using proper formatting
- Be friendly and professional in your responses
- Focus on helping users find the information they need
- When discussing programs, include key details about requirements, duration, and career outcomes from the context
- For admissions-related questions, provide available guidance along with how to contact admissions
- If asked about costs, provide official tuition/fee information only if it's in the context
- DO NOT use any markdown formatting (no **, -, [], or other special characters)
- DO NOT use mailto: links or any other links

------------------
START CONTEXT
${docContext}
END CONTEXT
------------------
QUESTION: ${latestMessage}
------------------`,
    };

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: [template, ...messages],
      temperature: 0.3,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.log("Something went wrong with POST request", error);
  }
}
