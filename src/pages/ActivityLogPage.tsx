import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ActivityLog } from '../types';
import { toast } from '../components/Toast';

const filters: Array<'ALL' | 'IN' | 'OUT' | 'EDIT'> = ['ALL', 'IN', 'OUT', 'EDIT'];

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'IN' | 'OUT' | 'EDIT'>('ALL');

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    const { data, error } = await supabase.from('activity_logs').select('*').order('timestamp', { ascending: false });
    if (error) {
      toast('Unable to load activity log');
      return;
    }
    setLogs(data ?? []);
  }

  const visibleLogs =
    filter === 'ALL' ? logs : logs.filter((entry) => entry.action_type === filter);

  return (
    <div className="page-shell">
      <h1 className="page-title">Activity Log</h1>
      <div className="card">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
          {filters.map((value) => (
            <button key={value} className={`button ${filter === value ? '' : 'secondary'}`} onClick={() => setFilter(value)}>
              {value}
            </button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
                <tr>
                  <th>Action</th>
                  <th>Product</th>
                  <th>Serial</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>
                {visibleLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.action_type}</td>
                    <td>{log.product_name}</td>
                    <td>{log.serial_number}</td>
                    <td style={{ maxWidth: 360, whiteSpace: 'normal' }}>
                      {(() => {
                        if (!log.details) return '';
                        try {
                          const d = JSON.parse(log.details as string);
                          if (d.before && d.after) {
                            return `Name: ${d.before.product_name} → ${d.after.product_name}; Serial: ${d.before.serial_number} → ${d.after.serial_number}`;
                          }
                          return String(log.details);
                        } catch (e) {
                          return String(log.details);
                        }
                      })()}
                    </td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              {visibleLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 20, color: '#64748b' }}>No log entries to show.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
