import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ActivityLog } from '../types';
import { toast } from '../components/Toast';
import { gsap } from 'gsap';

const filters: Array<'ALL' | 'IN' | 'OUT' | 'EDIT'> = [
  'ALL',
  'IN',
  'OUT',
  'EDIT',
];

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map((item) => (
        <td key={item}>
          <div className="skeleton-bar" />
        </td>
      ))}
    </tr>
  );
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'IN' | 'OUT' | 'EDIT'>('ALL');

  const tableBodyRef = useRef<HTMLTableSectionElement | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      toast('Unable to load activity log');
      setLoading(false);
      return;
    }

    setLogs(data ?? []);
    setLoading(false);
  }

  const visibleLogs =
    filter === 'ALL'
      ? logs
      : logs.filter((entry) => entry.action_type === filter);

  /* ================= INTENTIONAL REVEAL ANIMATION ================= */
  useEffect(() => {
    if (loading) {
      hasAnimated.current = false;
      return;
    }

    if (!tableBodyRef.current) return;
    if (hasAnimated.current) return;

    const rows = tableBodyRef.current.querySelectorAll('tr');

    // STEP 1: force EVERYTHING invisible (this is your “empty state” moment)
    gsap.set(rows, {
      opacity: 0,
      y: 12,
    });

    // STEP 2: reveal animation
    requestAnimationFrame(() => {
      gsap.to(rows, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.06,
      });

      hasAnimated.current = true;
    });
  }, [loading, filter]);

  return (
    <div className="page-shell">
      <h1 className="page-title">Activity Log</h1>

      <div className="card">

        {/* FILTERS */}
        <div className="filter-bar">
          {filters.map((value) => (
            <button
              key={value}
              className={`filter-btn ${
                filter === value ? 'active' : ''
              }`}
              onClick={() => setFilter(value)}
            >
              {value}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="table-scroll">
          <table className="table activity-table">

            <thead>
              <tr>
                <th>Action</th>
                <th>Product</th>
                <th>Serial</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>

            <tbody ref={tableBodyRef}>
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : visibleLogs.length > 0 ? (
                visibleLogs.map((log) => (
                  <tr key={log.id}>

                    <td>
                      <span className={`action-badge ${log.action_type}`}>
                        {log.action_type}
                      </span>
                    </td>

                    <td className="strong-text">
                      {log.product_name}
                    </td>

                    <td className="muted-text">
                      {log.serial_number}
                    </td>

                    <td className="details-cell">
                      {(() => {
                        if (!log.details) return '—';

                        let d: any;

                        try {
                          d =
                            typeof log.details === 'string'
                              ? JSON.parse(log.details)
                              : log.details;
                        } catch {
                          return String(log.details);
                        }

                        if (d.before && d.after) {
                          return (
                            <div>
                              <div>
                                <b>Name:</b>{' '}
                                {d.before.product_name} → {d.after.product_name}
                              </div>
                              <div>
                                <b>Serial:</b>{' '}
                                {d.before.serial_number} → {d.after.serial_number}
                              </div>
                              {d.before.delivery_date !== d.after.delivery_date && (
                                <div>
                                  <b>Delivery:</b>{' '}
                                  {d.before.delivery_date || 'N/A'} →{' '}
                                  {d.after.delivery_date || 'N/A'}
                                </div>
                              )}
                            </div>
                          );
                        }

                        if (d.delivery_date) {
                          return (
                            <span>
                              <b>Delivery:</b> {d.delivery_date}
                            </span>
                          );
                        }

                        if (d.account_name || d.si || d.dr) {
                          return (
                            <div>
                              <div><b>Account:</b> {d.account_name || '-'}</div>
                              <div><b>SI:</b> {d.si || '-'}</div>
                              <div><b>DR:</b> {d.dr || '-'}</div>
                            </div>
                          );
                        }

                        return <span className="muted-text">No details</span>;
                      })()}
                    </td>

                    <td className="muted-text">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No activity found for this filter.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}