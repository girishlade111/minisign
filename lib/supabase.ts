import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if we're in a preview/development context without env vars
const isPreviewMode = !supabaseUrl || !supabaseServiceRoleKey

let supabase

if (isPreviewMode) {
  // Create a mock client for preview contexts
  supabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            data: [],
            error: null,
          }),
          single: () => ({
            data: null,
            error: { code: "PGRST116" },
          }),
        }),
        insert: () => ({
          error: null,
        }),
        update: () => ({
          eq: () => ({
            error: null,
          }),
        }),
        delete: () => ({
          eq: () => ({
            error: null,
          }),
        }),
      }),
    }),
  } as any
} else {
  // Create a real supabase client for production
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export { supabase }
