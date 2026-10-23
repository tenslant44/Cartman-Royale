// Fetch the README at runtime. Keeping the response on window makes this an
// actual resource used by the page instead of a preload hint or dead link.
fetch('README.txt', {
  cache: 'no-store',
  headers: {
    Accept: 'text/markdown, text/plain;q=0.9, */*;q=0.8'
  }
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(`README request failed with ${response.status}`);
    }
    return response.text();
  })
  .then((readme) => {
    window.cartmanRoyaleReadme = readme;
  })
  .catch((error) => {
    console.warn('Unable to fetch project README:', error);
  });
