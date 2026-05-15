import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { adminApi } from "../../api/services";
import { EmptyState, GlassCard, SearchBox, StatusBadge } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { asArray, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function ManageStudents() {
  const [query, setQuery] = useState("");
  const result = useAsync(() => adminApi.students(), []);
  const students = asArray(result.data);
  const filtered = useMemo(() => students.filter((student) => JSON.stringify(student).toLowerCase().includes(query.toLowerCase())), [query, students]);

  return (
    <Page className="space-y-6">
      <h2 className="text-4xl font-black gradient-text">Manage Students</h2>
      <SearchBox value={query} onChange={setQuery} placeholder="Search students" />
      {filtered.length ? (
        <GlassCard hover={false} className="overflow-hidden">
          {filtered.map((student) => (
            <div key={pick(student, ["userId", "id"])} className="grid gap-3 border-b border-white/10 p-4 hover:bg-cyan-400/5 md:grid-cols-[1fr_1fr_auto]">
              <div>
                <p className="font-bold text-white">{pick(student, ["fullName", "name"], "Student")}</p>
                <p className="text-sm text-slate-500">{pick(student, ["email"], "")}</p>
              </div>
              <p className="text-sm text-slate-400">{pick(student, ["college"], "")}</p>
              <StatusBadge status={pick(student, ["status"], "ACTIVE")} />
            </div>
          ))}
        </GlassCard>
      ) : (
        <EmptyState icon={Users} title="No students found" message="The admin API returned no matching students." />
      )}
    </Page>
  );
}
