import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getStudentPayments } from "../../api/paymentApi";
import { useAuth } from "../../context/AuthContext";

const StudentPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    getStudentPayments(user.userId).then((res) => setPayments(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Payment History
        </h1>
        {payments.length === 0 ? (
          <p className="text-center text-gray-500">No payments yet</p>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-xl shadow p-6
                  flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">₹{payment.amount}</p>
                  <p className="text-sm text-gray-500">
                    Job ID: {payment.jobId}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full
                  text-sm font-medium ${
                    payment.status === "SUCCESS"
                      ? "bg-green-100 text-green-700"
                      : payment.status === "FAILED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPayments;
