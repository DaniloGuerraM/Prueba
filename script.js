document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const httpMethodSelect = document.getElementById('http-method');
    const apiUrlInput = document.getElementById('api-url');
    const sendBtn = document.getElementById('send-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const requestBody = document.getElementById('request-body');
    const statusCode = document.getElementById('status-code');
    const responseTime = document.getElementById('response-time');
    const responseData = document.getElementById('response-data');
    
    // Cambio de pestañas
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover clase active de todos los botones y paneles
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Agregar clase active al botón clickeado y su panel correspondiente
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Agregar filas de parámetros
    document.querySelectorAll('.add-param-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const container = e.target.closest('.param-container');
            const newRow = document.createElement('div');
            newRow.className = 'param-row';
            newRow.innerHTML = `
                <input type="text" class="key-input" placeholder="Nombre" />
                <input type="text" class="value-input" placeholder="Valor" />
                <button class="remove-param-btn">-</button>
            `;
            container.appendChild(newRow);
            
            // Agregar evento para remover fila
            newRow.querySelector('.remove-param-btn').addEventListener('click', () => {
                container.removeChild(newRow);
            });
        });
    });
    
    // Enviar solicitud
    sendBtn.addEventListener('click', async () => {
        const method = httpMethodSelect.value;
        const url = apiUrlInput.value;
        
        if (!url) {
            alert('Por favor, ingresa una URL válida');
            return;
        }
        
        // Recopilar headers
        const headers = {};
        document.querySelectorAll('#headers .param-row').forEach(row => {
            const key = row.querySelector('.key-input').value.trim();
            const value = row.querySelector('.value-input').value.trim();
            if (key) {
                headers[key] = value;
            }
        });
        
        // Recopilar parámetros de consulta
        let finalUrl = url;
        const queryParams = [];
        document.querySelectorAll('#params .param-row').forEach(row => {
            const key = row.querySelector('.key-input').value.trim();
            const value = row.querySelector('.value-input').value.trim();
            if (key) {
                queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
            }
        });
        
        if (queryParams.length > 0) {
            finalUrl += (url.includes('?') ? '&' : '?') + queryParams.join('&');
        }
        
        // Preparar opciones de fetch
        const options = {
            method,
            headers
        };
        
        // Agregar body si es necesario
        if (method !== 'GET' && method !== 'HEAD') {
            const bodyContent = requestBody.value.trim();
            if (bodyContent) {
                try {
                    // Intentar parsear como JSON
                    const jsonBody = JSON.parse(bodyContent);
                    options.body = JSON.stringify(jsonBody);
                    options.headers['Content-Type'] = 'application/json';
                } catch (e) {
                    // Si no es JSON válido, enviar como texto
                    options.body = bodyContent;
                }
            }
        }
        
        // Limpiar respuesta anterior
        statusCode.textContent = '-';
        statusCode.className = '';
        responseTime.textContent = '-';
        responseData.textContent = '';
        
        try {
            // Medir tiempo de respuesta
            const startTime = performance.now();
            
            // Realizar la solicitud
            const response = await fetch(finalUrl, options);
            const endTime = performance.now();
            
            // Mostrar tiempo de respuesta
            responseTime.textContent = Math.round(endTime - startTime);
            
            // Mostrar código de estado
            statusCode.textContent = response.status;
            
            // Aplicar clase según el código de estado
            if (response.status >= 200 && response.status < 300) {
                statusCode.className = 'status-success';
            } else if (response.status >= 400) {
                statusCode.className = 'status-error';
            } else {
                statusCode.className = 'status-info';
            }
            
            // Intentar obtener la respuesta como JSON
            try {
                const data = await response.json();
                responseData.textContent = JSON.stringify(data, null, 2);
            } catch (e) {
                // Si no es JSON, mostrar como texto
                const text = await response.text();
                responseData.textContent = text;
            }
        } catch (error) {
            statusCode.textContent = 'Error';
            statusCode.className = 'status-error';
            responseData.textContent = `Error: ${error.message}`;
        }
    });
});