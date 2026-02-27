<script>
	import { enhance } from '$app/forms';
	import { fade, fly, slide, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import * as xlsx from 'xlsx';

	/** @typedef {{ id: number, ten_vat_tu: string, don_vi: string, so_luong: number, don_gia: number, yeu_cau_ky_thuat: string }} VatTu */
	/** @typedef {{ id: number, ten_khoa: string }} Khoa */
	/** @typedef {{ id: number, ten_nganh: string }} Nganh */
	/** @typedef {{ id: number, ten_he: string }} HeDaoTao */
	/** @typedef {{ id: number, ten_mon_hoc: string, ma_mon_hoc: string }} MonHoc */
	/** @typedef {{ id: string, ho_ten: string }} GiaoVien */
	/** @typedef {{ id: number, phieu_id: string, vat_tu_id: number, so_luong_de_xuat: number, so_luong_da_cap: number, mon_hoc_id: number, khoa_id: number, nganh_id: number, he_id: number, vat_tu: VatTu, mon_hoc: MonHoc, khoa: Khoa, nganh: Nganh, he_dao_tao: HeDaoTao }} ChiTietDeXuat */
	/** @typedef {{ id: string, giao_vien_id: string, ngay_de_xuat: string, ly_do_de_xuat: string, trang_thai: string, giao_vien: GiaoVien, chi_tiet_de_xuat: ChiTietDeXuat[] }} PhieuDeXuat */

	/** @type {{ data: { phieu_de_xuat: PhieuDeXuat[], giao_vien_list: GiaoVien[], vat_tu_list: VatTu[], mon_hoc_list: MonHoc[], khoa_list: Khoa[], nganh_list: Nganh[], he_dao_tao_list: HeDaoTao[] }, form: { success?: boolean, error?: string, message?: string } }} */
	let { data, form } = $props();

	// State
	let showModal = $state(false);
	let viewMode = $state(false); // If true, modal is readonly
	let toast = $state({ show: false, message: '', type: 'success' });
	let searchQuery = $state('');

	let giaoVienId = $state('');
	let lyDoDeXuat = $state('');
	let trangThai = $state('cho_duyet');

	/** @type {{ id: number, vat_tu_id: string, so_luong_de_xuat: number, mon_hoc_id: string, khoa_id: string, nganh_id: string, he_id: string }[]} */
	let chiTietList = $state([]);

	/** @type {PhieuDeXuat | null} */
	let editingItem = $state(null);

	/** @type {number | null} */
	let openDropdownId = $state(null);
	let vatTuSearchQuery = $state('');

	let currentFilteredVatTuList = $derived(
		data.vat_tu_list.filter((vt) => {
			if (!vatTuSearchQuery) return true;
			const q = vatTuSearchQuery.toLowerCase();
			return (
				vt.ten_vat_tu.toLowerCase().includes(q) ||
				(vt.yeu_cau_ky_thuat && vt.yeu_cau_ky_thuat.toLowerCase().includes(q))
			);
		})
	);

	function getVatTuName(/** @type {string | null} */ id) {
		if (!id) return '-- Chọn con hàng --';
		const vt = data.vat_tu_list.find((v) => v.id.toString() === id.toString());
		if (!vt) return '-- Chọn con hàng --';
		let text = vt.ten_vat_tu;
		if (vt.yeu_cau_ky_thuat) text += ` - ${vt.yeu_cau_ky_thuat}`;
		return text + ` (${vt.don_vi})`;
	}

	function focusOnMount(/** @type {HTMLElement} */ node) {
		setTimeout(() => node.focus(), 10);
	}

	let filteredPhieu = $derived(
		data.phieu_de_xuat.filter(
			(item) =>
				item.giao_vien?.ho_ten.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(item.ly_do_de_xuat &&
					item.ly_do_de_xuat.toLowerCase().includes(searchQuery.toLowerCase())) ||
				item.trang_thai.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function showToast(
		/** @type {string} */ message,
		/** @type {'success' | 'error'} */ type = 'success'
	) {
		toast = { show: true, message, type };
		setTimeout(() => (toast.show = false), 3000);
	}

	$effect(() => {
		if (form?.success) {
			showToast(form.message || 'Thao tác thành công', 'success');
		} else if (form?.error) {
			showToast(form.error, 'error');
		}
	});

	function getTrangThaiBadge(/** @type {string} */ st) {
		if (st === 'cho_duyet')
			return {
				text: 'Chờ duyệt',
				classes: 'bg-amber-100 text-amber-700 border border-amber-200'
			};
		if (st === 'da_duyet')
			return {
				text: 'Đã duyệt',
				classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200'
			};
		if (st === 'tu_choi')
			return {
				text: 'Từ chối',
				classes: 'bg-rose-100 text-rose-700 border border-rose-200'
			};
		return { text: st, classes: 'bg-slate-100 text-slate-700 border border-slate-200' };
	}

	function openAddModal() {
		editingItem = null;
		viewMode = false;
		giaoVienId = '';
		lyDoDeXuat = '';
		trangThai = 'cho_duyet';
		openDropdownId = null;
		chiTietList = [];
		addNewChiTiet();
		showModal = true;
	}

	function openEditModal(/** @type {PhieuDeXuat} */ item, /** @type {boolean} */ readonly = false) {
		editingItem = item;
		viewMode = readonly || item.trang_thai === 'da_duyet';
		giaoVienId = item.giao_vien_id || '';
		lyDoDeXuat = item.ly_do_de_xuat || '';
		trangThai = item.trang_thai || 'cho_duyet';

		chiTietList = item.chi_tiet_de_xuat.map((ct) => ({
			id: Math.random(),
			vat_tu_id: ct.vat_tu_id ? ct.vat_tu_id.toString() : '',
			so_luong_de_xuat: ct.so_luong_de_xuat || 1,
			mon_hoc_id: ct.mon_hoc_id ? ct.mon_hoc_id.toString() : '',
			khoa_id: ct.khoa_id ? ct.khoa_id.toString() : '',
			nganh_id: ct.nganh_id ? ct.nganh_id.toString() : '',
			he_id: ct.he_id ? ct.he_id.toString() : ''
		}));

		openDropdownId = null;
		if (chiTietList.length === 0 && !viewMode) addNewChiTiet();
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingItem = null;
	}

	function addNewChiTiet() {
		chiTietList = [
			...chiTietList,
			{
				id: Math.random(),
				vat_tu_id: '',
				so_luong_de_xuat: 1,
				mon_hoc_id: '',
				khoa_id: '',
				nganh_id: '',
				he_id: ''
			}
		];
	}

	function removeChiTiet(/** @type {number} */ id) {
		chiTietList = chiTietList.filter((c) => c.id !== id);
	}

	function exportExcel() {
		// Simplified export
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
			<h1 class="text-2xl font-bold text-slate-900">Đề xuất nhu cầu Vật tư</h1>
			<p class="mt-0.5 text-sm text-[#64748b]">
				Làm đề xuất hoặc bảng dự trù danh mục vật tư lên phòng quản lý.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<button
				onclick={openAddModal}
				class="flex items-center space-x-2 rounded-lg bg-[#1e5ed4] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
			>
				<span class="material-symbols-outlined text-[20px]">add_circle</span>
				<span>Tạo đề xuất mới</span>
			</button>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<div
			class="flex items-center space-x-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
		>
			<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-[#1e5ed4]">
				<span class="material-symbols-outlined text-2xl">receipt_long</span>
			</div>
			<div>
				<p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">TỔNG ĐỀ XUẤT</p>
				<p class="text-xl font-bold text-slate-900">{filteredPhieu.length}</p>
			</div>
		</div>
		<div
			class="flex items-center space-x-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
		>
			<div
				class="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600"
			>
				<span class="material-symbols-outlined text-2xl">pending_actions</span>
			</div>
			<div>
				<p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">CHỜ DUYỆT</p>
				<p class="text-xl font-bold text-amber-600">
					{data.phieu_de_xuat.filter((p) => p.trang_thai === 'cho_duyet').length}
				</p>
			</div>
		</div>
		<div
			class="flex items-center space-x-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
		>
			<div
				class="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600"
			>
				<span class="material-symbols-outlined text-2xl">task_alt</span>
			</div>
			<div>
				<p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">ĐÃ DUYỆT</p>
				<p class="text-xl font-bold text-emerald-600">
					{data.phieu_de_xuat.filter((p) => p.trang_thai === 'da_duyet').length}
				</p>
			</div>
		</div>
	</div>

	<!-- Search & List Container -->
	<div class="space-y-4">
		<!-- Search -->
		<div class="relative w-full max-w-md">
			<span
				class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-lg text-slate-400"
				>search</span
			>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Tìm kiếm phiếu đề xuất..."
				class="w-full rounded-lg border border-slate-200 bg-white py-2 pr-4 pl-10 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4]"
			/>
		</div>

		<!-- Grid items -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredPhieu as phieu (phieu.id)}
				{@const badge = getTrangThaiBadge(phieu.trang_thai)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					onclick={() => openEditModal(phieu, true)}
					class="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#1e5ed4] hover:shadow-md"
				>
					<div class="mb-3 flex items-start justify-between">
						<div>
							<span
								class="inline-flex rounded px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase {badge.classes}"
							>
								{badge.text}
							</span>
						</div>
						<div class="text-xs font-medium text-slate-500">
							{new Date(phieu.ngay_de_xuat).toLocaleDateString('vi-VN')}
						</div>
					</div>

					<h3
						class="mb-3 line-clamp-2 text-sm font-bold text-slate-900 transition-colors group-hover:text-[#1e5ed4]"
					>
						{phieu.ly_do_de_xuat || 'Không có lý do'}
					</h3>

					<div class="mb-4 flex items-center gap-2">
						<div
							class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500"
						>
							<span class="material-symbols-outlined text-sm">person</span>
						</div>
						<div class="text-xs font-medium text-slate-700">
							{phieu.giao_vien?.ho_ten || 'N/A'}
						</div>
					</div>

					<!-- Danh sách vật tư thu gọn -->
					<div class="rounded-lg bg-slate-50 p-3">
						<div class="mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
							Danh sách vật tư ({phieu.chi_tiet_de_xuat.length})
						</div>
						{#if phieu.chi_tiet_de_xuat.length > 0}
							<div class="space-y-1.5">
								{#each phieu.chi_tiet_de_xuat.slice(0, 3) as ct}
									<div class="flex items-center justify-between text-xs">
										<div class="truncate pr-2 font-medium text-slate-700">
											{ct.vat_tu?.ten_vat_tu || 'N/A'}
										</div>
										<div class="flex-shrink-0 font-bold text-[#1e5ed4]">
											x{ct.so_luong_de_xuat}
										</div>
									</div>
								{/each}
								{#if phieu.chi_tiet_de_xuat.length > 3}
									<div class="pt-1 text-center text-xs text-slate-400 italic">
										+ {phieu.chi_tiet_de_xuat.length - 3} vật tư khác...
									</div>
								{/if}
							</div>
						{:else}
							<div class="text-xs text-slate-400 italic">Không có vật tư nào.</div>
						{/if}
					</div>

					<!-- Thao tác ẩn (hiện khi hover) -->
					<div
						class="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 opacity-0 transition-opacity group-hover:opacity-100"
					>
						<button
							onclick={(e) => {
								e.stopPropagation();
								openEditModal(phieu, false);
							}}
							class="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
						>
							{#if phieu.trang_thai === 'da_duyet'}
								<span class="material-symbols-outlined text-[14px]">visibility</span> Chi tiết
							{:else}
								<span class="material-symbols-outlined text-[14px]">edit</span> Sửa
							{/if}
						</button>

						{#if phieu.trang_thai !== 'da_duyet'}
							<form
								action="?/delete"
								method="POST"
								use:enhance={() => {
									return async ({ update }) => {
										await update();
									};
								}}
								class="inline-block"
							>
								<input type="hidden" name="id" value={phieu.id} />
								<button
									onclick={(e) => e.stopPropagation()}
									class="flex items-center gap-1 rounded bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100"
								>
									<span class="material-symbols-outlined text-[14px]">delete</span> Xóa
								</button>
							</form>
						{/if}
					</div>
				</div>
			{:else}
				<div class="col-span-full py-20 text-center">
					<div class="flex flex-col items-center justify-center space-y-3 text-slate-400">
						<span class="material-symbols-outlined text-5xl opacity-40">receipt_long</span>
						<p class="text-sm font-medium text-slate-500">Chưa có phiếu đề xuất nào.</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- Add/Edit Modal (Full Width) -->
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
			class="relative flex max-h-[95vh] w-full max-w-6xl flex-col bg-white shadow-2xl transition-all sm:rounded-2xl"
			onclick={(e) => e.stopPropagation()}
		>
			<div
				class="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5"
			>
				<div>
					<h2 class="text-lg font-bold text-slate-900">
						{#if editingItem}
							Chi tiết Đề xuất {viewMode ? '(Chỉ xem)' : '(Chỉnh sửa)'}
						{:else}
							Tạo Đề xuất Mới
						{/if}
					</h2>
					{#if editingItem}
						<div class="text-xs text-slate-500">ID: {editingItem.id}</div>
					{/if}
				</div>

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
				class="flex h-full flex-col overflow-hidden"
			>
				{#if editingItem}
					<input type="hidden" name="id" value={editingItem.id} />
				{/if}

				<input type="hidden" name="chi_tiet_data" value={JSON.stringify(chiTietList)} />

				<!-- Scrollable content -->
				<div class="flex-1 overflow-y-auto bg-slate-50/50 px-6 py-6 pb-20">
					<!-- General Info Card -->
					<div
						class="mb-6 grid grid-cols-1 gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"
					>
						<div>
							<label
								class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
								for="giao_vien_id">Giáo viên đề xuất <span class="text-rose-500">*</span></label
							>
							<select
								id="giao_vien_id"
								name="giao_vien_id"
								bind:value={giaoVienId}
								required
								disabled={viewMode}
								class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
							>
								<option value="">-- Chọn Giáo Viên --</option>
								{#each data.giao_vien_list as gv}
									<option value={gv.id}>{gv.ho_ten}</option>
								{/each}
							</select>
						</div>

						<div>
							<label
								class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
								for="trang_thai">Trạng thái</label
							>
							<select
								id="trang_thai"
								name="trang_thai"
								bind:value={trangThai}
								disabled={!editingItem || viewMode}
								class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
							>
								<option value="cho_duyet">⚠️ Chờ duyệt</option>
								<option value="da_duyet">✅ Đã duyệt</option>
								<option value="tu_choi">❌ Từ chối</option>
							</select>
							{#if !editingItem}
								<input type="hidden" name="trang_thai" value={trangThai} />
							{/if}
						</div>

						<div class="md:col-span-2">
							<label
								class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
								for="ly_do_de_xuat">Lý do đề xuất / Ghi chú</label
							>
							<textarea
								id="ly_do_de_xuat"
								name="ly_do_de_xuat"
								bind:value={lyDoDeXuat}
								disabled={viewMode}
								rows="2"
								placeholder="Nhập lý do chi tiết..."
								class="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
							></textarea>
						</div>
					</div>

					<!-- Danh mục vật tư Card -->
					<div class="rounded-xl border border-slate-200 bg-white shadow-sm">
						<div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
							<h3 class="text-sm font-bold text-slate-900 uppercase">DANH MỤC VẬT TƯ DỰ TRÙ</h3>
							{#if !viewMode}
								<button
									type="button"
									onclick={addNewChiTiet}
									class="inline-flex items-center gap-1.5 rounded bg-[#1e5ed4]/10 px-3 py-1.5 text-xs font-bold text-[#1e5ed4] hover:bg-[#1e5ed4]/20"
								>
									<span class="material-symbols-outlined text-[16px]">add</span>
									Thêm dòng
								</button>
							{/if}
						</div>

						<div class="overflow-x-auto">
							<table class="w-full text-left text-sm whitespace-nowrap">
								<thead
									class="bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase"
								>
									<tr>
										<th class="border-b border-slate-100 px-4 py-3">Vật tư *</th>
										<th class="w-24 border-b border-slate-100 px-4 py-3">SL *</th>
										{#if editingItem && viewMode}
											<th class="w-24 border-b border-slate-100 px-4 py-3 text-emerald-600"
												>Đã cấp</th
											>
										{/if}
										<th class="border-b border-slate-100 px-4 py-3">Môn học</th>
										<th class="border-b border-slate-100 px-4 py-3">Khoa</th>
										<th class="border-b border-slate-100 px-4 py-3">Ngành</th>
										<th class="border-b border-slate-100 px-4 py-3">Hệ</th>
										{#if !viewMode}
											<th class="w-12 border-b border-slate-100 px-4 py-3 text-center"></th>
										{/if}
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-100">
									{#each chiTietList as ct, index}
										<tr transition:slide={{ duration: 150 }} class="hover:bg-slate-50/50">
											<td class="px-4 py-2">
												<div class="relative w-full min-w-[250px]">
													<!-- svelte-ignore a11y_click_events_have_key_events -->
													<!-- svelte-ignore a11y_no_static_element_interactions -->
													<div
														class="flex w-full items-center justify-between rounded border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-[#1e5ed4] focus:outline-none {viewMode
															? 'pointer-events-none bg-slate-50 text-slate-500'
															: 'cursor-pointer hover:border-slate-300'}"
														onclick={() => {
															if (!viewMode) {
																if (openDropdownId === ct.id) openDropdownId = null;
																else {
																	openDropdownId = ct.id;
																	vatTuSearchQuery = '';
																}
															}
														}}
													>
														<span class="truncate pr-2 font-medium"
															>{getVatTuName(ct.vat_tu_id)}</span
														>
														<span class="material-symbols-outlined text-[16px] text-slate-400"
															>arrow_drop_down</span
														>
													</div>
													{#if openDropdownId === ct.id}
														<!-- svelte-ignore a11y_click_events_have_key_events -->
														<!-- svelte-ignore a11y_no_static_element_interactions -->
														<div
															class="fixed inset-0 z-40"
															onclick={() => (openDropdownId = null)}
														></div>
														<div
															class="absolute top-full left-0 z-50 mt-1 w-[350px] rounded-lg border border-slate-200 bg-white shadow-xl"
														>
															<div class="border-b border-slate-100 p-2">
																<input
																	type="text"
																	bind:value={vatTuSearchQuery}
																	use:focusOnMount
																	placeholder="Tìm vật tư..."
																	class="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:border-[#1e5ed4] focus:outline-none"
																/>
															</div>
															<ul class="max-h-60 overflow-y-auto p-1">
																{#each currentFilteredVatTuList as vt}
																	<!-- svelte-ignore a11y_click_events_have_key_events -->
																	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
																	<li
																		class="cursor-pointer rounded p-2 text-xs hover:bg-[#1e5ed4]/5 {ct.vat_tu_id ===
																		vt.id.toString()
																			? 'bg-[#1e5ed4]/10 font-bold text-[#1e5ed4]'
																			: 'text-slate-700'}"
																		onclick={() => {
																			ct.vat_tu_id = vt.id.toString();
																			openDropdownId = null;
																		}}
																	>
																		<div class="flex flex-col">
																			<span>{vt.ten_vat_tu} ({vt.don_vi})</span>
																			{#if vt.yeu_cau_ky_thuat}
																				<span class="truncate text-[10px] text-slate-400"
																					>{vt.yeu_cau_ky_thuat}</span
																				>
																			{/if}
																		</div>
																	</li>
																{:else}
																	<li class="px-2 py-3 text-center text-xs text-slate-500">
																		Không tìm thấy vật tư.
																	</li>
																{/each}
															</ul>
														</div>
													{/if}
												</div>
											</td>
											<td class="px-4 py-2">
												<input
													type="number"
													min="1"
													bind:value={ct.so_luong_de_xuat}
													disabled={viewMode}
													required
													class="w-full rounded border border-slate-200 bg-white px-2 py-1.5 font-mono text-xs font-bold focus:border-[#1e5ed4] focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
												/>
											</td>
											{#if editingItem && viewMode}
												<td class="px-4 py-2 text-center text-xs font-bold text-emerald-600">
													{editingItem.chi_tiet_de_xuat[index]?.so_luong_da_cap || 0}
												</td>
											{/if}
											<td class="px-4 py-2">
												<select
													bind:value={ct.mon_hoc_id}
													disabled={viewMode}
													class="w-full min-w-[120px] rounded border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-[#1e5ed4] focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
												>
													<option value="">(Không)</option>
													{#each data.mon_hoc_list as mh}
														<option value={mh.id.toString()}>{mh.ten_mon_hoc}</option>
													{/each}
												</select>
											</td>
											<td class="px-4 py-2">
												<select
													bind:value={ct.khoa_id}
													disabled={viewMode}
													class="w-full min-w-[100px] rounded border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-[#1e5ed4] focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
												>
													<option value="">(Không)</option>
													{#each data.khoa_list as kh}
														<option value={kh.id.toString()}>{kh.ten_khoa}</option>
													{/each}
												</select>
											</td>
											<td class="px-4 py-2">
												<select
													bind:value={ct.nganh_id}
													disabled={viewMode}
													class="w-full min-w-[100px] rounded border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-[#1e5ed4] focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
												>
													<option value="">(Không)</option>
													{#each data.nganh_list as ng}
														<option value={ng.id.toString()}>{ng.ten_nganh}</option>
													{/each}
												</select>
											</td>
											<td class="px-4 py-2">
												<select
													bind:value={ct.he_id}
													disabled={viewMode}
													class="w-full min-w-[90px] rounded border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-[#1e5ed4] focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
												>
													<option value="">(Không)</option>
													{#each data.he_dao_tao_list as he}
														<option value={he.id.toString()}>{he.ten_he}</option>
													{/each}
												</select>
											</td>
											{#if !viewMode}
												<td class="px-4 py-2 text-center">
													<button
														type="button"
														onclick={() => removeChiTiet(ct.id)}
														class="inline-flex justify-center rounded p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
													>
														<span class="material-symbols-outlined text-[18px]">close</span>
													</button>
												</td>
											{/if}
										</tr>
									{:else}
										<tr>
											<td colspan="8" class="px-4 py-8 text-center text-xs text-slate-500 italic">
												Chưa có vật tư nào được chọn. Hãy bấm "Thêm dòng".
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<!-- Footer Actions - Fixed Bottom -->
				<div
					class="absolute right-0 bottom-0 left-0 z-10 flex justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4"
				>
					<button
						type="button"
						onclick={closeModal}
						class="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
					>
						{viewMode ? 'ĐÓNG' : 'HỦY BỎ'}
					</button>
					{#if !viewMode}
						<button
							type="submit"
							class="rounded-lg bg-[#1e5ed4] px-6 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
							disabled={chiTietList.length === 0}
						>
							{editingItem ? 'LƯU THAY ĐỔI' : 'TẠO ĐỀ XUẤT'}
						</button>
					{/if}
				</div>
			</form>
		</div>
	</div>
{/if}
