// =====================================
// 1. DRILL-DOWN CATEGORIES LOGIC
// =====================================
let allProgList = [];
let allSemData = [];
let allCourseData = [];
let currentCourseViewData = null; // എവിടെയാണ് നിൽക്കുന്നത് എന്ന് ഓർക്കാൻ

function showView(viewId) {
    document.querySelectorAll('.category-view').forEach(el => el.style.display = 'none');
    document.getElementById(viewId).style.display = 'block';
}

// ----------------------------------------------------
// LEVEL 1: Programmes View
// ----------------------------------------------------
async function loadCategoryLists() {
    try {
        const pRes = await fetch(`${API_BASE_URL}/programmes`); allProgList = await pRes.json();
        const sRes = await fetch(`${API_BASE_URL}/semesters`); allSemData = await sRes.json();
        const cRes = await fetch(`${API_BASE_URL}/courses`); allCourseData = await cRes.json();
        
        const progGrid = document.getElementById('programmes-grid');
        progGrid.innerHTML = '';
        
        if (allProgList.length === 0) { 
            progGrid.innerHTML = '<p style="grid-column: 1/-1; color: var(--text-muted);">No programmes added yet.</p>'; 
        }

        allProgList.forEach(p => {
            progGrid.innerHTML += `
                <div class="click-card" onclick="openProgramme(${p.id}, '${p.name.replace(/'/g, "\\'")}')">
                    <!-- 3-Dot Menu -->
                    <div class="options-btn" onclick="toggleDropdown(event, 'drop-prog-${p.id}')">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </div>
                    <div class="dropdown-menu" id="drop-prog-${p.id}">
                        <button onclick="event.stopPropagation(); setupEditProg(${p.id}, '${p.name.replace(/'/g, "\\'")}')"><i class="fa-solid fa-pen"></i> Edit / Rename</button>
                        <button class="del-btn" onclick="event.stopPropagation(); deleteCategory('programmes', ${p.id})"><i class="fa-solid fa-trash"></i> Delete</button>
                    </div>
                    
                    <i class="fa-solid fa-graduation-cap main-icon"></i>
                    <h4>${p.name}</h4>
                    <p>Click to view Semesters</p>
                </div>`;
        });
        
        document.getElementById('category-breadcrumbs').innerHTML = `<span onclick="loadCategoryLists()"><i class="fa-solid fa-house"></i> Programmes</span>`;
        showView('programmes-view');

    } catch (e) { 
        console.error("Error loading categories:", e); 
    }
}

// ----------------------------------------------------
// LEVEL 2: Semesters View
// ----------------------------------------------------
function openProgramme(progId, progName) {
    showView('semesters-view');
    document.getElementById('current-prog-title').innerText = progName + " - Semesters";
    document.getElementById('newSemProg').value = progId; // Add Semester Modal-ന് വേണ്ടി
    
    document.getElementById('category-breadcrumbs').innerHTML = `
        <span onclick="loadCategoryLists()"><i class="fa-solid fa-house"></i> Programmes</span> > 
        <span onclick="openProgramme(${progId}, '${progName.replace(/'/g, "\\'")}')">${progName}</span>
    `;
    
    const semGrid = document.getElementById('semesters-grid');
    semGrid.innerHTML = '';
    
    const progSems = allSemData.filter(s => s.programme_id == progId);
    
    if (progSems.length === 0) {
        semGrid.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted); text-align:center;">No semesters added yet. Click 'Add Semester' to create one.</p>`;
    } else {
        progSems.forEach(s => {
            semGrid.innerHTML += `
                <div class="click-card" onclick="openSemester(${progId}, ${s.id}, '${s.name.replace(/'/g, "\\'")}', '${progName.replace(/'/g, "\\'")}')">
                    <!-- 3-Dot Menu -->
                    <div class="options-btn" onclick="toggleDropdown(event, 'drop-sem-${s.id}')">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </div>
                    <div class="dropdown-menu" id="drop-sem-${s.id}">
                        <button onclick="event.stopPropagation(); setupEditSem(${s.id}, ${progId}, '${s.name.replace(/'/g, "\\'")}')"><i class="fa-solid fa-pen"></i> Edit / Rename</button>
                        <button class="del-btn" onclick="event.stopPropagation(); deleteCategory('semesters', ${s.id})"><i class="fa-solid fa-trash"></i> Delete</button>
                    </div>
                    
                    <i class="fa-solid fa-layer-group main-icon"></i>
                    <h4>${s.name}</h4>
                    <p>Click to view courses</p>
                </div>`;
        });
    }
}

