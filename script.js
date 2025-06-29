const ORDERS_CSV_URL = 'data/orders.csv';

function formatearCLP(numero) {
  const monto = parseFloat(numero);
  if (isNaN(monto)) return '$0';
  return '$' + monto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function mostrarVista(vista) {
  document.querySelectorAll('section[id^="vista-"]').forEach(div => {
    div.className = 'vista-oculta';
  });
  document.getElementById(`vista-${vista}`).className = 'vista-activa';

  if (vista === 'clientes') {
    cargarTodosLosDatos(() => cargarClientes());
  } else if (vista === 'orders') {
    cargarOrdenesCSV();
  }
}

let ordersData = [], orderDetailsData = [], productsData = [], customersData = [];

function cargarOrdenesCSV() {
  Papa.parse(ORDERS_CSV_URL, {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: function(results) {
      const data = results.data;

      // Obtener la fecha más reciente disponible en los pedidos
      const fechasValidas = data
        .map(order => order.date_add)
        .filter(fecha => !!fecha);
      const ultimaFecha = fechasValidas.sort().reverse()[0];

      let totalIncome = 0;
      let totalOrders = 0;
      const tbody = document.querySelector('#orders-table tbody');
      tbody.innerHTML = '';

      data.forEach(order => {
        if (!order.total_paid || order.date_add !== ultimaFecha) return;

        totalIncome += parseFloat(order.total_paid);
        totalOrders++;

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${order.id_order}</td>
          <td>${order.reference}</td>
          <td>${order.customer}</td>
          <td>${formatearCLP(order.total_paid)}</td>
          <td>${order.payment}</td>
          <td>${order.date_add}</td>
        `;
        tbody.appendChild(row);
      });

      // Actualizar los totales mostrados
      document.getElementById('total-orders').textContent = totalOrders;
      document.getElementById('total-income').textContent = formatearCLP(totalIncome);
    }
  });
}

// Cargar al inicio
cargarOrdenesCSV();
cargarClientes();

//clientes

function cargarClientes() {
  Papa.parse('data/customers.csv', {
    download: true,
    header: true,
    dynamicTyping: true,
    delimiter: ";", // Muy importante con tu CSV
    complete: function(results) {
      const clientes = results.data;

      const clientesValidos = clientes.filter(c => c.id_customer && c.firstname);
      const ultimos = clientesValidos.slice(-20).reverse();

      const tbody = document.querySelector('#tabla-clientas tbody');
      tbody.innerHTML = '';

      ultimos.forEach(cliente => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${cliente.id_customer}</td>
          <td>${cliente.firstname} ${cliente.lastname}</td>
          <td>${cliente.email}</td>
          <td>${cliente.id_default_group}</td>
        `;
        tbody.appendChild(fila);
      });

      const buscador = document.getElementById('buscador-clientas');
      buscador.addEventListener('input', function () {
        const valor = this.value.toLowerCase();
        const filas = tbody.querySelectorAll('tr');
        filas.forEach(fila => {
          const texto = fila.textContent.toLowerCase();
          fila.style.display = texto.includes(valor) ? '' : 'none';
        });
      });
    }
  });
}

function cerrarModalClienta() {
  document.getElementById("modal-clienta").classList.add("oculto");
}

function formatearCLP(numero) {
  const monto = parseFloat(numero);
  if (isNaN(monto)) return '$0';
  return '$' + monto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}




function formatearCLP(numero) {
  const monto = parseFloat(numero);
  if (isNaN(monto)) return '$0';
  return '$' + monto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function cerrarModalClienta() {
  document.getElementById("modal-clienta").classList.add("oculto");
}

function cargarTodosLosDatos(callback) {
  let archivosCargados = 0;

  function revisarCarga() {
    archivosCargados++;
    if (archivosCargados === 4) callback();
  }

  Papa.parse('data/orders.csv', {
    download: true, header: true, delimiter: ";", dynamicTyping: true,
    complete: res => { ordersData = res.data; revisarCarga(); }
  });

  Papa.parse('data/order_details.csv', {
    download: true, header: true, delimiter: ";", dynamicTyping: true,
    complete: res => { orderDetailsData = res.data; revisarCarga(); }
  });

  Papa.parse('data/products.csv', {
    download: true, header: true, delimiter: ";", dynamicTyping: true,
    complete: res => { productsData = res.data; revisarCarga(); }
  });

  Papa.parse('data/customers.csv', {
    download: true, header: true, delimiter: ";", dynamicTyping: true,
    complete: res => { customersData = res.data; revisarCarga(); }
  });
}

function cargarClientes() {
  const tbody = document.querySelector('#tabla-clientas tbody');
  tbody.innerHTML = '';

  const clientesValidos = customersData.filter(c => c.id_customer && c.firstname);
  const ultimos = clientesValidos.slice(-20).reverse();

  ultimos.forEach(cliente => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${cliente.id_customer}</td>
      <td>${cliente.firstname} ${cliente.lastname}</td>
      <td>${cliente.email}</td>
      <td>${cliente.id_default_group}</td>
    `;
    fila.addEventListener('click', () => {
      mostrarFichaClienta(cliente.id_customer);
    });
    tbody.appendChild(fila);
  });

  const buscador = document.getElementById('buscador-clientas');
  buscador.addEventListener('input', function () {
    const valor = this.value.toLowerCase();
    const filas = tbody.querySelectorAll('tr');
    filas.forEach(fila => {
      const texto = fila.textContent.toLowerCase();
      fila.style.display = texto.includes(valor) ? '' : 'none';
    });
  });
}

function mostrarFichaClienta(id) {
  const cliente = customersData.find(c => c.id_customer == id);
  if (!cliente) return;

  document.getElementById('modal-clienta').classList.remove('oculto');
  document.getElementById('nombre-clienta').textContent = `${cliente.firstname} ${cliente.lastname}`;
  document.getElementById('email-clienta').textContent = cliente.email || '-';
  document.getElementById('rut-clienta').textContent = cliente.rut || '-';
  document.getElementById('telefono-clienta').textContent = cliente.phone_mobile || cliente.phone || '-';
  document.getElementById('grupo-clienta').textContent = cliente.id_default_group || '-';

  document.getElementById('dir-clienta').textContent = cliente.address1 || '-';
  document.getElementById('ciudad-clienta').textContent = cliente.city || '-';
  document.getElementById('region-clienta').textContent = cliente.country_name || '-';
  document.getElementById('postal-clienta').textContent = cliente.postcode || '-';

  const pedidos = ordersData.filter(p => p.id_customer == id);
  const totalGastado = pedidos.reduce((sum, p) => sum + (p.total_paid || 0), 0);
  const meses = [...new Set(pedidos.map(p => (p.date_add || '').slice(0, 7)))].length || 1;
  const gastoMensual = totalGastado / meses;

  document.getElementById('promedio-clienta').textContent = formatearCLP(gastoMensual);

  const pedidosHTML = pedidos.map(p => `
    <tr>
      <td>${p.id_order}</td>
      <td>${p.reference}</td>
      <td>${formatearCLP(p.total_paid)}</td>
      <td>${p.payment}</td>
      <td>${p.date_add}</td>
    </tr>
  `).join('');

  document.getElementById('pedidos-clienta').innerHTML = `
    <table><thead>
      <tr><th>ID</th><th>Ref</th><th>Monto</th><th>Pago</th><th>Fecha</th></tr>
    </thead><tbody>${pedidosHTML}</tbody></table>
  `;

  const idsPedido = pedidos.map(p => p.id_order);
  const detalles = orderDetailsData.filter(d => idsPedido.includes(d.id_order));
  const resumen = {};

  detalles.forEach(d => {
    if (!resumen[d.product_id]) resumen[d.product_id] = 0;
    resumen[d.product_id] += d.product_quantity;
  });

  const resumenArr = Object.entries(resumen).map(([id, qty]) => {
    const prod = productsData.find(p => p.id_product == id);
    return {
      name: prod ? prod.name : `Producto ${id}`,
      cantidad: qty,
      categoria: prod ? prod.id_category_default : null
    };
  });

  resumenArr.sort((a, b) => b.cantidad - a.cantidad);

  document.getElementById('producto-top').textContent = resumenArr[0]?.name || '-';

  const categoriaFavorita = resumenArr.reduce((map, p) => {
    if (!p.categoria) return map;
    map[p.categoria] = (map[p.categoria] || 0) + p.cantidad;
    return map;
  }, {});
  const categoriaFavId = Object.entries(categoriaFavorita).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  document.getElementById('categoria-fav').textContent = categoriaFavId;

  document.getElementById('articulos-clienta').innerHTML = resumenArr.map(p => `
    <li>${p.name} – ${p.cantidad} ud(s)</li>
  `).join('');
}

// Al cargar la vista clientes
// cargarTodosLosDatos(() => cargarClientes());

window.addEventListener('click', function (e) {
  const modal = document.getElementById('modal-clienta');
  if (e.target === modal) {
    cerrarModalClienta();
  }
});

function mostrarTabClientas(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('activo'));
  document.querySelectorAll('.contenido-tab-clientas').forEach(div => div.classList.add('oculto'));

  document.querySelector(`.tab-btn[onclick*="${tab}"]`).classList.add('activo');
  document.getElementById(`tab-clientas-${tab}`).classList.remove('oculto');

}


function abrirReporte(nombre) {
  alert("Abrir reporte: " + nombre);
}


function abrirReporte(nombre) {
  document.querySelector('.grid-reportes').classList.add('oculto');
  document.getElementById('contenedor-reporte').classList.remove('oculto');

  if (nombre === 'totales') generarResumenGeneral();
  else document.getElementById('contenido-reporte').innerHTML = `<p>Reporte "${nombre}" aún no implementado.</p>`;
}

function cerrarReporte() {
  document.querySelector('.grid-reportes').classList.remove('oculto');
  document.getElementById('contenedor-reporte').classList.add('oculto');
  document.getElementById('contenido-reporte').innerHTML = '';
}


function cerrarReporte() {
  document.querySelector('.grid-reportes').classList.remove('oculto');
  document.getElementById('contenedor-reporte').classList.add('oculto');
  document.getElementById('contenido-reporte').innerHTML = '';
}


function generarResumenGeneral() {
  const total = customersData.length;
  const conPedidos = new Set(ordersData.map(p => p.id_customer));
  const sinPedidos = customersData.filter(c => !conPedidos.has(c.id_customer)).length;

  const grupos = {};
  customersData.forEach(c => {
    const grupo = c.id_default_group || 'Sin grupo';
    grupos[grupo] = (grupos[grupo] || 0) + 1;
  });

  const lista = Object.entries(grupos).map(([g, n]) => `<li>Grupo ${g}: ${n} clientas</li>`).join('');

  document.getElementById('contenido-reporte').innerHTML = `
    <h3>Resumen general</h3>
    <p>Total clientas: <strong>${total}</strong></p>
    <p>Con pedidos: <strong>${conPedidos.size}</strong></p>
    <p>Sin pedidos: <strong>${sinPedidos}</strong></p>
    <h4>Distribución por grupo:</h4>
    <ul>${lista}</ul>
  `;
}

let filtrosActivos = [];

function mostrarFormularioFiltro() {
  document.getElementById('formulario-filtro').classList.remove('oculto');
}

function cancelarFiltro() {
  document.getElementById('formulario-filtro').classList.add('oculto');
  document.getElementById('valor-filtro').value = '';
}

function guardarFiltro() {
  const tipo = document.getElementById('tipo-filtro').value;
  const valor = document.getElementById('valor-filtro').value.trim();

  // Para filtros como "conPedidos" o "sinPedidos", no se necesita valor
  if ((tipo === 'grupo' && !valor) || (!tipo)) return alert('Completa el filtro');

  filtrosActivos.push({ tipo, valor });
  renderizarFiltros();
  filtrarTablaClientas();
  cancelarFiltro();
}

function eliminarFiltro(index) {
  filtrosActivos.splice(index, 1);
  renderizarFiltros();
  filtrarTablaClientas();
}

function renderizarFiltros() {
  const contenedor = document.getElementById('chips-filtros');
  contenedor.innerHTML = filtrosActivos.map((filtro, i) => {
    let texto = '';
    if (filtro.tipo === 'grupo') texto = `Grupo: ${filtro.valor}`;
    if (filtro.tipo === 'conPedidos') texto = `Con pedidos`;
    if (filtro.tipo === 'sinPedidos') texto = `Sin pedidos`;

    return `<div class="chip">${texto} <button onclick="eliminarFiltro(${i})">×</button></div>`;
  }).join('');
}

function filtrarTablaClientas() {
  const tbody = document.querySelector('#tabla-clientas tbody');
  tbody.innerHTML = '';

  let filtradas = [...customersData];

  filtrosActivos.forEach(f => {
    if (f.tipo === 'grupo') {
      filtradas = filtradas.filter(c => (c.id_default_group || '') === f.valor);
    }
    if (f.tipo === 'conPedidos') {
      const conPedidos = new Set(ordersData.map(o => o.id_customer));
      filtradas = filtradas.filter(c => conPedidos.has(c.id_customer));
    }
    if (f.tipo === 'sinPedidos') {
      const conPedidos = new Set(ordersData.map(o => o.id_customer));
      filtradas = filtradas.filter(c => !conPedidos.has(c.id_customer));
    }
  });

  filtradas.slice(0, 20).forEach(cliente => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${cliente.id_customer}</td>
      <td>${cliente.firstname} ${cliente.lastname}</td>
      <td>${cliente.email}</td>
      <td>${cliente.id_default_group}</td>
      <td>${cliente.date_add?.split(' ')[0] || ''}</td>
    `;
    fila.addEventListener('click', () => mostrarFichaClienta(cliente.id_customer));
    tbody.appendChild(fila);
  });
}
