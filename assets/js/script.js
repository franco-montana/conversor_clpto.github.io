let chart;

async function convertCurrency() {
    const amount = document.getElementById('amount').value;
    const currency = document.getElementById('currency').value;
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');


    if (!amount || amount <= 0) {
        errorDiv.textContent = 'Por favor, ingrese un monto válido';
        resultDiv.textContent = '';
        return;
    }

    try {
        const response = await fetch(`https://mindicador.cl/api/${currency}`);
        const data = await response.json();
        
        if (!response.ok) throw new Error('Error al obtener los datos');

        const rate = data.serie[0].valor;
        const convertedAmount = (amount / rate).toFixed(2);
        const currencySymbols = {
            'dolar': 'USD',
            'euro': 'EUR',
            'uf': 'UF',
            'utm': 'UTM',
            'yen': 'JPY',
            'ars': 'ARS'
        };

 // formato para cada moneda

 let formattedAmount;
 switch(currency) {
     case 'yen':
         formattedAmount = Math.round(convertedAmount).toLocaleString('ja-JP'); // Sin decimales para Yen
         break;
     case 'uf':
     case 'utm':
         formattedAmount = Number(convertedAmount).toLocaleString('es-CL', { 
             minimumFractionDigits: 4,
             maximumFractionDigits: 4 
         }); // 4 decimales para UF y UTM
         break;
     default:
         formattedAmount = Number(convertedAmount).toLocaleString('es-CL', { 
             minimumFractionDigits: 2,
             maximumFractionDigits: 2 
         });
 }

 resultDiv.textContent = `${Number(amount).toLocaleString('es-CL')} CLP = ${formattedAmount} ${currencySymbols[currency]}`;
 errorDiv.textContent = '';






 // GRAFICO E IMAGEN
 const last10Days = data.serie.slice(0, 10).reverse();
 const labels = last10Days.map(item => {
     const date = new Date(item.fecha);
     return date.toLocaleDateString('es-CL');
 });
 const values = last10Days.map(item => item.valor);

 updateChart(labels, values, currencySymbols[currency]);

} catch (error) {
 errorDiv.textContent = 'Error al realizar la conversión. Por favor, intente más tarde.';
 resultDiv.textContent = '';
 console.error('Error:', error);
}
}

function updateChart(labels, values, currency) {
if (chart) {
 chart.destroy();
}

const ctx = document.getElementById('currencyChart').getContext('2d');
chart = new Chart(ctx, {
 type: 'line',
 data: {
     labels: labels,
     datasets: [{
         label: `Valor ${currency} últimos 10 días`,
         data: values,
         borderColor: '#2563eb',
         backgroundColor: 'rgba(37, 99, 235, 0.1)',
         tension: 0.2,
         fill: true
     }]
 },
 options: {
     responsive: true,
     plugins: {
         legend: {
             position: 'top',
         },
         title: {
             display: true,
             text: 'Historial de valores',
             font: {
                 family: 'Poppins',
                 size: 16,
                 weight: '500'
             }
         }
     },
     scales: {
         y: {
             beginAtZero: false,
             ticks: {
                 font: {
                     family: 'Poppins'
                 }
             }
         },
         x: {
             ticks: {
                 font: {
                     family: 'Poppins'
                 }
             }
         }
     }
 }
});
}