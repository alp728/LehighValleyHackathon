const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');
const navLogo = document.querySelector('#navbar__logo');

// Display Mobile Menu
const mobileMenu = () => {
  menu.classList.toggle('is-active');
  menuLinks.classList.toggle('active');
};

menu.addEventListener('click', mobileMenu);

// Show active menu when scrolling
const highlightMenu = () => {
  const elem = document.querySelector('.highlight');
  const homeMenu = document.querySelector('#home-page');
  const aboutMenu = document.querySelector('#about-page');
  const servicesMenu = document.querySelector('#services-page');
  let scrollPos = window.scrollY;
  // console.log(scrollPos);

  // adds 'highlight' class to my menu items
  if (window.innerWidth > 960 && scrollPos < 600) {
    homeMenu.classList.add('highlight');
    aboutMenu.classList.remove('highlight');
    return;
  } else if (window.innerWidth > 960 && scrollPos < 1400) {
    aboutMenu.classList.add('highlight');
    homeMenu.classList.remove('highlight');
    servicesMenu.classList.remove('highlight');
    return;
  } else if (window.innerWidth > 960 && scrollPos < 2345) {
    servicesMenu.classList.add('highlight');
    aboutMenu.classList.remove('highlight');
    return;
  }

  if ((elem && window.innerWIdth < 960 && scrollPos < 600) || elem) {
    elem.classList.remove('highlight');
  }
};

window.addEventListener('scroll', highlightMenu);
window.addEventListener('click', highlightMenu);

//  Close mobile Menu when clicking on a menu item
const hideMobileMenu = () => {
  const menuBars = document.querySelector('.is-active');
  if (window.innerWidth <= 768 && menuBars) {
    menu.classList.toggle('is-active');
    menuLinks.classList.remove('active');
  }
};

menuLinks.addEventListener('click', hideMobileMenu);
navLogo.addEventListener('click', hideMobileMenu);


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