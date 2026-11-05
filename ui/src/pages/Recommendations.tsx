import { Lightbulb, ArrowDownRight } from "lucide-react";
import PageHeader from "../components/PageHeader";

const recommendations = [
  {
    title: "Optimize HVAC Scheduling",
    description: "Adjust heating and cooling schedules during non-working hours.",
    savings: "15%",
    priority: "High",
  },
  {
    title: "Improve Lighting Efficiency",
    description: "Replace older lighting systems with energy-efficient alternatives.",
    savings: "10%",
    priority: "Medium",
  },
  {
    title: "Monitor Peak Consumption",
    description: "Reduce unnecessary electricity usage during peak hours.",
    savings: "8%",
    priority: "Medium",
  },
];

const Recommendations = () => {
  return (
    <div>
      <PageHeader
        title="AI Recommendations"
        description="Discover opportunities to optimize energy usage."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {recommendations.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg bg-yellow-100 p-3 text-yellow-700">
                <Lightbulb size={23} />
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                {item.priority} Priority
              </span>
            </div>

            <h3 className="font-semibold text-gray-900">{item.title}</h3>
            <p className="mt-2 text-sm text-gray-500">{item.description}</p>

            <div className="mt-5 flex items-center gap-2 text-green-700">
              <ArrowDownRight size={20} />
              <span className="font-bold">{item.savings} potential savings</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;