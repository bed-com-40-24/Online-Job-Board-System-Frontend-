export type Role = 'employer' | 'admin';
export type AppStatus = 'Pending' | 'Shortlisted' | 'Accepted' | 'Rejected';
export type OrgStatus = 'Pending verification' | 'Verified' | 'Rejected';
export type AccountStatus = 'Active' | 'Suspended';
export type JobStatus = 'Draft' | 'In review' | 'Published' | 'Rejected' | 'Closed';
export type ReasonCategory = 'applicant' | 'employer' | 'job';

export type Applicant = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  education: string;
  skills: string;
  coverLetter: string;
  job: string;
  jobId: string;
  status: AppStatus;
  applied: string;
  reason?: string;
  note?: string;
};

export type Employer = {
  id: string;
  name: string;
  email: string;
  contact: string;
  industry: string;
  phone: string;
  address: string;
  regNo: string;
  status: OrgStatus;
  accountStatus: AccountStatus;
  reason?: string;
  note?: string;
  reviewedBy?: string;
  reviewedAt?: string;
};

export type Job = {
  id: string;
  owner: string;
  title: string;
  loc: string;
  type: string;
  deadline: string;
  description: string;
  qualifications: string;
  responsibilities: string;
  skills: string;
  status: JobStatus;
  reason?: string;
  note?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  updatedAt?: string;
};

export type Activity = {
  id: string;
  actor: string;
  role: Role;
  action: string;
  target: string;
  description: string;
  at: string;
};

export const APP_STATUSES: AppStatus[] = ['Pending', 'Shortlisted', 'Accepted', 'Rejected'];
export const JOB_STATUSES: JobStatus[] = ['Draft', 'In review', 'Published', 'Rejected', 'Closed'];
export const ORG_STATUSES: OrgStatus[] = ['Pending verification', 'Verified', 'Rejected'];
export const REQUIRE_REJECTION_REASON = true;
export const REASONS: Record<ReasonCategory, string[]> = {
  applicant: [
    'Does not meet minimum qualifications',
    'Insufficient experience',
    'Skills mismatch',
    'Position filled',
    'Other',
  ],
  employer: [
    'Business details incomplete',
    'Unable to verify registration',
    'Invalid contact information',
    'Other',
  ],
  job: [
    'Misleading or inaccurate information',
    'Discriminatory content',
    'Missing key details',
    'Duplicate posting',
    'Other',
  ],
};

export const EMP_ID = 'emp-demo';
export const DEMO_ACCOUNTS = [
  { role: 'employer' as const, email: 'employer@onlinejobboard.mw', password: 'Employer123!' },
  { role: 'admin' as const, email: 'admin@onlinejobboard.mw', password: 'Admin123!' },
];

export const seedEmployers: Employer[] = [
  {
    id: EMP_ID,
    name: 'Lakeview Technologies',
    email: 'employer@onlinejobboard.mw',
    contact: 'Alex Morgan',
    industry: 'Information Technology',
    phone: '+265 999 123 456',
    address: 'Lilongwe',
    regNo: 'BRN-2019-0412',
    status: 'Verified',
    accountStatus: 'Active',
  },
  {
    id: 'emp-3',
    name: 'Copperline Digital',
    email: 'people@copperline.mw',
    contact: 'Sam Phiri',
    industry: 'Technology',
    phone: '+265 995 440 120',
    address: 'Area 47, Lilongwe',
    regNo: 'BRN-2026-0931',
    status: 'Pending verification',
    accountStatus: 'Active',
  },
  {
    id: 'emp-2',
    name: 'Mwayi Health Group',
    email: 'careers@mwayi.mw',
    contact: 'Lydia Mbewe',
    industry: 'Healthcare',
    phone: '+265 888 210 330',
    address: 'Blantyre',
    regNo: 'BRN-2017-0188',
    status: 'Verified',
    accountStatus: 'Active',
  },
  {
    id: 'emp-4',
    name: 'Mphatso Logistics',
    email: 'careers@mphatsologistics.mw',
    contact: 'Martha Zulu',
    industry: 'Transport and Logistics',
    phone: '+265 991 320 640',
    address: 'Mzuzu',
    regNo: 'BRN-2022-0776',
    status: 'Pending verification',
    accountStatus: 'Suspended',
  },
];

