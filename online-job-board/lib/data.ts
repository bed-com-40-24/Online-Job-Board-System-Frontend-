export type Role = 'employer' | 'admin';
export type AppStatus = 'Pending' | 'Shortlisted' | 'Accepted' | 'Rejected';
export type OrgStatus = 'Pending verification' | 'Verified' | 'Rejected';
export type JobStatus = 'Draft' | 'In review' | 'Published' | 'Rejected';
export type ReasonCategory = 'applicant' | 'employer' | 'job';

export type Applicant = {
  id: string;
  name: string;
  email: string;
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
  reason?: string;
  note?: string;
};

export type Job = {
  id: string;
  owner: string;
  title: string;
  loc: string;
  deadline: string;
  description: string;
  requirements: string;
  status: JobStatus;
  reason?: string;
  note?: string;
};

export const APP_STATUSES: AppStatus[] = ['Pending', 'Shortlisted', 'Accepted', 'Rejected'];
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

export const seedEmployers: Employer[] = [
  {
    id: 'emp-demo',
    name: 'Lakeview Technologies',
    email: 'employer@onlinejobboard.mw',
    contact: 'Alex Morgan',
    industry: 'Information Technology',
    phone: '+265 999 123 456',
    address: 'Lilongwe',
    regNo: 'BRN-2019-0412',
    status: 'Verified',
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
  },
];

export const seedJobs: Job[] = [
  {
    id: 'JB-1048',
    owner: EMP_ID,
    title: 'Frontend Developer',
    loc: 'Lilongwe',
    deadline: '2026-11-15',
    description: 'Build accessible user experiences.',
    requirements: 'React, JavaScript.',
    status: 'In review',
  },
  {
    id: 'JB-1049',
    owner: 'emp-3',
    title: 'QA Tester',
    loc: 'Lilongwe',
    deadline: '2026-11-30',
    description: 'Test web apps and log defects.',
    requirements: 'Attention to detail.',
    status: 'In review',
  },
  {
    id: 'JB-1050',
    owner: 'emp-2',
    title: 'Registered Nurse',
    loc: 'Blantyre',
    deadline: '2026-11-28',
    description: 'Provide patient care on wards.',
    requirements: 'Nursing diploma.',
    status: 'In review',
  },
  {
    id: 'JB-1051',
    owner: EMP_ID,
    title: 'Product Designer',
    loc: 'Lilongwe',
    deadline: '2026-12-10',
    description: 'Shape clear, consistent product experiences.',
    requirements: 'Design portfolio and prototyping experience.',
    status: 'Draft',
  },
];

export const seedApplicants: Applicant[] = [
  {
    id: 'a1',
    name: 'Thoko Banda',
    email: 'thoko.banda@example.com',
    job: 'Frontend Developer',
    jobId: 'JB-1048',
    status: 'Pending',
    applied: '09 Oct 2026',
  },
  {
    id: 'a2',
    name: 'Peter Phiri',
    email: 'peter.phiri@example.com',
    job: 'Frontend Developer',
    jobId: 'JB-1048',
    status: 'Shortlisted',
    applied: '08 Oct 2026',
  },
  {
    id: 'a3',
    name: 'Grace Nkhoma',
    email: 'grace.nkhoma@example.com',
    job: 'Frontend Developer',
    jobId: 'JB-1048',
    status: 'Rejected',
    applied: '05 Oct 2026',
    reason: 'Skills mismatch',
  },
];

export function isDeadlineOpen(deadline: string): boolean {
  const endOfDeadline = new Date(`${deadline}T23:59:59`);
  return Number.isFinite(endOfDeadline.getTime()) && endOfDeadline > new Date();
}
