import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { redeemLessonCode } from '../services/api';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function RedeemCodeModal({ onClose, onSuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!isScanning) return;

    const scanner = new Html5QrcodeScanner("qr-reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true
    }, false);

    scanner.render(
      (decodedText) => {
        // Stop scanning immediately
        scanner.clear();
        setIsScanning(false);
        
        // Extract code if it's a URL
        let extractedCode = decodedText;
        try {
          if (decodedText.includes('code=')) {
            const url = new URL(decodedText);
            extractedCode = url.searchParams.get('code') || decodedText;
          } else {
            // Also handle if the URL has trailing slashes or is just the raw text
            const parts = decodedText.split('code=');
            if (parts.length > 1) {
              extractedCode = parts[1].split('&')[0];
            }
          }
        } catch (e) {}

        extractedCode = extractedCode.trim().toUpperCase();
        setCode(extractedCode);
        
        // Automatically submit
        handleDirectSubmit(extractedCode);
      },
      (error) => {
        // ignore continuous scanning errors
      }
    );

    return () => {
      scanner.clear().catch(e => console.error("Failed to clear scanner", e));
    };
  }, [isScanning]);

  const handleDirectSubmit = async (submitCode) => {
    if (!submitCode) return;
    setLoading(true);
    try {
      await redeemLessonCode(submitCode);
      toast.success('تم فتح الدرس بنجاح! 🎉');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'كود غير صالح أو مستخدم من قبل.');
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleDirectSubmit(code);
  };

  return (
    <div className="modal-overlay" onClick={e => !isScanning && e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--violet)' }}>إدخال كود التفعيل</h3>
        <p style={{ color: 'var(--text-soft)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          للوصول إلى هذا الدرس، يرجى إدخال كود التفعيل الخاص بك (8 أرقام).
        </p>

        {isScanning ? (
          <div style={{ marginBottom: '1.5rem' }}>
            <div id="qr-reader" style={{ width: '100%', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden' }}></div>
            <button type="button" className="btn btn-ghost" style={{ width: '100%', color: 'var(--danger-solid)' }} onClick={() => setIsScanning(false)}>
              إيقاف الكاميرا
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                inputMode="numeric"
                pattern="[0-9]*"
                className="form-input" 
                style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '1.5rem', fontWeight: 'bold' }}
                placeholder="12345678" 
                value={code} 
                onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={8}
                required
              />
            </div>

            <button type="button" className="btn btn-ghost" style={{ width: '100%', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--bg-muted)' }} onClick={() => setIsScanning(true)}>
              📷 مسح كود QR
            </button>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading || code.length < 8}>
              {loading ? 'جاري التحقق...' : 'فتح الدرس 🔓'}
            </button>
            
            <button type="button" className="btn btn-ghost" style={{ width: '100%' }} onClick={onClose} disabled={loading}>
              إلغاء
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
