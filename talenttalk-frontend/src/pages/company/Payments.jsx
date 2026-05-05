import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getCompanyPayments, createOrder } from "../../api/paymentApi";
import { useAuth } from "../../context/AuthContext";

const CompanyPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({
    jobId: "",
    studentId: "",
    amount: "",
  });

  useEffect(() => {
    getCompanyPayments(user.userId).then((res) => setPayments(res.data));
  }, []);

  const handlePay = async () => {
    try {
      const res = await createOrder({
        companyId: parseInt(user.userId),
        jobId: parseInt(form.jobId),
        studentId: parseInt(form.studentId),
        amount: parseFloat(form.amount),
      });
      alert(`Order created! Razorpay Order ID: ${res.data.razorpayOrderId}`);
      setPayments([...payments, res.data]);
    } catch (err) {
      alert(err.response?.data || "Payment failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Payments</h1>

        {/* Create Payment */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold mb-4">Make Payment</h2>
          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder="Job ID"
              value={form.jobId}
              onChange={(e) =>
                setForm({
                  ...form,
                  jobId: e.target.value,
                })
              }
              className="border rounded px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              placeholder="Student ID"
              value={form.studentId}
              onChange={(e) =>
                setForm({
                  ...form,
                  studentId: e.target.value,
                })
              }
              className="border rounded px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              placeholder="Amount (₹)"
              value={form.amount}
              onChange={(e) =>
                setForm({
                  ...form,
                  amount: e.target.value,
                })
              }
              className="border rounded px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            onClick={handlePay}
            className="mt-3 bg-green-600 hover:bg-green-700
              text-white px-6 py-2 rounded-lg text-sm"
          >
            Create Payment Order
          </button>
        </div>

        {/* Payment History */}
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-xl shadow p-4
                flex justify-between items-center"
            >
              <div>
                <p className="font-medium">₹{payment.amount}</p>
                <p className="text-sm text-gray-500">
                  Student ID: {payment.studentId} • Job ID: {payment.jobId}
                </p>
                <p className="text-xs text-gray-400">
                  {payment.razorpayOrderId}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
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
      </div>
    </div>
  );
};

export default CompanyPayments;
