const { useEffect, useMemo, useState } = React;
const { SelectMenu, HacFileUpload, HacModal } = window.SharedShell;

const {
  PLANS,
  PARTNERS,
  ORGANIZATIONS,
  fmtRM,
  fmtDate,
  addDays,
  deepClone,
  planById,
} = window.HOST_ORG;

const TAB_ITEMS = [
  { key: "detail", label: "Organization Detail" },
  { key: "subscription", label: "Subscription" },
  { key: "partners", label: "Partner Assignment" },
];

const PLAN_OPTIONS = PLANS.map((plan) => ({ value: plan.id, label: plan.name }));
const UPCOMING_PLAN_OPTIONS = PLAN_OPTIONS.filter((option) => option.value !== "plan-free");
const PAYMENT_METHODS = ["Bank transfer", "Credit card", "Online banking", "Cheque"];
const STATUS_OPTIONS = ["Active", "Inactive"];

function makeEmptyOrg() {
  return {
    id: `NEW-${Date.now()}`,
    orgCode: "",
    organizationName: "",
    regNo: "",
    tinNo: "",
    country: "Malaysia",
    state: "",
    city: "",
    address: "",
    postCode: "",
    pic: { name: "", phone: "", email: "" },
    companyEmails: [],
    companyEmailDraft: "",
    orgFiles: [],
    subscription: {
      current: {
        planId: "plan-free",
        tierId: "",
        startDate: "",
        managedVehicleNumber: 0,
        paymentSettings: false,
        amount: 0,
        paymentMethod: "",
        paymentDate: "",
        remarks: "",
        trialStartDate: "",
        trialDuration: 30,
        files: [],
      },
      upcoming: null,
    },
    partners: [],
    joinDate: "2026-07-13",
    status: "Active",
  };
}

function isTrialSelection(sub) {
  return !!selectedTier(sub)?.isTrial;
}

function selectedTier(sub) {
  return planById(sub.planId).tiers.find((tier) => tier.id === sub.tierId);
}

function trialDurationDays(sub) {
  const tier = selectedTier(sub);
  return Number(tier?.trialDurationDays || sub.trialDuration || 0);
}

function trialStartDate(sub) {
  return sub.trialStartDate || sub.startDate;
}

function trialDurationLabel(sub) {
  const tier = selectedTier(sub);
  if (tier?.label) return tier.label.replace(/^Trial\s*/i, "");
  const days = trialDurationDays(sub);
  return days ? `${days} days` : "-";
}

function tierOptions(planId) {
  return planById(planId).tiers.map((tier) => ({ value: tier.id, label: tier.label }));
}

function planLimitLabel(plan) {
  if (plan.limit == null) return "Unlimited";
  return String(plan.limit);
}

function subscriptionExpiryCopy(org) {
  const current = org.subscription.current;
  const plan = planById(current.planId);
  const trial = isTrialSelection(current);
  if (trial && current.trialStartDate && trialDurationDays(current)) {
    return `Exp. in ${Math.max(0, Math.ceil((new Date(addDays(current.trialStartDate, trialDurationDays(current))) - new Date("2026-07-13")) / 86400000))} days`;
  }
  if (plan.limit == null) return "Unlimited";
  if (/^exp/i.test(current.remarks || "")) return current.remarks.replace(/^EXP/, "Exp.");
  return `${current.managedVehicleNumber || 0}/${plan.limit}`;
}

function subscriptionMetaTone(copy) {
  return /^Exp\./i.test(copy) ? "attention" : "neutral";
}

function validateOrg(org, options = {}) {
  const errors = {};
  const detailFields = [
    ["organizationName", "Organization Name is required."],
    ["regNo", "Organization Reg No. is required."],
    ["tinNo", "TIN No. is required."],
    ["country", "Country is required."],
    ["state", "State is required."],
    ["city", "City is required."],
    ["address", "Address is required."],
    ["postCode", "Post Code is required."],
  ];
  detailFields.forEach(([field, message]) => {
    if (!String(org[field] || "").trim()) errors[field] = message;
  });
  if (!String(org.pic.name || "").trim()) errors.picName = "PIC Name is required.";
  if (!String(org.pic.phone || "").trim()) errors.picPhone = "PIC Phone is required.";
  if (!String(org.pic.email || "").trim()) errors.picEmail = "PIC Email is required.";

  if (!options.skipSubscription) {
    validateSubscription(org.subscription.current, errors, "current");
    if (org.subscription.upcoming) validateSubscription(org.subscription.upcoming, errors, "upcoming");

    if (org.subscription.upcoming && org.subscription.upcoming.planId === org.subscription.current.planId) {
      errors.upcomingDuplicate = "Duplicate active plan blocked. Choose a different upcoming plan.";
    }
  }

  if (options.requireNameOnly && errors.organizationName) return { organizationName: errors.organizationName };
  return errors;
}

