import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project URL and public anon key
const supabaseUrl = 'https://zqnthduqpzriydgbdojy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbnRoZHVxcHpyaXlkZ2Jkb2p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4OTkzOTcsImV4cCI6MjA1NzQ3NTM5N30.fZqsPqkbJ4m-Lp7BRTAOuxU5_6MXj8QJERUTreshKIU'

const supabase = createClient(supabaseUrl, supabaseKey)

// Example function to sign in a user
async function signIn(email, password) {
    const { user, session, error } = await supabase.auth.signIn({
        email: email,
        password: password,
    })

    if (error) {
        console.error('Error signing in:', error)
    } else {
        console.log('User signed in:', user)
        console.log('Session:', session)
    }
}

// Example function to sign up a new user
async function signUp(email, password) {
    const { user, session, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    })

    if (error) {
        console.error('Error signing up:', error)
    } else {
        console.log('User signed up:', user)
        console.log('Session:', session)
    }
}

// Example function to sign out the current user
async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Error signing out:', error)
    } else {
        console.log('User signed out')
    }
}

export { signIn, signUp, signOut }