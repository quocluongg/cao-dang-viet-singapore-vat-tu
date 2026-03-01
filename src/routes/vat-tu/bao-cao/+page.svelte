<script>
	/** @type {{ data: { vat_tu: any[], nhat_ky: any[], stats: any } }} */
	let { data } = $props();

	let searchQuery = $state('');
	let filterLoai = $state('all'); // all | thap | du | cao

	let filteredVatTu = $derived(
		data.vat_tu.filter((vt) => {
			const matchSearch =
				!searchQuery || vt.ten_vat_tu.toLowerCase().includes(searchQuery.toLowerCase());

			if (!matchSearch) return false;

			const qty = vt.so_luong_ton_kho || 0;
			if (filterLoai === 'thap') return qty < 5;
			if (filterLoai === 'du') return qty >= 5 && qty < 50;
			if (filterLoai === 'cao') return qty >= 50;
			return true;
		})
	);

	function getMucTon(/** @type {number} */ qty) {
		if (qty === 0)
			return { label: 'Hết hàng', cls: 'bg-rose-100 text-rose-700 border border-rose-200' };
		if (qty < 5)
			return { label: 'Sắp hết', cls: 'bg-amber-100 text-amber-700 border border-amber-200' };
		if (qty < 50)
			return { label: 'Đủ dùng', cls: 'bg-blue-100 text-blue-700 border border-blue-200' };
		return { label: 'Dồi dào', cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
	}

	function formatCurrency(/** @type {number} */ n) {
		if (!n) return '–';
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
	}

	// Hoạt động 7 ngày gần nhất
	let recent7Days = $derived(
		data.nhat_ky.filter((n) => {
			const d = new Date(n.ngay_ghi_so);
			const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
			return diff <= 7;
		})
	);

	let nhap7Days = $derived(
		recent7Days.filter((n) => n.loai_gd === 'nhap_kho').reduce((s, n) => s + n.so_luong, 0)
	);
	let xuat7Days = $derived(
		recent7Days.filter((n) => n.loai_gd === 'xuat_kho').reduce((s, n) => s + n.so_luong, 0)
	);
</script>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-2xl font-bold text-slate-900">Báo cáo tồn kho</h1>
		<p class="mt-0.5 text-sm text-slate-500">
			Tổng hợp tình trạng vật tư và hoạt động nhập xuất kho.
		</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 gap-4 md:grid-cols-5">
		<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
			<p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">Tổng loại VT</p>
			<p class="mt-1 text-2xl font-bold text-slate-900">{data.stats.tongLoaiVatTu}</p>
		</div>
		<div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
			<p class="text-xs font-semibold tracking-wider text-emerald-600 uppercase">
				Tổng nhập (toàn bộ)
			</p>
			<p class="mt-1 text-2xl font-bold text-emerald-700">{data.stats.tongNhap.toLocaleString()}</p>
		</div>
		<div class="rounded-xl border border-rose-100 bg-rose-50 p-4 shadow-sm">
			<p class="text-xs font-semibold tracking-wider text-rose-600 uppercase">
				Tổng xuất (toàn bộ)
			</p>
			<p class="mt-1 text-2xl font-bold text-rose-700">{data.stats.tongXuat.toLocaleString()}</p>
		</div>
		<div class="rounded-xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
			<p class="text-xs font-semibold tracking-wider text-amber-600 uppercase">
				Cần bổ sung (&lt;5)
			</p>
			<p class="mt-1 text-2xl font-bold text-amber-700">{data.stats.soVatTuCanBoSung}</p>
		</div>
		<div class="rounded-xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
			<p class="text-xs font-semibold tracking-wider text-blue-600 uppercase">Trị giá kho (ước)</p>
			<p class="mt-1 text-lg font-bold text-blue-700">{formatCurrency(data.stats.tongGiaTri)}</p>
		</div>
	</div>

	<!-- 7 ngày gần đây -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
			<h3 class="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase">
				📅 Hoạt động 7 ngày qua
			</h3>
			<div class="flex items-center justify-around">
				<div class="text-center">
					<div class="text-3xl font-bold text-emerald-600">+{nhap7Days}</div>
					<div class="mt-1 text-xs text-slate-500">Nhập kho</div>
				</div>
				<div class="h-12 w-px bg-slate-200"></div>
				<div class="text-center">
					<div class="text-3xl font-bold text-rose-600">-{xuat7Days}</div>
					<div class="mt-1 text-xs text-slate-500">Xuất kho</div>
				</div>
				<div class="h-12 w-px bg-slate-200"></div>
				<div class="text-center">
					<div class="text-3xl font-bold text-slate-700">{recent7Days.length}</div>
					<div class="mt-1 text-xs text-slate-500">Phiếu GD</div>
				</div>
			</div>
		</div>

		<!-- Cảnh báo tồn kho thấp -->
		<div class="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
			<h3 class="mb-3 text-xs font-bold tracking-wider text-amber-700 uppercase">
				⚠️ Vật tư cần bổ sung
			</h3>
			<div class="space-y-2">
				{#each data.vat_tu.filter((v) => (v.so_luong_ton_kho || 0) < 5).slice(0, 5) as vt}
					<div class="flex items-center justify-between text-xs">
						<span class="truncate font-medium text-slate-700">{vt.ten_vat_tu}</span>
						<span
							class="ml-2 flex-shrink-0 rounded bg-rose-100 px-2 py-0.5 font-bold text-rose-700"
						>
							{vt.so_luong_ton_kho || 0}
							{vt.don_vi || ''}
						</span>
					</div>
				{:else}
					<p class="text-xs text-amber-600">Tất cả vật tư đều đủ tồn kho! 🎉</p>
				{/each}
				{#if data.vat_tu.filter((v) => (v.so_luong_ton_kho || 0) < 5).length > 5}
					<p class="text-center text-[10px] text-amber-600 italic">
						+ {data.vat_tu.filter((v) => (v.so_luong_ton_kho || 0) < 5).length - 5} vật tư khác...
					</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- Table tồn kho -->
	<div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
		<div class="border-b border-slate-100 p-4">
			<div class="flex flex-wrap items-center gap-3">
				<div class="relative min-w-48 flex-1">
					<span
						class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-lg text-slate-400"
						>search</span
					>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Tìm vật tư..."
						class="w-full rounded-lg border border-slate-200 bg-white py-2 pr-4 pl-10 text-sm focus:border-[#1e5ed4] focus:ring-1 focus:ring-[#1e5ed4]"
					/>
				</div>
				<div class="flex items-center gap-2">
					{#each [['all', 'Tất cả'], ['thap', 'Sắp hết (< 5)'], ['du', 'Đủ dùng'], ['cao', 'Dồi dào']] as [val, label]}
						<button
							onclick={() => (filterLoai = val)}
							class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors {filterLoai ===
							val
								? 'bg-[#1e5ed4] text-white'
								: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
						>
							{label}
						</button>
					{/each}
				</div>
				<span class="ml-auto text-xs text-slate-500">
					{filteredVatTu.length} / {data.vat_tu.length} vật tư
				</span>
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm whitespace-nowrap">
				<thead class="bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
					<tr>
						<th class="border-b border-slate-100 px-5 py-3">Tên vật tư</th>
						<th class="border-b border-slate-100 px-5 py-3">Đơn vị</th>
						<th class="border-b border-slate-100 px-5 py-3 text-right">Tồn kho</th>
						<th class="border-b border-slate-100 px-5 py-3 text-right">Đơn giá TK</th>
						<th class="border-b border-slate-100 px-5 py-3 text-right">Trị giá</th>
						<th class="border-b border-slate-100 px-5 py-3 text-center">Tình trạng</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredVatTu as vt}
						{@const muc = getMucTon(vt.so_luong_ton_kho || 0)}
						<tr class="transition-colors hover:bg-slate-50">
							<td class="px-5 py-3 font-medium text-slate-800">{vt.ten_vat_tu}</td>
							<td class="px-5 py-3 text-slate-500">{vt.don_vi || '–'}</td>
							<td
								class="px-5 py-3 text-right font-mono font-bold {(vt.so_luong_ton_kho || 0) < 5
									? 'text-rose-600'
									: 'text-slate-900'}"
							>
								{(vt.so_luong_ton_kho || 0).toLocaleString()}
							</td>
							<td class="px-5 py-3 text-right text-slate-500"
								>{formatCurrency(vt.don_gia_tham_khao)}</td
							>
							<td class="px-5 py-3 text-right font-medium text-slate-700">
								{formatCurrency((vt.so_luong_ton_kho || 0) * (vt.don_gia_tham_khao || 0))}
							</td>
							<td class="px-5 py-3 text-center">
								<span class="inline-flex rounded px-2 py-0.5 text-[11px] font-bold {muc.cls}"
									>{muc.label}</span
								>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="6" class="px-5 py-8 text-center text-sm text-slate-400"
								>Không tìm thấy vật tư nào.</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
