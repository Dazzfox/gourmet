document.addEventListener('DOMContentLoaded', () => {
    // Gestion du thème
    const themeToggle = document.getElementById('darkModeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';

    const setTheme = (theme) => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeToggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    };

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    setTheme(savedTheme);

    // Gestion du menu mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const mainMenu = document.getElementById('main-menu');

    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', () => {
            mainMenu.classList.toggle('active');
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // Gestion des favoris
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const recipeId = btn.dataset.recipeId;
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        if (favorites.includes(recipeId)) {
            btn.classList.add('active');
            btn.setAttribute('aria-label', 'Retirer des favoris');
        } else {
            btn.setAttribute('aria-label', 'Ajouter aux favoris');
        }

        btn.addEventListener('click', function(event) {
            event.preventDefault();
            btn.classList.toggle('active');
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            
            if (btn.classList.contains('active')) {
                btn.setAttribute('aria-label', 'Retirer des favoris');
                favorites.push(recipeId);
            } else {
                btn.setAttribute('aria-label', 'Ajouter aux favoris');
                const index = favorites.indexOf(recipeId);
                if (index > -1) favorites.splice(index, 1);
            }
            localStorage.setItem('favorites', JSON.stringify(favorites));
        });
    });

    // Gestion de l'accordéon FAQ
    document.querySelectorAll('.accordion-button').forEach(button => {
        button.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            
            const targetId = this.getAttribute('aria-controls');
            const targetContent = document.getElementById(targetId);
            
            if (targetContent) {
                targetContent.classList.toggle('show');
            }
        });
    });

    // Filtrage des recettes
    const filters = {
        category: [],
        time: [],
        difficulty: []
    };

    document.querySelectorAll('[data-filter-type]').forEach(group => {
        const type = group.dataset.filterType;

        group.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    filters[type].push(checkbox.value);
                } else {
                    filters[type] = filters[type].filter(v => v !== checkbox.value);
                }
                filterRecipes();
            });
        });
    });

    function filterRecipes() {
        document.querySelectorAll('.recipe-item').forEach(recipe => {
            const matchesCategory = filters.category.length === 0 ||
                filters.category.includes(recipe.dataset.category);

            const matchesTime = filters.time.length === 0 ||
                filters.time.some(t => parseInt(recipe.dataset.time) <= t);

            const matchesDifficulty = filters.difficulty.length === 0 ||
                filters.difficulty.includes(recipe.dataset.difficulty);

            recipe.style.display = (matchesCategory && matchesTime && matchesDifficulty)
                ? 'block'
                : 'none';
        });
    }

    // Recherche
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();

            document.querySelectorAll('.recipe-title').forEach(title => {
                const recipeItem = title.closest('.recipe-item');
                if (recipeItem) {
                    recipeItem.style.display =
                        title.textContent.toLowerCase().includes(searchTerm)
                        ? 'block'
                        : 'none';
                }
            });
        });
    }

    // Récupération et affichage des favoris
    const favoritesList = document.getElementById('favorites-list');
    const noFavorites = document.getElementById('no-favorites');
    
    if (favoritesList && noFavorites) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        if (favorites.length === 0) {
            noFavorites.style.display = 'block';
        } else {
            favorites.forEach(recipeId => {
                const recipe = getRecipeById(recipeId);
                if (recipe) {
                    const recipeElement = createRecipeElement(recipe);
                    favoritesList.appendChild(recipeElement);
                }
            });
        }

        // Suppression de favoris
        favoritesList.addEventListener('click', (event) => {
            if (event.target.classList.contains('favorite-btn')) {
                const recipeId = event.target.dataset.recipeId;
                const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
                const index = favorites.indexOf(recipeId);
                
                if (index > -1) {
                    favorites.splice(index, 1);
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    const recipeItem = event.target.closest('.recipe-item');
                    if (recipeItem) {
                        recipeItem.remove();
                    }
                    
                    if (favorites.length === 0) {
                        noFavorites.style.display = 'block';
                    }
                }
            }
        });
    }

    // Validation du formulaire de contact
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const name = contactForm.name.value.trim();
            const email = contactForm.email.value.trim();
            const message = contactForm.message.value.trim();

            if (name === '' || email === '' || message === '') {
                alert('Veuillez remplir tous les champs.');
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                alert('Veuillez entrer une adresse email valide.');
                return;
            }

            alert('Merci pour votre message! Nous vous répondrons dès que possible.');
            contactForm.reset();
        });
    }

    // Validation du formulaire d'ajout de recette
    const addRecipeForm = document.getElementById('addRecipeForm');
    if (addRecipeForm) {
        addRecipeForm.addEventListener('submit', function(event) {
            event.preventDefault();
            alert('Fonctionnalité en cours de développement. Votre recette sera bientôt ajoutée!');
        });
    }

    // Gestion des paramètres d'URL pour la page de recette
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    
    if (recipeId && window.location.pathname.includes('recette.html')) {
        const recipe = getRecipeById(recipeId);
        if (recipe) {
            updateRecipeDetails(recipe);
        }
    }

    function updateRecipeDetails(recipe) {
        const recipeImage = document.querySelector('.recipe-image');
        const recipeTitle = document.querySelector('.recipe-info h1');
        const categoryBadge = document.querySelector('.badge-category');
        const timeBadge = document.querySelector('.badge-time');
        const difficultyBadge = document.querySelector('.badge-difficulty');
        const servingsBadge = document.querySelector('.badge-servings');
        
        if (recipeImage) recipeImage.src = recipe.image;
        if (recipeImage) recipeImage.alt = recipe.title;
        if (recipeTitle) recipeTitle.textContent = recipe.title;
        if (categoryBadge) categoryBadge.textContent = recipe.category;
        if (timeBadge) timeBadge.textContent = recipe.time;
        if (difficultyBadge) difficultyBadge.textContent = recipe.difficulty;
    }
});

// Fonction pour obtenir une recette par son ID
function getRecipeById(recipeId) {
    // Base de données de recettes
    const recipes = [
        { 
            id: '1', 
            title: 'Tarte aux pommes', 
            category: 'Dessert', 
            time: '60 min', 
            difficulty: 'Facile', 
            image: 'assets/images/tarte.jpg',
            servings: '4 personnes'
        },
        { 
            id: '2', 
            title: 'Ratatouille provençale', 
            category: 'Plat', 
            time: '45 min', 
            difficulty: 'Moyen', 
            image: 'assets/images/Rataouille.jpeg',
            servings: '4 personnes'
        },
        { 
            id: '3', 
            title: 'Velouté de potiron', 
            category: 'Entrée', 
            time: '30 min', 
            difficulty: 'Facile', 
            image: 'assets/images/velouté.jpeg',
            servings: '4 personnes'
        }
    ];
    return recipes.find(recipe => recipe.id === recipeId);
}

// Fonction pour créer un élément de recette
function createRecipeElement(recipe) {
    const article = document.createElement('article');
    article.classList.add('recipe-item');
    article.dataset.category = recipe.category.toLowerCase();
    article.dataset.time = recipe.time.split(' ')[0];
    article.dataset.difficulty = recipe.difficulty.toLowerCase();
    
    article.innerHTML = `
        <div class="recipe-card">
            <img src="${recipe.image}" class="recipe-image" alt="${recipe.title}">
            <button class="favorite-btn active" data-recipe-id="${recipe.id}" aria-label="Retirer des favoris">❤️</button>
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.title}</h3>
                <div class="recipe-meta">
                    <span class="badge badge-category">${recipe.category}</span>
                    <span class="badge badge-time">${recipe.time}</span>
                    <span class="badge badge-difficulty">${recipe.difficulty === 'Moyen' ? 'badge-difficulty-medium' : 'badge-difficulty'}">${recipe.difficulty}</span>
                </div>
                <a href="recette.html?id=${recipe.id}" class="btn-primary">Voir la recette</a>
            </div>
        </div>
    `;
    return article;
}
