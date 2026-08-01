# Documento 4: Wireframes y Diseño UX/UI

Este documento define la experiencia de usuario (UX) y el diseño visual (UI) para el **Sistema Web de Caja e Inventario para la Licorería "La Ruta"**, adaptando una estética moderna, limpia y funcional inspirada en Stripe, Linear y Notion.

---

## 1. Lineamientos de Diseño Visual (Look & Feel)

El diseño busca transmitir profesionalismo, simplicidad y eficiencia mediante las siguientes directrices:

* **Paleta de Colores (Estilo Linear / Dark Mode Optativo):**
  * Fondo General: Slate muy claro (`#f8fafc`) o gris neutro premium.
  * Tarjetas y Paneles: Blanco puro (`#ffffff`) con bordes sutiles en Slate (`#e2e8f0`).
  * Color de Acento (Acción): Violeta Eléctrico/Indigo (`#6366f1` / `#4f46e5`) - Estilo Stripe.
  * Alertas y Estados:
    * Éxito/Caja Abierta: Verde Esmeralda (`#10b981`).
    * Peligro/Stock Crítico/Caja Cerrada: Rojo Coral (`#ef4444`).
    * Advertencia/Stock Mínimo: Ámbar (`#f59e0b`).
* **Tipografía (Estilo Notion):**
  * Fuente sans-serif de alta legibilidad, preferiblemente **Inter** u **Outfit** desde Google Fonts.
  * Escala tipográfica limpia, favoreciendo textos medianos/pequeños con pesos contrastantes (Medium, Semi-Bold) para jerarquizar datos.
* **Componentes UI (Estilo Shadcn UI):**
  * Bordes redondeados sutiles (`rounded-lg` o `8px`).
  * Sombras suaves de elevación (`shadow-sm`, `shadow-md` para modales).
  * Transiciones rápidas y suaves en estados hover (`duration-200 ease-in-out`).

---

## 2. Wireframes Estructurados de Vistas Clave

Dado que el cajero opera principalmente desde una tablet o laptop en el mostrador, las vistas están optimizadas para una distribución de pantalla eficiente y responsive (Mobile-first en visualización de reportes, Desktop-first en el POS).

### 2.1 Vista: Terminal de Ventas (POS)

```text
+---------------------------------------------------------------------------------------------------+
|  LA RUTA  [ Caja: ABIERTA (Verde) ]                       Usuario: Carlos (Cajero)  [Cerrar Turno] |
+---------------------------------------------------------------------------------------------------+
|  CATEGORÍAS                                |  PRODUCTOS (Filtrados)        |  DETALLE DE LA VENTA |
|  [ Todos ] [ Cervezas ] [ Vinos ]          |  +--------------------------+ |  Impulsadora:        |
|  [ Whisky ] [ Ron ] [ Vodka ] [ Snacks ]   |  | Cerveza Paceña 620ml     | |  [ Janely        [V] ] |
|                                            |  | Stock: 45                | |  ----------------- |
|  BUSCADOR DE PRODUCTOS                     |  | Precio: 12.00 Bs         | |  1x Cerveza Paceña |
|  [ Buscar por nombre...                ]   |  | [ + Agregar ]            | |     12.00 Bs       |
|                                            |  +--------------------------+ |  1x Whisky Black     |
|                                            |  | Whisky Black Label       | |     150.00 Bs      |
|                                            |  | Stock: 8                 | |  ----------------- |
|                                            |  | Precio: 150.00 Bs        | |  MÉTODO DE PAGO    |
|                                            |  | [ + Agregar ]            | |  [Efectivo] [QR]   |
|                                            |  +--------------------------+ |  [Transferencia]     |
|                                            |  | Vodka Absolut 750ml      | |  ----------------- |
|                                            |  | Stock: 2 (MÍNIMO)        | |  TOTAL A PAGAR     |
|                                            |  | [ + Agregar ]            | |  162.00 Bs         |
|                                            |  +--------------------------+ |                      |
|                                            |                               |  [ COBRAR VENTA (V) ]|
+--------------------------------------------+-------------------------------+----------------------+
```

* **Comportamiento UX (POS):**
  * Al hacer clic en `[ + Agregar ]`, el producto se suma al panel derecho.
  * Si el stock de un producto está en su stock mínimo, la tarjeta del producto muestra un badge ámbar indicando "Bajo Stock". Si está en 0, la tarjeta se opaca y el botón cambia a `[ Agotado ]` (deshabilitado).
  * El botón **`[ COBRAR VENTA ]`** permanece deshabilitado hasta que se asocie una impulsadora (o la opción "Venta Directa/Sin Impulsadora") y se seleccione un método de pago.

---

### 2.2 Vista: Apertura de Caja (Modal/Pantalla Completa Centrada)

