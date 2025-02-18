import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components for the Bar chart.
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

/**
 * AnalyticsDashboard component displays a histogram (bar chart) for the distribution
 * of POI ratings alongside a table listing the top 5 POIs sorted by review count.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.poiData - Array of POI data objects.
 *        Each object can include properties like `rating`, `user_ratings_total`, `name`, `vicinity`, and `place_id`.
 * @returns {JSX.Element} The rendered AnalyticsDashboard component.
 */
const AnalyticsDashboard = ({ poiData }) => {
  /**
   * Process the poiData array to count the number of occurrences for each rating.
   * POIs without a valid rating are grouped under "Unknown".
   *
   * @type {Object.<string, number>}
   */
  const ratingCounts = poiData.reduce((acc, poi) => {
    const rating = poi.rating ? Math.floor(poi.rating) : 'Unknown';
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {});

  /**
   * Create an ordered array of labels for the x-axis.
   * Numeric ratings are sorted in ascending order with 'Unknown' placed at the end.
   *
   * @type {string[]}
   */
  const labels = Object.keys(ratingCounts).sort((a, b) => {
    if (a === 'Unknown') return 1;
    if (b === 'Unknown') return -1;
    return a - b;
  });

  /**
   * Prepare the data object for the Bar (histogram) chart.
   *
   * @type {Object}
   */
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Number of POIs',
        data: labels.map((label) => ratingCounts[label]),
        backgroundColor: '#36A2EB',
      },
    ],
  };

  /**
   * Chart options for the histogram including title and axis labels.
   *
   * @type {Object}
   */
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'POI Ratings Distribution Histogram',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Rating',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Count',
        },
        ticks: {
          precision: 0,
        },
      },
    },
    /**
     * Handles click events on the chart.
     *
     * @param {MouseEvent} event - The click event.
     * @param {Array} elements - Array of chart elements that were clicked.
     */
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const element = elements[0];
        const rating = chartData.labels[element.index];
        // For example, filter markers on the map based on the clicked rating.
        console.log(`Clicked on rating: ${rating}`);
      }
    },
  };

  /**
   * Computes the top 5 POIs sorted by review count (user_ratings_total).
   * If `user_ratings_total` is not defined for a POI, it is treated as 0.
   *
   * @type {Array<Object>}
   */
  const topFivePOIs = [...poiData]
    .sort((a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0))
    .slice(0, 5);

  return (
    <div className="analytics-dashboard">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Histogram Section */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">POI Ratings Distribution</h3>
          <Bar data={chartData} options={chartOptions} />
        </div>
        {/* Top 5 POIs Table Section */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">Top 5 POIs by Reviews</h3>
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Rating</th>
                <th className="border border-gray-300 px-4 py-2">Reviews</th>
                <th className="border border-gray-300 px-4 py-2">Vicinity</th>
              </tr>
            </thead>
            <tbody>
              {topFivePOIs.map((poi) => (
                <tr key={poi.place_id}>
                  <td className="border border-gray-300 px-4 py-2">{poi.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{poi.rating || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2">{poi.user_ratings_total || 0}</td>
                  <td className="border border-gray-300 px-4 py-2">{poi.vicinity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
