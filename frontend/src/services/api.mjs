export const API_BASE_URL = 'http://localhost:5000/api';

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
    getMe: () => apiFetch('/me'),
    forgotPassword: (email) => apiFetch('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
    }),
    verifyResetToken: (token) => apiFetch(`/verify-reset-token/${encodeURIComponent(token)}`),
    resetPassword: (resetData) => apiFetch('/reset-password', {
        method: 'POST',
        body: JSON.stringify(resetData)
    }),
    updateProfile: (profileData) => apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
    }),
    changePassword: (passwordData) => apiFetch('/change-password', {
        method: 'PUT',
        body: JSON.stringify(passwordData)
    }),
    deleteAccount: (data) => apiFetch('/account', {
        method: 'DELETE',
        body: JSON.stringify(data)
    }),
    getGoogleAuthUrl: (intent = 'login') => `${API_BASE_URL}/auth/google?intent=${intent}`,
    getGithubAuthUrl: (intent = 'login') => `${API_BASE_URL}/auth/github?intent=${intent}`
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
