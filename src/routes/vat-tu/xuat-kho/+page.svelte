<script>
	import { enhance } from '$app/forms';
	import { fly, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	/** @type {{ data: { vat_tu_list: any[], lich_su_xuat: any[] }, form: any }} */
	let { data, form } = $props();

	let toast = $state({ show: false, message: '', type: 'success' });
	let isSubmitting = $state(false);

	/** @type {{ id: number, vat_tu_id: string, so_luong: number }[]} */
	let items = $state([{ id: Date.now(), vat_tu_id: '', so_luong: 1 }]);

	function addItem() {
		items = [...items, { id: Date.now(), vat_tu_id: '', so_luong: 1 }];
	}

	function removeItem(/** @type {number} */ id) {
		if (items.length > 1) items = items.filter((i) => i.id !== id);
	}

	function getVatTuInfo(/** @type {string} */ id) {
		return data.vat_tu_list.find((v) => v.id.toString() === id);
	}

	function getVatTuName(/** @type {string} */ id) {
		const vt = getVatTuInfo(id);
		return vt ? `${vt.ten_vat_tu} (${vt.don_vi || '?'})` : '-- Chọn vật tư --';
	}

	function showToast(
		/** @type {string} */ message,
		/** @type {'success'|'error'} */ type = 'success'
	) {
		toast = { show: true, message, type };
		setTimeout(() => (toast.show = false), 4000);
	}

	$effect(() => {
		if (form?.success) {
			showToast(form.message || 'Xuất kho thành công!', 'success');
			items = [{ id: Date.now(), vat_tu_id: '', so_luong: 1 }];
		} else if (form?.error) {
			showToast(form.error, 'error');
		}
	});

	/** @type {number | null} */
	let openDropId = $state(null);
	let vtSearch = $state('');

	let dropdownFiltered = $derived(
		data.vat_tu_list.filter((vt) => {
			if (!vtSearch) return true;
			return vt.ten_vat_tu.toLowerCase().includes(vtSearch.toLowerCase());
		})
	);

	function focusOnMount(/** @type {HTMLElement} */ node) {
		setTimeout(() => node.focus(), 10);
	}

	let tongSoLuong = $derived(items.reduce((sum, i) => sum + (i.so_luong || 0), 0));
	let soLoaiVatTu = $derived(items.filter((i) => i.vat_tu_id).length);

	// Check if any item exceeds stock
	let hasStockError = $derived(
		items.some((item) => {
			if (!item.vat_tu_id) return false;
			const vt = getVatTuInfo(item.vat_tu_id);
			return vt && item.so_luong > (vt.so_luong_ton_kho || 0);
		})
	);
</script>

<!-- Toast -->
{#if toast.show}
	<div
		transition:fly={{ y: 20, duration: 400, easing: cubicOut }}
		class="fixed right-8 bottom-8 z-[100] flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl {toast.type ===
		'success'
			? 'border-emerald-500/20 bg-emerald-50 text-emerald-800'
			: 'border-rose-500/20 bg-rose-50 text-rose-800'}"
	>
		<div
			class="flex h-8 w-8 items-center justify-center rounded-full {toast.type === 'success'
				? 'bg-emerald-100'
				: 'bg-rose-100'}"
		>
			<span
				class="material-symbols-outlined {toast.type === 'success'
					? 'text-emerald-600'
					: 'text-rose-600'}"
			>
				{toast.type === 'success' ? 'check_circle' : 'error'}
			</span>
		</div>
		<span class="text-sm font-semibold">{toast.message}</span>
	</div>
{/if}

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">Xuất kho vật tư</h1>
			<p class="mt-0.5 text-sm text-slate-500">
				Ghi nhận vật tư xuất kho cho đề xuất được phê duyệt. Tồn kho sẽ được cập nhật tự động.
			</p>
		</div>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
		<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
			<p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">Vật tư trong kho</p>
			<p class="mt-1 text-xl font-bold text-slate-900">{data.vat_tu_list.length}</p>
		</div>
		<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
			<p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">Lịch sử xuất</p>
			<p class="mt-1 text-xl font-bold text-rose-600">{data.lich_su_xuat.length}</p>
		</div>
		<div class="rounded-xl border border-orange-100 bg-orange-50 p-4 shadow-sm">
			<p class="text-xs font-semibold tracking-wider text-orange-600 uppercase">Loại đang xuất</p>
			<p class="mt-1 text-xl font-bold text-orange-700">{soLoaiVatTu}</p>
		</div>
		<div class="rounded-xl border border-orange-100 bg-orange-50 p-4 shadow-sm">
			<p class="text-xs font-semibold tracking-wider text-orange-600 uppercase">Tổng SL xuất</p>
			<p class="mt-1 text-xl font-bold text-orange-700">{tongSoLuong}</p>
		</div>
	</div>

	{#if hasStockError}
		<div
			class="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
		>
			<span class="material-symbols-outlined text-[18px]">warning</span>
			<span class="font-semibold">Cảnh báo:</span> Một số vật tư có số lượng xuất vượt quá tồn kho!
		</div>
	{/if}

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
		<!-- Form xuất kho -->
		<div class="lg:col-span-3">
			<form
				action="?/xuatKho"
				method="POST"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
					};
				}}
				class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
			>
				<input type="hidden" name="items_data" value={JSON.stringify(items)} />

				<div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
					<h2 class="text-sm font-bold text-slate-900 uppercase">🚚 Phiếu Xuất Kho</h2>
					<button
						type="button"
						onclick={addItem}
						class="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
					>
						<span class="material-symbols-outlined text-[16px]">add</span>
						Thêm dòng
					</button>
				</div>

				<div class="overflow-x-auto">
					<table class="w-full text-sm whitespace-nowrap">
						<thead
							class="bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase"
						>
							<tr>
								<th class="border-b border-slate-100 px-4 py-3">Vật tư *</th>
								<th class="w-28 border-b border-slate-100 px-4 py-3">Tồn kho</th>
								<th class="w-28 border-b border-slate-100 px-4 py-3">Số lượng xuất *</th>
								<th class="w-10 border-b border-slate-100 px-4 py-3"></th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each items as item (item.id)}
								{@const selectedVt = getVatTuInfo(item.vat_tu_id)}
								{@const isOver = selectedVt && item.so_luong > (selectedVt.so_luong_ton_kho || 0)}
								<tr
									transition:slide={{ duration: 150 }}
									class="hover:bg-slate-50/50 {isOver ? 'bg-rose-50/30' : ''}"
								>
									<td class="px-4 py-2">
										<div class="relative min-w-[220px]">
											<!-- svelte-ignore a11y_click_events_have_key_events -->
											<!-- svelte-ignore a11y_no_static_element_interactions -->
											<div
												class="flex cursor-pointer items-center justify-between rounded border {isOver
													? 'border-rose-300'
													: 'border-slate-200'} bg-white px-2 py-1.5 text-xs hover:border-slate-300"
												onclick={() => {
													if (openDropId === item.id) openDropId = null;
													else {
														openDropId = item.id;
														vtSearch = '';
													}
												}}
											>
												<span
													class="truncate pr-2 font-medium {item.vat_tu_id
														? 'text-slate-900'
														: 'text-slate-400'}"
												>
													{getVatTuName(item.vat_tu_id)}
												</span>
												<span class="material-symbols-outlined text-[16px] text-slate-400"
													>arrow_drop_down</span
												>
											</div>
											{#if openDropId === item.id}
												<!-- svelte-ignore a11y_click_events_have_key_events -->
												<!-- svelte-ignore a11y_no_static_element_interactions -->
												<div class="fixed inset-0 z-40" onclick={() => (openDropId = null)}></div>
												<div
													class="absolute top-full left-0 z-50 mt-1 w-[320px] rounded-lg border border-slate-200 bg-white shadow-xl"
												>
													<div class="border-b p-2">
														<input
															type="text"
															bind:value={vtSearch}
															use:focusOnMount
															placeholder="Tìm vật tư..."
															class="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:border-[#1e5ed4] focus:outline-none"
														/>
													</div>
													<ul class="max-h-60 overflow-y-auto p-1">
														{#each dropdownFiltered as vt}
															<!-- svelte-ignore a11y_click_events_have_key_events -->
															<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
															<li
																class="cursor-pointer rounded p-2 text-xs {vt.so_luong_ton_kho <= 0
																	? 'opacity-50'
																	: ''} hover:bg-[#1e5ed4]/5 {item.vat_tu_id === vt.id.toString()
																	? 'bg-[#1e5ed4]/10 font-bold text-[#1e5ed4]'
																	: 'text-slate-700'}"
																onclick={() => {
																	item.vat_tu_id = vt.id.toString();
																	openDropId = null;
																}}
															>
																<div class="flex items-center justify-between">
																	<span>{vt.ten_vat_tu} ({vt.don_vi || '?'})</span>
																	<span
																		class="ml-2 rounded px-1.5 py-0.5 text-[10px] {vt.so_luong_ton_kho <=
																		0
																			? 'bg-rose-100 text-rose-600'
																			: 'bg-emerald-100 text-emerald-700'}"
																	>
																		Tồn: {vt.so_luong_ton_kho || 0}
																	</span>
																</div>
															</li>
														{:else}
															<li class="px-2 py-3 text-center text-xs text-slate-400">
																Không tìm thấy.
															</li>
														{/each}
													</ul>
												</div>
											{/if}
										</div>
									</td>
									<td
										class="px-4 py-2 text-center font-mono text-xs font-bold {isOver
											? 'text-rose-600'
											: 'text-slate-600'}"
									>
										{selectedVt ? selectedVt.so_luong_ton_kho || 0 : '--'}
										{selectedVt?.don_vi ? `(${selectedVt.don_vi})` : ''}
									</td>
									<td class="px-4 py-2">
										<input
											type="number"
											min="1"
											bind:value={item.so_luong}
											required
											class="w-full rounded border {isOver
												? 'border-rose-400 bg-rose-50'
												: 'border-slate-200 bg-white'} px-2 py-1.5 text-center font-mono text-xs font-bold focus:outline-none"
										/>
										{#if isOver}
											<p class="mt-0.5 text-center text-[10px] text-rose-500">Vượt tồn kho!</p>
										{/if}
									</td>
									<td class="px-4 py-2 text-center">
										<button
											type="button"
											onclick={() => removeItem(item.id)}
											disabled={items.length === 1}
											class="inline-flex rounded p-1 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed"
										>
											<span class="material-symbols-outlined text-[18px]">close</span>
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<div class="border-t border-slate-100 p-5">
					<label class="mb-1.5 block text-xs font-semibold text-slate-700 uppercase" for="phieu_id">
						Liên kết phiếu đề xuất (nếu có)
					</label>
					<input
						id="phieu_id"
						name="phieu_de_xuat_id"
						type="text"
						placeholder="UUID phiếu đề xuất (để trống nếu xuất không theo phiếu)"
						class="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
					/>
					<div class="mt-4 flex justify-end">
						<button
							type="submit"
							disabled={isSubmitting || items.every((i) => !i.vat_tu_id) || hasStockError}
							class="flex items-center gap-2 rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<span class="material-symbols-outlined text-[18px]">
								{isSubmitting ? 'hourglass_empty' : 'output'}
							</span>
							{isSubmitting ? 'Đang xử lý...' : 'XÁC NHẬN XUẤT KHO'}
						</button>
					</div>
				</div>
			</form>
		</div>

		<!-- Lịch sử xuất -->
		<div class="lg:col-span-2">
			<div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
				<div class="border-b border-slate-100 px-5 py-4">
					<h2 class="text-sm font-bold text-slate-900 uppercase">📋 Lịch sử xuất gần đây</h2>
				</div>
				<div class="divide-y divide-slate-100">
					{#if data.lich_su_xuat.length === 0}
						<div class="py-10 text-center text-sm text-slate-400">Chưa có lịch sử xuất kho.</div>
					{:else}
						{#each data.lich_su_xuat.slice(0, 20) as entry}
							<div class="flex items-center justify-between px-4 py-3">
								<div class="min-w-0 flex-1">
									<p class="truncate text-xs font-semibold text-slate-800">
										{entry.vat_tu?.ten_vat_tu || 'N/A'}
									</p>
									<p class="mt-0.5 text-[10px] text-slate-400">
										{new Date(entry.ngay_ghi_so).toLocaleString('vi-VN')}
									</p>
								</div>
								<div class="ml-3 flex-shrink-0">
									<span
										class="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700"
									>
										<span class="material-symbols-outlined text-[12px]">remove</span>
										-{entry.so_luong}
										{entry.vat_tu?.don_vi || ''}
									</span>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
