'use client';

import React, { useEffect, useState } from 'react';
import { getActivityLogs, AdminActivityLog } from '@/lib/cmsService';
import { AdminPermissionGuard } from '@/components/admin/AdminPermissionGuard';
import { History, Shield, Clock, Filter, User } from 'lucide-react';

function LogsAdmin() {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getActivityLogs().then((l) => {
      setLogs(l);
      setIsLoading(false);
    });
  }, []);

  const filteredLogs = filterAction === 'all' 
    ? logs 
    : logs.filter(l => l.action === filterAction);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <History className="w-6 h-6 text-amber-400" />
            <span>Admin Activity Audit Logs</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Complete change history recording admin actions, created items, updates, and publishing history.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 bg-emerald-900/60 p-1.5 rounded-2xl border border-emerald-800 shrink-0">
          <Filter className="w-4 h-4 text-amber-400 ml-2" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-transparent text-xs font-bold text-emerald-100 focus:outline-none pr-3"
          >
            <option value="all" className="bg-emerald-950">All Actions</option>
            <option value="create" className="bg-emerald-950">Create</option>
            <option value="update" className="bg-emerald-950">Update</option>
            <option value="delete" className="bg-emerald-950">Delete</option>
            <option value="publish" className="bg-emerald-950">Publish</option>
            <option value="unpublish" className="bg-emerald-950">Unpublish</option>
          </select>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-emerald-400/60 text-xs font-medium">
            No activity logs found.
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div
              key={`${log.id}-${idx}`}
              className="bg-emerald-900/30 border border-emerald-800/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                    log.action === 'create' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    log.action === 'publish' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    log.action === 'delete' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    'bg-sky-500/20 text-sky-300 border-sky-500/30'
                  }`}>
                    {log.action}
                  </span>
                  <span className="font-bold text-amber-300 capitalize">{log.entity_type}</span>
                </div>
                <p className="font-semibold text-emerald-100">{log.details}</p>
              </div>

              <div className="text-right sm:text-right shrink-0 space-y-0.5 border-t sm:border-t-0 border-emerald-800/30 pt-2 sm:pt-0">
                <div className="flex items-center sm:justify-end gap-1 text-[11px] text-emerald-300 font-medium">
                  <User className="w-3 h-3 text-amber-400" />
                  <span>{log.admin_email}</span>
                </div>
                <div className="flex items-center sm:justify-end gap-1 text-[10px] text-emerald-400/60">
                  <Clock className="w-3 h-3 text-emerald-500" />
                  <span>{new Date(log.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function LogsAdminGuardPage() {
  return (
    <AdminPermissionGuard featureKey="logs" featureLabel="Activity Audit Logs">
      <LogsAdmin />
    </AdminPermissionGuard>
  );
}
