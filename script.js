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
    complete: function(results) {
      const clientes = results.data;
      const tbody = document.querySelector('#tabla-clientas tbody');
      tbody.innerHTML = '';

      clientes.forEach(cliente => {
        if (!cliente.id_customer) return;

        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${cliente.id_customer}</td>
          <td>${cliente.firstname} ${cliente.lastname}</td>
          <td>${cliente.email}</td>
          <td>${cliente.date_add}</td>
          <td>${cliente.last_visit}</td>
        `;
        tbody.appendChild(fila);
      });

      // Activar buscador
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