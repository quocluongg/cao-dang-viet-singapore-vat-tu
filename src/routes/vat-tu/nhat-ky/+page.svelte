<script>
	/** @type {{ data: { nhat_ky: any[] } }} */
	let { data } = $props();

	let searchQuery = $state('');
	let filterLoaiGD = $state('all'); // all | nhap_kho | xuat_kho

	let filtered = $derived(
		data.nhat_ky.filter((n) => {
			const matchLoai = filterLoaiGD === 'all' || n.loai_gd === filterLoaiGD;
			const matchSearch =
				!searchQuery ||
				(n.vat_tu?.ten_vat_tu || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
				(n.phieu_lien_quan_id || '').toLowerCase().includes(searchQuery.toLowerCase());
			return matchLoai && matchSearch;
		})
	);

	let tongNhap = $derived(
		data.nhat_ky.filter((n) => n.loai_gd === 'nhap_kho').reduce((s, n) => s + n.so_luong, 0)
	);
	let tongXuat = $derived(
		data.nhat_ky.filter((n) => n.loai_gd === 'xuat_kho').reduce((s, n) => s + n.so_luong, 0)
	);
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-slate-900">Nhật ký kho</h1>
		<p class="mt-0.5 text-sm text-slate-500">Lịch sử toàn bộ giao dịch nhập và xuất kho.</p>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
		<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
			<p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">Tổng phiếu GD</p>
			<p class="mt-1 text-2xl font-bold text-slate-900">{data.nhat_ky.length}</p>
		</div>
		<div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
			<p class="text-xs font-semibold tracking-wider text-emerald-600 uppercase">
				Tổng số lượng nhập
			</p>
			<p class="mt-1 text-2xl font-bold text-emerald-700">+{tongNhap.toLocaleString()}</p>
		</div>
		<div class="rounded-xl border border-rose-100 bg-rose-50 p-4 shadow-sm">
			<p class="text-xs font-semibold tracking-wider text-rose-600 uppercase">Tổng số lượng xuất</p>
			<p class="mt-1 text-2xl font-bold text-rose-700">-{tongXuat.toLocaleString()}</p>
		</div>
	</div>

	<!-- Table -->
	<div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
		<div class="border-b border-slate-100 p-4">
			<div class="flex flex-wrap items-center gap-3">
				<div class="relative w-full md:w-72">
					<span
						class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-lg text-slate-400"
						>search</span
					>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Tìm vật tư, mã phiếu..."
						class="w-full rounded-lg border border-slate-200 bg-white py-2 pr-4 pl-10 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4]"
					/>
				</div>
				<div class="flex items-center gap-2">
					{#each [['all', 'Tất cả'], ['nhap_kho', 'Nhập kho'], ['xuat_kho', 'Xuất kho']] as [val, label]}
						<button
							onclick={() => (filterLoaiGD = val)}
							class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors {filterLoaiGD ===
							val
								? 'bg-[#1e5ed4] text-white'
								: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
						>
							{label}
						</button>
					{/each}
				</div>
				<span class="ml-auto text-xs text-slate-500">{filtered.length} dòng</span>
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm whitespace-nowrap">
				<thead class="bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
					<tr>
						<th class="border-b border-slate-100 px-5 py-3">Thời gian</th>
						<th class="border-b border-slate-100 px-5 py-3">Vật tư</th>
						<th class="border-b border-slate-100 px-5 py-3 text-center">Loại GD</th>
						<th class="border-b border-slate-100 px-5 py-3 text-right">Số lượng</th>
						<th class="border-b border-slate-100 px-5 py-3">Mã phiếu liên quan</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filtered as entry}
						<tr class="transition-colors hover:bg-slate-50">
							<td class="px-5 py-3 text-xs text-slate-500">
								{new Date(entry.ngay_ghi_so).toLocaleString('vi-VN')}
							</td>
							<td class="px-5 py-3">
								<div class="font-semibold text-slate-800">{entry.vat_tu?.ten_vat_tu || 'N/A'}</div>
								<div class="text-xs text-slate-400">{entry.vat_tu?.don_vi || ''}</div>
							</td>
							<td class="px-5 py-3 text-center">
								{#if entry.loai_gd === 'nhap_kho'}
									<span
										class="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"
									>
										<span class="material-symbols-outlined text-[12px]">arrow_downward</span>
										NHẬP
									</span>
								{:else}
									<span
										class="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700"
									>
										<span class="material-symbols-outlined text-[12px]">arrow_upward</span>
										XUẤT
									</span>
								{/if}
							</td>
							<td
								class="px-5 py-3 text-right font-mono font-bold {entry.loai_gd === 'nhap_kho'
									? 'text-emerald-600'
									: 'text-rose-600'}"
							>
								{entry.loai_gd === 'nhap_kho' ? '+' : '-'}{entry.so_luong.toLocaleString()}
							</td>
							<td class="px-5 py-3 font-mono text-xs text-slate-400">
								{entry.phieu_lien_quan_id ? entry.phieu_lien_quan_id.substring(0, 16) + '...' : '–'}
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="px-5 py-10 text-center text-sm text-slate-400">
								Chưa có dữ liệu nhật ký kho nào.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
