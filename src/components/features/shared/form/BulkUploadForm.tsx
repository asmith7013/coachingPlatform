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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { Input } from "@/components/ui/fields/Input";
import { shadows, spacingY, typography, textColors, backgroundColors } from "@/lib/ui/tokens";
import { cn } from "@/lib/utils";

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
      <Card className={cn(shadows.md, spacingY.md, backgroundColors.primary)}>
        <div className={spacingY.md}>
          <Heading level="h3">{title}</Heading>
          {description && (
            <Text variant="secondary" className={typography.text.base}>
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
            variant="primary"
            size="md"
            className="w-full"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
          {message && (
            <Text 
              variant="primary"
              className={cn(
                typography.text.base,
                message.toLowerCase().includes("successful") 
                  ? textColors.success 
                  : textColors.danger
              )}
            >
              {message}
            </Text>
          )}
        </div>
      </Card>
    </div>
  );
}
