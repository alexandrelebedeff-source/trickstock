document.addEventListener('DOMContentLoaded', () => {

    // --- STATE ---
    let stock = [
        // ADICIONADO minQuantity
        { id: 1, name: 'Coca-Cola lata', category: 'drinks', quantity: 24, minQuantity: 10, image: 'https://via.placeholder.com/80/e94560/000000?text=Drink' },
        { id: 2, name: 'Pão Australiano', category: 'pãos', quantity: 30, minQuantity: 50, image: 'https://via.placeholder.com/80/f9d806/000000?text=Pão' },
        { id: 3, name: 'Descartavel 500ml', category: 'Copos', quantity: 100, minQuantity: 100, image: 'https://via.placeholder.com/80/0f3460/FFFFFF?text=Food' },
        { id: 4, name: 'Caneca Chopp', category: 'outros', quantity: 8, minQuantity: 20, image: 'https://via.placeholder.com/80/AAAAAA/000000?text=Misc' }
    ];
    let categories = ['Comida', 'drinks', 'pãos', 'outros', 'Copos']; 
    let currentCategory = 'all';
    // --- END STATE ---


    // --- DOM Elements ---
    const stockList = document.getElementById('stock-list');
    const filterButtonsContainer = document.querySelector('.filter-controls');
    const modal = document.getElementById('item-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const addNewBtn = document.getElementById('add-new-btn');
    const itemForm = document.getElementById('item-form');
    const deleteItemBtn = document.getElementById('delete-item-btn');
    
    // Form fields
    const itemIdField = document.getElementById('item-id');
    const itemNameField = document.getElementById('item-name');
    const itemQuantityField = document.getElementById('item-quantity');
    const itemMinQuantityField = document.getElementById('item-min-quantity'); // NOVO CAMPO
    const itemImageField = document.getElementById('item-image');
    
    // Dynamic Elements
    const itemCategorySelect = document.getElementById('item-category');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const editCategoryBtn = document.getElementById('edit-category-btn'); // NOVO BOTÃO
    const newCategoryNameInput = document.getElementById('new-category-name');

    // Action Buttons
    const printMinStockBtn = document.getElementById('print-min-stock-btn'); // NOVO BOTÃO
    const printCategorySelect = document.getElementById('print-category-select'); // NOVO SELECT
    const printCategoryBtn = document.getElementById('print-category-btn'); // NOVO BOTÃO
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const templateCsvBtn = document.getElementById('template-csv-btn');
    const importCsvInput = document.getElementById('import-csv');
	const printCommentaryEl = document.getElementById('print-commentary');

    // --- CORE FUNCTIONS ---

    function renderStock() {
        stockList.innerHTML = '';
        const filteredStock = stock.filter(item => 
            currentCategory === 'all' || item.category === currentCategory
        );
        if (filteredStock.length === 0) {
            stockList.innerHTML = `<p class="empty-list-msg">No items in this category.</p>`;
            return;
        }
        filteredStock.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'stock-item';
            // NOVO: Adiciona classe para estoque baixo
            if (item.quantity <= item.minQuantity) {
                itemEl.classList.add('low-stock');
            }
            itemEl.dataset.id = item.id;
            itemEl.innerHTML = `
                <img src="${item.image || 'https://via.placeholder.com/80/333/000000?text=No+Img'}" alt="${item.name}" class="item-image">
                <h3 class="item-name">${item.name}</h3>
                <span class="item-category">${item.category}</span>
                <div class="quantity-controls">
                    <button class="quantity-btn" data-action="decrease" data-id="${item.id}">-</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="quantity-btn" data-action="increase" data-id="${item.id}">+</button>
                </div>
            `;
            itemEl.addEventListener('click', (e) => {
                if (e.target.classList.contains('quantity-btn') || e.target.classList.contains('delete-category-btn')) {
                    return;
                }
                openModal(item);
            });
            stockList.appendChild(itemEl);
        });
    }

    function updateQuantity(id, change) {
        const item = stock.find(i => i.id === id);
        if (item) {
            item.quantity = Math.max(0, item.quantity + change);
            renderStock();
        }
    }

    function openModal(item = null) {
        itemForm.reset(); 
        if (item) {
            modalTitle.textContent = 'Edit Item';
            itemIdField.value = item.id;
            itemNameField.value = item.name;
            itemCategorySelect.value = item.category;
            itemQuantityField.value = item.quantity;
            itemMinQuantityField.value = item.minQuantity || 0; // NOVO: Define quantidade mínima
            itemImageField.value = item.image;
            deleteItemBtn.classList.remove('hidden');
        } else {
            modalTitle.textContent = 'New Item';
            itemIdField.value = '';
            itemCategorySelect.value = categories[0] || '';
            deleteItemBtn.classList.add('hidden');
        }
        modal.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add('hidden');
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const id = parseInt(itemIdField.value);
        const newItemData = {
            name: itemNameField.value,
            category: itemCategorySelect.value,
            quantity: parseInt(itemQuantityField.value),
            minQuantity: parseInt(itemMinQuantityField.value) || 0, // NOVO: Obtém quantidade mínima
            image: itemImageField.value
        };
        
        // Garante que a categoria exista
        if (!categories.includes(newItemData.category)) {
            categories.push(newItemData.category);
            renderCategoryFilters();
            renderModalDropdown();
            renderPrintCategoryDropdown(); 
        }

        if (id) {
            const index = stock.findIndex(i => i.id === id);
            if (index !== -1) {
                stock[index] = { ...stock[index], ...newItemData };
            }
        } else {
            const newId = stock.length > 0 ? Math.max(...stock.map(i => i.id)) + 1 : 1;
            stock.push({ id: newId, ...newItemData });
        }

        renderStock();
        closeModal();
    }

    function deleteItem() {
        const id = parseInt(itemIdField.value);
        if (id && confirm('Are you sure you want to delete this item?')) {
            stock = stock.filter(i => i.id !== id);
            renderStock();
            closeModal();
        }
    }

    // --- DYNAMIC CATEGORY FUNCTIONS ---

	function renderCategoryFilters() {
        const existingButtons = filterButtonsContainer.querySelectorAll('.filter-btn:not([data-category="all"])');
        existingButtons.forEach(btn => btn.remove());
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.dataset.category = category;

            if (category === currentCategory) {
                button.classList.add('active');
            }

            const textSpan = document.createElement('span');
            textSpan.className = 'category-text';
            textSpan.textContent = category;
            button.appendChild(textSpan);

            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-category-btn';
            deleteBtn.textContent = 'x';
            deleteBtn.dataset.category = category;
            button.appendChild(deleteBtn);

            filterButtonsContainer.appendChild(button);
        });
    }

    function renderPrintCategoryDropdown() {
        printCategorySelect.innerHTML = '<option value="all">TODOS (Estoque Total)</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.toUpperCase();
            printCategorySelect.appendChild(option);
        });
    }

    function renderModalDropdown() {
        itemCategorySelect.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            itemCategorySelect.appendChild(option);
        });
    }

    function addNewCategory() {
        const newCategory = newCategoryNameInput.value.trim(); 
        if (newCategory === '') {
            alert('Please enter a category name.');
            return;
        }
        if (categories.includes(newCategory)) {
            alert('This category already exists.');
            return;
        }

        categories.push(newCategory);
        categories.sort();
        renderCategoryFilters();
        renderModalDropdown();
        renderPrintCategoryDropdown(); 
        newCategoryNameInput.value = '';
    }

    function editCategoryName() {
        const oldName = newCategoryNameInput.value.trim();
        if (oldName === '') {
            alert('Enter the OLD category name in the input field above.');
            return;
        }

        const categoryIndex = categories.indexOf(oldName);
        if (categoryIndex === -1) {
            alert(`Category "${oldName}" not found.`);
            return;
        }

        const newName = prompt(`Enter the new name for category "${oldName}":`);
        if (newName === null || newName.trim() === '') return;
        
        const trimmedNewName = newName.trim();

        if (categories.includes(trimmedNewName)) {
            alert(`Category "${trimmedNewName}" already exists.`);
            return;
        }

        // 1. Atualiza todos os itens no estoque
        stock.forEach(item => {
            if (item.category === oldName) {
                item.category = trimmedNewName;
            }
        });

        // 2. Atualiza a lista de categorias
        categories[categoryIndex] = trimmedNewName;
        categories.sort();
        
        // 3. Re-renderiza tudo
        renderStock();
        renderCategoryFilters();
        renderModalDropdown();
        renderPrintCategoryDropdown(); 
        newCategoryNameInput.value = ''; 
    }

    function handleDeleteCategory(categoryName) {
        const itemsInCatCount = stock.filter(item => item.category === categoryName).length;
        let confirmationText = `Are you sure you want to delete the "${categoryName}" category?`;
        
        if (itemsInCatCount > 0) {
            confirmationText += `\n\nThis will also delete ${itemsInCatCount} item(s) in this category.`;
        } else {
            confirmationText += `\n\nThis category is empty.`;
        }

        if (confirm(confirmationText)) {
            // 1. Remove categoria
            categories = categories.filter(cat => cat !== categoryName);
            // 2. Remove itens
            stock = stock.filter(item => item.category !== categoryName);
            
            // 3. Salvaguarda
            if (categories.length === 0) {
                categories.push('outros');
            }
            categories.sort();

            // 4. Re-renderiza
            renderStock();
            renderCategoryFilters();
            renderModalDropdown();
            renderPrintCategoryDropdown();
        }
    }


    // --- COMPLEX FEATURES (PRINTING) ---

	function handlePrint(filterCategory = 'all', minStockOnly = false) {
        const printArea = document.getElementById('print-area');
        
        const now = new Date();
        const formattedDate = now.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        }) + ' ' + now.toLocaleTimeString('pt-BR', {
            hour: '2-digit', minute: '2-digit'
        });

        const commentary = printCommentaryEl.value.trim();
        
        let categoriesToPrint = [];
        let filteredStock = stock;
        let totalItemsCount = 0; 

        // 1. Aplica filtro de categoria
        if (filterCategory !== 'all') {
            filteredStock = stock.filter(item => item.category === filterCategory);
        }
        
        // 2. Aplica filtro de estoque mínimo
        if (minStockOnly) {
            filteredStock = filteredStock.filter(item => item.quantity <= item.minQuantity);
        }
        
        // 3. Define as categorias a serem impressas
        categoriesToPrint = categories.filter(cat => 
            filteredStock.some(item => item.category === cat)
        );
        
        // 4. Aborta se não houver nada para imprimir
        if (filteredStock.length === 0) {
            alert('No items found to print based on the current selection.');
            return;
        }

        let html = `<div class="print-date">${formattedDate}</div>`;
        
        // Título customizado
        if (minStockOnly) {
            html += `<h2 style="text-align:center; font-size:11pt; color:#000;">--- ESTOQUE MÍNIMO ---</h2>`;
        } else if (filterCategory !== 'all') {
            html += `<h2 style="text-align:center; font-size:11pt; color:#000;">--- ESTOQUE: ${filterCategory.toUpperCase()} ---</h2>`;
        }

        if (commentary) {
            html += `<div class="print-comment">${commentary}</div>`;
        }

        let grandTotalQuantity = 0;

        categoriesToPrint.forEach(category => {
            const itemsInCategory = filteredStock.filter(item => item.category === category);
            if (itemsInCategory.length === 0) return;
            
            totalItemsCount += itemsInCategory.length;

			html += `<div class="print-category-block">`;
            html += `<h3>${category}</h3>`;
            
            // Coluna mostra QTD/MIN se não for estoque mínimo, ou apenas QTD se for
            const header2 = minStockOnly ? 'QTD' : 'QTD/MIN'; 
            html += `<table><thead><tr><th>ITEM</th><th>${header2}</th></tr></thead><tbody>`; 
            
            let categorySubtotalQuantity = 0;
            
            itemsInCategory.forEach(item => {
                const quantityDisplay = minStockOnly ? item.quantity : `${item.quantity}/${item.minQuantity}`;
                html += `<tr><td>${item.name}</td><td>${quantityDisplay}</td></tr>`;
                categorySubtotalQuantity += item.quantity;
            });
            
            html += `</tbody><tfoot>`;
            html += `<tr><td>Subtotal (${itemsInCategory.length} itens)</td><td>${categorySubtotalQuantity}</td></tr>`; 
            html += `</tfoot></table>`;
            html += `<hr>`;
			html += `</div>`;
			
            grandTotalQuantity += categorySubtotalQuantity;
        });

        // Total geral apenas se filtro for 'all'
        if (filterCategory === 'all' && !minStockOnly) {
            html += `<table class="grand-total-table"><tfoot>`;
            html += `<tr><td>TOTAL GERAL (${totalItemsCount} itens)</td><td>${grandTotalQuantity}</td></tr>`;
            html += `</tfoot></table>`;
        } else if (minStockOnly) {
             html += `<table class="grand-total-table"><tfoot>`;
            html += `<tr><td>ITENS ABAIXO DO MINIMO</td><td>${totalItemsCount}</td></tr>`;
            html += `</tfoot></table>`;
        }
        
        printArea.innerHTML = html;
        window.print();
    }
    
    function handlePrintMinStock() {
        handlePrint('all', true);
    }
    
    function handlePrintSelectedCategory() {
        const selectedCat = printCategorySelect.value;
        if (selectedCat === 'all') {
            handlePrint('all', false); 
        } else {
            handlePrint(selectedCat, false); 
        }
    }


    function exportToCSV() {
        const now = new Date();
        // Formato: YYYYMMDD_HHMMSS
        const timestamp = now.getFullYear().toString() + 
                          (now.getMonth() + 1).toString().padStart(2, '0') + 
                          now.getDate().toString().padStart(2, '0') + '_' + 
                          now.getHours().toString().padStart(2, '0') + 
                          now.getMinutes().toString().padStart(2, '0') + 
                          now.getSeconds().toString().padStart(2, '0');
                          
        const filename = `stock_export_${timestamp}.csv`; // Novo nome do arquivo
        
        const headers = 'id,name,category,quantity,minQuantity,image\n';
        const rows = stock.map(item =>
            `${item.id},"${item.name}","${item.category}",${item.quantity},${item.minQuantity || 0},"${item.image}"`
        ).join('\n');
        const csvContent = headers + rows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename); // Usa o novo nome do arquivo
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    function downloadCSVTemplate() {
        // Inclui minQuantity
        const headers = 'id,name,category,quantity,minQuantity,image\n';
        const exampleRow = '1,"Sample Item","Comida",10,5,"http://example.com/img.png"\n';
        const blob = new Blob([headers + exampleRow], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function importFromCSV(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!confirm('Are you sure you want to import this file? This will replace ALL current stock and categories.')) {
            e.target.value = null; 
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    let newStock = [];
                    let newCategories = [];

                    results.data.forEach(row => {
                        const newCat = row.category ? row.category.trim() : 'outros';
                        
                        if (newCat && !newCategories.includes(newCat)) {
                            newCategories.push(newCat);
                        }
                        
                        newStock.push({
                            id: parseInt(row.id) || (newStock.length + 1), 
                            name: row.name || 'Unnamed',
                            category: newCat,
                            quantity: parseInt(row.quantity) || 0,
                            minQuantity: parseInt(row.minQuantity) || 0, // Importa minQuantity
                            image: row.image || ''
                        });
                    });
                    
                    stock = newStock;
                    categories = newCategories;

                    // Garante que 'outros' esteja presente se houver itens nessa categoria
                    if (stock.length > 0 && !categories.includes('outros') && stock.some(i => i.category === 'outros')) {
                         categories.push('outros');
                    }
                    categories.sort();

                    alert('Stock imported successfully! All data has been replaced.');
                    
                    currentCategory = 'all'; 
                    renderStock();
                    renderCategoryFilters();
                    renderModalDropdown();
                    renderPrintCategoryDropdown(); 

                } catch (error) {
                    alert('Error parsing CSV file. Make sure it follows the template format.');
                    console.error(error);
                }
                e.target.value = null;
            },
            error: (err) => {
                alert('An error occurred during import.');
                console.error(err);
                e.target.value = null;
            }
        });
    }


    // --- EVENT LISTENERS ---

    filterButtonsContainer.addEventListener('click', (e) => {
        
        if (e.target.classList.contains('delete-category-btn')) {
            e.stopPropagation(); 
            const categoryToDelete = e.target.dataset.category;
            handleDeleteCategory(categoryToDelete);
            return; 
        }

        const button = e.target.closest('.filter-btn');
        
        if (button) {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategory = button.dataset.category;
            renderStock();
        }
    });

    stockList.addEventListener('click', (e) => {
        const target = e.target;
        if (!target.classList.contains('quantity-btn')) return;
        const id = parseInt(target.dataset.id);
        const action = target.dataset.action;
        if (action === 'increase') {
            updateQuantity(id, 1);
        } else if (action === 'decrease') {
            updateQuantity(id, -1);
        }
    });

    // Modal controls
    addNewBtn.addEventListener('click', () => openModal());
    modalCancelBtn.addEventListener('click', closeModal);
    itemForm.addEventListener('submit', handleFormSubmit);
    deleteItemBtn.addEventListener('click', deleteItem);
    
    // Action buttons
    printMinStockBtn.addEventListener('click', handlePrintMinStock); // Listener para Imprimir Mínimo
    printCategoryBtn.addEventListener('click', handlePrintSelectedCategory); // Listener para Imprimir Categoria
    exportCsvBtn.addEventListener('click', exportToCSV);
    templateCsvBtn.addEventListener('click', downloadCSVTemplate);
    importCsvInput.addEventListener('change', importFromCSV);
    
    // Add/Edit category button listener
    addCategoryBtn.addEventListener('click', addNewCategory);
    editCategoryBtn.addEventListener('click', editCategoryName); // Listener para Editar Categoria


    // --- INITIAL RENDER ---
    renderStock();
    renderCategoryFilters();
    renderModalDropdown();
    renderPrintCategoryDropdown(); 

});