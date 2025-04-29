// src/lib/api/integrations/monday/queries.ts
export const BOARD_QUERY = `
  query getBoard($boardId: ID!) {
    boards(ids: [$boardId]) {
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

export const ITEMS_QUERY = `
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
`;

export const WORKSPACES_QUERY = `
  query {
    workspaces {
      id
      name
    }
  }
`;

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

export const BOARD_ITEMS_QUERY = `
  query getBoardItems($boardId: ID!, $limit: Int) {
    boards(ids: [$boardId]) {
      items(limit: $limit) {
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
`; 