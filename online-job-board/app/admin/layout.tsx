import RoleGate from '@/components/RoleGate';
import Shell from '@/components/Shell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate role="admin">
      <Shell>{children}</Shell>
    </RoleGate>
  );
}
