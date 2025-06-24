const ORDERS_CSV_URL = 'data/orders.csv';

function mostrarVista(vista) {
  document.querySelectorAll('section[id^="vista-"]').forEach(div => {
    div.className = 'vista-oculta';
  });
  document.getElementById(`vista-${vista}`).className = 'vista-activa';
}

function formatearCLP(numero) {
  const monto = parseFloat(numero);
  if (isNaN(monto)) return '$0';
  return '$' + monto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function cargarOrdenesCSV() {
  Papa.parse(ORDERS_CSV_URL, {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: function(results) {
      const data = results.data;
      let totalIncome = 0;
      const tbody = document.querySelector('#orders-table tbody');
      tbody.innerHTML = '';

      data.forEach(order => {
        if (!order.total_paid) return;

        totalIncome += parseFloat(order.total_paid);

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${order.id_order}</td>
          <td>${order.reference}</td>
          <td>${order.id_customer}</td>
          <td>${formatearCLP(order.total_paid)}</td>
          <td>${order.payment}</td>
          <td>${order.current_state}</td>
          <td>${new Date(order.date_add).toLocaleDateString()}</td>
        `;
        tbody.appendChild(row);
      });

      document.getElementById('total-orders').textContent = data.length;
      document.getElementById('total-income').textContent = totalIncome.toFixed(2);
    },
    error: function(err) {
      console.error('Error al leer el CSV:', err);
    }
  });
}

cargarOrdenesCSV();
