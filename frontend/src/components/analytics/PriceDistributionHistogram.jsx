import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PriceDistributionHistogram = ({ properties }) => {
  if (!properties || properties.length === 0) {
    return <div>No property data available.</div>;
  }

  // Extract prices and determine the range
  const prices = properties.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Define number of bins and bin size
  const numberOfBins = 10;
  const binSize = Math.ceil((maxPrice - minPrice) / numberOfBins);

  // Create bins array with labels and initial counts
  const bins = Array.from({ length: numberOfBins }, (_, i) => {
    const lowerBound = minPrice + i * binSize;
    const upperBound = lowerBound + binSize - 1;
    return {
      bin: `£${lowerBound.toLocaleString()} - £${upperBound.toLocaleString()}`,
      count: 0,
    };
  });

  // Populate bin counts
  prices.forEach((price) => {
    const binIndex = Math.min(
      Math.floor((price - minPrice) / binSize),
      numberOfBins - 1
    );
    bins[binIndex].count++;
  });

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={bins}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="bin"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#36A2EB" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceDistributionHistogram;
