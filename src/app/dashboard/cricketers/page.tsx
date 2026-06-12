"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CricketersTable } from "@/components/cricketers/CricketersTable";

export default function CricketersPage() {
  return (
    <DashboardLayout title="Cricketers">
      <div className="space-y-8">
        <div className="page-header">
          <div>
            <h2 className="page-title">Cricketers</h2>
            <p className="page-subtitle">
              View and manage all registered cricket players
            </p>
          </div>
        </div>
        <CricketersTable />
      </div>
    </DashboardLayout>
  );
}
