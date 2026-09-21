
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,onAuthStateChanged,signInWithEmailAndPassword,
  createUserWithEmailAndPassword,signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getFirestore,doc,setDoc,getDoc,collection,addDoc,onSnapshot,
  query,where,serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig={
  apiKey:"AIzaSyABpnRRv30zYTN0J_IReUgZPY88FSm9Omw",
  authDomain:"kurirtabin.firebaseapp.com",
  projectId:"kurirtabin",
  storageBucket:"kurirtabin.firebasestorage.app",
  messagingSenderId:"55763945350",
  appId:"1:55763945350:web:a06e1e51fea385aa494e07"
};

const firebaseApp=initializeApp(firebaseConfig);
const auth=getAuth(firebaseApp);
const db=getFirestore(firebaseApp);

let currentUser=null;
let currentRole="customer";
let currentView="home";
let stopOrders=null;

const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

function toast(message){
  const old=document.querySelector(".toast"); if(old) old.remove();
  const el=document.createElement("div"); el.className="toast"; el.textContent=message;
  document.body.appendChild(el); setTimeout(()=>el.remove(),2800);
}

function setView(v){currentView=v;render();}

function render(){
  const view=$("view");
  if(!view)return;
  if(currentView==="home")view.innerHTML=homeHTML();
  else if(currentView==="send")view.innerHTML=sendHTML();
  else if(currentView==="orders")view.innerHTML=ordersHTML();
  else view.innerHTML=profileHTML();

  document.querySelectorAll(".bottom-nav [data-view]").forEach(b=>{
    b.classList.toggle("active",b.dataset.view===currentView);
  });
  bindPage();
}

function homeHTML(){
  return `<section class="page">
    <div class="hero-card">
      <div>
        <div class="eyebrow">Tanjung Bintang</div>
        <h1>Jastip & Kurir</h1>
        <p>Kirim barang dan titip belanja dengan mudah.</p>
        <button class="primary-btn" data-action="send">+ Kirim Barang</button>
      </div>
      <div class="hero-icon">🛵</div>
    </div>
    <div class="section-title"><h2>Layanan</h2></div>
    <div class="service-grid">
      <button class="service-card" data-action="send"><span>📦</span><b>Kirim Barang</b><small>Pesan kurir untuk mengirim barang</small></button>
      <button class="service-card" data-action="orders"><span>🧾</span><b>Pesanan Saya</b><small>Lihat status pesanan</small></button>
      <button class="service-card" data-action="store"><span>🛍️</span><b>Jastip & Store</b><small>Belanja melalui layanan kami</small></button>
    </div>
    <div class="info-card"><b>📍 Area layanan</b><p>Tanjung Bintang dan area sekitarnya, Lampung Selatan.</p></div>
  </section>`;
}

function sendHTML(){
  return `<section class="page">
    <div class="page-head"><button class="back-btn" data-action="home">←</button><div><div class="eyebrow">Pesanan baru</div><h1>Kirim Barang</h1></div></div>
    <div class="form-card">
      <label>Nama pengirim</label><input id="senderName" placeholder="Nama pengirim">
      <label>No. WhatsApp</label><input id="senderPhone" inputmode="tel" placeholder="08xxxxxxxxxx">
      <label>Lokasi pickup</label><div class="input-row"><input id="pickup" placeholder="Alamat pickup"><button class="map-btn" data-action="pickupMap">Maps</button></div>
      <label>Lokasi tujuan</label><div class="input-row"><input id="destination" placeholder="Alamat tujuan"><button class="map-btn" data-action="destinationMap">Maps</button></div>
      <label>Nama penerima</label><input id="receiverName" placeholder="Nama penerima">
      <label>No. WhatsApp penerima</label><input id="receiverPhone" inputmode="tel" placeholder="08xxxxxxxxxx">
      <label>Detail barang</label><textarea id="itemDetail" rows="3" placeholder="Contoh: 1 dus frozen food"></textarea>
      <label>Catatan</label><textarea id="note" rows="3" placeholder="Catatan tambahan (opsional)"></textarea>
      <button class="primary-btn full" data-action="submit">Buat Pesanan</button>
    </div>
  </section>`;
}

function ordersHTML(){
  return `<section class="page"><div class="page-head"><div><div class="eyebrow">Riwayat</div><h1>Pesanan Saya</h1></div></div>
  <div id="ordersList" class="orders-list"><div class="empty-card">Memuat pesanan...</div></div></section>`;
}

function profileHTML(){
  return `<section class="page"><div class="page-head"><div><div class="eyebrow">Akun</div><h1>Profil</h1></div></div>
  <div class="profile-card"><div class="profile-avatar">👤</div>
  <h2>${esc(currentUser?.email||"Belum login")}</h2>
  <p>${currentUser?`Akun ${esc(currentRole)}`:"Silakan masuk untuk membuat pesanan."}</p>
  ${currentUser?`<button class="danger-btn full" data-action="logout">Keluar</button>`:`<button class="primary-btn full" data-action="login">Masuk</button>`}
  </div></section>`;
}

function bindPage(){
  document.querySelectorAll("[data-action]").forEach(el=>{
    if(el.dataset.bound)return; el.dataset.bound="1";
    el.addEventListener("click",async e=>{
      e.preventDefault();
      const a=el.dataset.action;
      if(a==="home"||a==="send"||a==="orders")setView(a);
      if(a==="login")showAuth();
      if(a==="logout")await signOut(auth);
      if(a==="store")toast("Fitur Store/Jastip akan kita lanjutkan setelah aplikasi utama stabil.");
      if(a==="pickupMap")openMap("pickup");
      if(a==="destinationMap")openMap("destination");
      if(a==="submit")await createOrder();
    });
  });
  if(currentView==="orders")watchOrders();
}

