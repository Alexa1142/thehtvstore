"use client";
import { useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

var C = { red: "#D94F4F", yellow: "#E8B828", cyan: "#2BA5B5", tx: "#2D2A26", sub: "#8A857D", bg: "#FAFAF8", cd: "#fff", bd: "#E8E5E0" };
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function StripeCheckout(props) {
  var stripe = useStripe(), elements = useElements(), [loading, setLoading] = useState(false);
  var [name, setName] = useState(""), [email, setEmail] = useState(""), [phone, setPhone] = useState("");

  var handlePayment = async function (e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!name.trim() || !email.trim() || !phone.trim()) { props.notify("Fill all fields", C.red); return; }
    if (props.cart.length === 0) { props.notify("Cart empty", C.yellow); return; }

    setLoading(true);
    var cardElement = elements.getElement(CardElement);
    var pmResult = await stripe.createPaymentMethod({ type: "card", card: cardElement });
    if (pmResult.error) { props.notify("Card error: " + pmResult.error.message, C.red); setLoading(false); return; }

    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems: props.cart,
        total: props.finalTotal,
        tax: props.tax,
        subtotal: props.total,
        paymentMethodId: pmResult.paymentMethod.id,
        customerInfo: { name: name, email: email, phone: phone }
      })
    }).then(r => r.json()).then(async d => {
      if (d.error) { props.notify("Error: " + d.error, C.red); setLoading(false); return; }
      if (d.clientSecret) {
        var result = await stripe.confirmCardPayment(d.clientSecret);
        if (result.paymentIntent?.status === 'succeeded') {
          props.notify("Payment OK! Order: " + d.orderCode, C.cyan);
          setName(""); setEmail(""); setPhone("");
          props.onSuccess();
        } else {
          props.notify("Payment failed", C.red);
        }
      } else {
        props.notify("Order: " + d.orderCode, C.cyan);
        props.onSuccess();
      }
      setLoading(false);
    }).catch(e => { props.notify("Error: " + e.message, C.red); setLoading(false); });
  };

  return <form onSubmit={handlePayment} style={{ maxWidth: 500, margin: "0 auto" }}>
    <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, fontWeight: 600, color: C.sub }}>Name *</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" style={{ width: "100%", padding: 10, background: "#F7F6F3", border: "1.5px solid " + C.bd, borderRadius: 6, fontSize: 12, marginTop: 4, boxSizing: "border-box" }} /></div>
    <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, fontWeight: 600, color: C.sub }}>Email *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="test@example.com" style={{ width: "100%", padding: 10, background: "#F7F6F3", border: "1.5px solid " + C.bd, borderRadius: 6, fontSize: 12, marginTop: 4, boxSizing: "border-box" }} /></div>
    <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, fontWeight: 600, color: C.sub }}>Phone *</label><input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="5551234567" style={{ width: "100%", padding: 10, background: "#F7F6F3", border: "1.5px solid " + C.bd, borderRadius: 6, fontSize: 12, marginTop: 4, boxSizing: "border-box" }} /></div>
    <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, fontWeight: 600, color: C.sub }}>Card *</label><div style={{ padding: 10, background: "#F7F6F3", border: "1.5px solid " + C.bd, borderRadius: 6, marginTop: 4 }}><CardElement options={{ style: { base: { fontSize: '12px', color: C.tx } } }} /></div></div>
    <div style={{ padding: 10, background: "#F7F6F3", borderRadius: 6, marginBottom: 14 }}><div style={{ fontSize: 11 }}>Total: <strong>${props.finalTotal.toFixed(2)}</strong></div></div>
    <button type="submit" disabled={loading || !stripe} style={{ width: "100%", padding: 14, background: loading ? "#ccc" : C.red, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "Processing..." : "Pay Now"}</button>
  </form>;
}

