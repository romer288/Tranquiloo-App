// Simple JavaScript to check frontend user data
// Run this in browser console on the app page

console.log('🔍 Checking frontend user data...');

// Check localStorage
const authUser = localStorage.getItem('auth_user');
console.log('📦 Raw localStorage auth_user:', authUser);

if (authUser) {
  try {
    const parsedUser = JSON.parse(authUser);
    console.log('👤 Parsed user object:', parsedUser);
    console.log('🆔 User ID:', parsedUser.id);
    console.log('📧 User email:', parsedUser.email);
  } catch (error) {
    console.error('❌ Error parsing user data:', error);
  }
} else {
  console.log('❌ No auth_user in localStorage');
}

// Check if there are other user-related keys
console.log('🗄️ All localStorage keys:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`  - ${key}: ${localStorage.getItem(key)?.substring(0, 100)}...`);
}