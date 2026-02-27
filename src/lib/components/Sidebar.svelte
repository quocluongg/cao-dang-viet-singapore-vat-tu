<script>
	import { slide } from 'svelte/transition';
	let { activePath = '/' } = $props();

	const menuItems = [
		{ name: 'Danh sách vật tư', href: '/', icon: 'inventory_2' },
		{ name: 'Nhập kho', href: '/vat-tu/nhap-kho', icon: 'vertical_align_bottom' },
		{ name: 'Xuất kho', href: '/vat-tu/xuat-kho', icon: 'vertical_align_top' },
		{ name: 'Báo cáo tồn kho', href: '/vat-tu/bao-cao', icon: 'description' },
		{ name: 'Đề xuất Vật tư', href: '/de-xuat', icon: 'content_paste' }
	];

	const qlItems = [
		{ name: 'Quản lý Giáo viên', href: '/giao-vien', icon: 'group' },
		{ name: 'Quản lý Môn học', href: '/mon-hoc', icon: 'menu_book' },
		{
			name: 'Cơ cấu Tổ chức',
			href: '#!',
			icon: 'account_tree',
			children: [
				{ name: 'Quản lý Khoa', href: '/khoa', icon: 'grid_view' },
				{ name: 'Quản lý Ngành', href: '/nganh', icon: 'layers' },
				{ name: 'Hệ Đào tạo', href: '/he-dao-tao', icon: 'workspace_premium' }
			]
		},
		{ name: 'Hỗ trợ', href: '/ho-tro', icon: 'support_agent' }
	];

	/**
	 * @param {{ href: string, children?: { href: string }[] }} item
	 * @param {string} currentPath
	 */
	function isItemOrChildActive(item, currentPath) {
		if (item.href === currentPath) return true;
		if (item.children && item.children.some((c) => c.href === currentPath)) return true;
		return false;
	}
</script>

<aside class="fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-[#1e5ed4] text-white">
	<div class="flex items-center space-x-3 p-6">
		<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
			<!-- Logo replacement -->
			<span class="material-symbols-outlined text-white">account_balance_wallet</span>
		</div>
		<span class="text-xl font-bold tracking-tight">AdminPanel</span>
	</div>

	<div class="mb-4 px-4">
		<div class="relative">
			<span
				class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-sm text-white/50"
				>search</span
			>
			<input
				class="w-full rounded-lg border-none bg-white/10 py-1.5 pr-4 pl-9 text-sm text-white placeholder-white/50 focus:ring-0"
				placeholder="Tìm kiếm (Ctrl K)"
				type="text"
			/>
		</div>
	</div>

	<nav class="custom-scrollbar flex-1 space-y-0.5 overflow-y-auto px-3">
		<div class="px-3 pt-2 pb-2 text-[10px] font-bold tracking-widest text-white/40 uppercase">
			VẬT TƯ
		</div>
		{#each menuItems as item}
			<a
				href={item.href}
				class="flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors {activePath ===
				item.href
					? 'bg-white/20'
					: 'hover:bg-white/10'}"
			>
				<span class="material-symbols-outlined text-[20px]">{item.icon}</span>
				<span class="text-sm font-medium">{item.name}</span>
			</a>
		{/each}

		<div class="px-3 pt-6 pb-2 text-[10px] font-bold tracking-widest text-white/40 uppercase">
			HỆ THỐNG
		</div>
		{#each qlItems as item}
			{#if item.children}
				{@const isActiveGroup = isItemOrChildActive(item, activePath)}
				<div class="flex flex-col">
					<a
						href={item.href}
						class="flex items-center justify-between rounded-lg px-3 py-2 transition-colors {activePath ===
						item.href
							? 'bg-white/20'
							: 'hover:bg-white/10'}"
					>
						<div class="flex items-center space-x-3">
							<span class="material-symbols-outlined text-[20px]">{item.icon}</span>
							<span class="text-sm font-medium">{item.name}</span>
						</div>
						<span
							class="material-symbols-outlined text-[16px] opacity-70 transition-transform {isActiveGroup
								? 'rotate-180'
								: ''}">expand_more</span
						>
					</a>
					{#if isActiveGroup}
						<div
							class="mt-0.5 flex flex-col space-y-0.5 overflow-hidden pl-4"
							transition:slide={{ duration: 200 }}
						>
							{#each item.children as child}
								<a
									href={child.href}
									class="flex items-center space-x-3 rounded-lg px-3 py-1.5 transition-colors {activePath ===
									child.href
										? 'bg-white/20'
										: 'text-white/70 hover:bg-white/10 hover:text-white'}"
								>
									<span class="material-symbols-outlined text-[18px]">{child.icon}</span>
									<span class="text-[13px] font-medium">{child.name}</span>
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{:else}
				<a
					href={item.href}
					class="flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors {activePath ===
					item.href
						? 'bg-white/20'
						: 'hover:bg-white/10'}"
				>
					<span class="material-symbols-outlined text-[20px]">{item.icon}</span>
					<span class="text-sm font-medium">{item.name}</span>
				</a>
			{/if}
		{/each}
	</nav>

	<div class="mt-auto border-t border-white/10 p-4">
		<div class="flex items-center space-x-3">
			<img
				alt="User Avatar"
				class="h-9 w-9 rounded-full object-cover"
				src="https://ui-avatars.com/api/?name=Admin&background=random"
			/>
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-semibold">Administrator</p>
				<p class="truncate text-[11px] text-white/60">Quản trị viên</p>
			</div>
			<button class="flex items-center justify-center">
				<span
					class="material-symbols-outlined cursor-pointer text-white/50 transition-colors hover:text-white"
					>logout</span
				>
			</button>
		</div>
	</div>
</aside>
