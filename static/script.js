// Get the button element
const recommendBtn = document.querySelector('.recommendBtn button');

// Array of different aesthetics
const aesthetics = [
  { bannerColor: '#f7d6e0', bannerTextColor: '#4d295a', captionColor: '#fef2bf', captionTextColor: '#735c00' },
  { bannerColor: '#b0e5a1', bannerTextColor: '#2e663f', captionColor: '#f0f0f0', captionTextColor: '#333' },
  // Add more aesthetic options here as desired
];

// Initialize the current aesthetic index
let currentAestheticIndex = 0;

// Function to handle the click event and apply the next aesthetic
function changeAesthetic() {
  // Get the banner and captionText elements
  const banner = document.querySelector('.banner');
  const captionText = document.querySelector('.captionText');

  // Get the next aesthetic from the array
  const nextAesthetic = aesthetics[currentAestheticIndex];

  // Apply the new styles
  banner.style.backgroundColor = nextAesthetic.bannerColor;
  banner.style.color = nextAesthetic.bannerTextColor;
  captionText.style.backgroundColor = nextAesthetic.captionColor;
  captionText.style.color = nextAesthetic.captionTextColor;

  // Move to the next aesthetic (circular)
  currentAestheticIndex = (currentAestheticIndex + 1) % aesthetics.length;
}

// Add a click event listener to the button
recommendBtn.addEventListener('click', changeAesthetic);

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