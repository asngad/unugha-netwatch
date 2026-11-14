async function main() {
  const t1 = await fetch("http://localhost:3000/api/diagnostics/traceroute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target: "10.27.51.12" })
  }).then(r => r.json());
  console.log("=== Internal Traceroute Test (10.27.51.12) ===");
  console.log(t1.data.outputLines.join("\n"));

  const t2 = await fetch("http://localhost:3000/api/diagnostics/traceroute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target: "google.com" })
  }).then(r => r.json());
  console.log("\n=== External Traceroute Test (google.com) ===");
  console.log(t2.data.outputLines.join("\n"));
}
main().catch(console.error);
