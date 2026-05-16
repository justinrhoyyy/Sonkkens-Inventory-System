interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  children: React.ReactNode;
}

export default function Modal({ title, open, onClose, onConfirm, confirmLabel = 'Confirm', children }: ModalProps) {
  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 50, display: 'grid', placeItems: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440, background: 'white', borderRadius: 22, padding: 24, boxShadow: '0 25px 70px rgba(15,23,42,0.18)' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{title}</h2>
        <div style={{ marginTop: 16 }}>{children}</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
          <button className="button secondary" onClick={onClose}>Cancel</button>
          <button className="button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
