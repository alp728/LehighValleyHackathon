const myHeading = document.querySelector("h1");
myHeading.textContent = "LU Organizer Website";


document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',  // Month view
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [
            {
                title: 'Meeting',
                start: '2024-10-20T10:30:00',
                end: '2024-10-20T12:30:00',
                description: 'Team Meeting'
            },
            {
                title: 'Lunch Break',
                start: '2024-10-22T13:00:00',
                end: '2024-10-22T14:00:00'
            },
            {
                title: 'Conference',
                start: '2024-10-25',
                end: '2024-10-27'
            }
        ],
        eventClick: function(info) {
            alert('Event: ' + info.event.title + '\nDescription: ' + info.event.extendedProps.description);
        },
        selectable: true,
        dateClick: function(info) {
            var eventTitle = prompt('Enter Event Title:');
            if (eventTitle) {
                calendar.addEvent({
                    title: eventTitle,
                    start: info.dateStr,
                    allDay: true
                });
            }
        }
    });
    calendar.render();
});
