"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Plus, Trash2, Shield, UserCog } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/providers/ToastProvider";
import { addAdminSchema, type AddAdminFormData } from "@/lib/admin-validation";
import { formatDate } from "@/lib/utils";

interface MainAdmin {
  email: string;
  source: "env";
  isMainAdmin: boolean;
}

interface ManagedAdmin {
  id: string;
  email: string;
  created_by: string;
  created_at: string;
}

export function AdminUsersPanel() {
  const { showToast } = useToast();
  const [mainAdmin, setMainAdmin] = useState<MainAdmin | null>(null);
  const [users, setUsers] = useState<ManagedAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ManagedAdmin | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddAdminFormData>({
    resolver: zodResolver(addAdminSchema),
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMainAdmin(data.mainAdmin);
      setUsers(data.users || []);
    } catch {
      showToast("Failed to load admin users", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onSubmit = async (formData: AddAdminFormData) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add admin");
      showToast("Admin user added successfully", "success");
      reset();
      fetchUsers();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add admin", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Admin user deleted", "success");
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card
        title="Admin Users"
        description="Main admin is configured in .env. Add additional admins who can log in to the system."
      >
        <div className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Email"
                type="email"
                required
                placeholder="admin@example.com"
                {...register("email")}
                error={errors.email?.message}
              />
              <Input
                label="Password"
                type="password"
                required
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                {...register("password")}
                error={errors.password?.message}
              />
            </div>
            <Button type="submit" loading={submitting}>
              <Plus className="h-4 w-4" />
              Add Admin User
            </Button>
          </form>

          <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
            <h4 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Admin Users List
            </h4>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {mainAdmin && (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-brand-200 bg-brand-50/50 px-4 py-3 dark:border-brand-900 dark:bg-brand-950/20">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{mainAdmin.email}</p>
                        <p className="text-xs text-slate-500">Configured in .env file</p>
                      </div>
                    </div>
                    <Badge variant="success">Main Admin</Badge>
                  </div>
                )}

                {users.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700">
                    No additional admin users yet. Add email and password above.
                  </p>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          <UserCog className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            {user.email}
                          </p>
                          <p className="text-xs text-slate-500">
                            Added by {user.created_by} · {formatDate(user.created_at)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(user)}
                        className="shrink-0 text-red-600 hover:text-red-700"
                        aria-label="Delete admin"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Admin User"
        size="sm"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Remove admin access for <strong>{deleteTarget.email}</strong>? They
              will no longer be able to log in.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={deleting}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
