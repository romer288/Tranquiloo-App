import dotenv from "dotenv";
dotenv.config();

async function testAPIEndpoints() {
  const testUserId = '77f35531-0eff-446a-9007-b1bb1296555c';

  console.log('🧪 Testing API endpoints...');
  console.log('📋 User ID:', testUserId);

  try {
    // Test chat sessions endpoint
    console.log('\n📡 Testing /api/users/${userId}/chat-sessions...');
    const sessionsResponse = await fetch(`http://localhost:8000/api/users/${testUserId}/chat-sessions`);
    console.log('📊 Sessions Response Status:', sessionsResponse.status);

    if (sessionsResponse.ok) {
      const sessionsData = await sessionsResponse.json();
      console.log('📋 Sessions Data:', sessionsData);
    } else {
      const error = await sessionsResponse.text();
      console.log('❌ Sessions Error:', error);
    }

    // Test anxiety analyses endpoint
    console.log('\n📡 Testing /api/users/${userId}/anxiety-analyses...');
    const analysesResponse = await fetch(`http://localhost:8000/api/users/${testUserId}/anxiety-analyses`);
    console.log('📊 Analyses Response Status:', analysesResponse.status);

    if (analysesResponse.ok) {
      const analysesData = await analysesResponse.json();
      console.log('🧠 Analyses Data:', analysesData);
    } else {
      const error = await analysesResponse.text();
      console.log('❌ Analyses Error:', error);
    }

  } catch (error) {
    console.error('❌ Network Error:', error);
  }
}

testAPIEndpoints();