export const seedJobs: Job[] = [
  {
    id: 'JB-1048',
    owner: EMP_ID,
    title: 'Frontend Developer',
    loc: 'Lilongwe',
    type: 'Full-time',
    deadline: '2026-11-15',
    description: 'Build accessible user experiences for our growing digital products.',
    qualifications: 'Degree or equivalent experience in software development.',
    responsibilities: 'Build interfaces, collaborate with product teams, and review code.',
    skills: 'React, TypeScript, accessibility',
    status: 'In review',
  },
  {
    id: 'JB-1049',
    owner: 'emp-3',
    title: 'QA Tester',
    loc: 'Lilongwe',
    type: 'Full-time',
    deadline: '2026-11-30',
    description: 'Test web apps and log defects.',
    qualifications: 'A relevant diploma or equivalent experience.',
    responsibilities: 'Create test plans and work with engineers to verify fixes.',
    skills: 'Attention to detail, manual testing',
    status: 'In review',
  },
  {
    id: 'JB-1050',
    owner: 'emp-2',
    title: 'Registered Nurse',
    loc: 'Blantyre',
    type: 'Full-time',
    deadline: '2026-11-28',
    description: 'Provide patient care on hospital wards.',
    qualifications: 'Registered nursing diploma and current registration.',
    responsibilities: 'Assess patients, administer care, and maintain records.',
    skills: 'Patient care, communication',
    status: 'In review',
  },
  {
    id: 'JB-1051',
    owner: EMP_ID,
    title: 'Product Designer',
    loc: 'Lilongwe',
    type: 'Hybrid',
    deadline: '2026-12-10',
    description: 'Shape clear, consistent product experiences.',
    qualifications: 'Design portfolio and relevant experience.',
    responsibilities: 'Research user needs and prototype product flows.',
    skills: 'Figma, prototyping, research',
    status: 'Draft',
  },
];

export const seedApplicants: Applicant[] = [
  {
    id: 'a1',
    name: 'Thoko Banda',
    email: 'thoko.banda@example.com',
    phone: '+265 888 100 200',
    location: 'Lilongwe',
    experience: '3 years building responsive web applications.',
    education: 'BSc Information Technology, University of Malawi',
    skills: 'React, JavaScript, CSS, accessibility',
    coverLetter: 'I enjoy building thoughtful, accessible tools and would love to contribute to Lakeview.',
    job: 'Frontend Developer',
    jobId: 'JB-1048',
    status: 'Pending',
    applied: '09 Oct 2026',
  },
  {
    id: 'a2',
    name: 'Peter Phiri',
    email: 'peter.phiri@example.com',
    phone: '+265 999 300 400',
    location: 'Blantyre',
    experience: '5 years of product design and frontend collaboration.',
    education: 'BA Design, Malawi University of Business and Applied Sciences',
    skills: 'React, TypeScript, design systems',
    coverLetter: 'My background combines strong frontend delivery with an eye for user-centered design.',
    job: 'Frontend Developer',
    jobId: 'JB-1048',
    status: 'Shortlisted',
    applied: '08 Oct 2026',
  },
  {
    id: 'a3',
    name: 'Grace Nkhoma',
    email: 'grace.nkhoma@example.com',
    phone: '+265 991 540 800',
    location: 'Mzuzu',
    experience: 'Recent graduate with internship experience.',
    education: 'BSc Computer Science, Mzuzu University',
    skills: 'HTML, CSS, JavaScript',
    coverLetter: 'I am eager to grow as a developer and contribute to a collaborative team.',
    job: 'Frontend Developer',
    jobId: 'JB-1048',
    status: 'Rejected',
    applied: '05 Oct 2026',
    reason: 'Skills mismatch',
  },
];

export const seedActivity: Activity[] = [
  {
    id: 'activity-seed-1',
    actor: 'Administrator',
    role: 'admin',
    action: 'Job submitted for review',
    target: 'JB-1048 · Frontend Developer',
    description: 'The vacancy is waiting for an administrator decision.',
    at: '2026-10-12T09:30:00.000Z',
  },
  {
    id: 'activity-seed-2',
    actor: 'Administrator',
    role: 'admin',
    action: 'Employer profile created',
    target: 'Copperline Digital',
    description: 'Business verification is pending.',
    at: '2026-10-10T11:00:00.000Z',
  },
];

export function isDeadlineOpen(deadline: string): boolean {
  const endOfDeadline = new Date(`${deadline}T23:59:59`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Number.isFinite(endOfDeadline.getTime()) && endOfDeadline > today;
}
