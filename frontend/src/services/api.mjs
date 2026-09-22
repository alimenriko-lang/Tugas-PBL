const API_BASE_URL = 'http://localhost:5000/api';

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('taskflow_token');

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan saat memproses permintaan.');
    }

    return data;
};

export const authService = {
    register: (userData) => apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),
    login: (credentials) => apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),
    getMe: () => apiFetch('/me')
};

export const taskService = {
    getTasks: (filters = {}) => {
        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
        if (filters.priority && filters.priority !== 'all') queryParams.append('priority', filters.priority);
        if (filters.category && filters.category !== 'all') queryParams.append('category', filters.category);

        const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return apiFetch(`/tasks${qs}`);
    },
    getStats: () => apiFetch('/tasks/stats'),
    getTaskById: (id) => apiFetch(`/tasks/${id}`),
    createTask: (taskData) => apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
    }),
    updateTask: (id, taskData) => apiFetch(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(taskData)
    }),
    deleteTask: (id) => apiFetch(`/tasks/${id}`, {
        method: 'DELETE'
    })
};
