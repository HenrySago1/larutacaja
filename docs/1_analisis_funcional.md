# Documento 1: Análisis Funcional y Reglas de Negocio

Este documento detalla los requerimientos funcionales, perfiles de usuario, historias de usuario, casos de uso y reglas de negocio del **Sistema Web de Caja e Inventario para la Licorería "La Ruta"**.

---

## 1. Perfiles de Usuario

El sistema requiere dos roles diferenciados para el control interno de la única tienda:

| Rol | Descripción | Permisos Clave |
| :--- | :--- | :--- |
| **Cajero (Operador)** | Responsable de la operación diaria del punto de venta. | Apertura de caja, registro de ventas, gastos diarios, cierre de caja. Lectura del inventario. |
| **Administrador** | Propietario o encargado general con control total del negocio. | Gestión de inventario (precios, stock inicial, stock mínimo), reportes históricos, gestión de cajeros e impulsadoras, auditoría de cierres de caja. |

*Nota: Las impulsadoras no tienen acceso directo al sistema; sus ventas son registradas por el cajero seleccionando su nombre de una lista en el punto de venta.*

---

## 2. Historias de Usuario

Las historias de usuario están redactadas desde la perspectiva de los roles definidos e incluyen criterios de aceptación en formato Gherkin (Dado/Cuando/Entonces).

### HU-01: Apertura de Caja (Cajero)
**Como** Cajero,  
**quiero** registrar la apertura de caja especificando el dinero disponible,  
**para** iniciar la jornada laboral con un saldo inicial controlado y transparente.

* **Criterios de Aceptación:**
  * **Escenario 1: Apertura exitosa con caja previa cerrada**
    * **Dado** que no hay ninguna caja activa en el sistema,
    * **Cuando** accedo a la pantalla de "Apertura de Caja" e ingreso el total de billetes, total de monedas, quién entrega y quién recibe,
    * **Entonces** el sistema valida los datos, calcula el total inicial automáticamente (Suma de Billetes + Monedas) y me permite abrir la caja de la fecha y hora actuales.
  * **Escenario 2: Intento de apertura con caja ya activa**
    * **Dado** que ya existe una caja activa (abierta),
    * **Cuando** intento ingresar a la pantalla de apertura,
    * **Entonces** el sistema me redirige al dashboard de ventas activas con un mensaje indicando que ya existe un turno abierto.

### HU-02: Registro de Venta Diaria (Cajero)
**Como** Cajero,  
**quiero** registrar cada venta detallando el producto, precio, tipo de pago e impulsadora responsable,  
**para** mantener el inventario al día y registrar la productividad/propinas de las impulsadoras.

* **Criterios de Aceptación:**
  * **Escenario 1: Venta exitosa con stock suficiente**
    * **Dado** que la caja está abierta y hay stock suficiente del producto "Black Label",
    * **Cuando** selecciono el producto, el tipo de pago ("QR", "Efectivo", "Transferencia") y a la impulsadora "Janely", y guardo la venta,
    * **Entonces** el sistema descuenta 1 unidad del inventario, suma el precio al total correspondiente de ventas del turno y registra la venta exitosamente.
  * **Escenario 2: Bloqueo por falta de stock**
    * **Dado** que el stock de "Cerveza Paceña" es 0,
    * **Cuando** intento agregar el producto a la venta,
    * **Entonces** el sistema muestra un indicador de "Sin Stock" e impide procesar la venta.

### HU-03: Registro de Egresos y Compras Menores (Cajero)
**Como** Cajero,  
**quiero** registrar las salidas de dinero para gastos del día (hielo, sodas, transporte, proveedores),  
**para** justificar el dinero en efectivo que saldrá físicamente de la caja.

* **Criterios de Aceptación:**
  * **Escenario 1: Registro correcto de gasto en efectivo**
    * **Dado** que la caja está abierta,
    * **Cuando** registro un gasto con la categoría "Insumos" (ej. Hielo), detalle "Bolsas de hielo para bar" y monto "15.00",
    * **Entonces** el sistema resta este monto de la caja física esperada (efectivo) y lo añade a la lista de egresos del día.

### HU-04: Cierre de Caja (Cajero / Administrador)
**Como** Cajero,  
**quiero** declarar el saldo real en efectivo al finalizar mi turno,  
**para** que el sistema calcule de forma automática si existen faltantes o sobrantes y proceda con el cierre.

* **Criterios de Aceptación:**
  * **Escenario 1: Cierre de caja con cuadre perfecto**
    * **Dado** que la caja está abierta, el sistema espera 500 en efectivo (Total Inicial + Ventas Efectivo - Egresos Efectivo),
    * **Cuando** declaro que la caja real física cuenta con "500",
    * **Entonces** el sistema registra una diferencia de "0", guarda el cierre con estado "Cerrado" y bloquea nuevos registros en ese turno.
  * **Escenario 2: Cierre de caja con faltante o sobrante**
    * **Dado** que el sistema espera 500 en efectivo,
    * **Cuando** declaro que el dinero real físico es "480",
    * **Entonces** el sistema calcula y registra una diferencia (Faltante) de "-20", guarda la justificación del cajero y finaliza el turno registrando la discrepancia para auditoría del administrador.

### HU-05: Alerta de Stock Mínimo (Administrador / Cajero)
**Como** Administrador / Cajero,  
**quiero** visualizar alertas visuales cuando un producto alcance su stock mínimo,  
**para** realizar pedidos de reposición antes de quedar desabastecidos.

