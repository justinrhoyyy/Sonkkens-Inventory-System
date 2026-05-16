let toastTimeout: number | undefined;

export function toast(message: string) {
  const existing = document.getElementById('app-toast');
  if (existing) {
    existing.remove();
    window.clearTimeout(toastTimeout);
  }

  const toastElement = document.createElement('div');
  toastElement.id = 'app-toast';
  toastElement.textContent = message;
  toastElement.style.position = 'fixed';
  toastElement.style.bottom = '24px';
  toastElement.style.left = '50%';
  toastElement.style.transform = 'translateX(-50%)';
  toastElement.style.background = '#111827';
  toastElement.style.color = 'white';
  toastElement.style.padding = '14px 20px';
  toastElement.style.borderRadius = '18px';
  toastElement.style.boxShadow = '0 18px 45px rgba(15,23,42,0.18)';
  toastElement.style.zIndex = '999';
  document.body.appendChild(toastElement);

  toastTimeout = window.setTimeout(() => {
    toastElement.remove();
  }, 2800);
}
