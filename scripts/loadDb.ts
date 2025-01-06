"use server";

import { DataAPIClient } from "@datastax/astra-db-ts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import OpenAI from "openai";
// import { NextResponse } from "next/server";

import { JSONLoader } from "langchain/document_loaders/fs/json";

import "dotenv/config";

// type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

console.log("loadDb is working");

const {
  OPENAI_API_KEY,
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION = "",
  ASTRA_DB_API_ENDPOINT = "",
  ASTRA_DB_APPLICATION_TOKEN,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const file = "./assets/midwesterngpt_data.json";

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

// const createCollection = async (
//   similarityMetric: SimilarityMetric = "dot_product"
// ) => {
//   try {
//     const res = await db.createCollection(ASTRA_DB_COLLECTION, {
//       vector: {
//         dimension: 1536,
//         metric: similarityMetric,
//       },
//     });
//     console.log("res", res);
//   } catch (error) {
//     console.log("Something went wrong with createCollection", error);
//   }
// };

const scrapeData = async () => {
  try {
    const loader = new JSONLoader(file);
    const data = await loader.load();
    console.log("scrapeData success");
    return data;
  } catch (error) {
    console.log("Something went wrong with scrapeData", error);
  }
};

const loadData = async () => {
  try {
    const collection = db.collection(ASTRA_DB_COLLECTION);
    const content = await scrapeData();

    if (!content) {
      throw new Error("No content added from JSON file");
    }

    const text =
      typeof content === "string" ? content : JSON.stringify(content);
    // const text = JSON.stringify(content);
    const chunks = await splitter.splitText(text);
    for await (const chunk of chunks) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small", // 1024 dimensions
        // model: "text-embedding-ada-002", // 1536 dimensions
        input: chunk,
        encoding_format: "float",
        dimensions: 1024,
      });

      const vector = embedding.data[0].embedding;

      //   console.log("vector length", vector.length);

      const res = await collection.insertOne({
        $vector: vector,
        text: chunk,
      });
      console.log("res", res);
    }
  } catch (error) {
    console.log("Something went wrong with loadData", error);
  }
};

// createCollection().then(() => loadData());
loadData();
//   .then(() => console.log("Process completed successfully"))
//   .catch((error) => console.log("Process failed", error));
// scrapeData();
