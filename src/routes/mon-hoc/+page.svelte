<script>
	import { enhance } from '$app/forms';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import * as xlsx from 'xlsx';

	/** @typedef {{ id: number, ten_khoa: string }} Khoa */
	/** @typedef {{ id: number, ten_nganh: string, ma_nganh: string }} Nganh */
	/** @typedef {{ id: number, ten_he: string }} HeDaoTao */
	/** @typedef {{ id: number, nganh: Nganh, he_dao_tao: HeDaoTao }} NganhHeMon */
	/** @typedef {{ id: number, ten_mon_hoc: string, ma_mon_hoc: string, ghi_chu: string, khoa_mon_hoc: { khoa: Khoa }[], nganh_he_mon: NganhHeMon[] }} MonHoc */

	/** @type {{ data: { mon_hoc: MonHoc[], khoa_list: Khoa[], nganh_list: Nganh[], he_dao_tao_list: HeDaoTao[] }, form: { success?: boolean, error?: string, message?: string } }} */
	let { data, form } = $props();

	// State
	let showModal = $state(false);
	let toast = $state({ show: false, message: '', type: 'success' });
	let searchQuery = $state('');

	let tenMonHoc = $state('');
	let maMonHoc = $state('');
	let ghiChu = $state('');

	/** @type {number[]} */
	let selectedKhoaIds = $state([]);

	/** @type {{ nganh_id: string, he_id: string }[]} */
	let nganhHeList = $state([]);

	/** @type {MonHoc | null} */
	let editingItem = $state(null);

	let activeTab = $state('Tất cả');
	let selectedKhoaFilter = $state('');
	let selectedNganhFilter = $state('');

	// Derived state for filtering
	let filteredMonHoc = $derived(
		data.mon_hoc.filter((item) => {
			let passTab = true;
			if (activeTab !== 'Tất cả') {
				passTab =
					!!item.nganh_he_mon &&
					item.nganh_he_mon.some(
						(nhm) => nhm.he_dao_tao?.ten_he.toLowerCase() === activeTab.toLowerCase()
					);
			}

			let passKhoa = true;
			if (selectedKhoaFilter) {
				passKhoa =
					!!item.khoa_mon_hoc &&
					item.khoa_mon_hoc.some((km) => km.khoa?.id.toString() === selectedKhoaFilter);
			}

			let passNganh = true;
			if (selectedNganhFilter) {
				passNganh =
					!!item.nganh_he_mon &&
					item.nganh_he_mon.some((nhm) => nhm.nganh?.id.toString() === selectedNganhFilter);
			}

			const s = searchQuery.toLowerCase();
			let passSearch = true;
			if (s) {
				passSearch =
					item.ten_mon_hoc.toLowerCase().includes(s) ||
					item.ma_mon_hoc.toLowerCase().includes(s) ||
					(item.khoa_mon_hoc &&
						item.khoa_mon_hoc.some((km) => km.khoa?.ten_khoa.toLowerCase().includes(s))) ||
					(item.nganh_he_mon &&
						item.nganh_he_mon.some(
							(nhm) =>
								nhm.nganh?.ten_nganh.toLowerCase().includes(s) ||
								nhm.he_dao_tao?.ten_he.toLowerCase().includes(s)
						));
			}

			return passTab && passKhoa && passNganh && passSearch;
		})
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
		tenMonHoc = '';
		maMonHoc = '';
		ghiChu = '';
		selectedKhoaIds = [];
		nganhHeList = [];
		showModal = true;
	}

	function openEditModal(/** @type {MonHoc} */ item) {
		editingItem = item;
		tenMonHoc = item.ten_mon_hoc || '';
		maMonHoc = item.ma_mon_hoc || '';
		ghiChu = item.ghi_chu || '';

		// Extract selected Khoa IDs
		selectedKhoaIds = (item.khoa_mon_hoc || []).filter((km) => km.khoa).map((km) => km.khoa.id);

		// Extract selected Nganh He Combo
		nganhHeList = (item.nganh_he_mon || [])
			.filter((nh) => nh.nganh && nh.he_dao_tao)
			.map((nh) => ({ nganh_id: nh.nganh.id.toString(), he_id: nh.he_dao_tao.id.toString() }));

		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingItem = null;
	}

	function exportExcel() {
		const dataToExport = filteredMonHoc.map((mh, index) => {
			const khoaNames =
				mh.khoa_mon_hoc
					?.map((km) => km.khoa?.ten_khoa)
					.filter(Boolean)
					.join(', ') || '';
			const nganhHeNames =
				mh.nganh_he_mon
					?.map((nh) => `${nh.nganh?.ten_nganh} (${nh.he_dao_tao?.ten_he})`)
					.filter(Boolean)
					.join(', ') || '';
			return {
				STT: index + 1,
				'Mã môn học': mh.ma_mon_hoc,
				'Tên môn học': mh.ten_mon_hoc,
				'Khoa/Bộ môn': khoaNames,
				'Thuộc Ngành - Hệ': nganhHeNames,
				'Ghi chú': mh.ghi_chu || ''
			};
		});

		const worksheet = xlsx.utils.json_to_sheet(dataToExport);
		const workbook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(workbook, worksheet, 'MonHoc');
		xlsx.writeFile(workbook, 'Danh_Sach_Mon_Hoc.xlsx');
	}

	function handleKhoaToggle(/** @type {number} */ khoaId, /** @type {Event} */ e) {
		const target = /** @type {HTMLInputElement} */ (e.target);
		if (target.checked) {
			selectedKhoaIds = [...selectedKhoaIds, khoaId];
		} else {
			selectedKhoaIds = selectedKhoaIds.filter((id) => id !== khoaId);
		}
	}

	function addNganhHeItem() {
		if (data.nganh_list.length > 0 && data.he_dao_tao_list.length > 0) {
			nganhHeList = [
				...nganhHeList,
				{
					nganh_id: data.nganh_list[0].id.toString(),
					he_id: data.he_dao_tao_list[0].id.toString()
				}
			];
		}
	}

	function removeNganhHeItem(/** @type {number} */ index) {
		nganhHeList = nganhHeList.filter((_, i) => i !== index);
	}
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
			<h1 class="text-2xl font-bold text-slate-900">Quản lý Môn học</h1>
			<p class="mt-0.5 text-sm text-[#64748b]">
				Quản lý danh sách môn học, phân công khoa và thuộc ngành/hệ đào tạo.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<button
				onclick={exportExcel}
				class="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
			>
				<span class="material-symbols-outlined text-[20px] text-emerald-600">description</span>
				<span>Xuất Excel</span>
			</button>
			<button
				onclick={openAddModal}
				class="flex items-center space-x-2 rounded-lg bg-[#1e5ed4] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
			>
				<span class="material-symbols-outlined text-[20px]">add_circle</span>
				<span>Thêm môn học</span>
			</button>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div
			class="flex items-center space-x-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
		>
			<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-[#1e5ed4]">
				<span class="material-symbols-outlined text-2xl">menu_book</span>
			</div>
			<div>
				<p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">TỔNG MÔN HỌC</p>
				<p class="text-xl font-bold text-slate-900">{filteredMonHoc.length}</p>
			</div>
		</div>
	</div>

	<!-- Toolbar & Filters -->
	<div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
		<!-- Toolbar Tabs -->
		<div class="border-b border-slate-100 bg-white p-4">
			<div class="flex flex-wrap gap-2">
				{#each ['Tất cả', 'Cao đẳng', 'Cao đẳng liên thông', 'Trung cấp'] as tab}
					<button
						onclick={() => (activeTab = tab)}
						class="rounded-lg px-4 py-2 text-sm font-semibold transition-all {activeTab === tab
							? 'bg-[#1e5ed4]/10 text-[#1e5ed4]'
							: 'bg-transparent text-slate-600 hover:bg-slate-50'}"
					>
						{tab}
					</button>
				{/each}
			</div>
		</div>

		<!-- Toolbar -->
		<div class="border-b border-slate-100 bg-white p-4">
			<div class="flex flex-col gap-3 md:flex-row md:items-center">
				<div class="relative w-full md:flex-1">
					<span
						class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-lg text-slate-400"
						>search</span
					>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Tìm kiếm môn học theo tên, mã..."
						class="w-full rounded-lg border border-slate-200 bg-white py-2 pr-4 pl-10 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4]"
					/>
				</div>

				<!-- Khoa Filter -->
				<div class="relative w-full md:w-56">
					<select
						bind:value={selectedKhoaFilter}
						class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pr-8 pl-3 text-sm text-slate-600 focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
					>
						<option value="">-- Lọc theo Khoa --</option>
						{#each data.khoa_list as khoa}
							<option value={khoa.id.toString()}>{khoa.ten_khoa}</option>
						{/each}
					</select>
					<span
						class="material-symbols-outlined pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-slate-400"
						>expand_more</span
					>
				</div>

				<!-- Nganh Filter -->
				<div class="relative w-full md:w-56">
					<select
						bind:value={selectedNganhFilter}
						class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pr-8 pl-3 text-sm text-slate-600 focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
					>
						<option value="">-- Lọc theo Ngành --</option>
						{#each data.nganh_list as nganh}
							<option value={nganh.id.toString()}>{nganh.ten_nganh}</option>
						{/each}
					</select>
					<span
						class="material-symbols-outlined pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-slate-400"
						>expand_more</span
					>
				</div>
			</div>
		</div>

		<!-- Table -->
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-left">
				<thead>
					<tr class="bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
						<th class="border-b border-slate-100 px-6 py-3">MÃ MÔN</th>
						<th class="border-b border-slate-100 px-6 py-3">TÊN MÔN HỌC</th>
						<th class="border-b border-slate-100 px-6 py-3">KHOA/BỘ MÔN</th>
						<th class="border-b border-slate-100 px-6 py-3">NGÀNH - HỆ</th>
						<th class="border-b border-slate-100 px-6 py-3 text-right">THAO TÁC</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredMonHoc as item (item.id)}
						<tr class="group transition-colors hover:bg-slate-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<span
									class="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 uppercase"
								>
									{item.ma_mon_hoc}
								</span>
							</td>
							<td class="px-6 py-4">
								<div
									class="text-sm font-bold text-slate-900 transition-colors group-hover:text-[#1e5ed4]"
								>
									{item.ten_mon_hoc}
								</div>
								{#if item.ghi_chu}
									<div class="mt-1 text-xs text-slate-500">{item.ghi_chu}</div>
								{/if}
							</td>
							<td class="px-6 py-4">
								<div class="flex flex-wrap gap-1.5">
									{#each item.khoa_mon_hoc as km}
										{#if km.khoa}
											<span
												class="inline-flex items-center rounded bg-[#1e5ed4]/10 px-2 py-0.5 text-[11px] font-semibold text-[#1e5ed4]"
											>
												{km.khoa.ten_khoa}
											</span>
										{/if}
									{/each}
									{#if !item.khoa_mon_hoc || item.khoa_mon_hoc.length === 0}
										<span class="text-xs text-slate-400 italic">Chưa phân khoa</span>
									{/if}
								</div>
							</td>
							<td class="px-6 py-4">
								<div class="flex flex-col gap-1.5">
									{#each item.nganh_he_mon as nhm}
										{#if nhm.nganh && nhm.he_dao_tao}
											<span
												class="inline-flex items-center rounded bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-700"
											>
												{nhm.nganh.ten_nganh} <span class="mx-1 text-purple-400 opacity-50">•</span>
												{nhm.he_dao_tao.ten_he}
											</span>
										{/if}
									{/each}
									{#if !item.nganh_he_mon || item.nganh_he_mon.length === 0}
										<span class="text-xs text-slate-400 italic">Chưa thiết lập Ngành - Hệ</span>
									{/if}
								</div>
							</td>
							<td class="px-6 py-4 text-right whitespace-nowrap">
								<div
									class="flex items-center justify-end space-x-3 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100"
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
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="px-6 py-20 text-center">
								<div class="flex flex-col items-center justify-center space-y-3 text-slate-400">
									<span class="material-symbols-outlined text-5xl opacity-40">menu_book</span>
									<p class="text-sm font-medium text-slate-500">Không tìm thấy môn học nào.</p>
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
				<span class="font-medium text-slate-800">{filteredMonHoc.length}</span> của
				<span class="font-medium text-slate-800">{data.mon_hoc.length}</span> mục
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
			class="relative max-h-[90vh] w-full max-w-2xl transform overflow-y-auto rounded-2xl bg-white text-left shadow-2xl transition-all"
			onclick={(e) => e.stopPropagation()}
		>
			<div
				class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5"
			>
				<h2 class="text-lg font-bold text-slate-900">
					{editingItem ? 'Cập nhật Môn Học' : 'Thêm Môn Học Mới'}
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

				<!-- Hidden inputs for Nganh_He data -->
				<input type="hidden" name="nganh_he_data" value={JSON.stringify(nganhHeList)} />

				<div class="grid grid-cols-2 gap-5">
					<div class="col-span-2 md:col-span-1">
						<label
							class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
							for="ten_mon_hoc">Tên môn học <span class="text-rose-500">*</span></label
						>
						<input
							type="text"
							id="ten_mon_hoc"
							name="ten_mon_hoc"
							bind:value={tenMonHoc}
							required
							placeholder="Nhập tên môn học..."
							class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
						/>
					</div>

					<div class="col-span-2 md:col-span-1">
						<label
							class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
							for="ma_mon_hoc">Mã môn học <span class="text-rose-500">*</span></label
						>
						<input
							type="text"
							id="ma_mon_hoc"
							name="ma_mon_hoc"
							bind:value={maMonHoc}
							required
							placeholder="VD: INT1234"
							class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm uppercase focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
						/>
					</div>

					<div class="col-span-2">
						<div class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase">
							Khoa quản lý (có thể chọn nhiều)
						</div>
						<div class="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
							{#each data.khoa_list as khoa}
								<label class="flex cursor-pointer items-center gap-2">
									<input
										type="checkbox"
										name="khoa_ids"
										value={khoa.id}
										checked={selectedKhoaIds.includes(khoa.id)}
										onchange={(e) => handleKhoaToggle(khoa.id, e)}
										class="h-4 w-4 rounded border-slate-300 text-[#1e5ed4] focus:ring-[#1e5ed4]"
									/>
									<span class="text-sm font-medium text-slate-700">{khoa.ten_khoa}</span>
								</label>
							{/each}
							{#if data.khoa_list.length === 0}
								<span class="text-sm text-slate-500 italic"
									>Chưa có khoa nào trong hệ thống, hãy tạo ở mục Quản lý Khoa.</span
								>
							{/if}
						</div>
					</div>

					<div class="col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
						<div class="mb-4 flex items-center justify-between">
							<div class="block text-xs font-semibold text-slate-700 uppercase">
								Thuộc Ngành & Hệ đào tạo
							</div>
							<button
								type="button"
								onclick={addNganhHeItem}
								class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1e5ed4] hover:text-[#1e5ed4]"
							>
								<span class="material-symbols-outlined text-[16px]">add</span>
								Thêm trường
							</button>
						</div>

						<div class="space-y-3">
							{#each nganhHeList as nh, index}
								<div
									class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
								>
									<div class="flex-1">
										<select
											bind:value={nh.nganh_id}
											class="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
										>
											{#each data.nganh_list as nganh}
												<option value={nganh.id.toString()}>{nganh.ten_nganh}</option>
											{/each}
										</select>
									</div>
									<span class="text-slate-400">-</span>
									<div class="flex-1">
										<select
											bind:value={nh.he_id}
											class="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
										>
											{#each data.he_dao_tao_list as he}
												<option value={he.id.toString()}>{he.ten_he}</option>
											{/each}
										</select>
									</div>
									<button
										type="button"
										onclick={() => removeNganhHeItem(index)}
										class="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
									>
										<span class="material-symbols-outlined text-[16px]">close</span>
									</button>
								</div>
							{/each}
							{#if nganhHeList.length === 0}
								<div class="py-2 text-center text-xs text-slate-500 italic">
									Bấm 'Thêm trường' để gắn môn học này với các ngành và hệ tương ứng.
								</div>
							{/if}
						</div>
					</div>

					<div class="col-span-2">
						<label class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase" for="ghi_chu"
							>Ghi chú thêm</label
						>
						<textarea
							id="ghi_chu"
							name="ghi_chu"
							bind:value={ghiChu}
							rows="2"
							placeholder="Nhập ghi chú thêm về môn học..."
							class="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
						></textarea>
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
