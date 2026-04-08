"use client";
import { useState, useRef, useEffect, useCallback } from "react";

var C={red:"#D94F4F",yellow:"#E8B828",cyan:"#2BA5B5",tx:"#2D2A26",sub:"#8A857D",bg:"#FAFAF8",cd:"#fff",bd:"#E8E5E0"};

const LOGO="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23D94F4F' width='100' height='100'/%3E%3Ctext x='50' y='60' font-size='40' font-weight='bold' fill='white' text-anchor='middle'%3EHTV%3C/text%3E%3C/svg%3E";

export default function App(){
  var s=useState;
  var[tab,setTab]=s("shop"),[disc,setDisc]=s(true),[discOk,setDiscOk]=s(false);
  var[cart,setCart]=s([]),[cartOpen,setCartOpen]=s(false),[note,setNote]=s(null);
  var[cNm,setCNm]=s(""),[cPh,setCPh]=s(""),[cEm,setCEm]=s(""),[loading,setLoading]=s(false);
  var[canvasRef,setCanvasRef]=s(null);
  var notify=useCallback(function(m,c){setNote({m:m,c:c});setTimeout(function(){setNote(null)},3200)},[]);

  var total=cart.reduce(function(s,i){return s+(i.price||0)},0);
  var tax=Math.round(total*0.07*100)/100;
  var finalTotal=Math.round((total+tax)*100)/100;

  var checkout=async function(){
    if(!cNm.trim()||!cPh.trim()||!cEm.trim()){notify("Fill all fields",C.red);return}
    if(!cart||cart.length===0){notify("Cart empty",C.yellow);return}
    setLoading(true);
    try{
      var res=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cartItems:cart,total:finalTotal,tax:tax,subtotal:total,customerInfo:{name:cNm,email:cEm,phone:cPh}})});
      var d=await res.json();
      if(d.error){notify("Error: "+d.error,C.red)}else{notify("Order "+d.orderCode+"!",C.cyan);setCart([]);setCNm("");setCPh("");setCEm("")}
    }catch(e){notify("Error: "+e.message,C.red)}
    setLoading(false);
  };

  var addToCart=function(){
    setCart([...cart,{name:"HTV Design",price:34.99,id:Date.now()}]);
    notify("Added to cart!",C.cyan);
  };

  function Bar(){
    return <div style={{display:"flex",gap:8,marginBottom:14,borderBottom:"1px solid "+C.bd,paddingBottom:10}}>
      <button onClick={function(){setTab("shop")}} style={{background:tab==="shop"?C.red:"transparent",color:tab==="shop"?"#fff":C.tx,border:"none",padding:"6px 12px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Shop</button>
      <button onClick={function(){setTab("design")}} style={{background:tab==="design"?C.red:"transparent",color:tab==="design"?"#fff":C.tx,border:"none",padding:"6px 12px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Design</button>
    </div>;
  }

  if(disc){return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}><div style={{background:C.cd,borderRadius:16,padding:28,maxWidth:480,width:"100%",border:"1px solid "+C.bd}}><div style={{textAlign:"center",marginBottom:20}}><h1 style={{fontFamily:"Playfair Display,serif",fontSize:28,fontWeight:700,color:C.tx,margin:0}}>The HTV Store</h1><p style={{color:C.sub,fontSize:13,margin:"8px 0 0"}}>Custom t-shirts with HTV designs</p></div><div style={{background:"#F7F6F3",borderRadius:8,padding:16,marginBottom:18,border:"1px solid "+C.bd}}><h3 style={{fontFamily:"Playfair Display,serif",fontSize:14,fontWeight:700,margin:"0 0 10px"}}>Terms & Disclaimer</h3><p style={{fontSize:11,lineHeight:1.6,color:C.sub,margin:0}}>© 2026 The HTV Store. By using this store, you agree to our terms of service and privacy policy. All designs are custom and non-refundable once processing begins.</p></div><label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:14,fontSize:12}}><input type="checkbox" checked={discOk} onChange={function(e){setDiscOk(e.target.checked)}} style={{accentColor:C.red,width:16,height:16,cursor:"pointer"}}/><span>I agree to the terms</span></label><button onClick={function(){if(discOk)setDisc(false);else notify("You must agree",C.red)}} style={{width:"100%",padding:14,background:discOk?C.red:"#ccc",color:"#fff",border:"none",borderRadius:9,fontWeight:700,cursor:"pointer",fontSize:13,letterSpacing:1,textTransform:"uppercase"}}>Enter Store</button></div></div>}

  return <div style={{minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:"DM Sans,sans-serif"}}>
    {note&&<div style={{position:"fixed",top:40,left:"50%",transform:"translateX(-50%)",background:C.cd,padding:"10px 20px",borderRadius:8,borderLeft:"4px solid "+note.c,fontSize:12,fontWeight:600,zIndex:9999}}>{note.m}</div>}
    <nav style={{position:"sticky",top:0,zIndex:1000,background:"rgba(250,250,248,0.95)",borderBottom:"1px solid "+C.bd,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{margin:0,fontSize:18,fontWeight:700,color:C.tx}}>HTV Store</h2><button onClick={function(){setCartOpen(!cartOpen)}} style={{background:C.red,color:"#fff",border:"none",borderRadius:9,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Cart ({cart.length})</button></nav>
    {cartOpen&&<div onClick={function(){setCartOpen(false)}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.2)",zIndex:1999}}/>}
    {cartOpen&&<div style={{position:"fixed",top:0,right:0,bottom:0,width:"min(360px,90vw)",background:C.cd,zIndex:2000,borderLeft:"1px solid "+C.bd,padding:20,overflowY:"auto"}}><h3 style={{fontSize:16,fontWeight:700,margin:"0 0 14px"}}>Cart</h3>{cart.map(function(it,i){return <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+C.bd}}><div><div style={{fontWeight:600,fontSize:11}}>{it.name}</div><div style={{color:C.red,fontSize:12}}>{"$"+it.price.toFixed(2)}</div></div><button onClick={function(){setCart(cart.filter(function(_,x){return x!==i}))}} style={{background:"#fee",color:C.red,border:"none",padding:"3px 7px",borderRadius:4,fontSize:9,cursor:"pointer"}}>Remove</button></div>})}<div style={{marginTop:14,paddingTop:10,borderTop:"2px solid "+C.tx}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:8}}><span>Total:</span><span style={{fontWeight:700,color:C.red}}>{"$"+finalTotal.toFixed(2)}</span></div><button onClick={function(){setCartOpen(false)}} style={{width:"100%",padding:12,background:C.red,color:"#fff",border:"none",borderRadius:8,fontWeight:700,cursor:"pointer"}}>Go to Checkout</button></div></div>}
    
    <main style={{maxWidth:1000,margin:"0 auto",padding:"30px 14px"}}>
      {tab==="shop"&&<div><div style={{textAlign:"center",marginBottom:40}}><h1 style={{fontFamily:"Playfair Display,serif",fontSize:32,fontWeight:700,margin:"0 0 10px"}}>The HTV Store</h1><p style={{fontSize:14,color:C.sub,maxWidth:400,margin:"0 auto 24px"}}>Custom t-shirts with HTV designs</p><button onClick={addToCart} style={{background:C.red,color:"#fff",border:"none",padding:"12px 24px",borderRadius:8,fontWeight:700,cursor:"pointer"}}>Add Shirt to Cart ($34.99)</button></div></div>}
      
      {tab==="design"&&<div style={{textAlign:"center"}}><h2 style={{fontFamily:"Playfair Display,serif",fontSize:24,fontWeight:700}}>Design Studio</h2><p style={{color:C.sub,fontSize:12,marginBottom:20}}>Create your custom design and add to cart</p><button onClick={addToCart} style={{background:C.red,color:"#fff",border:"none",padding:"12px 24px",borderRadius:8,fontWeight:700,cursor:"pointer"}}>Add Design to Cart ($34.99)</button></div>}

      <div style={{maxWidth:500,margin:"40px auto 0",background:C.cd,borderRadius:10,padding:20,border:"1px solid "+C.bd}}><h3 style={{fontSize:16,fontWeight:700,margin:"0 0 16px"}}>Checkout</h3><div style={{marginBottom:12}}><label style={{fontSize:11,fontWeight:600,color:C.sub}}>Name *</label><input type="text" value={cNm} onChange={function(e){setCNm(e.target.value)}} placeholder="John Doe" style={{width:"100%",padding:10,background:"#F7F6F3",border:"1.5px solid "+C.bd,borderRadius:6,fontSize:12,marginTop:4,boxSizing:"border-box"}}/></div><div style={{marginBottom:12}}><label style={{fontSize:11,fontWeight:600,color:C.sub}}>Email *</label><input type="email" value={cEm} onChange={function(e){setCEm(e.target.value)}} placeholder="test@example.com" style={{width:"100%",padding:10,background:"#F7F6F3",border:"1.5px solid "+C.bd,borderRadius:6,fontSize:12,marginTop:4,boxSizing:"border-box"}}/></div><div style={{marginBottom:12}}><label style={{fontSize:11,fontWeight:600,color:C.sub}}>Phone *</label><input type="text" value={cPh} onChange={function(e){setCPh(e.target.value)}} placeholder="5551234567" style={{width:"100%",padding:10,background:"#F7F6F3",border:"1.5px solid "+C.bd,borderRadius:6,fontSize:12,marginTop:4,boxSizing:"border-box"}}/></div><div style={{padding:10,background:"#F7F6F3",borderRadius:6,marginBottom:14}}><div style={{fontSize:11}}>Subtotal: ${total.toFixed(2)}</div><div style={{fontSize:11,color:C.sub}}>Tax: ${tax.toFixed(2)}</div><div style={{fontSize:14,fontWeight:700,color:C.red,marginTop:4}}>Total: ${finalTotal.toFixed(2)}</div></div><button onClick={checkout} disabled={loading} style={{width:"100%",padding:14,background:loading?"#ccc":C.red,color:"#fff",border:"none",borderRadius:8,fontWeight:700,cursor:loading?"not-allowed":"pointer"}}>{loading?"Processing...":"Place Order"}</button></div>
    </main>

    <footer style={{borderTop:"1px solid "+C.bd,padding:"14px 12px",textAlign:"center",background:C.cd}}><Bar/><div style={{marginTop:10}}><img src={LOGO} alt="HTV" style={{width:"100%",maxWidth:300,borderRadius:3}}/><p style={{color:C.sub,fontSize:8,marginTop:4}}>(c) 2026 The HTV Store</p></div></footer>
    <style>{"@keyframes sp{to{transform:rotate(360deg)}}*{box-sizing:border-box}button:hover{opacity:.88}input:focus,select:focus,textarea:focus{border-color:"+C.cyan+"!important}"}</style>
  </div>;
}