```text
+-------------------------------------------------------------+
|                                                             |
|                   LICORERÍA "LA RUTA"                       |
|                                                             |
|                     Apertura de Caja                        |
|                     Fecha: 03/06/2026                       |
|                                                             |
|   Dinero Inicial en Billetes (Efectivo):                    |
|   [ 150.00                                              ]   |
|                                                             |
|   Dinero Inicial en Monedas (Efectivo):                     |
|   [ 50.00                                               ]   |
|                                                             |
|   Total Inicial Calculado: 200.00 Bs                        |
|                                                             |
|   Entregado Por:                                            |
|   [ Supervisor Turno Mañana                            ]   |
|                                                             |
|   Recibido Por (Cajero actual):                             |
|   [ Carlos Pérez                                       ]   |
|                                                             |
|                       [ ABRIR CAJA ]                        |
+-------------------------------------------------------------+
```

* **Comportamiento UX (Apertura):**
  * La pantalla bloquea el acceso a cualquier otra sección del sistema hasta que se realice la apertura formal.
  * El total inicial se calcula automáticamente sumando de forma reactiva los inputs de billetes y monedas.

---

### 2.3 Vista: Cierre de Caja

```text
+---------------------------------------------------------------------------------------------------+
|  Resumen del Turno Actual                                                       Fecha: 03/06/2026 |
+---------------------------------------------------------------------------------------------------+
|  MONTO INICIAL:  200.00 Bs |  VENTAS QR:   80.00 Bs |  VENTAS TRANSFERENCIA:  50.00 Bs            |
+----------------------------+------------------------+---------------------------------------------+
|  VENTAS EFECTIVO: 120.00 Bs|  EGRESOS EFECTIVO: 15.00 Bs                                           |
+----------------------------+----------------------------------------------------------------------+
|  SALDO EN EFECTIVO ESPERADO EN CAJA: 305.00 Bs                                                    |
|                                                                                                   |
|  Ingrese el dinero en efectivo físico real en caja:                                               |
|  [ 300.00                                                                                      ]  |
|                                                                                                   |
|  DIFERENCIA CALCULADA: -5.00 Bs (FALTANTE)                                                        |
|                                                                                                   |
|  Notas / Justificación del Cierre:                                                                |
|  [ Faltaron 5 pesos por cambio entregado de más.                                               ]  |
|                                                                                                   |
|                                     [ CONFIRMAR Y CERRAR TURNO ]                                  |
+---------------------------------------------------------------------------------------------------+
```

* **Comportamiento UX (Cierre):**
  * El campo de notas se vuelve obligatorio si la diferencia calculada es distinta de 0.
  * Al hacer clic en `[ CONFIRMAR Y CERRAR TURNO ]`, se abre un modal de doble confirmación ("¿Estás seguro de cerrar la caja? Esta acción no se puede deshacer").

---

### 2.4 Vista: Inventario (Administración)

```text
+---------------------------------------------------------------------------------------------------+
|  Inventario de Productos                                                     [ + Nuevo Producto ] |
+---------------------------------------------------------------------------------------------------+
|  [ Buscar producto...      ]  Categoría: [ Todas        [V] ]  Estado Stock: [ Todos          [V] ] |
+---------------------------------------------------------------------------------------------------+
|  Nombre               | Categoría | P. Compra | P. Venta | Stock Actual | St. Mínimo | Estado      |
+-----------------------+-----------+-----------+----------+--------------+------------+-------------+
|  Whisky Black Label   | Whisky    | 110.00 Bs | 150.00 Bs| 8            | 3          | Activo      |
|  Cerveza Paceña 620ml | Cervezas  | 8.50 Bs   | 12.00 Bs | 45           | 10         | Activo      |
|  Vodka Absolut 750ml  | Vodka     | 55.00 Bs  | 75.00 Bs | 2            | 5          | BAJO STOCK  |
|  Snack Papas Lay's    | Snacks    | 3.50 Bs   | 5.00 Bs  | 0            | 5          | SIN STOCK   |
+-----------------------+-----------+-----------+----------+--------------+------------+-------------+
|  Páginas: [1] 2 3 ...                                                                             |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Micro-interacciones y Accesos Rápidos

1. **Atajos de Teclado (Para agilizar la venta):**
   * `F1`: Enfocar el buscador de productos.
   * `F2`: Abrir selector de impulsadoras.
   * `Space`: Confirmar cobro de venta (cuando el formulario sea válido).
2. **Alertas Toast (Shadcn UI Toast):**
   * Venta exitosa: Mensaje verde en la esquina superior derecha: *"Venta #1042 registrada (+162.00 Bs)"*.
   * Error de stock: Mensaje rojo: *"Error: No hay stock suficiente de Snack Papas Lay's"*.
3. **Skeleton Loading Screens:**
   * Durante la carga inicial de los productos o reportes, se muestran contenedores sombreados estilo esqueleto (Shadcn Skeleton) en lugar de una pantalla en blanco, reduciendo la percepción del tiempo de espera del usuario.
