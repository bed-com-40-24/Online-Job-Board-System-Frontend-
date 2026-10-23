import RoleGate from '@/components/RoleGate';
import Shell from '@/components/Shell';

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate role="employer">
      <Shell>{children}</Shell>
    </RoleGate>
  );
}
