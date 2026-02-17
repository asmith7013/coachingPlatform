"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { Drawer } from "@/components/composed/drawers/Drawer";
import { Text } from "@/components/core/typography/Text";
import {
  UserIcon,
  CogIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export default function DrawerDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"left" | "right">("right");
  const [size, setSize] = useState<"sm" | "md" | "lg" | "full">("md");
  const [background, setBackground] = useState<"white" | "gray">("white");

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Drawer Component Demo
          </h1>
          <Text textSize="lg" color="muted">
            Showcase of the atomic Drawer component with various configurations
          </Text>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="position"
                    value="right"
                    checked={position === "right"}
                    onChange={(e) => setPosition(e.target.value as "right")}
                    className="mr-2"
                  />
                  Right
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="position"
                    value="left"
                    checked={position === "left"}
                    onChange={(e) => setPosition(e.target.value as "left")}
                    className="mr-2"
                  />
                  Left
                </label>
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <div className="space-y-2">
                {(["sm", "md", "lg", "full"] as const).map((sizeOption) => (
                  <label key={sizeOption} className="flex items-center">
                    <input
                      type="radio"
                      name="size"
                      value={sizeOption}
                      checked={size === sizeOption}
                      onChange={(e) =>
                        setSize(e.target.value as typeof sizeOption)
                      }
                      className="mr-2"
                    />
                    {sizeOption.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>

            {/* Background */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="background"
                    value="white"
                    checked={background === "white"}
                    onChange={(e) => setBackground(e.target.value as "white")}
                    className="mr-2"
                  />
                  White
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="background"
                    value="gray"
                    checked={background === "gray"}
                    onChange={(e) => setBackground(e.target.value as "gray")}
                    className="mr-2"
                  />
                  Gray
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button intent="primary" onClick={openDrawer}>
              Open Drawer
            </Button>
          </div>
        </div>

        {/* Examples */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Usage Examples</h2>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Basic Usage</h3>
              <pre className="text-sm text-gray-600 overflow-x-auto">
                {`<Drawer open={isOpen} onClose={closeDrawer}>
  <Drawer.Header>
    <Drawer.Title>Drawer Title</Drawer.Title>
  </Drawer.Header>
  <Drawer.Body>
    <p>Drawer content goes here...</p>
  </Drawer.Body>
</Drawer>`}
              </pre>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">With Custom Props</h3>
              <pre className="text-sm text-gray-600 overflow-x-auto">
                {`<Drawer 
  open={isOpen} 
  onClose={closeDrawer}
  position="left"
  size="lg"
  background="gray"
  focusColor="blue"
>
  <Drawer.Header showCloseButton={false}>
    <Drawer.Title>Custom Drawer</Drawer.Title>
  </Drawer.Header>
  <Drawer.Body>
    <p>Custom drawer content...</p>
  </Drawer.Body>
</Drawer>`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Drawer */}
      <Drawer
        open={isOpen}
        onClose={closeDrawer}
        position={position}
        size={size}
        background={background}
        focusColor="indigo"
      >
        <Drawer.Header>
          <Drawer.Title>Demo Drawer</Drawer.Title>
        </Drawer.Header>

        <Drawer.Body>
          <div className="space-y-6">
            <div>
              <Text textSize="base" className="mb-2">
                This is a demo of the Drawer component with the following
                configuration:
              </Text>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Position: {position}</li>
                <li>• Size: {size}</li>
                <li>• Background: {background}</li>
                <li>• Focus Color: indigo</li>
              </ul>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Sample Content</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <Text textSize="sm" className="font-medium">
                      User Profile
                    </Text>
                    <Text textSize="xs" color="muted">
                      Manage your account settings
                    </Text>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CogIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <Text textSize="sm" className="font-medium">
                      Settings
                    </Text>
                    <Text textSize="xs" color="muted">
                      Configure application preferences
                    </Text>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <Text textSize="sm" className="font-medium">
                      Documentation
                    </Text>
                    <Text textSize="xs" color="muted">
                      View component documentation
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <Button intent="secondary" onClick={closeDrawer} fullWidth>
                Close Drawer
              </Button>
            </div>
          </div>
        </Drawer.Body>
      </Drawer>
    </div>
  );
}
