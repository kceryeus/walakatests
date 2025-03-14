// Replace with your Supabase credentials
const supabaseUrl = 'https://zkqjmozftqmyaycpmlxn.supabase.co';
import { createClient } from '@supabase/supabase-js'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey);

// Sign Up Function
async function signUp(email, password) {
  const { user, session, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    console.error('Error signing up:', error.message);
    alert('Error signing up: ' + error.message);
  } else {
    console.log('User created:', user);
    alert('User created successfully!');
  }
}

// Log In Function
async function logIn(email, password) {
  const { user, session, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error('Error logging in:', error.message);
    alert('Error logging in: ' + error.message);
  } else {
    console.log('Logged in as:', user);
    alert('Logged in successfully!');
  }
}

// Log Out Function
async function logOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error logging out:', error.message);
    alert('Error logging out: ' + error.message);
  } else {
    console.log('User logged out');
    alert('Logged out successfully!');
  }
}

// Fetch and display the user's name
async function displayUserName() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error fetching user:', error.message);
    return;
  }

  if (user) {
    const { data, error: profileError } = await supabase
      .from('users') // Assuming the table is called 'profiles'
      .select('username') // Assuming the column is called 'username'
      .eq('id', user.id) // Matching by user ID
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError.message);
      return;
    }

    const userNameSpan = document.getElementById('user-name');
    if (userNameSpan) {
      userNameSpan.textContent = data.username || 'Unknown User';
    }
  }
}

// Call the function when the page loads
window.addEventListener('DOMContentLoaded', displayUserName);

