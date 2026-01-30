import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getCurrentWeekRange, formatDuration, formatDate } from '@/lib/utils'

// This API route is meant to be called by a cron job or Supabase Edge Function
// It sends weekly reports to employers and nannies every Friday evening

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    // Verify the request has valid authorization (for cron jobs)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { start, end } = getCurrentWeekRange()

    // Get all employers
    const { data: employers } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'employer')

    if (!employers) {
      return NextResponse.json({ message: 'No employers found' })
    }

    const reports = []

    for (const employer of employers) {
      // Get nannies for this employer
      const { data: nannies } = await supabase
        .from('profiles')
        .select('*')
        .eq('employer_id', employer.id)
        .eq('role', 'nanny')

      if (!nannies || nannies.length === 0) continue

      for (const nanny of nannies) {
        // Get time entries for this week
        const { data: entries } = await supabase
          .from('time_entries')
          .select('*')
          .eq('nanny_id', nanny.id)
          .gte('clock_in', start.toISOString())
          .lte('clock_in', end.toISOString())
          .not('clock_out', 'is', null)
          .order('clock_in', { ascending: true })

        if (!entries || entries.length === 0) continue

        const totalMinutes = entries.reduce(
          (sum, entry) => sum + (entry.duration_minutes || 0),
          0
        )

        // Format report data
        const reportData = {
          employer: {
            name: employer.full_name,
            email: employer.email
          },
          nanny: {
            name: nanny.full_name,
            email: nanny.email
          },
          weekStart: formatDate(start),
          weekEnd: formatDate(end),
          totalHours: formatDuration(totalMinutes),
          totalMinutes,
          daysWorked: new Set(
            entries.map((e) => new Date(e.clock_in).toDateString())
          ).size,
          entries: entries.map((e) => ({
            date: formatDate(e.clock_in),
            clockIn: new Date(e.clock_in).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            clockOut: new Date(e.clock_out).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            duration: formatDuration(e.duration_minutes || 0)
          }))
        }

        // Here you would integrate with your email service (Resend, SendGrid, etc.)
        // For now, we'll just log the report and save it to the database

        // Save weekly report
        await supabase.from('weekly_reports').insert({
          nanny_id: nanny.id,
          employer_id: employer.id,
          week_start: start.toISOString(),
          week_end: end.toISOString(),
          total_hours: Math.floor(totalMinutes / 60),
          total_minutes: totalMinutes % 60,
          sent_at: new Date().toISOString()
        })

        reports.push(reportData)

        // TODO: Send actual emails using your preferred email service
        // Example with Resend:
        // await resend.emails.send({
        //   from: 'NannyTimer <noreply@nannytimer.com>',
        //   to: [employer.email, nanny.email],
        //   subject: `Récapitulatif hebdomadaire - ${formatDate(start)} au ${formatDate(end)}`,
        //   html: generateEmailHTML(reportData)
        // })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${reports.length} report(s) generated`,
      reports
    })
  } catch (error) {
    console.error('Error generating reports:', error)
    return NextResponse.json(
      { error: 'Failed to generate reports' },
      { status: 500 }
    )
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'send-report' })
}
