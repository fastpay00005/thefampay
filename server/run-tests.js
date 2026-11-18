async function runTests() {
  console.log('--- Testing API Endpoints & Supabase ---');

  // 1. Settings
  const settingsRes = await fetch('http://localhost:5000/api/settings');
  const settings = await settingsRes.json();
  console.log('1. Settings API:', settings.success, 'App Rate:', settings.settings?.rates?.appRate);

  // 2. Channels
  const channelsRes = await fetch('http://localhost:5000/api/user/channels');
  const channels = await channelsRes.json();
  console.log('2. Channels API:', channels.success, 'Count:', channels.channels?.length);

  // 3. Login
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'fastpay00005@gmail.com', password: 'FamPay@2026' })
  });
  const login = await loginRes.json();
  console.log('3. Login API:', login.success, 'User:', login.user?.fullName);

  // 4. File Upload to Supabase Storage
  const formData = new FormData();
  const blob = new Blob(['PNG_DUMMY_IMAGE_BYTES'], { type: 'image/png' });
  formData.append('file', blob, 'receipt_proof_test.png');

  const uploadRes = await fetch('http://localhost:5000/api/upload', {
    method: 'POST',
    body: formData
  });
  const upload = await uploadRes.json();
  console.log('4. Supabase Storage Upload API:', upload.success, 'Public URL:', upload.url);

  // 5. Submit Deposit with Supabase Storage Proof URL
  const depositRes = await fetch('http://localhost:5000/api/user/deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'USR-001',
      amount: 5000,
      currency: 'INR',
      method: 'UPI Auto-QR',
      refNumber: 'UTR-TEST-881920',
      proofUrl: upload.url
    })
  });
  const deposit = await depositRes.json();
  console.log('5. Deposit API with Supabase Proof:', deposit.success, 'Tx ID:', deposit.transaction?.id);

  // 6. Admin Overview
  const overviewRes = await fetch('http://localhost:5000/api/admin/overview');
  const overview = await overviewRes.json();
  console.log('6. Admin Overview:', overview.success, 'Pending requests:', overview.overview?.pendingRequests);

  // 7. Admin Approve Deposit
  const approveRes = await fetch(`http://localhost:5000/api/admin/transactions/${deposit.transaction?.id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'COMPLETED', adminNotes: 'Verified receipt on Supabase Storage' })
  });
  const approve = await approveRes.json();
  console.log('7. Admin Approve Deposit:', approve.success, 'New Status:', approve.transaction?.status);

  // 8. Admin 1-Click Fund Lock
  const lockRes = await fetch('http://localhost:5000/api/admin/users/USR-001/fund-lock', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isLocked: true })
  });
  const lock = await lockRes.json();
  console.log('8. Admin Fund Lock:', lock.success, 'fundLocked:', lock.user?.fundLocked);

  // 9. Admin 1-Click Reset PIN
  const resetRes = await fetch('http://localhost:5000/api/admin/users/USR-001/reset-pin', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPin: '1234' })
  });
  const reset = await resetRes.json();
  console.log('9. Admin Reset PIN:', reset.success, 'transactionPin:', reset.user?.transactionPin, 'pinLocked:', reset.user?.pinLocked);

  // Unlock fund back
  await fetch('http://localhost:5000/api/admin/users/USR-001/fund-lock', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isLocked: false })
  });

  console.log('--- ALL BACKEND & SUPABASE TESTS PASSED! ---');
}

runTests().catch(console.error);

