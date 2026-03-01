import { supabase } from '$lib/supabaseClient';

export const ssr = false;

export async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    let profile = null;

    if (session?.user) {
        const { data } = await supabase
            .from('profiles')
            .select('role, ho_ten')
            .eq('id', session.user.id)
            .single();
        profile = data || { ho_ten: session.user.email?.split('@')[0] || 'Tài khoản giả lập', role: 'giao_vien' };

        // Auto-grant admin role for any admin email for testing convenience
        if (session.user.email?.toLowerCase().includes('admin')) {
            profile.role = 'admin';
        }
    }

    return { session, profile };
}
