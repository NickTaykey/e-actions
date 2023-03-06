<script lang="ts">
    import { 
        createUserWithEmailAndPassword, 
        signInWithEmailAndPassword, 
        onAuthStateChanged, 
        GoogleAuthProvider,
        GithubAuthProvider,
        signInWithPopup, 
        getAuth, 
    } from "firebase/auth";
    import _ from '../helpers/firebase'
    import { onMount } from "svelte";
    
    import type { User } from 'firebase/auth'
  
    let currentUser: User | null = null;
    let isSignIn: boolean = true;
    let password: string = "";
    let email: string = "";
    let errorMessage = '';
  
    const toggleForm = () => isSignIn = !isSignIn;
    const googleAuthProvider = new GoogleAuthProvider();
    const githubAuthProvider = new GithubAuthProvider();
    const auth = getAuth();
  
    const handleSignIn = async () => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        currentUser = userCredential.user;
      } catch (error: any) {
        if (error.code === 'auth/wrong-password') {
            errorMessage = `Wrong password!`;
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = `No accounts registered with this e-mail!`;
        }
      }
    };
  
    const handleSignUp = async () => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        currentUser = userCredential.user;
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = `Another user is registered with this email!`;
        } else if (error.code === 'auth/weak-password') {
            errorMessage = `Password not safe use letters, numbers and symbols!`;
        }
      }
    };

    const handleGoogleSignIn = async () => {
        try {
        const result = await signInWithPopup(auth, googleAuthProvider);
        handleGoogleSignIn()
        currentUser = result.user;
        } catch (error: any) {
        errorMessage = error.code;
        }
    };

    const handleGithubSignIn = async () => {
        try {
        const result = await signInWithPopup(auth, githubAuthProvider);
        handleGoogleSignIn()
        currentUser = result.user;
        } catch (error: any) {
        errorMessage = error.code;
        }
    };

    onMount(() => {
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
        });
    })
  </script>
  
  <main>
    {#if currentUser}
        <p>Welcome, {currentUser.email}!</p>
        <button on:click={() => auth.signOut()}>Sign Out</button>
    {:else}
        {#if errorMessage.length}
            <div>{errorMessage}</div>
        {/if}
        <div>
            <button on:click={handleGithubSignIn}>Github</button>
            <button on:click={handleGoogleSignIn}>Google</button>
        </div>
        <form on:submit|preventDefault={isSignIn ? handleSignIn : handleSignUp}>
          <label>
            Email:
            <input type="email" bind:value={email} required />
          </label>
          <label>
            Password:
            <input type="password" bind:value={password} required />
          </label>
          <button type="submit">{isSignIn ? "Sign In" : "Sign Up"}</button>
        </form>
        <p>{isSignIn ? "Don't have an account?" : "Already have an account?"} <button on:click={toggleForm}>{isSignIn ? "Sign Up" : "Sign In"}</button></p>
    {/if}


  </main>
  