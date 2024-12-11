<template>
    <nav class="navbar">
      <ul>
        <li><router-link to="/">Dashboard</router-link></li>
        <li><router-link to="/classes">Classes</router-link></li>
        <li><router-link to="/professors">Professors</router-link></li>
        <li><router-link to="/rooms">Rooms</router-link></li>
        <li><router-link to="/students">Students</router-link></li>
      </ul>
    </nav>
  </template>
  
  <script>
  export default {
    name: 'Navbar'
  };
  </script>
  
  <style scoped>
  .navbar {
    background-color: #333;
    padding: 1rem;
  }
  
  .navbar ul {
    display: flex;
    list-style: none;
    justify-content: space-around;
  }
  
  .navbar ul li {
    margin: 0 10px;
  }
  
  .navbar ul li a {
    color: white;
    text-decoration: none;
    font-size: 16px;
  }
  
  .navbar ul li a:hover {
    color: #ff6347;
  }
  </style>
  