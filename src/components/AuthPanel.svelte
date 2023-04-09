<script lang="ts">
 import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  getAuth,
 } from 'firebase/auth';
 import { Alert, Button, FormGroup, Input, Container } from 'sveltestrap';
 import { signInUser } from '../helpers/index';

 import type { User } from 'firebase/auth';

 let currentUser: User | null = null;
 let isSignIn: boolean = true;
 let password: string = '';
 let email: string = '';
 let errorMessage = '';

 const toggleForm = () => (isSignIn = !isSignIn);
 const googleAuthProvider = new GoogleAuthProvider();
 const githubAuthProvider = new GithubAuthProvider();
 const auth = getAuth();

 const handleSignIn = async () => {
  try {
   const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
   );
   currentUser = userCredential.user;
   signInUser(userCredential.user);
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
   const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
   );
   currentUser = userCredential.user;
   signInUser(userCredential.user);
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
   handleGoogleSignIn();
   currentUser = result.user;
   signInUser(result.user);
  } catch (error: any) {
   errorMessage = error.code;
  }
 };

 const handleGithubSignIn = async () => {
  try {
   const result = await signInWithPopup(auth, githubAuthProvider);
   handleGoogleSignIn();
   currentUser = result.user;
   signInUser(result.user);
  } catch (error: any) {
   errorMessage = error.code;
  }
 };

 onAuthStateChanged(auth, (user) => {
  currentUser = user;
 });
</script>

<Container>
 {#if errorMessage.length}
  <Alert color="danger">{errorMessage}</Alert>
 {/if}
 <div>
  <Button color="dark" class="w-100" on:click={handleGithubSignIn}>
   Github
  </Button>
  <Button color="primary" class="w-100 my-2" on:click={handleGoogleSignIn}>
   Google
  </Button>
 </div>

 <h3 class="text-center">Or</h3>

 <form on:submit|preventDefault={isSignIn ? handleSignIn : handleSignUp}>
  <FormGroup floating label="Email">
   <Input placeholder="Enter here" bind:value={email} required />
  </FormGroup>
  <FormGroup floating label="Password">
   <Input placeholder="Enter here" bind:value={password} required />
  </FormGroup>

  <Button type="submit" class="w-100">
   {isSignIn ? 'Sign In' : 'Sign Up'}
  </Button>
  <div class="my-3">
   {isSignIn ? "Don't have an account?" : 'Already have an account?'}
  </div>

  <Button on:click={toggleForm}>{isSignIn ? 'Sign Up' : 'Sign In'}</Button>
 </form>
</Container>