// ----------------------------------------------------
// LEVEL 3: Courses View
// ----------------------------------------------------
function openSemester(progId, semId, semName, progName) {
    showView('courses-view');
    document.getElementById('current-sem-title').innerText = `${semName} Courses`;
    document.getElementById('newCourseSem').value = semId; // Add Course Modal-ന് വേണ്ടി

    document.getElementById('category-breadcrumbs').innerHTML = `
        <span onclick="loadCategoryLists()"><i class="fa-solid fa-house"></i> Programmes</span> > 
        <span onclick="openProgramme(${progId}, '${progName.replace(/'/g, "\\'")}')">${progName}</span> > 
        <span onclick="openSemester(${progId}, ${semId}, '${semName.replace(/'/g, "\\'")}', '${progName.replace(/'/g, "\\'")}')">${semName}</span>
    `;
    
    const courseGrid = document.getElementById('courses-grid');
    courseGrid.innerHTML = '';
    
    const semCourses = allCourseData.filter(c => c.semester_id == semId);
    
    // View refresh ചെയ്യാൻ ഈ ഡാറ്റ സൂക്ഷിക്കുന്നു
    currentCourseViewData = { progId, progName, semId, semName };

    if (semCourses.length === 0) {
        courseGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No courses found in this semester.</p>`;
    } else {
        semCourses.forEach(c => {
            courseGrid.innerHTML += `
                <div class="click-card" onclick="openCourse(${c.id}, '${c.name.replace(/'/g, "\\'")}')">
                    <!-- 3-Dot Menu -->
                    <div class="options-btn" onclick="toggleDropdown(event, 'drop-course-${c.id}')">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </div>
                    <div class="dropdown-menu" id="drop-course-${c.id}">
                        <button onclick="event.stopPropagation(); setupEditCourse(${c.id}, ${semId}, '${c.name.replace(/'/g, "\\'")}')"><i class="fa-solid fa-pen"></i> Edit / Rename</button>
                        <button class="del-btn" onclick="event.stopPropagation(); deleteCategory('courses', ${c.id})"><i class="fa-solid fa-trash"></i> Delete</button>
                    </div>

                    <i class="fa-solid fa-book-open main-icon"></i>
                    <h4>${c.name}</h4>
                    <p>Click to view contents</p>
                </div>`;
        });
    }
}

// ----------------------------------------------------
// LEVEL 4: Content View (Videos & Notes)
// ----------------------------------------------------
async function openCourse(courseId, courseName) {
    showView('course-content-view');
    document.getElementById('current-course-title').innerText = courseName;
    
    // Breadcrumb Update
    const bc = document.getElementById('category-breadcrumbs');
    const existing = bc.innerHTML.split('>').slice(0, 3).join('>'); 
    bc.innerHTML = existing + ` > <span>${courseName}</span>`;

    try {
        const vidRes = await fetch(`${API_BASE_URL}/videos`);
        const allVideos = await vidRes.json();
        const courseVideos = allVideos.filter(v => v.course_id == courseId);
        
        const vidDiv = document.getElementById('drillVideosList');
        vidDiv.innerHTML = '';
        if(courseVideos.length === 0) vidDiv.innerHTML = '<p style="color:var(--text-muted);">No video classes uploaded.</p>';
        
        courseVideos.forEach(v => {
            vidDiv.innerHTML += `
                <div class="manage-list-item">
                    <div class="manage-list-info"><h4>${v.title}</h4><p>Block: ${v.block}</p></div>
                    <div class="manage-actions">
                        <button class="action-sm copy-btn" onclick="copyItemLink('video', ${v.id})"><i class="fa-solid fa-link"></i></button>
                        <button class="action-sm edit-btn" onclick="setupEditVideo(${v.id}, ${v.course_id}, '${v.block}', '${v.unit}', '${v.title.replace(/'/g, "\\'")}', '${v.youtube_id}', '${v.description.replace(/'/g, "\\'")}')">Edit</button>
                        <button class="action-sm delete-btn" onclick="deleteItem('videos', ${v.id}, ${courseId}, '${courseName.replace(/'/g, "\\'")}')">Del</button>
                    </div>
                </div>`;
        });

        const noteRes = await fetch(`${API_BASE_URL}/notes`);
        const allNotes = await noteRes.json();
        const courseNotes = allNotes.filter(n => n.course_id == courseId);

        const noteDiv = document.getElementById('drillNotesList');
        noteDiv.innerHTML = '';
        if(courseNotes.length === 0) noteDiv.innerHTML = '<p style="color:var(--text-muted);">No PDF notes uploaded.</p>';
        
        courseNotes.forEach(n => {
            noteDiv.innerHTML += `
                <div class="manage-list-item">
                    <div class="manage-list-info"><h4>${n.title}</h4><p>Block: ${n.block}</p></div>
                    <div class="manage-actions">
                        <button class="action-sm copy-btn" onclick="copyItemLink('note', ${n.id})"><i class="fa-solid fa-link"></i></button>
                        <button class="action-sm edit-btn" onclick="setupEditNote(${n.id}, ${n.course_id}, '${n.block}', '${n.unit}', '${n.title.replace(/'/g, "\\'")}', '${n.pdf_link}', '${n.description.replace(/'/g, "\\'")}')">Edit</button>
                        <button class="action-sm delete-btn" onclick="deleteItem('notes', ${n.id}, ${courseId}, '${courseName.replace(/'/g, "\\'")}')">Del</button>
                    </div>
                </div>`;
        });
    } catch (error) { 
        console.error("Error loading course content:", error); 
    }
}

// =====================================
// 2. UTILITIES: EDIT & DELETE CATEGORIES
// =====================================

function setupEditProg(id, name) {
    editingProgId = id; 
    document.getElementById('newProgName').value = name;
    document.getElementById('progSubmitBtn').innerHTML = '<i class="fa-solid fa-pen"></i> Update';
    openModal('progModal');
}

function setupEditSem(id, progId, name) {
    editingSemId = id; 
    document.getElementById('newSemProg').value = progId; 
    document.getElementById('newSemName').value = name;
    document.getElementById('semSubmitBtn').innerHTML = '<i class="fa-solid fa-pen"></i> Update';
    openModal('semModal');
}

function setupEditCourse(id, semId, name) {
    editingCourseId = id; 
    document.getElementById('newCourseSem').value = semId; 
    document.getElementById('newCourseName').value = name;
    document.getElementById('courseSubmitBtn').innerHTML = '<i class="fa-solid fa-pen"></i> Update';
    openModal('courseModal');
}

async function deleteCategory(type, id) {
    if(confirm(`Are you sure you want to delete this?`)) {
        try {
            const response = await fetch(`${API_BASE_URL}/${type}/${id}`, { method: 'DELETE' });
            if(response.ok) {
                // ഡിലീറ്റ് ചെയ്ത ശേഷം ലിസ്റ്റ് റീഫ്രഷ് ചെയ്യുന്നു
                loadCategoryLists(); 
                if (typeof loadCategoriesForUpload === 'function') loadCategoriesForUpload(); 
            } else {
                const data = await response.json(); 
                alert(data.error || "Failed to delete. Ensure all internal contents are deleted first.");
            }
        } catch(error) { 
            alert("Failed to delete."); 
        }
    }
}

// =====================================
// 3. UTILITIES: VIDEOS & NOTES
// =====================================

function copyItemLink(type, id) {
    const baseUrl = window.location.origin + window.location.pathname.replace('admin.html', '');
    const param = type === 'note' ? 'note_id' : 'video_id';
    navigator.clipboard.writeText(baseUrl + 'index.html?' + param + '=' + id).then(() => alert("Link Copied Successfully!"));
}

async function deleteItem(type, id, courseId, courseName) {
    if(confirm(`Are you sure you want to delete this?`)) {
        try {
            const response = await fetch(`${API_BASE_URL}/${type}/${id}`, { method: 'DELETE' });
            if(response.ok) { 
                openCourse(courseId, courseName); // ഡിലീറ്റ് ചെയ്ത ശേഷം ആ കോഴ്സിലെ ഡാറ്റ മാത്രം റീഫ്രഷ് ചെയ്യുന്നു
            }
        } catch(error) { 
            alert("Failed to delete."); 
        }
    }
}

// Video എഡിറ്റ് ചെയ്യാൻ വേണ്ട ഡാറ്റാബേസ് കണക്ഷനുകൾ ഓട്ടോമാറ്റിക് ആയി ഫോമിൽ സെറ്റ് ചെയ്യുന്നു
function setupEditVideo(id, courseId, block, unit, title, link, desc) {
    switchAdminTab('content'); 
    editingMode = 'video'; 
    editingId = id; 
    document.getElementById('contentType').value = 'video'; 
    document.getElementById('contentType').disabled = true; 
    toggleFields();
    
    // ഡാറ്റാബേസിൽ നിന്നും Course -> Semester -> Programme ഐഡികൾ കണ്ടുപിടിക്കുന്നു
    const course = allCourseData.find(c => c.id == courseId);
    const semId = course ? course.semester_id : '';
    const semester = allSemData.find(s => s.id == semId);
    const progId = semester ? semester.programme_id : '';

    document.getElementById('contentProg').value = progId; 
    filterSemestersForUpload(progId);
    
    setTimeout(() => { 
        document.getElementById('contentSem').value = semId; 
        filterCoursesForUpload(semId);
        setTimeout(() => { document.getElementById('contentCourse').value = courseId; }, 100);
    }, 100);

    document.getElementById('contentBlock').value = block; 
    document.getElementById('contentUnit').value = unit;
    document.getElementById('contentTitle').value = title; 
    document.getElementById('videoLink').value = link; 
    document.getElementById('contentDesc').value = desc;
    
    document.getElementById('contentSubmitBtn').innerHTML = '<i class="fa-solid fa-pen"></i> Update Video Class';
    document.getElementById('contentCancelBtn').style.display = 'block'; 
    window.scrollTo(0,0);
}

// Note എഡിറ്റ് ചെയ്യാൻ വേണ്ട ഡാറ്റാബേസ് കണക്ഷനുകൾ ഓട്ടോമാറ്റിക് ആയി ഫോമിൽ സെറ്റ് ചെയ്യുന്നു
function setupEditNote(id, courseId, block, unit, title, link, desc) {
    switchAdminTab('content'); 
    editingMode = 'note'; 
    editingId = id; 
    document.getElementById('contentType').value = 'note'; 
    document.getElementById('contentType').disabled = true; 
    toggleFields();
    
    // ഡാറ്റാബേസിൽ നിന്നും Course -> Semester -> Programme ഐഡികൾ കണ്ടുപിടിക്കുന്നു
    const course = allCourseData.find(c => c.id == courseId);
    const semId = course ? course.semester_id : '';
    const semester = allSemData.find(s => s.id == semId);
    const progId = semester ? semester.programme_id : '';

    document.getElementById('contentProg').value = progId; 
    filterSemestersForUpload(progId);
    
    setTimeout(() => { 
        document.getElementById('contentSem').value = semId; 
        filterCoursesForUpload(semId);
        setTimeout(() => { document.getElementById('contentCourse').value = courseId; }, 100);
    }, 100);

    document.getElementById('contentBlock').value = block; 
    document.getElementById('contentUnit').value = unit;
    document.getElementById('contentTitle').value = title; 
    document.getElementById('noteLink').value = link; 
    document.getElementById('contentDesc').value = desc;
    
    document.getElementById('contentSubmitBtn').innerHTML = '<i class="fa-solid fa-pen"></i> Update PDF Note';
    document.getElementById('contentCancelBtn').style.display = 'block'; 
    window.scrollTo(0,0);
}

function cancelEdit() {
    editingMode = null; 
    editingId = null; 
    document.getElementById('contentType').disabled = false; 
    document.getElementById('contentType').value = 'both'; 
    document.getElementById('addContentForm').reset(); 
    toggleFields(); 
    
    document.getElementById('contentSem').innerHTML = '<option value="">Select Programme First...</option>';
    document.getElementById('contentCourse').innerHTML = '<option value="">Select Semester First...</option>';
    
    document.getElementById('contentSubmitBtn').innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Upload Content';
    document.getElementById('contentCancelBtn').style.display = 'none';
}