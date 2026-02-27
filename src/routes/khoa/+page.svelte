<script>
	import { enhance } from '$app/forms';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import * as xlsx from 'xlsx';

	/** @typedef {{ id: number, ten_khoa: string }} Khoa */

	/** @type {{ data: { khoa: Khoa[] }, form: { success?: boolean, error?: string, message?: string } }} */
	let { data, form } = $props();

	// State
	let showModal = $state(false);
	let toast = $state({ show: false, message: '', type: 'success' });
	let searchQuery = $state('');

	let tenKhoa = $state('');
	/** @type {Khoa | null} */
	let editingItem = $state(null);

	// Derived state for filtering
	let filteredKhoa = $derived(
		data.khoa.filter((item) => item.ten_khoa.toLowerCase().includes(searchQuery.toLowerCase()))
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
		tenKhoa = '';
		showModal = true;
	}

	function openEditModal(/** @type {Khoa} */ item) {
		editingItem = item;
		tenKhoa = item.ten_khoa || '';
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingItem = null;
	}

	function exportExcel() {
		const dataToExport = filteredKhoa.map((k, index) => ({
			STT: index + 1,
			'Tên khoa': k.ten_khoa
		}));

		const worksheet = xlsx.utils.json_to_sheet(dataToExport);
		const workbook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(workbook, worksheet, 'Khoa');
		xlsx.writeFile(workbook, 'Danh_Sach_Khoa.xlsx');
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
			<h1 class="text-2xl font-bold text-slate-900">Quản lý Khoa</h1>
			<p class="mt-0.5 text-sm text-[#64748b]">
				Hiển thị và thêm mới khoa / trung tâm vào hệ thống.
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
				<span>Thêm Khoa</span>
			</button>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div
			class="flex items-center space-x-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
		>
			<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-[#1e5ed4]">
				<span class="material-symbols-outlined text-2xl">grid_view</span>
			</div>
			<div>
				<p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">TỔNG SỐ KHOA</p>
				<p class="text-xl font-bold text-slate-900">{filteredKhoa.length}</p>
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
						placeholder="Tìm kiếm khoa theo tên..."
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
						<th class="border-b border-slate-100 px-6 py-3">TÊN KHOA</th>
						<th class="border-b border-slate-100 px-6 py-3 text-right">THAO TÁC</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredKhoa as item (item.id)}
						<tr class="group transition-colors hover:bg-slate-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<div
									class="flex items-center space-x-3 text-sm font-bold text-slate-900 transition-colors group-hover:text-[#1e5ed4]"
								>
									<div
										class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
									>
										<span class="material-symbols-outlined text-lg">domain</span>
									</div>
									<span>{item.ten_khoa}</span>
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
							<td colspan="2" class="px-6 py-20 text-center">
								<div class="flex flex-col items-center justify-center space-y-3 text-slate-400">
									<span class="material-symbols-outlined text-5xl opacity-40">grid_view</span>
									<p class="text-sm font-medium text-slate-500">Không tìm thấy khoa nào.</p>
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
				<span class="font-medium text-slate-800">{filteredKhoa.length}</span> của
				<span class="font-medium text-slate-800">{data.khoa.length}</span> mục
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
			class="relative w-full max-w-sm transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="flex items-center justify-between border-b border-slate-100 px-6 py-5">
				<h2 class="text-lg font-bold text-slate-900">
					{editingItem ? 'Cập nhật Khoa' : 'Thêm Khoa Mới'}
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

				<div class="space-y-4">
					<div>
						<label
							class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
							for="ten_khoa">Tên khoa <span class="text-rose-500">*</span></label
						>
						<input
							type="text"
							id="ten_khoa"
							name="ten_khoa"
							bind:value={tenKhoa}
							required
							placeholder="VD: Khoa Công nghệ thông tin..."
							class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4] focus:outline-none"
						/>
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
