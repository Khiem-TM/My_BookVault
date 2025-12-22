import { useEffect, useState } from "react";
import { api } from "../../services/apiClient";

export default function AdminCommunity() {
  const [data, setData] = useState<any>();
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-200 to-purple-200" />
        <div>
          <div className="text-xl font-semibold">
            {data?.username || "Admin"}
          </div>
          <div className="text-gray-600">{data?.email}</div>
        </div>
      </div>
    </section>
  );
}
