export interface Product {
  id: string;
  product_name: string;
  serial_number: string;
  barcode_number: string;
  barcode_image: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  action_type: 'IN' | 'OUT';
  product_name: string;
  serial_number: string;
  timestamp: string;
}
