fetch('http://127.0.0.1:3000/api/devices')
  .then(r => r.json())
  .then(res => {
    console.log('Total Devices in System:', res.data.length);
    res.data.forEach((d, i) => {
      console.log(`${(i+1).toString().padStart(2, ' ')}. ${d.name.padEnd(42, ' ')} | IP: ${d.displayIp.padEnd(25, ' ')} | Status: ${d.status}`);
    });
  });
