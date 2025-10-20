import { useEffect, useState } from "react";
import { getReports } from "../services/api";

export default function ReportList({ token, siteId }) {
  const [reports, setReports] = useState([]);
  useEffect(() => {
    getReports(siteId, token).then(setReports);
  }, [siteId, token]);

  return (
    <div>
      <h2 className="text-xl mb-2">Reports</h2>
      <ul>
        {reports.map(r => (
          <li key={r.id}>
            <a href={`/reports/${r.file_name}`} target="_blank">{r.file_name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
