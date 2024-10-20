document.addEventListener('DOMContentLoaded', function () {
    // Initialize calendar
    const calendarEl = document.getElementById('calendar');
    let calendar; // Declare calendar variable

    // Upload functionality
    document.getElementById('uploadForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const imageInput = document.getElementById('imageInput').files[0];
        if (!imageInput) {
            alert('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', imageInput);

        // Display preview
        const reader = new FileReader();
        reader.onload = function (e) {
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.innerHTML =
                '<img src="' +
                e.target.result +
                '" alt="Uploaded Image" style="max-width: 200px;">';
        };
        reader.readAsDataURL(imageInput);

        // Make API call to upload the file
        fetch('/api/upload', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // Assume the API returns an array of events extracted from the syllabus
                const events = data.events;
                events.forEach((event) => {
                    calendar.addEvent(event);
                });
                alert('File uploaded and events added to the calendar.');
                // Show the calendar
                document.getElementById('calendar-section').classList.remove('hidden');
                calendar.render();
            })
            .catch((error) => {
                console.error('Error uploading file:', error);
                alert('An error occurred while uploading the file.');
            });
    });

    // Login functionality
    let isLoggedIn = false;
    document.getElementById('login-btn').addEventListener('click', function () {
        // Implement actual authentication logic here
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username && password) {
            isLoggedIn = true;
            document.getElementById('login-container').classList.add('hidden');
            document.getElementById('home').classList.remove('hidden');
            alert('Logged in successfully.');

            // Initialize calendar after login
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth', // Month view
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                },
                events: [
                    {
                        title: 'Meeting',
                        start: '2024-10-20T10:30:00',
                        end: '2024-10-20T12:30:00',
                        description: 'Team Meeting',
                    },
                    {
                        title: 'Lunch Break',
                        start: '2024-10-22T13:00:00',
                        end: '2024-10-22T14:00:00',
                    },
                    {
                        title: 'Conference',
                        start: '2024-10-25',
                        end: '2024-10-27',
                    },
                ],
                eventClick: function (info) {
                    alert(
                        'Event: ' +
                            info.event.title +
                            '\nDescription: ' +
                            (info.event.extendedProps.description || 'No description'),
                    );
                },
                selectable: true,
                dateClick: function (info) {
                    var eventTitle = prompt('Enter Event Title:');
                    if (eventTitle) {
                        calendar.addEvent({
                            title: eventTitle,
                            start: info.dateStr,
                            allDay: true,
                        });
                    }
                },
            });
            calendar.render();
        } else {
            alert('Please enter your username and password.');
        }
    });

    // Signup functionality (placeholder)
    document.getElementById('signup-btn').addEventListener('click', function () {
        alert('Signup functionality is not implemented yet.');
    });

    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navbarMenu = document.querySelector('.navbar__menu');
    mobileMenu.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-active');
        navbarMenu.classList.toggle('active');
    });

    // Sign Out functionality
    document.getElementById('signout').addEventListener('click', function () {
        isLoggedIn = false;
        document.getElementById('login-container').classList.remove('hidden');
        document.getElementById('home').classList.add('hidden');
        document.getElementById('calendar-section').classList.add('hidden');
        if (calendar) {
            calendar.destroy();
        }
        alert('You have been signed out.');
    });
});


