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


let ordersData = [], orderDetailsData = [], productsData = [], customersData = [];

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
