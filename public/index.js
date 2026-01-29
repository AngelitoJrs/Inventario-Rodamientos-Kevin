import { db } from './firebase-config.js';
import { collection, doc, setDoc, getDocs, updateDoc, increment, serverTimestamp, deleteDoc, addDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let productosLocal = [];
let operacionActual = "";
const modalBS = new bootstrap.Modal(document.getElementById('modalOperacion'));

// --- RENDERIZADO CON DISEÑO PROFESIONAL ---
const renderizarTabla = (lista) => {
    const tbody = document.getElementById('tablaProductos');
    tbody.innerHTML = lista.map((p, index) => `
        <tr class="animate__animated animate__fadeIn" style="animation-delay: ${index * 0.05}s">
            <td class="text-start">
                <div class="fw-bold text-dark">${p.id}</div>
                <div class="text-primary small fw-semibold">${p.marca}</div>
                <div class="text-muted" style="font-size: 0.75rem;">${p.nombre}</div>
            </td>
            <td>
                <span class="badge-stock ${p.stock <= 5 ? 'bg-danger bg-opacity-10 text-danger' : 'bg-success bg-opacity-10 text-success'}">
                    ${p.stock} Unid.
                </span>
            </td>
            <td class="fw-bold">$${p.precio}</td>
            <td>
                <div class="d-flex justify-content-center gap-2">
                    <button class="btn btn-gestion btn-outline-primary" onclick="abrirModal('${p.id}', 'COMPRA')" title="Entrada"><i class="bi bi-arrow-down-left"></i></button>
                    <button class="btn btn-gestion btn-outline-success" onclick="abrirModal('${p.id}', 'VENTA')" title="Venta"><i class="bi bi-cart3"></i></button>
                    <button class="btn btn-gestion btn-outline-secondary" onclick="eliminarProducto('${p.id}')"><i class="bi bi-trash3"></i></button>
                </div>
            </td>
        </tr>`).join('');
};

window.cargarHistorial = async () => {
    const q = query(collection(db, "historial"), orderBy("fecha", "desc"), limit(30));
    const snap = await getDocs(q);
    document.getElementById('tablaHistorial').innerHTML = snap.docs.map(doc => {
        const m = doc.data();
        const icon = m.tipo === 'VENTA' ? 'bi-arrow-up-right text-warning' : 'bi-arrow-down-left text-info';
        return `
        <tr class="animate__animated animate__fadeIn">
            <td style="width: 50px;"><i class="bi ${icon} fs-4"></i></td>
            <td class="text-start">
                <div class="fw-bold">${m.productoId}</div>
                <div class="small text-muted">${m.entidad || 'S/E'} | Ref: ${m.referencia || 'N/A'}</div>
            </td>
            <td><span class="small fw-bold text-uppercase">${m.tipo}</span></td>
            <td class="fw-bold ${m.tipo === 'VENTA' ? 'text-danger' : 'text-success'}">
                ${m.tipo === 'VENTA' ? '-' : '+'}${m.cantidad}
            </td>
            <td class="text-muted small">${m.fecha?.toDate().toLocaleDateString() || ''}</td>
        </tr>`;
    }).join('');
};

// --- LOGICA DE DATOS ---
export const guardarProducto = async () => {
    const id = document.getElementById('sku').value.toUpperCase().trim();
    const marca = document.getElementById('marca').value.toUpperCase().trim() || "S/M";
    const nombre = document.getElementById('nombre').value.trim() || "Sin descripción";
    const stock = Number(document.getElementById('stock').value);
    const precio = Number(document.getElementById('precio').value);

    if (!id) return;
    await setDoc(doc(db, "productos", id), { nombre, marca, stock, precio, ultimaActualizacion: serverTimestamp() }, { merge: true });
    document.getElementById('formProducto').reset();
    cargarInventario();
};

window.abrirModal = (id, tipo) => {
    operacionActual = tipo;
    const p = productosLocal.find(x => x.id === id);
    document.getElementById('opId').value = id;
    document.getElementById('modalTitulo').innerText = tipo === 'VENTA' ? 'Registrar Salida (Venta)' : 'Registrar Entrada (Compra)';
    
    // Ajuste de labels dinámicos para Cliente/Proveedor
    const labelTercero = document.getElementById('labelTercero');
    if(labelTercero) labelTercero.innerText = tipo === 'VENTA' ? 'CLIENTE / EMPRESA' : 'PROVEEDOR';
    
    document.getElementById('divPrecioCosto').style.display = tipo === 'COMPRA' ? 'block' : 'none';
    document.getElementById('formOperacion').reset();
    modalBS.show();
};

document.getElementById('btnConfirmarOp').onclick = async () => {
    const id = document.getElementById('opId').value;
    const cant = Number(document.getElementById('opCantidad').value);
    const tercero = document.getElementById('opTercero').value.toUpperCase().trim() || "CONTADO";
    const nota = document.getElementById('opNota').value.trim() || "S/N";
    const p = productosLocal.find(x => x.id === id);

    try {
        let precioHistorico = p.precio;
        if (operacionActual === "VENTA") {
            if (cant > p.stock) return alert("Error: Stock insuficiente");
            await updateDoc(doc(db, "productos", id), { stock: increment(-cant) });
        } else {
            precioHistorico = Number(document.getElementById('opPrecioCosto').value) || 0;
            await updateDoc(doc(db, "productos", id), { stock: increment(cant) });
        }
        
        await addDoc(collection(db, "historial"), { 
            productoId: id, 
            descripcion: p.nombre, 
            tipo: operacionActual, 
            cantidad: cant, 
            entidad: tercero,
            referencia: nota,
            precioOp: precioHistorico,
            fecha: serverTimestamp() 
        });

        modalBS.hide();
        cargarInventario();
    } catch (e) { alert("Error en proceso"); }
};

// --- FUNCIÓN EXCEL (CSV PROFESIONAL) ---
window.exportarCSV = async () => {
    const snap = await getDocs(query(collection(db, "historial"), orderBy("fecha", "desc")));
    
    // BOM para que Excel abra correctamente con tildes y las columnas no se amontonen
    let csv = "\uFEFF"; 
    csv += "FECHA;TIPO;PRODUCTO (SKU);ENTIDAD (CLIENTE/PROV);REF. NOTA;CANTIDAD;PRECIO UNIT ($);TOTAL\n";

    snap.forEach(d => {
        const r = d.data();
        const fecha = r.fecha?.toDate().toLocaleString() || "";
        const total = (r.cantidad * (r.precioOp || 0)).toFixed(2);
        
        // El punto y coma (;) ayuda a que Excel separe las columnas automáticamente
        csv += `${fecha};${r.tipo};${r.productoId};${r.entidad};${r.referencia};${r.cantidad};${r.precioOp || 0};${total}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Inventario_Kevin_${new Date().toLocaleDateString()}.csv`;
    link.click();
};

export const cargarInventario = async () => {
    const snap = await getDocs(collection(db, "productos"));
    productosLocal = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderizarTabla(productosLocal);
};

window.eliminarProducto = async (id) => {
    if (confirm("¿Eliminar este rodamiento definitivamente?")) {
        await deleteDoc(doc(db, "productos", id));
        cargarInventario();
    }
};

const filtrar = () => {
    const s = document.getElementById('buscarSku').value.toUpperCase();
    const m = document.getElementById('buscarMarca').value.toUpperCase();
    const d = document.getElementById('buscarDesc').value.toUpperCase();
    
    renderizarTabla(productosLocal.filter(p => 
        p.id.includes(s) && 
        (p.marca || "").includes(m) && 
        (p.nombre || "").toUpperCase().includes(d)
    ));
};

// --- EVENTOS ---
document.getElementById('btnGuardar').onclick = guardarProducto;
document.getElementById('buscarSku').onkeyup = filtrar;
document.getElementById('buscarMarca').onkeyup = filtrar;
document.getElementById('buscarDesc').onkeyup = filtrar;
document.getElementById('btnExportar').onclick = window.exportarCSV;
document.getElementById('hist-tab').onclick = window.cargarHistorial;
window.onload = cargarInventario;