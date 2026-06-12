"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Download,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { CricketerForm } from "@/components/forms/CricketerForm";
import { CricketersFilterBar } from "@/components/cricketers/CricketersFilterBar";
import { useToast } from "@/components/providers/ToastProvider";
import {
  CRICKET_CATEGORIES,
  CAPTAINCY_INTEREST,
  REGISTRATION_SOURCES,
} from "@/lib/constants";
import { formatFullName } from "@/lib/validation";
import { formatDate } from "@/lib/utils";
import type { CricketerFormData } from "@/lib/validation";

interface Cricketer {
  _id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  address: string;
  age?: number;
  contact_number_1: string;
  contact_number_2?: string;
  jersey_size?: string;
  jersey_number?: number;
  jersey_name?: string;
  cricket_categories: string[];
  capacity_roles?: string[];
  registration_source?: string;
  created_at: string;
}

interface Pagination {
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export function CricketersTable() {
  const { showToast } = useToast();
  const [cricketers, setCricketers] = useState<Cricketer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchMobile, setSearchMobile] = useState("");
  const [category, setCategory] = useState("");
  const [capacityRole, setCapacityRole] = useState("");
  const [registrationSource, setRegistrationSource] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewCricketer, setViewCricketer] = useState<Cricketer | null>(null);
  const [editCricketer, setEditCricketer] = useState<Cricketer | null>(null);
  const [deleteCricketer, setDeleteCricketer] = useState<Cricketer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const fetchCricketers = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          sortOrder,
        });
        if (searchName) params.set("searchName", searchName);
        if (searchMobile) params.set("searchMobile", searchMobile);
        if (category) params.set("category", category);
        if (capacityRole) params.set("capacityRole", capacityRole);
        if (registrationSource) params.set("registrationSource", registrationSource);

        const res = await fetch(`/api/cricketers?${params}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        setCricketers(data.data);
        setPagination(data.pagination);
      } catch {
        showToast("Failed to load cricketers", "error");
      } finally {
        setLoading(false);
      }
    },
    [
      searchName,
      searchMobile,
      category,
      capacityRole,
      registrationSource,
      sortOrder,
      showToast,
    ]
  );

  useEffect(() => {
    const timer = setTimeout(() => fetchCricketers(1), 300);
    return () => clearTimeout(timer);
  }, [fetchCricketers]);

  const handleDelete = async () => {
    if (!deleteCricketer) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cricketers/${deleteCricketer._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      showToast("Cricketer deleted successfully", "success");
      setDeleteCricketer(null);
      fetchCricketers(pagination.page);
    } catch {
      showToast("Failed to delete cricketer", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async (format: "xlsx" | "csv" | "pdf") => {
    setExporting(format);
    try {
      const res = await fetch(`/api/export?format=${format}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cricketers-${Date.now()}.${format === "xlsx" ? "xlsx" : format}`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`${format.toUpperCase()} export downloaded`, "success");
    } catch {
      showToast("Failed to export data", "error");
    } finally {
      setExporting(null);
    }
  };

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...CRICKET_CATEGORIES.map((c) => ({ value: c, label: c })),
  ];

  const capacityOptions = [
    { value: "", label: "All" },
    { value: CAPTAINCY_INTEREST, label: CAPTAINCY_INTEREST },
    { value: "__none__", label: "Not Interested" },
  ];

  const sourceOptions = [
    { value: "", label: "All Sources" },
    { value: REGISTRATION_SOURCES.ADMIN, label: REGISTRATION_SOURCES.ADMIN },
    { value: REGISTRATION_SOURCES.PUBLIC, label: REGISTRATION_SOURCES.PUBLIC },
  ];

  const activeFilterCount = [
    searchName,
    searchMobile,
    category,
    capacityRole,
    registrationSource,
    sortOrder !== "desc" ? sortOrder : "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchName("");
    setSearchMobile("");
    setCategory("");
    setCapacityRole("");
    setRegistrationSource("");
    setSortOrder("desc");
  };

  return (
    <>
      <Card
        elevated
        title="Cricketers"
        description={`${pagination.totalItems} registered players`}
        action={
          <div className="export-toolbar">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
              loading={exporting === "csv"}
            >
              <FileText className="h-4 w-4 text-blue-400" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("xlsx")}
              loading={exporting === "xlsx"}
            >
              <FileSpreadsheet className="h-4 w-4 text-green-400" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("pdf")}
              loading={exporting === "pdf"}
            >
              <Download className="h-4 w-4 text-red-400" />
              PDF
            </Button>
          </div>
        }
      >
        <CricketersFilterBar
          activeFilterCount={activeFilterCount}
          onClear={clearFilters}
        >
          <div className="sm:col-span-2 xl:col-span-2">
            <SearchInput
              label="Search by Name"
              icon={Search}
              placeholder="Enter name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <SearchInput
            label="Search by Mobile"
            icon={Search}
            placeholder="Enter mobile number..."
            value={searchMobile}
            onChange={(e) => setSearchMobile(e.target.value)}
            inputMode="numeric"
          />
          <Select
            label="Cricket Category"
            options={categoryOptions}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Select
            label="Captaincy Interest"
            options={capacityOptions}
            value={capacityRole}
            onChange={(e) => setCapacityRole(e.target.value)}
          />
          <Select
            label="Registration Source"
            options={sourceOptions}
            value={registrationSource}
            onChange={(e) => setRegistrationSource(e.target.value)}
          />
          <Select
            label="Sort by Date"
            options={[
              { value: "desc", label: "Newest First" },
              { value: "asc", label: "Oldest First" },
            ]}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </CricketersFilterBar>

        <div className="mt-6 table-shell">
          <table className="text-sm">
            <thead>
              <tr className="table-head">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Full Name</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] sm:table-cell">Age</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] md:table-cell">Address</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Contact 1</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] lg:table-cell">Contact 2</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] sm:table-cell">Jersey</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] lg:table-cell">Jersey Name</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] sm:table-cell">Categories</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] xl:table-cell">Captaincy</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] lg:table-cell">Source</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] lg:table-cell">Registered</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="table-row">
                    {Array.from({ length: 13 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 animate-pulse rounded bg-[hsl(var(--muted))]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : cricketers.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-12 text-center text-[hsl(var(--muted-foreground))]">
                    No cricketers found
                  </td>
                </tr>
              ) : (
                cricketers.map((c) => (
                  <tr key={c._id} className="table-row">
                    <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted-foreground))]">
                      {c._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 font-medium font-gujarati">
                      {formatFullName(c.first_name, c.middle_name, c.last_name)}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {c.age != null ? c.age : "—"}
                    </td>
                    <td className="hidden max-w-[200px] truncate px-4 py-3 font-gujarati text-[hsl(var(--muted-foreground))] md:table-cell">
                      {c.address}
                    </td>
                    <td className="px-4 py-3">{c.contact_number_1}</td>
                    <td className="hidden px-4 py-3 text-[hsl(var(--muted-foreground))] lg:table-cell">
                      {c.contact_number_2 || "—"}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {c.jersey_size && c.jersey_number ? (
                        <Badge variant="default">
                          {c.jersey_size} #{c.jersey_number}
                        </Badge>
                      ) : (
                        <span className="text-[hsl(var(--muted-foreground))]">—</span>
                      )}
                    </td>
                    <td className="hidden max-w-[140px] truncate px-4 py-3 font-gujarati lg:table-cell">
                      {c.jersey_name || "—"}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {c.cricket_categories.map((cat) => (
                          <Badge key={cat} variant="info">{cat}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      {(c.capacity_roles || []).includes(CAPTAINCY_INTEREST) ? (
                        <Badge variant="success">Yes</Badge>
                      ) : (
                        <span className="text-[hsl(var(--muted-foreground))]">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Badge
                        variant={
                          c.registration_source === REGISTRATION_SOURCES.PUBLIC
                            ? "success"
                            : "default"
                        }
                      >
                        {c.registration_source || REGISTRATION_SOURCES.ADMIN}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 text-[hsl(var(--muted-foreground))] lg:table-cell">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setViewCricketer(c)} aria-label="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditCricketer(c)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteCricketer(c)}
                          aria-label="Delete"
                          className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-3 border-t border-[hsl(var(--border))] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchCricketers(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchCricketers(pagination.page + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal open={!!viewCricketer} onClose={() => setViewCricketer(null)} title="Cricketer Details" size="lg">
        {viewCricketer && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Detail label="Full Name" value={formatFullName(viewCricketer.first_name, viewCricketer.middle_name, viewCricketer.last_name)} />
              <Detail label="Age" value={viewCricketer.age != null ? String(viewCricketer.age) : "—"} />
              <Detail label="Contact 1" value={viewCricketer.contact_number_1} />
              <Detail label="Contact 2" value={viewCricketer.contact_number_2 || "—"} />
              <Detail label="Registered" value={formatDate(viewCricketer.created_at)} />
              <Detail label="Registration Source" value={viewCricketer.registration_source || REGISTRATION_SOURCES.ADMIN} />
              <Detail label="Jersey Size" value={viewCricketer.jersey_size || "—"} />
              <Detail
                label="Jersey Number"
                value={
                  viewCricketer.jersey_number != null
                    ? String(viewCricketer.jersey_number)
                    : "—"
                }
              />
              <Detail label="Jersey Name" value={viewCricketer.jersey_name || "—"} />
            </div>
            <Detail label="Address" value={viewCricketer.address} />
            <div>
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {viewCricketer.cricket_categories.map((cat) => (
                  <Badge key={cat} variant="success">{cat}</Badge>
                ))}
              </div>
            </div>
            <Detail
              label="Captaincy Interest"
              value={
                (viewCricketer.capacity_roles || []).includes(CAPTAINCY_INTEREST)
                  ? "Yes"
                  : "No"
              }
            />
          </div>
        )}
      </Modal>

      <Modal open={!!editCricketer} onClose={() => setEditCricketer(null)} title="Edit Cricketer" size="lg">
        {editCricketer && (
          <CricketerForm
            mode="edit"
            initialData={{
              _id: editCricketer._id,
              first_name: editCricketer.first_name,
              middle_name: editCricketer.middle_name,
              last_name: editCricketer.last_name,
              address: editCricketer.address,
              age: editCricketer.age ?? ("" as unknown as number),
              contact_number_1: editCricketer.contact_number_1,
              contact_number_2: editCricketer.contact_number_2 || "",
              jersey_size: (editCricketer.jersey_size ||
                "") as CricketerFormData["jersey_size"],
              jersey_number: editCricketer.jersey_number ?? ("" as unknown as number),
              jersey_name: editCricketer.jersey_name || "",
              cricket_categories: editCricketer.cricket_categories as CricketerFormData["cricket_categories"],
            }}
            onSuccess={() => {
              setEditCricketer(null);
              fetchCricketers(pagination.page);
            }}
          />
        )}
      </Modal>

      <Modal open={!!deleteCricketer} onClose={() => setDeleteCricketer(null)} title="Confirm Delete" size="sm">
        {deleteCricketer && (
          <div className="space-y-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Are you sure you want to delete{" "}
              <strong>
                {formatFullName(deleteCricketer.first_name, deleteCricketer.middle_name, deleteCricketer.last_name)}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteCricketer(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{label}</p>
      <p className="mt-1 text-sm font-gujarati">{value}</p>
    </div>
  );
}
