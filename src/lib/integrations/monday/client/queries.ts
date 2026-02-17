/**
 * Monday.com GraphQL Queries
 *
 * This file contains all GraphQL queries and mutations used for
 * the Monday.com integration. Centralizing these helps maintain consistency
 * and makes updates easier.
 */

// Get all workspaces
export const WORKSPACES_QUERY = `
  query {
    workspaces {
      id
      name
    }
  }
`;

// Get boards by workspace
export const BOARDS_BY_WORKSPACE_QUERY = `
  query GetBoardsByWorkspace($workspaceId: ID!) {
    boards(workspace_ids: [$workspaceId], limit: 100) {
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

// Get a board with items
export const BOARD_WITH_ITEMS_QUERY = `
  query GetBoard($boardId: ID!, $itemLimit: Int!) {
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
          board_id
          state
          column_values {
            id
            title
            text
            value
          }
        }
      }
    }
  }
`;

// Get a board without items (for columns)
export const BOARD_QUERY = `
  query GetBoardColumns($boardId: ID!) {
    boards(ids: [$boardId]) {
      id
      name
      columns {
        id
        title
        type
        settings_str
      }
    }
  }
`;

// Get items from a board
export const ITEMS_QUERY = `
  query GetItems($boardId: ID!) {
    boards(ids: [$boardId]) {
      items_page(limit: 100) {
        items {
          id
          name
          board_id
          state
          column_values {
            id
            title
            text
            value
          }
        }
      }
    }
  }
`;

// Get an item by ID
export const ITEM_BY_ID_QUERY = `
  query GetItemById($itemId: ID!) {
    items(ids: [$itemId]) {
      id
      name
      board_id
      state
      column_values {
        id
        title
        text
        value
      }
    }
  }
`;

// Get a user by ID
export const USER_BY_ID_QUERY = `
  query GetUserById($userId: ID!) {
    users(ids: [$userId]) {
      id
      name
      email
    }
  }
`;

// Get a user by email
export const USER_BY_EMAIL_QUERY = `
  query GetUserByEmail($email: String!) {
    users(email: $email) {
      id
      name
      email
    }
  }
`;

// Update an item's column values
export const UPDATE_ITEM_MUTATION = `
  mutation UpdateItem($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
    change_multiple_column_values(
      board_id: $boardId,
      item_id: $itemId,
      column_values: $columnValues
    ) {
      id
    }
  }
`;

// Create a new item
export const CREATE_ITEM_MUTATION = `
  mutation CreateItem($boardId: ID!, $itemName: String!, $columnValues: JSON) {
    create_item(
      board_id: $boardId,
      item_name: $itemName,
      column_values: $columnValues
    ) {
      id
    }
  }
`;

// Archive an item
export const ARCHIVE_ITEM_MUTATION = `
  mutation ArchiveItem($itemId: ID!) {
    archive_item(item_id: $itemId) {
      id
    }
  }
`;
