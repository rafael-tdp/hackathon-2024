<template>
    <div class="dashboard">
      <header>
        <Navbar />
      </header>
      
      <main class="main-content">
        <div class="container">
          <h1 class="title">Bienvenue sur le Dashboard</h1>
          <div class="stats-container">
            <div class="stat-card professor">
              <h2 class="stat-title">Professeurs</h2>
              <p class="stat-number">{{ stats.professors }}</p>
            </div>
            <div class="stat-card student">
              <h2 class="stat-title">Étudiants</h2>
              <p class="stat-number">{{ stats.students }}</p>
            </div>
            <div class="stat-card class">
              <h2 class="stat-title">Classes</h2>
              <p class="stat-number">{{ stats.classes }}</p>
            </div>
            <div class="stat-card subject">
              <h2 class="stat-title">Matières</h2>
              <p class="stat-number">{{ stats.subjects }}</p>
            </div>
          </div>
          <div class="calendar-container">
            <div class="calendar">
              <div class="calendar-header">
                <span class="month">Décembre 2024</span>
                <div class="nav-buttons">
                  <button class="prev">◀</button>
                  <button class="next">▶</button>
                </div>
              </div>
              <div class="calendar-grid">
                <div class="calendar-day">Lun</div>
                <div class="calendar-day">Mar</div>
                <div class="calendar-day">Mer</div>
                <div class="calendar-day">Jeu</div>
                <div class="calendar-day">Ven</div>
                <div class="calendar-day">Sam</div>
                <div class="calendar-day">Dim</div>
                <div class="calendar-date"></div>
                <div class="calendar-date"></div>
                <div class="calendar-date"></div>
                <div class="calendar-date"></div>
                <div class="calendar-date">1</div>
                <div class="calendar-date">2</div>
                <div class="calendar-date">3</div>
                <div class="calendar-date">4</div>
                <div class="calendar-date">5</div>
                <div class="calendar-date">6</div>
                <div class="calendar-date">7</div>
                <div class="calendar-date">8</div>
                <div class="calendar-date">9</div>
                <div class="calendar-date">10</div>
                <div class="calendar-date">11</div>
                <div class="calendar-date">12</div>
                <div class="calendar-date">13</div>
                <div class="calendar-date">14</div>
                <div class="calendar-date">15</div>
                <div class="calendar-date">16</div>
                <div class="calendar-date">17</div>
                <div class="calendar-date">18</div>
                <div class="calendar-date">19</div>
                <div class="calendar-date">20</div>
                <div class="calendar-date">21</div>
                <div class="calendar-date">22</div>
                <div class="calendar-date">23</div>
                <div class="calendar-date">24</div>
                <div class="calendar-date">25</div>
                <div class="calendar-date">26</div>
                <div class="calendar-date">27</div>
                <div class="calendar-date">28</div>
                <div class="calendar-date">29</div>
                <div class="calendar-date">30</div>
                <div class="calendar-date">31</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import Navbar from '@/components/Navbar.vue';
  
  export default {
    name: 'Dashboard',
    components: {
      Navbar
    },
    data() {
      return {
        stats: {
          professors: 0,
          students: 0,
          classes: 0,
          subjects: 0,
        },
      };
    },
    mounted() {
      axios
        .get('http://localhost:3000/api/stats')
        .then((response) => {
          this.stats = response.data;
        })
        .catch((error) => {
          console.error('Erreur lors de la récupération des statistiques', error);
        });
    },
  };
  </script>
  
  <style scoped>
  .dashboard {
    display: flex;
    flex-direction: column;
    background-color: #f8f9fa;
  }
  
  header {
    background-color: #333;
    padding: 1rem;
    position: sticky;
    top: 0;
    z-index: 1000;
  }
  
  .main-content {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding-top: 2rem;
  }
  
  .container {
    padding: 1rem;
    max-width: 1200px;
    width: 100%;
    text-align: center;
  }
  
  .title {
    font-size: 2.5rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 1rem;
    margin-top: 0;
    text-align: center;
  }
  
  .stats-container {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(4, 1fr);
    width: 100%;
    margin-top: 2rem;
  }
  
  .stat-card {
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    color: white;
    text-align: center;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    min-width: 220px;
  }
  
  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  }
  
  .professor {
    background: linear-gradient(to right, #6a4c93, #5a3c83);
  }
  
  .student {
    background: linear-gradient(to right, #38b2ac, #4fd1c5);
  }
  
  .class {
    background: linear-gradient(to right, #ecc94b, #f6ad55);
  }
  
  .subject {
    background: linear-gradient(to right, #f56565, #e53e3e);
  }
  
  .stat-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .stat-number {
    font-size: 2rem;
    font-weight: bold;
  }
  
  .calendar-container {
    margin-top: 3rem;
  }
  
  .calendar {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #f1f1f1;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  
  .month {
    font-size: 1.5rem;
    font-weight: bold;
  }
  
  .nav-buttons button {
    border: none;
    background: none;
    font-size: 1.2rem;
    cursor: pointer;
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-gap: 0.5rem;
    padding: 1rem;
  }
  
  .calendar-day, .calendar-date {
    text-align: center;
    padding: 0.5rem;
  }
  
  .calendar-day {
    font-weight: bold;
    color: #667;
  }
  
  .calendar-date {
    background-color: #f9f9f9;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .calendar-date:hover {
    background-color: #e0e0e0;
  }
  
  @media (max-width: 768px) {
    .calendar {
      max-width: 100%;
    }
  }
  </style>
  