const supabaseClient = supabase.createClient(window.MFG_SUPABASE_URL, window.MFG_SUPABASE_ANON_KEY);
const form = document.getElementById("driverForm");
const submitBtn = document.getElementById("submitBtn");
const formMessage = document.getElementById("formMessage");
const successOverlay = document.getElementById("successOverlay");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "";

  if (window.MFG_SUPABASE_URL.includes("PASTE_") || window.MFG_SUPABASE_ANON_KEY.includes("PASTE_")) {
    formMessage.textContent = "Supabase is not configured yet.";
    return;
  }

  const data = new FormData(form);
  const payload = {
    company_carrier: String(data.get("company_carrier") || "").trim(),
    driver_name: String(data.get("driver_name") || "").trim(),
    rego: String(data.get("rego") || "").trim().toUpperCase(),
    movement_type: data.get("movement_type"),
    quantity: Number(data.get("quantity")),
    load_type: data.get("load_type"),
    reference_no: String(data.get("reference_no") || "").trim() || null,
    declaration_accepted: data.get("declaration_accepted") === "on",
    source: "manual_web"
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";

  const { error } = await supabaseClient.from("driver_signins").insert(payload);

  if (error) {
    console.error(error);
    formMessage.textContent = "Unable to submit. Please ask a coordinator for assistance.";
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Sign-In";
    return;
  }

  form.reset();
  successOverlay.hidden = false;
  setTimeout(() => { window.location.href = "index.html"; }, 5000);
});
