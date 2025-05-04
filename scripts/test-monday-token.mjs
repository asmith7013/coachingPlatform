// test-monday-token.js - Run with Node.js
import fetch from 'node-fetch';

// Replace with your newly generated token
console.log(process.env.MONDAY_API_TOKEN, 'MONDAY_API_TOKEN')
const MONDAY_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUwNzgyMjU0MCwiYWFpIjoxMSwidWlkIjo2NTYzMjkyMSwiaWFkIjoiMjAyNS0wNS0wM1QwMDo0MDozMy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6ODg4NDgxOSwicmduIjoidXNlMSJ9.klSS4IGDURp_3Nj2Yhkr4dddx4colLOc6cA_pjY426Y";

async function testToken() {
  try {
    console.log("Testing Monday.com API token...");
    
    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': MONDAY_TOKEN
      },
      body: JSON.stringify({
        query: `query { users { id name email } }`
      })
    });
    
    const data = await response.json();
    console.log("API Response:", JSON.stringify(data, null, 2));
    
    if (data.data && data.data.users && data.data.users.length > 0) {
      console.log("Token belongs to:", data.data.users[0].name);
      console.log("Email:", data.data.users[0].email);
    } else {
      console.log("No user data found in response");
    }
  } catch (error) {
    console.error("Error testing token:", error);
  }
}

testToken();