"use client";

import { useState } from "react";
import { Dialog } from "@/components/composed/dialogs/Dialog";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

interface DeprecationLink {
  label: string;
  url: string;
}

interface DeprecationModalProps {
  links: DeprecationLink[];
}

export function DeprecationModal({ links }: DeprecationModalProps) {
  const [open, setOpen] = useState(true);

  if (process.env.NODE_ENV !== "production") return null;

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="This page has moved"
      size="sm"
    >
      <p className="mb-4 text-gray-600">
        This dashboard is now maintained on Podsie. Please use the new version
        for the latest features and updates.
      </p>
      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            {link.label}
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </a>
        ))}
      </div>
    </Dialog>
  );
}
