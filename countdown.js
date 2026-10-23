const countdownElement = document.getElementById('halloweenCountdown');
const countdownValue = document.getElementById('countdownValue');

// November 10 at 11:59 PM Eastern is November 11 at 04:59 UTC (EST).
const halloweenEventTime = Date.UTC(2026, 10, 11, 5, 0, 0);

function updateHalloweenCountdown() {
  const remainingMilliseconds = halloweenEventTime - Date.now();

  if (remainingMilliseconds <= 0) {
    countdownElement.classList.add('isLive');
    countdownValue.textContent = 'EVENT ENDED';
    return false;
  }

  const totalSeconds = Math.floor(remainingMilliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countdownValue.textContent =
    `${days}d ${String(hours).padStart(2, '0')}h ` +
    `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  return true;
}

if (countdownElement && countdownValue) {
  updateHalloweenCountdown();
  const countdownInterval = window.setInterval(() => {
    if (!updateHalloweenCountdown()) {
      window.clearInterval(countdownInterval);
    }
  }, 1000);
}
