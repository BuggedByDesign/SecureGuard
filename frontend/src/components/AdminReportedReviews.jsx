import React, { useEffect, useState } from "react";

export default function AdminReportedReviews() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Няма токен за автентикация");
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/api/admin/reported-reviews", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.message || "Грешка при зареждане на доклади");
        }
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error fetching reports:", err);
        setError(err.message);
      }
    };
    fetchReports();
  }, []);

 const handleDelete = async (reportId) => {
  if (!window.confirm("Наистина ли искате да изтриете това ревю?"))
    return;
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`http://localhost:5000/api/admin/reviews/${reportId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Неуспешно изтриване");
    setReports(prev => prev.filter(r => r.ReportID !== reportId));
  } catch (err) {
    console.error("❌ Error deleting report:", err);
    alert("Грешка при изтриване");
  }
};


  if (error) {
    return <div className="text-center text-red-500 mt-6">Грешка: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-10 w-full max-w-6xl text-black">
      <h3 className="text-lg font-semibold text-center text-red-600 mb-6">Докладвани ревюта</h3>
      {reports.length === 0 ? (
        <p className="text-center text-gray-500">Няма доклади.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-4 py-2">ID ревю</th>
                <th className="px-4 py-2">Продукт</th>
                <th className="px-4 py-2">Докладван от</th>
                <th className="px-4 py-2">Причина</th>
                <th className="px-4 py-2">Ревю</th>
                <th className="px-4 py-2">Дата</th>
                <th className="px-4 py-2">Действие</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.ReportID} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{r.ReviewID}</td>
                  <td className="px-4 py-2">{r.ProductName}</td>
                  <td className="px-4 py-2">{r.ReportedByName}</td>
                  <td className="px-4 py-2">{r.Reason}</td>
                  <td className="px-4 py-2 italic">{r.ReviewText}</td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(r.ReportedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDelete(r.ReportID)}
                      className="text-red-600 hover:underline"
                    >
                      Изтрий
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
