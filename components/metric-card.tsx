import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  description: string;
  value: number | null;
  unit: string;
  todayValue: number | null;
  todayUnit: string;
}

export function MetricCard({
  title,
  description,
  value,
  unit,
  todayValue,
  todayUnit,
}: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden border-2 border-emerald-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 bg-gradient-to-br from-white to-emerald-50">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-20 -mr-16 -mt-16" />
      <div className="relative flex justify-between items-center">
        <div>
          <div className="text-xl font-bold text-gray-700 mb-2">{title}</div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              {value || "0"}
            </span>
            <span className="text-2xl font-bold text-gray-700">{unit}</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200">
              今日{" "}
              <span>
                {todayValue && todayValue > 0 ? "+" : ""}
                {todayValue || "0"}
              </span>
              <span>{todayUnit}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
