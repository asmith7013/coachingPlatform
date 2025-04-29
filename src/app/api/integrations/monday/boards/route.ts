import { NextResponse } from 'next/server';
import { mondayClient } from '@/app/api/integrations/monday/client';
import { StandardResponse } from '@/lib/types/core/response';

const BOARDS_QUERY = `
  query {
    boards {
      id
      name
    }
  }
`;

interface MondayApiResponse {
  boards: Array<{
    id: string;
    name: string;
  }>;
}

interface MondayBoard {
  _id: string;
  label: string;
}

export async function GET(): Promise<NextResponse<StandardResponse<MondayBoard>>> {
  try {
    const response = await mondayClient.query<MondayApiResponse>(BOARDS_QUERY);
    
    if (!response || !response.boards) {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to fetch boards", 
        items: [] 
      });
    }
    
    const boards = response.boards.map((board) => ({
      _id: board.id,
      label: board.name
    }));
    
    return NextResponse.json({ 
      success: true, 
      items: boards, 
      total: boards.length 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message, 
      items: [] 
    });
  }
} 