function validateSubscription(sub, errors, prefix) {
  const plan = planById(sub.planId);
  const isTrial = isTrialSelection(sub);
  if (!sub.planId) errors[`${prefix}PlanId`] = "Plan Name is required.";
  if (plan.type !== "default" && plan.tiers.length && !sub.tierId) errors[`${prefix}TierId`] = "Duration / Tier is required.";
  if (!sub.startDate) errors[`${prefix}StartDate`] = "Start Date is required.";

  const vehicleNumber = Number(sub.managedVehicleNumber);
  if (!Number.isInteger(vehicleNumber)) errors[`${prefix}ManagedVehicleNumber`] = "Managed Vehicle Number must be an integer.";
  if (plan.id === "plan-free" && vehicleNumber !== 0) errors[`${prefix}ManagedVehicleNumber`] = "Free plan defaults to 0 managed vehicles.";
  if (plan.id !== "plan-free" && (sub.managedVehicleNumber === "" || vehicleNumber < 1)) {
    errors[`${prefix}ManagedVehicleNumber`] = "Managed Vehicle Number is required for paid and trial plans.";
  }
  if (plan.limit != null && vehicleNumber > Number(plan.limit)) {
    errors[`${prefix}ManagedVehicleNumber`] = `Managed Vehicle Number cannot exceed ${plan.limit} for ${plan.name}.`;
  }

  if (isTrial) {
    if (!trialDurationDays(sub)) errors[`${prefix}TrialDuration`] = "Trial Duration is required.";
    return;
  }

  if (plan.id !== "plan-free" && sub.paymentSettings) {
    if (sub.amount === "" || Number(sub.amount) < 0) errors[`${prefix}Amount`] = "Amount is required.";
    if (!sub.paymentMethod) errors[`${prefix}PaymentMethod`] = "Payment Method is required.";
    if (!sub.paymentDate) errors[`${prefix}PaymentDate`] = "Payment Date is required.";
  }
}

function updateAtPath(source, path, value) {
  const next = { ...source };
  const parts = path.split(".");
  let cursor = next;
  for (let i = 0; i < parts.length - 1; i += 1) {
    cursor[parts[i]] = { ...cursor[parts[i]] };
    cursor = cursor[parts[i]];
  }
  cursor[parts[parts.length - 1]] = value;
  return next;
}

