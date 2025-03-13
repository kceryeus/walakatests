// Move all JavaScript code to this external file
const InvoiceManager = {
  counter: 1,
  
  init() {
    this.bindEvents();
    this.checkAuth();
  },

  bindEvents() {
    // Add item button
    document.getElementById('add-item').addEventListener('click', () => this.addNewRow());
    
    // Generate PDF button
    document.getElementById('generate-pdf').addEventListener('click', () => this.generatePDF());
    
    // Initial row calculations
    document.querySelectorAll('.item-quantity, .item-price').forEach(input => {
      input.addEventListener('input', () => this.calculateTotals());
    });

    // VAT select changes
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('vat-select')) {
        this.handleVATChange(e.target);
      }
    });

    // Remove item buttons (for initial row)
    document.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', (e) => {
        e.target.closest('tr').remove();
        this.calculateTotals();
      });
    });
  },

  addNewRow() {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td><button class="remove-item">×</button></td>
      <td><input type="text" placeholder="Descrição"></td>
      <td><input type="number" value="1" min="1" class="item-quantity"></td>
      <td><input type="number" value="0" step="0.01" class="item-price"></td>
      <td>
        <select class="vat-select">
          <option value="16" selected>16%</option>
          <option value="5">5%</option>
          <option value="0">Isento</option>
          <option value="custom">Outro</option>
        </select>
        <input type="number" step="0.01" class="custom-vat" style="display: none;" placeholder="%" />
      </td>
      <td class="item-vat-rate">0.00</td>
      <td class="item-total">0.00</td>
    `;

    document.getElementById('items-body').appendChild(newRow);

    // Add event listeners to new row
    newRow.querySelector('.item-quantity').addEventListener('input', () => this.calculateTotals());
    newRow.querySelector('.item-price').addEventListener('input', () => this.calculateTotals());
    newRow.querySelector('.remove-item').addEventListener('click', () => {
      newRow.remove();
      this.calculateTotals();
    });
    newRow.querySelector('.vat-select').addEventListener('change', (e) => this.handleVATChange(e.target));
  },

  handleVATChange(select) {
    const customVatInput = select.nextElementSibling;
    if (select.value === "custom") {
      customVatInput.style.display = "inline-block";
      customVatInput.focus();
      customVatInput.addEventListener('input', () => this.calculateTotals());
    } else {
      customVatInput.style.display = "none";
      customVatInput.value = "";
    }
    this.calculateTotals();
  },

  calculateTotals() {
    let subtotal = 0;
    let totalVAT = 0;

    document.querySelectorAll('#items-body tr').forEach(row => {
      const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
      const price = parseFloat(row.querySelector('.item-price').value) || 0;
      const vatSelect = row.querySelector('.vat-select');
      let vatRate = parseFloat(vatSelect.value) || 0;
      
      if (vatSelect.value === "custom") {
        const customVatInput = row.querySelector('.custom-vat');
        vatRate = parseFloat(customVatInput.value) || 0;
      }

      const rowSubtotal = quantity * price;
      const rowVAT = rowSubtotal * (vatRate / 100);
      const rowTotal = rowSubtotal + rowVAT;

      row.querySelector('.item-total').textContent = rowTotal.toFixed(2);
      row.querySelector('.item-vat-rate').textContent = vatRate.toFixed(2) + "%";

      subtotal += rowSubtotal;
      totalVAT += rowVAT;
    });

    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('vat').textContent = totalVAT.toFixed(2);
    document.getElementById('total').textContent = (subtotal + totalVAT).toFixed(2);
  },

  generatePDF() {
    const clientName = document.getElementById("client-name").value || "N/A";
    const clientAddress = document.getElementById("client-address").value || "N/A";
    const issueDate = document.getElementById("issue-date").value || "N/A";
    const clientNUIT = document.getElementById("client-NUIT").value || "N/A";
    const clientEmail = document.getElementById("client-email").value || "N/A";
    const paymentTerms = document.getElementById("payment-terms").value || "N/A";
    const invoiceDescription = document.getElementById("invoice-description").value || "N/A";
    const invoiceNumber = String(this.counter++).padStart(4, '0');

    const items = [...document.querySelectorAll("#items-body tr")].map((row, index) => ({
      description: row.querySelector("td:nth-child(2) input").value || "N/A",
      quantity: row.querySelector(".item-quantity").value || "0",
      price: row.querySelector(".item-price").value || "0",
      vatRate: row.querySelector(".item-vat-rate").textContent || "0%",
      total: row.querySelector(".item-total").textContent || "0.00",
      index: index + 1
    }));

    const subtotal = document.getElementById("subtotal").textContent;
    const vat = document.getElementById("vat").textContent;
    const total = document.getElementById("total").textContent;

    const pdfContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            /* Add your PDF styles here */
            body { font-family: Arial, sans-serif; }
            .invoice-header { text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; border: 1px solid #ddd; }
            .totals { text-align: right; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h1>FACTURA</h1>
            <p>Nº ${invoiceNumber}</p>
          </div>

          <div class="client-info">
            <h3>Cliente:</h3>
            <p>${clientName}</p>
            <p>${clientAddress}</p>
            <p>NUIT: ${clientNUIT}</p>
            <p>Email: ${clientEmail}</p>
          </div>

          <div class="invoice-details">
            <p><strong>Data:</strong> ${issueDate}</p>
            <p><strong>Condições de Pagamento:</strong> ${paymentTerms}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Descrição</th>
                <th>Qtd</th>
                <th>Preço</th>
                <th>IVA</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.index}</td>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price}</td>
                  <td>${item.vatRate}</td>
                  <td>${item.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p><strong>Subtotal:</strong> ${subtotal} MZN</p>
            <p><strong>IVA:</strong> ${vat} MZN</p>
            <p><strong>Total:</strong> ${total} MZN</p>
          </div>

          <div class="footer">
            <p><strong>Descrição:</strong> ${invoiceDescription}</p>
          </div>
        </body>
      </html>
    `;

    const opt = {
      margin: 1,
      filename: `factura-${invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(pdfContent).save();
  },

  async checkAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/login.html';
    }
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => InvoiceManager.init()); 
