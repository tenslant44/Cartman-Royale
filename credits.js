const panel = document.getElementById('creditsPanel');
const openButton = document.getElementById('creditsOpen');
const closeButton = document.getElementById('creditsClose');

function closeCredits() {
  panel.hidden = true;
  panel.setAttribute('aria-hidden', 'true');
  document.getElementById('modeSelect').inert = false;
  openButton.focus();
}

openButton.addEventListener('click', () => {
  panel.hidden = false;
  panel.setAttribute('aria-hidden', 'false');
  document.getElementById('modeSelect').inert = true;
  closeButton.focus();
});

closeButton.addEventListener('click', closeCredits);
panel.addEventListener('click', (event) => {
  if (event.target === panel) closeCredits();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !panel.hidden) closeCredits();
});
