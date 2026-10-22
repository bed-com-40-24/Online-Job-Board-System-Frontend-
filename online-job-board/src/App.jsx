import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowLeft, ArrowRight, Bell, BriefcaseBusiness,
  Building2, Check, CheckCircle2, ChevronDown, ClipboardList, Clock3,
  FileText, Filter, LayoutDashboard, LogOut, Menu, Plus, Search, Settings2,
  ShieldCheck, SlidersHorizontal, Users, X, Eye, Pencil, Ban, CircleCheck,
  CircleX, MapPin, CalendarDays, Mail, ExternalLink, Sparkles, TrendingUp
} from "lucide-react";

/*
 * TalentBridge — COM311 frontend prototype
 * ---------------------------------------------------------------
 * This single React component demonstrates the employer and admin
 * requirements from the supplied issue backlog. It uses localStorage
 * for browser-only persistence and seeded sample records.
 *
 * IMPORTANT: this is not production authentication or secure access
 * control. A real system needs a backend, server-side authorisation,
 * password hashing, database rules, audit logging and secure sessions.
 */

const STORAGE_KEY = "talentbridge-demo-v1";
const demoJobs = [
  { id: 101, title: "Frontend Developer", company: "Northstar Digital", location: "Blantyre, Malawi", type: "Full-time", category: "Technology", salary: "MK 900,000–1,400,000", deadline: "2026-11-20", description: "Build accessible, responsive web experiences with a collaborative product team. You will work with React, modern CSS and REST APIs.", requirements: "React, JavaScript, HTML, CSS, Git and a willingness to learn.", employerId: "employer", status: "Approved", posted: "2026-10-18" },
  { id: 102, title: "Graduate Software Engineer", company: "Lakeview Systems", location: "Lilongwe, Malawi", type: "Graduate programme", category: "Technology", salary: "MK 650,000–850,000", deadline: "2026-11-28", description: "Join a graduate team building practical digital services for businesses and communities.", requirements: "Computer Science or related degree, problem-solving skills and basic programming experience.", employerId: "other", status: "Approved", posted: "2026-10-17" },
  { id: 103, title: "Finance and Administration Officer", company: "Mwayi Foundation", location: "Zomba, Malawi", type: "Full-time", category: "Finance", salary: "Negotiable", deadline: "2026-11-15", description: "Support budgeting, reporting, procurement documentation and day-to-day office operations.", requirements: "Relevant qualification, attention to detail and good spreadsheet skills.", employerId: "other", status: "Approved", posted: "2026-10-16" },
  { id: 104, title: "Digital Marketing Assistant", company: "Northstar Digital", location: "Hybrid", type: "Contract", category: "Marketing", salary: "MK 450,000–600,000", deadline: "2026-11-25", description: "Help plan content, monitor campaigns and report on digital engagement.", requirements: "Clear writing, creativity and familiarity with social media analytics.", employerId: "employer", status: "Pending review", posted: "2026-10-21" },
  { id: 105, title: "IT Support Technician", company: "CampusLink Services", location: "Mzuzu, Malawi", type: "Full-time", category: "Technology", salary: "MK 500,000–700,000", deadline: "2026-11-12", description: "Provide first-line technical support, maintain devices and document recurring issues.", requirements: "Networking fundamentals, Windows support and strong communication.", employerId: "other", status: "Approved", posted: "2026-10-15" }
];

const demoApplications = [
  { id: 501, jobId: 101, jobTitle: "Frontend Developer", applicant: "Chisomo Banda", email: "chisomo@example.com", education: "BSc Computer Science", experience: "2 years — web development internship and freelance projects", applied: "2026-10-19", status: "New", cover: "I enjoy building clean, accessible interfaces and would love to contribute to your product team." },
  { id: 502, jobId: 101, jobTitle: "Frontend Developer", applicant: "Tadala Phiri", email: "tadala@example.com", education: "BSc Information Systems", experience: "1 year — junior developer", applied: "2026-10-20", status: "Shortlisted", cover: "My experience with React and responsive design matches the advertised role." },
  { id: 503, jobId: 104, jobTitle: "Digital Marketing Assistant", applicant: "Memory Zulu", email: "memory@example.com", education: "Diploma in Marketing", experience: "18 months — social media coordinator", applied: "2026-10-22", status: "New", cover: "I have supported social media campaigns and enjoy using data to improve engagement." }
];

const initialState = {
  jobs: demoJobs,
  applications: demoApplications,
  employers: [
    { id: "employer", company: "Northstar Digital", contact: "Ulemu Mtambo", email: "employer@demo.com", industry: "Technology", joined: "2026-08-12", verification: "Verified" },
    { id: "other", company: "Lakeview Systems", contact: "Arthur Khoma", email: "lakeview@demo.com", industry: "Technology", joined: "2026-09-02", verification: "Pending" },
    { id: "org3", company: "Mwayi Foundation", contact: "Martha Bulambo", email: "mwayi@demo.com", industry: "Non-profit", joined: "2026-09-19", verification: "Verified" }
  ],
  activity: [
    { id: 1, text: "Northstar Digital submitted Digital Marketing Assistant", time: "Today, 09:42", type: "Job review" },
    { id: 2, text: "Tadala Phiri was shortlisted for Frontend Developer", time: "Yesterday, 14:20", type: "Application" },
    { id: 3, text: "Lakeview Systems registered an employer account", time: "21 Oct, 11:06", type: "Employer" }
  ]
};

const cn = (...classes) => classes.filter(Boolean).join(" ");
const moneylessDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Not set";

function readState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialState;
  } catch {
    return initialState;
  }
}

function StatusPill({ status }) {
  const styles = {
    Approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Verified: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Shortlisted: "bg-violet-50 text-violet-700 ring-violet-600/20",
    "Pending review": "bg-amber-50 text-amber-700 ring-amber-600/20",
    Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    New: "bg-blue-50 text-blue-700 ring-blue-600/20",
    Submitted: "bg-blue-50 text-blue-700 ring-blue-600/20",
    Rejected: "bg-rose-50 text-rose-700 ring-rose-600/20",
    Closed: "bg-slate-100 text-slate-600 ring-slate-500/20",
    "In review": "bg-amber-50 text-amber-700 ring-amber-600/20",
    "In progress": "bg-sky-50 text-sky-700 ring-sky-600/20",
    Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", styles[status] || "bg-slate-100 text-slate-600 ring-slate-500/20")}>{status}</span>;
}

function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    secondary: "bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    soft: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
  };
  return <button className={cn("inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50", variants[variant], className)} {...props}>{children}</button>;
}

