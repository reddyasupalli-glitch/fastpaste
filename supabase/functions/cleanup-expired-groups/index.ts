import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Delete groups that have been inactive for more than 24 hours
    const expiryTime = new Date()
    expiryTime.setHours(expiryTime.getHours() - 24)

    console.log(`Cleaning up groups inactive since: ${expiryTime.toISOString()}`)

    const { data: deletedGroups, error } = await supabase
      .from('groups')
      .delete()
      .lt('last_activity_at', expiryTime.toISOString())
      .select('id, code')

    if (error) {
      console.error('Error deleting expired groups:', error)
      throw error
    }

    console.log(`Deleted ${deletedGroups?.length || 0} expired groups`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        deleted: deletedGroups?.length || 0,
        groups: deletedGroups 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Cleanup error:', error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
