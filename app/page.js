'use client';
import { useState, useEffect, useCallback } from 'react';

const TABS = ['Products', 'Shirt Colors', 'Settings', 'Banners', 'FAQs', 'Orders'];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('Products');
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState('');

  const ADMIN_PIN = '7777';

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 40, maxWidth: 360, width: '100%', border: '1px solid #333' }}>
          <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: 24, fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>ADMIN ACCESS</h2>
          <input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && pin === ADMIN_PIN) setAuthed(true); }}
            style={{ width: '100%', padding: 14, borderRadius: 8, border: '1px solid #444', background: '#222', color: '#fff', fontSize: 16, textAlign: 'center', letterSpacing: 8, boxSizing: 'border-box' }}
          />
          <button
            onClick={() => { if (pin === ADMIN_PIN) setAuthed(true); }}
            style={{ width: '100%', marginTop: 16, padding: 14, borderRadius: 8, border: 'none', background: '#D94F4F', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}
          >ENTER</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', fontFamily: "'DM Sans', sans-serif", color: '#e0e0e0' }}>
      <div style={{ background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: 2, margin: 0 }}>HTV STORE — ADMIN</h1>
        <button onClick={() => setAuthed(false)} style={{ background: 'none', border: '1px solid #444', color: '#999', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>LOGOUT</button>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '16px 24px', overflowX: 'auto', borderBottom: '1px solid #1f1f1f' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: activeTab === t ? '#D94F4F' : '#1a1a1a', color: activeTab === t ? '#fff' : '#888', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .2s' }}>
            {t}
          </button>
        ))}
      </div>
      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        {activeTab === 'Products' && <ProductsTab />}
        {activeTab === 'Shirt Colors' && <ShirtColorsTab />}
        {activeTab === 'Settings' && <SettingsTab />}
        {activeTab === 'Banners' && <BannersTab />}
        {activeTab === 'FAQs' && <FaqsTab />}
        {activeTab === 'Orders' && <OrdersTab />}
      </div>
    </div>
  );
}

/* ===================== PRODUCTS TAB ===================== */
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ id: '', name: '', price: '', category: '', description: '', image_url: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/products');
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm({ id: '', name: '', price: '', category: '', description: '', image_url: '' }); setEditing(null); };

  const save = async () => {
    setSaving(true);
    const method = editing ? 'PUT' : 'POST';
    const payload = { ...form, price: parseFloat(form.price) || 0 };
    if (!editing) payload.id = form.id || `prod_${Date.now()}`;
    await fetch('/api/admin/products', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    resetForm();
    await load();
    setSaving(false);
  };

  const remove = async (id) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
    load();
  };

  const edit = (p) => { setForm({ id: p.id, name: p.name, price: String(p.price), category: p.category || '', description: p.description || '', image_url: p.image_url || '' }); setEditing(p.id); };

  return (
    <div>
      <SectionTitle>Products</SectionTitle>
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {!editing && <Input label="Product ID" value={form.id} onChange={v => setForm({ ...form, id: v })} placeholder="e.g. tshirt-001 (auto if empty)" />}
          <Input label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
          <Input label="Price" value={form.price} onChange={v => setForm({ ...form, price: v })} type="number" />
          <Input label="Category" value={form.category} onChange={v => setForm({ ...form, category: v })} />
          <Input label="Image URL" value={form.image_url} onChange={v => setForm({ ...form, image_url: v })} />
        </div>
        <div style={{ marginTop: 12 }}>
          <Input label="Description" value={form.description} onChange={v => setForm({ ...form, description: v })} multiline />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Btn onClick={save} loading={saving}>{editing ? 'Update Product' : 'Add Product'}</Btn>
          {editing && <Btn onClick={resetForm} secondary>Cancel</Btn>}
        </div>
      </Card>
      {loading ? <Loader /> : (
        <Table headers={['ID', 'Name', 'Price', 'Category', 'Actions']}>
          {products.map(p => (
            <tr key={p.id}>
              <Td>{p.id}</Td>
              <Td>{p.name}</Td>
              <Td>${Number(p.price).toFixed(2)}</Td>
              <Td>{p.category}</Td>
              <Td><ActionBtns onEdit={() => edit(p)} onDelete={() => remove(p.id)} /></Td>
            </tr>
          ))}
          {products.length === 0 && <tr><Td colSpan={5} style={{ textAlign: 'center', color: '#666' }}>No products yet</Td></tr>}
        </Table>
      )}
    </div>
  );
}

