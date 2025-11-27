import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import SectorBarChart from './components/charts/SectorBarChart';
import RegionPieChart from './components/charts/RegionPieChart';
import BubbleChart from './components/charts/BubbleChart';
import LineChartIntensity from './components/charts/LineChartIntensity';
import CountryIntensityChart from './components/charts/CountryIntensityChart';
import TopicFrequencyChart from './components/charts/TopicFrequencyChart';

const App = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    end_year: '',
    topic: '',
    sector: '',
    region: '',
    pestle: '',
    country: ''
  });

  // Fetch filter options
  useEffect(() => {
    axios.get("http://localhost:8000/api/filters")
      .then(res => setFilters(res.data))
      .catch(err => console.error("Error loading filters:", err));
  }, []);

  // Fetch data based on active filters
  useEffect(() => {
    const params = {};

    Object.keys(selectedFilters).forEach(key => {
      if (selectedFilters[key]) {
        params[key] = selectedFilters[key];
      }
    });

    axios.get("http://localhost:8000/api/data", { params })
      .then(res => setData(res.data))
      .catch(err => console.error("Error loading data:", err));

  }, [selectedFilters]);

  const handleFilterChange = (e) => {
    setSelectedFilters({ ...selectedFilters, [e.target.name]: e.target.value });
  };

  return (
    <div className="container-fluid bg-light p-4" style={{ scrollBehavior: 'smooth' }}>
      <h1 className="mb-4 text-center dashboard-title">
        Energy & Economic Insights Dashboard
      </h1>

      {/* --------------------- FILTERS --------------------- */}
      <div className="row mb-4 p-4 filter-section shadow-sm">
        <h4 className="text-center mb-3">📊 Data Filters</h4>
        {Object.keys(filters).map(key => (
          <div className="col-md-2 mb-2" key={key}>
            <label className="text-capitalize">{key.replace("_", " ")}</label>
            <select className="form-control" name={key} onChange={handleFilterChange}>
              <option value="">All</option>
              {filters[key]?.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* --------------------- CHARTS --------------------- */}
      <div className="row">

        {/* Sector Bar Chart */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm p-3" style={{ minHeight: '480px' }}>
            <h5 className="text-center mb-3">Count by Sector</h5>
            <SectorBarChart data={data} />
          </div>
        </div>

        {/* Region Pie Chart */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm p-3" style={{ minHeight: '480px' }}>
            <h5 className="text-center mb-3">Distribution by Region</h5>
            <RegionPieChart data={data} />
          </div>
        </div>

        {/* Bubble Chart */}
        <div className="col-12 mb-4">
          <div className="card shadow-sm p-3" style={{ minHeight: '480px' }}>
            <h5 className="text-center mb-3">Likelihood vs Relevance (Bubble Size = Intensity)</h5>
            <div className="d-flex justify-content-center">
              <BubbleChart data={data} />
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="col-12 mb-4">
          <div className="card shadow-sm p-3" style={{ minHeight: '480px' }}>
            <h5 className="text-center mb-3">Intensity Over Years</h5>
            <div className="d-flex justify-content-center">
              <LineChartIntensity data={data} />
            </div>
          </div>
        </div>

        {/* Country Avg Intensity */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm p-3" style={{ minHeight: '480px' }}>
            <h5 className="text-center mb-3">Top Countries by Avg Intensity</h5>
            <CountryIntensityChart data={data} />
          </div>
        </div>

        {/* Topic Frequency */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm p-3" style={{ minHeight: '480px' }}>
            <h5 className="text-center mb-3">Most Frequent Topics</h5>
            <TopicFrequencyChart data={data} />
          </div>
        </div>

        {/* Table Preview */}
        <div className="col-12 mb-4">
          <div className="card shadow-sm p-3">
            <h5 className="text-center mb-3">Recent Insights</h5>
            <div style={{ maxHeight: "350px", overflowY: "auto", scrollBehavior: "smooth" }}>
              <table className="table table-striped table-sm">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Topic</th>
                    <th>Year</th>
                    <th>Country</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 25).map((d, i) => (
                    <tr key={i}>
                      <td>{d.title}</td>
                      <td>{d.topic}</td>
                      <td>{d.end_year}</td>
                      <td>{d.country}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
