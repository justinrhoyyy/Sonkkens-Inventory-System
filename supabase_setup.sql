-- Supabase table definitions for Sonkkens Inventory System

create table if not exists products (
  id uuid not null primary key default uuid_generate_v4(),
  product_name text not null,
  serial_number text not null,
  barcode_number text not null unique,
  barcode_image text not null,
  delivery_date date,
  created_at timestamp with time zone not null default now()
);

create table if not exists activity_logs (
  id uuid not null primary key default uuid_generate_v4(),
  action_type text not null check (action_type in ('IN', 'OUT', 'EDIT')),
  product_name text not null,
  serial_number text not null,
  details text,
  timestamp timestamp with time zone not null default now()
);
