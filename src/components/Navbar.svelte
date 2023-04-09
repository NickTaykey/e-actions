<script lang="ts">
 import {
  NavbarToggler,
  NavbarBrand,
  ModalHeader,
  ModalBody,
  Collapse,
  NavItem,
  Navbar,
  Button,
  Modal,
  Nav,
 } from 'sveltestrap';
 import { currentUser, signInUser, signOutUser } from '../helpers';
 import { getAuth, onAuthStateChanged } from 'firebase/auth';
 import { FormTypes } from '../helpers/types';
 import AuthPanel from './AuthPanel.svelte';
 import ItemForm from './ItemForm.svelte';

 const auth = getAuth();

 onAuthStateChanged(auth, (user) => {
  if (user !== null) signInUser(user);
  else signOutUser();
 });

 let isNavbarOpen = false;
 const handleUpdate = (event: CustomEvent<boolean>) => {
  isNavbarOpen = event.detail;
 };

 let isAuthModalOpen = false;
 const toggleAuthModal = () => (isAuthModalOpen = !isAuthModalOpen);

 let isItemModalOpen = false;
 const toggleNewItemModal = () => (isItemModalOpen = !isItemModalOpen);
</script>

<Modal isOpen={isAuthModalOpen} toggle={toggleAuthModal}>
 <ModalHeader toggle={toggleAuthModal}>SignIn</ModalHeader>
 <ModalBody>
  <AuthPanel />
 </ModalBody>
</Modal>

<Modal isOpen={isItemModalOpen} toggle={toggleNewItemModal}>
 <ModalHeader toggle={toggleNewItemModal}>New Item</ModalHeader>
 <ModalBody>
  <ItemForm type={FormTypes.NEW} />
 </ModalBody>
</Modal>

<Navbar color="light" light expand="lg">
 <NavbarBrand href="/" class="me-auto">E-Actions</NavbarBrand>
 <NavbarToggler on:click={() => (isNavbarOpen = !isNavbarOpen)} />
 <Collapse isOpen={isNavbarOpen} navbar expand="lg" on:update={handleUpdate}>
  <Nav class="ms-auto d-flex align-items-lg-center" navbar>
   {#if $currentUser !== null}
    <NavItem class="mt-3 mt-lg-0">
     Welcome, {$currentUser.email}!
    </NavItem>
    <NavItem class="mx-lg-2 my-2 mx-0">
     <Button color="success" class="w-100" on:click={toggleNewItemModal}>
      Post Item
     </Button>
    </NavItem>
    <NavItem class="mb-3 mb-lg-0">
     <Button color="secondary" class="w-100" on:click={() => auth.signOut()}>
      Sign Out
     </Button>
    </NavItem>
   {:else}
    <Button color="primary" class="my-3" on:click={toggleAuthModal}
     >SignIn</Button
    >
   {/if}
  </Nav>
 </Collapse>
</Navbar>
