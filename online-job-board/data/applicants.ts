export type ApplicationStatus =
  | "Pending"
  | "Shortlisted"
  | "Rejected";

export type Applicant = {
  id: number;
  name: string;
  email: string;
  position: string;
  appliedDate: string;
  experience: string;
  education: string;
  location: string;
  phone: string;
  skills: string[];
  status: ApplicationStatus;
};

export const initialApplicants: Applicant[] = [
  {
    id: 1,
    name: "Thoko Banda",
    email: "thoko.banda@example.com",
    position: "Frontend Developer",
    appliedDate: "09 Oct 2026",
    experience: "3 years",
    education: "BSc Computer Science",
    location: "Blantyre, Malawi",
    phone: "+265 991 123 456",
    skills: ["React", "JavaScript", "CSS"],
    status: "Pending",
  },
  {
    id: 2,
    name: "Peter Phiri",
    email: "peter.phiri@example.com",
    position: "Backend Developer",
    appliedDate: "09 Oct 2026",
    experience: "4 years",
    education: "BSc Information Technology",
    location: "Lilongwe, Malawi",
    phone: "+265 888 234 567",
    skills: ["Node.js", "Python", "SQL"],
    status: "Shortlisted",
  },
  {
    id: 3,
    name: "Madalitso Zulu",
    email: "madalitso.zulu@example.com",
    position: "Product Designer",
    appliedDate: "08 Oct 2026",
    experience: "2 years",
    education: "Diploma in Graphic Design",
    location: "Zomba, Malawi",
    phone: "+265 999 345 678",
    skills: ["Figma", "Prototyping", "User Research"],
    status: "Pending",
  },
  {
    id: 4,
    name: "Grace Nkhoma",
    email: "grace.nkhoma@example.com",
    position: "IT Support Officer",
    appliedDate: "07 Oct 2026",
    experience: "3 years",
    education: "Diploma in Information Technology",
    location: "Mzuzu, Malawi",
    phone: "+265 881 456 789",
    skills: ["Troubleshooting", "Networking", "Windows"],
    status: "Rejected",
  },
];