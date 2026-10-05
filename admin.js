const supabaseClient = supabase.createClient(window.MFG_SUPABASE_URL, window.MFG_SUPABASE_ANON_KEY);
const loginPanel = document.getElementById("loginPanel");
const recordsPanel = document.getElementById("recordsPanel");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const recordsBody = document.getElementById("recordsBody");
const recordsMessage = document.getElementById("recordsMessage");
const fromDate = document.getElementById("fromDate");
const toDate = document.getElementById("toDate");
let currentRows = [];

function fmtDate(value) {
  return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function escapeCsv(value) {
  const s = value == null ? "" : String(value);
  return `"${s.replaceAll('"', '""')}"`;
}
function renderRows(rows) {
  recordsBody.innerHTML = "";
  if (!rows.length) {
    recordsBody.innerHTML = `<tr><td colspan="9">No records found.</td></tr>`;
    return;
  }
  for (const row of rows) {
    const tr = document.createElement("tr");
    const cells = [fmtDate(row.created_at), row.company_carrier, row.driver_name, row.rego, row.movement_type, row.quantity, row.load_type, row.reference_no || "", row.declaration_accepted ? "Yes" : "No"];
    for (const value of cells) {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    }
    recordsBody.appendChild(tr);
  }
}
async function loadRecords() {
  recordsMessage.textContent = "Loading…";
  let query = supabaseClient.from("driver_signins").select("*").order("created_at", { ascending: false });
  if (fromDate.value) query = query.gte("created_at", `${fromDate.value}T00:00:00`);
  if (toDate.value) query = query.lte("created_at", `${toDate.value}T23:59:59`);
  const { data, error } = await query;
  if (error) {
    console.error(error);
    recordsMessage.textContent = "Unable to load records.";
    currentRows = [];
    renderRows([]);
    return;
  }
  currentRows = data || [];
  renderRows(currentRows);
  recordsMessage.textContent = `${currentRows.length} record(s)`;
}
async function refreshSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    loginPanel.hidden = true;
    recordsPanel.hidden = false;
    await loadRecords();
  } else {
    loginPanel.hidden = false;
    recordsPanel.hidden = true;
  }
}
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "";
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    loginMessage.textContent = "Sign-in failed.";
    return;
  }
  await refreshSession();
});
document.getElementById("filterBtn").addEventListener("click", loadRecords);
document.getElementById("signOutBtn").addEventListener("click", async () => { await supabaseClient.auth.signOut(); await refreshSession(); });
document.getElementById("exportBtn").addEventListener("click", () => {
  if (!currentRows.length) return;
  const header = ["Date / Time","Company / Carrier","Driver Name","Rego","Purpose","Quantity","Load Type","Reference No.","Declaration Accepted"];
  const lines = [header.map(escapeCsv).join(",")];
  for (const row of currentRows) {
    lines.push([fmtDate(row.created_at),row.company_carrier,row.driver_name,row.rego,row.movement_type,row.quantity,row.load_type,row.reference_no || "",row.declaration_accepted ? "Yes" : "No"].map(escapeCsv).join(","));
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mfg-driver-signins-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});
supabaseClient.auth.onAuthStateChange(() => refreshSession());
refreshSession();