document.addEventListener('DOMContentLoaded', function () {
    let token = '';
    let currentUserId = null;
    let calendar;

    // Initialize calendar function
    function initializeCalendar() {
        const calendarEl = document.getElementById('calendar');
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
            },
            events: [],
            eventClick: function (info) {
                alert(
                    'Event: ' +
                        info.event.title +
                        '\nDescription: ' +
                        (info.event.extendedProps.description || 'No description'),
                );
            },
            selectable: true,
            dateClick: function (info) {
                var eventTitle = prompt('Enter Event Title:');
                if (eventTitle) {
                    // Add event to backend
                    addCalendarEvent(eventTitle, info.dateStr);
                }
            },
        });
        calendar.render();
    }

    // Login functionality
    document.getElementById('login-btn').addEventListener('click', async function () {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const response = await fetch('/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, password: password }),
        });

        const data = await response.json();
        document.getElementById('login-response').textContent = JSON.stringify(data, null, 2);
        if (data.access_token) {
            token = data.access_token;
            currentUserId = data.user_id;
            document.getElementById('login-container').classList.add('hidden');
            document.getElementById('main-content').classList.remove('hidden');
            initializeCalendar();
            fetchCalendarEvents();
        } else {
            alert('Login failed: ' + data.detail);
        }
    });

    // Sign-up functionality
    document.getElementById('signup-btn').addEventListener('click', function () {
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('register-container').classList.remove('hidden');
    });

    document.getElementById('cancel-register-btn').addEventListener('click', function () {
        document.getElementById('register-container').classList.add('hidden');
        document.getElementById('login-container').classList.remove('hidden');
    });

    document.getElementById('register-btn').addEventListener('click', async function () {
        const firstName = document.getElementById('register-firstname').value;
        const lastName = document.getElementById('register-lastname').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        const response = await fetch('/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email: email,
                password: password,
            }),
        });

        const data = await response.json();
        document.getElementById('register-response').textContent = JSON.stringify(data, null, 2);

        if (response.ok) {
            alert('Registration successful. Please log in.');
            document.getElementById('register-container').classList.add('hidden');
            document.getElementById('login-container').classList.remove('hidden');
        } else {
            alert('Registration failed: ' + data.detail);
        }
    });

    // File upload functionality
    document.getElementById('uploadForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const imageInput = document.getElementById('imageInput').files[0];
        if (!imageInput) {
            alert('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', imageInput);

        // Display preview for images
        if (imageInput.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imagePreview = document.getElementById('imagePreview');
                imagePreview.innerHTML =
                    '<img src="' +
                    e.target.result +
                    '" alt="Uploaded Image" style="max-width: 200px;">';
            };
            reader.readAsDataURL(imageInput);
        }

        // Make API call to upload the file
        const response = await fetch('/upload/calendar', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            alert('File uploaded successfully.');
            // Assume the API returns an array of events extracted from the syllabus
            const events = data.events;
            events.forEach((event) => {
                calendar.addEvent(event);
            });
        } else {
            alert('Error uploading file: ' + data.detail);
        }
    });

    // Upload Assignment PDF
    document.getElementById('upload-assignment-btn').addEventListener('click', async function () {
        const fileInput = document.getElementById('assignment-file');
        const file = fileInput.files[0];
        const eventId = document.getElementById('event-id').value;

        if (!file || !eventId) {
            alert('Please select a file and enter an Event ID.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/upload/assignment/${eventId}`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
            body: formData,
        });

        const data = await response.json();
        document.getElementById('assignment-upload-response').textContent = JSON.stringify(data, null, 2);

        if (response.ok) {
            alert('Assignment uploaded successfully.');
        } else {
            alert('Error uploading assignment: ' + data.detail);
        }
    });

    // Fetch calendar events from the backend
    async function fetchCalendarEvents() {
        const response = await fetch('/calendar/events', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
        });

        const data = await response.json();

        if (response.ok) {
            data.forEach((event) => {
                calendar.addEvent(event);
            });
        } else {
            alert('Error fetching events: ' + data.detail);
        }
    }

    // Add calendar event to backend
    async function addCalendarEvent(title, start) {
        const response = await fetch('/calendar/event', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event_name: title,
                start_time: start,
                end_time: start,
                user_id: currentUserId,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            calendar.addEvent({
                id: data.id,
                title: data.event_name,
                start: data.start_time,
                end: data.end_time,
            });
            alert('Event added successfully.');
        } else {
            alert('Error adding event: ' + data.detail);
        }
    }

    // Mobile Menu Toggle
    // (Same as before)
    // ...

    // Sign Out functionality
    // (Same as before)
    // ...
});