function Field({ label, hint, ...props }) {
  return <label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-700">{label}</span><input className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" {...props} />{hint && <span className="block text-xs text-slate-500">{hint}</span>}</label>;
}

function SelectField({ label, children, ...props }) {
  return <label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-700">{label}</span><select className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" {...props}>{children}</select></label>;
}

function TextAreaField({ label, ...props }) {
  return <label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-700">{label}</span><textarea className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" rows="4" {...props} /></label>;
}

function StatCard({ label, value, hint, icon: Icon, tone = "indigo" }) {
  const tones = { indigo: "bg-indigo-50 text-indigo-600", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", violet: "bg-violet-50 text-violet-600" };
  return <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p></div><span className={cn("rounded-xl p-3", tones[tone])}><Icon size={20}/></span></div><p className="mt-3 text-xs text-slate-500">{hint}</p></div>;
}

function EmptyState({ title, detail }) {
  return <div className="flex flex-col items-center justify-center px-6 py-14 text-center"><span className="rounded-2xl bg-slate-100 p-4 text-slate-400"><ClipboardList size={26}/></span><h3 className="mt-4 font-semibold text-slate-800">{title}</h3><p className="mt-1 max-w-sm text-sm text-slate-500">{detail}</p></div>;
}

export default function App() {
  const [db, setDb] = useState(readState);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("talentbridge-user") || "null"); } catch { return null; }
  });
  const [page, setPage] = useState("overview");
  const [publicPage, setPublicPage] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingJob, setEditingJob] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loginRole, setLoginRole] = useState("employer");
  const [loginEmail, setLoginEmail] = useState("employer@demo.com");
  const [loginPassword, setLoginPassword] = useState("demo123");
  const [loginError, setLoginError] = useState("");
  const [jobForm, setJobForm] = useState({ title: "", category: "Technology", location: "Blantyre, Malawi", type: "Full-time", salary: "", deadline: "", description: "", requirements: "" });
  const [showJobForm, setShowJobForm] = useState(false);

  // Keep demo records available between browser refreshes.
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); }, [db]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timeout);
  }, [toast]);

  const isAdmin = user?.role === "admin";
  const ownJobs = useMemo(() => db.jobs.filter(j => j.employerId === user?.id), [db.jobs, user]);
  const ownApplications = useMemo(() => db.applications.filter(a => ownJobs.some(j => j.id === a.jobId)), [db.applications, ownJobs]);
  const pendingJobs = db.jobs.filter(j => j.status === "Pending review" || j.status === "Submitted");
  const visibleJobs = db.jobs.filter(j => j.status === "Approved" && j.title.toLowerCase().includes(search.toLowerCase()) && (filter === "All categories" || filter === "All" || j.category === filter));

  function updateDb(change, activityText) {
    setDb(previous => {
      const next = change(previous);
      if (activityText) next.activity = [{ id: Date.now(), text: activityText, time: "Just now", type: "Update" }, ...next.activity].slice(0, 30);
      return next;
    });
  }

  function login(event) {
    event.preventDefault();
    setLoginError("");
    // Demo-only credentials. Never use this pattern for real authentication.
    const expected = loginRole === "admin" ? "admin@talentbridge.demo" : "employer@demo.com";
    if (loginEmail.trim().toLowerCase() !== expected || loginPassword !== "demo123") {
      setLoginError("Those demo credentials do not match. Check the example below and try again.");
      return;
    }
    const nextUser = loginRole === "admin"
      ? { id: "admin", name: "Platform Admin", role: "admin", company: "TalentBridge" }
      : { id: "employer", name: "Ulemu Mtambo", role: "employer", company: "Northstar Digital" };
    setUser(nextUser);
    sessionStorage.setItem("talentbridge-user", JSON.stringify(nextUser));
    setPublicPage(false);
    setPage("overview");
    setToast(`Welcome back, ${nextUser.name.split(" ")[0]}!`);
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem("talentbridge-user");
    setPage("overview");
    setPublicPage(true);
    setMobileNav(false);
    setToast("You have been signed out.");
  }

  function go(nextPage) {
    setPage(nextPage);
    setPublicPage(false);
    setMobileNav(false);
    setSearch("");
    setSelectedApplication(null);
    setSelectedJob(null);
    setShowJobForm(false);
  }

  function saveJob(event) {
    event.preventDefault();
    if (!jobForm.title.trim() || !jobForm.location.trim() || !jobForm.description.trim() || !jobForm.deadline) {
      setToast("Please complete the required vacancy fields.");
      return;
    }
    const job = {
      ...jobForm,
      id: editingJob?.id || Date.now(),
      company: user.company,
      employerId: user.id,
      posted: editingJob?.posted || new Date().toISOString().slice(0, 10),
      status: editingJob ? editingJob.status : "Pending review"
    };
    updateDb(prev => ({ ...prev, jobs: editingJob ? prev.jobs.map(j => j.id === editingJob.id ? job : j) : [job, ...prev.jobs] }), `${user.company} ${editingJob ? "updated" : "created"} vacancy: ${job.title}`);
    setShowJobForm(false);
    setEditingJob(null);
    setJobForm({ title: "", category: "Technology", location: "Blantyre, Malawi", type: "Full-time", salary: "", deadline: "", description: "", requirements: "" });
    setPage("jobs");
    setToast(editingJob ? "Vacancy changes saved." : "Vacancy saved and sent for administrator review.");
  }

  function editJob(job) {
    setEditingJob(job);
    setJobForm({ title: job.title, category: job.category, location: job.location, type: job.type, salary: job.salary || "", deadline: job.deadline, description: job.description, requirements: job.requirements });
    setShowJobForm(true);
  }

  function changeJobStatus(jobId, status) {
    const job = db.jobs.find(j => j.id === jobId);
    updateDb(prev => ({ ...prev, jobs: prev.jobs.map(j => j.id === jobId ? { ...j, status } : j) }), `${job?.title || "Vacancy"} status changed to ${status}`);
    setToast(`Vacancy marked ${status.toLowerCase()}.`);
    setSelectedJob(null);
  }

  function changeApplicationStatus(applicationId, status) {
    const application = db.applications.find(a => a.id === applicationId);
    updateDb(prev => ({ ...prev, applications: prev.applications.map(a => a.id === applicationId ? { ...a, status } : a) }), `${application?.applicant || "Applicant"} marked ${status}`);
    setSelectedApplication(null);
    setToast(`Applicant status updated to ${status}.`);
  }

  function verifyEmployer(employerId, verification) {
    const employer = db.employers.find(e => e.id === employerId);
    updateDb(prev => ({ ...prev, employers: prev.employers.map(e => e.id === employerId ? { ...e, verification } : e) }), `${employer?.company || "Employer"} ${verification.toLowerCase()}`);
    setToast(`Employer ${verification.toLowerCase()}.`);
  }

  function resetDemo() {
    if (!window.confirm("Reset all demo data to the original sample records?")) return;
    setDb(initialState);
    setToast("Demo data reset.");
  }

  const employerNav = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "jobs", label: "My vacancies", icon: BriefcaseBusiness },
    { id: "applications", label: "Applications", icon: Users }
  ];
  const adminNav = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "employers", label: "Employers", icon: Building2 },
    { id: "moderation", label: "Job moderation", icon: ShieldCheck },
    { id: "activity", label: "Activity log", icon: Activity }
  ];

  // Public job discovery page
  if (publicPage && !user) {
    return <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <button onClick={() => { setPublicPage(true); setPage("overview"); }} className="flex items-center gap-2.5"><span className="rounded-xl bg-indigo-600 p-2 text-white"><BriefcaseBusiness size={21}/></span><span className="text-xl font-extrabold tracking-tight text-slate-900">Talent<span className="text-indigo-600">Bridge</span></span></button>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex"><a href="#jobs" className="hover:text-indigo-600">Find jobs</a><a href="#how" className="hover:text-indigo-600">How it works</a><button onClick={() => { setLoginRole("employer"); setPublicPage(false); setPage("login"); }} className="hover:text-indigo-600">For employers</button></nav>
        <div className="flex gap-2"><Button variant="ghost" className="hidden sm:inline-flex" onClick={() => { setLoginRole("employer"); setPublicPage(false); setPage("login"); }}>Sign in</Button><Button onClick={() => { setLoginRole("employer"); setPublicPage(false); setPage("login"); }}>Employer portal <ArrowRight size={16}/></Button></div>
      </div></header>
      <main>
        <section className="relative overflow-hidden bg-[#101828]"><div className="absolute -right-28 -top-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"/><div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl"/>
          <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-[1.05fr_.95fr] md:items-center md:py-28 lg:px-8">
            <div><div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-indigo-200"><Sparkles size={14}/> Your next opportunity starts here</div><h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">Find work that moves <span className="text-indigo-300">you forward.</span></h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Discover opportunities from organisations looking for talent in Malawi. Find your next role and take the next step in your career.</p>
              <div className="mt-8 flex flex-wrap gap-3"><a href="#jobs"><Button>Explore open jobs <ArrowRight size={17}/></Button></a><button onClick={() => { setLoginRole("employer"); setPublicPage(false); setPage("login"); }} className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">I'm hiring</button></div>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-300"><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-300"/> Curated opportunities</span><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-300"/> Simple application tracking</span></div>
            </div>
            <div className="relative mx-auto w-full max-w-lg"><div className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur"><div className="rounded-2xl bg-white p-5 sm:p-7"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-indigo-600">FEATURED OPPORTUNITIES</p><h2 className="mt-1 text-xl font-bold text-slate-900">Roles worth a look</h2></div><span className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><TrendingUp size={22}/></span></div>
                {[demoJobs[0], demoJobs[1], demoJobs[2]].map((job, i) => <div key={job.id} className={cn("flex gap-3 py-4", i < 2 && "border-b border-slate-100")}><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Building2 size={20}/></div><div className="min-w-0 flex-1"><p className="truncate font-bold text-slate-800">{job.title}</p><p className="mt-1 text-sm text-slate-500">{job.company} · {job.location.split(",")[0]}</p><div className="mt-2 flex flex-wrap gap-2"><span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">{job.type}</span><span className="rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700">{job.category}</span></div></div></div>)}
              </div></div><div className="absolute -bottom-5 -left-4 rounded-2xl bg-white px-4 py-3 shadow-xl sm:-left-8"><p className="text-xs text-slate-500">Built for your next step</p><p className="mt-1 flex items-center gap-2 font-bold text-slate-900"><span className="rounded-full bg-emerald-100 p-1 text-emerald-700"><Check size={13}/></span> One place. More possibilities.</p></div></div>
          </div>
        </section>
        <section id="jobs" className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Explore opportunities</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Recently listed jobs</h2><p className="mt-2 text-slate-500">Find a role that fits your skills and ambitions.</p></div><div className="flex w-full gap-2 sm:max-w-lg"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-slate-400" size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search job titles..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"/></div><select value={filter} onChange={e => setFilter(e.target.value)} className="max-w-44 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"><option>All categories</option><option>Technology</option><option>Finance</option><option>Marketing</option></select></div></div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{visibleJobs.map(job => <article key={job.id} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/60"><div className="flex items-start justify-between"><span className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><BriefcaseBusiness size={21}/></span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{job.type}</span></div><h3 className="mt-5 text-lg font-bold text-slate-900">{job.title}</h3><p className="mt-1 text-sm font-medium text-slate-500">{job.company}</p><div className="mt-4 space-y-2 text-sm text-slate-500"><p className="flex items-center gap-2"><MapPin size={15}/>{job.location}</p><p className="flex items-center gap-2"><CalendarDays size={15}/> Deadline: {moneylessDate(job.deadline)}</p></div><p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{job.description}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-sm font-bold text-slate-800">{job.salary || "Salary not listed"}</span><Button variant="soft" onClick={() => { setSelectedJob(job); setPage("public-job"); setPublicPage(false); }}>View role <ArrowRight size={15}/></Button></div></article>)}</div>
          {visibleJobs.length === 0 && <EmptyState title="No matching jobs" detail="Try another keyword or choose a different category."/>}
        </section>
        <section id="how" className="bg-slate-50 py-16"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="text-center"><p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Simple by design</p><h2 className="mt-2 text-3xl font-extrabold text-slate-900">A clearer path to your next role</h2></div><div className="mt-10 grid gap-5 md:grid-cols-3">{[{n:"01",title:"Discover",text:"Browse relevant openings from organisations hiring in Malawi.",icon:Search},{n:"02",title:"Apply",text:"Review role requirements and prepare your application.",icon:FileText},{n:"03",title:"Move forward",text:"Recruiters can review applications and update candidate status.",icon:TrendingUp}].map(step => <div key={step.n} className="rounded-2xl border border-slate-200 bg-white p-6"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><step.icon size={22}/></span><p className="mt-5 text-xs font-bold tracking-widest text-indigo-600">STEP {step.n}</p><h3 className="mt-1 text-lg font-bold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p></div>)}</div></div></section>
      </main>
      <footer className="border-t border-slate-100 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© 2026 TalentBridge. Frontend demonstration.</span><button onClick={() => { setLoginRole("admin"); setLoginEmail("admin@talentbridge.demo"); setPublicPage(false); setPage("login"); }} className="font-semibold text-slate-600 hover:text-indigo-600">Administrator portal</button></div></footer>
    </div>;
  }

  // Public job details must render before the protected sign-in/dashboard branches.
  if (!user && page === "public-job" && selectedJob) {
    return <div className="min-h-screen bg-slate-50 px-4 py-10"><div className="mx-auto max-w-3xl"><button onClick={() => { setSelectedJob(null); setPublicPage(true); setPage("overview"); }} className="mb-5 flex items-center gap-2 text-sm font-semibold text-indigo-600"><ArrowLeft size={16}/> Back to job board</button><article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-9"><div className="flex items-start gap-4"><span className="rounded-2xl bg-indigo-50 p-4 text-indigo-600"><BriefcaseBusiness size={28}/></span><div><h2 className="text-2xl font-extrabold text-slate-900">{selectedJob.title}</h2><p className="mt-1 font-medium text-slate-500">{selectedJob.company}</p><p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><MapPin size={15}/>{selectedJob.location}</p></div></div><div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{selectedJob.type}</span><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{selectedJob.category}</span></div><div className="mt-7 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2"><div><p className="text-xs text-slate-400">Salary</p><p className="mt-1 font-bold text-slate-800">{selectedJob.salary || "Not specified"}</p></div><div><p className="text-xs text-slate-400">Application deadline</p><p className="mt-1 font-bold text-slate-800">{moneylessDate(selectedJob.deadline)}</p></div></div><h3 className="mt-7 font-bold text-slate-900">About the role</h3><p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{selectedJob.description}</p><h3 className="mt-6 font-bold text-slate-900">Requirements</h3><p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{selectedJob.requirements}</p><div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">This frontend prototype does not include applicant registration or application submission. Those features require an applicant workflow and backend data storage.</div><Button className="mt-5" onClick={() => { setLoginRole("employer"); setPage("login"); setPublicPage(false); setSelectedJob(null); }}>Employer portal <ArrowRight size={16}/></Button></article></div></div>;
  }

  // A focused sign-in view is shown before entering protected demo areas.
  if (!user || page === "login") {
    return <div className="flex min-h-screen items-center justify-center bg-[#101828] px-4 py-10"><div className="absolute left-8 top-8"><button onClick={() => { setUser(null); setPublicPage(true); setPage("overview"); }} className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"><ArrowLeft size={16}/> Back to job board</button></div><div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl sm:p-9"><div className="flex items-center gap-3"><span className="rounded-xl bg-indigo-600 p-2.5 text-white"><BriefcaseBusiness size={23}/></span><div><p className="text-xl font-extrabold text-slate-900">TalentBridge</p><p className="text-xs text-slate-500">Recruitment workspace</p></div></div><h1 className="mt-8 text-2xl font-extrabold tracking-tight text-slate-900">Welcome back</h1><p className="mt-2 text-sm text-slate-500">Sign in to manage vacancies, candidates and job reviews.</p>
      <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button onClick={() => { setLoginRole("employer"); setLoginEmail("employer@demo.com"); setLoginError(""); }} className={cn("rounded-lg py-2.5 text-sm font-semibold", loginRole === "employer" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500")}>Employer</button><button onClick={() => { setLoginRole("admin"); setLoginEmail("admin@talentbridge.demo"); setLoginError(""); }} className={cn("rounded-lg py-2.5 text-sm font-semibold", loginRole === "admin" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500")}>Administrator</button></div>
      <form onSubmit={login} className="mt-6 space-y-4"><Field label="Email address" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required autoComplete="username"/><Field label="Password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required autoComplete="current-password"/>{loginError && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{loginError}</p>}<Button type="submit" className="w-full py-3">Sign in securely <ArrowRight size={16}/></Button></form>
      <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4"><p className="text-xs font-bold uppercase tracking-wider text-indigo-800">Demo access</p><p className="mt-2 text-sm text-slate-700">Email: <strong>{loginRole === "admin" ? "admin@talentbridge.demo" : "employer@demo.com"}</strong></p><p className="mt-1 text-sm text-slate-700">Password: <strong>demo123</strong></p><p className="mt-2 text-xs leading-5 text-slate-500">These are sample credentials for this local frontend prototype only.</p></div>
      <p className="mt-5 text-center text-xs leading-5 text-slate-400">Frontend-only demo. Do not enter real personal or confidential information.</p>
    </div></div>;
  }

  // Common dashboard shell for both roles.
  const navItems = isAdmin ? adminNav : employerNav;
  const titleMap = { overview: "Overview", jobs: "My vacancies", applications: "Applications", employers: "Employer management", moderation: "Job moderation", activity: "Activity log", "public-job": "Job details" };
  const pageTitle = titleMap[page] || "Overview";

  function SidebarContent() {
    return <><div className="flex items-center gap-3 px-5 py-6"><span className="rounded-xl bg-indigo-600 p-2.5 text-white"><BriefcaseBusiness size={22}/></span><div><p className="text-lg font-extrabold tracking-tight text-slate-900">TalentBridge</p><p className="text-xs text-slate-500">Recruitment platform</p></div></div><div className="mx-4 rounded-xl bg-slate-50 p-3"><div className="flex items-center gap-2"><span className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold", isAdmin ? "bg-violet-100 text-violet-700" : "bg-indigo-100 text-indigo-700")}>{isAdmin ? "AD" : "EM"}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{user.name}</p><p className="text-xs capitalize text-slate-500">{user.role} account</p></div></div></div><p className="px-6 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Workspace</p><nav className="space-y-1 px-3">{navItems.map(item => <button key={item.id} onClick={() => go(item.id)} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition", page === item.id ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")}><item.icon size={18}/>{item.label}{item.id === "moderation" && pendingJobs.length > 0 && <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{pendingJobs.length}</span>}{item.id === "applications" && ownApplications.length > 0 && <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{ownApplications.length}</span>}</button>)}</nav><div className="mx-4 mt-8 rounded-2xl bg-[#101828] p-4 text-white"><span className="rounded-lg bg-white/10 p-2 inline-flex"><Sparkles size={17}/></span><p className="mt-3 text-sm font-bold">A better hiring workflow</p><p className="mt-1 text-xs leading-5 text-slate-300">Keep every vacancy and candidate update organised in one place.</p><button onClick={resetDemo} className="mt-3 text-xs font-semibold text-indigo-200 underline underline-offset-4">Reset demo data</button></div><div className="mt-auto p-4"><button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700"><LogOut size={18}/> Sign out</button></div></>;
  }

  const jobRows = (isAdmin ? db.jobs : ownJobs).filter(j => (filter === "All" || j.status === filter) && `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(search.toLowerCase()));
  const applicationRows = (isAdmin ? db.applications : ownApplications).filter(a => `${a.applicant} ${a.jobTitle} ${a.status}`.toLowerCase().includes(search.toLowerCase()));

  return <div className="min-h-screen bg-[#f7f8fb]">
    {mobileNav && <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setMobileNav(false)}><aside onClick={e => e.stopPropagation()} className="flex h-full w-72 flex-col bg-white shadow-xl"><div className="flex justify-end p-3"><button onClick={() => setMobileNav(false)} className="rounded-lg p-2 hover:bg-slate-100"><X size={20}/></button></div><SidebarContent/></aside></div>}
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex"><SidebarContent/></aside>
    <div className="lg:pl-64"><header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur"><div className="flex h-[76px] items-center justify-between px-4 sm:px-7 lg:px-9"><div className="flex items-center gap-3"><button onClick={() => setMobileNav(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu size={21}/></button><div><div className="flex items-center gap-2"><p className="text-xs font-semibold text-slate-400">WORKSPACE</p><span className="text-slate-300">/</span><p className="text-xs font-semibold text-indigo-600">{isAdmin ? "Administrator" : "Employer"}</p></div><h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">{pageTitle}</h1></div></div><div className="flex items-center gap-2 sm:gap-4"><span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex"><span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500"/> Demo workspace</span><button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100" title="Notifications"><Bell size={19}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"/></button><div className="hidden h-9 w-px bg-slate-200 sm:block"/><button onClick={logout} className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-50"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">{user.name.split(" ").map(n => n[0]).slice(0,2).join("")}</span><span className="hidden text-left sm:block"><span className="block text-sm font-semibold text-slate-800">{user.name}</span><span className="block text-xs capitalize text-slate-500">{user.role}</span></span><ChevronDown size={15} className="hidden text-slate-400 sm:block"/></button></div></div></header>
      <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7 lg:px-9 lg:py-9">
        {page === "overview" && <div className="space-y-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-slate-500">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">Good to see you, {user.name.split(" ")[0]} <span>👋</span></h2><p className="mt-1 text-slate-500">{isAdmin ? "Here is what's happening across the recruitment platform." : "Here's a snapshot of your hiring activity."}</p></div>{!isAdmin && <Button onClick={() => { setEditingJob(null); setJobForm({ title: "", category: "Technology", location: "Blantyre, Malawi", type: "Full-time", salary: "", deadline: "", description: "", requirements: "" }); setShowJobForm(true); go("jobs"); setShowJobForm(true); }}><Plus size={17}/> Create vacancy</Button>}</div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{isAdmin ? <><StatCard label="Total vacancies" value={db.jobs.length} hint="Across all employer accounts" icon={BriefcaseBusiness}/><StatCard label="Awaiting review" value={pendingJobs.length} hint="Requires moderation" icon={Clock3} tone="amber"/><StatCard label="Registered employers" value={db.employers.length} hint="Employer accounts" icon={Building2} tone="violet"/><StatCard label="Applications" value={db.applications.length} hint="Candidate submissions" icon={Users} tone="emerald"/></> : <><StatCard label="My vacancies" value={ownJobs.length} hint="Total vacancies created" icon={BriefcaseBusiness}/><StatCard label="Published jobs" value={ownJobs.filter(j => j.status === "Approved").length} hint="Visible on the job board" icon={CircleCheck} tone="emerald"/><StatCard label="Applications" value={ownApplications.length} hint="Received for your vacancies" icon={Users} tone="violet"/><StatCard label="Awaiting review" value={ownJobs.filter(j => j.status === "Pending review" || j.status === "Submitted").length} hint="Being checked by an admin" icon={Clock3} tone="amber"/></>}</div>
          <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]"><section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="font-bold text-slate-900">{isAdmin ? "Vacancy review queue" : "Recent vacancies"}</h3><p className="mt-1 text-xs text-slate-500">{isAdmin ? "Review submitted job postings" : "Keep track of your latest job posts"}</p></div><button onClick={() => go(isAdmin ? "moderation" : "jobs")} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">View all <ArrowRight size={14} className="ml-1 inline"/></button></div><div className="divide-y divide-slate-100">{(isAdmin ? pendingJobs : ownJobs).slice(0,4).map(job => <div key={job.id} className="flex items-center gap-3 px-5 py-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><BriefcaseBusiness size={18}/></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{job.title}</p><p className="mt-1 truncate text-xs text-slate-500">{job.company} · {job.location}</p></div><StatusPill status={job.status}/>{isAdmin && <button onClick={() => { setSelectedJob(job); go("moderation"); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"><Eye size={16}/></button>}</div>)}{(isAdmin ? pendingJobs : ownJobs).length === 0 && <EmptyState title="Nothing to show yet" detail={isAdmin ? "New submissions will appear here for review." : "Create your first vacancy to get started."}/>}</div></section>
            <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h3 className="font-bold text-slate-900">Recent activity</h3><p className="mt-1 text-xs text-slate-500">Latest platform updates</p></div><div className="space-y-5 p-5">{db.activity.slice(0,4).map((item,i) => <div key={item.id} className="flex gap-3"><span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", i === 0 ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500")}><Activity size={17}/></span><div className="min-w-0 flex-1"><p className="text-sm leading-5 text-slate-700">{item.text}</p><p className="mt-1 text-xs text-slate-400">{item.time} · {item.type}</p></div></div>)}</div>{isAdmin && <div className="border-t border-slate-100 px-5 py-3"><button onClick={() => go("activity")} className="text-sm font-semibold text-indigo-600">Open activity log <ArrowRight size={14} className="ml-1 inline"/></button></div>}</section></div>
          <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white sm:flex sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-indigo-100">{isAdmin ? "Platform operations" : "Hiring tip"}</p><h3 className="mt-1 text-xl font-bold">{isAdmin ? "Keep job listings accurate and trustworthy." : "Clear job descriptions attract stronger applicants."}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">{isAdmin ? "Review employer details, check submitted vacancies and record moderation decisions." : "Include responsibilities, essential skills, location and a realistic application deadline."}</p></div><span className="mt-4 hidden rounded-2xl bg-white/15 p-4 sm:mt-0 sm:block"><Sparkles size={28}/></span></section>
        </div>}

        {page === "jobs" && <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-2xl font-extrabold text-slate-900">Manage vacancies</h2><p className="mt-1 text-sm text-slate-500">Create, update, submit or close vacancies for your organisation.</p></div><Button onClick={() => { setEditingJob(null); setJobForm({ title: "", category: "Technology", location: "Blantyre, Malawi", type: "Full-time", salary: "", deadline: "", description: "", requirements: "" }); setShowJobForm(!showJobForm); }}><Plus size={17}/>{showJobForm ? "Cancel" : "Create vacancy"}</Button></div>
          {showJobForm && <section className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-7"><div className="mb-6 flex items-start justify-between"><div><h3 className="text-lg font-bold text-slate-900">{editingJob ? "Edit vacancy" : "Create a new vacancy"}</h3><p className="mt-1 text-sm text-slate-500">Fields marked with * are required. New vacancies go to admin review.</p></div><button onClick={() => { setShowJobForm(false); setEditingJob(null); }} className="rounded-lg p-2 hover:bg-slate-100"><X size={18}/></button></div><form onSubmit={saveJob} className="grid gap-5 md:grid-cols-2"><Field label="Job title *" value={jobForm.title} onChange={e => setJobForm({...jobForm,title:e.target.value})} placeholder="e.g. Frontend Developer" required/><SelectField label="Category *" value={jobForm.category} onChange={e => setJobForm({...jobForm,category:e.target.value})}><option>Technology</option><option>Finance</option><option>Marketing</option><option>Administration</option><option>Education</option><option>Healthcare</option><option>Engineering</option><option>Other</option></SelectField><Field label="Location *" value={jobForm.location} onChange={e => setJobForm({...jobForm,location:e.target.value})} placeholder="e.g. Blantyre, Malawi" required/><SelectField label="Employment type *" value={jobForm.type} onChange={e => setJobForm({...jobForm,type:e.target.value})}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Graduate programme</option><option>Remote</option></SelectField><Field label="Salary range" value={jobForm.salary} onChange={e => setJobForm({...jobForm,salary:e.target.value})} placeholder="e.g. MK 500,000–700,000"/><Field label="Application deadline *" type="date" min={new Date().toISOString().slice(0,10)} value={jobForm.deadline} onChange={e => setJobForm({...jobForm,deadline:e.target.value})} required/><div className="md:col-span-2"><TextAreaField label="Job description *" value={jobForm.description} onChange={e => setJobForm({...jobForm,description:e.target.value})} placeholder="Describe the role, responsibilities and team..." required/></div><div className="md:col-span-2"><TextAreaField label="Requirements *" value={jobForm.requirements} onChange={e => setJobForm({...jobForm,requirements:e.target.value})} placeholder="List essential qualifications, experience and skills..." required/></div><div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5 md:col-span-2"><Button type="button" variant="secondary" onClick={() => { setShowJobForm(false); setEditingJob(null); }}>Cancel</Button><Button type="submit"><Check size={16}/>{editingJob ? "Save changes" : "Save and submit for review"}</Button></div></form></section>}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-slate-400" size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your vacancies..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400"/></div><div className="flex items-center gap-2"><Filter size={16} className="text-slate-400"/><select value={filter} onChange={e => setFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="All">All statuses</option><option>Approved</option><option>Pending review</option><option>Rejected</option><option>Closed</option></select></div></div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4 font-semibold">Vacancy</th><th className="px-5 py-4 font-semibold">Deadline</th><th className="px-5 py-4 font-semibold">Applications</th><th className="px-5 py-4 font-semibold">Status</th><th className="px-5 py-4 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{jobRows.filter(j => !isAdmin || j.employerId === user.id).map(job => <tr key={job.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-bold text-slate-800">{job.title}</p><p className="mt-1 text-xs text-slate-500">{job.location} · {job.type}</p></td><td className="px-5 py-4 text-slate-600">{moneylessDate(job.deadline)}</td><td className="px-5 py-4 text-slate-600">{db.applications.filter(a => a.jobId === job.id).length}</td><td className="px-5 py-4"><StatusPill status={job.status}/></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button title="View details" onClick={() => setSelectedJob(job)} className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"><Eye size={16}/></button>{!isAdmin && <button title="Edit vacancy" onClick={() => editJob(job)} className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"><Pencil size={16}/></button>}{!isAdmin && job.status !== "Closed" && <button title="Close vacancy" onClick={() => changeJobStatus(job.id,"Closed")} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"><Ban size={16}/></button>}{!isAdmin && job.status === "Rejected" && <button title="Resubmit for review" onClick={() => changeJobStatus(job.id,"Pending review")} className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"><ArrowRight size={16}/></button>}</div></td></tr>)}</tbody></table></div>{jobRows.filter(j => !isAdmin || j.employerId === user.id).length === 0 && <EmptyState title="No vacancies found" detail="Try changing your search or create a new vacancy."/>}</div>
        </div>}

        {page === "applications" && <div className="space-y-6"><div><h2 className="text-2xl font-extrabold text-slate-900">Candidate applications</h2><p className="mt-1 text-sm text-slate-500">Review candidate details and manage each recruitment status.</p></div><div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-slate-400" size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applicants or vacancies..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400"/></div></div><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Applicant</th><th className="px-5 py-4">Vacancy</th><th className="px-5 py-4">Applied</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{applicationRows.map(app => <tr key={app.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-bold text-slate-800">{app.applicant}</p><p className="mt-1 text-xs text-slate-500">{app.email}</p></td><td className="px-5 py-4 text-slate-600">{app.jobTitle}</td><td className="px-5 py-4 text-slate-600">{moneylessDate(app.applied)}</td><td className="px-5 py-4"><StatusPill status={app.status}/></td><td className="px-5 py-4 text-right"><Button variant="secondary" className="px-3 py-2" onClick={() => setSelectedApplication(app)}><Eye size={15}/> Review</Button></td></tr>)}</tbody></table></div>{applicationRows.length === 0 && <EmptyState title="No applications yet" detail="Applications received for your vacancies will appear here."/>}</div></div>}

        {page === "employers" && isAdmin && <div className="space-y-6"><div><h2 className="text-2xl font-extrabold text-slate-900">Employer management</h2><p className="mt-1 text-sm text-slate-500">Review registered organisations and manage verification requests.</p></div><div className="grid gap-4 sm:grid-cols-3"><StatCard label="All employers" value={db.employers.length} hint="Registered organisations" icon={Building2}/><StatCard label="Verified" value={db.employers.filter(e => e.verification === "Verified").length} hint="Approved organisations" icon={ShieldCheck} tone="emerald"/><StatCard label="Awaiting verification" value={db.employers.filter(e => e.verification === "Pending").length} hint="Needs an admin decision" icon={Clock3} tone="amber"/></div><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Organisation</th><th className="px-5 py-4">Contact</th><th className="px-5 py-4">Industry</th><th className="px-5 py-4">Joined</th><th className="px-5 py-4">Verification</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{db.employers.map(emp => <tr key={emp.id}><td className="px-5 py-4 font-bold text-slate-800">{emp.company}</td><td className="px-5 py-4"><p className="text-slate-700">{emp.contact}</p><p className="mt-1 text-xs text-slate-500">{emp.email}</p></td><td className="px-5 py-4 text-slate-600">{emp.industry}</td><td className="px-5 py-4 text-slate-600">{moneylessDate(emp.joined)}</td><td className="px-5 py-4"><StatusPill status={emp.verification}/></td><td className="px-5 py-4"><div className="flex justify-end gap-2">{emp.verification !== "Verified" && <Button className="px-3 py-2" onClick={() => verifyEmployer(emp.id,"Verified")}><Check size={14}/> Verify</Button>}<Button variant="secondary" className="px-3 py-2" onClick={() => verifyEmployer(emp.id,"Rejected")}><X size={14}/> Reject</Button></div></td></tr>)}</tbody></table></div></div></div>}

        {page === "moderation" && isAdmin && <div className="space-y-6"><div><h2 className="text-2xl font-extrabold text-slate-900">Job posting moderation</h2><p className="mt-1 text-sm text-slate-500">Inspect submitted vacancies before they become visible on the public job board.</p></div><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Awaiting review" value={pendingJobs.length} hint="Submitted for approval" icon={Clock3} tone="amber"/><StatCard label="Approved" value={db.jobs.filter(j => j.status === "Approved").length} hint="Published on the board" icon={CircleCheck} tone="emerald"/><StatCard label="Rejected" value={db.jobs.filter(j => j.status === "Rejected").length} hint="Not approved for publication" icon={CircleX} tone="violet"/></div><div className="grid gap-5 xl:grid-cols-2">{pendingJobs.map(job => <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><span className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><BriefcaseBusiness size={21}/></span><div><h3 className="font-bold text-slate-900">{job.title}</h3><p className="mt-1 text-sm text-slate-500">{job.company} · {job.location}</p></div></div><StatusPill status={job.status}/></div><div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm"><div><p className="text-xs text-slate-400">Category</p><p className="mt-1 font-semibold text-slate-700">{job.category}</p></div><div><p className="text-xs text-slate-400">Employment type</p><p className="mt-1 font-semibold text-slate-700">{job.type}</p></div><div><p className="text-xs text-slate-400">Salary</p><p className="mt-1 font-semibold text-slate-700">{job.salary || "Not specified"}</p></div><div><p className="text-xs text-slate-400">Deadline</p><p className="mt-1 font-semibold text-slate-700">{moneylessDate(job.deadline)}</p></div></div><p className="mt-4 text-sm leading-6 text-slate-600">{job.description}</p><div className="mt-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Requirements</p><p className="mt-1 text-sm leading-6 text-slate-600">{job.requirements}</p></div><div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4"><Button variant="secondary" onClick={() => setSelectedJob(job)}><Eye size={15}/> Full details</Button><Button variant="danger" onClick={() => changeJobStatus(job.id,"Rejected")}><X size={15}/> Reject</Button><Button onClick={() => changeJobStatus(job.id,"Approved")}><Check size={15}/> Approve & publish</Button></div></article>)}{pendingJobs.length === 0 && <div className="xl:col-span-2"><EmptyState title="Review queue is clear" detail="All submitted vacancies have been reviewed. New submissions will appear here."/></div>}</div><div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold text-slate-900">All job postings</h3><p className="mt-1 text-sm text-slate-500">Current status of every vacancy on the platform.</p><div className="mt-4 space-y-3">{db.jobs.map(job => <div key={job.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"><div><p className="text-sm font-semibold text-slate-800">{job.title}</p><p className="mt-1 text-xs text-slate-500">{job.company}</p></div><div className="flex items-center gap-2"><StatusPill status={job.status}/>{job.status === "Rejected" && <Button variant="soft" className="px-3 py-1.5" onClick={() => changeJobStatus(job.id,"Pending review")}>Reopen review</Button>}</div></div>)}</div></div></div>}

        {page === "activity" && isAdmin && <div className="space-y-6"><div><h2 className="text-2xl font-extrabold text-slate-900">Platform activity</h2><p className="mt-1 text-sm text-slate-500">A simple audit-style timeline of actions in this browser demo.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><div className="space-y-6">{db.activity.map((item,i) => <div key={item.id} className="flex gap-4"><div className="flex flex-col items-center"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Activity size={18}/></span>{i < db.activity.length-1 && <span className="mt-2 h-full w-px bg-slate-100"/>}</div><div className="flex-1 pb-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-slate-800">{item.text}</p><span className="text-xs text-slate-400">{item.time}</span></div><p className="mt-1 text-sm text-slate-500">{item.type} event · Recorded in local demo state</p></div></div>)}</div></div></div>}

        {page === "public-job" && selectedJob && <div className="mx-auto max-w-3xl"><button onClick={() => { setPublicPage(true); setUser(null); setPage("overview"); }} className="mb-5 flex items-center gap-2 text-sm font-semibold text-indigo-600"><ArrowLeft size={16}/> Back to job board</button><article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-9"><div className="flex items-start gap-4"><span className="rounded-2xl bg-indigo-50 p-4 text-indigo-600"><BriefcaseBusiness size={28}/></span><div><h2 className="text-2xl font-extrabold text-slate-900">{selectedJob.title}</h2><p className="mt-1 font-medium text-slate-500">{selectedJob.company}</p><p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><MapPin size={15}/>{selectedJob.location}</p></div></div><div className="mt-6 flex flex-wrap gap-2"><StatusPill status={selectedJob.type}/><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{selectedJob.category}</span></div><div className="mt-7 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2"><div><p className="text-xs text-slate-400">Salary</p><p className="mt-1 font-bold text-slate-800">{selectedJob.salary || "Not specified"}</p></div><div><p className="text-xs text-slate-400">Application deadline</p><p className="mt-1 font-bold text-slate-800">{moneylessDate(selectedJob.deadline)}</p></div></div><h3 className="mt-7 font-bold text-slate-900">About the role</h3><p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{selectedJob.description}</p><h3 className="mt-6 font-bold text-slate-900">Requirements</h3><p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{selectedJob.requirements}</p><div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">This frontend prototype does not include applicant registration or application submission. Those features require an applicant workflow and backend data storage.</div><Button className="mt-5" onClick={() => { setLoginRole("employer"); setPage("login"); setPublicPage(false); }}>Employer portal <ArrowRight size={16}/></Button></article></div>}
      </main>
    </div>

    {/* Vacancy detail modal, available from employer jobs and admin review. */}
    {selectedJob && page !== "public-job" && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={() => setSelectedJob(null)}><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Vacancy details</p><h2 className="mt-2 text-xl font-extrabold text-slate-900">{selectedJob.title}</h2><p className="mt-1 text-sm text-slate-500">{selectedJob.company} · {selectedJob.location}</p></div><button onClick={() => setSelectedJob(null)} className="rounded-lg p-2 hover:bg-slate-100"><X size={19}/></button></div><div className="mt-5 flex flex-wrap gap-2"><StatusPill status={selectedJob.status}/><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{selectedJob.type}</span></div><h3 className="mt-6 font-bold text-slate-800">Description</h3><p className="mt-2 text-sm leading-6 text-slate-600">{selectedJob.description}</p><h3 className="mt-5 font-bold text-slate-800">Requirements</h3><p className="mt-2 text-sm leading-6 text-slate-600">{selectedJob.requirements}</p><div className="mt-6 flex flex-wrap justify-end gap-2">{isAdmin && (selectedJob.status === "Pending review" || selectedJob.status === "Submitted") && <><Button variant="danger" onClick={() => changeJobStatus(selectedJob.id,"Rejected")}>Reject posting</Button><Button onClick={() => changeJobStatus(selectedJob.id,"Approved")}>Approve posting</Button></>}{!isAdmin && selectedJob.employerId === user.id && selectedJob.status !== "Closed" && <><Button variant="secondary" onClick={() => { const job = selectedJob; setSelectedJob(null); editJob(job); go("jobs"); setShowJobForm(true); }}>Edit vacancy</Button><Button variant="danger" onClick={() => changeJobStatus(selectedJob.id,"Closed")}>Close vacancy</Button></>}<Button variant="secondary" onClick={() => setSelectedJob(null)}>Close</Button></div></div></div>}

    {/* Candidate detail modal with status actions. */}
    {selectedApplication && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={() => setSelectedApplication(null)}><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Applicant profile</p><h2 className="mt-2 text-xl font-extrabold text-slate-900">{selectedApplication.applicant}</h2><p className="mt-1 text-sm text-slate-500">{selectedApplication.jobTitle}</p></div><button onClick={() => setSelectedApplication(null)} className="rounded-lg p-2 hover:bg-slate-100"><X size={19}/></button></div><div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-4"><span className="rounded-xl bg-white p-3 text-indigo-600"><Mail size={20}/></span><div><p className="text-xs text-slate-400">Email address</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedApplication.email}</p></div></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-slate-100 p-4"><p className="text-xs text-slate-400">Education</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedApplication.education}</p></div><div className="rounded-xl border border-slate-100 p-4"><p className="text-xs text-slate-400">Experience</p><p className="mt-1 text-sm leading-5 text-slate-700">{selectedApplication.experience}</p></div></div><h3 className="mt-5 font-bold text-slate-800">Cover note</h3><p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{selectedApplication.cover}</p><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-slate-400">Current status</p><div className="mt-1"><StatusPill status={selectedApplication.status}/></div></div><div className="flex flex-wrap gap-2"><Button variant="danger" onClick={() => changeApplicationStatus(selectedApplication.id,"Rejected")}><X size={15}/> Reject</Button><Button variant="soft" onClick={() => changeApplicationStatus(selectedApplication.id,"Shortlisted")}><Check size={15}/> Shortlist</Button><SelectField label="" value={selectedApplication.status} onChange={e => changeApplicationStatus(selectedApplication.id,e.target.value)}><option>New</option><option>Shortlisted</option><option>In review</option><option>In progress</option><option>Rejected</option><option>Resolved</option></SelectField></div></div></div></div>}

    {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl"><CheckCircle2 size={18} className="shrink-0 text-emerald-300"/>{toast}<button onClick={() => setToast("")} className="ml-2 text-slate-300 hover:text-white"><X size={15}/></button></div>}
  </div>;
}
