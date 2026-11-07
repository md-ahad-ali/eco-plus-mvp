import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface ChartCardProps {
  title: string;
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  unit?: string;
  color?: string;
}

const ChartCard = ({ title, data, xKey, yKey, unit = "kWh", color = "#16a34a" }: ChartCardProps) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold text-gray-800">{title}</h3>

      {data.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">No data for this period.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} minTickGap={24} />
            <YAxis tick={{ fontSize: 12 }} unit={` ${unit}`} width={80} />
            <Tooltip formatter={(v) => [`${v} ${unit}`, "Value"]} />
            <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={3} dot={data.length < 40} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ChartCard;
