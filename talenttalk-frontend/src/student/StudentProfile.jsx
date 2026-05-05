import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { getProfile, updateProfile, uploadResume, addProject, getProjects } from '../../api/studentApi'
import { useAuth } from '../../context/AuthContext'

const StudentProfile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [resumeFile, setResumeFile] = useState(null)
  const [message, setMessage] = useState('')
  const [newProject, setNewProject] = useState({
    title: '', description: '', techStack: '', projectUrl: ''
  })

  useEffect(() => {
    getProfile(user.userId).then(res => {
      setProfile(res.data)
      setForm(res.data)
    }).catch(() => setEditing(true))

    getProjects(user.userId).then(res => setProjects(res.data))
  }, [])

  const handleSave = async () => {
    try {
      const res = await updateProfile(user.userId, form)
      setProfile(res.data)
      setEditing(false)
      setMessage('Profile updated!')
    } catch {
      setMessage('Failed to update profile')
    }
  }

  const handleResumeUpload = async () => {
    if (!resumeFile) return
    try {
      const res = await uploadResume(user.userId, resumeFile)
      setMessage('Resume uploaded successfully!')
      setProfile({ ...profile, resumeUrl: res.data })
    } catch {
      setMessage('Resume upload failed')
    }
  }

  const handleAddProject = async () => {
    try {
      const res = await addProject(user.userId, newProject)
      setProjects([...projects, res.data])
      setNewProject({
        title: '', description: '', techStack: '', projectUrl: ''
      })
      setMessage('Project added!')
    } catch {
      setMessage('Failed to add project')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            My Profile
          </h1>
          <button
            onClick={() => setEditing(!editing)}
            className="bg-blue-600 hover:bg-blue-700
              text-white px-4 py-2 rounded-lg text-sm">
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {message && (
          <div className="bg-green-100 text-green-700 p-3
            rounded mb-4 text-sm">
            {message}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Full Name', key: 'fullName' },
              { label: 'Email', key: 'email' },
              { label: 'Phone', key: 'phone' },
              { label: 'College', key: 'college' },
              { label: 'Degree', key: 'degree' },
              { label: 'Graduation Year', key: 'graduationYear' },
              { label: 'GitHub URL', key: 'githubUrl' },
              { label: 'LinkedIn URL', key: 'linkedinUrl' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm text-gray-500 mb-1">
                  {label}
                </label>
                {editing ? (
                  <input
                    value={form[key] || ''}
                    onChange={(e) => setForm({
                      ...form, [key]: e.target.value
                    })}
                    className="w-full border rounded px-3 py-2
                      text-sm focus:outline-none focus:ring-2
                      focus:ring-blue-400"
                  />
                ) : (
                  <p className="text-gray-800">
                    {profile?.[key] || '—'}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-500 mb-1">
              Bio
            </label>
            {editing ? (
              <textarea
                value={form.bio || ''}
                onChange={(e) => setForm({
                  ...form, bio: e.target.value
                })}
                rows={3}
                className="w-full border rounded px-3 py-2
                  text-sm focus:outline-none focus:ring-2
                  focus:ring-blue-400"
              />
            ) : (
              <p className="text-gray-800">{profile?.bio || '—'}</p>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-500 mb-1">
              Skills (comma separated)
            </label>
            {editing ? (
              <input
                value={form.skills || ''}
                onChange={(e) => setForm({
                  ...form, skills: e.target.value
                })}
                className="w-full border rounded px-3 py-2
                  text-sm focus:outline-none focus:ring-2
                  focus:ring-blue-400"
              />
            ) : (
              <div className="flex flex-wrap gap-2 mt-1">
                {profile?.skills?.split(',').map((s, i) => (
                  <span key={i}
                    className="bg-blue-100 text-blue-700
                      px-2 py-1 rounded text-xs">
                    {s.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {editing && (
            <button
              onClick={handleSave}
              className="mt-4 bg-green-600 hover:bg-green-700
                text-white px-6 py-2 rounded-lg text-sm">
              Save Changes
            </button>
          )}
        </div>

        {/* Resume Upload */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">
            Resume
          </h2>
          {profile?.resumeUrl && (
            <a href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm mb-3 block">
              View Current Resume
            </a>
          )}
          <div className="flex gap-3">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="text-sm"
            />
            <button
              onClick={handleResumeUpload}
              disabled={!resumeFile}
              className="bg-blue-600 hover:bg-blue-700
                text-white px-4 py-2 rounded text-sm
                disabled:opacity-50">
              Upload
            </button>
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4">
            Projects
          </h2>
          {projects.map(project => (
            <div key={project.id}
              className="border rounded-lg p-4 mb-3">
              <h3 className="font-medium">{project.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {project.description}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tech: {project.techStack}
              </p>
              {project.projectUrl && (
                <a href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-xs hover:underline">
                  View Project
                </a>
              )}
            </div>
          ))}

          {/* Add new project */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Add New Project
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { placeholder: 'Project Title', key: 'title' },
                { placeholder: 'Tech Stack', key: 'techStack' },
                { placeholder: 'Project URL', key: 'projectUrl' },
              ].map(({ placeholder, key }) => (
                <input
                  key={key}
                  placeholder={placeholder}
                  value={newProject[key]}
                  onChange={(e) => setNewProject({
                    ...newProject, [key]: e.target.value
                  })}
                  className="border rounded px-3 py-2 text-sm
                    focus:outline-none focus:ring-2
                    focus:ring-blue-400"
                />
              ))}
              <textarea
                placeholder="Description"
                value={newProject.description}
                onChange={(e) => setNewProject({
                  ...newProject, description: e.target.value
                })}
                className="border rounded px-3 py-2 text-sm
                  col-span-2 focus:outline-none focus:ring-2
                  focus:ring-blue-400"
                rows={2}
              />
            </div>
            <button
              onClick={handleAddProject}
              className="mt-3 bg-blue-600 hover:bg-blue-700
                text-white px-4 py-2 rounded text-sm">
              Add Project
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentProfile