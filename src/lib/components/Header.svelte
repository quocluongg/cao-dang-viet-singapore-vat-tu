<script>
	/** @type {{ session: import('@supabase/supabase-js').Session | null, handleLogout: () => Promise<void> }} */
	let { session, handleLogout } = $props();

	function toggleTheme() {
		document.documentElement.classList.toggle('dark');
	}
</script>

<header
	class="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6"
>
	<div class="flex items-center space-x-2 text-sm text-slate-400">
		<span class="cursor-pointer hover:text-slate-600">Trang chủ</span>
		<span class="material-symbols-outlined text-base">chevron_right</span>
		<span class="font-medium text-slate-800">Quản lý</span>
	</div>

	<div class="flex items-center space-x-6">
		<div
			class="flex cursor-pointer items-center space-x-1.5 text-sm font-medium text-[#1e5ed4] hover:underline"
		>
			<span class="material-symbols-outlined text-lg">redeem</span>
			<span>Hỗ trợ</span>
		</div>
		<div
			class="flex cursor-pointer items-center space-x-1.5 text-sm font-medium text-orange-500 hover:underline"
		>
			<span class="material-symbols-outlined fill-1 text-lg">star</span>
			<span>Báo cáo</span>
		</div>

		<div class="flex items-center space-x-4">
			<button class="relative text-slate-400 hover:text-slate-600">
				<span class="material-symbols-outlined">notifications</span>
				<span class="absolute -top-1 -right-1 h-2 w-2 rounded-full border-2 border-white bg-red-500"
				></span>
			</button>
			<button class="text-slate-400 hover:text-slate-600" onclick={toggleTheme}>
				<span class="material-symbols-outlined">light_mode</span>
			</button>
			<!-- svelte-ignore a11y_consider_explicit_label -->
			<button
				onclick={handleLogout}
				class="text-slate-400 transition-colors hover:text-red-500"
				title="Đăng xuất"
			>
				<span class="material-symbols-outlined">logout</span>
			</button>
		</div>
	</div>
</header>
