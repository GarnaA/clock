let dragging = false;
let clockInterval;
let selectedTimeZone = 'UTC';
let lastTime = { hours: 0, minutes: 0, seconds: 0 };

const hourHand = document.querySelector('#hour');
const minuteHand = document.querySelector('#minute');
const secondHand = document.querySelector('#second');

const timeZones = [
  'UTC',
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo',
  'Australia/Sydney'
];

function setRotation(el, rotation) {
  if (el) {
    el.style.transform = `rotate(${rotation * 360}deg)`;
  }
}

function setRotationAngle(hand, event) {
  const svg = document.querySelector('svg');
  const centerX = svg.getBoundingClientRect().left + svg.clientWidth / 2;
  const centerY = svg.getBoundingClientRect().top + svg.clientHeight / 2;

  let angle = 90 + Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
  if (angle < 0) {
    angle += 360;
  }

  hand.style.transform = `rotate(${angle}deg)`;
}

function getAngle(el) {
  const svg = document.querySelector('svg');
  const centerX = svg.getBoundingClientRect().left + svg.clientWidth / 2;
  const centerY = svg.getBoundingClientRect().top + svg.clientHeight / 2;
  
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  
  let angle = 90 + (Math.atan2(y - centerY, x - centerX) * 180) / Math.PI;
  if (angle < 0){
    angle += 360;
  }
  return angle;
}

function setTimeBasedOnHandPositions() {
  const hourAngle = getAngle(hourHand);
  const minuteAngle = getAngle(minuteHand);
  const secondAngle = getAngle(secondHand);
  
  const hours = Math.floor(hourAngle / 30) % 12;
  const minutes = Math.floor(minuteAngle / 6);
  const seconds = Math.floor(secondAngle / 6);
  
  lastTime.hours = hours;
  lastTime.minutes = minutes;
  lastTime.seconds = seconds;;
}

function updateClock() {
  if (!dragging) {
    const currDate = new Date();
    const utcDate = new Date(currDate.toLocaleString('en-US', { timeZone: 'UTC' }));
    const timeZoneDate = new Date(utcDate.toLocaleString('en-US', { timeZone: selectedTimeZone }));

    lastTime.seconds = timeZoneDate.getSeconds();
    lastTime.minutes = timeZoneDate.getMinutes();
    lastTime.hours = timeZoneDate.getHours() % 12;

    const seconds = lastTime.seconds / 60;
    const minutes = (lastTime.minutes + seconds) / 60;
    const hours = (lastTime.hours + minutes) / 12;

    setRotation(secondHand, seconds);
    setRotation(minuteHand, minutes);
    setRotation(hourHand, hours);
  }
}

function initializeTime() {
  const currDate = new Date();
  const utcDate = new Date(currDate.toLocaleString('en-US', { timeZone: 'UTC' }));
  const timeZoneDate = new Date(utcDate.toLocaleString('en-US', { timeZone: selectedTimeZone }));

  lastTime.seconds = timeZoneDate.getSeconds();
  lastTime.minutes = timeZoneDate.getMinutes();
  lastTime.hours = timeZoneDate.getHours() % 12;

  updateClock();
}

function addTimeZoneSelector() {
  const mainDiv = document.querySelector('.main');
  const selectorDiv = document.createElement('div');

  const label = document.createElement('label');
  label.innerText = 'Select Time Zone: ';
  selectorDiv.appendChild(label);

  const select = document.createElement('select');
  select.addEventListener('change', (event) => {
    selectedTimeZone = event.target.value;
    initializeTime();
  });

  timeZones.forEach(timeZone => {
    const option = document.createElement('option');
    option.value = timeZone;
    option.innerText = timeZone;
    select.appendChild(option);
  });

  selectorDiv.appendChild(select);
  mainDiv.insertBefore(selectorDiv, mainDiv.firstChild);
}

function startDragging() {
  dragging = true;
  this.classList.add('dragging');
  clearInterval(clockInterval);
}

function handleDragging(event) {
  if (dragging) {
    const draggingHand = document.querySelector('.dragging');
    if (draggingHand) {
      setRotationAngle(draggingHand, event);
    }
  }
}

function stopDragging() {
  dragging = false;
  document.querySelectorAll('.dragging').forEach(hand => hand.classList.remove('dragging'));
  setTimeBasedOnHandPositions();
  clockInterval = setInterval(updateClock, 1000);
}

function startClock() {
  addTimeZoneSelector();
  initializeTime();

  [hourHand, minuteHand, secondHand].forEach(hand => {
    hand.addEventListener('mousedown', startDragging);
  });

  document.addEventListener('mousemove', handleDragging);
  document.addEventListener('mouseup', stopDragging);

  clockInterval = setInterval(updateClock, 1000);
}
startClock();