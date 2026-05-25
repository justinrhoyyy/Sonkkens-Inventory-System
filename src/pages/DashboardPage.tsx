import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { supabase } from "../lib/supabaseClient";
import { Product } from "../types";
import { toast } from "../components/Toast";

import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);

  const tableRef = useRef<HTMLTableSectionElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    fetchProducts();
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

    // prevents flicker / double render feel
    requestAnimationFrame(() => {
      setLoading(false);
    });
  }

  /* ---------------- ENTER SEARCH ONLY ---------------- */
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(searchInput.trim());
    }
  };

  /* ---------------- FILTER ---------------- */
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return products;

    return products.filter((p) =>
      [p.product_name, p.serial_number, p.barcode_number].some((v) =>
        v.toLowerCase().includes(q)
      )
    );
  }, [products, searchQuery]);

  /* ---------------- KEEP YOUR ORIGINAL EDIT SYNC ---------------- */
  useEffect(() => {
    if (selected) {
      // no UI change, just preserving your logic hook
    }
  }, [selected]);

  /* ---------------- PAGE ANIMATION (RUN ONCE) ---------------- */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  /* ---------------- TABLE ROW ANIMATION (NO DOUBLE LOAD) ---------------- */
  useEffect(() => {
    if (loading) return;
    if (!tableRef.current) return;

    gsap.fromTo(
      tableRef.current.querySelectorAll("tr"),
      {
        opacity: 0,
        y: 10,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        stagger: 0.03,
        ease: "power2.out",
      }
    );
  }, [loading, searchQuery]);

  /* ---------------- DETAIL PANEL ANIMATION ---------------- */
  useEffect(() => {
    if (!selected || !detailRef.current) return;

    gsap.fromTo(
      detailRef.current,
      {
        opacity: 0,
        x: 10,
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.35,
        ease: "power2.out",
      }
    );
  }, [selected]);

  /* ---------------- UI (YOUR ORIGINAL STRUCTURE) ---------------- */
  return (
    <div className="page-shell" ref={pageRef}>
      <h1 className="page-title">Dashboard</h1>

      <div className="grid two-columns">
        {/* LEFT CARD (UNCHANGED DESIGN) */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div className="text-muted">Total IN Stocks</div>
              <h2 style={{ margin: 0, fontSize: "2.6rem" }}>
                {products.length}
              </h2>
            </div>
            <div className="badge">Active</div>
          </div>

          <div className="input-group" style={{ marginTop: 24 }}>
            <label className="label">
              Search by serial, name, barcode (Press Enter)
            </label>

            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Type and press Enter"
            />
          </div>

          {/* TABLE (YOUR EXISTING STRUCTURE PRESERVED) */}
          <div style={{ marginTop: 24, overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Serial</th>
                  <th>Barcode</th>
                </tr>
              </thead>

              <tbody ref={tableRef}>
                {/* YOU ALREADY HAVE SKELETONS → WE DON'T TOUCH THEM */}
                {loading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="skeleton-row">
                      <td><div className="skeleton-line" /></td>
                      <td><div className="skeleton-line" /></td>
                      <td><div className="skeleton-line" /></td>
                    </tr>
                  ))}

                {/* REAL DATA */}
                {!loading &&
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelected(product)}
                    >
                      <td>{product.product_name}</td>
                      <td>{product.serial_number}</td>
                      <td>{product.barcode_number}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT CARD (UNCHANGED DESIGN) */}
        <div className="card" ref={detailRef}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>
              Product details
            </h2>
            <span className="status-pill">
              {selected ? "Selected" : "Tap a product"}
            </span>
          </div>

          {!selected && (
            <p className="text-muted">
              Choose a product to view full barcode details.
            </p>
          )}

          {selected && (
            <div className="product-preview">
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <div className="text-muted">Product name</div>
                  <div style={{ fontWeight: 700 }}>
                    {selected.product_name}
                  </div>
                </div>

                <div>
                  <div className="text-muted">Serial number</div>
                  <div>{selected.serial_number}</div>
                </div>

                <div>
                  <div className="text-muted">Delivery date</div>
                  <div>{selected.delivery_date || "N/A"}</div>
                </div>

                <div>
                  <div className="text-muted">Barcode</div>
                  <div>{selected.barcode_number}</div>
                </div>

                <img
                  id="detail-download"
                  src={selected.barcode_image}
                  alt="Barcode"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}