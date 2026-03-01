<script>
	import { enhance } from '$app/forms';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	/** @typedef {{ id: number, ten_vat_tu: string, don_vi: string, so_luong_ton_kho: number, don_gia_tham_khao: number, yeu_cau_ky_thuat?: string, hinh_anh?: string }} VatTu */
	/** @typedef {{ ten_don_vi: string }} DonVi */

	/** @type {{ data: { vat_tu: VatTu[], don_vi_list: DonVi[], profile?: any }, form: { success?: boolean, error?: string, message?: string } }} */
	let { data, form } = $props();

	let currentRole = $derived(data.profile?.role || 'giao_vien');

	// State
	let showModal = $state(false);
	let showUnitModal = $state(false);
	/** @type {VatTu | null} */
	let editingItem = $state(null);
	let toast = $state({ show: false, message: '', type: 'success' });
	let searchQuery = $state('');
	/** @type {HTMLFormElement | undefined} */
	let importForm = $state();

	// Derived state for filtering
	let filteredVatTu = $derived(
		data.vat_tu.filter(
			(item) =>
				item.ten_vat_tu.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.don_vi.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function showToast(
		/** @type {string} */ message,
		/** @type {'success' | 'error'} */ type = 'success'
	) {
		toast = { show: true, message, type };
		setTimeout(() => {
			toast.show = false;
		}, 3000);
	}

	$effect(() => {
		if (form?.success) {
			showToast(form.message || 'Thao tác thành công', 'success');
		} else if (form?.error) {
			showToast(form.error, 'error');
		}
	});

	function openAddModal() {
		editingItem = null;
		showModal = true;
	}

	function openEditModal(/** @type {VatTu} */ item) {
		editingItem = item;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingItem = null;
	}

	const formatCurrency = (/** @type {number} */ amount) => {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
	};

	let totalItems = $derived(filteredVatTu.length);
	let lowStock = $derived(data.vat_tu.filter((v) => (v.so_luong_ton_kho ?? 0) < 5).length);
	let totalValue = $derived(
		data.vat_tu.reduce(
			(sum, item) => sum + (item.so_luong_ton_kho ?? 0) * (item.don_gia_tham_khao ?? 0),
			0
		)
	);
</script>

<!-- Toast Notification -->
{#if toast.show}
	<div
		transition:fly={{ y: 20, duration: 400, easing: cubicOut }}
		class="fixed right-8 bottom-8 z-[100] flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl {toast.type ===
		'success'
			? 'border-emerald-500/20 bg-emerald-50/90 text-emerald-800'
			: 'border-rose-500/20 bg-rose-50/90 text-rose-800'}"
	>
		{#if toast.type === 'success'}
			<div class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
				<span class="material-symbols-outlined text-emerald-600">check_circle</span>
			</div>
		{:else}
			<div class="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100">
				<span class="material-symbols-outlined text-rose-600">error</span>
			</div>
		{/if}
		<span class="text-sm font-semibold">{toast.message}</span>
	</div>
{/if}

<div class="space-y-6">
	<!-- Header Section -->
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">Quản lý vật tư</h1>
			<p class="mt-0.5 text-sm text-[#64748b]">
				Quản lý và theo dõi danh sách vật tư trong kho của bạn.
			</p>
		</div>
		<div class="flex items-center gap-2">
			{#if currentRole !== 'giao_vien'}
				<form
					bind:this={importForm}
					action="?/importExcel"
					method="POST"
					enctype="multipart/form-data"
					class="hidden"
					use:enhance={() => {
						return async ({ result, update }) => {
							await update();
							const el = /** @type {HTMLInputElement | null} */ (
								document.getElementById('excelDocument')
							);
							if (el) el.value = '';
						};
					}}
				>
					<input
						type="file"
						name="excelDocument"
						id="excelDocument"
						accept=".xlsx, .xls"
						onchange={() => importForm.requestSubmit()}
					/>
				</form>

				<button
					onclick={() => {
						const el = document.getElementById('excelDocument');
						if (el) el.click();
					}}
					class="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
				>
					<span class="material-symbols-outlined text-[20px] text-[#1e5ed4]">upload_file</span>
					<span>Nhập Excel</span>
				</button>
				<button
					onclick={() => (showUnitModal = true)}
					class="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
				>
					<span class="material-symbols-outlined text-[20px] text-[#1e5ed4]">category</span>
					<span>Đơn vị</span>
				</button>
				<button
					onclick={openAddModal}
					class="flex items-center space-x-2 rounded-lg bg-[#1e5ed4] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
				>
					<span class="material-symbols-outlined text-[20px]">add_circle</span>
					<span>Thêm vật tư</span>
				</button>
			{/if}
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<div
			class="flex items-center space-x-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
		>
			<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-[#1e5ed4]">
				<span class="material-symbols-outlined text-2xl">inventory_2</span>
			</div>
			<div>
				<p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">TỔNG SỐ VẬT TƯ</p>
				<p class="text-xl font-bold text-slate-900">{filteredVatTu.length}</p>
			</div>
		</div>
		<div
			class="flex items-center space-x-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
		>
			<div
				class="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600"
			>
				<span class="material-symbols-outlined text-2xl">account_balance_wallet</span>
			</div>
			<div>
				<p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">TỔNG GIÁ TRỊ</p>
				<p class="text-xl font-bold text-emerald-600">{formatCurrency(totalValue)}</p>
			</div>
		</div>
		<div
			class="flex items-center space-x-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
		>
			<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
				<span class="material-symbols-outlined text-2xl">warning</span>
			</div>
			<div>
				<p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">SẮP HẾT HÀNG</p>
				<p class="text-xl font-bold text-rose-600">{lowStock}</p>
			</div>
		</div>
	</div>

	<!-- Table Container -->
	<div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
		<!-- Toolbar -->
		<div class="border-b border-slate-100 bg-white p-4">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div class="flex items-center space-x-2 text-sm text-slate-500">
					<span>Hiển thị</span>
					<select
						class="appearance-none rounded border border-slate-200 bg-slate-50 py-1 pr-6 pl-2 text-xs focus:ring-0"
					>
						<option>15</option>
						<option>30</option>
						<option>50</option>
					</select>
					<span>mục</span>
				</div>
				<div class="relative w-full md:w-80">
					<span
						class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-lg text-slate-400"
						>search</span
					>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Tìm kiếm vật tư theo tên, đơn vị, ghi chú..."
						class="w-full rounded-lg border border-slate-200 bg-white py-1.5 pr-4 pl-10 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4]"
					/>
				</div>
			</div>
		</div>

		<!-- Table -->
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-left">
				<thead>
					<tr class="bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
						<th class="border-b border-slate-100 px-6 py-3">VẬT TƯ</th>
						<th class="border-b border-slate-100 px-6 py-3">ĐƠN VỊ</th>
						<th class="border-b border-slate-100 px-6 py-3 text-center">SỐ LƯỢNG</th>
						<th class="border-b border-slate-100 px-6 py-3">ĐƠN GIÁ</th>
						<th class="border-b border-slate-100 px-6 py-3">THÀNH TIỀN</th>
						{#if currentRole !== 'giao_vien'}
							<th class="border-b border-slate-100 px-6 py-3 text-center">THAO TÁC</th>
						{/if}
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredVatTu as item (item.id)}
						<tr class="group transition-colors hover:bg-slate-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="flex items-center gap-4">
									{#if item.hinh_anh}
										<div
											class="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white"
										>
											<img
												src={item.hinh_anh}
												alt={item.ten_vat_tu}
												class="h-full w-full object-cover"
											/>
										</div>
									{:else}
										<div
											class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400"
										>
											<span class="material-symbols-outlined text-xl">image</span>
										</div>
									{/if}
									<div class="flex min-w-0 flex-col">
										<span class="truncate text-sm font-bold text-slate-900">
											{item.ten_vat_tu}
										</span>
										{#if item.yeu_cau_ky_thuat}
											<span class="mt-0.5 truncate text-xs font-semibold text-slate-500">
												{item.yeu_cau_ky_thuat}
											</span>
										{/if}
									</div>
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span
									class="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600"
								>
									{item.don_vi}
								</span>
							</td>
							<td class="px-6 py-4 text-center whitespace-nowrap">
								{#if (item.so_luong_ton_kho ?? 0) < 5}
									<span
										class="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 ring-1 ring-rose-500/10 ring-inset"
									>
										<span class="mr-1 h-1.5 w-1.5 rounded-full bg-rose-500"></span>
										{item.so_luong_ton_kho ?? 0}
									</span>
								{:else}
									<span class="text-sm font-bold text-slate-700">{item.so_luong_ton_kho ?? 0}</span>
								{/if}
							</td>
							<td class="px-6 py-4 text-sm font-semibold whitespace-nowrap text-slate-600">
								{formatCurrency(item.don_gia_tham_khao ?? 0)}
							</td>
							<td class="px-6 py-4 text-sm font-bold whitespace-nowrap text-[#1e5ed4]">
								{formatCurrency((item.so_luong_ton_kho ?? 0) * (item.don_gia_tham_khao ?? 0))}
							</td>
							{#if currentRole !== 'giao_vien'}
								<td class="px-6 py-4 whitespace-nowrap">
									<div
										class="flex items-center justify-center space-x-3 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100"
									>
										<button
											onclick={() => openEditModal(item)}
											class="hover:text-[#1e5ed4]"
											title="Sửa"
										>
											<span class="material-symbols-outlined fill-1 text-[20px]">edit_square</span>
										</button>
										<form
											action="?/delete"
											method="POST"
											use:enhance={() => {
												return async ({ update }) => {
													await update();
												};
											}}
											class="flex inline-block items-center"
										>
											<input type="hidden" name="id" value={item.id} />
											<button class="hover:text-rose-500" title="Xóa">
												<span class="material-symbols-outlined fill-1 text-[20px]">delete</span>
											</button>
										</form>
									</div>
								</td>
							{/if}
						</tr>
					{:else}
						<tr>
							<td colspan={currentRole !== 'giao_vien' ? '6' : '5'} class="px-6 py-20 text-center">
								<div class="flex flex-col items-center justify-center space-y-3 text-slate-400">
									<span class="material-symbols-outlined text-5xl opacity-40">inventory_2</span>
									<p class="text-sm font-medium text-slate-500">Không tìm thấy vật tư nào.</p>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		<div class="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
			<p class="text-sm text-slate-500">
				Đang hiển thị <span class="font-medium text-slate-800">1</span> đến
				<span class="font-medium text-slate-800">{filteredVatTu.length}</span> của
				<span class="font-medium text-slate-800">{data.vat_tu.length}</span> mục
			</p>
			<!-- Pagination placeholder -->
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
					class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50"
				>
					<span class="material-symbols-outlined text-sm">chevron_right</span>
				</button>
			</div>
		</div>
	</div>
</div>

<!-- Add/Edit Modal -->
{#if showModal}
	<div
		transition:fade={{ duration: 200, easing: cubicOut }}
		class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
			onclick={closeModal}
		></div>

		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			transition:scale={{ duration: 200, start: 0.95, easing: cubicOut }}
			class="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="flex items-center justify-between border-b border-slate-100 px-6 py-5">
				<h2 class="text-lg font-bold text-slate-900">
					{editingItem ? 'Cập nhật vật tư' : 'Thêm vật tư mới'}
				</h2>
				<button
					aria-label="Đóng"
					onclick={closeModal}
					class="text-slate-400 transition-colors hover:text-slate-600"
				>
					<span class="material-symbols-outlined">close</span>
				</button>
			</div>

			<form
				action={editingItem ? '?/update' : '?/create'}
				method="POST"
				enctype="multipart/form-data"
				use:enhance={() => {
					return async ({ result, update }) => {
						await update();
						if (result.type === 'success') {
							closeModal();
						}
					};
				}}
				class="px-6 py-6"
			>
				{#if editingItem}
					<input type="hidden" name="id" value={editingItem.id} />
				{/if}

				<div class="grid grid-cols-2 gap-5">
					<div class="col-span-2 sm:col-span-1">
						<label
							class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
							for="ten_vat_tu">Tên vật tư <span class="text-rose-500">*</span></label
						>
						<input
							type="text"
							id="ten_vat_tu"
							name="ten_vat_tu"
							required
							placeholder="Nhập tên..."
							value={editingItem?.ten_vat_tu ?? ''}
							class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
						/>
					</div>

					<div class="col-span-2 sm:col-span-1">
						<label class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase" for="don_vi"
							>Đơn vị tính <span class="text-rose-500">*</span></label
						>
						<select
							id="don_vi"
							name="don_vi"
							required
							class="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
						>
							<option value="" disabled selected={!editingItem?.don_vi}>Chọn đơn vị</option>
							{#each data.don_vi_list as unit}
								<option value={unit.ten_don_vi} selected={editingItem?.don_vi === unit.ten_don_vi}>
									{unit.ten_don_vi}
								</option>
							{/each}
						</select>
					</div>

					<div class="col-span-2 sm:col-span-1">
						<label
							class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
							for="so_luong">Số lượng <span class="text-rose-500">*</span></label
						>
						<input
							type="number"
							id="so_luong"
							name="so_luong"
							required
							min="0"
							value={editingItem?.so_luong_ton_kho ?? 0}
							class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
						/>
					</div>

					<div class="col-span-2 sm:col-span-1">
						<label class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase" for="don_gia"
							>Đơn giá (VNĐ) <span class="text-rose-500">*</span></label
						>
						<div class="relative">
							<input
								type="number"
								id="don_gia"
								name="don_gia"
								required
								min="0"
								step="0.01"
								value={editingItem?.don_gia_tham_khao ?? 0}
								class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm font-semibold text-[#1e5ed4] focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
							/>
							<div
								class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-400"
							>
								đ
							</div>
						</div>
					</div>

					<div class="col-span-2">
						<label
							class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
							for="hinh_anh_file">Tải lên hình ảnh</label
						>
						<div
							class="flex items-center gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3"
						>
							{#if editingItem?.hinh_anh}
								<img
									src={editingItem.hinh_anh}
									alt="Current"
									class="h-12 w-12 rounded border border-slate-200 bg-white object-cover"
								/>
							{:else}
								<div
									class="flex h-12 w-12 items-center justify-center rounded bg-slate-200 text-slate-500"
								>
									<span class="material-symbols-outlined text-xl">image</span>
								</div>
							{/if}
							<div class="flex-1">
								<input
									type="file"
									id="hinh_anh_file"
									name="hinh_anh_file"
									accept="image/*"
									class="block w-full text-sm text-slate-500 file:mr-4 file:cursor-pointer file:rounded file:border-0 file:bg-[#1e5ed4]/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#1e5ed4] hover:file:bg-[#1e5ed4]/20"
								/>
								<input type="hidden" name="hinh_anh" value={editingItem?.hinh_anh ?? ''} />
							</div>
						</div>
					</div>

					<div class="col-span-2">
						<label
							class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
							for="yeu_cau_ky_thuat">Yêu cầu kỹ thuật</label
						>
						<textarea
							id="yeu_cau_ky_thuat"
							name="yeu_cau_ky_thuat"
							rows="2"
							placeholder="Chi tiết quy cách, chất liệu, tiêu chuẩn..."
							class="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
							>{editingItem?.yeu_cau_ky_thuat ?? ''}</textarea
						>
					</div>
				</div>

				<div class="mt-8 flex items-center justify-end gap-3 pt-2">
					<button
						type="button"
						onclick={closeModal}
						class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
					>
						HỦY BỎ
					</button>
					<button
						type="submit"
						class="rounded-lg bg-[#1e5ed4] px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
					>
						{editingItem ? 'CẬP NHẬT' : 'THÊM MỚI'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Manage Units Modal -->
{#if showUnitModal}
	<div
		transition:fade={{ duration: 200, easing: cubicOut }}
		class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
			onclick={() => (showUnitModal = false)}
		></div>

		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			transition:scale={{ duration: 200, start: 0.95, easing: cubicOut }}
			class="relative w-full max-w-sm transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="flex items-center justify-between border-b border-slate-100 px-6 py-5">
				<h2 class="text-lg font-bold text-slate-900">Danh mục đơn vị</h2>
				<button
					aria-label="Đóng"
					onclick={() => (showUnitModal = false)}
					class="text-slate-400 transition-colors hover:text-slate-600"
				>
					<span class="material-symbols-outlined">close</span>
				</button>
			</div>

			<div class="p-6">
				<form
					action="?/createUnit"
					method="POST"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
						};
					}}
					class="mb-6 flex gap-2"
				>
					<input
						type="text"
						name="ten_don_vi"
						required
						placeholder="Tên đơn vị mới..."
						class="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
					/>
					<button
						type="submit"
						class="rounded-lg bg-[#1e5ed4] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
					>
						Thêm
					</button>
				</form>

				<div class="custom-scrollbar max-h-[300px] space-y-2 overflow-y-auto pr-1">
					{#each data.don_vi_list as unit}
						<div
							class="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 transition-colors hover:bg-slate-100"
						>
							<div class="flex items-center gap-2">
								<span class="material-symbols-outlined text-sm text-slate-400">sell</span>
								<span class="text-sm font-semibold text-slate-700">{unit.ten_don_vi}</span>
							</div>
							<form
								action="?/deleteUnit"
								method="POST"
								use:enhance={() => {
									return async ({ update }) => {
										await update();
									};
								}}
								class="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
							>
								<input type="hidden" name="ten_don_vi" value={unit.ten_don_vi} />
								<button
									aria-label="Xóa đơn vị"
									title="Xóa đơn vị"
									class="rounded p-1 text-slate-400 hover:bg-white hover:text-rose-500"
								>
									<span class="material-symbols-outlined text-sm">delete</span>
								</button>
							</form>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}
