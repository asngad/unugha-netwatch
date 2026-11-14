async function check() {
  try {
    const res = await fetch('https://api.github.com/users/asngad/repos?per_page=100', {
      headers: { 'User-Agent': 'Node-Fetch' }
    });
    const repos = await res.json();
    console.log('Total public repos:', repos.length);
    const sorted = repos.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
    console.log(sorted.map(r => ({ name: r.name, created_at: r.created_at, html_url: r.html_url })));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
check();
