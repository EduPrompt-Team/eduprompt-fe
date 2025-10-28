import React, { useEffect, useState } from 'react';
import { userService, packageService, aiHistoryService, storageTemplateService } from '@/services';
import { packageCategoryService } from '@/services/packageCategoryService';
import type { Package } from '@/services/packageService';

type ViewKey = 'manage' | 'managePrompt' | 'createPrompt' | 'createPackage';

const SidebarButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
            active ? 'bg-blue-600 text-white' : 'bg-[#1f1f33] text-neutral-200 hover:bg-[#2a2a44]'
        }`}
    >
        {children}
    </button>
);

const StatCard: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
    <div className="bg-[#1a1a2d] border border-[#2a2a44] rounded-xl p-4">
        <div className="text-neutral-400 text-sm">{label}</div>
        <div className="text-2xl font-semibold text-white mt-1">{value}</div>
    </div>
);

const DashboardAdmin: React.FC = () => {
    const [activeView, setActiveView] = useState<ViewKey>('manage');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [totalPackages, setTotalPackages] = useState<number>(0);
    const [totalAIHistory, setTotalAIHistory] = useState<number>(0);
    const [packages, setPackages] = useState<Package[]>([]);
    const [categories, setCategories] = useState<{ categoryId: number; categoryName: string }[]>([]);

    // Form state for creating admin template prompt
    const gradeOptions = ['10','11','12'] as const
    const subjectOptions = ['Toán','Vật lý','Hóa học','Sinh học','Ngữ văn','Lịch sử','Địa lý','Tiếng Anh','Tin học','Công nghệ'] as const
    type GradeOption = typeof gradeOptions[number]
    type SubjectOption = typeof subjectOptions[number]

    const [form, setForm] = useState<{ 
        grade: GradeOption | '';
        subject: SubjectOption | '';
        chapter: string;
        templateName: string;
        content: string;
        packageId: number | '';
    }>({ grade: '', subject: '', chapter: '', templateName: '', content: '', packageId: '' })
    const [saving, setSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState<string | null>(null)

    // Form state for creating package
    const [pkgForm, setPkgForm] = useState<{ packageName: string; description: string; price: number | '' ; categoryId: number | '' ; durationDays: number | '' ; isActive: boolean }>({
        packageName: '', description: '', price: '', categoryId: '', durationDays: '', isActive: true
    })
    const [pkgSaving, setPkgSaving] = useState(false)
    const [pkgMsg, setPkgMsg] = useState<string | null>(null)
    const subjectKeyMap: Record<SubjectOption, string> = {
        'Toán': 'math',
        'Vật lý': 'physics',
        'Hóa học': 'chemistry',
        'Sinh học': 'biology',
        'Ngữ văn': 'literature',
        'Lịch sử': 'history',
        'Địa lý': 'geography',
        'Tiếng Anh': 'english',
        'Tin học': 'informatics',
        'Công nghệ': 'technology',
    }

    const [lastRoute, setLastRoute] = useState<string | null>(null)

    // Predefined chapters per (grade, subject) for khối 10/11/12
    function generateChapters(from: number, to: number): string[] {
        const arr: string[] = []
        for (let i = from; i <= to; i++) arr.push(`Chương ${i}`)
        return arr
    }
    const defaultChapters = generateChapters(1, 10)
    const predefinedChapters: Record<string, string[]> = {
        // Khối 10
        '10-math': defaultChapters,
        '10-physics': defaultChapters,
        '10-chemistry': defaultChapters,
        '10-biology': defaultChapters,
        '10-literature': defaultChapters,
        '10-history': defaultChapters,
        '10-geography': defaultChapters,
        '10-english': defaultChapters,
        '10-informatics': defaultChapters,
        '10-technology': defaultChapters,
        // Khối 11
        '11-math': defaultChapters,
        '11-physics': defaultChapters,
        '11-chemistry': defaultChapters,
        '11-biology': defaultChapters,
        '11-literature': defaultChapters,
        '11-history': defaultChapters,
        '11-geography': defaultChapters,
        '11-english': defaultChapters,
        '11-informatics': defaultChapters,
        '11-technology': defaultChapters,
        // Khối 12
        '12-math': defaultChapters,
        '12-physics': defaultChapters,
        '12-chemistry': defaultChapters,
        '12-biology': defaultChapters,
        '12-literature': defaultChapters,
        '12-history': defaultChapters,
        '12-geography': defaultChapters,
        '12-english': defaultChapters,
        '12-informatics': defaultChapters,
        '12-technology': defaultChapters,
    }

    function getChapterOptions(grade: GradeOption | '', subject: SubjectOption | ''): string[] {
        if (!grade || !subject) return []
        const subjectKey = subjectKeyMap[subject]
        return predefinedChapters[`${grade}-${subjectKey}`] || []
    }

    const chapterOptions = getChapterOptions(form.grade, form.subject)

    // Keep chapter synced with available options
    useEffect(() => {
        if (chapterOptions.length > 0 && !chapterOptions.includes(form.chapter)) {
            setForm((f) => ({ ...f, chapter: '' }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.grade, form.subject])

    function extractChapterNumber(raw: string): number {
        const m = (raw || '').match(/(\d+)/)
        return m ? Math.max(1, parseInt(m[1], 10)) : 1
    }

    function buildTemplateRoute(grade: GradeOption | '', subject: SubjectOption | '', chapter: string): string | null {
        if (!grade || !subject) return null
        const subjectKey = subjectKeyMap[subject]
        const chapterNum = extractChapterNumber(chapter)
        // Với Toán 10 hiện có router mẫu:
        // - /grade10/math/detail/chuong1
        // - /grade10/math/detail/chuong1/chat
        // - /grade10/math/detail/chuong2
        if (grade === '10' && subjectKey === 'math') {
            return `/grade10/math/detail/chuong${chapterNum}`
        }
        // Mặc định (có thể mở rộng thêm khi có router cho môn khác/khối khác)
        return `/grade${grade}/${subjectKey}/detail/chuong${chapterNum}`
    }

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const [usersRes, packagesRes, aiHistoryRes, cateRes] = await Promise.all([
                    userService.getAllUsers().catch(() => []),
                    packageService.getAllPackages().catch(() => []),
                    aiHistoryService.getAllHistory().catch(() => []),
                    packageCategoryService.getActiveCategories().catch(() => []),
                ]);
                if (!mounted) return;
                setTotalUsers(usersRes?.length ?? 0);
                setTotalPackages(packagesRes?.length ?? 0);
                setTotalAIHistory(aiHistoryRes?.length ?? 0);
                setPackages(packagesRes ?? [])
                setCategories(cateRes ?? [])
            } catch (e: any) {
                if (!mounted) return;
                setError('Không thể tải dữ liệu tổng quan');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);


    return (
        <div className="min-h-screen bg-[#131327] text-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#17172b] border-r border-[#2a2a44] p-4 space-y-2">
                <div className="text-lg font-semibold mb-3">Bảng điều khiển</div>
                <SidebarButton active={activeView === 'manage'} onClick={() => setActiveView('manage')}>Quản lý</SidebarButton>
                <SidebarButton active={activeView === 'managePrompt'} onClick={() => setActiveView('managePrompt')}>Quản lý prompt</SidebarButton>
                <SidebarButton active={activeView === 'createPrompt'} onClick={() => setActiveView('createPrompt')}>Tạo Prompt</SidebarButton>
                <SidebarButton active={activeView === 'createPackage'} onClick={() => setActiveView('createPackage')}>Tạo Package</SidebarButton>
            </aside>

            {/* Main */}
            <main className="flex-1 p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Dashboard Admin</h1>
                    <p className="text-neutral-400">Tổng quan hệ thống và thao tác quản trị</p>
                </div>

                {loading ? (
                    <div className="text-neutral-300">Đang tải dữ liệu...</div>
                ) : error ? (
                    <div className="text-red-400">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <StatCard label="Tổng người dùng" value={totalUsers} />
                        <StatCard label="Tổng gói (Package)" value={totalPackages} />
                        <StatCard label="Lịch sử AI" value={totalAIHistory} />
                    </div>
                )}

                {/* Views */}
                {activeView === 'manage' && (
                    <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-3">Quản lý</h2>
                        <p className="text-neutral-300">Chọn mục ở sidebar để thao tác. Khu vực này có thể mở rộng thêm danh sách người dùng, đơn hàng, ...</p>
                    </div>
                )}

                {activeView === 'managePrompt' && (
                    <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-3">Quản lý Prompt</h2>
                        <ul className="list-disc list-inside text-neutral-300 space-y-1">
                            <li>Xem template đã lưu</li>
                            <li>Thống kê lượt dùng AI</li>
                            <li>Quản lý phản hồi người dùng</li>
                        </ul>
                    </div>
                )}

                {activeView === 'createPrompt' && (
                    <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4">Tạo Template Prompt (Admin)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Khối</label>
                                <select
                                    value={form.grade}
                                    onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value as GradeOption }))}
                                    className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm"
                                >
                                    <option value="">Chọn khối</option>
                                    {gradeOptions.map((g) => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Môn</label>
                                <select
                                    value={form.subject}
                                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value as SubjectOption }))}
                                    className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm"
                                >
                                    <option value="">Chọn môn</option>
                                    {subjectOptions.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Gói / Package</label>
                                <select
                                    value={form.packageId}
                                    onChange={(e) => setForm((f) => ({ ...f, packageId: e.target.value ? Number(e.target.value) : '' }))}
                                    className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm"
                                >
                                    <option value="">Chọn package</option>
                                    {packages.map((p) => (
                                        <option key={p.packageId} value={p.packageId}>{p.packageName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Chương</label>
                                {chapterOptions.length > 0 ? (
                                    <select
                                        value={form.chapter}
                                        onChange={(e) => setForm((f) => ({ ...f, chapter: e.target.value }))}
                                        className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm"
                                    >
                                        <option value="">Chọn chương</option>
                                        {chapterOptions.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        value={form.chapter}
                                        onChange={(e) => setForm((f) => ({ ...f, chapter: e.target.value }))}
                                        placeholder="VD: Chương 1 - Mệnh đề"
                                        className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm"
                                    />
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-neutral-400 mb-1">Tên Template</label>
                                <input
                                    value={form.templateName}
                                    onChange={(e) => setForm((f) => ({ ...f, templateName: e.target.value }))}
                                    placeholder="VD: Toán 10 - Chương 1 - Ôn tập logic"
                                    className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-neutral-400 mb-1">Nội dung Prompt</label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                                    placeholder="Nhập nội dung prompt..."
                                    rows={6}
                                    className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm"
                                />
                            </div>
                            {/* Removed preview route as requested */}
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            <button
                                disabled={saving || !form.packageId || !form.templateName}
                                onClick={async () => {
                                    setSaving(true); setSaveMsg(null)
                                    try {
                                        // Build content JSON with metadata (grade, subject, chapter)
                                        const contentJson = JSON.stringify({
                                            grade: form.grade,
                                            subject: form.subject,
                                            chapter: form.chapter,
                                            content: form.content,
                                            route: buildTemplateRoute(form.grade, form.subject, form.chapter),
                                        })
                                        await storageTemplateService.saveTemplate({
                                            packageId: form.packageId as number,
                                            templateName: form.templateName,
                                            templateContent: contentJson,
                                            grade: form.grade || undefined,
                                            subject: form.subject || undefined,
                                            chapter: form.chapter || undefined,
                                        })
                                        setSaveMsg('Đã tạo template thành công.')
                                        setLastRoute(buildTemplateRoute(form.grade, form.subject, form.chapter))
                                        setForm({ grade: '', subject: '', chapter: '', templateName: '', content: '', packageId: '' })
                                    } catch (e) {
                                        setSaveMsg('Tạo template thất bại. Vui lòng thử lại.')
                                    } finally {
                                        setSaving(false)
                                    }
                                }}
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Đang lưu...' : 'Tạo Template'}
                            </button>
                            {saveMsg && <span className="text-sm text-neutral-300">{saveMsg}</span>}
                            {lastRoute && (
                                <a href={lastRoute} className="text-blue-400 underline underline-offset-2 text-sm" style={{marginLeft:8}}>
                                    Mở trang đích
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {activeView === 'createPackage' && (
                    <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4">Tạo Package (Admin)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Tên gói</label>
                                <input
                                    value={pkgForm.packageName}
                                    onChange={(e) => setPkgForm((f) => ({ ...f, packageName: e.target.value }))}
                                    placeholder="VD: Premium Math Package"
                                    className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Danh mục</label>
                                <select
                                    value={pkgForm.categoryId}
                                    onChange={(e) => setPkgForm((f) => ({ ...f, categoryId: e.target.value ? Number(e.target.value) : '' }))}
                                    className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm"
                                >
                                    <option value="">Chọn danh mục</option>
                                    {categories.map((c) => (
                                        <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-neutral-400 mb-1">Mô tả</label>
                                <textarea
                                    value={pkgForm.description}
                                    onChange={(e) => setPkgForm((f) => ({ ...f, description: e.target.value }))}
                                    placeholder="Mô tả ngắn về gói..."
                                    rows={4}
                                    className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Giá (đ)</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={pkgForm.price}
                                    onChange={(e) => setPkgForm((f) => ({ ...f, price: e.target.value === '' ? '' : Number(e.target.value) }))}
                                    placeholder="100000"
                                    className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Thời hạn (ngày)</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={pkgForm.durationDays}
                                    onChange={(e) => setPkgForm((f) => ({ ...f, durationDays: e.target.value === '' ? '' : Number(e.target.value) }))}
                                    placeholder="30"
                                    className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input id="pkg-active" type="checkbox" checked={pkgForm.isActive} onChange={(e) => setPkgForm((f) => ({ ...f, isActive: e.target.checked }))} />
                                <label htmlFor="pkg-active" className="text-sm text-neutral-300">Kích hoạt</label>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                            <button
                                disabled={pkgSaving || !pkgForm.packageName || !pkgForm.price}
                                onClick={async () => {
                                    setPkgSaving(true); setPkgMsg(null)
                                    try {
                                        await packageService.createPackage({
                                            packageName: pkgForm.packageName,
                                            description: pkgForm.description || undefined,
                                            price: Number(pkgForm.price || 0),
                                            categoryId: (pkgForm.categoryId as number) || undefined,
                                        } as any)
                                        setPkgMsg('Đã tạo package thành công.')
                                        setPkgForm({ packageName: '', description: '', price: '', categoryId: '', durationDays: '', isActive: true })
                                    } catch {
                                        setPkgMsg('Tạo package thất bại. Vui lòng thử lại.')
                                    } finally {
                                        setPkgSaving(false)
                                    }
                                }}
                                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {pkgSaving ? 'Đang lưu...' : 'Tạo Package'}
                            </button>
                            {pkgMsg && <span className="text-sm text-neutral-300">{pkgMsg}</span>}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export { DashboardAdmin as default };


