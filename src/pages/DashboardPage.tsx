import { useEffect, useMemo, useState } from 'react';
import html2canvas from 'html2canvas';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';
import { toast } from '../components/Toast';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSerial, setEditSerial] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selected) {
      setEditName(selected.product_name);
      setEditSerial(selected.serial_number);
    }
  }, [selected]);

  async function fetchProducts() {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      toast('Unable to load products');
      return;
    }
    setProducts(data ?? []);
  }

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return products;
    return products.filter((product) =>
      [product.product_name, product.serial_number, product.barcode_number].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [products, search]);

  const totalInCount = products.length;

  const handleSave = async () => {
    if (!selected) return;
    if (!editName.trim() || !editSerial.trim()) {
      toast('Product name and serial number are required');
      return;
    }
    setSaving(true);
    // fetch current product to capture previous values
    const { data: prevData, error: prevErr } = await supabase.from('products').select('*').eq('id', selected.id).single();
    if (prevErr || !prevData) {
      toast('Unable to fetch existing product');
      setSaving(false);
      return;
    }

    const updates = { product_name: editName.trim(), serial_number: editSerial.trim() };
    const { error } = await supabase.from('products').update(updates).eq('id', selected.id);

    if (error) {
      toast('Unable to update product');
    } else {
      // record edit in activity_logs with details
      const details = JSON.stringify({ before: { product_name: prevData.product_name, serial_number: prevData.serial_number }, after: { product_name: updates.product_name, serial_number: updates.serial_number } });
      await supabase.from('activity_logs').insert({ action_type: 'EDIT', product_name: updates.product_name, serial_number: updates.serial_number, details });

      toast('Product updated');
      fetchProducts();
      setSelected({ ...selected, product_name: updates.product_name, serial_number: updates.serial_number });
      setEditMode(false);
    }
    setSaving(false);
  };

  const handleDownload = async () => {
    if (!selected) return;
    const detail = document.getElementById('detail-download');
    if (!detail) return;
    const canvas = await html2canvas(detail, { backgroundColor: '#ffffff' });
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `${selected.product_name}-${selected.barcode_number}.png`;
    link.click();
  };

  return (
    <div className="page-shell">
      <h1 className="page-title">Dashboard</h1>
      <div className="grid two-columns">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div className="text-muted">Total IN Stocks</div>
              <h2 style={{ margin: 0, fontSize: '2.6rem' }}>{totalInCount}</h2>
            </div>
            <div className="badge">Active</div>
          </div>

          <div className="input-group" style={{ marginTop: 24 }}>
            <label className="label">Search by serial, name, barcode, or scanner input</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Type or scan a barcode" />
          </div>

          <div style={{ marginTop: 24, overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Serial</th>
                  <th>Barcode</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(product)}>
                    <td>{product.product_name}</td>
                    <td>{product.serial_number}</td>
                    <td>{product.barcode_number}</td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: 20, color: '#64748b' }}>
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card product-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Product details</h2>
            <span className="status-pill">{selected ? 'Selected' : 'Tap a product'}</span>
          </div>

          {!selected && <p className="text-muted">Choose a product to view full barcode details.</p>}

          {selected && (
            <div className="product-preview">
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <div className="text-muted">Product name</div>
                  <div style={{ fontWeight: 700 }}>{selected.product_name}</div>
                </div>
                <div>
                  <div className="text-muted">Serial number</div>
                  <div>{selected.serial_number}</div>
                </div>
                <div>
                  <div className="text-muted">Barcode</div>
                  <div>{selected.barcode_number}</div>
                </div>
                <img id="detail-download" src={selected.barcode_image} alt="Barcode" />
              </div>
            </div>
          )}

          {selected && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="button secondary" onClick={handleDownload}>Download as Image</button>
              <button className="button" onClick={() => setEditMode((current) => !current)}>{editMode ? 'Cancel' : 'Edit Product'}</button>
            </div>
          )}

          {selected && editMode && (
            <div className="grid" style={{ marginTop: 16 }}>
              <div className="input-group">
                <label className="label">Product name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="label">Serial number</label>
                <input value={editSerial} onChange={(e) => setEditSerial(e.target.value)} />
              </div>
              <button className="button" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
