let intervalId = null;
const preparationThreshold = 10; // in minutes

/*=================================
          For Real Time
==================================*/
function padTimeString(i) {
    return i < 10 ? '0' + i : i;
}

function startTime() {
    const currentTime = new Date();
    const d = padTimeString(currentTime.getDate());
    const y = padTimeString(currentTime.getFullYear());
    const m = padTimeString(currentTime.getMonth() + 1);
    const h = padTimeString(currentTime.getHours());
    const min = padTimeString(currentTime.getMinutes());
    const s = padTimeString(currentTime.getSeconds());

    const formattedDateTime =
        y + '/' + m + '/' + d + ' | ' + h + ':' + min + ':' + s;

    document.getElementById('header_time').innerHTML = formattedDateTime;
}

/*=================================
    Cta according to Week Days
==================================*/
const weekDayLocale = new Date();
const currentDay = weekDayLocale.toLocaleString('en-us', { weekday: 'long' });
const weekDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

document.getElementById('header_day').innerHTML = currentDay;

/*=================================
         Effect over Time
==================================*/
function getCurrentTime() {
    const dayTime = new Date();
    const currentTime = dayTime.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
    });
    return currentTime;
}

/*=================================
         Time convert to Num
==================================*/
function timeStringToFloat(time) {
    const [h, m] = time.split(':');
    const hours = parseInt(h, 10);
    const minutes = m ? parseInt(m, 10) : 0;
    return hours * 60 + minutes;
}

function refreshStatus() {
    const weekDay = document.getElementById(currentDay);
    if (!weekDay) {
        console.log("Stopping refresh timer. It's probably Sunday. ⛱️");
        clearInterval(intervalId);
        return;
    }

    const courses = weekDay.querySelectorAll('.main_column-card');
    const convertedCurrentTime = timeStringToFloat(getCurrentTime());

    for (const course of courses) {
        const startTime = course.querySelector(
            '.main_column-card--time--start'
        ).textContent;

        const endTime = course.querySelector(
            '.main_column-card--time--end'
        ).textContent;

        const convertedStartTime = timeStringToFloat(startTime);
        const convertedEndTime = timeStringToFloat(endTime);

        const isAboutToStart =
            Math.abs(convertedStartTime - convertedCurrentTime) <=
                preparationThreshold &&
            convertedCurrentTime < convertedStartTime;

        const isAboutToEnd =
            Math.abs(convertedCurrentTime - convertedEndTime) <=
                preparationThreshold && convertedCurrentTime < convertedEndTime;

        const isRunningCurrently =
            convertedStartTime <= convertedCurrentTime &&
            convertedEndTime > convertedCurrentTime;

        if (isAboutToStart) {
            course.classList.remove('main_column-card--default');
            course.classList.remove('main_column-card--active');
            course.classList.remove('main_column-card--end');
            course.classList.add('main_column-card--preparation');
        } else if (isAboutToEnd) {
            course.classList.remove('main_column-card--preparation');
            course.classList.remove('main_column-card--active');
            course.classList.remove('main_column-card--default');
            course.classList.add('main_column-card--end');
        } else if (isRunningCurrently) {
            course.classList.remove('main_column-card--preparation');
            course.classList.remove('main_column-card--default');
            course.classList.remove('main_column-card--end');
            course.classList.add('main_column-card--active');
        } else {
            course.classList.remove('main_column-card--preparation');
            course.classList.remove('main_column-card--active');
            course.classList.remove('main_column-card--end');
            course.classList.add('main_column-card--default');
        }
    }
}

/*=================================
Fetches Schedule Data from JSON file
==================================*/
function fetchCourseSchedule() {
    return fetch('./data/schedule.json').then((response) => response.json());
}

/*=================================
 Generates and Fills Markup All Week Days
==================================*/
function fillMarkup(schedule) {
    const scheduleContainer = document.getElementById('scheduleContainer');
    const scheduleMarkup = schedule.map(getColumnMarkup).join('');
    scheduleContainer.insertAdjacentHTML('afterbegin', scheduleMarkup);
    return Promise.resolve();
}

/*=================================
 Generates Markup for Single Week Day
==================================*/
function getColumnMarkup(daySchedule, index) {
    const weekDay = weekDays[index];
    if (weekDays[index] === 'Monday') {
        return `
        <div id="Monday" class="active main_column carousel-item mt-5">
            <div class="d-flex flex-wrap justify-content-center align-items-center">
                ${daySchedule.map(getRowMarkup).join('')} 
            </div>
        </div>
        `;
    } else {
        return `
        <div id="${weekDay}" class="main_column carousel-item mt-7">
            <div class="d-flex flex-row flex-wrap justify-content-center align-items-center">
                ${daySchedule.map(getRowMarkup).join('')} 
            </div>
        </div>
    `;
    }

    
}

/*=================================
 Generates Markup for Single Course Item
==================================*/
function getRowMarkup(scheduleItem) {
    const { group, room, startsAt, endsAt } = scheduleItem;
    return `
        <ul class="main_column-card d-flex col-lg-3 col-md-3 col-sm-12 justify-content-center flex-column mx-2 mt-2 p-2 ml-2 main_column-card--default">
            <li><strong>Group:</strong>${group}</li>
            <li><strong>Room:</strong>${room}</li>
            <li class="main_column-card--time">
                <strong>Time:</strong>
                <span class="main_column-card--time--start">${startsAt}</span>
                -
                <span class="main_column-card--time--end">${endsAt}</span>
            </li>
        </ul>
    `;
}

/*=================================
          Application Entry Point
==================================*/
window.onload = () => {
    fetchCourseSchedule()
        .then(fillMarkup)
        .then(() => {
            intervalId = setInterval(refreshStatus, 1000);
            setInterval(startTime);
        });
};
