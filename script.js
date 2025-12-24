// Основной JavaScript файл
class StomatologyPortal {
    constructor() {
        this.init();
    }

    init() {
        // Инициализация приложения
        this.initLocalStorage();
        this.initAuthState();
        this.initEventListeners();
        this.loadNews();
        this.loadCategories();
        this.startVisitorCounter();
    }

    initLocalStorage() {
        // Инициализация данных в localStorage
        if (!localStorage.getItem('stomatology_users')) {
            const defaultUsers = [
                { 
                    id: 1, 
                    fio: 'Администратор', 
                    login: 'admin', 
                    email: 'admin@example.com', 
                    password: 'admin',
                    role: 'admin'
                }
            ];
            localStorage.setItem('stomatology_users', JSON.stringify(defaultUsers));
        }

        if (!localStorage.getItem('stomatology_requests')) {
            localStorage.setItem('stomatology_requests', JSON.stringify([]));
        }

        if (!localStorage.getItem('stomatology_categories')) {
            const defaultCategories = [
                { id: 1, name: 'Лечение зубов' },
                { id: 2, name: 'Протезирование' },
                { id: 3, name: 'Гигиена' },
                { id: 4, name: 'Ортодонтия' },
                { id: 5, name: 'Хирургия' }
            ];
            localStorage.setItem('stomatology_categories', JSON.stringify(defaultCategories));
        }

       // ВСЕГДА устанавливаем фиксированные новости
    const defaultNews = [
        {
            id: 1,
            title: 'Скидки на имплантацию',
            description: 'Специальное предложение на импалантацию зубов до конца месяца.',
            date: '15.12.2025',
            category: 'Акция',
            image: 'implant.JPG'
        },
        {
            id: 2,
            title: 'Новое оборудование',
            description: 'В нашу клинику поступило новое цифровое оборудование для диагностики.',
            date: '10.12.2025',
            category: 'Технологии',
            image: 'diagnost.JPG'
        },
        {
            id: 3,
            title: 'Открытие нового кабинета',
            description: 'Мы открыли новый современный кабинет для ортодонтического лечения.',
            date: '05.12.2025',
            category: 'Новости',
            image: 'kabinet.jpg'
        },
        {
            id: 4,
            title: 'Новогодние каникулы',
            description: 'График работы в новогодние праздники.',
            date: '01.12.2025',
            category: 'Праздник',
            image: 'newyear.JPG'
        }
    ];
    
    // Всегда устанавливаем фиксированные новости (перезаписываем если что-то уже есть)
    localStorage.setItem('stomatology_news', JSON.stringify(defaultNews));

    if (!localStorage.getItem('stomatology_visitorCount')) {
        localStorage.setItem('stomatology_visitorCount', '0');
    }
}
  

