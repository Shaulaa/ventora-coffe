// Type declaration untuk Midtrans Snap.js (dimuat via CDN)

interface SnapPayOptions {
  onSuccess?: (result: unknown) => void;
  onPending?: (result: unknown) => void;
  onError?: (result: unknown) => void;
  onClose?: () => void;
}

interface SnapCallbacks {
  callback?: SnapPayOptions;
}

interface Snap {
  pay: (token: string, options?: SnapCallbacks) => void;
  show: () => void;
  hide: () => void;
  close: () => void;
}

interface Window {
  Snap: Snap;
}
