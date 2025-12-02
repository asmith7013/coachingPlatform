import { NextRequest, NextResponse } from 'next/server';
import { withDbConnection } from '@server/db/ensure-connection';
import { WorkedExampleDeck } from '@mongoose-schema/worked-example-deck.model';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  return withDbConnection(async () => {
    try {
      const deck = await WorkedExampleDeck.findOne({
        slug: params.slug,
        presentationType: 'html',
      });

      if (!deck) {
        return NextResponse.json(
          { success: false, error: 'HTML deck not found' },
          { status: 404 }
        );
      }

      // Check if deck is public or user has access
      // For now, we'll allow all access to public decks
      if (!deck.isPublic) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: deck.toJSON(),
      });
    } catch (error) {
      console.error('Error fetching HTML deck:', error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
