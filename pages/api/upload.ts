import type { NextApiRequest, NextApiResponse } from 'next';
import { Document } from 'langchain/document';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Embeddings, OpenAIEmbeddings } from 'langchain/embeddings';
import { SupabaseVectorStore } from 'langchain/vectorstores';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { supabaseClient } from '@/utils/supabase-client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    console.log(req.body);

    const { pageContent, metadata } = req.body;

    if (!pageContent) {
      return res.status(400).json({ message: 'No question in the request' });
    }

    async function extractData(): Promise<Document[]> {
      return [new Document(req.body)];
    }

    async function embedDocuments(
      client: SupabaseClient,
      docs: Document[],
      embeddings: Embeddings,
    ) {
      console.log('creating embeddings...');
      await SupabaseVectorStore.fromDocuments(client, docs, embeddings);
      console.log('embeddings successfully stored in supabase');
    }

    async function splitDocsIntoChunks(docs: Document[]): Promise<Document[]> {
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 2000,
        chunkOverlap: 200,
      });
      return await textSplitter.splitDocuments(docs);
    }

    try {
      //load data from each url
      const rawDocs = await extractData();
      console.log('success!', rawDocs);

      //split docs into chunks for openai context window
      const docs = await splitDocsIntoChunks(rawDocs);
      //embed docs into supabase
      await embedDocuments(supabaseClient, docs, new OpenAIEmbeddings());
      console.log('success!', rawDocs);
    } catch (error) {
      console.log('error occured:', error);
    }

    res.status(200).json({ status: 'Received' });
  } else {
    res.status(400).json({ status: 'Only POST requests are accepted' });
  }
}
