document.addEventListener('DOMContentLoaded', function() {
    // Simulating user login state
    let isLoggedIn = false; // Change to true if the user is already signed in

    const calendarContainer = document.getElementById('calendar-container');
    const loginContainer = document.getElementById('login-container');
    const loginBtn = document.getElementById('login-btn');

    if (isLoggedIn) {
        loginContainer.classList.add('hidden');
        calendarContainer.classList.remove('hidden');

        // Initialize FullCalendar
        var calendarEl = document.getElementById('calendar');
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth'
        });
        calendar.render();
    } else {
        loginContainer.classList.remove('hidden');
        calendarContainer.classList.add('hidden');
    }

    // Handle login
    loginBtn.addEventListener('click', function() {
        isLoggedIn = true;
        loginContainer.classList.add('hidden');
        calendarContainer.classList.remove('hidden');

        // Initialize FullCalendar after login
        var calendarEl = document.getElementById('calendar');
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth'
        });
        calendar.render();
    });
});