// src/lib/api/fetchers/monday.ts
import { MondayItemsResponse } from "@domain-types/monday";
import { createApiSafeFetcher } from '@api/handlers/api-adapter';
import { VisitZodSchema } from "@zod-schema/visits/visit";
import { VisitModel } from "@mongoose-schema/visits/visit.model";

// For the standard resource fetching pattern (data from your MongoDB)
export const fetchMondayVisitsForApi = createApiSafeFetcher(
  VisitModel, // You'd need to import this
  VisitZodSchema, // You'd need to import this
  "mondayItemName" // Default search field
);

// Custom function for external Monday.com API (doesn't use createApiSafeFetcher)
export async function fetchExternalMondayItems(
  boardId: string,
  apiKey: string
): Promise<MondayItemsResponse> {
  const response = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
    },
    body: JSON.stringify({
      query: `
        query getItems($boardId: ID!) {
          boards(ids: [$boardId]) {
            items {
              id
              name
              column_values {
                id
                title
                text
                value
              }
            }
          }
        }
      `,
      variables: { boardId }
    }),
  });

  if (!response.ok) {
    throw new Error(`Monday API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`GraphQL error: ${data.errors[0].message}`);
  }
  
  return data.data;
}