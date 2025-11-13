document.addEventListener('DOMContentLoaded', () => {

    // --- STATE ---
    let stock = [
        { id: 1, name: 'Coca-Cola lata', category: 'drinks', quantity: 24, image: 'https://via.placeholder.com/80/e94560/000000?text=Drink' },
        { id: 2, name: 'Pão Australiano', category: 'pãos', quantity: 30, image: 'https://via.placeholder.com/80/f9d806/000000?text=Pão' },
        { id: 3, name: 'Descartavel 500ml', category: 'Copos', quantity: 100, image: 'https://via.placeholder.com/80/0f3460/FFFFFF?text=Food' },
        { id: 4, name: 'Caneca Chopp', category: 'outros', quantity: 8, image: 'https://via.placeholder.com/80/AAAAAA/000000?text=Misc' }
    ];
    let categories = ['comida', 'drinks', 'pãos', 'outros'];
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
    const itemImageField = document.getElementById('item-image');
    
    // Dynamic Elements
    const itemCategorySelect = document.getElementById('item-category');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const newCategoryNameInput = document.getElementById('new-category-name');

    // Action Buttons
    const printBtn = document.getElementById('print-btn');
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
            itemImageField.value = item.image;
            deleteItemBtn.classList.remove('hidden');
        } else {
            modalTitle.textContent = 'New Item';
            itemIdField.value = '';
            // Default to first category in dropdown
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
            image: itemImageField.value
        };

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

    /**
     * Renders the category filter buttons, now with delete "x"
     */
	function renderCategoryFilters() {
        const existingButtons = filterButtonsContainer.querySelectorAll('.filter-btn:not([data-category="all"])');
        existingButtons.forEach(btn => btn.remove());
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.dataset.category = category;

            // NEW: Wrap text in a span for CSS styling
            const textSpan = document.createElement('span');
            textSpan.className = 'category-text';
            textSpan.textContent = category;
            button.appendChild(textSpan);

            // Add delete button (NOW APPLIES TO ALL)
            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-category-btn';
            deleteBtn.textContent = 'x';
            deleteBtn.dataset.category = category;
            button.appendChild(deleteBtn);

            filterButtonsContainer.appendChild(button);
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
        const newCategory = newCategoryNameInput.value.trim().toLowerCase();
        if (newCategory === '') {
            alert('Please enter a category name.');
            return;
        }
        if (categories.includes(newCategory)) {
            alert('This category already exists.');
            return;
        }

        categories.push(newCategory);
        renderCategoryFilters();
        renderModalDropdown();
        newCategoryNameInput.value = '';
    }

    /**
     * NEW: Handles the deletion of a category and all its items
     */
    function handleDeleteCategory(categoryName) {
        // REMOVED: The check for "outros" is gone.

        const itemsInCatCount = stock.filter(item => item.category === categoryName).length;
        let confirmationText = `Are you sure you want to delete the "${categoryName}" category?`;
        
        if (itemsInCatCount > 0) {
            confirmationText += `\n\nThis will also delete ${itemsInCatCount} item(s) in this category.`;
        } else {
            confirmationText += `\n\nThis category is empty.`;
        }

        if (confirm(confirmationText)) {
            // 1. Remove category from list
            categories = categories.filter(cat => cat !== categoryName);
            // 2. Remove all items in that category
            stock = stock.filter(item => item.category !== categoryName);
            
            // 3. NEW: Safeguard
            // If all categories are gone, add "outros" back
            if (categories.length === 0) {
                categories.push('outros');
            }

            // 4. Re-render everything
            renderStock();
            renderCategoryFilters();
            renderModalDropdown();
        }
    }


    // --- COMPLEX FEATURES ---

	function handlePrint() {
        const printArea = document.getElementById('print-area');
        
        const now = new Date();
        const formattedDate = now.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        }) + ' ' + now.toLocaleTimeString('pt-BR', {
            hour: '2-digit', minute: '2-digit'
        });

        // NEW: Get commentary
        const commentary = printCommentaryEl.value.trim();

        const categoriesToPrint = [...categories]; 
        let grandTotal = 0;
        
        let html = `<div class="print-date">${formattedDate}</div>`;

        // NEW: Add commentary to HTML if it exists
        if (commentary) {
            html += `<div class="print-comment">${commentary}</div>`;
        }

        categoriesToPrint.forEach(category => {
            const itemsInCategory = stock.filter(item => item.category === category);
            if (itemsInCategory.length === 0) return;
			
			html += `<div class="print-category-block">`; // <-- ADICIONE ESTA LINHA
            html += `<h3>${category}</h3>`;
            html += '<table><tbody>'; 
            let categorySubtotal = 0;
            itemsInCategory.forEach(item => {
                html += `<tr><td>${item.name}</td><td>${item.quantity}</td></tr>`;
                categorySubtotal += item.quantity;
            });
            html += `</tbody><tfoot>`;
            html += `<tr><td>Subtotal</td><td>${categorySubtotal}</td></tr>`;
            html += `</tfoot></table>`;
            html += `<hr>`;
			html += `</div>`;
			
            grandTotal += categorySubtotal;
        });

        html += `<table class="grand-total-table"><tfoot>`;
        html += `<tr><td>TOTAL GERAL</td><td>${grandTotal}</td></tr>`;
        html += `</tfoot></table>`;
        printArea.innerHTML = html;
        window.print();
    }

    function exportToCSV() {
        // This function exports the current 'stock' array.
        // If you add a new category and items to it, they will be saved.
        const headers = 'id,name,category,quantity,image\n';
        const rows = stock.map(item =>
            `${item.id},"${item.name}","${item.category}",${item.quantity},"${item.image}"`
        ).join('\n');
        const csvContent = headers + rows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'stock.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    function downloadCSVTemplate() {
        const headers = 'id,name,category,quantity,image\n';
        const exampleRow = '1,"Sample Item","comida",10,"http://example.com/img.png"\n';
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

    /**
     * UPDATED: Handles file import, REPLACING all existing data.
     */
    function importFromCSV(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!confirm('Are you sure you want to import this file? This will replace ALL current stock and categories.')) {
            e.target.value = null; // Reset file input
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    // Start with fresh, empty arrays
                    let newStock = [];
                    let newCategories = [];

                    results.data.forEach(row => {
                        const newCat = row.category ? row.category.toLowerCase() : 'outros';
                        
                        // Build the new category list
                        if (newCat && !newCategories.includes(newCat)) {
                            newCategories.push(newCat);
                        }
                        
                        // Build the new stock list
                        newStock.push({
                            id: parseInt(row.id) || (newStock.length + 1), // Use existing ID or generate one
                            name: row.name || 'Unnamed',
                            category: newCat,
                            quantity: parseInt(row.quantity) || 0,
                            image: row.image || ''
                        });
                    });
                    
                    // Replace the old state completely with the new state
                    stock = newStock;
                    categories = newCategories;

                    // Ensure 'outros' exists if any items were added
                    if (stock.length > 0 && !categories.includes('outros')) {
                         categories.push('outros');
                    }

                    alert('Stock imported successfully! All data has been replaced.');
                    
                    // Re-render everything
                    currentCategory = 'all'; // Reset filter
                    renderStock();
                    renderCategoryFilters();
                    renderModalDropdown();

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
        
        // FIRST: Check if the "x" was clicked
        if (e.target.classList.contains('delete-category-btn')) {
            e.stopPropagation(); // Prevents the button click from firing
            const categoryToDelete = e.target.dataset.category;
            handleDeleteCategory(categoryToDelete);
            return; // Stop here
        }

        // SECOND: If not the "x", find the button that was clicked
        // This works even if you click the text span or the button's padding
        const button = e.target.closest('.filter-btn');
        
        if (button) {
            // This is a normal filter click
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
    printBtn.addEventListener('click', handlePrint);
    exportCsvBtn.addEventListener('click', exportToCSV);
    templateCsvBtn.addEventListener('click', downloadCSVTemplate);
    importCsvInput.addEventListener('change', importFromCSV);
    
    // Add category button listener
    addCategoryBtn.addEventListener('click', addNewCategory);


    // --- INITIAL RENDER ---
    renderStock();
    renderCategoryFilters();
    renderModalDropdown();

});
