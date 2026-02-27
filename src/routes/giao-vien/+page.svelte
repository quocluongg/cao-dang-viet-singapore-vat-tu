<script>
	import { enhance } from '$app/forms';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import * as xlsx from 'xlsx';

	/** @typedef {{ id: string, ho_ten: string, ma_so_gv: string, email?: string, mat_khau?: string, created_at: string }} GiaoVien */

	/** @type {{ data: { giao_vien: GiaoVien[] }, form: { success?: boolean, error?: string, message?: string } }} */
	let { data, form } = $props();

	// State
	let showModal = $state(false);
	let toast = $state({ show: false, message: '', type: 'success' });
	let searchQuery = $state('');

	let hoTen = $state('');
	let maSoGV = $state('');
	let email = $state('');
	let password = $state('');
	let isAutoGenerate = $state(true);
	let isUploading = $state(false);
	/** @type {any[]} */
	let teachersToImport = $state([]);
	/** @type {any[]} */
	let newTeachersList = $state([{ ho_ten: '', ma_so_gv: '', password: '', isAutoGenerate: true }]);

	/** @type {GiaoVien | null} */
	let editingItem = $state(null);

	function removeAccents(/** @type {string} */ str) {
		return str
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/đ/g, 'd')
			.replace(/Đ/g, 'D');
	}

	function generateEmailFromName(/** @type {string} */ fullName) {
		const cleanName = removeAccents(fullName).toLowerCase().split(/\s+/).filter(Boolean);

		if (cleanName.length === 0) return '';
		const ten = cleanName.pop() || '';
		const hoDem = cleanName.join('');
		return `${ten}${hoDem}`;
	}

	$effect(() => {
		// Auto generate emails and passwords for new teachers if enabled
		if (!editingItem) {
			newTeachersList.forEach((t) => {
				if (t.isAutoGenerate && t.ho_ten) {
					const baseName = generateEmailFromName(t.ho_ten);
					t.email = `${baseName}@qlcd.edu.vn`;
					t.password = `GiaoVien@2026`;
				} else if (t.isAutoGenerate && !t.ho_ten) {
					t.email = '';
					t.password = '';
				}
			});
		}
	});

	// Derived state for filtering
	let filteredGiaoVien = $derived(
		data.giao_vien.filter(
			(item) =>
				item.ho_ten.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(item.ma_so_gv && item.ma_so_gv.toLowerCase().includes(searchQuery.toLowerCase())) ||
				(item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase()))
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
		hoTen = '';
		maSoGV = '';
		email = '';
		password = '';
		isAutoGenerate = true;
		newTeachersList = [{ ho_ten: '', ma_so_gv: '', password: '', isAutoGenerate: true, email: '' }];
		showModal = true;
	}

	function openEditModal(/** @type {GiaoVien} */ item) {
		editingItem = item;
		hoTen = item.ho_ten || '';
		maSoGV = item.ma_so_gv || '';
		email = item.email || '';
		password = item.mat_khau || '';
		isAutoGenerate = false; // Disable auto generate for editing
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingItem = null;
	}

	function exportExcel() {
		const dataToExport = filteredGiaoVien.map((gv, index) => ({
			STT: index + 1,
			'Tên giáo viên': gv.ho_ten,
			'Mã số GV': gv.ma_so_gv || '',
			Email: gv.email || '',
			'Mật khẩu': gv.mat_khau || '',
			'Ngày tạo': new Date(gv.created_at).toLocaleDateString('vi-VN')
		}));

		const worksheet = xlsx.utils.json_to_sheet(dataToExport);
		const workbook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(workbook, worksheet, 'GiaoVien');
		xlsx.writeFile(workbook, 'Danh_Sach_Giao_Vien.xlsx');
	}

	function downloadTemplate() {
		const templateData = [
			{
				'Tên giáo viên': 'Nguyễn Văn A',
				'Mã số GV': 'GV001',
				'Mật khẩu (tùy chọn)': 'GiaoVien@2026'
			}
		];
		const worksheet = xlsx.utils.json_to_sheet(templateData);
		const workbook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(workbook, worksheet, 'GiaoVien');
		xlsx.writeFile(workbook, 'Mau_Nhap_Giao_Vien.xlsx');
	}

	async function handleFileUpload(/** @type {Event} */ event) {
		const target = /** @type {HTMLInputElement} */ (event.target);
		const file = target.files?.[0];
		if (!file) return;

		try {
			const data = await file.arrayBuffer();
			const workbook = xlsx.read(data);
			const worksheet = workbook.Sheets[workbook.SheetNames[0]];
			const jsonData = xlsx.utils.sheet_to_json(worksheet);

			// @ts-ignore
			teachersToImport = jsonData
				.map((/** @type {any} */ row) => {
					const ho_ten = row['Tên giáo viên'];
					let password = row['Mật khẩu (tùy chọn)'] || row['Mật khẩu'] || '';

					if (!password && ho_ten) {
						password = 'GiaoVien@2026';
					}

					return {
						ho_ten,
						ma_so_gv: row['Mã số GV'] || '',
						password: password
					};
				})
				.filter((/** @type {any} */ t) => t.ho_ten);

			if (teachersToImport.length > 0) {
				setTimeout(() => {
					document.getElementById('hiddenImportBtn')?.click();
				}, 50);
			} else {
				showToast('Không tìm thấy dữ liệu hợp lệ trong file (Cần cột Tên giáo viên)', 'error');
			}
		} catch (err) {
			showToast('Lỗi đọc file Excel!', 'error');
		}

		target.value = '';
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

<form
	action="?/importData"
	method="POST"
	class="hidden"
	use:enhance={() => {
		isUploading = true;
		showToast('Đang thực hiện nhập liệu, vui lòng không tắt trang...', 'success');
		return async ({ result, update }) => {
			isUploading = false;
			await update();
		};
	}}
>
	<input type="hidden" name="teachers" value={JSON.stringify(teachersToImport)} />
	<button id="hiddenImportBtn" type="submit"></button>
</form>

<div class="space-y-6">
	<!-- Header Section -->
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">Quản lý Giáo viên</h1>
			<p class="mt-0.5 text-sm text-[#64748b]">Hiển thị và thêm mới giáo viên vào hệ thống.</p>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<button
				onclick={downloadTemplate}
				class="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
			>
				<span class="material-symbols-outlined text-[20px] text-blue-600">download</span>
				<span class="hidden sm:inline">File mẫu</span>
			</button>
			<input
				type="file"
				accept=".xlsx, .xls"
				class="hidden"
				id="excelUpload"
				onchange={handleFileUpload}
			/>
			<button
				onclick={() => {
					if (!isUploading) document.getElementById('excelUpload')?.click();
				}}
				disabled={isUploading}
				class="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
			>
				{#if isUploading}
					<span
						class="material-symbols-outlined animate-[spin_2s_linear_infinite] text-[20px] text-amber-500"
						>sync</span
					>
					<span class="hidden sm:inline">Đang nhập...</span>
				{:else}
					<span class="material-symbols-outlined text-[20px] text-amber-500">upload_file</span>
					<span class="hidden sm:inline">Nhập dữ liệu</span>
				{/if}
			</button>
			<button
				onclick={exportExcel}
				class="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
			>
				<span class="material-symbols-outlined text-[20px] text-emerald-600">description</span>
				<span class="hidden sm:inline">Xuất Excel</span>
			</button>
			<button
				onclick={openAddModal}
				class="flex items-center space-x-2 rounded-lg bg-[#1e5ed4] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
			>
				<span class="material-symbols-outlined text-[20px]">person_add</span>
				<span>Thêm giáo viên</span>
			</button>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div
			class="flex items-center space-x-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
		>
			<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-[#1e5ed4]">
				<span class="material-symbols-outlined text-2xl">group</span>
			</div>
			<div>
				<p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">
					TỔNG SỐ GIÁO VIÊN
				</p>
				<p class="text-xl font-bold text-slate-900">{filteredGiaoVien.length}</p>
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
						placeholder="Tìm kiếm giáo viên theo tên, mã số, email..."
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
						<th class="border-b border-slate-100 px-6 py-3">TÊN GIÁO VIÊN</th>
						<th class="border-b border-slate-100 px-6 py-3">MÃ SỐ GV</th>
						<th class="border-b border-slate-100 px-6 py-3">EMAIL</th>
						<th class="border-b border-slate-100 px-6 py-3">MẬT KHẨU</th>
						<th class="border-b border-slate-100 px-6 py-3">NGÀY TẠO</th>
						<th class="border-b border-slate-100 px-6 py-3 text-center">THAO TÁC</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredGiaoVien as item (item.id)}
						<tr class="group transition-colors hover:bg-slate-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<div
									class="flex items-center space-x-3 text-sm font-bold text-slate-900 transition-colors group-hover:text-[#1e5ed4]"
								>
									<div
										class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"
									>
										<span class="material-symbols-outlined text-lg">person</span>
									</div>
									<span>{item.ho_ten}</span>
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span
									class="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 uppercase"
								>
									{item.ma_so_gv || 'N/A'}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="text-sm font-medium text-slate-600">
									{item.email || 'N/A'}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								{#if item.mat_khau}
									<span
										class="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600"
									>
										{item.mat_khau}
									</span>
								{:else}
									<span class="text-sm text-slate-400 italic">Không lưu</span>
								{/if}
							</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-slate-500">
								{new Date(item.created_at).toLocaleDateString('vi-VN')}
							</td>
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
						</tr>
					{:else}
						<tr>
							<td colspan="6" class="px-6 py-20 text-center">
								<div class="flex flex-col items-center justify-center space-y-3 text-slate-400">
									<span class="material-symbols-outlined text-5xl opacity-40">group</span>
									<p class="text-sm font-medium text-slate-500">Không tìm thấy giáo viên nào.</p>
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
				<span class="font-medium text-slate-800">{filteredGiaoVien.length}</span> của
				<span class="font-medium text-slate-800">{data.giao_vien.length}</span> mục
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
					{editingItem ? 'Cập nhật Giáo Viên' : 'Thêm Giáo Viên Mới'}
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

				{#if !editingItem}
					<div class="mb-4">
						<p class="text-sm font-medium text-slate-700">Thêm một hoặc nhiều giáo viên</p>
					</div>

					<div class="custom-scrollbar max-h-[60vh] space-y-6 overflow-y-auto pr-2">
						{#each newTeachersList as t, index}
							<div class="relative rounded-xl border border-slate-200 bg-slate-50/50 p-5 shadow-sm">
								{#if newTeachersList.length > 1}
									<button
										type="button"
										onclick={() =>
											(newTeachersList = newTeachersList.filter((_, i) => i !== index))}
										class="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
										title="Xóa dòng này"
									>
										<span class="material-symbols-outlined text-[18px]">close</span>
									</button>
								{/if}

								<div class="mb-5 flex items-center justify-between">
									<h4 class="text-xs font-bold text-[#1e5ed4] uppercase">Giáo viên #{index + 1}</h4>
									<label class="mr-8 inline-flex cursor-pointer items-center">
										<span class="mr-2 text-xs font-medium text-slate-600"
											>Tạo tài khoản tự động</span
										>
										<input type="checkbox" bind:checked={t.isAutoGenerate} class="peer sr-only" />
										<div
											class="peer h-5 w-9 rounded-full bg-slate-200 peer-checked:bg-[#1e5ed4] peer-focus:ring-2 peer-focus:ring-[#1e5ed4]/30 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"
										></div>
									</label>
								</div>

								<div class="grid grid-cols-2 gap-4">
									<div class="col-span-2 sm:col-span-1">
										<label class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
											>Tên giáo viên <span class="text-rose-500">*</span></label
										>
										<input
											type="text"
											name="ho_ten"
											bind:value={t.ho_ten}
											required
											placeholder="Nhập tên giáo viên..."
											class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
										/>
									</div>

									{#if !t.isAutoGenerate}
										<div class="col-span-2 sm:col-span-1">
											<label class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
												>Mã số giáo viên</label
											>
											<input
												type="text"
												name="ma_so_gv"
												bind:value={t.ma_so_gv}
												placeholder="Mã GV..."
												class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm uppercase focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
											/>
										</div>
										<div class="col-span-2">
											<label class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
												>Mật khẩu (Tùy chọn)</label
											>
											<input
												type="text"
												name="password"
												bind:value={t.password}
												minlength="6"
												placeholder="GiaoVien@2026"
												class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
											/>
										</div>
									{:else}
										<div class="col-span-2 sm:col-span-1">
											<label class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
												>Mã số giáo viên</label
											>
											<input
												type="text"
												name="ma_so_gv"
												bind:value={t.ma_so_gv}
												placeholder="Mã GV..."
												class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm uppercase focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
											/>
										</div>
										<input type="hidden" name="password" value={t.password} />
									{/if}
								</div>

								{#if t.isAutoGenerate && t.ho_ten}
									<div class="mt-4 rounded-lg bg-white p-3 shadow-sm ring-1 ring-black/5">
										<p class="mb-1 text-[11px] font-medium text-slate-500">Tài khoản dự kiến:</p>
										<div class="flex gap-4 text-sm">
											<span class="font-mono text-[#1e5ed4]">{t.email}</span>
											<span class="font-mono text-slate-600">{t.password}</span>
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>

					<button
						type="button"
						onclick={() =>
							newTeachersList.push({
								ho_ten: '',
								ma_so_gv: '',
								password: '',
								isAutoGenerate: true,
								email: ''
							})}
						class="mt-4 flex w-full items-center justify-center space-x-2 rounded-lg border border-dashed border-[#1e5ed4] bg-[#1e5ed4]/5 px-4 py-2.5 text-sm font-semibold text-[#1e5ed4] transition-colors hover:bg-[#1e5ed4]/10"
					>
						<span class="material-symbols-outlined text-[20px]">add_circle</span>
						<span>Thêm một giáo viên nữa</span>
					</button>
				{/if}

				{#if editingItem}
					<div class="grid grid-cols-2 gap-5">
						<div class="col-span-2">
							<label
								class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
								for="ho_ten">Tên giáo viên <span class="text-rose-500">*</span></label
							>
							<input
								type="text"
								id="ho_ten"
								name="ho_ten"
								bind:value={hoTen}
								required
								placeholder="Nhập tên giáo viên..."
								class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
							/>
						</div>

						<div class="col-span-2 sm:col-span-1">
							<label
								class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
								for="ma_so_gv">Mã số giáo viên</label
							>
							<input
								type="text"
								id="ma_so_gv"
								name="ma_so_gv"
								bind:value={maSoGV}
								placeholder="Cập nhật sau..."
								class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm uppercase focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
							/>
						</div>
						<div class="col-span-2 sm:col-span-1"></div>

						<div class="col-span-2 sm:col-span-1">
							<label class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase" for="email"
								>Email {!editingItem ? '(*)' : ''}</label
							>
							<input
								type="email"
								id="email"
								name="email"
								bind:value={email}
								required={!editingItem}
								placeholder="abc@qlcd.edu.vn"
								class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
							/>
						</div>

						<div class="col-span-2 sm:col-span-1">
							<label
								class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
								for="password">Mật khẩu (Mới)</label
							>
							<input
								type="text"
								id="password"
								name="password"
								bind:value={password}
								minlength="6"
								placeholder="Để trống nếu không đổi"
								class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
							/>
						</div>
					</div>
				{/if}

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