    initAuthState() {
        // Проверка авторизации пользователя
        const currentUser = this.getCurrentUser();
        this.updateUIForAuthState(currentUser);
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('stomatology_currentUser')) || null;
    }

    setCurrentUser(user) {
        localStorage.setItem('stomatology_currentUser', JSON.stringify(user));
        this.updateUIForAuthState(user);
    }

    updateUIForAuthState(user) {
        const authLink = document.getElementById('authLink');
        const registerLink = document.getElementById('registerLink');
        const myRequestsLink = document.getElementById('myRequestsLink');
        const newRequestLink = document.getElementById('newRequestLink');
        const adminRequestsLink = document.getElementById('adminRequestsLink');
        const adminCategoriesLink = document.getElementById('adminCategoriesLink');
        const logoutLink = document.getElementById('logoutLink'); // Кнопка выхода
        
        // Проверяем, находимся ли мы на странице администратора
        const isAdminPage = window.location.pathname.includes('admin');
        
        if (user) {
            // Пользователь авторизован
            if (authLink) {
                authLink.innerHTML = '<i class="fas fa-user"></i> ' + user.fio;
                authLink.href = '#';
                authLink.onclick = (e) => e.preventDefault();
            }
            
            // Для НЕ админских страниц создаем кнопку выхода, если ее нет
            if (!isAdminPage) {
                if (!logoutLink) {
                    this.createLogoutButton();
                } else {
                    logoutLink.style.display = 'flex';
                }
            } else {
                // На админской странице скрываем кнопку выхода, если она есть
                if (logoutLink) logoutLink.style.display = 'none';
            }
            
            if (registerLink) registerLink.style.display = 'none';
            
            if (user.role === 'admin') {
                // АДМИНИСТРАТОР - скрываем "Мои заявки" и "Новая заявка"
                if (myRequestsLink) myRequestsLink.style.display = 'none';
                if (newRequestLink) newRequestLink.style.display = 'none';
                
                // Показываем административные ссылки только на главной странице (не в админке)
                if (!isAdminPage) {
                    if (adminRequestsLink) {
                        adminRequestsLink.style.display = 'block';
                        adminRequestsLink.onclick = (e) => {
                            e.preventDefault();
                            window.location.href = 'admin/admin.html';
                        };
                    }
                    if (adminCategoriesLink) {
                        adminCategoriesLink.style.display = 'block';
                        adminCategoriesLink.onclick = (e) => {
                            e.preventDefault();
                            window.location.href = 'admin/admin.html#categories';
                        };
                    }
                } else {
                    // В админке скрываем административные ссылки
                    if (adminRequestsLink) adminRequestsLink.style.display = 'none';
                    if (adminCategoriesLink) adminCategoriesLink.style.display = 'none';
                }
            } else {
                // ОБЫЧНЫЙ ПОЛЬЗОВАТЕЛЬ - показываем "Мои заявки" и "Новая заявка"
                if (myRequestsLink) {
                    myRequestsLink.style.display = 'block';
                    myRequestsLink.onclick = (e) => {
                        e.preventDefault();
                        this.showMyRequests();
                    };
                }
                
                if (newRequestLink) {
                    newRequestLink.style.display = 'block';
                    newRequestLink.onclick = (e) => {
                        e.preventDefault();
                        this.showNewRequestModal();
                    };
                }
                
                // Скрываем административные ссылки для обычных пользователей
                if (adminRequestsLink) adminRequestsLink.style.display = 'none';
                if (adminCategoriesLink) adminCategoriesLink.style.display = 'none';
            }
        } else {
            // ГОСТЬ
            if (authLink) {
                authLink.innerHTML = '<i class="fas fa-user"></i> Войти';
                // Используем правильный путь к login.html
                authLink.href = isAdminPage ? '../login.html' : 'login.html';
                authLink.onclick = null;
            }
            
            // Скрываем кнопку выхода
            if (logoutLink) logoutLink.style.display = 'none';
            
            if (registerLink) {
                registerLink.href = isAdminPage ? '../register.html' : 'register.html';
                registerLink.style.display = 'block';
            }
            if (myRequestsLink) myRequestsLink.style.display = 'none';
            if (newRequestLink) newRequestLink.style.display = 'none';
            if (adminRequestsLink) adminRequestsLink.style.display = 'none';
            if (adminCategoriesLink) adminCategoriesLink.style.display = 'none';
        }
    }

    // Метод для создания кнопки выхода (только для не-админских страниц)
    createLogoutButton() {
        // Проверяем, находимся ли мы на странице администратора
        const isAdminPage = window.location.pathname.includes('admin');
        if (isAdminPage) return; // Не создаем кнопку выхода в админке
        
        // Проверяем, есть ли уже кнопка выхода
        let logoutLink = document.getElementById('logoutLink');
        
        if (!logoutLink) {
            // Создаем новый элемент списка для кнопки выхода
            const mainNav = document.querySelector('.main-nav ul');
            if (!mainNav) return;
            
            const logoutItem = document.createElement('li');
            logoutItem.id = 'logoutLink';
            logoutItem.innerHTML = `
                <a href="#" onclick="portal.logout()">
                    <i class="fas fa-sign-out-alt"></i> Выйти
                </a>
            `;
            mainNav.appendChild(logoutItem);
            
            // Добавляем стили для кнопки выхода
            const style = document.createElement('style');
            style.textContent = `
                #logoutLink a {
                    background: rgba(255, 107, 107, 0.1);
                    border: 1px solid rgba(255, 107, 107, 0.3);
                }
                #logoutLink a:hover {
                    background: rgba(255, 107, 107, 0.25);
                }
                #logoutLink a i {
                    color: #FF6B6B;
                }
            `;
            document.head.appendChild(style);
        }
    }

    logout() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            localStorage.removeItem('stomatology_currentUser');
            
            // Определяем текущую страницу для правильного перенаправления
            const isAdminPage = window.location.pathname.includes('admin');
            const redirectUrl = isAdminPage ? '../index.html' : 'index.html';
            
            window.location.href = redirectUrl;
        }
    }

    initEventListeners() {
        // Обработчики для модальных окон
        const modalCloseButtons = document.querySelectorAll('.close');
        modalCloseButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                this.closeModal(modal);
            });
        });

        // Закрытие модального окна по клику вне его
        window.addEventListener('click', (e) => {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Фильтрация заявок
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.filterRequests(e.target.dataset.filter);
            });
        });

        // Форма новой заявки
        const requestForm = document.getElementById('requestForm');
        if (requestForm) {
            requestForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitRequest();
            });
        }
    }

    loadNews() {
        const newsGrid = document.getElementById('newsGrid');
        if (!newsGrid) return;

        const news = JSON.parse(localStorage.getItem('stomatology_news')) || [];
        
        newsGrid.innerHTML = news.slice(0, 4).map(item => `
            <div class="news-card" data-id="${item.id}">
                <div class="news-img">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="news-content">
                    <div class="news-meta">
                        <span>${item.date}</span>
                        <span>${item.category}</span>
                    </div>
                    <h3 class="news-title">${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            </div>
        `).join('');
    }

    loadCategories() {
        const categorySelect = document.getElementById('requestCategory');
        if (!categorySelect) return;

        const categories = JSON.parse(localStorage.getItem('stomatology_categories')) || [];
        categorySelect.innerHTML = '<option value="">Выберите категорию</option>' +
            categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    }

    startVisitorCounter() {
        const counterElement = document.getElementById('counterValue');
        if (!counterElement) return;

        // Увеличиваем счетчик каждые 5 секунд
        setInterval(() => {
            let count = parseInt(localStorage.getItem('stomatology_visitorCount') || '0');
            count += Math.floor(Math.random() * 3) + 1; // Случайное увеличение
            localStorage.setItem('stomatology_visitorCount', count.toString());
            
            // Анимация изменения числа
            counterElement.style.transform = 'scale(1.2)';
            counterElement.style.color = '#4CAF50';
            setTimeout(() => {
                counterElement.textContent = count;
                counterElement.style.transform = 'scale(1)';
                counterElement.style.color = '';
            }, 200);
        }, 5000);

        // Инициализация начального значения
        counterElement.textContent = localStorage.getItem('stomatology_visitorCount') || '0';
    }

    showMyRequests() {
        const modal = document.getElementById('requestModal');
        this.openModal(modal);
        this.loadUserRequests();
    }

    showNewRequestModal() {
        const modal = document.getElementById('newRequestModal');
        this.openModal(modal);
        this.loadCategories();
    }

    openModal(modal) {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    loadUserRequests() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            alert('Пожалуйста, войдите в систему');
            return;
        }

        const requests = JSON.parse(localStorage.getItem('stomatology_requests')) || [];
        const userRequests = requests.filter(req => req.userId === currentUser.id);
        
        const requestsList = document.getElementById('requestsList');
        if (!requestsList) return;
        
        if (userRequests.length === 0) {
            requestsList.innerHTML = '<p class="no-requests">У вас пока нет заявок</p>';
            return;
        }
        
        requestsList.innerHTML = userRequests.map(request => `
            <div class="request-item ${request.status}">
                <div class="request-header">
                    <span class="request-date">${request.date}</span>
                    <span class="request-status status-${request.status}">${this.getStatusText(request.status)}</span>
                </div>
                <h4 class="request-title">${request.title}</h4>
                <p>${request.description}</p>
                <div class="request-meta">
                    <span>Категория: ${this.getCategoryName(request.categoryId)}</span>
                    ${request.rejectReason ? `<br><span>Причина отказа: ${request.rejectReason}</span>` : ''}
                </div>
                ${request.status === 'new' ? `
                    <div class="request-actions">
                        <button class="btn-danger" onclick="portal.deleteRequest(${request.id})">Удалить</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    filterRequests(filter) {
        const requestItems = document.querySelectorAll('.request-item');
        requestItems.forEach(item => {
            if (filter === 'all' || item.classList.contains(filter)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    getStatusText(status) {
        const statusMap = {
            'new': 'Новая',
            'solved': 'Решена',
            'rejected': 'Отклонена'
        };
        return statusMap[status] || status;
    }

    getCategoryName(categoryId) {
        const categories = JSON.parse(localStorage.getItem('stomatology_categories')) || [];
        const category = categories.find(cat => cat.id == categoryId);
        return category ? category.name : 'Неизвестно';
    }

    submitRequest() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            alert('Пожалуйста, войдите в систему');
            return;
        }

        const title = document.getElementById('requestTitle').value.trim();
        const description = document.getElementById('requestDescription').value.trim();
        const categoryId = document.getElementById('requestCategory').value;

        // Валидация
        let hasError = false;

        if (!title) {
            this.showError('titleError', 'Введите название заявки');
            hasError = true;
        } else {
            this.hideError('titleError');
        }

        if (!description) {
            this.showError('descriptionError', 'Введите описание заявки');
            hasError = true;
        } else {
            this.hideError('descriptionError');
        }

        if (!categoryId) {
            this.showError('categoryError', 'Выберите категорию');
            hasError = true;
        } else {
            this.hideError('categoryError');
        }

        if (hasError) return;

        // Создание новой заявки
        const requests = JSON.parse(localStorage.getItem('stomatology_requests')) || [];
        const newRequest = {
            id: Date.now(),
            userId: currentUser.id,
            date: new Date().toLocaleString('ru-RU'),
            title,
            description,
            categoryId: parseInt(categoryId),
            status: 'new'
        };

        requests.push(newRequest);
        localStorage.setItem('stomatology_requests', JSON.stringify(requests));

        // Очистка формы и закрытие модального окна
        document.getElementById('requestForm').reset();
        this.closeModal(document.getElementById('newRequestModal'));
        
        // Показать успешное сообщение
        this.showNotification('Заявка успешно создана!', 'success');
        
        // Обновить список заявок
        this.loadUserRequests();
    }

    deleteRequest(requestId) {
        if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return;

        const requests = JSON.parse(localStorage.getItem('stomatology_requests')) || [];
        const requestIndex = requests.findIndex(req => req.id === requestId);
        
        if (requestIndex !== -1) {
            const request = requests[requestIndex];
            if (request.status === 'new') {
                requests.splice(requestIndex, 1);
                localStorage.setItem('stomatology_requests', JSON.stringify(requests));
                this.loadUserRequests();
                this.showNotification('Заявка успешно удалена', 'success');
            } else {
                this.showNotification('Нельзя удалить заявку с измененным статусом', 'error');
            }
        }
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            errorElement.style.animation = 'fadeIn 0.3s ease';
        }
    }

    hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        // Создание уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#FF6B6B' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;

        document.body.appendChild(notification);

        // Автоматическое скрытие
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Класс для работы с авторизацией
class AuthManager {
    static validateRegistration(formData) {
        const errors = {};

        // Валидация ФИО (только кириллица, пробелы и дефис)
        const fioRegex = /^[А-ЯЁа-яё\s\-]+$/;
        if (!formData.fio || !fioRegex.test(formData.fio)) {
            errors.fio = 'ФИО должно содержать только кириллические буквы, пробелы и дефис';
        }

        // Валидация логина (только латиница)
        const loginRegex = /^[a-zA-Z0-9_]+$/;
        if (!formData.login || !loginRegex.test(formData.login)) {
            errors.login = 'Логин должен содержать только латинские буквы и цифры';
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            errors.email = 'Введите корректный email адрес';
        }

        // Валидация пароля
        if (!formData.password || formData.password.length < 6) {
            errors.password = 'Пароль должен содержать не менее 6 символов';
        }

        // Проверка совпадения паролей
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Пароли не совпадают';
        }

        // Проверка согласия
        if (!formData.agree) {
            errors.agree = 'Необходимо согласие на обработку персональных данных';
        }

        return errors;
    }

    static register(userData) {
        const users = JSON.parse(localStorage.getItem('stomatology_users')) || [];
        
        // Проверка уникальности логина
        if (users.find(user => user.login === userData.login)) {
            throw new Error('Этот логин уже занят');
        }
        
        const newUser = {
            id: Date.now(),
            fio: userData.fio,
            login: userData.login,
            email: userData.email,
            password: userData.password,
            role: 'user'
        };
        
        users.push(newUser);
        localStorage.setItem('stomatology_users', JSON.stringify(users));
        return newUser;
    }

    static login(login, password) {
        const users = JSON.parse(localStorage.getItem('stomatology_users')) || [];
        const user = users.find(u => u.login === login && u.password === password);
        return user;
    }
}

// Инициализация приложения
let portal;

document.addEventListener('DOMContentLoaded', () => {
    portal = new StomatologyPortal();
});

// Функции для страниц авторизации
window.validateAndRegister = function(event) {
    event.preventDefault();
    
    const formData = {
        fio: document.getElementById('fio').value.trim(),
        login: document.getElementById('login').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        agree: document.getElementById('agree').checked
    };

    // Очистка предыдущих ошибок
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
        if (el.previousElementSibling) {
            el.previousElementSibling.style.borderColor = '';
        }
    });

    // Проверка уникальности логина
    const users = JSON.parse(localStorage.getItem('stomatology_users')) || [];
    if (users.find(user => user.login === formData.login)) {
        const loginError = document.getElementById('loginError');
        const loginInput = document.getElementById('login');
        
        if (loginError && loginInput) {
            loginError.textContent = 'Этот логин уже занят';
            loginError.style.display = 'block';
            loginError.style.animation = 'fadeIn 0.3s ease';
            loginInput.style.borderColor = '#FF6B6B';
        }
        return;
    }

    const errors = AuthManager.validateRegistration(formData);
    
    let hasErrors = false;
    
    for (const field in errors) {
        const errorElement = document.getElementById(`${field}Error`);
        const inputElement = document.getElementById(field);
        
        if (errorElement && inputElement) {
            errorElement.textContent = errors[field];
            errorElement.style.display = 'block';
            errorElement.style.animation = 'fadeIn 0.3s ease';
            inputElement.style.borderColor = '#FF6B6B';
            hasErrors = true;
        }
    }

    if (hasErrors) {
        return;
    }

    try {
        // Все проверки прошли успешно
        const user = AuthManager.register(formData);
        
        // Устанавливаем текущего пользователя
        localStorage.setItem('stomatology_currentUser', JSON.stringify(user));
        
        // Показываем сообщение об успехе
        const notification = document.createElement('div');
        notification.className = 'notification notification-success';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Регистрация успешна!</span>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        document.body.appendChild(notification);
        
        // Определяем, откуда пришли для правильного редиректа
        const isAdminPage = window.location.pathname.includes('admin');
        const redirectUrl = isAdminPage ? '../index.html' : 'index.html';
        
        // Автоматический редирект через 1.5 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
                window.location.href = redirectUrl;
            }, 300);
        }, 1500);
        
    } catch (error) {
        // Обработка ошибок от AuthManager.register
        const loginError = document.getElementById('loginError');
        const loginInput = document.getElementById('login');
        
        if (loginError && loginInput) {
            loginError.textContent = error.message;
            loginError.style.display = 'block';
            loginError.style.animation = 'fadeIn 0.3s ease';
            loginInput.style.borderColor = '#FF6B6B';
        }
    }
};

