let editingProgId = null;
let editingSemId = null;
let editingCourseId = null;

// =====================================
// 1. ADD / EDIT UNIFIED CONTENT (Videos & Notes)
// =====================================
document.getElementById('addContentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('contentType').value;

    // 'semester' ഡാറ്റാബേസ് പേലോഡിൽ നിന്നും മാറ്റി, course_id മാത്രം മതിയാകും.
    const basePayload = {
        course_id: document.getElementById('contentCourse').value,
        block: document.getElementById('contentBlock').value,
        unit: document.getElementById('contentUnit').value,
        title: document.getElementById('contentTitle').value,
        description: document.getElementById('contentDesc').value
    };

    try {
        if (editingMode === 'video') {
            const payload = { ...basePayload, youtube_id: document.getElementById('videoLink').value };
            await fetch(`${API_BASE_URL}/videos/${editingId}`, { 
                method: 'PUT', 
                headers: {'Content-Type':'application/json'}, 
                body: JSON.stringify(payload) 
            });
            alert("Video Successfully Updated!");
        } else if (editingMode === 'note') {
            const payload = { ...basePayload, pdf_link: document.getElementById('noteLink').value };
            await fetch(`${API_BASE_URL}/notes/${editingId}`, { 
                method: 'PUT', 
                headers: {'Content-Type':'application/json'}, 
                body: JSON.stringify(payload) 
            });
            alert("PDF Note Successfully Updated!");
        } else {
            let promises = [];
            if (type === 'video' || type === 'both') {
                const vidPayload = { ...basePayload, youtube_id: document.getElementById('videoLink').value };
                promises.push(fetch(`${API_BASE_URL}/videos`, { 
                    method: 'POST', 
                    headers: {'Content-Type':'application/json'}, 
                    body: JSON.stringify(vidPayload) 
                }));
            }
            if (type === 'note' || type === 'both') {
                const notePayload = { ...basePayload, pdf_link: document.getElementById('noteLink').value };
                promises.push(fetch(`${API_BASE_URL}/notes`, { 
                    method: 'POST', 
                    headers: {'Content-Type':'application/json'}, 
                    body: JSON.stringify(notePayload) 
                }));
            }
            await Promise.all(promises);
            alert("Content Successfully Uploaded!");
        }
        cancelEdit(); 
    } catch (error) { 
        alert("Error connecting to server!"); 
    }
});

// =====================================
// 2. CATEGORIES: Add / Edit Programme
// =====================================
document.getElementById('addProgForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const progName = document.getElementById('newProgName').value;
    const method = editingProgId ? 'PUT' : 'POST';
    const url = editingProgId ? `${API_BASE_URL}/programmes/${editingProgId}` : `${API_BASE_URL}/programmes`;

    try {
        const response = await fetch(url, { 
            method: method, 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ name: progName }) 
        });
        if (response.ok) {
            cancelProgEdit(); 
            closeModal('progModal');
            
            if (typeof loadCategoriesForUpload === 'function') loadCategoriesForUpload(); 
            if (typeof loadCategoryLists === 'function') loadCategoryLists(); 
        } else { 
            alert("Failed to save Programme."); 
        }
    } catch (error) { 
        alert("Error connecting to server!"); 
    }
});

// =====================================
// 3. CATEGORIES: Add / Edit Semester (NEW)
// =====================================
document.getElementById('addSemForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const semName = document.getElementById('newSemName').value;
    const progId = document.getElementById('newSemProg').value;
    const method = editingSemId ? 'PUT' : 'POST';
    const url = editingSemId ? `${API_BASE_URL}/semesters/${editingSemId}` : `${API_BASE_URL}/semesters`;

    try {
        const response = await fetch(url, { 
            method: method, 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ name: semName, programme_id: progId }) 
        });
        if (response.ok) {
            cancelSemEdit(); 
            closeModal('semModal');
            
            if (typeof loadCategoriesForUpload === 'function') loadCategoriesForUpload();
            if (typeof loadCategoryLists === 'function') loadCategoryLists(); 
            
            // Auto refresh current Programme View
            const currentProgTitle = document.getElementById('category-breadcrumbs').innerText;
            const progTitleExtracted = currentProgTitle.split('>')[1] ? currentProgTitle.split('>')[1].trim() : 'Programme';
            if (typeof openProgramme === 'function' && progId) { 
                openProgramme(progId, progTitleExtracted); 
            }
        } else { 
            alert("Failed to save Semester."); 
        }
    } catch (error) { 
        alert("Error connecting to server!"); 
    }
});

// =====================================
// 4. CATEGORIES: Add / Edit Course
// =====================================
document.getElementById('addCourseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const semId = document.getElementById('newCourseSem').value;
    const courseName = document.getElementById('newCourseName').value;
    const method = editingCourseId ? 'PUT' : 'POST';
    const url = editingCourseId ? `${API_BASE_URL}/courses/${editingCourseId}` : `${API_BASE_URL}/courses`;

    try {
        const response = await fetch(url, { 
            method: method, 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ name: courseName, semester_id: semId }) 
        });
        if (response.ok) {
            cancelCourseEdit(); 
            closeModal('courseModal');
            
            if (typeof loadCategoriesForUpload === 'function') loadCategoriesForUpload();
            if (typeof loadCategoryLists === 'function') loadCategoryLists(); 
            
            if (currentCourseViewData && typeof openSemester === 'function') {
                openSemester(currentCourseViewData.progId, semId, currentCourseViewData.semName, currentCourseViewData.progName);
            }
        } else { 
            alert("Failed to save Course."); 
        }
    } catch (error) { 
        alert("Error connecting to server!"); 
    }
});

// =====================================
// 5. CANCEL EDIT FUNCTIONS
// =====================================
function cancelProgEdit() { 
    editingProgId = null; 
    document.getElementById('addProgForm').reset(); 
    document.getElementById('progSubmitBtn').innerHTML = '<i class="fa-solid fa-check"></i> Save'; 
}

function cancelSemEdit() { 
    editingSemId = null; 
    document.getElementById('addSemForm').reset(); 
    document.getElementById('semSubmitBtn').innerHTML = '<i class="fa-solid fa-check"></i> Save'; 
}

function cancelCourseEdit() { 
    editingCourseId = null; 
    document.getElementById('addCourseForm').reset(); 
    document.getElementById('courseSubmitBtn').innerHTML = '<i class="fa-solid fa-check"></i> Save'; 
}