'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [agreed, setAgreed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [disclaimer, setDisclaimer] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        setDisclaimer(data.disclaimer_text?.text || 'Terms not configured yet.');
      } catch {
        setDisclaimer('Terms not configured yet.');
      }
      setLoading(false);
    })();
  }, []);

  if (agreed) {
    return <StorePage />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '28px 22px', maxWidth: 480, width: '100%', border: '1px solid #E8E5E0' }}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <img src="/logo.jpg" alt="HTV" style={{ width: '100%', maxWidth: 400, borderRadius: 6 }} />
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>Terms and Disclaimer</h3>
        <div style={{ background: '#F7F6F3', borderRadius: 8, padding: 12, maxHeight: 200, overflowY: 'auto', fontSize: 11, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 14, border: '1px solid #E8E5E0' }}>
          {loading ? 'Loading...' : disclaimer}
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', marginBottom: 14, fontSize: 12 }}>
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} style={{ marginTop: 3, accentColor: '#D94F4F', width: 16, height: 16 }} />
          <span>I have read, understand, and agree to all terms including the possibility of a thin white outline on prints.</span>
        </label>
        <button
          onClick={() => { if (checked) setAgreed(true); }}
          style={{ background: checked ? '#D94F4F' : '#ccc', color: '#fff', border: 'none', borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, cursor: checked ? 'pointer' : 'default', padding: 14, width: '100%', letterSpacing: 1, textTransform: 'uppercase' }}
        >I Agree - Enter Store</button>
      </div>
    </div>
  );
}

function StorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/products');
        const data = await res.json();
        setProducts(data);
      } catch { /* empty */ }
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: '#fff', padding: '16px 24px', borderBottom: '1px solid #E8E5E0', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, margin: 0 }}>The HTV Store</h1>
        <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0' }}>Custom Heat Transfer Vinyl Prints</p>
      </div>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#999' }}>Loading products...</p>
        ) : products.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>No products available yet. Check back soon!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {products.map(p => (
              <div key={p.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E5E0', overflow: 'hidden' }}>
                {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />}
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                  {p.category && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{p.category}</div>}
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#D94F4F', marginTop: 6 }}>${Number(p.price).toFixed(2)}</div>
                  {p.description && <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>{p.description}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
