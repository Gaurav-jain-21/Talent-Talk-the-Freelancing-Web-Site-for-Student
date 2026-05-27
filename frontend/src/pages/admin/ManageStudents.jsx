import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Trash2, Users } from "lucide-react";
import { adminApi } from "../../api/services";
import { EmptyState, GhostButton, GlassCard, GradientButton, Modal, SearchBox, StatusBadge } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { asArray, errorMessage, formatDate, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function ManageStudents() {
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState(null);
  const result = useAsync(() => adminApi.students(), []);
  const students = asArray(result.data);
  const filtered = useMemo(() => students.filter((student) => JSON.stringify(student).toLowerCase().includes(query.toLowerCase())), [query, students]);

  async function removeStudent() {
    try {
      await adminApi.deleteStudent(pick(target, ["userId", "id"]));
      toast.success("Student deleted");
      setTarget(null);
      result.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <Page className="space-y-6">
      <h2 className="text-4xl font-black gradient-text">Manage Students</h2>
      <SearchBox value={query} onChange={setQuery} placeholder="Search students" />
      {filtered.length ? (
        <GlassCard hover={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-5 py-4">Student</th><th className="px-5 py-4">College</th><th className="px-5 py-4">Skills</th><th className="px-5 py-4">Joined</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((student) => (
                  <tr key={pick(student, ["userId", "id"])} className="hover:bg-cyan-400/5">
                    <td className="px-5 py-4"><p className="font-bold text-white">{pick(student, ["fullName", "name"], "Student")}</p><p className="text-sm text-slate-500">{pick(student, ["email"], "")}</p></td>
                    <td className="px-5 py-4 text-slate-300">{pick(student, ["college"], "Not added")}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{pick(student, ["skills"], "Not added")}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{formatDate(pick(student, ["createdAt"]))}</td>
                    <td className="px-5 py-4"><StatusBadge status={pick(student, ["status", "workStatus"], "ACTIVE")} /></td>
                    <td className="px-5 py-4 text-right"><GhostButton className="border-rose-400/25 text-rose-100" onClick={() => setTarget(student)}><Trash2 className="h-4 w-4" /> Delete</GhostButton></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        <EmptyState icon={Users} title="No students found" message="The admin API returned no matching students." />
      )}
      {target && (
        <Modal title="Delete student?" onClose={() => setTarget(null)}>
          <p className="text-slate-400">This deletes the student profile and related projects from the database.</p>
          <div className="mt-6 flex justify-end gap-3"><GhostButton onClick={() => setTarget(null)}>Cancel</GhostButton><GradientButton onClick={removeStudent}>Delete</GradientButton></div>
        </Modal>
      )}
    </Page>
  );
}
