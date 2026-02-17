"use client";

import React, { useState } from "react";
import { Button } from "@/components/core/Button";
import { Input } from "@/components/core/fields/Input";
import { Alert } from "@/components/core/feedback/Alert";
import {
  UnitScraperCredentials,
  ROADMAP_OPTIONS,
  RoadmapOption,
} from "../lib/types";

interface UnitScraperFormProps {
  onSubmit: (
    credentials: UnitScraperCredentials,
    roadmap: RoadmapOption,
    delay: number,
    delayBetweenUnits: number,
  ) => void;
  onDebugSubmit: (
    credentials: UnitScraperCredentials,
    roadmap: RoadmapOption,
    delay: number,
  ) => void;
  isLoading: boolean;
  error: string | null;
}

export function UnitScraperForm({
  onSubmit,
  onDebugSubmit,
  isLoading,
  error,
}: UnitScraperFormProps) {
  const [credentials, setCredentials] = useState<UnitScraperCredentials>({
    email: "alex.smith@teachinglab.org",
    password: "rbx1KQD3fpv7qhd!erc",
  });

  const [roadmap, setRoadmap] = useState<RoadmapOption>(ROADMAP_OPTIONS[0]);
  const [delay, setDelay] = useState(1000);
  const [delayBetweenUnits, setDelayBetweenUnits] = useState(2000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(credentials, roadmap, delay, delayBetweenUnits);
  };

  const handleDebugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDebugSubmit(credentials, roadmap, Math.max(delay, 1500));
  };

  const isFormValid = credentials.email && credentials.password && roadmap;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Teach to One Roadmaps Batch Unit Scraper
        </h2>
        <p className="text-sm text-gray-600">
          Select a roadmap (grade level) to automatically scrape ALL units
          within it
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Credentials Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Authentication</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="your.email@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              placeholder="Enter your password"
              required
            />
          </div>
        </div>

        {/* Roadmap Selection Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Roadmap Selection
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Roadmap (Grade Level)
            </label>
            <select
              value={roadmap}
              onChange={(e) => setRoadmap(e.target.value as RoadmapOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {ROADMAP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              All units in the selected roadmap will be scraped automatically
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>How it works:</strong> The scraper will navigate to the
              units page, select your chosen roadmap, then automatically loop
              through and scrape every available unit in that roadmap.
            </p>
          </div>
        </div>

        {/* Settings Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Delay Before Extraction (ms)"
              type="number"
              value={delay}
              onChange={(e) => setDelay(parseInt(e.target.value) || 1000)}
              min={500}
              max={10000}
              step={500}
              helpText="Time to wait after selecting unit"
            />

            <Input
              label="Delay Between Units (ms)"
              type="number"
              value={delayBetweenUnits}
              onChange={(e) =>
                setDelayBetweenUnits(parseInt(e.target.value) || 2000)
              }
              min={500}
              max={10000}
              step={500}
              helpText="Time to wait between scraping units"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert intent="error">
            <Alert.Title>Scraping Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            intent="primary"
            fullWidth={false}
          >
            {isLoading ? "Scraping Units..." : "Scrape All Units in Roadmap"}
          </Button>

          <Button
            type="button"
            onClick={handleDebugSubmit}
            disabled={!isFormValid || isLoading}
            intent="secondary"
            appearance="outline"
            fullWidth={false}
          >
            Debug Mode (First 2 Units)
          </Button>
        </div>
      </form>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Enter your Teach to One Roadmaps login credentials</li>
          <li>• Select a roadmap (grade level) from the dropdown</li>
          <li>
            • Click &quot;Scrape All Units in Roadmap&quot; to begin batch
            scraping
          </li>
          <li>
            • The scraper will automatically process all units in the selected
            roadmap
          </li>
          <li>
            • Use &quot;Debug Mode&quot; to test with just the first 2 units and
            keep browser open
          </li>
          <li>• Results will be displayed below and can be exported as JSON</li>
        </ul>
      </div>
    </div>
  );
}
