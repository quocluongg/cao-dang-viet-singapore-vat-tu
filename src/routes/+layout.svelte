<script>
	import { supabase } from '$lib/supabaseClient';
	import { goto, invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import './layout.css';

	import Sidebar from '$lib/components/Sidebar.svelte';
	import Header from '$lib/components/Header.svelte';

	let { children } = $props();
	/** @type {import('@supabase/supabase-js').Session | null} */
	let session = $state(null);
	let isAuthRoute = $derived(
		['/login', '/signup', '/forgot-password'].includes($page.url.pathname)
	);

	onMount(() => {
		supabase.auth.getSession().then(({ data: { session: s } }) => {
			session = s;
		});

		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_event, _session) => {
			session = _session;
			invalidateAll();
		});

		return () => subscription.unsubscribe();
	});

	async function handleLogout() {
		await supabase.auth.signOut();
		goto('/login');
	}
</script>

{#if isAuthRoute}
	<div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
		{@render children()}
	</div>
{:else}
	<div class="fixed inset-0 flex min-h-screen bg-[#f8fafc] font-['Inter'] text-slate-800">
		<Sidebar activePath={$page.url.pathname} />
		<div class="ml-64 flex h-screen flex-1 flex-col overflow-hidden bg-[#f8fafc]">
			<Header {session} {handleLogout} />
			<main class="custom-scrollbar flex-1 overflow-y-auto bg-[#f8fafc] p-6">
				<div class="mx-auto max-w-[1400px]">
					{@render children()}
				</div>
			</main>
		</div>
	</div>
{/if}