window.validateAndLogin = function(event) {
    event.preventDefault();
    
    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value;
    
    // Очистка предыдущих ошибок
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
        if (el.previousElementSibling) {
            el.previousElementSibling.style.borderColor = '';
        }
    });
    
    const user = AuthManager.login(login, password);
    
    if (user) {
        // Устанавливаем текущего пользователя
        localStorage.setItem('stomatology_currentUser', JSON.stringify(user));
        
        // Определяем, откуда пришли для правильного редиректа
        const isAdminPage = window.location.pathname.includes('admin');
        const redirectUrl = isAdminPage ? '../index.html' : 'index.html';
        
        // Редирект на главную страницу
        window.location.href = redirectUrl;
    } else {
        const loginError = document.getElementById('loginError');
        const loginInput = document.getElementById('login');
        const passwordInput = document.getElementById('password');
        
        if (loginError) {
            loginError.textContent = 'Неверный логин или пароль';
            loginError.style.display = 'block';
            loginError.style.animation = 'fadeIn 0.3s ease';
        }
        
        if (loginInput) loginInput.style.borderColor = '#FF6B6B';
        if (passwordInput) passwordInput.style.borderColor = '#FF6B6B';
    }
};

// Для страницы index.html
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', () => {
        portal = new StomatologyPortal();
    });

}

