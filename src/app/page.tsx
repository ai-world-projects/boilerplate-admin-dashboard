import { redirect } from 'next/navigation';

/** Entry point — send visitors straight to the dashboard. */
export default function Home() {
  redirect('/dashboard');
}
