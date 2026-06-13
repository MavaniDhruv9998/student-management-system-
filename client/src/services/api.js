import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const login = (credentials) => api.post('/login', credentials);
export const getStudents = (params) => api.get('/students', { params });
export const saveStudent = (studentData) => api.post('/students', studentData);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const getAttendance = (date) => api.get(`/attendance/${date}`);
export const getStudentAttendance = (studentId) => api.get(`/attendance/student/${studentId}`);
export const postAttendance = (attendanceData) => api.post('/attendance', attendanceData);
export const postBulkAttendance = (records) => api.post('/attendance/bulk', records);
export const getEvents = (params) => api.get('/events', { params });
export const postEvent = (eventData) => api.post('/events', eventData);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export const getResults = (studentId) => api.get(`/results/student/${studentId}`);
export const getNotifications = (userId) => api.get(`/notifications/${userId}`);

// Homework
export const getHomework = (params) => api.get('/homework', { params });
export const postHomework = (data) => api.post('/homework', data);
export const updateHomework = (id, data) => api.put(`/homework/${id}`, data);
export const deleteHomework = (id) => api.delete(`/homework/${id}`);

// Fees
export const getFees = (studentId) => api.get(`/fees/${studentId}`);

// Badges
export const getBadges = (studentId) => api.get(`/badges/${studentId}`);
export const postBadge = (data) => api.post('/badges', data);

// Teachers (Admin)
export const getTeachers = () => api.get('/teachers');
export const saveTeacher = (data) => api.post('/teachers', data);
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`);

export default api;
