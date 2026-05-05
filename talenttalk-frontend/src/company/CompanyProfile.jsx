import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getProfile, updateProfile, createProfile } from "../../api/companyApi";
import { useAuth } from "../../context/AuthContext";

const CompanyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({
    userId: user.userId,
    companyName: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    location: "",
    description: "",
    companySize: "",
    foundedYear: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    getProfile(user.userId)
      .then((res) => {
        setProfile(res.data);
        setForm(res.data);
      })
      .catch(() => {
        setIsNew(true);
        setEditing(true);
      });
  }, []);

  const handleSave = async () => {
    try {
      if (isNew) {
        const res = await createProfile(form);
        setProfile(res.data);
        setIsNew(false);
      } else {
        const res = await updateProfile(user.userId, form);
        setProfile(res.data);
      }
      setEditing(false);
      setMessage("Profile saved!");
    } catch {
      setMessage("Failed to save profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Company Profile</h1>
          {!isNew && (
            <button
              onClick={() => setEditing(!editing)}
              className="bg-blue-600 hover:bg-blue-700
                text-white px-4 py-2 rounded-lg text-sm"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          )}
        </div>

        {message && (
          <div
            className="bg-green-100 text-green-700 p-3
            rounded mb-4 text-sm"
          >
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Company Name", key: "companyName" },
              { label: "Email", key: "email" },
              { label: "Phone", key: "phone" },
              { label: "Website", key: "website" },
              { label: "Industry", key: "industry" },
              { label: "Location", key: "location" },
              { label: "Company Size", key: "companySize" },
              { label: "Founded Year", key: "foundedYear" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm text-gray-500 mb-1">
                  {label}
                </label>
                {editing ? (
                  <input
                    value={form[key] || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [key]: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2
                      text-sm focus:outline-none focus:ring-2
                      focus:ring-blue-400"
                  />
                ) : (
                  <p className="text-gray-800">{profile?.[key] || "—"}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-500 mb-1">
              Description
            </label>
            {editing ? (
              <textarea
                value={form.description || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full border rounded px-3 py-2
                  text-sm focus:outline-none focus:ring-2
                  focus:ring-blue-400"
              />
            ) : (
              <p className="text-gray-800">{profile?.description || "—"}</p>
            )}
          </div>

          {editing && (
            <button
              onClick={handleSave}
              className="mt-4 bg-green-600 hover:bg-green-700
                text-white px-6 py-2 rounded-lg text-sm"
            >
              Save Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