* **Criterios de Aceptación:**
  * **Dado** que el producto "Vino Toro" tiene un stock mínimo definido de 10 unidades,
  * **Cuando** una venta reduce el stock de 11 a 10 unidades,
  * **Entonces** el sistema muestra un indicador visual (badge naranja/rojo) en la lista de inventario y en el dashboard principal.

---

## 3. Casos de Uso

A continuación se detallan los flujos principales de interacción usuario-sistema.

```mermaid
usecaseDiagram
    actor Cajero
    actor Administrador
    
    Cajero --> (UC-01: Apertura de Caja)
    Cajero --> (UC-02: Registrar Venta)
    Cajero --> (UC-03: Registrar Egreso/Gasto)
    Cajero --> (UC-04: Cierre de Caja)
    
    (UC-02: Registrar Venta) ..> (UC-05: Descontar Inventario) : <<include>>
    
    Administrador --> (UC-06: Administrar Inventario)
    Administrador --> (UC-07: Ver Reportes y Auditoría)
    Administrador --> (UC-04: Cierre de Caja)
```

### UC-02: Registrar Venta (Detallado)
1. **Actor:** Cajero.
2. **Precondición:** Turno de caja abierto.
3. **Flujo Principal:**
   1. El cajero selecciona uno o varios productos en la pantalla de ventas (POS).
   2. El sistema muestra la sumatoria del precio de venta de los productos.
   3. El cajero selecciona el método de pago: **Efectivo**, **QR** o **Transferencia**.
   4. El cajero selecciona a la impulsadora responsable de la venta (de una lista precargada).
   5. El cajero confirma la venta.
   6. El sistema actualiza el stock físico de los productos.
   7. El sistema registra la venta y suma los montos al reporte de caja activo.
4. **Flujo Alternativo (Sin Stock):**
   * En el paso 1, si un producto no tiene stock, el botón para agregarlo está deshabilitado y se muestra "Agotado".
5. **Postcondición:** Venta registrada, stock decrementado y caja actualizada.

### UC-04: Cierre de Caja (Detallado)
1. **Actor:** Cajero (también puede ser realizado por Administrador).
2. **Precondición:** Turno de caja abierto.
3. **Flujo Principal:**
   1. El cajero selecciona la opción "Cerrar Caja".
   2. El sistema calcula y muestra de forma resumida:
      * **Total Inicial** (dinero con el que se abrió).
      * **Total Ventas Efectivo**.
      * **Total Ventas QR** y **Total Ventas Transferencias** (desglosados).
      * **Total Gastos** (egresos en efectivo).
      * **Caja Esperada (Efectivo)** = Saldo Inicial + Ventas Efectivo - Gastos Efectivo.
   3. El sistema solicita al cajero el **Monto Real en Efectivo** que tiene físicamente.
   4. El cajero digita el monto real.
   5. El sistema calcula la **Diferencia** (`Caja Real - Caja Esperada`).
   6. El cajero ingresa una nota/comentario explicativo opcional (obligatorio si hay diferencia).
   7. El cajero confirma el cierre.
   8. El sistema cambia el estado del turno a "Cerrado", registra la fecha/hora de cierre, y genera un reporte en PDF de resumen de turno.
6. **Postcondición:** Turno cerrado y bloqueado para futuras transacciones.

---

## 4. Reglas de Negocio (Business Rules)

Estas reglas rigen el comportamiento estricto del sistema para garantizar la integridad de los datos financieros y de inventario:

* **RN-01: Turno de Caja Único Activo**
  Solo puede haber un turno de caja abierto a la vez. No se pueden registrar ventas, gastos ni cierres si no hay un turno activo. Si un cajero intenta abrir caja habiendo una abierta, el sistema arrojará un error.
* **RN-02: Tipo de Venta Obligatorio**
  Toda venta debe estar vinculada obligatoriamente a una **Impulsadora** (se puede definir un registro "Sin Impulsadora / Cajero Directo" para ventas sin impulsadoras) y a un **Tipo de Pago** (Efectivo, QR, Transferencia).
* **RN-03: Conciliación de Efectivo**
  El cálculo de la caja física esperada para el cuadre se basa únicamente en transacciones en efectivo:
  $$\text{Caja Esperada (Efectivo)} = \text{Monto Inicial} + \text{Ventas Efectivo} - \text{Egresos Efectivo}$$
  Las ventas registradas con tipo de pago **QR** o **Transferencia** se totalizarán de manera independiente y no afectarán el efectivo físico esperado, pero se mostrarán en el reporte final para la conciliación bancaria/digital.
* **RN-04: Registro Inmutable de Diferencias**
  Si existe un faltante o sobrante al cerrar la caja, el sistema registrará la diferencia de forma inmutable. No se permite realizar ajustes artificiales automáticos; el administrador auditará estas discrepancias mediante el historial de cierres.
* **RN-05: Descuento de Stock en Tiempo Real**
  El stock de inventario debe descontarse en el instante en que se confirma la venta. Si dos ventas ocurren en paralelo y el stock se agota, el sistema debe rechazar la segunda transacción en base a la concurrencia.
* **RN-06: Control de Precios**
  El Cajero no puede modificar los precios de venta en la interfaz de ventas. Solo el Administrador puede editar los precios de venta y de compra desde el módulo de administración de productos.
* **RN-07: Categorización Obligatoria de Egresos**
  Todo egreso o compra menor debe tener obligatoriamente un **Concepto** (ej: Soda, Hielo, Transporte, Pago Proveedor), un **Monto** y estar asociado al cajero activo.
