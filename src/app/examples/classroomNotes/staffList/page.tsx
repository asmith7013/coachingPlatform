"use client";

import React from "react";
import { DashboardPage } from '@/components/composed/layouts/DashboardPage';
import { Text } from '@/components/core/typography/Text';

export default function StaffListPage() {
  return (
    <DashboardPage 
      title="Staff List"
      description="Manage and view staff members."
    >
      <Text textSize="base">
        Staff list functionality coming soon...
      </Text>
    </DashboardPage>
  );
}
