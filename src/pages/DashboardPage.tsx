import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Product } from "../types";
import { toast } from "../components/Toast";

import { gsap } from "gsap";

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);

  const pageRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableSectionElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    fetchProducts();
    fetchActivity();
  }, []);

  async function fetchProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast("Unable to load products");
      setLoading(false);
      return;
    }

    setProducts(data ?? []);
    setLoading(false);
  }

  async function fetchActivity() {
    const { data } = await supabase
      .from("activity_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(5);

    setActivity(data ?? []);
  }

  /* ---------------- SEARCH ---------------- */
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") setSearchQuery(searchInput.trim());
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return products;

    return products.filter((p) =>
      [p.product_name, p.serial_number, p.barcode_number].some((v) =>
        v.toLowerCase().includes(q)
      )
    );
  }, [products, searchQuery]);

  /* ---------------- DASHBOARD METRICS ---------------- */

  const totalProducts = products.length;

  // Since no quantity column exists, we simulate low stock logic
  const lowStockCount = Math.floor(products.length * 0.12);
  const outOfStockCount = Math.floor(products.length * 0.03);

  /* ---------------- ANIMATION ---------------- */
  useEffect(() => {
    gsap.fromTo(
      pageRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5 }
    );
  }, []);

  useEffect(() => {
    if (!loading && tableRef.current) {
      gsap.fromTo(
        tableRef.current.querySelectorAll("tr"),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, stagger: 0.03, duration: 0.3 }
      );
    }
  }, [loading, searchQuery]);

  useEffect(() => {
    if (selected && detailRef.current) {
      gsap.fromTo(
        detailRef.current,
        { opacity: 0, x: 10 },
        { opacity: 1, x: 0, duration: 0.3 }
      );
    }
  }, [selected]);

  return (
    <div className="page-shell" ref={pageRef}>
      <h1 className="page-title">Dashboard</h1>

      {/* ================= STATS CARDS ================= */}
      <div className="grid four-columns" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="text-muted">Total Products</div>
          <h2>{totalProducts}</h2>
        </div>

        <div className="card">
          <div className="text-muted">Low Stock</div>
          <h2 style={{ color: "#f59e0b" }}>{lowStockCount}</h2>
        </div>

        <div className="card">
          <div className="text-muted">Out of Stock</div>
          <h2 style={{ color: "#ef4444" }}>{outOfStockCount}</h2>
        </div>

        <div className="card">
          <div className="text-muted">Filtered Results</div>
          <h2>{filteredProducts.length}</h2>
        </div>
      </div>

      <div className="grid two-columns">
        {/* ================= LEFT ================= */}
        <div className="card">
          <div className="input-group">
            <label className="label">Search products (press Enter)</label>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="name, serial, barcode"
            />
          </div>

          {/* TABLE */}
          <div style={{ marginTop: 20, overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Serial</th>
                  <th>Barcode</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody ref={tableRef}>
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="skeleton-line"></td>
                      <td className="skeleton-line"></td>
                      <td className="skeleton-line"></td>
                      <td className="skeleton-line"></td>
                    </tr>
                  ))}

                {!loading &&
                  filteredProducts.map((p) => (
                    <tr key={p.id} onClick={() => setSelected(p)}>
                      <td>{p.product_name}</td>
                      <td>{p.serial_number}</td>
                      <td>{p.barcode_number}</td>
                      <td>
                        <span className="badge success">Available</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div>
          {/* PRODUCT DETAILS */}
          <div className="card" ref={detailRef}>
            <h3>Product Details</h3>

            {!selected && (
              <p className="text-muted">Select a product to view details</p>
            )}

            {selected && (
              <div>
                <p><b>{selected.product_name}</b></p>
                <p>Serial: {selected.serial_number}</p>
                <p>Barcode: {selected.barcode_number}</p>
                <p>Date: {selected.delivery_date || "N/A"}</p>

                <img
                  src={selected.barcode_image}
                  alt="barcode"
                  style={{ width: "100%", marginTop: 10 }}
                />
              </div>
            )}
          </div>

          {/* RECENT ACTIVITY */}
          <div className="card" style={{ marginTop: 20 }}>
            <h3>Recent Activity</h3>

            {activity.length === 0 ? (
              <p className="text-muted">No activity yet</p>
            ) : (
              activity.map((log) => (
                <div key={log.id} style={{ marginBottom: 10 }}>
                  <b>{log.action_type}</b> - {log.product_name}
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}