function openMap(type){
  const value=$(type)?.value?.trim();
  if(!value){toast("Isi lokasi terlebih dahulu.");return;}
  window.open("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(value),"_blank");
}

async function createOrder(){
  if(!currentUser){showAuth();return;}
  const pickup=$("pickup")?.value.trim()||"",destination=$("destination")?.value.trim()||"";
  if(!pickup||!destination){toast("Lokasi pickup dan tujuan wajib diisi.");return;}
  try{
    await addDoc(collection(db,"orders"),{
      customerId:currentUser.uid,customerEmail:currentUser.email||"",
      senderName:$("senderName")?.value.trim()||"",
      senderPhone:$("senderPhone")?.value.trim()||"",
      pickup,destination,
      receiverName:$("receiverName")?.value.trim()||"",
      receiverPhone:$("receiverPhone")?.value.trim()||"",
      itemDetail:$("itemDetail")?.value.trim()||"",
      note:$("note")?.value.trim()||"",
      status:"Menunggu",createdAt:serverTimestamp()
    });
    toast("Pesanan berhasil dibuat.");
    setView("orders");
  }catch(e){console.error(e);toast("Gagal menyimpan. Periksa Firestore Rules.");}
}

function watchOrders(){
  const list=$("ordersList"); if(!list)return;
  if(!currentUser){list.innerHTML=`<div class="empty-card"><b>Belum login</b><p>Masuk terlebih dahulu untuk melihat pesanan.</p><button class="primary-btn" data-action="login">Masuk</button></div>`;bindPage();return;}
  if(stopOrders){stopOrders();stopOrders=null;}
  const q=query(collection(db,"orders"),where("customerId","==",currentUser.uid));
  stopOrders=onSnapshot(q,snap=>{
    if(currentView!=="orders")return;
    const rows=[];snap.forEach(d=>rows.push({id:d.id,...d.data()}));
    rows.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    if(!rows.length){list.innerHTML=`<div class="empty-card"><b>Belum ada pesanan</b><p>Pesanan yang dibuat akan tampil di sini.</p></div>`;return;}
    list.innerHTML=rows.map(o=>`<article class="order-card">
      <div class="order-top"><b>${esc(o.itemDetail||"Pesanan kurir")}</b><span class="status">${esc(o.status||"Menunggu")}</span></div>
      <div class="route"><div>📍 ${esc(o.pickup||"-")}</div><div>📦 ${esc(o.destination||"-")}</div></div>
      <div class="order-meta">Penerima: ${esc(o.receiverName||"-")}</div>
      <button class="route-btn" data-route="${esc(o.pickup||"")}||${esc(o.destination||"")}">🗺️ Lihat rute</button>
    </article>`).join("");
    document.querySelectorAll("[data-route]").forEach(b=>{
      b.addEventListener("click",()=>{
        const [o,d]=b.dataset.route.split("||");
        window.open("https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(o)+"&destination="+encodeURIComponent(d),"_blank");
      });
    });
  },e=>{console.error(e);list.innerHTML=`<div class="empty-card"><b>Pesanan belum dapat dimuat</b><p>Periksa koneksi Firebase dan Firestore Rules.</p></div>`});
}

function showAuth(){
  const root=$("modal");
  root.innerHTML=`<div class="modal-backdrop" id="authBackdrop">
    <div class="modal-card">
      <button class="modal-close" id="closeAuth">×</button>
      <h2>Masuk</h2><p>Gunakan akun customer atau admin.</p>
      <input id="authEmail" type="email" placeholder="Email">
      <input id="authPassword" type="password" placeholder="Password">
      <button class="primary-btn full" id="doLogin">Masuk</button>
      <button class="secondary-btn full" id="doRegister">Daftar akun baru</button>
      <div id="authMessage" class="auth-message"></div>
    </div></div>`;
  $("closeAuth").onclick=closeAuth;
  $("authBackdrop").addEventListener("click",e=>{if(e.target.id==="authBackdrop")closeAuth()});
  $("doLogin").onclick=login;
  $("doRegister").onclick=register;
}

function closeAuth(){$("modal").innerHTML=""}
function authError(msg){$("authMessage").textContent=msg}

async function login(){
  const email=$("authEmail").value.trim(),password=$("authPassword").value;
  if(!email||!password){authError("Email dan password wajib diisi.");return;}
  try{await signInWithEmailAndPassword(auth,email,password);closeAuth();toast("Berhasil masuk.");}
  catch(e){console.error(e);authError("Email atau password salah.");}
}

async function register(){
  const email=$("authEmail").value.trim(),password=$("authPassword").value;
  if(!email||!password){authError("Email dan password wajib diisi.");return;}
  if(password.length<6){authError("Password minimal 6 karakter.");return;}
  try{
    const c=await createUserWithEmailAndPassword(auth,email,password);
    await setDoc(doc(db,"users",c.user.uid),{email,role:"customer",createdAt:serverTimestamp()});
    closeAuth();toast("Akun berhasil dibuat.");
  }catch(e){console.error(e);authError(e.message||"Pendaftaran gagal.");}
}

async function loadRole(u){
  currentRole="customer";
  try{
    const snap=await getDoc(doc(db,"users",u.uid));
    if(snap.exists())currentRole=snap.data().role||"customer";
  }catch(e){console.warn("Role tidak dapat dibaca:",e)}
}

document.querySelectorAll(".bottom-nav [data-view]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
$("authBtn").addEventListener("click",()=>currentUser?signOut(auth):showAuth());

onAuthStateChanged(auth,async u=>{
  currentUser=u||null;
  if(u)await loadRole(u);
  else currentRole="customer";
  $("authBtn").textContent=u?"Keluar":"Masuk";
  render();
});

render();
