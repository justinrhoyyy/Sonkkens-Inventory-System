export interface Product {
  id: string;
  product_name: string;
  serial_number: string;
  barcode_number: string;
  barcode_image: string;
  delivery_date: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  action_type: 'IN' | 'OUT' | 'EDIT';
  product_name: string;
  serial_number: string;
  details?: string | null;
  timestamp: string;
}
