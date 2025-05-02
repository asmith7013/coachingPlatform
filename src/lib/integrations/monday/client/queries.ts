// src/lib/integrations/monday/client/queries.ts

/**
 * Centralized GraphQL queries for Monday.com API
 * All Monday.com GraphQL queries should be defined here to avoid duplication
 */

// Basic board query to get board details and columns
export const BOARD_QUERY = `
  query getBoard($boardId: ID!) {
    boards(ids: [$boardId]) {
      id
      name
      description
      workspace {
        id
        name
      }
      columns {
        id
        title
        type
        settings_str
      }
    }
  }
`;

// Items query with pagination for getting board items
export const ITEMS_QUERY = `
  query getItems($boardId: ID!) {
    boards(ids: [$boardId]) {
      items_page {
        cursor
        items {
          id
          name
          state
          board {
            id
          }
          column_values {
            id
            text
            value
            type
          }
        }
      }
    }
  }
`;

// Get a single item by ID - useful for fetch one selected item
export const ITEM_BY_ID_QUERY = `
  query getItemById($itemId: ID!) {
    items(ids: [$itemId]) {
      id
      name
      state
      board {
        id
        name
        columns {
          id
          title
          type
        }
      }
      column_values {
        id
        text
        value
        type
      }
    }
  }
`;

// Get all workspaces the user has access to
export const WORKSPACES_QUERY = `
  query {
    workspaces {
      id
      name
    }
  }
`;

// Get boards in a workspace
export const BOARDS_BY_WORKSPACE_QUERY = `
  query boardsByWorkspace($workspaceId: ID!) {
    boards(workspace_ids: [$workspaceId]) {
      id
      name
      columns {
        id
        title
        type
      }
    }
  }
`;

// Get board items with pagination control
export const BOARD_ITEMS_QUERY = `
  query getBoardItems($boardId: ID!, $limit: Int) {
    boards(ids: [$boardId]) {
      items_page(limit: $limit) {
        cursor
        items {
          id
          name
          state
          column_values {
            id
            text
            value
            type
          }
        }
      }
    }
  }
`;

// Get next page of items using a cursor
export const NEXT_ITEMS_PAGE_QUERY = `
  query getNextItemsPage($cursor: String!, $limit: Int) {
    next_items_page(cursor: $cursor, limit: $limit) {
      cursor
      items {
        id
        name
        state
        column_values {
          id
          text
          value
          type
        }
      }
    }
  }
`;

// Get full board details with items in a single query
export const BOARD_WITH_ITEMS_QUERY = `
  query getBoardWithItems($boardId: ID!, $itemLimit: Int) {
    boards(ids: [$boardId]) {
      id
      name
      description
      workspace {
        id
        name
      }
      columns {
        id
        title
        type
        settings_str
      }
      items_page(limit: $itemLimit) {
        cursor
        items {
          id
          name
          state
          column_values {
            id
            text
            value
            type
          }
        }
      }
    }
  }
`;

// Get user information by ID
export const USER_BY_ID_QUERY = `
  query getUserById($userId: ID!) {
    users(ids: [$userId]) {
      id
      name
      email
      photo_thumb_small
    }
  }
`;

// Get user information by email
export const USER_BY_EMAIL_QUERY = `
  query getUserByEmail($email: String!) {
    users(emails: [$email]) {
      id
      name
      email
      photo_thumb_small
    }
  }
`;