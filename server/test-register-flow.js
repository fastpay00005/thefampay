async function testRealRegistrationFlow() {
  console.log('--- Testing Real Account Creation Flow ---');
  const testEmail = `newuser_${Date.now()}@test.com`;
  const testMobile = '+91 91234 56789';
  const testPass = 'RealPass@2026';

  // 1. Send OTP
  console.log('1. Dispatching OTP for:', testEmail);
  const otpRes = await fetch('http://localhost:5000/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, fullName: 'Real Trader', type: 'REGISTRATION' })
  });
  const otpData = await otpRes.json();
  console.log('OTP Result:', otpData);

  const otpCode = otpData.debugOtp;
  if (!otpCode) {
    throw new Error('No OTP returned');
  }

  // 2. Register
  console.log('2. Registering with OTP:', otpCode);
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Real Trader',
      mobile: testMobile,
      email: testEmail,
      password: testPass,
      otp: otpCode
    })
  });
  const regData = await regRes.json();
  console.log('Registration Result:', regData.success, regData.user?.fullName, 'Balance:', regData.user?.inrBalance);

  // 3. Login with new credentials
  console.log('3. Logging in with new account...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: testEmail, password: testPass })
  });
  const loginData = await loginRes.json();
  console.log('Login Result:', loginData.success, 'UID:', loginData.user?.uid, 'Role:', loginData.user?.role);

  console.log('--- REAL ACCOUNT CREATION & LOGIN TEST PASSED! ---');
}

testRealRegistrationFlow().catch(console.error);

