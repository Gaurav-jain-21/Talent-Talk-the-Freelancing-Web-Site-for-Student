import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getAllCompanies } from "../../api/adminApi";

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    getAllCompanies().then((res) => setCompanies(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Manage Companies ({companies.length})
        </h1>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Industry</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Size</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.companyName}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.industry}</td>
                  <td className="px-4 py-3 text-gray-600">{c.location}</td>
                  <td className="px-4 py-3 text-gray-600">{c.companySize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageCompanies;
