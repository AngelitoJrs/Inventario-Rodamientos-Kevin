#  Inventario Industrial – Rodamientos Kevin

Una solución profesional de **Gestión de Inventario en Tiempo Real** diseñada específicamente para la industria de rodamientos y repuestos industriales. Este sistema permite el control técnico de SKU, seguimiento de auditoría de movimientos y exportación de bitácoras comerciales.



##  Características Principales

* **Gestión Técnica de SKU:** Control detallado por código técnico, marca (SKF, FAG, NSK, etc.) y descripción.
* **Auditoría de Movimientos:** Registro histórico de cada Entrada (Compra) y Salida (Venta) con trazabilidad de clientes y proveedores.
* **Triple Filtrado Inteligente:** Búsqueda instantánea en memoria por SKU, Marca o Descripción.
* **Exportación de Notas de Entrega:** Generación de reportes en formato CSV (compatible con Excel) con codificación profesional.
* **Persistencia en la Nube:** Integración con **Firebase Firestore** para sincronización en tiempo real.
* **Diseño UX Premium:** Interfaz construida con Bootstrap 5, animaciones de `animate.css` y tipografía `Inter`.

##  Stack Tecnológico

* **Frontend:** HTML5, CSS3 (Custom Properties), JavaScript (ES6+ Modules).
* **Framework CSS:** Bootstrap 5.3 + Bootstrap Icons.
* **Backend as a Service (BaaS):** Firebase Firestore.
* **Lógica de Datos:** Integración asíncrona (Async/Await) con la SDK de Firebase v10.



##  Estructura de Datos (Firestore)

El sistema utiliza dos colecciones principales:

1.  **`productos`**: Almacena el estado actual del inventario.
    * `id` (SKU), `marca`, `nombre`, `precio`, `stock`.
2.  **`historial`**: Bitácora de transacciones.
    * `productoId`, `cantidad`, `tipo` (VENTA/COMPRA), `entidad` (Cliente/Proveedor), `referencia`, `fecha`.

##  Configuración

1.  Clona el repositorio.
2.  Configura tu archivo `firebase-config.js` con tus credenciales de Firebase.
3.  Abre `index.html` con la extensión **Live Server** en VS Code.

---
**Proyecto desarrollado para la optimización de procesos logísticos.**