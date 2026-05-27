import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Building2, Trash2 } from "lucide-react";
import { adminApi } from "../../api/services";
import { Badge, EmptyState, GhostButton, GlassCard, GradientButton, Modal, SearchBox } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { asArray, errorMessage, formatDate, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function ManageCompanies() {
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState(null);
  const result = useAsync(() => adminApi.companies(), []);
  const companies = asArray(result.data);
  const filtered = useMemo(() => companies.filter((company) => JSON.stringify(company).toLowerCase().includes(query.toLowerCase())), [companies, query]);

  async function removeCompany() {
    try {
      await adminApi.deleteCompany(pick(target, ["userId", "id"]));
      toast.success("Company deleted");
      setTarget(null);
      result.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <Page className="space-y-6">
      <h2 className="text-4xl font-black gradient-text">Manage Companies</h2>
      <SearchBox value={query} onChange={setQuery} placeholder="Search companies" />
      {filtered.length ? (
        <GlassCard hover={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-5 py-4">Company</th><th className="px-5 py-4">Industry</th><th className="px-5 py-4">Location</th><th className="px-5 py-4">Size</th><th className="px-5 py-4">Joined</th><th className="px-5 py-4 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((company) => (
                  <tr key={pick(company, ["userId", "id"])} className="hover:bg-cyan-400/5">
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">{pick(company, ["companyName", "name"], "Company")}</p>
                      <p className="text-sm text-slate-500">{pick(company, ["email"], "")}</p>
                      {pick(company, ["profileCompleted"], false) !== true && (
                        <Badge tone="yellow" className="mt-2">Profile pending</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-300">{pick(company, ["industry"], "Not added")}</td>
                    <td className="px-5 py-4 text-slate-400">{pick(company, ["location"], "Not added")}</td>
                    <td className="px-5 py-4 text-slate-400">{pick(company, ["companySize"], "Not added")}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{formatDate(pick(company, ["createdAt"]))}</td>
                    <td className="px-5 py-4 text-right"><GhostButton className="border-rose-400/25 text-rose-100" onClick={() => setTarget(company)}><Trash2 className="h-4 w-4" /> Delete</GhostButton></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        <EmptyState icon={Building2} title="No companies found" message="Company profiles from the database appear here." />
      )}
      {target && (
        <Modal title="Delete company?" onClose={() => setTarget(null)}>
          <p className="text-slate-400">This deletes the company profile from the database.</p>
          <div className="mt-6 flex justify-end gap-3"><GhostButton onClick={() => setTarget(null)}>Cancel</GhostButton><GradientButton onClick={removeCompany}>Delete</GradientButton></div>
        </Modal>
      )}
    </Page>
  );
}
