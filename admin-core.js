const API_BASE_URL = 'https://education-backend-x9vo.onrender.com/api';
var editingMode = null; 
var editingId = null;

var allProgrammesData = [];
var allSemestersData = [];
var allCoursesList = [];

// =====================================
// AUTHENTICATION LOGIC (API LOGIN)
// =====================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

function checkAuthStatus() {
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('mainDashboard').style.display = 'flex';
        loadCategoriesForUpload();
        if (typeof toggleFields === 'function') toggleFields();
    } else {
        document.getElementById('loginOverlay').style.display = 'flex';
        document.getElementById('mainDashboard').style.display = 'none';
    }
}

async function loginAdmin() {
    const user = document.getElementById('adminUsername').value;
    const pass = document.getElementById('adminPassword').value;
    const errorMsg = document.getElementById('loginError');

    if (!user || !pass) { 
        errorMsg.innerText = "Please enter both Username and Password!"; 
        errorMsg.style.display = 'block'; 
        return; 
    }

    const loginBtn = document.querySelector('.login-box .btn-primary');
    const originalBtnHTML = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Checking...';

    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
            sessionStorage.setItem('isLoggedIn', 'true'); 
            errorMsg.style.display = 'none'; 
            checkAuthStatus();
        } else {
            errorMsg.innerText = data.message || "Invalid Username or Password!"; 
            errorMsg.style.display = 'block';
        }
    } catch (error) {
        errorMsg.innerText = "Server connection failed! Please try again."; 
        errorMsg.style.display = 'block';
    } finally { 
        loginBtn.innerHTML = originalBtnHTML; 
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('isLoggedIn'); 
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = ''; 
    document.getElementById('loginError').style.display = 'none';
    checkAuthStatus();
}

// Allow pressing "Enter" to login
document.getElementById('adminPassword')?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') loginAdmin();
});
document.getElementById('adminUsername')?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') loginAdmin();
});

// =====================================
// UI & TAB LOGIC
// =====================================

function switchAdminTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
    
    if (tabName === 'content') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('content-tab').classList.add('active');
    } else if (tabName === 'manage') {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('manage-tab').classList.add('active');
        if (typeof loadCategoryLists === 'function') loadCategoryLists(); 
    }
}

function toggleFields() {
    const type = document.getElementById('contentType').value;
    const vidGroup = document.getElementById('videoLinkGroup'); 
    const noteGroup = document.getElementById('noteLinkGroup');
    const vidInput = document.getElementById('videoLink'); 
    const noteInput = document.getElementById('noteLink');
    
    if(type === 'both') { 
        vidGroup.style.display = 'block'; vidInput.required = true; 
        noteGroup.style.display = 'block'; noteInput.required = true; 
    } else if(type === 'video') { 
        vidGroup.style.display = 'block'; vidInput.required = true; 
        noteGroup.style.display = 'none'; noteInput.required = false; noteInput.value = ''; 
    } else if(type === 'note') { 
        vidGroup.style.display = 'none'; vidInput.required = false; vidInput.value = ''; 
        noteGroup.style.display = 'block'; noteInput.required = true; 
    }
}

const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('dark-mode')) { 
            icon.classList.remove('fa-moon'); 
            icon.classList.add('fa-sun'); 
        } else { 
            icon.classList.remove('fa-sun'); 
            icon.classList.add('fa-moon'); 
        }
    });
}

// =====================================
// DATA LOADING LOGIC (Cascading Dropdowns)
// =====================================

// Data loading for Upload Content Dropdowns
async function loadCategoriesForUpload() {
    try {
        let progRes = await fetch(`${API_BASE_URL}/programmes`); 
        allProgrammesData = await progRes.json();
        
        let semRes = await fetch(`${API_BASE_URL}/semesters`); 
        allSemestersData = await semRes.json();
        
        let courseRes = await fetch(`${API_BASE_URL}/courses`); 
        allCoursesList = await courseRes.json();
        
        const progSelect = document.getElementById('contentProg');
        progSelect.innerHTML = '<option value="">Select Programme...</option>';
        allProgrammesData.forEach(p => { 
            progSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`; 
        });
    } catch (error) { 
        console.error("API Error:", error); 
    }
}

function filterSemestersForUpload(progId) {
    const semSelect = document.getElementById('contentSem');
    const courseSelect = document.getElementById('contentCourse');
    
    semSelect.innerHTML = '<option value="">Select Semester...</option>';
    courseSelect.innerHTML = '<option value="">Select Semester First...</option>'; // Reset courses
    
    if (progId) {
        let filteredSems = allSemestersData.filter(s => s.programme_id == progId);
        filteredSems.forEach(s => { 
            semSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`; 
        });
    }
}

function filterCoursesForUpload(semId) {
    const courseSelect = document.getElementById('contentCourse');
    courseSelect.innerHTML = '<option value="">Select Course...</option>';
    
    if (semId) {
        let filteredCourses = allCoursesList.filter(c => c.semester_id == semId);
        filteredCourses.forEach(c => { 
            courseSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`; 
        });
    }
}