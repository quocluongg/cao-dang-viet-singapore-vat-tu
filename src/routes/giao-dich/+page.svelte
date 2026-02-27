<script>
	let { data } = $props();
</script>

<!-- Note: For simplicity and based on the provided spec, we are implementing this as a standalone layout/page just for this route to match the SePay UI exactly without affecting the main app layout for now. If you want it integrated into the existing Sidebar/Header, we can move the main content block inside the current layout. Here, we override the entire screen to match the design requested. -->
<svelte:head>
	<title>Giao diện Lịch sử Giao dịch SePay chuẩn</title>
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
		rel="stylesheet"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="fixed inset-0 z-[100] flex min-h-screen bg-[#f8fafc] font-['Inter'] text-slate-800">
	<!-- Sidebar -->
	<aside class="fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-[#1e5ed4] text-white">
		<div class="flex items-center space-x-3 p-6">
			<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
				<span class="material-symbols-outlined text-white">account_balance_wallet</span>
			</div>
			<span class="text-xl font-bold tracking-tight">SePay</span>
		</div>
		<div class="mb-4 px-4">
			<div class="relative">
				<span
					class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-sm text-white/50"
					>search</span
				>
				<input
					class="w-full rounded-lg border-none bg-white/10 py-1.5 pr-4 pl-9 text-sm placeholder-white/50 focus:ring-0"
					placeholder="Tìm kiếm (Ctrl K)"
					type="text"
				/>
			</div>
		</div>
		<nav class="custom-scrollbar flex-1 space-y-0.5 overflow-y-auto px-3">
			<a
				class="flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
				href="/"
			>
				<span class="material-symbols-outlined">grid_view</span>
				<span class="text-sm font-medium">Bảng điều khiển</span>
			</a>
			<a
				class="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 transition-colors"
				href="/giao-dich"
			>
				<div class="flex items-center space-x-3">
					<span class="material-symbols-outlined">receipt_long</span>
					<span class="text-sm font-medium">Giao dịch</span>
				</div>
				<span class="rounded-md bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">NEW</span>
			</a>
			<a
				class="flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
				href="#!"
			>
				<span class="material-symbols-outlined">account_balance</span>
				<span class="text-sm font-medium">Ngân hàng</span>
			</a>
			<a
				class="flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
				href="#!"
			>
				<span class="material-symbols-outlined">qr_code_2</span>
				<span class="text-sm font-medium">Tạo QR</span>
			</a>
			<div class="px-3 pt-6 pb-2 text-[10px] font-bold tracking-widest text-white/40 uppercase">
				HỆ SINH THÁI
			</div>
			<a
				class="group flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
				href="#!"
			>
				<div class="flex flex-col">
					<span class="text-sm font-medium">SEPAY ESHOP</span>
					<span class="text-[10px] text-white/50">Bán hàng & xuất hóa đơn</span>
				</div>
				<span class="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100"
					>chevron_right</span
				>
			</a>
			<a
				class="group flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
				href="#!"
			>
				<div class="flex flex-col">
					<span class="text-sm font-medium">SEPAY EINVOICE</span>
					<span class="text-[10px] text-white/50">Hóa đơn điện tử & API</span>
				</div>
				<span class="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100"
					>chevron_right</span
				>
			</a>
			<div class="px-3 pt-6 pb-2 text-[10px] font-bold tracking-widest text-white/40 uppercase">
				CỔNG THANH TOÁN
			</div>
			<a
				class="flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
				href="#!"
			>
				<span class="material-symbols-outlined">app_registration</span>
				<span class="text-sm font-medium">Đăng ký</span>
			</a>
			<a
				class="flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
				href="#!"
			>
				<span class="material-symbols-outlined">shopping_cart</span>
				<span class="text-sm font-medium">Đơn hàng</span>
			</a>
			<a
				class="flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
				href="#!"
			>
				<span class="material-symbols-outlined">settings</span>
				<span class="text-sm font-medium">Cấu hình</span>
			</a>
		</nav>
		<div class="mt-auto border-t border-white/10 p-4">
			<div class="flex items-center space-x-3">
				<img
					alt="User Avatar"
					class="h-9 w-9 rounded-full object-cover"
					src="https://ui-avatars.com/api/?name=User&background=random"
				/>
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-semibold">User Admin</p>
					<p class="truncate text-[11px] text-white/60">Free Member</p>
				</div>
				<span class="material-symbols-outlined cursor-pointer text-white/50">logout</span>
			</div>
		</div>
	</aside>

	<!-- Main Content -->
	<main class="ml-64 flex h-screen flex-1 flex-col overflow-hidden bg-[#f8fafc]">
		<!-- Header -->
		<header
			class="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6"
		>
			<div class="flex items-center space-x-2 text-sm text-slate-400">
				<span class="cursor-pointer hover:text-slate-600">Giao dịch</span>
				<span class="material-symbols-outlined text-base">chevron_right</span>
				<span class="font-medium text-slate-800">Lịch sử</span>
			</div>
			<div class="flex items-center space-x-6">
				<div
					class="flex cursor-pointer items-center space-x-1.5 text-sm font-medium text-[#1e5ed4] hover:underline"
				>
					<span class="material-symbols-outlined text-lg">redeem</span>
					<span>Ưu đãi</span>
				</div>
				<div
					class="flex cursor-pointer items-center space-x-1.5 text-sm font-medium text-orange-500 hover:underline"
				>
					<span class="material-symbols-outlined fill-1 text-lg">star</span>
					<span>Nâng cấp</span>
				</div>
				<div class="flex items-center space-x-4">
					<button class="relative text-slate-400 hover:text-slate-600">
						<span class="material-symbols-outlined">notifications</span>
						<span
							class="absolute -top-1 -right-1 h-2 w-2 rounded-full border-2 border-white bg-red-500"
						></span>
					</button>
					<button class="text-slate-400 hover:text-slate-600">
						<span class="material-symbols-outlined">light_mode</span>
					</button>
				</div>
			</div>
		</header>

		<!-- Content -->
		<div class="custom-scrollbar flex-1 overflow-y-auto bg-[#f8fafc] p-6">
			<div class="mx-auto max-w-[1400px] space-y-6">
				<!-- Page Header Title -->
				<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
					<div>
						<h1 class="text-2xl font-bold text-slate-900">Danh sách giao dịch</h1>
						<p class="mt-0.5 text-sm text-[#64748b]">
							Quản lý và theo dõi các giao dịch thanh toán của bạn.
						</p>
					</div>
					<div class="flex items-center gap-2">
						<button
							class="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
						>
							<span class="material-symbols-outlined text-[#1e5ed4]">add_circle</span>
							<span>Thêm tài khoản</span>
						</button>
						<button
							class="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
						>
							<span class="material-symbols-outlined text-[#1e5ed4]">qr_code_scanner</span>
							<span>Tạo QR</span>
						</button>
						<button
							class="flex items-center space-x-2 rounded-lg bg-[#1e5ed4] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
						>
							<span class="material-symbols-outlined">account_balance_wallet</span>
							<span>Số dư tài khoản</span>
						</button>
					</div>
				</div>

				<!-- Stats Cards -->
				<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
					<div
						class="flex items-center space-x-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
					>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600"
						>
							<span class="material-symbols-outlined text-2xl">download</span>
						</div>
						<div>
							<p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">TIỀN VÀO</p>
							<p class="text-xl font-bold text-emerald-600">18.000 đ</p>
						</div>
					</div>
					<div
						class="flex items-center space-x-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
					>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100 text-rose-600"
						>
							<span class="material-symbols-outlined text-2xl">upload</span>
						</div>
						<div>
							<p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">TIỀN RA</p>
							<p class="text-xl font-bold text-rose-600">0 đ</p>
						</div>
					</div>
					<div
						class="flex items-center space-x-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
					>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-[#1e5ed4]"
						>
							<span class="material-symbols-outlined text-2xl">account_balance</span>
						</div>
						<div>
							<p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">
								SỐ DƯ HIỆN TẠI
							</p>
							<p class="text-xl font-bold text-slate-900">18.000 đ</p>
						</div>
					</div>
				</div>

				<!-- Filters & Table Container -->
				<div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
					<!-- Toolbar -->
					<div class="border-b border-slate-100 bg-white p-4">
						<div class="flex flex-wrap items-center gap-3">
							<div class="relative w-full md:w-56">
								<select
									class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pr-8 pl-3 text-sm text-slate-600 focus:ring-0"
								>
									<option>Tất cả ngân hàng</option>
								</select>
								<span
									class="material-symbols-outlined pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-slate-400"
									>expand_more</span
								>
							</div>
							<div class="relative w-full md:w-44">
								<select
									class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pr-8 pl-3 text-sm text-slate-600 focus:ring-0"
								>
									<option>Số tiền: Tất cả</option>
								</select>
								<span
									class="material-symbols-outlined pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-slate-400"
									>expand_more</span
								>
							</div>
							<div class="relative w-full md:w-44">
								<select
									class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pr-8 pl-3 text-sm text-slate-600 focus:ring-0"
								>
									<option>Loại: Tất cả</option>
								</select>
								<span
									class="material-symbols-outlined pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-slate-400"
									>expand_more</span
								>
							</div>
							<div
								class="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:w-64"
							>
								<span class="material-symbols-outlined mr-2 text-lg text-slate-400"
									>calendar_today</span
								>
								<input
									class="w-full border-none bg-transparent p-0 text-sm text-slate-600 focus:ring-0"
									placeholder="Khoảng thời gian"
									type="text"
									value="01/03/2024 - 15/03/2024"
								/>
								<button class="text-slate-400 hover:text-rose-500">
									<span class="material-symbols-outlined text-base">close</span>
								</button>
							</div>
							<div class="ml-auto flex items-center gap-3">
								<a
									class="flex items-center space-x-1 text-sm font-medium text-[#1e5ed4] hover:underline"
									href="#!"
								>
									<span class="material-symbols-outlined text-base">refresh</span>
									<span>Làm mới</span>
								</a>
								<button
									class="flex items-center space-x-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
								>
									<span class="material-symbols-outlined text-base">description</span>
									<span>Xuất Excel</span>
								</button>
							</div>
						</div>
						<div class="mt-4 flex flex-wrap items-center justify-between gap-4">
							<div class="flex items-center space-x-2 text-sm text-slate-500">
								<span>Xem</span>
								<select
									class="appearance-none rounded border border-slate-200 bg-slate-50 py-1 pr-6 pl-2 text-xs focus:ring-0"
								>
									<option>15</option>
									<option>30</option>
								</select>
								<span>mục</span>
							</div>
							<div class="relative w-full md:w-72">
								<span
									class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-lg text-slate-400"
									>search</span
								>
								<input
									class="w-full rounded-lg border border-slate-200 bg-white py-1.5 pr-4 pl-10 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4]"
									placeholder="Tìm ID, Số tiền, ND..."
									type="text"
								/>
							</div>
						</div>
					</div>

					<!-- Table -->
					<div class="overflow-x-auto">
						<table class="w-full border-collapse text-left">
							<thead>
								<tr
									class="bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase"
								>
									<th class="border-b border-slate-100 px-6 py-3">ID</th>
									<th class="border-b border-slate-100 px-6 py-3">TÀI KHOẢN</th>
									<th class="border-b border-slate-100 px-6 py-3">TK ẢO</th>
									<th class="border-b border-slate-100 px-6 py-3">TIỀN</th>
									<th class="border-b border-slate-100 px-6 py-3">LŨY KẾ</th>
									<th class="border-b border-slate-100 px-6 py-3">LOẠI GD</th>
									<th class="border-b border-slate-100 px-6 py-3 text-center">TỰ ĐỘNG</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each [1, 2, 3] as item, index}
									<tr class="transition-colors hover:bg-slate-50">
										<td class="px-6 py-4 text-sm whitespace-nowrap">
											<div class="flex items-center space-x-2">
												<span class="material-symbols-outlined fill-1 text-base text-emerald-500"
													>add_circle</span
												>
												<span class="font-medium text-slate-900">4323934{7 - index}</span>
											</div>
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<div class="flex items-center space-x-2">
												<div
													class="flex h-6 w-6 items-center justify-center rounded bg-rose-50 text-rose-500"
												>
													<span class="material-symbols-outlined fill-1 text-[14px]">star</span>
												</div>
												<span class="text-sm font-medium text-slate-700">8330130482710</span>
											</div>
										</td>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-slate-500">VQRQAHFDS2902</td
										>
										<td class="px-6 py-4 text-sm font-bold whitespace-nowrap text-emerald-600"
											>+2,000</td
										>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-slate-600">
											{7 - index * 2},000
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<span
												class="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600"
												>TIỀN VÀO</span
											>
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<div class="flex items-center justify-center space-x-3 text-slate-400">
												<div
													class="flex cursor-pointer items-center space-x-1 hover:text-[#1e5ed4]"
												>
													<span class="material-symbols-outlined text-sm">link</span>
													<span class="text-[10px]">Hook 0</span>
												</div>
												<span
													class="material-symbols-outlined cursor-pointer text-base hover:text-[#1e5ed4]"
													>mail</span
												>
												<span
													class="material-symbols-outlined cursor-pointer text-base hover:text-[#1e5ed4]"
													>smartphone</span
												>
												<span
													class="material-symbols-outlined cursor-pointer text-base hover:text-[#1e5ed4]"
													>campaign</span
												>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<!-- Pagination -->
					<div
						class="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4"
					>
						<p class="text-sm text-slate-500">
							Đang hiển thị <span class="font-medium text-slate-800">1</span> đến
							<span class="font-medium text-slate-800">15</span> của
							<span class="font-medium text-slate-800">1,248</span> mục
						</p>
						<div class="flex items-center space-x-1">
							<button
								class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50"
							>
								<span class="material-symbols-outlined text-sm">chevron_left</span>
							</button>
							<button
								class="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e5ed4] text-sm font-medium text-white"
								>1</button
							>
							<button
								class="flex h-8 w-8 items-center justify-center rounded-full text-sm text-slate-600 hover:bg-slate-100"
								>2</button
							>
							<button
								class="flex h-8 w-8 items-center justify-center rounded-full text-sm text-slate-600 hover:bg-slate-100"
								>3</button
							>
							<span class="px-2 text-slate-400">...</span>
							<button
								class="flex h-8 w-8 items-center justify-center rounded-full text-sm text-slate-600 hover:bg-slate-100"
								>84</button
							>
							<button
								class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50"
							>
								<span class="material-symbols-outlined text-sm">chevron_right</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>

	<!-- Chat Widget Button -->
	<button
		class="fixed right-6 bottom-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#1e5ed4] text-white shadow-xl transition-transform hover:scale-110"
	>
		<span class="material-symbols-outlined text-2xl">chat</span>
	</button>
</div>

<style>
	/* Inline styles just in case global styles aren't loaded */
	:global(.custom-scrollbar::-webkit-scrollbar) {
		width: 4px;
	}
	:global(.custom-scrollbar::-webkit-scrollbar-track) {
		background: transparent;
	}
	:global(.custom-scrollbar::-webkit-scrollbar-thumb) {
		background: #cbd5e1;
		border-radius: 10px;
	}
	:global(.material-symbols-outlined) {
		font-variation-settings:
			'FILL' 0,
			'wght' 400,
			'GRAD' 0,
			'opsz' 20;
	}
	:global(.fill-1) {
		font-variation-settings: 'FILL' 1 !important;
	}
</style>
