"use client";

import React from "react";
import { IMCredentials } from "../lib/types";

interface CredentialsFormProps {
  credentials: IMCredentials;
  onCredentialsChange: (credentials: IMCredentials) => void;
}

export function CredentialsForm({
  credentials,
  onCredentialsChange,
}: CredentialsFormProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        IM Platform Credentials
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={credentials.email}
            onChange={(e) =>
              onCredentialsChange({ ...credentials, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@teachinglab.org"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) =>
              onCredentialsChange({ ...credentials, password: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your password"
          />
        </div>
      </div>
    </div>
  );
}
