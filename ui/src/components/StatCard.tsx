import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="rounded-lg bg-green-100 p-2 text-green-700">
          <Icon size={21} />
        </div>
      </div>

      <h2 className="mt-4 text-2xl font-bold text-gray-900">{value}</h2>
      <p className="mt-2 text-xs text-gray-500">{description}</p>
    </div>
  );
};

export default StatCard;