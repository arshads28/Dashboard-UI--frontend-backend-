import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Doughnut, Bubble, Line, Scatter } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Professional styling
const styles = {
  container: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    padding: '2rem 0'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: 'none',
    borderRadius: '15px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    marginBottom: '2rem'
  },
  cardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
  },
  header: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  },
  filterCard: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.08)'
  },
  select: {
    border: '2px solid #e9ecef',
    borderRadius: '10px',
    padding: '0.5rem',
    transition: 'all 0.3s ease',
    background: 'white'
  },
  table: {
    borderRadius: '10px',
    overflow: 'hidden',
    background: 'white'
  },
  scrollContainer: {
    maxHeight: '350px',
    overflowY: 'auto',
    scrollBehavior: 'smooth',
    borderRadius: '10px'
  }
};

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend
);

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    end_year: '', topic: '', sector: '', region: '', pestle: '', country: ''
  });

  // Fetch Filters Options
  useEffect(() => {
    axios.get('http://localhost:8000/api/filters')
      .then(res => setFilters(res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch Data based on Selected Filters
  useEffect(() => {
    const params = {};
    Object.keys(selectedFilters).forEach(key => {
      if (selectedFilters[key]) params[key] = selectedFilters[key];
    });

    axios.get('http://localhost:8000/api/data', { params })
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [selectedFilters]);

  const handleFilterChange = (e) => {
    setSelectedFilters({ ...selectedFilters, [e.target.name]: e.target.value });
  };

  // ------------------- EXISTING CHARTS ------------------------

  // 1. Sector Count
  const sectorCount = {};
  data.forEach(d => {
    if (d.sector) sectorCount[d.sector] = (sectorCount[d.sector] || 0) + 1;
  });

  const barChartData = {
    labels: Object.keys(sectorCount).slice(0, 10),
    datasets: [{
      label: 'Count',
      data: Object.values(sectorCount).slice(0, 10),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }]
  };

  // 2. Region Distribution
  const regionCount = {};
  data.forEach(d => {
    if (d.region) regionCount[d.region] = (regionCount[d.region] || 0) + 1;
  });

  const doughnutData = {
    labels: Object.keys(regionCount),
    datasets: [{
      data: Object.values(regionCount),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
      ],
    }]
  };

  // 3. Bubble Chart
  const bubbleData = {
    datasets: [{
      label: 'Topic Visual',
      data: data.slice(0, 50).map(d => ({
        x: d.likelihood,
        y: d.relevance,
        r: d.intensity / 2
      })),
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    }]
  };

  // ------------------- NEW CHARTS -----------------------------

  // --- NEW 1: Line chart (Intensity by Year) ---
  const yearlyIntensity = {};
  data.forEach(d => {
    if (d.end_year && d.intensity) {
      yearlyIntensity[d.end_year] = 
        (yearlyIntensity[d.end_year] || 0) + d.intensity;
    }
  });

  const lineData = {
    labels: Object.keys(yearlyIntensity),
    datasets: [{
      label: 'Intensity Over Years',
      data: Object.values(yearlyIntensity),
      fill: false,
      borderColor: 'rgba(54, 162, 235, 0.7)',
      tension: 0.3
    }]
  };

  // --- NEW 2: Top 10 Countries by Average Intensity ---
  const intensityByCountry = {};
  const countByCountry = {};

  data.forEach(d => {
    if (d.country && d.intensity) {
      intensityByCountry[d.country] =
        (intensityByCountry[d.country] || 0) + d.intensity;
      countByCountry[d.country] = (countByCountry[d.country] || 0) + 1;
    }
  });

  const avgCountryIntensity = Object.keys(intensityByCountry)
    .map(country => ({
      country,
      avg: intensityByCountry[country] / countByCountry[country]
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10);

  const countryBarData = {
    labels: avgCountryIntensity.map(c => c.country),
    datasets: [{
      label: 'Avg Intensity',
      data: avgCountryIntensity.map(c => c.avg),
      backgroundColor: 'rgba(255, 159, 64, 0.7)'
    }]
  };

  // --- NEW 3: Topic Frequency ---
  const topicCount = {};
  data.forEach(d => {
    if (d.topic) topicCount[d.topic] = (topicCount[d.topic] || 0) + 1;
  });

  const topicData = {
    labels: Object.keys(topicCount).slice(0, 10),
    datasets: [{
      label: 'Topic Frequency',
      data: Object.values(topicCount).slice(0, 10),
      backgroundColor: 'rgba(153, 102, 255, 0.7)'
    }]
  };

  // --- NEW 4: Scatter Plot (Likelihood vs Intensity) ---
  const scatterData = {
    datasets: [{
      label: 'Likelihood vs Intensity',
      data: data.map(d => ({
        x: d.likelihood,
        y: d.intensity
      })),
      backgroundColor: 'rgba(75, 0, 130, 0.6)',
    }]
  };

  return (
    <div style={styles.container}>
      <div className="container-fluid">
        {/* Header */}
        <div style={styles.header} className="text-center">
          <h1 className="display-4 font-weight-bold" style={{color: '#2c3e50', marginBottom: '0.5rem'}}>⚡ Energy & Economic Insights</h1>
          <p className="lead" style={{color: '#7f8c8d'}}>Professional Analytics Dashboard</p>
        </div>

        {/* Filters */}
        <div style={styles.filterCard}>
          <h4 className="mb-3" style={{color: '#2c3e50', fontWeight: '600'}}>📊 Data Filters</h4>
          <div className="row">
            {Object.keys(filters).map(key => (
              <div className="col-md-2 mb-3" key={key}>
                <label className="text-capitalize font-weight-medium" style={{color: '#495057', fontSize: '0.9rem'}}>
                  {key.replace('_', ' ')}
                </label>
                <select 
                  style={styles.select}
                  className="form-control" 
                  name={key} 
                  onChange={handleFilterChange}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                >
                  <option value="">All</option>
                  {filters[key]?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="row">
          
          {/* Existing Bar */}
          <div className="col-md-6">
            <div 
              style={styles.card} 
              className="p-4"
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}
            >
              <h5 className="mb-3" style={{color: '#2c3e50', fontWeight: '600'}}>📊 Count by Sector</h5>
              <Bar data={barChartData} options={{responsive: true, plugins: {legend: {display: false}}}} />
            </div>
          </div>

          {/* Existing Bubble */}
          <div className="col-md-6">
            <div 
              style={styles.card} 
              className="p-4"
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}
            >
              <h5 className="mb-3" style={{color: '#2c3e50', fontWeight: '600'}}>🎯 Relevance vs Likelihood</h5>
              <Bubble data={bubbleData} options={{responsive: true, plugins: {legend: {display: false}}}} />
            </div>
          </div>

          {/* New Line Chart */}
          <div className="col-md-6">
            <div 
              style={styles.card} 
              className="p-4"
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}
            >
              <h5 className="mb-3" style={{color: '#2c3e50', fontWeight: '600'}}>📈 Intensity Trend</h5>
              <Line data={lineData} options={{responsive: true, plugins: {legend: {display: false}}}} />
            </div>
          </div>

          {/* New Country Intensity Bar */}
          <div className="col-md-6">
            <div 
              style={styles.card} 
              className="p-4"
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}
            >
              <h5 className="mb-3" style={{color: '#2c3e50', fontWeight: '600'}}>🌍 Top Countries</h5>
              <Bar data={countryBarData} options={{responsive: true, plugins: {legend: {display: false}}}} />
            </div>
          </div>

          {/* New Topic Frequency */}
          <div className="col-md-6">
            <div 
              style={styles.card} 
              className="p-4"
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}
            >
              <h5 className="mb-3" style={{color: '#2c3e50', fontWeight: '600'}}>🏷️ Popular Topics</h5>
              <Bar data={topicData} options={{responsive: true, plugins: {legend: {display: false}}}} />
            </div>
          </div>

          {/* New Scatter */}
          <div className="col-md-6">
            <div 
              style={styles.card} 
              className="p-4"
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}
            >
              <h5 className="mb-3" style={{color: '#2c3e50', fontWeight: '600'}}>⚡ Likelihood vs Intensity</h5>
              <Scatter data={scatterData} options={{responsive: true, plugins: {legend: {display: false}}}} />
            </div>
          </div>

          {/* Table */}
          <div className="col-md-12">
            <div 
              style={styles.card} 
              className="p-4"
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}
            >
              <h5 className="mb-3" style={{color: '#2c3e50', fontWeight: '600'}}>📋 Recent Insights</h5>
              <div style={styles.scrollContainer}>
                <table className="table table-hover mb-0" style={styles.table}>
                  <thead style={{background: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1}}>
                    <tr>
                      <th style={{border: 'none', padding: '1rem', color: '#495057', fontWeight: '600'}}>Title</th>
                      <th style={{border: 'none', padding: '1rem', color: '#495057', fontWeight: '600'}}>Topic</th>
                      <th style={{border: 'none', padding: '1rem', color: '#495057', fontWeight: '600'}}>Year</th>
                      <th style={{border: 'none', padding: '1rem', color: '#495057', fontWeight: '600'}}>Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 20).map((d, index) => (
                      <tr key={d._id} style={{transition: 'all 0.2s ease'}}>
                        <td style={{padding: '1rem', border: 'none', borderBottom: '1px solid #f1f3f4'}}>{d.title}</td>
                        <td style={{padding: '1rem', border: 'none', borderBottom: '1px solid #f1f3f4'}}>
                          <span className="badge" style={{background: '#667eea', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '15px'}}>
                            {d.topic}
                          </span>
                        </td>
                        <td style={{padding: '1rem', border: 'none', borderBottom: '1px solid #f1f3f4', color: '#6c757d'}}>{d.end_year}</td>
                        <td style={{padding: '1rem', border: 'none', borderBottom: '1px solid #f1f3f4', color: '#6c757d'}}>{d.country}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
