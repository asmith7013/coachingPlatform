import { Alert, Button, Stack, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

export function MantineErrorFallback(error: Error, resetError: () => void) {
  return (
    <Alert
      icon={<IconAlertTriangle size={16} />}
      title="Something went wrong"
      color="red"
      variant="light"
    >
      <Stack gap="sm">
        <Text size="sm">{error.message || "An unexpected error occurred"}</Text>
        <Button size="xs" variant="light" color="red" onClick={resetError}>
          Try Again
        </Button>
      </Stack>
    </Alert>
  );
}
