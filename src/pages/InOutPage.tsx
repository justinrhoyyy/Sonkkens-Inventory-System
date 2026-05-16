import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import html2canvas from 'html2canvas';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';
import Modal from '../components/Modal';
import { toast } from '../components/Toast';

function makeRandomBarcode() {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

async function createBarcodeImage(barcode: string, productName: string, serial: string) {
  const barcodeCanvas = document.createElement('canvas');
  JsBarcode(barcodeCanvas, barcode, {
    format: 'EAN13',
    displayValue: false,
    width: 2,
    height: 70,
    margin: 10,
    background: '#ffffff',
  });

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = 700;
  outputCanvas.height = 360;
  const context = outputCanvas.getContext('2d');
  if (!context) {
    throw new Error('Could not create canvas context');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
  context.fillStyle = '#1f2937';
  context.font = '700 24px Inter';
  context.fillText('Sonkkens Inventory', 24, 42);
  context.font = '600 20px Inter';
  context.fillText(productName, 24, 90);
  context.font = '500 16px Inter';
  context.fillStyle = '#475569';
  context.fillText(`Serial: ${serial}`, 24, 128);
  context.fillText(`Barcode: ${barcode}`, 24, 156);
  context.strokeStyle = '#e2e8f0';
  context.lineWidth = 2;
  context.strokeRect(16, 16, outputCanvas.width - 32, outputCanvas.height - 32);
  context.drawImage(barcodeCanvas, 62, 180, 580, 130);

  return outputCanvas.toDataURL('image/png');
}

export default function InOutPage() {
  const [name, setName] = useState('');
  const [serial, setSerial] = useState('');
  const [barcodeResult, setBarcodeResult] = useState<string | null>(null);
  const [barcodeValue, setBarcodeValue] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [loadingOut, setLoadingOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [savingIn, setSavingIn] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [outSearch, setOutSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!outSearch.trim()) {
      setFoundProduct(null);
      return;
    }
    const matched = products.find((product) => product.barcode_number.includes(outSearch.trim()));
    setFoundProduct(matched ?? null);
  }, [outSearch, products]);

  async function fetchProducts() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      toast('Unable to load products');
      return;
    }
    setProducts(data ?? []);
  }

  async function generateUniqueBarcode() {
    let candidate = makeRandomBarcode();
    let attempt = 0;
    while (attempt < 10) {
      const { data } = await supabase.from('products').select('id').eq('barcode_number', candidate).single();
      if (!data) return candidate;
      candidate = makeRandomBarcode();
      attempt += 1;
    }
    return candidate;
  }

  const handleAddProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !serial.trim()) {
      toast('Product name and serial number are required');
      return;
    }
    setSavingIn(true);
    const barcodeNumber = await generateUniqueBarcode();
    try {
      const barcodeImage = await createBarcodeImage(barcodeNumber, name.trim(), serial.trim());
      const { error } = await supabase.from('products').insert({
        product_name: name.trim(),
        serial_number: serial.trim(),
        barcode_number: barcodeNumber,
        barcode_image: barcodeImage,
      });
      await supabase.from('activity_logs').insert({
        action_type: 'IN',
        product_name: name.trim(),
        serial_number: serial.trim(),
      });
      if (error) {
        toast('Unable to add product');
      } else {
        setBarcodeResult(barcodeImage);
        setBarcodeValue(barcodeNumber);
        toast('Product added successfully');
        setName('');
        setSerial('');
        fetchProducts();
      }
    } catch (err) {
      toast('Could not generate barcode image');
    }
    setSavingIn(false);
  };

  const handleDelete = async () => {
    if (!foundProduct) return;
    setLoadingOut(true);
    const { error } = await supabase.from('products').delete().eq('id', foundProduct.id);
    await supabase.from('activity_logs').insert({
      action_type: 'OUT',
      product_name: foundProduct.product_name,
      serial_number: foundProduct.serial_number,
    });
    if (error) {
      toast('Unable to remove product');
    } else {
      toast('Product removed from inventory');
      setFoundProduct(null);
      setOutSearch('');
      fetchProducts();
    }
    setConfirmOpen(false);
    setLoadingOut(false);
  };

  const downloadBarcode = async () => {
    const element = document.getElementById('barcode-card');
    if (!element) return;
    const canvas = await html2canvas(element, { backgroundColor: '#ffffff' });
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${barcodeValue || 'barcode'}.png`;
    link.click();
  };

  const previewCard = useMemo(() => {
    if (!barcodeResult) return null;
    return (
      <div className="product-preview" id="barcode-card">
        <h3 style={{ margin: '0 0 8px' }}>{name || 'Product added'}</h3>
        <div className="text-muted">{serial || 'Serial number'}</div>
        <img src={barcodeResult} alt="Generated barcode" style={{ marginTop: 18 }} />
      </div>
    );
  }, [barcodeResult, name, serial]);

  return (
    <div className="page-shell">
      <h1 className="page-title">IN / OUT</h1>
      <div className="grid two-columns">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Add Product (IN)</h2>
          <form className="grid" onSubmit={handleAddProduct}>
            <div className="input-group">
              <label className="label">Product name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter product name" />
            </div>
            <div className="input-group">
              <label className="label">Serial number</label>
              <input value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="Enter serial number" />
            </div>
            <button className="button" type="submit" disabled={savingIn}>{savingIn ? 'Adding…' : 'Add product'}</button>
          </form>

          {barcodeResult && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ marginBottom: 14 }}>Barcode created</h3>
              {previewCard}
              <button className="button secondary" style={{ marginTop: 16 }} onClick={downloadBarcode}>Download barcode image</button>
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Remove Product (OUT)</h2>
          <div className="input-group">
            <label className="label">Barcode number or scanner input</label>
            <input value={outSearch} onChange={(e) => setOutSearch(e.target.value)} placeholder="Scan or enter barcode" />
          </div>

          {foundProduct ? (
            <div className="product-preview" style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 700 }}>{foundProduct.product_name}</div>
              <div className="text-muted">Serial: {foundProduct.serial_number}</div>
              <div className="text-muted">Barcode: {foundProduct.barcode_number}</div>
              <button className="button" style={{ marginTop: 16 }} onClick={() => setConfirmOpen(true)}>Remove product</button>
            </div>
          ) : (
            outSearch.trim() && <p className="text-muted" style={{ marginTop: 18 }}>No product found for this barcode.</p>
          )}
        </div>
      </div>

      <Modal title="Confirm removal" open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} confirmLabel={loadingOut ? 'Removing…' : 'Remove'}>
        <p>Are you sure you want to remove this product from inventory?</p>
      </Modal>
    </div>
  );
}
