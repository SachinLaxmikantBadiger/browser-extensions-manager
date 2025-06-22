document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const extensionsGrid = document.getElementById('extensions-grid');
    const filterButtonsContainer = document.getElementById('filter-buttons');
    const themeToggleButton = document.getElementById('theme-toggle');

    // --- State ---
    let extensions = [];
    let currentFilter = 'all'; // 'all', 'active', 'inactive'

    const slugify = (text) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');

    // --- Functions ---

    const toggleTheme = () => {
        const isLightTheme = document.body.classList.toggle('light-theme');
        themeToggleButton.textContent = isLightTheme ? '🌙' : '☀️';
        localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
    };
    
    const applySavedTheme = () => {
        if (localStorage.getItem('theme') === 'light') {
            document.body.classList.add('light-theme');
            themeToggleButton.textContent = '🌙';
        } else {
            themeToggleButton.textContent = '☀️';
        }
    };

    const renderExtensions = () => {
        extensionsGrid.innerHTML = ''; 

        const filteredExtensions = extensions.filter(ext => {
            if (currentFilter === 'active') return ext.active;
            if (currentFilter === 'inactive') return !ext.active;
            return true;
        });

        if (filteredExtensions.length === 0) {
            extensionsGrid.innerHTML = `<p class="empty-message" style="color: var(--text-secondary);">No extensions match the filter.</p>`;
            return;
        }

        filteredExtensions.forEach(ext => {
            const card = document.createElement('div');
            card.className = 'extension-card';
            card.dataset.id = ext.id;

            card.innerHTML = `
                <div class="card-header">
                    <div class="card-icon"><img src="${ext.logo}" alt="${ext.name} logo"></div>
                    <div class="card-info">
                        <h3>${ext.name}</h3>
                        <p>${ext.description}</p>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="remove-btn">Remove</button>
                    <label class="toggle-switch">
                        <input type="checkbox" ${ext.active ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            `;
            extensionsGrid.appendChild(card);
        });
    };

    const handleGridClick = (e) => {
        const card = e.target.closest('.extension-card');
        if (!card) return;

        const extensionId = card.dataset.id;
        const extension = extensions.find(ext => ext.id === extensionId);

        if (e.target.matches('.slider') || e.target.matches('.toggle-switch input')) {
            const checkbox = card.querySelector('input[type="checkbox"]');
            extension.active = checkbox.checked;
            if (currentFilter !== 'all') {
                setTimeout(renderExtensions, 300);
            }
        }

        if (e.target.classList.contains('remove-btn')) {
            extensions = extensions.filter(ext => ext.id !== extensionId);
            renderExtensions();
        }
    };
    
    const handleFilterClick = (e) => {
        if (!e.target.classList.contains('filter-btn')) return;

        filterButtonsContainer.querySelector('.active-filter').classList.remove('active-filter');
        e.target.classList.add('active-filter');

        currentFilter = e.target.dataset.filter;
        renderExtensions();
    };

    const initializeApp = async () => {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            extensions = data.map(ext => ({
                ...ext,
                id: slugify(ext.name),
                active: ext.isActive 
            }));
            
            applySavedTheme();
            renderExtensions();

        } catch (error) {
            console.error("Failed to load extensions data:", error);
            extensionsGrid.innerHTML = `<p class="error-message" style="color: var(--accent-color);">Could not load extensions. Please try again later.</p>`;
        }
    };

    // --- Event Listeners ---
    extensionsGrid.addEventListener('click', handleGridClick);
    filterButtonsContainer.addEventListener('click', handleFilterClick);
    themeToggleButton.addEventListener('click', toggleTheme);

    // --- Initial Load ---
    initializeApp();
});