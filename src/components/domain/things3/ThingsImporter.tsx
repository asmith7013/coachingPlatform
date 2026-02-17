"use client";

import { useState } from "react";
import { Card } from "@/components/composed/cards/Card";
import { Button } from "@/components/core/Button";
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";
import { PageHeader } from "@/components/composed/layouts/PageHeader";

import {
  ThingsChecklist,
  Notification as NotificationType,
} from "@domain-types/things3-types";
import {
  parseTextToJSON,
  generateThingsURL,
  getSampleData,
} from "./thingsUtils";
import { ProjectDetailsForm } from "./ProjectDetailsForm";
import { ChecklistInput } from "./ChecklistInput";
import { GeneratedUrlDisplay } from "./GeneratedUrlDisplay";
import { Notification } from "./Notification";

export default function ThingsImporter() {
  // State for form inputs
  const [projectTitle, setProjectTitle] = useState<string>("");
  const [projectNotes, setProjectNotes] = useState<string>("");
  const [projectWhen, setProjectWhen] = useState<string>("anytime");
  const [checklistInput, setChecklistInput] = useState<string>("");
  const [jsonInput, setJsonInput] = useState<string>("");
  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const [inputMode, setInputMode] = useState<"text" | "json">("text");
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationType>({
    title: "",
    message: "",
    type: "info",
  });

  // Simple notification function as a toast replacement
  const showMessage = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setNotification({ title, message, type });
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Process checklist and generate Things 3 URL
  const processChecklist = () => {
    try {
      let checklist: ThingsChecklist;

      if (inputMode === "json") {
        // Parse JSON input
        if (!jsonInput.trim()) {
          showMessage(
            "Missing Content",
            "Please enter JSON data first!",
            "error",
          );
          return;
        }

        try {
          // IMPORTANT: First parse the JSON to get the JavaScript object
          const jsonData = JSON.parse(jsonInput);

          // Make sure we're working with the parsed object, not the string
          checklist = jsonData;

          // Apply project details if specified
          if (projectTitle) checklist.title = projectTitle;
          if (projectNotes) checklist.notes = projectNotes;
          if (projectWhen) checklist.when = projectWhen;
        } catch (err) {
          showMessage(
            "Invalid JSON",
            "The JSON data is not valid. Please check the format.",
            "error",
          );
          console.error(err);
          return;
        }
      } else {
        // Parse text input
        if (!checklistInput.trim()) {
          showMessage(
            "Missing Content",
            "Please paste your checklist first!",
            "error",
          );
          return;
        }

        checklist = parseTextToJSON(
          checklistInput,
          projectTitle,
          projectNotes,
          projectWhen,
        );
      }

      // Generate the URL from the parsed JavaScript object
      const thingsUrl = generateThingsURL(checklist);
      setGeneratedUrl(thingsUrl);

      // Also convert to JSON and update JSON input if we're in text mode
      if (inputMode === "text") {
        setJsonInput(JSON.stringify(checklist, null, 2));
      }

      showMessage(
        "URL Generated",
        "Your Things 3 import URL has been created",
        "success",
      );
    } catch (error) {
      showMessage(
        "Error",
        "Failed to process checklist: " + (error as Error).message,
        "error",
      );
      console.log("Error details:", error);
    }
  };

  // Open the Things 3 app with the generated URL
  const openInThings = () => {
    if (!generatedUrl) {
      processChecklist();
      setTimeout(() => {
        window.location.href = generatedUrl;
      }, 100);
    } else {
      window.location.href = generatedUrl;
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = () => {
    if (!generatedUrl) {
      processChecklist();
      setTimeout(() => {
        navigator.clipboard
          .writeText(generatedUrl)
          .then(() => {
            showMessage("Copied!", "URL copied to clipboard", "success");
          })
          .catch((_err) => {
            showMessage("Error", "Failed to copy URL", "error");
          });
      }, 100);
    } else {
      navigator.clipboard
        .writeText(generatedUrl)
        .then(() => {
          showMessage("Copied!", "URL copied to clipboard", "success");
        })
        .catch((_err) => {
          showMessage("Error", "Failed to copy URL", "error");
        });
    }
  };

  // Load sample data
  const loadSampleData = () => {
    const sample = getSampleData();
    setProjectTitle(sample.title);
    setProjectNotes(sample.notes);
    setChecklistInput(sample.textFormat);
    setJsonInput(JSON.stringify(sample.jsonFormat, null, 2));
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Things 3 Importer"
        subtitle="Create Things 3 projects from structured data"
      />

      <Notification notification={notification} show={showNotification} />

      <Card>
        <Heading level="h2">Create Things 3 Project</Heading>
        <Text>
          Convert your checklist into a Things 3 project with sections and
          tasks.
        </Text>

        <ProjectDetailsForm
          projectTitle={projectTitle}
          setProjectTitle={setProjectTitle}
          projectNotes={projectNotes}
          setProjectNotes={setProjectNotes}
          projectWhen={projectWhen}
          setProjectWhen={setProjectWhen}
        />

        <ChecklistInput
          inputMode={inputMode}
          setInputMode={setInputMode}
          checklistInput={checklistInput}
          setChecklistInput={setChecklistInput}
          jsonInput={jsonInput}
          setJsonInput={setJsonInput}
          loadSampleData={loadSampleData}
        />

        <GeneratedUrlDisplay url={generatedUrl} />

        <div className="flex space-x-4 mt-6">
          <Button onClick={processChecklist}>Generate URL</Button>
          <Button onClick={openInThings} intent="secondary">
            Open in Things 3
          </Button>
          <Button
            onClick={copyToClipboard}
            intent="secondary"
            appearance="outline"
          >
            Copy URL
          </Button>
        </div>
      </Card>
    </div>
  );
}
