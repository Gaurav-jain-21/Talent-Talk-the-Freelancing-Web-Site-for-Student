import { companyApi } from "../api/services";
import { asArray, pick } from "./format";

export async function loadCompanyApplicationGroups(companyId) {
  const jobs = asArray(await companyApi.jobs(companyId));
  const groups = await Promise.all(
    jobs.map(async (job) => {
      const jobId = pick(job, ["id", "jobId"]);
      const applicants = jobId ? asArray(await companyApi.applicants(jobId)) : [];
      return { job, jobId, applicants };
    }),
  );
  return groups;
}

export function flattenCompanyApplications(groups = []) {
  return groups.flatMap(({ job, jobId, applicants }) =>
    applicants.map((application) => ({
      application,
      job,
      jobId,
      applicationId: pick(application, ["applicationId", "id"]),
    })),
  );
}
