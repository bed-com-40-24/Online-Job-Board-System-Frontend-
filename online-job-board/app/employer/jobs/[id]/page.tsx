import { JobEditor } from '@/components/EmployerWorkspace';

export default async function EmployerJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobEditor jobId={id} />;
}