/* ===================== SHIRT COLORS TAB ===================== */
function ShirtColorsTab() {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', hex_color: '#000000', photo_url: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/shirt-colors');
    const data = await res.json();
    setColors(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  const resetForm = () => { setForm({ name: '', hex_color: '#000000', photo_url: '' }); setEditing(null); };

  const save = async () => {
    setSaving(true);
    const method = editing ? 'PUT' : 'POST';
    const payload = editing ? { id: editing, ...form } : form;
    await fetch('/api/admin/shirt-colors', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    resetForm();
    await load();
    setSaving(false);
  };

  const remove = async (id) => {
    if (!confirm('Delete this color?')) return;
    await fetch(`/api/admin/shirt-colors?id=${id}`, { method: 'DELETE' });
    load();
  };

  const edit = (c) => { setForm({ name: c.name, hex_color: c.hex_color || '#000000', photo_url: c.photo_url || '' }); setEditing(c.id); };

  return (
    <div>
      <SectionTitle>Shirt Colors</SectionTitle>
      <Card>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Input label="Color Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Hex Color</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={form.hex_color} onChange={e => setForm({ ...form, hex_color: e.target.value })} style={{ width: 40, height: 40, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none' }} />
              <input value={form.hex_color} onChange={e => setForm({ ...form, hex_color: e.target.value })} style={{ ...inputStyle, width: 100 }} />
            </div>
          </div>
          <Input label="Photo URL (optional)" value={form.photo_url} onChange={v => setForm({ ...form, photo_url: v })} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Btn onClick={save} loading={saving}>{editing ? 'Update Color' : 'Add Color'}</Btn>
          {editing && <Btn onClick={resetForm} secondary>Cancel</Btn>}
        </div>
      </Card>
      {loading ? <Loader /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginTop: 16 }}>
          {colors.map(c => (
            <div key={c.id} style={{ background: '#1a1a1a', borderRadius: 10, padding: 16, border: '1px solid #2a2a2a' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: c.hex_color, border: '2px solid #444', marginBottom: 10 }} />
              <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>{c.hex_color}</div>
              <ActionBtns onEdit={() => edit(c)} onDelete={() => remove(c.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===================== SETTINGS TAB ===================== */
function SettingsTab() {
  const [settings, setSettings] = useState({ tax_rate: { rate: 0.07 }, disclaimer_text: { text: '' } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings(prev => ({ ...prev, ...data }));
      setLoading(false);
    })();
  }, []);

  const saveSetting = async (key, value) => {
    setSaving(true); setMsg('');
    await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) });
    setMsg(`${key} saved!`);
    setSaving(false);
    setTimeout(() => setMsg(''), 2000);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <SectionTitle>Admin Settings</SectionTitle>
      {msg && <div style={{ background: '#1a3a1a', color: '#4ade80', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{msg}</div>}
      <Card title="Tax Rate">
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Tax Rate (decimal, e.g. 0.07 = 7%)</label>
            <input type="number" step="0.01" value={settings.tax_rate?.rate ?? 0} onChange={e => setSettings({ ...settings, tax_rate: { rate: parseFloat(e.target.value) || 0 } })} style={inputStyle} />
          </div>
          <Btn onClick={() => saveSetting('tax_rate', settings.tax_rate)} loading={saving}>Save Tax Rate</Btn>
        </div>
      </Card>
      <Card title="Disclaimer / Terms Text">
        <textarea
          value={settings.disclaimer_text?.text ?? ''}
          onChange={e => setSettings({ ...settings, disclaimer_text: { text: e.target.value } })}
          style={{ ...inputStyle, minHeight: 200, resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
        />
        <Btn onClick={() => saveSetting('disclaimer_text', settings.disclaimer_text)} loading={saving} style={{ marginTop: 12 }}>Save Disclaimer</Btn>
      </Card>
    </div>
  );
}

/* ===================== BANNERS TAB ===================== */
function BannersTab() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ image_url: '', title: '', active: true, sort_order: 0 });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/banners');
    const data = await res.json();
    setBanners(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  const resetForm = () => { setForm({ image_url: '', title: '', active: true, sort_order: 0 }); setEditing(null); };

  const save = async () => {
    setSaving(true);
    const method = editing ? 'PUT' : 'POST';
    const payload = editing ? { id: editing, ...form } : form;
    await fetch('/api/admin/banners', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    resetForm();
    await load();
    setSaving(false);
  };

  const remove = async (id) => {
    if (!confirm('Delete this banner?')) return;
    await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' });
    load();
  };

  const edit = (b) => { setForm({ image_url: b.image_url, title: b.title || '', active: b.active, sort_order: b.sort_order }); setEditing(b.id); };

  return (
    <div>
      <SectionTitle>Banners</SectionTitle>
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="Image URL" value={form.image_url} onChange={v => setForm({ ...form, image_url: v })} />
          <Input label="Title (optional)" value={form.title} onChange={v => setForm({ ...form, title: v })} />
          <Input label="Sort Order" value={String(form.sort_order)} onChange={v => setForm({ ...form, sort_order: parseInt(v) || 0 })} type="number" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
            <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#D94F4F' }} />
            <label style={{ fontSize: 13, color: '#ccc' }}>Active</label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Btn onClick={save} loading={saving}>{editing ? 'Update Banner' : 'Add Banner'}</Btn>
          {editing && <Btn onClick={resetForm} secondary>Cancel</Btn>}
        </div>
      </Card>
      {loading ? <Loader /> : (
        <Table headers={['ID', 'Title', 'Active', 'Order', 'Actions']}>
          {banners.map(b => (
            <tr key={b.id}>
              <Td>{b.id}</Td>
              <Td>{b.title || '—'}</Td>
              <Td><span style={{ color: b.active ? '#4ade80' : '#f87171' }}>{b.active ? 'Yes' : 'No'}</span></Td>
              <Td>{b.sort_order}</Td>
              <Td><ActionBtns onEdit={() => edit(b)} onDelete={() => remove(b.id)} /></Td>
            </tr>
          ))}
          {banners.length === 0 && <tr><Td colSpan={5} style={{ textAlign: 'center', color: '#666' }}>No banners yet</Td></tr>}
        </Table>
      )}
    </div>
  );
}

/* ===================== FAQS TAB ===================== */
function FaqsTab() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/faqs');
    const data = await res.json();
    setFaqs(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  const resetForm = () => { setForm({ question: '', answer: '' }); setEditing(null); };

  const save = async () => {
    setSaving(true);
    const method = editing ? 'PUT' : 'POST';
    const payload = editing ? { id: editing, ...form } : form;
    await fetch('/api/admin/faqs', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    resetForm();
    await load();
    setSaving(false);
  };

  const remove = async (id) => {
    if (!confirm('Delete this FAQ?')) return;
    await fetch(`/api/admin/faqs?id=${id}`, { method: 'DELETE' });
    load();
  };

  const edit = (f) => { setForm({ question: f.question, answer: f.answer }); setEditing(f.id); };

  return (
    <div>
      <SectionTitle>FAQs</SectionTitle>
      <Card>
        <Input label="Question" value={form.question} onChange={v => setForm({ ...form, question: v })} />
        <div style={{ marginTop: 12 }}>
          <Input label="Answer" value={form.answer} onChange={v => setForm({ ...form, answer: v })} multiline />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Btn onClick={save} loading={saving}>{editing ? 'Update FAQ' : 'Add FAQ'}</Btn>
          {editing && <Btn onClick={resetForm} secondary>Cancel</Btn>}
        </div>
      </Card>
      {loading ? <Loader /> : (
        <div style={{ marginTop: 16 }}>
          {faqs.map(f => (
            <div key={f.id} style={{ background: '#1a1a1a', borderRadius: 10, padding: 16, border: '1px solid #2a2a2a', marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{f.question}</div>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 10, whiteSpace: 'pre-wrap' }}>{f.answer}</div>
              <ActionBtns onEdit={() => edit(f)} onDelete={() => remove(f.id)} />
            </div>
          ))}
          {faqs.length === 0 && <div style={{ textAlign: 'center', color: '#666', padding: 32 }}>No FAQs yet</div>}
        </div>
      )}
    </div>
  );
}

/* ===================== ORDERS TAB ===================== */
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/orders');
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, fulfillment_status) => {
    await fetch('/api/admin/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, fulfillment_status }) });
    load();
  };

  const statusColor = (s) => {
    if (s === 'completed' || s === 'ready') return '#4ade80';
    if (s === 'processing') return '#facc15';
    return '#f87171';
  };

  if (loading) return <Loader />;

  return (
    <div>
      <SectionTitle>Orders</SectionTitle>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666', padding: 32 }}>No orders yet</div>
      ) : (
        <Table headers={['Order ID', 'Customer', 'Total', 'Payment', 'Fulfillment', 'Actions']}>
          {orders.map(o => (
            <tr key={o.id}>
              <Td style={{ fontFamily: 'monospace', fontSize: 11 }}>{o.order_code || o.id}</Td>
              <Td>{o.customers?.name || '—'}<br/><span style={{ fontSize: 11, color: '#888' }}>{o.customers?.phone || ''}</span></Td>
              <Td>${Number(o.total || 0).toFixed(2)}</Td>
              <Td><span style={{ color: o.payment_status === 'paid' ? '#4ade80' : '#facc15' }}>{o.payment_status}</span></Td>
              <Td><span style={{ color: statusColor(o.fulfillment_status) }}>{o.fulfillment_status}</span></Td>
              <Td>
                <select
                  value={o.fulfillment_status}
                  onChange={e => updateStatus(o.id, e.target.value)}
                  style={{ background: '#222', color: '#ccc', border: '1px solid #444', borderRadius: 4, padding: '4px 8px', fontSize: 12 }}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                </select>
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

/* ===================== SHARED UI COMPONENTS ===================== */
const inputStyle = { padding: '10px 12px', borderRadius: 6, border: '1px solid #333', background: '#1a1a1a', color: '#e0e0e0', fontSize: 13, fontFamily: "'DM Sans', sans-serif" };

function Input({ label, value, onChange, placeholder, type, multiline }) {
  const props = { value, onChange: e => onChange(e.target.value), placeholder, style: { ...inputStyle, width: '100%', boxSizing: 'border-box', ...(multiline ? { minHeight: 80, resize: 'vertical' } : {}) } };
  return (
    <div>
      {label && <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>{label}</label>}
      {multiline ? <textarea {...props} /> : <input type={type || 'text'} {...props} />}
    </div>
  );
}

function Btn({ children, onClick, loading, secondary, style }) {
  return (
    <button onClick={onClick} disabled={loading}
      style={{ padding: '10px 20px', borderRadius: 6, border: secondary ? '1px solid #444' : 'none', background: secondary ? 'transparent' : '#D94F4F', color: secondary ? '#999' : '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1, ...style }}>
      {loading ? 'Saving...' : children}
    </button>
  );
}

function Card({ children, title }) {
  return (
    <div style={{ background: '#1a1a1a', borderRadius: 10, padding: 20, border: '1px solid #2a2a2a', marginBottom: 16 }}>
      {title && <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#ccc' }}>{title}</div>}
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: '#fff' }}>{children}</h2>;
}

function Table({ headers, children }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 16 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>{headers.map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#666', borderBottom: '1px solid #2a2a2a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children, colSpan, style }) {
  return <td colSpan={colSpan} style={{ padding: '12px 14px', borderBottom: '1px solid #1f1f1f', fontSize: 13, ...style }}>{children}</td>;
}

function ActionBtns({ onEdit, onDelete }) {
  const s = { background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: '4px 8px', borderRadius: 4 };
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <button onClick={onEdit} style={{ ...s, color: '#60a5fa', background: '#1e3a5f' }}>Edit</button>
      <button onClick={onDelete} style={{ ...s, color: '#f87171', background: '#3a1a1a' }}>Delete</button>
    </div>
  );
}

function Loader() {
  return <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Loading...</div>;
}
