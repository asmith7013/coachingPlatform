"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import {
  Card,
  TextInput,
  Button,
  Text,
  Title,
  Stack,
  Divider,
  Alert,
  Center,
} from "@mantine/core";
import { IconMail, IconCheck, IconBrandGoogle } from "@tabler/icons-react";
import { MantineShell } from "../../_components/MantineShell";

export default function SkillsHubSignInPage() {
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleMagicLink = async () => {
    if (!isLoaded || !signIn || !email.trim()) return;

    setStatus("sending");
    setErrorMessage("");

    try {
      await signIn.create({
        strategy: "email_link",
        identifier: email.trim(),
        redirectUrl: `${window.location.origin}/skillsHub`,
      });
      setStatus("sent");
    } catch (err: unknown) {
      setStatus("error");
      const message =
        err instanceof Error ? err.message : "Failed to send magic link";
      setErrorMessage(message);
    }
  };

  const handleGoogleSignIn = () => {
    if (!isLoaded || !signIn) return;

    signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/skillsHub",
    });
  };

  return (
    <MantineShell>
      <Center mih="100vh" bg="gray.0">
        <Card shadow="md" p="xl" w={420} radius="md" withBorder>
          <Stack gap="lg">
            <div>
              <Title order={2} ta="center">
                Skills Hub
              </Title>
              <Text c="dimmed" ta="center" size="sm" mt={4}>
                Sign in to access your skill dashboard
              </Text>
            </div>

            {status === "sent" ? (
              <Alert
                icon={<IconCheck size={16} />}
                title="Check your email"
                color="teal"
              >
                We sent a sign-in link to <strong>{email}</strong>. Click the
                link in the email to sign in.
              </Alert>
            ) : (
              <>
                <TextInput
                  label="Email address"
                  placeholder="you@school.edu"
                  leftSection={<IconMail size={16} />}
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleMagicLink();
                  }}
                  error={status === "error" ? errorMessage : undefined}
                />

                <Button
                  fullWidth
                  onClick={handleMagicLink}
                  loading={status === "sending"}
                  disabled={!email.trim() || !isLoaded}
                >
                  Send Magic Link
                </Button>

                <Divider label="Or sign in with" labelPosition="center" />

                <Button
                  fullWidth
                  variant="default"
                  leftSection={<IconBrandGoogle size={18} />}
                  onClick={handleGoogleSignIn}
                  disabled={!isLoaded}
                >
                  Sign in with Google
                </Button>
              </>
            )}

            <Text size="xs" c="dimmed" ta="center">
              By signing in, you agree to our{" "}
              <a href="/terms" style={{ color: "var(--mantine-color-teal-7)" }}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                style={{ color: "var(--mantine-color-teal-7)" }}
              >
                Privacy Policy
              </a>
            </Text>
          </Stack>
        </Card>
      </Center>
    </MantineShell>
  );
}
