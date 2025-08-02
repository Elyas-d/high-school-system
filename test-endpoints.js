const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testEndpoints() {
  try {
    console.log('🧪 Testing High School Management System Endpoints\n');

    // Test 1: Login
    console.log('1. Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'teacher1@example.com',
      password: 'teacher123'
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    const token = loginResponse.data.data.token;
    console.log('Token received:', token.substring(0, 50) + '...\n');

    // Test 2: Register
    console.log('2. Testing Register...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'Student',
      email: 'teststudent@example.com',
      password: 'password123',
      role: 'STUDENT',
      phoneNumber: '1234567890'
    });
    console.log('✅ Register successful:', registerResponse.data.message);
    console.log('User created with ID:', registerResponse.data.data.user.id, '\n');

    // Test 3: Get Materials (with authentication)
    console.log('3. Testing Materials List (with auth)...');
    const materialsResponse = await axios.get(`${BASE_URL}/materials`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Materials list successful:', materialsResponse.data.message);
    console.log('Materials count:', materialsResponse.data.data.length, '\n');

    // Test 4: Create Material (with authentication)
    console.log('4. Testing Create Material...');
    const createMaterialResponse = await axios.post(`${BASE_URL}/materials`, {
      title: 'Algebra Chapter 1',
      description: 'Introduction to algebraic expressions',
      fileUrl: 'https://example.com/algebra-ch1.pdf',
      subjectId: 1,
      type: 'document'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Create material successful:', createMaterialResponse.data.message);
    console.log('Material created with ID:', createMaterialResponse.data.data.id, '\n');

    // Test 5: Get Users (admin only - should fail for teacher)
    console.log('5. Testing Users List (teacher should be denied)...');
    try {
      await axios.get(`${BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('❌ Unexpected success - teacher should not access users');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✅ Authorization working correctly - teacher denied access to users');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }
    console.log('');

    // Test 6: Get Profile
    console.log('6. Testing Get Profile...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Profile retrieved successfully');
    console.log('User:', profileResponse.data.data.user.firstName, profileResponse.data.data.user.lastName, '\n');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

// Run the tests
testEndpoints(); 