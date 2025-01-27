import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import UsageCard from "./UsageCard";
import { useAuth } from "./contexts/AuthContext";
import axios from "axios";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [usageData, setUsageData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const activeSubscription = user?.subscription?.find(sub => sub.status_type === "active");


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "API Requests",
        },
        beginAtZero: true,
        min: 0, // 👈 Set a minimum value for the y-axis
        ticks: {
          stepSize: 10, // 👈 Optional: Defines the spacing between grid lines
        },
      },
    },
  };

  useEffect(() => {
    if (!user || !user.apiKey) {
      console.error("User or API key is missing.");
      return;
    }

    const fetchUsageData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/usage/daily`,
          {
            headers: {
              "x-api-key": user.apiKey,
            },
          }
        );

        console.log("Response Data:", response.data); // Debugging
        const data = response.data;

        if (!data || data.length === 0) {
          console.error("No usage data available.");
        }

        setUsageData(data);

        // Get first and last date of the current month
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        // Map API response into a format that ensures every day is included
        const dailyRequestsMap = data.reduce((acc, item) => {
          // Construct a Date object from year, month, and day
          const itemDate = new Date(item._id.year, item._id.month - 1, item._id.day); // month is 0-indexed
          const day = itemDate.getDate(); // Get the day of the month
          acc[day] = item.totalRequests || 0;
          return acc;
        }, {});

        // Ensure all days are in the dataset, defaulting to 0 requests
        const chartDataset = allDays.map(day => dailyRequestsMap[day] || 0);

        console.log("Chart Labels:", allDays);
        console.log("Chart Dataset:", chartDataset);

        setChartData({
          labels: allDays.map(day => day.toString()), // Convert numbers to strings
          datasets: [
            {
              label: "Daily API Requests",
              data: chartDataset,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: "rgba(75, 192, 192, 1)",
            },
          ],
        });

        // Calculate requests made today
        const today = new Date().setHours(0, 0, 0, 0); // Get the start of today (midnight)
        const requestsToday = data.filter((item) => {
          // Construct date object for each item
          const itemDate = new Date(item._id.year, item._id.month - 1, item._id.day);
          const itemDateMidnight = itemDate.setHours(0, 0, 0, 0); // Remove time part for comparison
          return itemDateMidnight === today;
        }).reduce((acc, item) => acc + item.totalRequests, 0);

        // Calculate total requests for the month
        const totalRequestsThisMonth = data.reduce((acc, item) => acc + item.totalRequests, 0);

        // Calculate the user's subscription type (remaining requests)
        const subscription = activeSubscription
        const planRequestsLimit = subscription?.subscription_type === "free"
          ? 1000
          : subscription?.subscription_type === "pro"
            ? 50000
            : subscription?.subscription_type === "premium"
              ? 2500000
              : 0;

        const requestsRemaining = planRequestsLimit - totalRequestsThisMonth;

        // Get the current month and year
        const currentMonth = now.getMonth(); // Get the current month (0-11)
        const currentYear = now.getFullYear(); // Get the current year

        // Check if the current data is from the current month and year
        const isNewMonth = !data.some(item => item._id.month - 1 === currentMonth && item._id.year === currentYear);

        // If the month is different from the previous month, reset the data
        if (isNewMonth) {
          setUsageData((prevData) => ({
            ...prevData,
            requestsToday: 0, // Reset requests today
            totalRequestsThisMonth: 0, // Reset total requests for the month
            requestsRemaining: planRequestsLimit, // Reset remaining requests to the plan limit
          }));
        }

        // Update the state with the calculated values
        setUsageData((prevData) => ({
          ...prevData,
          requestsToday,
          totalRequestsThisMonth,
          requestsRemaining,
        }));

      } catch (error) {
        console.error("Error fetching usage data:", error);
      }
    };

    fetchUsageData();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Error loading user data</div>;
  }

  if (!usageData || !chartData) {
    return <div className="min-h-screen flex items-center justify-center">Loading API Usage Data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>
                <span className="font-semibold">Name:</span> {user.userName || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {user.email || "N/A"}
              </p>
            </div>
            <div>
              <p>
                <span className="font-semibold">Plan:</span>{" "}
                {activeSubscription.subscription_type === "free" ? "Free Plan" : `${activeSubscription.subscription_type || "N/A"} plan`}
              </p>
              <p>
                <span className="font-semibold">Renew Date:</span>{" "}
                {activeSubscription.subscription_type === ""
                  ? "N/A"
                  : activeSubscription.end_date
                    ? new Date(user.subscription[0].end_date).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    }).replace(',', '') // This will format to 'yyyy-Mmm-dd' like '2025-Jan-23'
                    : "N/A"}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">API Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <UsageCard
              title="Total Requests"
              value={usageData?.totalRequestsThisMonth || 0}  // Show total requests for the month
              description="Total API requests made this month"
            />
            <UsageCard
              title="Requests Today"
              value={usageData?.requestsToday || 0}
              description="API requests made today"
            />
            <UsageCard
              title="Requests Remaining"
              value={usageData?.requestsRemaining || 0}
              description="Requests left in your current plan"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md" style={{ height: '400px' }}>
            <h3 className="text-lg font-bold mb-4">API Usage History</h3>
            <Line data={chartData} options={chartOptions} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
