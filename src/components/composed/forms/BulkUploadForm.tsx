/**
 * ⛳ Missing Atomic Components:
 * - <Heading /> - Need to create this component
 * - <Text /> - Need to create this component
 * - <Card /> - Need to create this component
 *
 * ⛳ Missing Token Mappings:
 * - shadow-md -> Need to add shadow tokens
 * - border-b -> Need to add border utility tokens
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/composed/cards/Card";
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";
import { Input } from "@/components/core/fields/Input";

interface BulkUploadFormProps {
  title: string;
  description?: string;
  onUpload: (file: File) => Promise<string>;
  accept?: string;
  disabled?: boolean;
}

export default function BulkUploadForm({
  title,
  description,
  onUpload,
  accept = ".csv",
  disabled = false,
}: BulkUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadMessage = await onUpload(file);
      setMessage(uploadMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <Card shadow="md" padding="md" className="bg-primary">
        <div className="space-y-4">
          <Heading level="h3">{title}</Heading>
          {description && (
            <Text textSize="base" color="default">
              {description}
            </Text>
          )}
          <Input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading || disabled}
            textSize="base"
            padding="md"
            className="w-full"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
          {message && (
            <Text
              textSize="base"
              color={
                message.toLowerCase().includes("successful")
                  ? "accent"
                  : "danger"
              }
            >
              {message}
            </Text>
          )}
        </div>
      </Card>
    </div>
  );
}
