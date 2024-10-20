let accessToken = null;

// Initialize FullCalendar and event modal logic
document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
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
                // Map your response format to FullCalendar's expected format
                const events = data.map(event => ({
                    id: event.id,
                    title: event.event_name,       // FullCalendar expects 'title'
                    start: event.start_time,       // FullCalendar expects 'start'
                    end: event.end_time || null,   // FullCalendar expects 'end', make it optional if not provided
                    location: event.location,      // Add extendedProps if you have more fields
                    description: event.description
                }));
                successCallback(events);  // Pass the transformed events to FullCalendar
            })
            .catch(error => failureCallback(error));
        },


        
        eventClick: function(info) {
            // Populate event details in the modal
            document.getElementById('modal-event-title').textContent = info.event.title;
            document.getElementById('modal-event-start').textContent = info.event.start.toISOString();
            document.getElementById('modal-event-end').textContent = info.event.end ? info.event.end.toISOString() : 'N/A';
            document.getElementById('modal-event-location').textContent = info.event.extendedProps.location || 'Not specified';
            document.getElementById('modal-event-description').textContent = info.event.extendedProps.description || 'No description available';
            
            // Show the modal
            document.getElementById('event-modal').classList.remove('hidden');
            
            // Set up the upload assignment button handler
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

    document.querySelector('.fc-today-button').addEventListener('click', function() {
        calendar.today();
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

console.log(FullCalendar.version);


module.exports = {
    theme: {
      extend: {
        colors: {
          'blue-shade': '#7c97c8',
          'object-blue': '#8ba9e',
          'panel': '#ffffff',
          'panel-shade': '#e4e4e4',
          'backing': '#f7f7f7',
        },
      },
    },
    plugins: [],
  }