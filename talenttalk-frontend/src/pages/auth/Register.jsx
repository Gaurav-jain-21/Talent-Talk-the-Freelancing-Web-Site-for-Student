import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../api/authApi";
import { getErrorMessage } from "../../utils/errorMessage";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
      setSuccess("Registered successfully! Please check your email to verify.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-100 flex
      items-center justify-center"
    >
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2
          className="text-2xl font-bold text-center
          text-blue-600 mb-6"
        >
          Create Account
        </h2>

        {error && (
          <div
            className="bg-red-100 text-red-600 p-3
            rounded mb-4 text-sm"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="bg-green-100 text-green-600 p-3
            rounded mb-4 text-sm"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium
              text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2
                focus:outline-none focus:ring-2
                focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium
              text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2
                focus:outline-none focus:ring-2
                focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium
              text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2
                focus:outline-none focus:ring-2
                focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium
              text-gray-700 mb-1"
            >
              Register as
            </label>
            <select
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2
                focus:outline-none focus:ring-2
                focus:ring-blue-400"
            >
              <option value="STUDENT">Student</option>
              <option value="COMPANY">Company</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700
              text-white py-2 rounded-lg font-medium
              disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
