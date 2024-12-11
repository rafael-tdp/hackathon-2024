<template>
    <header class="header">
      <nav class="navbar">
        <ul>
          <li><router-link to="/dashboard" class="nav-link">Dashboard</router-link></li>
          <li><router-link to="/classes" class="nav-link">Classes</router-link></li>
          <li><router-link to="/professors" class="nav-link">Professors</router-link></li>
          <li><router-link to="/rooms" class="nav-link">Rooms</router-link></li>
          <li><router-link to="/students" class="nav-link">Students</router-link></li>
        </ul>
      </nav>
    </header>
  </template>
  
  <script>
  export default {
    name: 'Navbar'
  };
  </script>
  
  <style scoped>
  .header {
    width: 100%;
    background-color: #333;
    position: sticky;
    top: 0;
    z-index: 1000;
  }
  
  .navbar {
    padding: 1rem;
  }
  
  .navbar ul {
    display: flex;
    justify-content: center;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .navbar ul li {
    margin: 0 15px;
  }
  
  .navbar .nav-link {
    color: white;
    text-decoration: none;
    font-size: 18px;
    font-weight: bold;
    transition: color 0.3s ease;
  }
  
  .navbar .nav-link:hover {
    color: #00bcd4;
  }
  
  @media (max-width: 768px) {
    .navbar ul {
      flex-direction: column;
    }
  
    .navbar ul li {
      margin-bottom: 10px;
    }
  }
  </style>
  