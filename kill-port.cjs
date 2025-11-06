const { execSync } = require('child_process');

function killPort4000() {
  try {
    const stdout = execSync('netstat -ano | findstr :4000', { encoding: 'utf8', stdio: 'pipe' });
    
    if (stdout && stdout.trim()) {
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      
      // Extract all unique PIDs from the output
      lines.forEach(line => {
        const match = line.match(/\s+(\d+)$/);
        if (match && match[1]) {
          pids.add(match[1]);
        }
      });
      
      // Kill all processes found synchronously
      pids.forEach(pid => {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          console.log(`Killed process ${pid} on port 4000`);
        } catch (e) {
          // Process might already be dead, ignore
        }
      });
      
      // Wait a bit for the port to be released, then verify
      const start = Date.now();
      while (Date.now() - start < 1000) {
        // Wait 1 second
      }
      
      // Verify port is actually free
      try {
        execSync('netstat -ano | findstr :4000', { stdio: 'ignore' });
        // Port still in use, kill again
        setTimeout(() => killPort4000(), 500);
      } catch (e) {
        // Port is free, good!
      }
    }
  } catch (e) {
    // No process found on port 4000, that's fine
  }
}

killPort4000();

// Give it a moment before exiting to ensure port is fully released
setTimeout(() => process.exit(0), 1500);

