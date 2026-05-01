async function test() {
  try {
    const loginRes = await fetch("https://taskflow-production-c28b.up.railway.app/api/auth/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'Admin@123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;

    const projRes = await fetch("https://taskflow-production-c28b.up.railway.app/api/projects", {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const projData = await projRes.json();
    console.log("Projects:", JSON.stringify(projData, null, 2));

    const dashRes = await fetch("https://taskflow-production-c28b.up.railway.app/api/dashboard", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dashData = await dashRes.json();
      console.log("Dashboard:", JSON.stringify(dashData, null, 2));

  } catch (e) {
    console.error("Error:", e);
  }
}

test();
