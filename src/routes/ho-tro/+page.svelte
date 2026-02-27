<script>
	// Page logic (if any)
</script>

<svelte:head>
	<title>Hỗ trợ - AdminPanel</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight text-slate-800">Trung tâm Hỗ trợ</h1>
			<p class="mt-2 text-sm text-slate-500">
				Liên hệ với đội ngũ phát triển để được giải đáp thắc mắc và hỗ trợ kỹ thuật
			</p>
		</div>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- Contact Info Card -->
		<div
			class="col-span-full rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 lg:col-span-2"
		>
			<div class="flex items-start space-x-6">
				<div
					class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"
				>
					<span class="material-symbols-outlined text-4xl">developer_mode</span>
				</div>
				<div class="flex-1">
					<h2 class="text-xl font-bold text-slate-800">VIQTeam</h2>
					<p class="mt-1 text-slate-500">
						Đội ngũ phát triển phần mềm và cung cấp giải pháp công nghệ
					</p>

					<div class="mt-8 grid gap-6 sm:grid-cols-2">
						<div class="flex items-center space-x-3">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500 ring-1 ring-slate-100"
							>
								<span class="material-symbols-outlined text-lg">call</span>
							</div>
							<div>
								<p class="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
									Điện thoại / Zalo
								</p>
								<p class="text-sm font-semibold text-slate-700">0987.654.321</p>
							</div>
						</div>

						<div class="flex items-center space-x-3">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500 ring-1 ring-slate-100"
							>
								<span class="material-symbols-outlined text-lg">mail</span>
							</div>
							<div>
								<p class="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
									Email Hỗ trợ
								</p>
								<p class="text-sm font-semibold text-slate-700">contact@viqteam.com</p>
							</div>
						</div>

						<div class="flex items-center space-x-3">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500 ring-1 ring-slate-100"
							>
								<span class="material-symbols-outlined text-lg">language</span>
							</div>
							<div>
								<p class="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
									Website
								</p>
								<a
									href="https://www.viqteam.com"
									class="text-sm font-semibold text-blue-600 hover:underline">www.viqteam.com</a
								>
							</div>
						</div>

						<div class="flex items-center space-x-3">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500 ring-1 ring-slate-100"
							>
								<span class="material-symbols-outlined text-lg">schedule</span>
							</div>
							<div>
								<p class="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
									Thời gian làm việc
								</p>
								<p class="text-sm font-semibold text-slate-700">T2 - T6 (08:00 - 17:30)</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Quick Links or Social Card -->
		<div
			class="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-lg lg:col-span-1"
		>
			<h3 class="text-lg font-bold">Cần hỗ trợ gấp?</h3>
			<p class="mt-2 text-sm text-blue-100">
				Nếu bạn gặp sự cố nghiêm trọng, vui lòng liên hệ trực tiếp qua Hotline.
			</p>

			<div class="mt-8 space-y-4">
				<a
					href="tel:0987654321"
					class="flex w-full items-center justify-center space-x-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 focus:outline-none"
				>
					<span class="material-symbols-outlined text-xl">phone_in_talk</span>
					<span>Gọi Hotline</span>
				</a>

				<a
					href="mailto:contact@viqteam.com"
					class="flex w-full items-center justify-center space-x-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 focus:outline-none"
				>
					<span class="material-symbols-outlined text-xl">mark_email_unread</span>
					<span>Gửi Email</span>
				</a>
			</div>

			<div class="mt-8 flex items-center justify-center space-x-1 opacity-80">
				<span class="material-symbols-outlined text-sm">verified</span>
				<span class="text-xs font-medium tracking-widest uppercase">Phản hồi trong 24h</span>
			</div>
		</div>
	</div>

	<!-- FAQ Section (Optional Extra) -->
	<div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
		<div class="mb-6 flex items-center space-x-3">
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600"
			>
				<span class="material-symbols-outlined">lightbulb</span>
			</div>
			<h2 class="text-lg font-bold text-slate-800">Hướng dẫn nhanh</h2>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<div
				class="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100"
			>
				<h3 class="flex items-center gap-2 font-semibold text-slate-800">
					<span class="material-symbols-outlined text-sm text-blue-500">arrow_right_alt</span>
					Tài khoản & Đăng nhập
				</h3>
				<p class="mt-1 text-sm text-slate-500">
					Hướng dẫn thiết lập lại mật khẩu, phân quyền người dùng và quản lý tài khoản.
				</p>
			</div>

			<div
				class="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100"
			>
				<h3 class="flex items-center gap-2 font-semibold text-slate-800">
					<span class="material-symbols-outlined text-sm text-blue-500">arrow_right_alt</span>
					Quản lý Vật tư
				</h3>
				<p class="mt-1 text-sm text-slate-500">
					Cách thao tác thêm mới, xuất/nhập kho và kiểm tra báo cáo tồn kho hiệu quả.
				</p>
			</div>

			<div
				class="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100"
			>
				<h3 class="flex items-center gap-2 font-semibold text-slate-800">
					<span class="material-symbols-outlined text-sm text-blue-500">arrow_right_alt</span>
					Lỗi hệ thống
				</h3>
				<p class="mt-1 text-sm text-slate-500">
					Các lỗi thường gặp và cách khắc phục khi bị gián đoạn kết nối, không tải được dữ liệu.
				</p>
			</div>

			<div
				class="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100"
			>
				<h3 class="flex items-center gap-2 font-semibold text-slate-800">
					<span class="material-symbols-outlined text-sm text-blue-500">arrow_right_alt</span>
					Đề xuất tính năng
				</h3>
				<p class="mt-1 text-sm text-slate-500">
					Góp ý nâng cấp phần mềm, gửi yêu cầu thêm chức năng mới phù hợp với nhu cầu.
				</p>
			</div>
		</div>
	</div>
</div>
