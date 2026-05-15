import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { companyApi } from "../../api/services";
import { Badge, EmptyState, GlassCard, GradientButton, SearchBox } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { asArray, initials, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function StudentList() {
  const [query, setQuery] = useState("");
  const result = useAsync(() => companyApi.students(), []);
  const students = asArray(result.data);
  const filtered = useMemo(() => students.filter((student) => JSON.stringify(student).toLowerCase().includes(query.toLowerCase())), [query, students]);

  return (
    <Page className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
        <h2 className="text-4xl font-black gradient-text">Student talent pool</h2>
        <div className="mt-6"><SearchBox value={query} onChange={setQuery} placeholder="Search by name, college, degree, skill" /></div>
      </section>
      {filtered.length ? (
        <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((student) => (
            <GlassCard key={pick(student, ["userId", "id"])} className="p-5">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-xl font-black">{initials(pick(student, ["fullName", "name"]))}</div>
                <div>
                  <h3 className="text-xl font-black text-white">{pick(student, ["fullName", "name"], "Student")}</h3>
                  <p className="text-sm text-slate-400">{pick(student, ["college"], "")}</p>
                  <p className="text-xs text-slate-500">{pick(student, ["degree"], "")}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {asArray(pick(student, ["skills"], [])).slice(0, 6).map((skill) => <Badge key={skill} tone="cyan">{skill}</Badge>)}
              </div>
              <Badge tone="green" className="mt-5">{pick(student, ["workStatus"], "Open to work")}</Badge>
              <Link to={`/company/students/${pick(student, ["userId", "id"])}`}>
                <GradientButton className="mt-6 w-full">View Profile</GradientButton>
              </Link>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState icon={Users} title="No students found" message="Try a different search term or wait for students to complete profiles." />
      )}
    </Page>
  );
}