export default function App() {
  var [disc, setDisc] = useState(false), [discOk, setDiscOk] = useState(false);
  var [cart, setCart] = useState([]), [cartOpen, setCartOpen] = useState(false), [note, setNote] = useState(null);
  var [showCheckout, setShowCheckout] = useState(false);
  var notify = useCallback(function (m, c) { setNote({ m: m, c: c }); setTimeout(function () { setNote(null) }, 3200); }, []);

  var total = cart.reduce(function (s, i) { return s + i.price; }, 0);
  var tax = Math.round(total * 0.07 * 100) / 100;
  var finalTotal = Math.round((total + tax) * 100) / 100;

  var onSuccess = function () { setCart([]); setShowCheckout(false); };

  if (disc) return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}><div style={{ background: C.cd, borderRadius: 16, padding: 28, maxWidth: 480, width: "100%", border: "1px solid " + C.bd }}><h1 style={{ fontFamily: "Playfair Display,serif", fontSize: 28, fontWeight: 700, color: C.tx, margin: 0 }}>The HTV Store</h1><p style={{ color: C.sub, fontSize: 13, margin: "8px 0 0 0" }}>Custom t-shirts</p><div style={{ background: "#F7F6F3", borderRadius: 8, padding: 16, marginTop: 20, marginBottom: 18, border: "1px solid " + C.bd }}><h3 style={{ fontFamily: "Playfair Display,serif", fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>Terms</h3><p style={{ fontSize: 11, lineHeight: 1.6, color: C.sub, margin: 0 }}>© 2026 The HTV Store. By using this store, you agree to our terms.</p></div><label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 14, fontSize: 12 }}><input type="checkbox" checked={discOk} onChange={e => setDiscOk(e.target.checked)} style={{ accentColor: C.red, width: 16, height: 16, cursor: "pointer" }} /><span>I agree</span></label><button onClick={function () { if (discOk) setDisc(false); else notify("Agree first", C.red) }} style={{ width: "100%", padding: 14, background: discOk ? C.red : "#ccc", color: "#fff", border: "none", borderRadius: 9, fontWeight: 700, cursor: "pointer" }}>Enter</button></div></div>;

  return <div style={{ minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: "DM Sans,sans-serif" }}>
    {note && <div style={{ position: "fixed", top: 40, left: "50%", transform: "translateX(-50%)", background: C.cd, padding: "10px 20px", borderRadius: 8, borderLeft: "4px solid " + note.c, fontSize: 12, fontWeight: 600, zIndex: 9999 }}>{note.m}</div>}
    <nav style={{ position: "sticky", top: 0, zIndex: 1000, background: "rgba(250,250,248,0.95)", borderBottom: "1px solid " + C.bd, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>HTV Store</h2><button onClick={function () { setCartOpen(!cartOpen) }} style={{ background: C.red, color: "#fff", border: "none", borderRadius: 9, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Cart ({cart.length})</button></nav>
    {cartOpen && <div onClick={function () { setCartOpen(false) }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 1999 }} />}
    {cartOpen && <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(360px,90vw)", background: C.cd, zIndex: 2000, borderLeft: "1px solid " + C.bd, padding: 20, overflowY: "auto" }}><h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px" }}>Cart</h3>{cart.map(function (it, i) { return <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + C.bd }}><div><div style={{ fontWeight: 600, fontSize: 11 }}>{it.name}</div><div style={{ color: C.red, fontSize: 12 }}>{"$" + it.price.toFixed(2)}</div></div><button onClick={function () { setCart(cart.filter(function (_, x) { return x !== i })) }} style={{ background: "#fee", color: C.red, border: "none", padding: "3px 7px", borderRadius: 4, fontSize: 9, cursor: "pointer" }}>X</button></div> })} <div style={{ marginTop: 14, paddingTop: 10, borderTop: "2px solid " + C.tx }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}><span>Total:</span><span style={{ fontWeight: 700, color: C.red }}>{"$" + finalTotal.toFixed(2)}</span></div><button onClick={function () { setCartOpen(false); setShowCheckout(true) }} style={{ width: "100%", padding: 12, background: C.red, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Checkout</button></div></div>}
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "30px 14px" }}>
      {!showCheckout && <div style={{ textAlign: "center" }}><h1 style={{ fontFamily: "Playfair Display,serif", fontSize: 32, fontWeight: 700, margin: "0 0 10px" }}>The HTV Store</h1><p style={{ fontSize: 14, color: C.sub, margin: "0 0 24px" }}>Custom t-shirts with HTV designs</p><button onClick={function () { setCart([...cart, { name: "Designed Shirt", price: 34.99 }]); notify("Added!", C.cyan) }} style={{ background: C.red, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Design Shirt ($34.99)</button></div>}
      {showCheckout && <div style={{ background: C.cd, borderRadius: 10, padding: 20, border: "1px solid " + C.bd }}><h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>Checkout</h3><Elements stripe={stripePromise}><StripeCheckout cart={cart} total={total} tax={tax} finalTotal={finalTotal} notify={notify} onSuccess={onSuccess} /></Elements><button onClick={function () { setShowCheckout(false) }} style={{ marginTop: 12, padding: "10px 20px", background: "#f5f5f2", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>Back</button></div>}
    </main>
  </div>;
}
