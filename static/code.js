const myHeading = document.querySelector("h1");
myHeading.textContent = "LU Organizer Website";

window.addEventListener('scroll', function () {
    const parallaxElements = document.querySelectorAll('.parallax');

    parallaxElements.forEach(function (parallaxElement) {
        let scrollPosition = window.pageYOffset;
        parallaxElement.style.backgroundPositionY = scrollPosition * 0.5 + 'px';
    });
});

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


document.getElementById('uploadButton').addEventListener('click', function() {
    const imageInput = document.getElementById('imageInput');
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
            // Display the uploaded image
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.innerHTML = '<img src="' + e.target.result + '" alt="Uploaded Image" style="max-width: 200px;">';

            // Optionally, create a new event in the calendar with the uploaded image.
            var eventTitle = prompt('Enter Event Title for the image:');
            if (eventTitle) {
                calendar.addEvent({
                    title: eventTitle,
                    start: new Date(),  // Using current date as an example, you can modify this as needed
                    description: 'Uploaded image event',
                    extendedProps: {
                        image: e.target.result // Store image data in the event
                    }
                });
            }
        };

        reader.readAsDataURL(imageInput.files[0]); // Convert image file to data URL
    }
});

document.getElementById('uploadButton').addEventListener('click', () => {
    const file = document.getElementById('imageInput').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('imagePreview').innerHTML = `<img src="${e.target.result}" style="max-width: 200px;">`;
            const eventTitle = prompt('Enter Event Title for the image:');
            if (eventTitle) calendar.addEvent({
                title: eventTitle,
                start: new Date(),
                description: 'Uploaded image event',
                extendedProps: { image: e.target.result }
            });
        };
        reader.readAsDataURL(file);
    }
});