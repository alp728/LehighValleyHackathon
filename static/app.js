let accessToken = null;

// Initialize FullCalendar and event modal logic
document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: function(fetchInfo, successCallback, failureCallback) {
            if (!accessToken) {
                return failureCallback("User not authenticated.");
            }
            fetch('/calendar/events', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            .then(response => response.json())
            .then(data => {
                successCallback(data);
            })
            .catch(error => failureCallback(error));
        },
        eventClick: function(info) {
            // Open modal and populate event details
            document.getElementById('modal-event-title').textContent = info.event.title;
            document.getElementById('modal-event-details').textContent = `
                Start: ${info.event.start}
                End: ${info.event.end}
                Location: ${info.event.extendedProps.location}
                Description: ${info.event.extendedProps.description}
            `;
            document.getElementById('event-modal').classList.remove('hidden');
            document.getElementById('upload-assignment-button').onclick = function() {
                uploadAssignment(info.event.id);
            }
        }
    });
    calendar.render();

    // Calendar upload
    document.getElementById('upload-button').addEventListener('click', function() {
        var fileInput = document.getElementById('calendar-upload').files[0];
        if (fileInput) {
            uploadCalendar(fileInput);
        }
    });

    // Close event modal
    document.getElementById('close-modal').addEventListener('click', function() {
        document.getElementById('event-modal').classList.add('hidden');
    });

    // Authentication handlers
    document.getElementById('login-button').addEventListener('click', login);
    document.getElementById('logout-button').addEventListener('click', logout);

    // Check if user is authenticated on page load
    if (localStorage.getItem('accessToken')) {
        accessToken = localStorage.getItem('accessToken');
        document.getElementById('login-button').classList.add('hidden');
        document.getElementById('logout-button').classList.remove('hidden');
    }
});

// Upload calendar to server
function uploadCalendar(file) {
    if (!accessToken) {
        alert("Please log in first.");
        return;
    }

    var formData = new FormData();
    formData.append("file", file);

    fetch('/upload/calendar', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert("Calendar uploaded successfully");
        location.reload();
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Failed to upload calendar.");
    });
}

// Upload assignment for event
function uploadAssignment(eventId) {
    var fileInput = document.getElementById('assignment-upload').files[0];
    if (!fileInput) {
        alert("Please select an assignment to upload.");
        return;
    }

    var formData = new FormData();
    formData.append("file", fileInput);

    fetch(`/upload/assignment/${eventId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert("Assignment uploaded successfully");
        document.getElementById('event-modal').classList.add('hidden');
        location.reload();
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Failed to upload assignment.");
    });
}

// Login user and retrieve access token
function login() {
    const email = prompt("Email:");
    const password = prompt("Password:");

    fetch('/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.access_token) {
            accessToken = data.access_token;
            localStorage.setItem('accessToken', accessToken);
            document.getElementById('login-button').classList.add('hidden');
            document.getElementById('logout-button').classList.remove('hidden');
            location.reload();
        } else {
            alert("Login failed.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Login failed.");
    });
}

// Logout user
function logout() {
    accessToken = null;
    localStorage.removeItem('accessToken');
    document.getElementById('login-button').classList.remove('hidden');
    document.getElementById('logout-button').classList.add('hidden');
    location.reload();
}
