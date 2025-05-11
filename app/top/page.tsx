import { createClient } from '@/utils/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: dailyActionSummary } = await supabase.from('daily_action_summary').select().order('date', { ascending: false }).limit(1)  
  const { data: dailyDashboardRegistrationSummary } = await supabase.from('daily_dashboard_registration_summary').select().order('date', { ascending: false }).limit(1)

  return <>
    <h1>チームみらい</h1>
    <h2>これまでのチームみらいの活動</h2>
    <pre>{JSON.stringify(dailyActionSummary, null, 2)}</pre>

    <h2>今日までの活動</h2>
    <pre>{JSON.stringify(dailyDashboardRegistrationSummary, null, 2)}</pre>
  </>
}