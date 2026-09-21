import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {getFirestore,doc,setDoc,collection,addDoc,onSnapshot,query,where,serverTimestamp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyABpnRRv30zYTN0J_IReUgZPY88FSm9Omw",authDomain:"kurirtabin.firebaseapp.com",projectId:"kurirtabin",storageBucket:"kurirtabin.firebasestorage.app",messagingSenderId:"55763945350",appId:"1:55763945350:web:a06e1e51fea385aa494e07"};
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
let user=null,current="home",orders=[];

const view=document.getElementById("view"),modal=document.getElementById("modal");
const esc=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

function nav(v){current=v;render()}
document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>nav(b.dataset.view));
document.getElementById("authBtn").onclick=()=>user?logout():authModal();

onAuthStateChanged(auth,u=>{user=u;document.getElementById("authBtn").textContent=u?"Keluar":"Masuk";listenOrders();render()});

function home(){return `<div class="page"><section class="hero"><h1>Kirim & Jastip lebih mudah</h1><p>Pesan kurir lokal Tanjung Bintang langsung dari HP.</p><button class="btn" onclick="navSend()">Kirim Barang Sekarang</button></section><div class="grid"><button class="tile" onclick="navSend()">📦<b>Kirim Barang</b><small>Pickup ke tujuan</small></button><button class="tile" onclick="nav('orders')">📋<b>Pesanan Saya</b><small>Lihat status</small></button><button class="tile" onclick="openMaps()">🗺️<b>Google Maps</b><small>Cari lokasi</small></button><button class="tile" onclick="nav('profile')">👤<b>Profil</b><small>Akun saya</small></button></div></div>`}
function send(){return `<div class="page"><h2>Kirim Barang</h2><div class="card">
<label class="label">Lokasi Pickup</label><div class="row"><input id="pickup" class="input" placeholder="Contoh: Toko ABC, Tanjung Bintang"><button class="btn" onclick="mapsField('pickup')">Maps</button></div>
<label class="label">Lokasi Tujuan</label><div class="row"><input id="dest" class="input" placeholder="Alamat tujuan"><button class="btn" onclick="mapsField('dest')">Maps</button></div>
<div class="mapbox">📍 Pickup → 🛵 Kurir → 🏁 Tujuan<br><span class="muted">Rute dibuka melalui Google Maps.</span></div>
<label class="label">Barang / Catatan</label><textarea id="note" class="input" rows="3" placeholder="Isi barang dan catatan"></textarea>
<button class="btn" style="width:100%" onclick="createOrder()">Buat Pesanan</button></div></div>`}
function ordersPage(){return `<div class="page"><h2>Pesanan Saya</h2>${user?orders.map(o=>`<div class="card order"><b>${esc(o.id?.slice(-6)||"Pesanan")}</b><span class="status">${esc(o.status||"baru")}</span><p>📍 ${esc(o.pickup)}</p><p>🏁 ${esc(o.destination)}</p><button class="btn" onclick="route('${encodeURIComponent(o.pickup)}','${encodeURIComponent(o.destination)}')">Lihat Rute</button></div>`).join("")||'<div class="card">Belum ada pesanan.</div>':'<div class="card">Silakan masuk untuk melihat pesanan.</div>'}</div>`}
function profile(){return `<div class="page"><h2>Profil</h2><div class="card">${user?`<b>${esc(user.email)}</b><p class="muted">Akun Customer</p><button class="btn danger" onclick="logout()">Keluar</button>`:`<p>Anda belum masuk.</p><button class="btn" onclick="authModal()">Masuk / Daftar</button>`}</div></div>`}
function render(){view.innerHTML=current==="home"?home():current==="send"?send():current==="orders"?ordersPage():profile();document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===current))}
window.nav=nav;window.navSend=()=>nav("send");

function authModal(){modal.classList.remove("hidden");modal.innerHTML=`<div class="modalbox"><button class="close" onclick="closeModal()">✕</button><h2>Masuk / Daftar</h2><input id="email" class="input" type="email" placeholder="Email"><input id="pass" class="input" type="password" placeholder="Password"><div class="row"><button class="btn" onclick="login()">Masuk</button><button class="btn" onclick="register()">Daftar</button></div><p id="authMsg" class="muted"></p></div>`}
window.closeModal=()=>modal.classList.add("hidden");
window.login=async()=>{try{await signInWithEmailAndPassword(auth,email.value,pass.value);closeModal()}catch(e){authMsg.textContent="Gagal masuk: "+e.code}};
window.register=async()=>{try{const c=await createUserWithEmailAndPassword(auth,email.value,pass.value);await setDoc(doc(db,"users",c.user.uid),{email:c.user.email,role:"customer",createdAt:serverTimestamp()});closeModal()}catch(e){authMsg.textContent="Gagal daftar: "+e.code}};
window.logout=()=>signOut(auth);

function listenOrders(){if(!user){orders=[];return}onSnapshot(query(collection(db,"orders"),where("customerUid","==",user.uid)),s=>{orders=s.docs.map(d=>({id:d.id,...d.data()}));if(current==="orders")render()})}
window.createOrder=async()=>{if(!user){authModal();return}const p=document.getElementById("pickup").value.trim(),d=document.getElementById("dest").value.trim(),n=document.getElementById("note").value.trim();if(!p||!d){alert("Pickup dan tujuan wajib diisi.");return}await addDoc(collection(db,"orders"),{customerUid:user.uid,customerEmail:user.email,pickup:p,destination:d,note:n,status:"baru",createdAt:serverTimestamp()});alert("Pesanan berhasil dibuat.");nav("orders")};
window.mapsField=t=>{const el=document.getElementById(t);const q=el?.value.trim()||"Tanjung Bintang, Lampung Selatan";openMaps(q)};
window.openMaps=q=>window.open("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q||"Tanjung Bintang, Lampung Selatan"),"_blank");
window.route=(p,d)=>window.open("https://www.google.com/maps/dir/?api=1&origin="+p+"&destination="+d+"&travelmode=driving","_blank");
render();