function ActionBanner({ flash, onDismiss }) {
  if (!flash) return null;
  return (
    <div className={`horg-alert ${flash.tone || "info"}`}>
      <span>{flash.message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss"><HIcon name="close" size={16} /></button>
    </div>
  );
}

function StatusPill({ status }) {
  return <span className={`horg-status ${String(status).toLowerCase()}`}>{status}</span>;
}

function RowMenu({ onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = () => setOpen(false);
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [open]);
  return (
    <div className="horg-row-menu" onClick={(e) => e.stopPropagation()}>
      <button className="ml-icon-btn" type="button" aria-label="Open actions" onClick={() => setOpen((value) => !value)}>
        <HIcon name="more_horiz" size={21} />
      </button>
      {open && (
        <div className="horg-menu-pop">
          <button type="button" onClick={onView}><HIcon name="visibility" size={15} /> View</button>
          <button type="button" onClick={onEdit}><HIcon name="edit" size={15} /> Edit</button>
          <button type="button" className="danger" onClick={onDelete}><HIcon name="delete" size={15} /> Delete</button>
        </div>
      )}
    </div>
  );
}

function OrgListView({ orgs, onCreate, onView, onEdit, onDelete }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [plan, setPlan] = useState("All plans");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orgs.filter((org) => {
      const currentPlan = planById(org.subscription.current.planId);
      const textMatch = !q || [org.organizationName, org.orgCode, String(org.id), org.pic.name, org.pic.email]
        .some((value) => String(value || "").toLowerCase().includes(q));
      const statusMatch = status === "All statuses" || org.status === status;
      const planMatch = plan === "All plans" || currentPlan.name === plan;
      return textMatch && statusMatch && planMatch;
    });
  }, [orgs, query, status, plan]);

  useEffect(() => setPage(1), [query, status, plan]);
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <div className="ml-page-head horg-list-head">
        <div>
          <div className="ml-h1">Organization Management</div>
        </div>
        <div className="horg-head-actions">
          <button className="ml-btn-soft" type="button">
            <HIcon name="download" size={16} />
            Download Excel
          </button>
          <button className="ml-btn-primary" type="button" onClick={onCreate}>
            <HIcon name="add" size={17} color="#fff" />
            Create New Org
          </button>
        </div>
      </div>

      <section className="horg-toolbar">
        <div className="hac-toolbar">
          <div className="hac-toolbar-left">
            <div className="hac-search-group horg-search">
              <div className="hac-search-bar">
                <HIcon name="search" size={17} color="var(--fg-tertiary)" />
                <input
                  className="hac-search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by Organization"
                  aria-label="Search by Organization"
                />
              </div>
            </div>
            <button className={"hac-filter-btn" + (showFilters ? " active" : "")} type="button" onClick={() => setShowFilters((value) => !value)}>
              <HIcon name="filter_list" size={17} />
              Filter
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="hac-filter-panel horg-filter-panel">
            <div className="hac-filter-grid">
              <div className="hac-filter-field">
                <label>Status</label>
                <SelectMenu className="hac-select" value={status} options={["All statuses", ...STATUS_OPTIONS]} onChange={setStatus} ariaLabel="Status" />
              </div>
              <div className="hac-filter-field">
                <label>Subscription</label>
                <SelectMenu className="hac-select" value={plan} options={["All plans", ...PLANS.map((item) => item.name)]} onChange={setPlan} ariaLabel="Subscription" />
              </div>
              <div className="hac-filter-actions horg-filter-actions">
                <button className="hac-filter-reset" type="button" onClick={() => { setStatus("All statuses"); setPlan("All plans"); }}>Reset</button>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="ml-table-wrap horg-table-wrap">
        <table className="ml-table horg-table">
          <thead>
            <tr>
              <th>No</th>
              <th>ID</th>
              <th>Organization</th>
              <th>Subscription</th>
              <th>Contact</th>
              <th>Contact Info</th>
              <th>Join Date</th>
              <th>Status</th>
              <th><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((org, index) => {
              const currentPlan = planById(org.subscription.current.planId);
              const subCopy = subscriptionExpiryCopy(org);
              return (
                <tr key={org.id} onDoubleClick={() => onView(org.id)}>
                  <td className="ml-mono">{(page - 1) * perPage + index + 1}</td>
                  <td className="ml-mono">{org.id}</td>
                  <td>{org.organizationName}</td>
                  <td>
                    <div className="horg-plan-cell">
                      <span>{currentPlan.name}</span>
                      <b className={subscriptionMetaTone(subCopy)}>{subCopy}</b>
                    </div>
                  </td>
                  <td>{org.pic.name}</td>
                  <td>
                    <div className="horg-contact-cell">
                      <span>{org.pic.email}</span>
                      <span>{org.pic.phone}</span>
                    </div>
                  </td>
                  <td>{fmtDate(org.joinDate)}</td>
                  <td><StatusPill status={org.status} /></td>
                  <td>
                    <RowMenu onView={() => onView(org.id)} onEdit={() => onEdit(org.id)} onDelete={() => onDelete(org)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!pageData.length && <div className="horg-empty-table">No organizations match the current search or filters.</div>}
      </div>
      <HPager page={page} perPage={perPage} total={filtered.length} onPage={setPage} onPerPage={setPerPage} />
    </>
  );
}

function PageHead({ mode, org, onBack, onEdit }) {
  const label = mode === "create" ? "New" : mode === "edit" ? "Edit" : "View";
  const title = mode === "create" ? "New Organization" : mode === "edit" ? `Edit ${org.organizationName || "Organization"}` : org.organizationName;
  const crumb = mode === "create" ? "New" : org.organizationName || label;
  return (
    <div className="ml-page-head">
      <div>
        <div className="hac-breadcrumb">
          <button className="hac-bc-link" type="button" onClick={onBack}>Organization Management</button>
          <HIcon name="chevron_right" size={16} color="var(--fg-tertiary)" />
          <span>{crumb}</span>
        </div>
        <div className="horg-title-row">
          <div className="ml-h1">{title}</div>
          {mode === "view" && <StatusPill status={org.status} />}
        </div>
        {mode !== "create" && <div className="horg-page-sub">{org.orgCode || `ID ${org.id}`} · {org.pic.name || "No PIC"}</div>}
      </div>
      {mode === "view" && (
        <button className="ml-btn-outline" type="button" onClick={onEdit}>
          <HIcon name="edit" size={16} />
          Edit organization
        </button>
      )}
    </div>
  );
}

function TabBar({ activeTab, onTab, mode }) {
  return (
    <div className="ml-tabs horg-tabs">
      {TAB_ITEMS.map((tab) => {
        const disabled = mode === "create" && tab.key === "partners";
        return (
          <button
            key={tab.key}
            className={"ml-tab" + (activeTab === tab.key ? " active" : "")}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onTab(tab.key)}
            title={disabled ? "Save organization before assigning partners." : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionCard({ title, children, className = "" }) {
  return (
    <section className={"ml-card hsub-card horg-card" + (className ? " " + className : "")}>
      <div className="hac-sec-header">
        <div className="hac-sec-header-row">
          <div>
            <div>{title}</div>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

function FormSubsection({ title, children, className = "" }) {
  return (
    <div className={"horg-subsection" + (className ? " " + className : "")}>
      {title && <div className="hac-form-section-title horg-subsection-title">{title}</div>}
      {children}
    </div>
  );
}

function Field({ label, required, error, children, info }) {
  return (
    <div className="hac-fg horg-field">
      <label className={"hac-label" + (info ? " ml-label-with-info" : "") + (required ? " req" : "")}>
        <span>{label}{required ? "*" : ""}</span>
        {info && (
          <span className="ml-tooltip-wrap" tabIndex={0}>
            <span className="ml-info-trigger" aria-label={`${label} help`}>
              <HIcon name="info" size={14} color="var(--fg-tertiary)" />
            </span>
            <span className="ml-tooltip">{info}</span>
          </span>
        )}
      </label>
      {children}
      {error && <span className="horg-error">{error}</span>}
    </div>
  );
}

function TextField({ label, value, onChange, required, error, type = "text", disabled = false, info, placeholder = "" }) {
  return (
    <Field label={label} required={required} error={error} info={info}>
      <input className="hac-input" type={type} value={value || ""} placeholder={placeholder} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

function StaticField({ label, value, info }) {
  return (
    <Field label={label} info={info}>
      <div className="horg-static-field">{value || "-"}</div>
    </Field>
  );
}

function ReadOnlyGrid({ items }) {
  return (
    <div className="hac-detail-grid hac-view-grid horg-read-grid">
      {items.map((item) => (
        <div className={"hac-dfield" + (item.className ? " " + item.className : "")} key={item.label}>
          <label className="hac-label">{item.label}</label>
          <div className="hac-dval">{item.value || "-"}</div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ children }) {
  return <div className="hac-empty-state horg-empty-state">{children}</div>;
}

function FileList({ files, editable, onRemove }) {
  if (!files?.length) return <EmptyState>No files uploaded.</EmptyState>;
  return (
    <div className="horg-file-list">
      {files.slice(0, 1).map((file) => (
        <div className="horg-file-row" key={file.id}>
          <HIcon name="upload_file" size={26} color="var(--green-600)" />
          <div>
            <b>{file.name}</b>
            <span>{file.size} · {file.status}</span>
          </div>
          {editable && (
            <button type="button" className="ml-icon-btn" aria-label={`Delete ${file.name}`} onClick={() => onRemove(file.id)}>
              <HIcon name="delete" size={17} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function UploadBlock({ files, onAdd, onRemove, editable }) {
  if (!editable) return <FileList files={files} editable={false} />;
  if (files?.length) return <FileList files={files} editable onRemove={onRemove} />;
  return (
    <>
      <HacFileUpload
        variant="mini"
        accept="image/*,.pdf,.doc,.docx"
        onFiles={(nextFiles) => onAdd(Array.from(nextFiles).slice(0, 1).map((file, index) => ({
          id: `file-${Date.now()}-${index}`,
          name: file.name,
          size: file.size ? `${Math.max(1, Math.round(file.size / 1024))} KB` : "1 KB",
          status: "Completed",
          uploadedAt: "2026-07-13",
        })))}
        description={<><span>Click to upload</span> or drag and drop</>}
        hint="PDF, DOC, DOCX, or images. Optional."
      />
    </>
  );
}

function OrganizationDetailTab({ org, mode, errors, updateOrg, updatePath }) {
  const editable = mode !== "view";
  const addCompanyEmail = () => {
    const value = String(org.companyEmailDraft || "").trim();
    if (!value) return;
    updateOrg({ ...org, companyEmails: [...org.companyEmails, value], companyEmailDraft: "" });
  };
  const removeCompanyEmail = (email) => updateOrg({ ...org, companyEmails: org.companyEmails.filter((item) => item !== email) });

  if (!editable) {
    return (
      <div className="hac-detail-sections">
        <SectionCard title="Organization Details">
          <ReadOnlyGrid items={[
            { label: "Organization Name", value: org.organizationName },
            { label: "Organization Reg No.", value: org.regNo },
            { label: "TIN No.", value: org.tinNo },
            { label: "Country", value: org.country },
            { label: "State", value: org.state },
            { label: "City", value: org.city },
            { label: "Address", value: org.address },
            { label: "Post Code", value: org.postCode },
          ]} />
        </SectionCard>
        <SectionCard title="PIC Details">
          <ReadOnlyGrid items={[
            { label: "Name", value: org.pic.name },
            { label: "Phone", value: org.pic.phone },
            { label: "Email", value: org.pic.email },
          ]} />
        </SectionCard>
        <SectionCard title="Organization Setting">
          <div className="horg-setting-grid">
            <div className="horg-setting-panel">
              <div className="hac-form-section-title horg-subsection-title">Company Email</div>
              <div className="horg-email-list readonly">
                {org.companyEmails.length ? org.companyEmails.map((email) => <span key={email}>{email}</span>) : <EmptyState>No company email added.</EmptyState>}
              </div>
            </div>
            <div className="horg-setting-panel">
              <div className="hac-form-section-title horg-subsection-title">Attachments</div>
              <FileList files={org.orgFiles} editable={false} />
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="hac-detail-sections">
      <SectionCard title="Organization Details">
        <div className="hac-form-grid">
          <TextField label="Organization Name" required value={org.organizationName} error={errors.organizationName} onChange={(value) => updatePath("organizationName", value)} />
          <TextField label="Organization Reg No." required value={org.regNo} error={errors.regNo} onChange={(value) => updatePath("regNo", value)} />
          <TextField label="TIN No." required value={org.tinNo} error={errors.tinNo} onChange={(value) => updatePath("tinNo", value)} />
          <TextField label="Country" required value={org.country} error={errors.country} onChange={(value) => updatePath("country", value)} />
          <TextField label="State" required value={org.state} error={errors.state} onChange={(value) => updatePath("state", value)} />
          <TextField label="City" required value={org.city} error={errors.city} onChange={(value) => updatePath("city", value)} />
          <TextField label="Address" required value={org.address} error={errors.address} onChange={(value) => updatePath("address", value)} />
          <TextField label="Post Code" required value={org.postCode} error={errors.postCode} onChange={(value) => updatePath("postCode", value)} />
        </div>
      </SectionCard>

      <SectionCard title="PIC Details">
        <div className="hac-form-grid3">
          <TextField label="Name" required value={org.pic.name} error={errors.picName} onChange={(value) => updatePath("pic.name", value)} />
          <TextField label="Phone" required value={org.pic.phone} error={errors.picPhone} onChange={(value) => updatePath("pic.phone", value)} />
          <TextField label="Email" required value={org.pic.email} error={errors.picEmail} onChange={(value) => updatePath("pic.email", value)} />
        </div>
      </SectionCard>

      <SectionCard title="Organization Setting">
        <div className="horg-setting-grid">
          <div className="horg-setting-panel">
            <div className="hac-form-section-title horg-subsection-title">Company Email</div>
            <div className="horg-add-rows">
              <div className="horg-add-row">
                <input className="hac-input" value={org.companyEmailDraft || ""} onChange={(e) => updatePath("companyEmailDraft", e.target.value)} placeholder="Add company email" />
                <div className="horg-add-action">
                  <button type="button" className="hac-add-tier-btn" onClick={addCompanyEmail}>
                    <HIcon name="add" size={15} />
                    Add Email
                  </button>
                </div>
              </div>
            </div>
            <div className="horg-email-list">
              {org.companyEmails.length ? org.companyEmails.map((email) => (
                <span key={email}>{email}<button type="button" aria-label={`Remove ${email}`} onClick={() => removeCompanyEmail(email)}><HIcon name="close" size={13} /></button></span>
              )) : <EmptyState>No company email added.</EmptyState>}
            </div>
          </div>
          <div className="horg-setting-panel">
            <div className="hac-form-section-title horg-subsection-title">Attachments</div>
            <UploadBlock
              files={org.orgFiles}
              editable
              onAdd={(files) => updatePath("orgFiles", files)}
              onRemove={(id) => updatePath("orgFiles", org.orgFiles.filter((file) => file.id !== id))}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function SubscriptionFields({ title, sub, prefix, errors, editable, onChange, onDelete, allowDelete, planOptions = PLAN_OPTIONS }) {
  const plan = planById(sub.planId);
  const isTrial = isTrialSelection(sub);
  const freePlan = plan.id === "plan-free";
  const trialEnd = isTrial ? addDays(trialStartDate(sub), trialDurationDays(sub)) : "";
  const setSub = (patch) => onChange({ ...sub, ...patch });
  const applyTierPatch = (tierId, base = sub) => {
    const tier = planById(base.planId).tiers.find((item) => item.id === tierId);
    if (!tier?.isTrial) {
      return { tierId, trialStartDate: "", trialDuration: "" };
    }
    return {
      tierId,
      amount: 0,
      paymentMethod: "",
      paymentDate: "",
      trialStartDate: base.trialStartDate || base.startDate || "2026-07-13",
      trialDuration: Number(tier.trialDurationDays || tier.months * 30 || 0),
    };
  };
  const setPlan = (planId) => {
    const nextPlan = planById(planId);
    const firstTier = nextPlan.tiers.find((tier) => !tier.isTrial)?.id || nextPlan.tiers[0]?.id || "";
    const tierPatch = applyTierPatch(firstTier, { ...sub, planId });
    setSub({
      ...sub,
      planId,
      managedVehicleNumber: nextPlan.id === "plan-free" ? 0 : sub.managedVehicleNumber || 1,
      amount: nextPlan.id === "plan-free" ? 0 : sub.amount,
      paymentMethod: nextPlan.id === "plan-free" ? "" : sub.paymentMethod,
      paymentDate: nextPlan.id === "plan-free" ? "" : sub.paymentDate,
      ...tierPatch,
    });
  };
  const mvDisabled = !editable;
  const amountReadonly = isTrial;
  const managedVehicleInfo = "Number of managed vehicles this organization is paying for.";
  const trialStartInfo = isTrial ? `Trial duration: ${trialDurationLabel(sub)}. Ends on ${fmtDate(trialEnd)}.` : undefined;

  if (!editable) {
    return (
      <SectionCard title={title}>
        <ReadOnlyGrid items={[
          { label: "Plan Name", value: plan.name },
          { label: "Duration / Tier", value: plan.tiers.find((tier) => tier.id === sub.tierId)?.label || "-" },
          { label: isTrial ? "Trial Start Date" : "Start Date", value: fmtDate(trialStartDate(sub) || sub.startDate) },
          { label: "Managed Vehicle Number", value: String(sub.managedVehicleNumber ?? 0) },
          { label: "Plan Limit", value: planLimitLabel(plan) },
          { label: "Payment Settings", value: sub.paymentSettings ? "Enabled" : "Disabled" },
          { label: "Amount", value: isTrial ? "RM0" : fmtRM(sub.amount) },
          { label: "Payment Method", value: sub.paymentMethod },
          { label: "Payment Date", value: fmtDate(sub.paymentDate) },
          ...(isTrial ? [{ label: "Trial End Date", value: fmtDate(trialEnd) }] : []),
          { label: "Remarks", value: sub.remarks },
          { label: "Attachments", value: <FileList files={sub.files} editable={false} /> },
        ]} />
      </SectionCard>
    );
  }

  return (
    <SectionCard title={title} className="horg-subscription-card">
      <div className="horg-section-actions">
        {allowDelete && <button className="ml-btn-outline horg-danger-btn" type="button" onClick={onDelete}><HIcon name="delete" size={15} /> Delete Upcoming Plan</button>}
      </div>
      <FormSubsection title="Plan Assignment">
        <div className="hac-form-grid">
          <Field label="Plan Name" required error={errors[`${prefix}PlanId`]}>
            <SelectMenu className="hac-select" value={sub.planId} options={planOptions} onChange={setPlan} ariaLabel={`${title} Plan Name`} />
          </Field>
          {plan.type !== "default" && plan.tiers.length > 0 && (
            <Field label="Duration / Tier" required error={errors[`${prefix}TierId`]}>
              <SelectMenu className="hac-select" value={sub.tierId} options={tierOptions(sub.planId)} onChange={(value) => setSub(applyTierPatch(value))} ariaLabel={`${title} Duration / Tier`} />
            </Field>
          )}
          <TextField label={isTrial ? "Trial Start Date" : "Start Date"} type="date" required value={sub.startDate} error={errors[`${prefix}StartDate`]} info={trialStartInfo} onChange={(value) => setSub({ startDate: value, trialStartDate: isTrial ? value : sub.trialStartDate })} />
          {freePlan ? (
            <StaticField label="Managed Vehicle Number" value="Feature not turned on for this plan." info={managedVehicleInfo} />
          ) : (
            <TextField label="Managed Vehicle Number" type="number" required disabled={mvDisabled} value={sub.managedVehicleNumber} error={errors[`${prefix}ManagedVehicleNumber`]} info={managedVehicleInfo} onChange={(value) => setSub({ managedVehicleNumber: value === "" ? "" : Number(value) })} />
          )}
        </div>
        {errors[`${prefix}ManagedVehicleNumber`] && <div className="horg-inline-warning">{errors[`${prefix}ManagedVehicleNumber`]}</div>}
      </FormSubsection>

      <FormSubsection title="Payment Details">
        <div className="horg-payment-stack">
          <label className="hac-check-row horg-payment-check">
            <input type="checkbox" checked={!!sub.paymentSettings} onChange={(e) => setSub({ paymentSettings: e.target.checked })} />
            <span>Enable payment settings</span>
          </label>
          {sub.paymentSettings && (
            <>
              <div className="hac-form-grid">
                <TextField label="Amount" type="number" required={!amountReadonly} disabled={amountReadonly} value={amountReadonly ? 0 : sub.amount} error={errors[`${prefix}Amount`]} onChange={(value) => setSub({ amount: value === "" ? "" : Number(value) })} />
                <Field label="Payment Method" required={!isTrial && !freePlan} error={errors[`${prefix}PaymentMethod`]}>
                  <SelectMenu className="hac-select" value={sub.paymentMethod || ""} options={[{ value: "", label: isTrial || freePlan ? "Not required" : "Select payment method" }, ...PAYMENT_METHODS.map((item) => ({ value: item, label: item }))]} onChange={(value) => setSub({ paymentMethod: value })} ariaLabel={`${title} Payment Method`} />
                </Field>
                <TextField label="Payment Date" type="date" required={!isTrial && !freePlan} value={sub.paymentDate} error={errors[`${prefix}PaymentDate`]} onChange={(value) => setSub({ paymentDate: value })} />
              </div>
              <div className="horg-payment-bottom-grid">
                <Field label="Remarks">
                  <textarea className="hac-input horg-textarea" value={sub.remarks || ""} onChange={(e) => setSub({ remarks: e.target.value })} />
                </Field>
                <div className="hac-fg horg-field">
                  <label className="hac-label">Attachments</label>
                  <UploadBlock
                    files={sub.files || []}
                    editable
                    onAdd={(files) => setSub({ files })}
                    onRemove={(id) => setSub({ files: (sub.files || []).filter((file) => file.id !== id) })}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </FormSubsection>
    </SectionCard>
  );
}

function makeUpcomingFromCurrent(current) {
  const planId = current.planId === "plan-lite" ? "plan-premium" : "plan-lite";
  const plan = planById(planId);
  const tierId = plan.tiers.find((tier) => !tier.isTrial)?.id || plan.tiers[0]?.id || "";
  return {
    planId,
    tierId,
    startDate: "",
    managedVehicleNumber: plan.id === "plan-free" ? 0 : 1,
    paymentSettings: true,
    amount: plan.id === "plan-free" ? 0 : plan.baseMonthlyFee,
    paymentMethod: "Bank transfer",
    paymentDate: "",
    remarks: "",
    trialStartDate: "",
    trialDuration: "",
    files: [],
  };
}

function SubscriptionTab({ org, mode, errors, updatePath }) {
  const editable = mode !== "view";
  const current = org.subscription.current;
  const upcoming = org.subscription.upcoming;
  const updateCurrent = (next) => updatePath("subscription.current", next);
  const updateUpcoming = (next) => updatePath("subscription.upcoming", next);

  if (mode === "create") {
    return (
      <div className="hac-detail-sections">
        <SubscriptionFields title="Subscription Assignment" prefix="current" sub={current} errors={errors} editable={true} onChange={updateCurrent} />
      </div>
    );
  }

  return (
    <div className="hac-detail-sections">
      <SubscriptionFields title="Current Subscription" prefix="current" sub={current} errors={errors} editable={editable} onChange={updateCurrent} />

      {upcoming ? (
        <>
          {errors.upcomingDuplicate && <div className="horg-inline-warning">{errors.upcomingDuplicate}</div>}
          <SubscriptionFields
            title="Upcoming Plan"
            prefix="upcoming"
            sub={upcoming}
            errors={errors}
            editable={editable}
            onChange={updateUpcoming}
            allowDelete={editable}
            onDelete={() => updatePath("subscription.upcoming", null)}
            planOptions={UPCOMING_PLAN_OPTIONS}
          />
        </>
      ) : editable ? (
        <SectionCard title="Upcoming Plan">
          <div className="horg-empty-action">
            <span>No upcoming plan scheduled.</span>
            <button className="ml-btn-outline" type="button" onClick={() => updatePath("subscription.upcoming", makeUpcomingFromCurrent(current))}>
              <HIcon name="add" size={16} />
              Add Upcoming Plan
            </button>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}

function PartnerAssignmentTab({ org, mode, updatePath }) {
  const editable = mode !== "view";
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerModalQuery, setPartnerModalQuery] = useState("");
  const [pendingPartnerId, setPendingPartnerId] = useState("");
  const assignedIds = new Set(org.partners.map((partner) => partner.id));
  const filtered = org.partners.filter((partner) => partner.name.toLowerCase().includes(query.toLowerCase()));
  const availablePartners = PARTNERS.filter((partner) => !assignedIds.has(partner.id));
  const modalPartners = availablePartners.filter((partner) => {
    const q = partnerModalQuery.trim().toLowerCase();
    return !q || partner.name.toLowerCase().includes(q) || partner.id.toLowerCase().includes(q);
  });

  const removePartner = (id) => {
    updatePath("partners", org.partners.filter((partner) => partner.id !== id));
    setSelectedIds((current) => current.filter((item) => item !== id));
  };
  const bulkRemove = () => {
    updatePath("partners", org.partners.filter((partner) => !selectedIds.includes(partner.id)));
    setSelectedIds([]);
  };
  const addPartner = () => {
    const partner = availablePartners.find((item) => item.id === pendingPartnerId);
    if (!partner) return;
    updatePath("partners", [...org.partners, partner]);
    setPendingPartnerId("");
    setPartnerModalQuery("");
    setPartnerModalOpen(false);
  };

  if (!editable) {
    return (
      <SectionCard title="Partner Assignment">
        <div className="ml-table-wrap horg-partner-table-wrap">
          <table className="ml-table horg-partner-table readonly">
            <thead>
              <tr>
                <th>No</th>
                <th>Partner Name</th>
                <th>Partner ID</th>
              </tr>
            </thead>
            <tbody>
              {org.partners.map((partner, index) => (
                <tr key={partner.id}>
                  <td className="ml-mono">{index + 1}</td>
                  <td>{partner.name}</td>
                  <td className="ml-mono">{partner.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!org.partners.length && <div className="horg-empty-table">No partners assigned.</div>}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Partner Assignment">
      <div className="horg-partner-toolbar">
        <div className="hac-search-group horg-partner-search">
          <div className="hac-search-bar">
            <HIcon name="search" size={17} color="var(--fg-tertiary)" />
            <input className="hac-search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by Partner Name" />
          </div>
        </div>
        {editable && (
          <div className="horg-partner-actions">
            <button className="ml-btn-outline horg-danger-btn" type="button" disabled={!selectedIds.length} onClick={bulkRemove}>
              <HIcon name="delete" size={16} />
              Bulk Remove
            </button>
            <button className="ml-btn-primary" type="button" disabled={!availablePartners.length} onClick={() => setPartnerModalOpen(true)}>
              <HIcon name="add" size={16} color="#fff" />
              Add New Partner
            </button>
          </div>
        )}
      </div>

      <div className="ml-table-wrap horg-partner-table-wrap">
        <table className="ml-table horg-partner-table">
          <thead>
            <tr>
              <th><span className="sr-only">Select</span></th>
              <th>No</th>
              <th>Partner Name</th>
              <th>Partner ID</th>
              <th><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((partner, index) => (
              <tr key={partner.id}>
                <td>
                  <input
                    type="checkbox"
                    disabled={!editable}
                    checked={selectedIds.includes(partner.id)}
                    onChange={(e) => setSelectedIds((current) => e.target.checked ? [...current, partner.id] : current.filter((id) => id !== partner.id))}
                    aria-label={`Select ${partner.name}`}
                  />
                </td>
                <td className="ml-mono">{index + 1}</td>
                <td>{partner.name}</td>
                <td className="ml-mono">{partner.id}</td>
                <td>
                  {editable && (
                    <button className="ml-icon-btn" type="button" aria-label={`Remove ${partner.name}`} onClick={() => removePartner(partner.id)}>
                      <HIcon name="delete" size={17} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <div className="horg-empty-table">No partners assigned.</div>}
      </div>
      {partnerModalOpen && (
        <HacModal
          title="Add New Partner"
          onClose={() => setPartnerModalOpen(false)}
          className="horg-partner-modal"
          footer={
            <>
              <button className="hac-modal-cancel" type="button" onClick={() => setPartnerModalOpen(false)}>Cancel</button>
              <button className="hac-modal-save" type="button" disabled={!pendingPartnerId} onClick={addPartner}>Add partner</button>
            </>
          }
        >
          <div className="horg-partner-modal-body">
            <div className="hac-search-group horg-partner-modal-search">
              <div className="hac-search-bar">
                <HIcon name="search" size={17} color="var(--fg-tertiary)" />
                <input className="hac-search-input" value={partnerModalQuery} onChange={(e) => setPartnerModalQuery(e.target.value)} placeholder="Search by partner name or ID" />
              </div>
            </div>
            <div className="horg-partner-choice-list">
              {modalPartners.map((partner) => (
                <label className={"horg-partner-choice" + (pendingPartnerId === partner.id ? " selected" : "")} key={partner.id}>
                  <input
                    type="radio"
                    name="partner-choice"
                    checked={pendingPartnerId === partner.id}
                    onChange={() => setPendingPartnerId(partner.id)}
                  />
                  <span>
                    <b>{partner.name}</b>
                    <small>{partner.id}</small>
                  </span>
                </label>
              ))}
              {!modalPartners.length && <EmptyState>No available partners found.</EmptyState>}
            </div>
          </div>
        </HacModal>
      )}
    </SectionCard>
  );
}

function OrgDetailView({ mode, org, onBack, onEdit, onSave }) {
  const [draft, setDraft] = useState(() => deepClone(org));
  const [activeTab, setActiveTab] = useState("detail");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setDraft(deepClone(org));
    setActiveTab("detail");
    setErrors({});
  }, [org, mode]);

  const editable = mode !== "view";
  const updateOrg = (next) => {
    setDraft(next);
    if (Object.keys(errors).length) setErrors(validateOrg(next));
  };
  const updatePath = (path, value) => updateOrg(updateAtPath(draft, path, value));

  const save = () => {
    const nextErrors = validateOrg(draft, { skipSubscription: mode === "create" });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      if (nextErrors.organizationName || nextErrors.regNo || nextErrors.tinNo || nextErrors.picName) setActiveTab("detail");
      else if (nextErrors.upcomingDuplicate || Object.keys(nextErrors).some((key) => key.startsWith("current") || key.startsWith("upcoming"))) setActiveTab("subscription");
      return;
    }
    onSave(draft);
  };

  return (
    <>
      <PageHead mode={mode} org={draft} onBack={onBack} onEdit={onEdit} />
      {mode === "create" ? (
        <div className="horg-create-stack">
          <OrganizationDetailTab org={draft} mode={mode} errors={errors} updateOrg={updateOrg} updatePath={updatePath} />
        </div>
      ) : (
        <>
          <TabBar activeTab={activeTab} onTab={setActiveTab} mode={mode} />
          {activeTab === "detail" && <OrganizationDetailTab org={draft} mode={mode} errors={errors} updateOrg={updateOrg} updatePath={updatePath} />}
          {activeTab === "subscription" && <SubscriptionTab org={draft} mode={mode} errors={errors} updatePath={updatePath} />}
          {activeTab === "partners" && <PartnerAssignmentTab org={draft} mode={mode} updatePath={updatePath} />}
        </>
      )}
      {editable && (
        <div className="hac-edit-bar horg-edit-bar">
          <button className="hac-cancel-btn" type="button" onClick={onBack}>Cancel</button>
          <button className="hac-save-btn" type="button" onClick={save}>{mode === "create" ? "Create organization" : "Save changes"}</button>
        </div>
      )}
    </>
  );
}

function OrganizationManagementApp() {
  const [orgs, setOrgs] = useState(() => deepClone(ORGANIZATIONS));
  const [mode, setMode] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [flash, setFlash] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!flash) return undefined;
    const timer = window.setTimeout(() => setFlash(null), 5000);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const selectedOrg = useMemo(() => {
    if (mode === "create") return makeEmptyOrg();
    return orgs.find((org) => org.id === selectedId) || orgs[0];
  }, [mode, orgs, selectedId]);

  const openList = () => {
    setMode("list");
    setSelectedId(null);
  };
  const openCreate = () => {
    setSelectedId(null);
    setMode("create");
  };
  const openView = (id) => {
    setSelectedId(id);
    setMode("view");
  };
  const openEdit = (id = selectedId) => {
    setSelectedId(id);
    setMode("edit");
  };
  const saveOrg = (draft) => {
    if (mode === "create") {
      const nextId = Math.max(...orgs.map((org) => Number(org.id) || 0)) + 1;
      const next = {
        ...draft,
        id: nextId,
        orgCode: `ORG-${String(nextId).padStart(4, "0")}`,
        joinDate: draft.joinDate || "2026-07-13",
      };
      setOrgs((current) => [next, ...current]);
      setSelectedId(nextId);
      setMode("view");
      setFlash({ tone: "success", message: `${next.organizationName} created successfully.` });
      return;
    }
    setOrgs((current) => current.map((org) => org.id === draft.id ? draft : org));
    setSelectedId(draft.id);
    setMode("view");
    setFlash({ tone: "success", message: `${draft.organizationName} saved successfully.` });
  };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setOrgs((current) => current.filter((org) => org.id !== deleteTarget.id));
    setFlash({ tone: "success", message: `${deleteTarget.organizationName} deleted.` });
    setDeleteTarget(null);
    openList();
  };

  return (
    <div className="ml-app">
      <HostTopBar />
      <HostSidebar active="organisation" />
      <main className="ml-main horg-main">
        <ActionBanner flash={flash} onDismiss={() => setFlash(null)} />
        {mode === "list" ? (
          <OrgListView orgs={orgs} onCreate={openCreate} onView={openView} onEdit={openEdit} onDelete={setDeleteTarget} />
        ) : (
          <OrgDetailView mode={mode} org={selectedOrg} onBack={openList} onEdit={() => openEdit(selectedOrg.id)} onSave={saveOrg} />
        )}
        {deleteTarget && (
          <HacModal
            title="Delete organization?"
            onClose={() => setDeleteTarget(null)}
            footer={
              <>
                <button className="hac-modal-cancel" type="button" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="hac-modal-save horg-delete-confirm" type="button" onClick={confirmDelete}>Delete organization</button>
              </>
            }
          >
            <p className="horg-delete-copy">{deleteTarget.organizationName} will be removed from this prototype list.</p>
          </HacModal>
        )}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<OrganizationManagementApp />);
