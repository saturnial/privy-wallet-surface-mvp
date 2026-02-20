import AppShell from '@/components/AppShell';

export default function StandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
