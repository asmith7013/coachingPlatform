// src/lib/types/domain/monday.ts
export interface MondayBoard {
    id: string;
    name: string;
    columns: MondayColumn[];
  }
  
  export interface MondayColumn {
    id: string;
    title: string;
    type: string;
  }
  
  export interface MondayItem {
    id: string;
    name: string;
    column_values: MondayColumnValue[];
  }
  
  export interface MondayColumnValue {
    id: string;
    text: string | null;
    value: string | null; // JSON string for complex values
  }
  
  export interface MondayBoardResponse {
    boards: MondayBoard[];
  }
  
  export interface MondayItemsResponse {
    boards: {
      items: MondayItem[];
    }[];
  }