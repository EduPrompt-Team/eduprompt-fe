import React, { useEffect, useState } from 'react';
import { userService, packageService, aiHistoryService, storageTemplateService } from '@/services';
import { packageCategoryService } from '@/services/packageCategoryService';
import { orderService } from '@/services/orderService';
import { reviewService } from '@/services/reviewService';
import type { Package } from '@/services/packageService';
import type { Order } from '@/services/orderService';
import type { Review } from '@/services/reviewService';
import { useToast } from '@/components/ui/toast';
import { Trash2, Star } from 'lucide-react';

type ViewKey = 'manage' | 'managePrompt' | 'createPrompt' | 'createPackage' | 'createCategory' | 'managePackages' | 'manageReviews';

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
    const { showToast } = useToast();
    const [activeView, setActiveView] = useState<ViewKey>('manage');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [totalPackages, setTotalPackages] = useState<number>(0);
    const [totalAIHistory, setTotalAIHistory] = useState<number>(0);
    const [totalTemplates, setTotalTemplates] = useState<number>(0);
    const [packages, setPackages] = useState<Package[]>([]);
    const [categories, setCategories] = useState<{ categoryId: number; categoryName: string }[]>([]);
    // Track các categories được tạo thủ công qua form "Tạo Phân Loại"
    const [userCreatedCategories, setUserCreatedCategories] = useState<number[]>([]);
    // removed creatingCategory state
    // State for user purchases
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    // State for reviews management
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [reviewDeleting, setReviewDeleting] = useState<number | null>(null);
    const [templates, setTemplates] = useState<any[]>([]);
    // State for managing all prompts/templates
    const [allTemplates, setAllTemplates] = useState<any[]>([]);
    const [loadingAllTemplates, setLoadingAllTemplates] = useState(false);
    const [templateDeleting, setTemplateDeleting] = useState<number | null>(null);
    const [viewingTemplateId, setViewingTemplateId] = useState<number | null>(null);

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
        price: number | '';
    }>({ grade: '', subject: '', chapter: '', templateName: '', content: '', packageId: '', price: '' })
    const [saving, setSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState<string | null>(null)

    // Form state for creating package
    const [pkgForm, setPkgForm] = useState<{ packageName: string; description: string; price: number | '' ; categoryId: number | '' ; durationDays: number | '' ; isActive: boolean; durationMonths: number | '' }>({
        packageName: '', description: '', price: '', categoryId: '', durationDays: '', isActive: true, durationMonths: ''
    })
    const [pkgSaving, setPkgSaving] = useState(false)
    const [pkgMsg, setPkgMsg] = useState<string | null>(null)

    // Form state for creating category
    const [categoryForm, setCategoryForm] = useState<{ categoryName: string }>({ categoryName: '' })
    const [categorySaving, setCategorySaving] = useState(false)
    const [categoryMsg, setCategoryMsg] = useState<string | null>(null)
    
    // State for editing category
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
    const [editCategoryName, setEditCategoryName] = useState<string>('')
    const [categoryDeleting, setCategoryDeleting] = useState<number | null>(null)
    
    // State for editing package
    const [editingPackageId, setEditingPackageId] = useState<number | null>(null)
    const [editPkgForm, setEditPkgForm] = useState<{ packageName: string; description: string; price: number | ''; categoryId: number | ''; durationDays: number | ''; durationMonths: number | ''; isActive: boolean }>({
        packageName: '', description: '', price: '', categoryId: '', durationDays: '', durationMonths: '', isActive: true
    })
    const [packageDeleting, setPackageDeleting] = useState<number | null>(null)
    const [packageEditing, setPackageEditing] = useState<number | null>(null)
    const [editTierSelectValue, setEditTierSelectValue] = useState<string>('')
    const [viewingDetailsId, setViewingDetailsId] = useState<number | null>(null)
    // State for viewing order details
    const [viewingOrderId, setViewingOrderId] = useState<number | null>(null)
    const [orderDetails, setOrderDetails] = useState<Order | null>(null)
    const [loadingOrderDetails, setLoadingOrderDetails] = useState(false)
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
    const [priceDisabled, setPriceDisabled] = React.useState(false)
    const [tierSelectValue, setTierSelectValue] = React.useState<string>('')

    // Initialize tierSelectValue once from existing form when component mounts
    React.useEffect(() => {
      setTierSelectValue(pkgForm.categoryId === '' ? '' : String(pkgForm.categoryId))
      // we intentionally do not depend on pkgForm to avoid value being reset after user picks
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
        
        // Tự động sinh route theo pattern: /grade{grade}/{subjectKey}/detail/chuong{chapterNum}
        // Ví dụ: /grade10/chemistry/detail/chuong1, /grade11/physics/detail/chuong2, etc.
        return `/grade${grade}/${subjectKey}/detail/chuong${chapterNum}`
    }

    // Load userCreatedCategories từ localStorage khi mount
    useEffect(() => {
        const saved = localStorage.getItem('userCreatedCategories')
        if (saved) {
            try {
                const ids = JSON.parse(saved)
                if (Array.isArray(ids)) {
                    setUserCreatedCategories(ids)
                }
            } catch {}
        }
    }, [])

    // Load reviews when manageReviews view is active
    useEffect(() => {
        if (activeView !== 'manageReviews') return;
        
        let mounted = true;
        (async () => {
            try {
                setLoadingReviews(true);
                // Load reviews, templates (from both public and my-storage), and users
                const [reviewsRes, publicTemplatesRes, myTemplatesRes, usersRes] = await Promise.all([
                    reviewService.getAllReviews().catch(() => []),
                    storageTemplateService.getPublicTemplates({}).catch(() => []),
                    storageTemplateService.getMyStorage().catch(() => []),
                    userService.getAllUsers().catch(() => []),
                ]);
                if (!mounted) return;
                
                // Combine public and my-storage templates
                const publicTemplates = Array.isArray(publicTemplatesRes) ? publicTemplatesRes : []
                const myTemplates = Array.isArray(myTemplatesRes) ? myTemplatesRes : []
                const allTemplatesList = [...publicTemplates, ...myTemplates]
                // Remove duplicates by storageId
                const uniqueTemplates = allTemplatesList.reduce((acc: any[], template: any) => {
                    const storageId = template.storageId || template.id
                    if (!acc.find((t: any) => (t.storageId || t.id) === storageId)) {
                        acc.push(template)
                    }
                    return acc
                }, [])
                
                setReviews(Array.isArray(reviewsRes) ? reviewsRes : []);
                setTemplates(uniqueTemplates);
                setUsers(Array.isArray(usersRes) ? usersRes : []);
                console.log('[DashboardAdmin] Loaded reviews:', reviewsRes?.length || 0, 'templates:', uniqueTemplates.length, 'users:', usersRes?.length || 0)
            } catch (e: any) {
                if (!mounted) return;
                console.error('Failed to load reviews:', e);
            } finally {
                if (mounted) setLoadingReviews(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [activeView]);

    // Load all templates when managePrompt view is active
    useEffect(() => {
        if (activeView !== 'managePrompt') return;
        
        let mounted = true;
        (async () => {
            try {
                setLoadingAllTemplates(true);
                // Load both my-storage (admin's templates) and all public templates
                const [myTemplatesRes, publicTemplatesRes] = await Promise.all([
                    storageTemplateService.getMyStorage().catch(() => []),
                    storageTemplateService.getPublicTemplates({}).catch(() => []),
                ]);
                
                if (!mounted) return;
                
                // Combine and deduplicate by storageId
                const allTemplatesArray = [...(myTemplatesRes || []), ...(publicTemplatesRes || [])];
                const templateMap = new Map<number, any>();
                
                allTemplatesArray.forEach(t => {
                    if (t.storageId && !templateMap.has(t.storageId)) {
                        templateMap.set(t.storageId, t);
                    }
                });
                
                // Sort by createdAt descending (newest first)
                const sortedTemplates = Array.from(templateMap.values()).sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0).getTime();
                    const dateB = new Date(b.createdAt || 0).getTime();
                    return dateB - dateA;
                });
                
                setAllTemplates(sortedTemplates);
                setTotalTemplates(sortedTemplates.length);
                console.log('[DashboardAdmin] Loaded all templates:', sortedTemplates.length);
                // Debug: Log first template to check fields
                if (sortedTemplates.length > 0) {
                    console.log('[DashboardAdmin] Sample template data:', JSON.stringify(sortedTemplates[0], null, 2));
                    console.log('[DashboardAdmin] Template fields check:', {
                        storageId: sortedTemplates[0].storageId,
                        grade: sortedTemplates[0].grade,
                        subject: sortedTemplates[0].subject,
                        chapter: sortedTemplates[0].chapter,
                        createdAt: sortedTemplates[0].createdAt,
                        templateContent: sortedTemplates[0].templateContent ? 'exists' : 'null'
                    });
                }
            } catch (e: any) {
                if (!mounted) return;
                console.error('[DashboardAdmin] Failed to load templates:', e);
                showToast('Không thể tải danh sách templates', 'error');
            } finally {
                if (mounted) setLoadingAllTemplates(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [activeView]);

    // 1) Khi mount, load dữ liệu
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const [usersRes, packagesRes, aiHistoryRes, cateResRaw, ordersRes, myTemplatesRes, publicTemplatesRes] = await Promise.all([
                    userService.getAllUsers().catch(() => []),
                    packageService.getAllPackages().catch(() => []),
                    aiHistoryService.getAllHistory().catch(() => []),
                    packageCategoryService.getActiveCategories().catch(() => []),
                    orderService.getAllOrders().catch(() => []),
                    storageTemplateService.getMyStorage().catch(() => []),
                    storageTemplateService.getPublicTemplates({}).catch(() => []),
                ]);
                const cateRes = Array.isArray(cateResRaw) ? cateResRaw : [];
                if (!mounted) return;
                setTotalUsers(usersRes?.length ?? 0);
                setTotalPackages(packagesRes?.length ?? 0);
                setTotalAIHistory(aiHistoryRes?.length ?? 0);
                
                // Combine templates for total count
                const allTemplatesArray = [...(myTemplatesRes || []), ...(publicTemplatesRes || [])];
                const templateMap = new Map<number, any>();
                allTemplatesArray.forEach(t => {
                    if (t.storageId && !templateMap.has(t.storageId)) {
                        templateMap.set(t.storageId, t);
                    }
                });
                setTotalTemplates(templateMap.size);
                
                setPackages(packagesRes ?? [])
                setCategories(cateRes ?? [])
                setUsers(usersRes ?? [])
                setOrders(ordersRes ?? [])
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

    // 1. Tier options
    // Sync chọn tier sẽ tự fill tên, code
    // Removed useEffect for syncing tier selection to form

    // ensureTierCategory: tìm theo tên, tạo nếu thiếu, không dựa vào code
    async function ensureTierCategory(label: string): Promise<number | null> {
        try {
            const refreshed = await packageCategoryService.getActiveCategories().catch(() => [])
            const foundByName = (refreshed || []).find((c: any) => (c.categoryName || '').toLowerCase() === (label || '').toLowerCase())
            if (foundByName) return foundByName.categoryId
            await (packageCategoryService as any).createCategory({ categoryName: label, isActive: true })
            const refreshed2 = await packageCategoryService.getActiveCategories().catch(() => [])
            const found2 = (refreshed2 || []).find((c: any) => (c.categoryName || '').toLowerCase() === (label || '').toLowerCase())
            if (found2) setCategories(refreshed2)
            return found2 ? found2.categoryId : null
        } catch { return null }
    }
    // Helper to handle tier change value
    const onTierChange = async (raw: string) => {
        setTierSelectValue(raw)
        const asNum = Number(raw)
        if (!Number.isNaN(asNum) && raw !== '') {
            const cat: any = categories.find((c) => c.categoryId === asNum)
            const isFree = (cat?.categoryName || '').toLowerCase() === 'free'
            setPkgForm(f => ({ ...f, categoryId: asNum, price: isFree ? 0 : f.price }))
            setPriceDisabled(isFree)
        }
        // value sẽ luôn là id từ API; không xử lý fallback non-numeric nữa
    }
    // Build tier options chỉ từ categories được tạo thủ công qua form "Tạo Phân Loại"
    const currentTierOptions = (() => {
        // Chỉ hiển thị categories được tạo thủ công (có trong userCreatedCategories)
        const userCategories = (categories || []).filter((c: any) => 
            userCreatedCategories.includes(c.categoryId)
        )
        
        // Loại bỏ trùng lặp theo tên (case-insensitive)
        const seen = new Set<string>()
        const uniqueCategories: { value: string; label: string }[] = []
        
        userCategories.forEach((c: any) => {
            const name = (c.categoryName || '').trim()
            const key = name.toLowerCase()
            if (name && !seen.has(key)) {
                seen.add(key)
                uniqueCategories.push({
                    value: String(c.categoryId),
                    label: c.categoryName
                })
            }
        })
        
        // Sắp xếp theo tên để dễ tìm
        return uniqueCategories.sort((a, b) => a.label.localeCompare(b.label))
    })()


    return (
        <div className="min-h-screen bg-[#131327] text-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#17172b] border-r border-[#2a2a44] p-4 space-y-2">
                <div className="text-lg font-semibold mb-3">Bảng điều khiển</div>
                <SidebarButton active={activeView === 'manage'} onClick={() => setActiveView('manage')}>Quản lý</SidebarButton>
                <SidebarButton active={activeView === 'managePrompt'} onClick={() => setActiveView('managePrompt')}>Quản lý prompt</SidebarButton>
                <SidebarButton active={activeView === 'createPrompt'} onClick={() => setActiveView('createPrompt')}>Tạo Prompt</SidebarButton>
                <SidebarButton active={activeView === 'createPackage'} onClick={() => setActiveView('createPackage')}>Tạo Package</SidebarButton>
                <SidebarButton active={activeView === 'managePackages'} onClick={() => setActiveView('managePackages')}>Quản lý Package</SidebarButton>
                <SidebarButton active={activeView === 'createCategory'} onClick={() => setActiveView('createCategory')}>Tạo Phân Loại</SidebarButton>
                <SidebarButton active={activeView === 'manageReviews'} onClick={() => setActiveView('manageReviews')}>Quản lý Reviews</SidebarButton>

                <div className="mt-4 pt-4 border-t border-[#2a2a44]"></div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard label="Tổng người dùng" value={totalUsers} />
                        <StatCard label="Tổng gói (Package)" value={totalPackages} />
                        <StatCard label="Lịch sử AI" value={totalAIHistory} />
                        <StatCard label="Tổng Templates" value={totalTemplates} />
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
                    <div className="space-y-6">
                        <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Quản lý Prompt Templates</h2>
                                <button
                                    onClick={async () => {
                                        try {
                                            setLoadingAllTemplates(true);
                                            const [myTemplatesRes, publicTemplatesRes] = await Promise.all([
                                                storageTemplateService.getMyStorage().catch(() => []),
                                                storageTemplateService.getPublicTemplates({}).catch(() => []),
                                            ]);
                                            
                                            const allTemplatesArray = [...(myTemplatesRes || []), ...(publicTemplatesRes || [])];
                                            const templateMap = new Map<number, any>();
                                            
                                            allTemplatesArray.forEach(t => {
                                                if (t.storageId && !templateMap.has(t.storageId)) {
                                                    templateMap.set(t.storageId, t);
                                                }
                                            });
                                            
                                            const sortedTemplates = Array.from(templateMap.values()).sort((a, b) => {
                                                const dateA = new Date(a.createdAt || 0).getTime();
                                                const dateB = new Date(b.createdAt || 0).getTime();
                                                return dateB - dateA;
                                            });
                                            
                                            setAllTemplates(sortedTemplates);
                                            setTotalTemplates(sortedTemplates.length);
                                            showToast('Đã làm mới danh sách templates', 'success');
                                        } catch (e) {
                                            showToast('Không thể làm mới danh sách templates', 'error');
                                        } finally {
                                            setLoadingAllTemplates(false);
                                        }
                                    }}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm"
                                >
                                    🔄 Làm mới
                                </button>
                            </div>

                            {loadingAllTemplates ? (
                                <div className="text-center py-8 text-neutral-400">Đang tải templates...</div>
                            ) : allTemplates.length === 0 ? (
                                <div className="text-center py-8 text-neutral-400">
                                    Chưa có template nào được tạo
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                    {allTemplates.map((template: any) => {
                                        const isViewing = viewingTemplateId === template.storageId;
                                        const packageInfo = packages.find((p: Package) => p.packageId === template.packageId);
                                        const userInfo = users.find((u: any) => u.userId === template.userId || u.id === template.userId);
                                        
                                        // Parse templateContent để lấy route, grade, subject, chapter, content
                                        let contentRoute: string | null = null;
                                        let contentPreview: string = '';
                                        let parsedGrade: string | null = null;
                                        let parsedSubject: string | null = null;
                                        let parsedChapter: string | null = null;
                                        let parsedContent: string = '';
                                        
                                        // Debug: Log template data
                                        console.log('[DashboardAdmin] Processing template:', {
                                            storageId: template.storageId,
                                            grade: template.grade,
                                            subject: template.subject,
                                            chapter: template.chapter,
                                            createdAt: template.createdAt,
                                            hasTemplateContent: !!template.templateContent
                                        });
                                        
                                        try {
                                            if (template.templateContent) {
                                                const parsed = JSON.parse(template.templateContent);
                                                contentRoute = parsed.route || null;
                                                parsedGrade = parsed.grade || null;
                                                parsedSubject = parsed.subject || null;
                                                parsedChapter = parsed.chapter || null;
                                                parsedContent = parsed.content || template.templateContent || '';
                                                contentPreview = parsedContent;
                                                if (contentPreview.length > 100) {
                                                    contentPreview = contentPreview.substring(0, 100) + '...';
                                                }
                                                console.log('[DashboardAdmin] Parsed from templateContent:', {
                                                    parsedGrade,
                                                    parsedSubject,
                                                    parsedChapter,
                                                    hasContent: !!parsedContent
                                                });
                                            } else {
                                                contentPreview = '';
                                            }
                                        } catch (parseErr) {
                                            console.warn('[DashboardAdmin] Failed to parse templateContent:', parseErr);
                                            contentPreview = (template.templateContent || '').substring(0, 100);
                                            parsedContent = template.templateContent || '';
                                        }
                                        
                                        // Sử dụng giá trị từ template fields trước, sau đó mới từ templateContent
                                        // Nếu cả hai đều không có thì hiển thị "Chưa có"
                                        const displayGrade = template.grade || parsedGrade || 'Chưa có';
                                        const displaySubject = template.subject || parsedSubject || 'Chưa có';
                                        const displayChapter = template.chapter || parsedChapter || 'Chưa có';
                                        
                                        // Fix createdAt parsing
                                        let displayCreatedAt = 'Invalid Date';
                                        if (template.createdAt) {
                                            try {
                                                const date = new Date(template.createdAt);
                                                if (!isNaN(date.getTime())) {
                                                    displayCreatedAt = date.toLocaleDateString('vi-VN', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit'
                                                    });
                                                }
                                            } catch (dateErr) {
                                                console.warn('[DashboardAdmin] Failed to parse createdAt:', template.createdAt, dateErr);
                                            }
                                        }
                                        
                                        return (
                                            <div
                                                key={template.storageId}
                                                className="p-4 bg-[#23233a] border border-[#2a2a44] rounded-lg"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        {/* Header Info */}
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-xs text-neutral-400">#{template.storageId}</span>
                                                            <h3 className="text-base font-semibold text-white">{template.templateName}</h3>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                                template.isPublic 
                                                                    ? 'bg-green-500/20 text-green-400' 
                                                                    : 'bg-gray-500/20 text-gray-400'
                                                            }`}>
                                                                {template.isPublic ? 'Công khai' : 'Riêng tư'}
                                                            </span>
                                                            {packageInfo && (
                                                                <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400">
                                                                    Package: {packageInfo.packageName}
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Details Grid */}
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-2">
                                                            <div>
                                                                <span className="text-neutral-400">Khối:</span>
                                                                <span className={`ml-2 ${displayGrade === 'Chưa có' ? 'text-yellow-400' : 'text-white'}`}>
                                                                    {displayGrade}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-neutral-400">Môn:</span>
                                                                <span className={`ml-2 ${displaySubject === 'Chưa có' ? 'text-yellow-400' : 'text-white'}`}>
                                                                    {displaySubject}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-neutral-400">Chương:</span>
                                                                <span className={`ml-2 ${displayChapter === 'Chưa có' ? 'text-yellow-400' : 'text-white'}`}>
                                                                    {displayChapter}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-neutral-400">Ngày tạo:</span>
                                                                <span className="text-white ml-2">
                                                                    {displayCreatedAt}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* User Info */}
                                                        {userInfo && (
                                                            <div className="text-xs text-neutral-400 mb-2">
                                                                Tạo bởi: {userInfo.fullName || userInfo.email || `User #${template.userId}`}
                                                            </div>
                                                        )}
                                                        
                                                        {/* Content Preview */}
                                                        {contentPreview && (
                                                            <div className="text-xs text-neutral-300 mb-2 bg-[#1a1a2d] p-2 rounded border border-[#2a2a44]">
                                                                <span className="text-neutral-400">Preview:</span> {contentPreview}
                                                            </div>
                                                        )}
                                                        
                                                        {/* Route */}
                                                        {contentRoute && (
                                                            <div className="text-xs mb-2">
                                                                <a
                                                                    href={contentRoute}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-400 hover:text-blue-300 underline"
                                                                >
                                                                    🔗 {contentRoute}
                                                                </a>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Expanded Details */}
                                                        {isViewing && (
                                                            <div className="mt-3 pt-3 border-t border-[#2a2a44]">
                                                                {/* Thông tin chi tiết: Khối, Môn, Chương */}
                                                                <div className="mb-4">
                                                                    <h4 className="text-sm font-semibold text-white mb-2">📚 Thông tin Template</h4>
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm bg-[#1a1a2d] p-3 rounded border border-[#2a2a44]">
                                                                        <div>
                                                                            <span className="text-neutral-400 block mb-1">Khối (Grade):</span>
                                                                            <span className={`text-lg font-semibold ${displayGrade === 'Chưa có' ? 'text-yellow-400' : 'text-blue-400'}`}>
                                                                                {displayGrade}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-neutral-400 block mb-1">Môn (Subject):</span>
                                                                            <span className={`text-lg font-semibold ${displaySubject === 'Chưa có' ? 'text-yellow-400' : 'text-blue-400'}`}>
                                                                                {displaySubject}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-neutral-400 block mb-1">Chương (Chapter):</span>
                                                                            <span className={`text-lg font-semibold ${displayChapter === 'Chưa có' ? 'text-yellow-400' : 'text-blue-400'}`}>
                                                                                {displayChapter}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Nội dung Prompt đầy đủ */}
                                                                <div className="mb-4">
                                                                    <h4 className="text-sm font-semibold text-white mb-2">📝 Nội dung Prompt</h4>
                                                                    <div className="bg-[#1a1a2d] p-4 rounded border border-[#2a2a44]">
                                                                        {parsedContent || template.templateContent ? (
                                                                            <div className="text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                                                                                {parsedContent || template.templateContent}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-sm text-yellow-400 italic">
                                                                                Chưa có nội dung prompt
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Route nếu có */}
                                                                {contentRoute && (
                                                                    <div className="mb-4">
                                                                        <h4 className="text-sm font-semibold text-white mb-2">🔗 Route</h4>
                                                                        <div className="bg-[#1a1a2d] p-3 rounded border border-[#2a2a44]">
                                                                            <a
                                                                                href={contentRoute}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-blue-400 hover:text-blue-300 underline break-all"
                                                                            >
                                                                                {contentRoute}
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Thông tin kỹ thuật */}
                                                                <div className="mb-3">
                                                                    <h4 className="text-sm font-semibold text-white mb-2">🔧 Thông tin kỹ thuật</h4>
                                                                    <div className="grid grid-cols-2 gap-3 text-sm bg-[#1a1a2d] p-3 rounded border border-[#2a2a44]">
                                                                        <div>
                                                                            <span className="text-neutral-400">Storage ID:</span>
                                                                            <span className="text-white ml-2">{template.storageId}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-neutral-400">User ID:</span>
                                                                            <span className="text-white ml-2">{template.userId}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-neutral-400">Package ID:</span>
                                                                            <span className="text-white ml-2">{template.packageId || 'N/A'}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-neutral-400">Is Favorite:</span>
                                                                            <span className={`ml-2 ${template.isFavorite ? 'text-yellow-400' : 'text-neutral-400'}`}>
                                                                                {template.isFavorite ? 'Có' : 'Không'}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-neutral-400">Trạng thái:</span>
                                                                            <span className={`ml-2 ${template.isPublic ? 'text-green-400' : 'text-gray-400'}`}>
                                                                                {template.isPublic ? 'Công khai' : 'Riêng tư'}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-neutral-400">Ngày tạo:</span>
                                                                            <span className="text-white ml-2">
                                                                                {displayCreatedAt}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Raw Data */}
                                                                <details className="mt-2">
                                                                    <summary className="cursor-pointer text-xs text-neutral-400 hover:text-neutral-300">
                                                                        🔍 Raw Template Data (Debug)
                                                                    </summary>
                                                                    <pre className="mt-2 p-2 bg-[#0a0a0f] rounded text-xs text-neutral-400 overflow-auto max-h-40">
                                                                        {JSON.stringify(template, null, 2)}
                                                                    </pre>
                                                                </details>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Action Buttons */}
                                                    <div className="flex items-center gap-2 ml-4">
                                                        <button
                                                            onClick={() => {
                                                                setViewingTemplateId(isViewing ? null : template.storageId);
                                                            }}
                                                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm"
                                                        >
                                                            {isViewing ? 'Ẩn' : 'Chi tiết'}
                                                        </button>
                                                        {contentRoute && (
                                                            <a
                                                                href={contentRoute}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm"
                                                            >
                                                                Mở
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    setTemplateDeleting(template.storageId);
                                                                    await storageTemplateService.deleteTemplate(template.storageId);
                                                                    setAllTemplates(prev => prev.filter(t => t.storageId !== template.storageId));
                                                                    showToast(`Đã xóa template "${template.templateName}" thành công`, 'success');
                                                                } catch (e: any) {
                                                                    const msg = e?.response?.data?.message || e?.message || 'Xóa template thất bại';
                                                                    showToast(msg, 'error');
                                                                } finally {
                                                                    setTemplateDeleting(null);
                                                                }
                                                            }}
                                                            disabled={templateDeleting === template.storageId}
                                                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-sm"
                                                        >
                                                            {templateDeleting === template.storageId ? 'Đang xóa...' : 'Xóa'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
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
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Giá tiền (VNĐ)</label>
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value ? Number(e.target.value) : '' }))}
                                    placeholder="VD: 500000"
                                    min="0"
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
                                    
                                    // Build content JSON with metadata (grade, subject, chapter, price) - defined in outer scope for error handling
                                    const contentJson = JSON.stringify({
                                        grade: form.grade,
                                        subject: form.subject,
                                        chapter: form.chapter,
                                        content: form.content,
                                        route: buildTemplateRoute(form.grade, form.subject, form.chapter),
                                        price: form.price || 0,
                                    })
                                    
                                    try {
                                        
                                        // Validate required fields
                                        if (!form.packageId || !form.templateName.trim()) {
                                            throw new Error('Vui lòng điền đầy đủ thông tin: Package và Tên Template là bắt buộc.')
                                        }
                                        
                                        // Prepare request payload - ensure all fields are properly formatted
                                        const requestPayload: any = {
                                            packageId: Number(form.packageId),
                                            templateName: form.templateName.trim(),
                                            isPublic: true, // Set public so users can see it
                                        }
                                        
                                        // Only add optional fields if they have values
                                        if (contentJson && form.content.trim()) {
                                            requestPayload.templateContent = contentJson
                                        }
                                        if (form.grade) {
                                            // Convert to string if needed
                                            requestPayload.grade = String(form.grade) as '10' | '11' | '12'
                                        }
                                        if (form.subject && form.subject.trim()) {
                                            requestPayload.subject = form.subject.trim()
                                        }
                                        if (form.chapter && form.chapter.trim()) {
                                            requestPayload.chapter = form.chapter.trim()
                                        }
                                        
                                        // Log request payload for debugging
                                        console.log('[DashboardAdmin] Creating template with payload:', JSON.stringify(requestPayload, null, 2))
                                        
                                        // Note: 1 package có thể có nhiều templates - không cần check duplicate nữa
                                        const result = await storageTemplateService.saveTemplate(requestPayload)
                                        
                                        console.log('[DashboardAdmin] Template created successfully:', result)
                                        
                                        setSaveMsg('Đã tạo template thành công.')
                                        setLastRoute(buildTemplateRoute(form.grade, form.subject, form.chapter))
                                        setForm({ grade: '', subject: '', chapter: '', templateName: '', content: '', packageId: '', price: '' })
                                        showToast('Đã tạo template thành công!', 'success')
                                    } catch (e: any) {
                                        // Enhanced error logging
                                        console.error('[DashboardAdmin] Failed to create template:', e)
                                        console.error('[DashboardAdmin] Error response:', e?.response)
                                        console.error('[DashboardAdmin] Error data:', JSON.stringify(e?.response?.data, null, 2))
                                        console.error('[DashboardAdmin] Error status:', e?.response?.status)
                                        console.error('[DashboardAdmin] Error message:', e?.message)
                                        
                                        // Extract detailed error message
                                        let errorMsg = 'Tạo template thất bại. Vui lòng thử lại.'
                                        
                                        if (e?.response?.data) {
                                            const errorData = e.response.data
                                            
                                            // Log full error data structure
                                            console.error('[DashboardAdmin] Full error data structure:', {
                                                type: typeof errorData,
                                                isArray: Array.isArray(errorData),
                                                keys: typeof errorData === 'object' && errorData !== null ? Object.keys(errorData) : null,
                                                errorData: errorData
                                            })
                                            
                                            // Handle validation errors (array of errors)
                                            if (Array.isArray(errorData)) {
                                                errorMsg = errorData.map((err: any) => 
                                                    err.message || err.errorMessage || JSON.stringify(err)
                                                ).join(', ')
                                            }
                                            // Handle object with message field
                                            else if (errorData.message) {
                                                errorMsg = errorData.message
                                            }
                                            // Handle object with errorMessage field
                                            else if (errorData.errorMessage) {
                                                errorMsg = errorData.errorMessage
                                            }
                                            // Handle object with errors field (validation errors - common in .NET)
                                            else if (errorData.errors) {
                                                const errors = Object.values(errorData.errors).flat()
                                                errorMsg = Array.isArray(errors) ? errors.join(', ') : String(errors)
                                            }
                                            // Handle object with title field (common in .NET validation)
                                            else if (errorData.title) {
                                                errorMsg = errorData.title
                                                if (errorData.detail) {
                                                    errorMsg += ': ' + errorData.detail
                                                }
                                            }
                                            // Handle string message
                                            else if (typeof errorData === 'string') {
                                                errorMsg = errorData
                                            }
                                            // Handle object (try to stringify)
                                            else {
                                                // Try to extract meaningful message
                                                const stringified = JSON.stringify(errorData, null, 2)
                                                errorMsg = `Lỗi từ server: ${stringified.substring(0, 200)}${stringified.length > 200 ? '...' : ''}`
                                            }
                                        } else if (e?.message) {
                                            errorMsg = e.message
                                        }
                                        
                                        // Note: 1 package có thể có nhiều templates - không cần special handling cho duplicate nữa
                                        if (errorMsg.includes('package') && errorMsg.includes('not found')) {
                                            errorMsg = 'Package không tồn tại. Vui lòng chọn package hợp lệ.'
                                        }
                                        
                                        setSaveMsg(errorMsg)
                                        showToast(errorMsg, 'error')
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
                                <label className="block text-sm text-neutral-400 mb-1">Phân loại (Tier)</label>
                                <select
                                    value={tierSelectValue}
                                    onChange={e => onTierChange(e.target.value)}
                                    className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm"
                                >
                                    <option value="">Chọn phân loại</option>
                                    {currentTierOptions.map(o => (
                                        <option key={o.value} value={String(o.value)}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Thời hạn</label>
                                {(() => {
                                    // Derive duration options from categories if possible (tên chứa số tháng)
                                    const parseMonths = (name: string) => {
                                        const m = (name || '').toLowerCase().match(/(\d+)[\s-]*th(á|a)ng|month|(\d+)/)
                                        if (m && m[1]) return Math.max(1, parseInt(m[1], 10))
                                        if (m && m[3]) return Math.max(1, parseInt(m[3], 10))
                                        return undefined
                                    }
                                    const derived = categories
                                      .map(c => ({ id: c.categoryId, name: c.categoryName, months: parseMonths(c.categoryName) }))
                                      .filter(x => !!x.months) as {id:number,name:string,months:number}[]
                                    const base = derived.length ? derived : [
                                        { id: -1, name: '1 tháng', months: 1 },
                                        { id: -2, name: '3 tháng', months: 3 },
                                        { id: -3, name: '6 tháng', months: 6 },
                                        { id: -4, name: '12 tháng', months: 12 },
                                    ]
                                    return (
                                        <select
                                            value={pkgForm.durationMonths || ''}
                                            onChange={(e) => {
                                                const m = Number(e.target.value)
                                                setPkgForm((f) => ({ ...f, durationMonths: m, durationDays: m ? m * 30 : '' }))
                                            }}
                                            className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm"
                                        >
                                            <option value="">Chọn thời hạn</option>
                                            {base.map(o => (
                                                <option key={o.name} value={o.months}>{o.name}</option>
                                            ))}
                                        </select>
                                    )
                                })()}
                                <p className="text-xs text-neutral-500 mt-1">Tự động đặt số ngày = tháng * 30</p>
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
                                    onChange={e => setPkgForm(f => ({ ...f, price: e.target.value === '' ? '' : Number(e.target.value) }))}
                                    className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm"
                                    placeholder="0"
                                    disabled={priceDisabled}
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                            <button
                                disabled={pkgSaving || !pkgForm.packageName || pkgForm.price === ''}
                                onClick={async () => {
                                    setPkgSaving(true); setPkgMsg(null)
                                    // Suy ra categoryId hợp lệ
                                    let realCategoryId: number | undefined =
                                        (typeof pkgForm.categoryId === 'number' ? pkgForm.categoryId : Number(pkgForm.categoryId)) || undefined

                                    // Nếu chưa có trong form, thử lấy từ tierSelectValue
                                    if (!realCategoryId && tierSelectValue) {
                                        const asNum = Number(tierSelectValue)
                                        if (!Number.isNaN(asNum)) realCategoryId = asNum
                                        if (!realCategoryId) {
                                            const picked = (currentTierOptions || []).find(o => String(o.value) === String(tierSelectValue))
                                            const label = picked?.label
                                            if (label) {
                                                const matched = (categories || []).find((c:any) => (c.categoryName || '').toLowerCase() === label.toLowerCase())
                                                if (matched) realCategoryId = matched.categoryId
                                                if (!realCategoryId) {
                                                    // tạo mới nếu vẫn chưa có
                                                    realCategoryId = await ensureTierCategory(label) || undefined
                                                }
                                            }
                                        }
                                    }

                                    if (!realCategoryId) {
                                        setPkgMsg('Bạn phải chọn phân loại (tier) cho gói!');
                                        setPkgSaving(false);
                                        return;
                                    }
                                    try {
                                        await packageService.createPackage({
                                            packageName: pkgForm.packageName,
                                            description: pkgForm.description || undefined,
                                            price: Number(pkgForm.price || 0),
                                            categoryId: realCategoryId,
                                            durationDays: pkgForm.durationDays ? Number(pkgForm.durationDays) : undefined,
                                            durationMonths: pkgForm.durationMonths ? Number(pkgForm.durationMonths) : undefined
                                        })
                                        setPkgMsg('Đã tạo package thành công.')
                                        setPkgForm({ packageName: '', description: '', price: '', categoryId: '', durationDays: '', isActive: true, durationMonths: '' })
                                        // Refresh packages list
                                        const refreshed = await packageService.getAllPackages().catch(() => [])
                                        setPackages(refreshed ?? [])
                                        setTotalPackages(refreshed?.length ?? 0)
                                    } catch (e: any) {
                                        const msg = e?.response?.data?.message || e?.message || 'Tạo package thất bại. Vui lòng thử lại.'
                                        setPkgMsg(msg)
                                    } finally {
                                        setPkgSaving(false)
                                    }
                                }}
                                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {pkgSaving ? 'Đang lưu...' : 'Tạo Package'}
                            </button>
                            {pkgMsg && <span className={`text-sm ${pkgMsg.includes('thành công') ? 'text-emerald-400' : 'text-red-400'}`}>{pkgMsg}</span>}
                        </div>
                    </div>
                )}

                {activeView === 'managePackages' && (
                    <div className="space-y-6">
                        {/* Danh sách Package đã tạo */}
                        <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4">Danh sách Package đã tạo</h2>
                        
                        {packages.length === 0 ? (
                            <div className="text-center py-8 text-neutral-400">
                                Chưa có package nào được tạo
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {packages.map((pkg: Package) => {
                                    const isEditing = editingPackageId === pkg.packageId
                                    const isViewingDetails = viewingDetailsId === pkg.packageId
                                    const category = categories.find((c: any) => c.categoryId === pkg.categoryId)
                                    const categoryName = category?.categoryName || 'Unknown'
                                    
                                    return (
                                        <div
                                            key={pkg.packageId}
                                            className="p-3 bg-[#23233a] border border-[#2a2a44] rounded-lg"
                                        >
                                            {isEditing ? (
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm text-neutral-400 mb-1">Tên gói</label>
                                                                <input
                                                                    type="text"
                                                                    value={editPkgForm.packageName}
                                                                    onChange={(e) => setEditPkgForm((f) => ({ ...f, packageName: e.target.value }))}
                                                                    className="w-full rounded-lg bg-[#1a1a2d] border border-[#2a2a44] px-3 py-2 text-sm"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-neutral-400 mb-1">Phân loại (Tier)</label>
                                                                <select
                                                                    value={editTierSelectValue}
                                                                    onChange={(e) => {
                                                                        setEditTierSelectValue(e.target.value)
                                                                        const asNum = Number(e.target.value)
                                                                        if (!Number.isNaN(asNum)) {
                                                                            setEditPkgForm((f) => ({ ...f, categoryId: asNum }))
                                                                        }
                                                                    }}
                                                                    className="w-full rounded-lg bg-[#1a1a2d] border border-[#2a2a44] px-3 py-2 text-sm"
                                                                >
                                                                    <option value="">Chọn phân loại</option>
                                                                    {currentTierOptions.map(o => (
                                                                        <option key={o.value} value={String(o.value)}>{o.label}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-neutral-400 mb-1">Giá (đ)</label>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    value={editPkgForm.price}
                                                                    onChange={(e) => setEditPkgForm((f) => ({ ...f, price: e.target.value === '' ? '' : Number(e.target.value) }))}
                                                                    className="w-full rounded-lg bg-[#1a1a2d] border border-[#2a2a44] px-3 py-2 text-sm"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-neutral-400 mb-1">Thời hạn (tháng)</label>
                                                                <select
                                                                    value={editPkgForm.durationMonths || ''}
                                                                    onChange={(e) => {
                                                                        const m = Number(e.target.value)
                                                                        setEditPkgForm((f) => ({ ...f, durationMonths: m, durationDays: m ? m * 30 : '' }))
                                                                    }}
                                                                    className="w-full rounded-lg bg-[#1a1a2d] border border-[#2a2a44] px-3 py-2 text-sm"
                                                                >
                                                                    <option value="">Chọn thời hạn</option>
                                                                    <option value="1">1 tháng</option>
                                                                    <option value="3">3 tháng</option>
                                                                    <option value="6">6 tháng</option>
                                                                    <option value="12">12 tháng</option>
                                                                </select>
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-sm text-neutral-400 mb-1">Mô tả</label>
                                                                <textarea
                                                                    value={editPkgForm.description}
                                                                    onChange={(e) => setEditPkgForm((f) => ({ ...f, description: e.target.value }))}
                                                                    rows={3}
                                                                    className="w-full rounded-lg bg-[#1a1a2d] border border-[#2a2a44] px-3 py-2 text-sm"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="flex items-center gap-2 text-sm text-neutral-400">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={editPkgForm.isActive}
                                                                        onChange={(e) => setEditPkgForm((f) => ({ ...f, isActive: e.target.checked }))}
                                                                        className="rounded"
                                                                    />
                                                                    Hoạt động
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        setPackageEditing(pkg.packageId)
                                                                        await packageService.updatePackage(pkg.packageId, {
                                                                            packageName: editPkgForm.packageName,
                                                                            description: editPkgForm.description || undefined,
                                                                            price: Number(editPkgForm.price || 0),
                                                                            categoryId: Number(editPkgForm.categoryId) || undefined,
                                                                            isActive: editPkgForm.isActive,
                                                                            durationDays: editPkgForm.durationDays ? Number(editPkgForm.durationDays) : undefined,
                                                                            durationMonths: editPkgForm.durationMonths ? Number(editPkgForm.durationMonths) : undefined
                                                                        })
                                                                        setEditingPackageId(null)
                                                                        setEditPkgForm({ packageName: '', description: '', price: '', categoryId: '', durationDays: '', durationMonths: '', isActive: true })
                                                                        // Refresh packages
                                                                        const refreshed = await packageService.getAllPackages().catch(() => [])
                                                                        setPackages(refreshed ?? [])
                                                                        setTotalPackages(refreshed?.length ?? 0)
                                                                    } catch (e: any) {
                                                                        const msg = e?.response?.data?.message || e?.message || 'Cập nhật thất bại.'
                                                                        showToast(msg, 'error')
                                                                    } finally {
                                                                        setPackageEditing(null)
                                                                    }
                                                                }}
                                                                disabled={packageEditing === pkg.packageId || !editPkgForm.packageName || editPkgForm.price === ''}
                                                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm"
                                                            >
                                                                {packageEditing === pkg.packageId ? 'Đang lưu...' : 'Lưu'}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingPackageId(null)
                                                                    setEditPkgForm({ packageName: '', description: '', price: '', categoryId: '', durationDays: '', durationMonths: '', isActive: true })
                                                                }}
                                                                className="px-3 py-1.5 rounded-lg bg-[#2a2a44] hover:bg-[#3a3a54] text-sm"
                                                            >
                                                                Hủy
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3 flex-1">
                                                                <span className="text-sm text-neutral-400">#{pkg.packageId}</span>
                                                                <h3 className="text-sm font-semibold text-white">{pkg.packageName}</h3>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                                    categoryName.toLowerCase().includes('free') ? 'bg-green-500/20 text-green-400' :
                                                                    categoryName.toLowerCase().includes('pro') || categoryName.toLowerCase().includes('premium') ? 'bg-blue-500/20 text-blue-400' :
                                                                    'bg-gray-500/20 text-gray-400'
                                                                }`}>
                                                                    {categoryName}
                                                                </span>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                                    pkg.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                                }`}>
                                                                    {pkg.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setViewingDetailsId(isViewingDetails ? null : pkg.packageId)
                                                                    }}
                                                                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm"
                                                                >
                                                                    {isViewingDetails ? 'Ẩn' : 'Xem'}
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingPackageId(pkg.packageId)
                                                                        setEditPkgForm({
                                                                            packageName: pkg.packageName || '',
                                                                            description: pkg.description || '',
                                                                            price: pkg.price || '',
                                                                            categoryId: pkg.categoryId || '',
                                                                            durationDays: (pkg as any).durationDays || '',
                                                                            durationMonths: (pkg as any).durationMonths || '',
                                                                            isActive: pkg.isActive ?? true
                                                                        })
                                                                        setEditTierSelectValue(pkg.categoryId ? String(pkg.categoryId) : '')
                                                                    }}
                                                                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm"
                                                                >
                                                                    Sửa
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            setPackageDeleting(pkg.packageId)
                                                                            await packageService.deletePackage(pkg.packageId)
                                                                            // Refresh packages
                                                                            const refreshed = await packageService.getAllPackages().catch(() => [])
                                                                            setPackages(refreshed ?? [])
                                                                            setTotalPackages(refreshed?.length ?? 0)
                                                                            showToast(`Đã xóa package "${pkg.packageName}" thành công`, 'success')
                                                                        } catch (e: any) {
                                                                            const msg = e?.response?.data?.message || e?.message || 'Xóa package thất bại'
                                                                            showToast(msg, 'error')
                                                                        } finally {
                                                                            setPackageDeleting(null)
                                                                        }
                                                                    }}
                                                                    disabled={packageDeleting === pkg.packageId}
                                                                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-sm"
                                                                >
                                                                    {packageDeleting === pkg.packageId ? 'Đang xóa...' : 'Xóa'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        {isViewingDetails && (
                                                            <div className="mt-3 pt-3 border-t border-[#2a2a44]">
                                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                                    <div>
                                                                        <span className="text-neutral-400">ID:</span>
                                                                        <span className="text-white ml-2">{pkg.packageId}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-neutral-400">Tên:</span>
                                                                        <span className="text-white ml-2">{pkg.packageName}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-neutral-400">Phân loại:</span>
                                                                        <span className="text-white ml-2">{categoryName}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-neutral-400">Giá:</span>
                                                                        <span className="text-white ml-2">{pkg.price?.toLocaleString('vi-VN') || 0}đ</span>
                                                                    </div>
                                                                    {(pkg as any).durationDays && (
                                                                        <div>
                                                                            <span className="text-neutral-400">Thời hạn (ngày):</span>
                                                                            <span className="text-white ml-2">{(pkg as any).durationDays} ngày</span>
                                                                        </div>
                                                                    )}
                                                                    {(pkg as any).durationMonths && (
                                                                        <div>
                                                                            <span className="text-neutral-400">Thời hạn (tháng):</span>
                                                                            <span className="text-white ml-2">{(pkg as any).durationMonths} tháng</span>
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <span className="text-neutral-400">Trạng thái:</span>
                                                                        <span className={`ml-2 ${pkg.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                                                            {pkg.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                                                        </span>
                                                                    </div>
                                                                    {pkg.description && (
                                                                        <div className="col-span-2">
                                                                            <span className="text-neutral-400">Mô tả:</span>
                                                                            <div className="text-white mt-1 p-2 bg-[#1a1a2d] rounded border border-[#2a2a44] break-words">
                                                                                {pkg.description}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )
                                    })}
                            </div>
                        )}
                        </div>

                        {/* Quản lý Package mà người dùng đã mua */}
                        <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Quản lý Package mà người dùng đã mua</h2>
                                <button
                                    onClick={async () => {
                                        try {
                                            setLoading(true)
                                            const [ordersRes, usersRes, packagesRes] = await Promise.all([
                                                orderService.getAllOrders().catch(() => []),
                                                userService.getAllUsers().catch(() => []),
                                                packageService.getAllPackages().catch(() => []),
                                            ])
                                            setOrders(ordersRes ?? [])
                                            setUsers(usersRes ?? [])
                                            setPackages(packagesRes ?? [])
                                            showToast('Đã làm mới dữ liệu', 'success')
                                        } catch (e) {
                                            showToast('Không thể làm mới dữ liệu', 'error')
                                        } finally {
                                            setLoading(false)
                                        }
                                    }}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm"
                                >
                                    🔄 Làm mới
                                </button>
                            </div>
                            
                            {(() => {
                                // Debug: Log orders để kiểm tra
                                console.log('[Admin] All orders:', orders)
                                console.log('[Admin] All users:', users)
                                console.log('[Admin] All packages:', packages)
                                
                                // Group orders by userId
                                const userPurchases = new Map<number, { user: any; orders: Order[] }>()
                                
                                orders.forEach((order: Order) => {
                                    // Debug từng order
                                    console.log('[Admin] Processing order:', {
                                        orderId: order.orderId,
                                        userId: order.userId,
                                        status: order.status,
                                        items: order.items,
                                        totalAmount: order.totalAmount
                                    })
                                    
                                    if (!userPurchases.has(order.userId)) {
                                        const user = users.find((u: any) => u.userId === order.userId || u.id === order.userId)
                                        userPurchases.set(order.userId, { user, orders: [] })
                                    }
                                    userPurchases.get(order.userId)!.orders.push(order)
                                })
                                
                                const userPurchaseList = Array.from(userPurchases.entries())
                                    .map(([userId, data]) => {
                                        const { user, orders: userOrders } = data
                                        // Chỉ hiển thị orders đã hoàn thành (Completed/Paid) để đồng bộ với user view
                                        const displayOrders = userOrders.filter((o: Order) => 
                                            o.status === 'Completed' || o.status === 'Paid'
                                        )
                                        
                                        if (displayOrders.length === 0) return null
                                        
                                        return (
                                            <div
                                                key={userId}
                                                className="p-4 bg-[#23233a] border border-[#2a2a44] rounded-lg"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <div className="font-semibold text-white text-lg mb-1">
                                                            {user?.fullName || user?.name || user?.email || `User #${userId}`}
                                                        </div>
                                                        <div className="text-sm text-neutral-400">
                                                            User ID: {userId}
                                                            {user?.email && ` • ${user.email}`}
                                                            {user?.phone && ` • ${user.phone}`}
                                                        </div>
                                                    </div>
                                                    <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                                                        {displayOrders.length} đơn hàng
                                                    </span>
                                                </div>
                                                
                                                <div className="space-y-2 mt-3 pt-3 border-t border-[#2a2a44]">
                                                    {displayOrders.map((order: Order) => {
                                                        // Lấy package từ order items hoặc từ order.packageId (fallback)
                                                        const orderItems = order.items || []
                                                        let packageIds = orderItems.map((item: any) => item.packageId || item.packageID).filter(Boolean)
                                                        
                                                        // Fallback: nếu không có items, thử lấy từ order.packageId trực tiếp
                                                        if (packageIds.length === 0 && (order as any).packageId) {
                                                            packageIds = [(order as any).packageId]
                                                        }
                                                        
                                                        // Debug log nếu không tìm thấy packageIds
                                                        if (packageIds.length === 0) {
                                                            console.warn('[Admin] Order has no packageIds:', {
                                                                orderId: order.orderId,
                                                                order: order,
                                                                items: order.items
                                                            })
                                                        }
                                                        
                                                        return (
                                                            <div
                                                                key={order.orderId}
                                                                className="p-3 bg-[#1a1a2d] rounded border border-[#2a2a44]"
                                                            >
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-neutral-400">Đơn #{order.orderId}</span>
                                                                        <span className="text-xs text-neutral-400">
                                                                            {order.orderNumber || `ORD-${order.orderId}`}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-sm text-neutral-300">
                                                                            {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                                                                        </span>
                                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                                            order.status === 'Completed' || order.status === 'Paid' 
                                                                                ? 'bg-green-500/20 text-green-400' 
                                                                                : 'bg-yellow-500/20 text-yellow-400'
                                                                        }`}>
                                                                            {order.status === 'Completed' ? 'Hoàn thành' : 
                                                                             order.status === 'Paid' ? 'Đã thanh toán' : 
                                                                             order.status}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="space-y-2">
                                                                    {packageIds.length > 0 ? (
                                                                        packageIds.map((packageId: number) => {
                                                                            const pkg = packages.find((p: Package) => p.packageId === packageId)
                                                                            if (!pkg) {
                                                                                // Debug: Log warning
                                                                                console.warn('[Admin] Package not found for packageId:', packageId, 'in order:', order.orderId)
                                                                                // Nếu không tìm thấy package, vẫn hiển thị thông tin order item
                                                                                const orderItem = orderItems.find((item: any) => (item.packageId === packageId || item.packageID === packageId))
                                                                                return (
                                                                                    <div key={packageId} className="p-3 bg-[#15152a] rounded border border-[#2a2a44]">
                                                                                        <div className="text-sm text-neutral-300">
                                                                                            Package ID: {packageId}
                                                                                        </div>
                                                                                        {orderItem && (
                                                                                            <div className="text-xs text-neutral-400 mt-1">
                                                                                                Giá: {orderItem.unitPrice ? (orderItem.unitPrice * (orderItem.quantity || 1)).toLocaleString('vi-VN') : '0'} ₫
                                                                                                {orderItem.quantity && ` • Số lượng: ${orderItem.quantity}`}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )
                                                                            }
                                                                            
                                                                            const orderItem = orderItems.find((item: any) => (item.packageId === packageId || item.packageID === packageId))
                                                                            const category = categories.find((c: any) => c.categoryId === pkg.categoryId)
                                                                            
                                                                            return (
                                                                                <div
                                                                                    key={packageId}
                                                                                    className="p-3 bg-[#15152a] rounded border border-[#2a2a44]"
                                                                                >
                                                                                    <div className="flex items-start justify-between mb-2">
                                                                                        <div className="flex-1">
                                                                                            {/* Tên gói */}
                                                                                            <div className="font-semibold text-white text-base mb-1">
                                                                                                {pkg.packageName}
                                                                                            </div>
                                                                                            
                                                                                            {/* Phân loại */}
                                                                                            <div className="mb-2">
                                                                                                {category?.categoryName ? (
                                                                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                                                                                        category.categoryName.toLowerCase().includes('free') || category.categoryName.toLowerCase().includes('miễn phí') 
                                                                                                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                                                                                            : category.categoryName.toLowerCase().includes('pro') || category.categoryName.toLowerCase().includes('premium')
                                                                                                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                                                                            : category.categoryName.toLowerCase().includes('max') || category.categoryName.toLowerCase().includes('master')
                                                                                                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                                                                                            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                                                                                    }`}>
                                                                                                        Phân loại: {category.categoryName}
                                                                                                    </span>
                                                                                                ) : (
                                                                                                    <span className="text-xs text-neutral-400">Phân loại: Chưa có</span>
                                                                                                )}
                                                                                            </div>
                                                                                            
                                                                                            {/* Chi tiết */}
                                                                                            <div className="space-y-1 text-sm text-neutral-300">
                                                                                                {/* Giá tiền */}
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                                    </svg>
                                                                                                    <span>
                                                                                                        <strong>Giá tiền:</strong> {orderItem?.unitPrice ? 
                                                                                                            (orderItem.unitPrice * (orderItem.quantity || 1)).toLocaleString('vi-VN') : 
                                                                                                            pkg.price?.toLocaleString('vi-VN') || '0'} ₫
                                                                                                        {orderItem?.quantity && orderItem.quantity > 1 && ` (${orderItem.unitPrice?.toLocaleString('vi-VN') || '0'} ₫ × ${orderItem.quantity})`}
                                                                                                    </span>
                                                                                                </div>
                                                                                                
                                                                                                {/* Thời gian */}
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                                    </svg>
                                                                                                    <span>
                                                                                                        <strong>Thời hạn:</strong> {
                                                                                                            pkg.durationMonths ? `${pkg.durationMonths} tháng` : 
                                                                                                            pkg.durationDays ? `${pkg.durationDays} ngày` : 
                                                                                                            'Chưa có thông tin'
                                                                                                        }
                                                                                                    </span>
                                                                                                </div>
                                                                                                
                                                                                                {/* Số lượng nếu > 1 */}
                                                                                                {orderItem?.quantity && orderItem.quantity > 1 && (
                                                                                                    <div className="flex items-center gap-2">
                                                                                                        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                                                                        </svg>
                                                                                                        <span><strong>Số lượng:</strong> {orderItem.quantity}</span>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })
                                                                    ) : (
                                                                        <div className="p-3 bg-[#15152a] rounded border border-[#2a2a44]">
                                                                            <div className="text-sm text-neutral-300 mb-2">
                                                                                Order không có thông tin package chi tiết trong items
                                                                            </div>
                                                                            <div className="text-xs text-neutral-400 mb-3">
                                                                                Tổng tiền: {order.totalAmount?.toLocaleString('vi-VN') || '0'} ₫
                                                                            </div>
                                                                            <button
                                                                                onClick={async () => {
                                                                                    try {
                                                                                        setLoadingOrderDetails(true)
                                                                                        setViewingOrderId(order.orderId)
                                                                                        // Thử lấy chi tiết order từ API bằng getOrderByIdAdmin (admin endpoint)
                                                                                        let details: Order | null = null
                                                                                        try {
                                                                                            details = await orderService.getOrderByIdAdmin(order.orderId)
                                                                                        } catch (adminErr) {
                                                                                            // Fallback: thử getOrderById thông thường
                                                                                            try {
                                                                                                details = await orderService.getOrderById(order.orderId)
                                                                                            } catch (normalErr) {
                                                                                                console.error('Both admin and normal getOrderById failed:', { adminErr, normalErr })
                                                                                                // Nếu cả 2 đều fail, dùng order hiện tại và thử extract từ các trường khác
                                                                                                details = order
                                                                                            }
                                                                                        }
                                                                                        
                                                                                        if (details) {
                                                                                            setOrderDetails(details)
                                                                                            console.log('[Admin] Loaded order details:', details)
                                                                                        } else {
                                                                                            showToast('Không thể tải chi tiết đơn hàng', 'error')
                                                                                        }
                                                                                    } catch (e: any) {
                                                                                        console.error('Failed to load order details:', e)
                                                                                        showToast(e?.response?.data?.message || 'Không thể tải chi tiết đơn hàng', 'error')
                                                                                        setViewingOrderId(null)
                                                                                    } finally {
                                                                                        setLoadingOrderDetails(false)
                                                                                    }
                                                                                }}
                                                                                disabled={loadingOrderDetails && viewingOrderId === order.orderId}
                                                                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm text-white"
                                                                            >
                                                                                {loadingOrderDetails && viewingOrderId === order.orderId ? 'Đang tải...' : 'Xem chi tiết'}
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Modal hiển thị chi tiết order */}
                                                                    {viewingOrderId === order.orderId && orderDetails && (
                                                                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => {
                                                                            setViewingOrderId(null)
                                                                            setOrderDetails(null)
                                                                        }}>
                                                                            <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                                                                <div className="flex items-center justify-between mb-4">
                                                                                    <h3 className="text-xl font-semibold text-white">Chi tiết Đơn hàng #{order.orderId}</h3>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setViewingOrderId(null)
                                                                                            setOrderDetails(null)
                                                                                        }}
                                                                                        className="text-neutral-400 hover:text-white"
                                                                                    >
                                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                                        </svg>
                                                                                    </button>
                                                                                </div>
                                                                                
                                                                                <div className="space-y-4">
                                                                                    <div className="grid grid-cols-2 gap-4">
                                                                                        <div>
                                                                                            <div className="text-sm text-neutral-400">Order ID</div>
                                                                                            <div className="text-white font-medium">{orderDetails.orderId}</div>
                                                                                        </div>
                                                                                        <div>
                                                                                            <div className="text-sm text-neutral-400">Order Number</div>
                                                                                            <div className="text-white font-medium">{orderDetails.orderNumber || `ORD-${orderDetails.orderId}`}</div>
                                                                                        </div>
                                                                                        <div>
                                                                                            <div className="text-sm text-neutral-400">Ngày đặt</div>
                                                                                            <div className="text-white font-medium">{new Date(orderDetails.orderDate).toLocaleString('vi-VN')}</div>
                                                                                        </div>
                                                                                        <div>
                                                                                            <div className="text-sm text-neutral-400">Trạng thái</div>
                                                                                            <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                                                                                orderDetails.status === 'Completed' || orderDetails.status === 'Paid' 
                                                                                                    ? 'bg-green-500/20 text-green-400' 
                                                                                                    : 'bg-yellow-500/20 text-yellow-400'
                                                                                            }`}>
                                                                                                {orderDetails.status === 'Completed' ? 'Hoàn thành' : 
                                                                                                 orderDetails.status === 'Paid' ? 'Đã thanh toán' : 
                                                                                                 orderDetails.status}
                                                                                            </div>
                                                                                        </div>
                                                                                        <div>
                                                                                            <div className="text-sm text-neutral-400">Tổng tiền</div>
                                                                                            <div className="text-white font-semibold text-lg">{orderDetails.totalAmount?.toLocaleString('vi-VN') || '0'} ₫</div>
                                                                                        </div>
                                                                                        {orderDetails.notes && (
                                                                                            <div className="col-span-2">
                                                                                                <div className="text-sm text-neutral-400">Ghi chú</div>
                                                                                                <div className="text-white">{orderDetails.notes}</div>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    
                                                                                    {/* Chi tiết items */}
                                                                                    {(() => {
                                                                                        const orderItems = orderDetails.items || []
                                                                                        
                                                                                        // Nếu không có items, thử lấy từ orderDetails.packageId trực tiếp
                                                                                        if (orderItems.length === 0 && (orderDetails as any).packageId) {
                                                                                            const directPackageId = (orderDetails as any).packageId
                                                                                            const pkg = packages.find((p: Package) => p.packageId === directPackageId)
                                                                                            const category = pkg ? categories.find((c: any) => c.categoryId === pkg.categoryId) : null
                                                                                            
                                                                                            if (pkg) {
                                                                                                return (
                                                                                                    <div>
                                                                                                        <div className="text-sm font-semibold text-neutral-300 mb-2">Chi tiết sản phẩm:</div>
                                                                                                        <div className="p-3 bg-[#1a1a2d] rounded border border-[#2a2a44]">
                                                                                                            <div className="font-semibold text-white mb-2">{pkg.packageName}</div>
                                                                                                            <div className="space-y-1 text-sm text-neutral-300">
                                                                                                                {category && (
                                                                                                                    <div>Phân loại: <span className="text-blue-400">{category.categoryName}</span></div>
                                                                                                                )}
                                                                                                                <div>Giá tiền: {pkg.price?.toLocaleString('vi-VN') || '0'} ₫</div>
                                                                                                                <div>Số lượng: 1</div>
                                                                                                                <div>Thành tiền: {orderDetails.totalAmount?.toLocaleString('vi-VN') || '0'} ₫</div>
                                                                                                                {pkg.durationMonths && (
                                                                                                                    <div>Thời hạn: {pkg.durationMonths} tháng</div>
                                                                                                                )}
                                                                                                                {pkg.durationDays && !pkg.durationMonths && (
                                                                                                                    <div>Thời hạn: {pkg.durationDays} ngày</div>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )
                                                                                            }
                                                                                        }
                                                                                        
                                                                                        if (orderItems.length > 0) {
                                                                                            return (
                                                                                                <div>
                                                                                                    <div className="text-sm font-semibold text-neutral-300 mb-2">Chi tiết sản phẩm:</div>
                                                                                                    <div className="space-y-2">
                                                                                                        {orderItems.map((item: any) => {
                                                                                                            const pkg = packages.find((p: Package) => p.packageId === (item.packageId || item.packageID))
                                                                                                            const category = pkg ? categories.find((c: any) => c.categoryId === pkg.categoryId) : null
                                                                                                            
                                                                                                            return (
                                                                                                                <div key={item.orderItemId || item.id} className="p-3 bg-[#1a1a2d] rounded border border-[#2a2a44]">
                                                                                                                    {pkg ? (
                                                                                                                        <>
                                                                                                                            <div className="font-semibold text-white mb-2">{pkg.packageName}</div>
                                                                                                                            <div className="space-y-1 text-sm text-neutral-300">
                                                                                                                                {category && (
                                                                                                                                    <div>Phân loại: <span className="text-blue-400">{category.categoryName}</span></div>
                                                                                                                                )}
                                                                                                                                <div>Giá tiền: {item.unitPrice ? item.unitPrice.toLocaleString('vi-VN') : pkg.price?.toLocaleString('vi-VN') || '0'} ₫</div>
                                                                                                                                <div>Số lượng: {item.quantity || 1}</div>
                                                                                                                                <div>Thành tiền: {(item.unitPrice ? item.unitPrice * (item.quantity || 1) : pkg.price || 0).toLocaleString('vi-VN')} ₫</div>
                                                                                                                                {pkg.durationMonths && (
                                                                                                                                    <div>Thời hạn: {pkg.durationMonths} tháng</div>
                                                                                                                                )}
                                                                                                                                {pkg.durationDays && !pkg.durationMonths && (
                                                                                                                                    <div>Thời hạn: {pkg.durationDays} ngày</div>
                                                                                                                                )}
                                                                                                                            </div>
                                                                                                                        </>
                                                                                                                    ) : (
                                                                                                                        <div className="text-sm text-neutral-300">
                                                                                                                            <div>Package ID: {item.packageId || item.packageID || 'N/A'}</div>
                                                                                                                            <div>Giá: {item.unitPrice?.toLocaleString('vi-VN') || '0'} ₫</div>
                                                                                                                            <div>Số lượng: {item.quantity || 1}</div>
                                                                                                                        </div>
                                                                                                                    )}
                                                                                                                </div>
                                                                                                            )
                                                                                                        })}
                                                                                                    </div>
                                                                                                </div>
                                                                                            )
                                                                                        }
                                                                                        
                                                                                        // Nếu không có items và không có packageId trực tiếp
                                                                                        return (
                                                                                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                                                                                                <div className="text-sm text-yellow-400 mb-1">
                                                                                                    ⚠️ Order không có thông tin items trong database
                                                                                                </div>
                                                                                                <div className="text-xs text-neutral-400">
                                                                                                    Có thể order đã được tạo nhưng items chưa được lưu. Tổng tiền: {orderDetails.totalAmount?.toLocaleString('vi-VN') || '0'} ₫
                                                                                                </div>
                                                                                            </div>
                                                                                        )
                                                                                    })()}
                                                                                    
                                                                                    {/* Raw data để debug */}
                                                                                    <details className="mt-4">
                                                                                        <summary className="cursor-pointer text-sm text-neutral-400 hover:text-neutral-300">
                                                                                            Raw Order Data (Debug)
                                                                                        </summary>
                                                                                        <pre className="mt-2 p-3 bg-[#0a0a0f] rounded text-xs text-neutral-400 overflow-auto max-h-40">
                                                                                            {JSON.stringify(orderDetails, null, 2)}
                                                                                        </pre>
                                                                                    </details>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })
                                    .filter(Boolean)
                                
                                if (userPurchaseList.length === 0) {
                                    return (
                                        <div className="text-center py-8 text-neutral-400">
                                            Chưa có đơn hàng nào được hoàn thành
                                        </div>
                                    )
                                }
                                
                                return (
                                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                        {userPurchaseList}
                                    </div>
                                )
                            })()}
                        </div>
                    </div>
                )}

                {activeView === 'createCategory' && (
                    <div className="space-y-6">
                        {/* Form tạo phân loại */}
                        <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4">Tạo Phân Loại (Category)</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Tên Phân Loại *</label>
                                    <input
                                        value={categoryForm.categoryName}
                                        onChange={(e) => setCategoryForm((f) => ({ ...f, categoryName: e.target.value }))}
                                        placeholder="VD: Premium, Pro, Free, ..."
                                        className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm"
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">Tên phân loại sẽ được dùng để phân nhóm các package</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                                <button
                                    disabled={categorySaving || !categoryForm.categoryName.trim()}
                                    onClick={async () => {
                                        setCategorySaving(true)
                                        setCategoryMsg(null)
                                        try {
                                            const newCategory = await packageCategoryService.createCategory({
                                                categoryName: categoryForm.categoryName.trim(),
                                            })
                                            setCategoryMsg('Đã tạo phân loại thành công.')
                                            setCategoryForm({ categoryName: '' })
                                            
                                            // Thêm category mới vào danh sách userCreatedCategories
                                            if (newCategory?.categoryId) {
                                                const newIds = [...userCreatedCategories, newCategory.categoryId]
                                                setUserCreatedCategories(newIds)
                                                // Lưu vào localStorage để persist
                                                localStorage.setItem('userCreatedCategories', JSON.stringify(newIds))
                                            }
                                            
                                            // Refresh categories list để cập nhật dropdown
                                            const refreshed = await packageCategoryService.getActiveCategories().catch(() => [])
                                            const updatedCategories = refreshed ?? []
                                            setCategories(updatedCategories)
                                        } catch (e: any) {
                                            const msg = e?.response?.data?.message || e?.message || 'Tạo phân loại thất bại. Vui lòng thử lại.'
                                            setCategoryMsg(msg)
                                        } finally {
                                            setCategorySaving(false)
                                        }
                                    }}
                                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {categorySaving ? 'Đang lưu...' : 'Tạo Phân Loại'}
                                </button>
                                {categoryMsg && (
                                    <span className={`text-sm ${categoryMsg.includes('thành công') ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {categoryMsg}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Danh sách phân loại đã tạo */}
                        <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4">Danh sách Phân Loại đã tạo</h2>
                            
                            {(() => {
                                // Lấy các categories được tạo thủ công
                                const userCategories = (categories || []).filter((c: any) => 
                                    userCreatedCategories.includes(c.categoryId)
                                )
                                
                                if (userCategories.length === 0) {
                                    return (
                                        <div className="text-center py-8 text-neutral-400">
                                            Chưa có phân loại nào được tạo
                                        </div>
                                    )
                                }
                                
                                return (
                                    <div className="space-y-3">
                                        {userCategories.map((cat: any) => {
                                            const isEditing = editingCategoryId === cat.categoryId
                                            return (
                                                <div 
                                                    key={cat.categoryId} 
                                                    className="flex items-center justify-between p-4 bg-[#23233a] border border-[#2a2a44] rounded-lg"
                                                >
                                                    {isEditing ? (
                                                        <>
                                                            <input
                                                                type="text"
                                                                value={editCategoryName}
                                                                onChange={(e) => setEditCategoryName(e.target.value)}
                                                                className="flex-1 rounded-lg bg-[#1a1a2d] border border-[#2a2a44] px-3 py-2 text-sm mr-3"
                                                                placeholder="Tên phân loại"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        await packageCategoryService.updateCategory(cat.categoryId, {
                                                                            categoryName: editCategoryName.trim(),
                                                                        })
                                                                        setEditingCategoryId(null)
                                                                        setEditCategoryName('')
                                                                        setCategoryMsg('Đã cập nhật phân loại thành công.')
                                                                        // Refresh categories
                                                                        const refreshed = await packageCategoryService.getActiveCategories().catch(() => [])
                                                                        setCategories(refreshed ?? [])
                                                                    } catch (e: any) {
                                                                        const msg = e?.response?.data?.message || e?.message || 'Cập nhật thất bại.'
                                                                        setCategoryMsg(msg)
                                                                    }
                                                                }}
                                                                disabled={!editCategoryName.trim()}
                                                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm mr-2"
                                                            >
                                                                Lưu
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingCategoryId(null)
                                                                    setEditCategoryName('')
                                                                }}
                                                                className="px-3 py-1.5 rounded-lg bg-[#2a2a44] hover:bg-[#3a3a54] text-sm"
                                                            >
                                                                Hủy
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex-1">
                                                                <div className="font-medium text-white">{cat.categoryName}</div>
                                                                <div className="text-xs text-neutral-400 mt-1">
                                                                    ID: {cat.categoryId} 
                                                                    {cat.description && ` • ${cat.description}`}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingCategoryId(cat.categoryId)
                                                                        setEditCategoryName(cat.categoryName)
                                                                        setCategoryMsg(null)
                                                                    }}
                                                                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm"
                                                                >
                                                                    Sửa
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            setCategoryDeleting(cat.categoryId)
                                                                            await packageCategoryService.deleteCategory(cat.categoryId)
                                                                            // Xóa khỏi userCreatedCategories
                                                                            const newIds = userCreatedCategories.filter(id => id !== cat.categoryId)
                                                                            setUserCreatedCategories(newIds)
                                                                            localStorage.setItem('userCreatedCategories', JSON.stringify(newIds))
                                                                            // Refresh categories
                                                                            const refreshed = await packageCategoryService.getActiveCategories().catch(() => [])
                                                                            setCategories(refreshed ?? [])
                                                                            showToast(`Đã xóa phân loại "${cat.categoryName}" thành công`, 'success')
                                                                        } catch (e: any) {
                                                                            const msg = e?.response?.data?.message || e?.message || 'Xóa phân loại thất bại'
                                                                            showToast(msg, 'error')
                                                                        } finally {
                                                                            setCategoryDeleting(null)
                                                                        }
                                                                    }}
                                                                    disabled={categoryDeleting === cat.categoryId}
                                                                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-sm"
                                                                >
                                                                    {categoryDeleting === cat.categoryId ? 'Đang xóa...' : 'Xóa'}
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })()}
                        </div>
                    </div>
                )}

                {activeView === 'manageReviews' && (
                    <div className="space-y-6">
                        <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Quản lý Reviews và Ratings</h2>
                                <button
                                    onClick={async () => {
                                        try {
                                            setLoadingReviews(true)
                                            const reviewsRes = await reviewService.getAllReviews().catch(() => [])
                                            setReviews(Array.isArray(reviewsRes) ? reviewsRes : [])
                                            showToast('Đã làm mới danh sách reviews', 'success')
                                        } catch (e) {
                                            showToast('Không thể làm mới danh sách reviews', 'error')
                                        } finally {
                                            setLoadingReviews(false)
                                        }
                                    }}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm"
                                >
                                    🔄 Làm mới
                                </button>
                            </div>

                            {loadingReviews ? (
                                <div className="text-center py-8 text-neutral-400">Đang tải reviews...</div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-8 text-neutral-400">Chưa có review nào</div>
                            ) : (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                    {reviews.map((review) => {
                                        const user = users.find((u: any) => u.userId === review.userId || u.id === review.userId)
                                        const storageTemplate = templates.find((t: any) => t.storageId === review.storageId)
                                        
                                        return (
                                            <div
                                                key={review.reviewId}
                                                className="p-4 bg-[#23233a] border border-[#2a2a44] rounded-lg"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        {/* User Info */}
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                                                <span className="text-sm text-white font-bold">
                                                                    {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-white text-sm">
                                                                    {user?.fullName || user?.email || `User #${review.userId}`}
                                                                </div>
                                                                <div className="text-xs text-neutral-400">
                                                                    {user?.email && user?.email !== user?.fullName && user.email}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Rating */}
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${
                                                                        i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                                                                    }`}
                                                                />
                                                            ))}
                                                            <span className="text-sm text-neutral-300">{review.rating}/5</span>
                                                        </div>

                                                        {/* Comment */}
                                                        <p className="text-sm text-neutral-300 mb-2 leading-relaxed">
                                                            {review.comment}
                                                        </p>

                                                        {/* Storage Template Info */}
                                                        {storageTemplate ? (
                                                            <div className="text-xs text-neutral-400 mb-2 p-2 bg-[#1a1a2d] rounded border border-[#2a2a44]">
                                                                <div className="font-semibold text-blue-400 mb-1">Template Prompt:</div>
                                                                <div className="text-neutral-300">
                                                                    <span className="font-medium">{storageTemplate.templateName || 'Chưa có tên'}</span>
                                                                </div>
                                                                <div className="mt-1 space-x-2">
                                                                    {storageTemplate.grade && (
                                                                        <span className="text-neutral-400">Lớp {storageTemplate.grade}</span>
                                                                    )}
                                                                    {storageTemplate.subject && (
                                                                        <span className="text-neutral-400">• {storageTemplate.subject}</span>
                                                                    )}
                                                                    {storageTemplate.chapter && (
                                                                        <span className="text-neutral-400">• {storageTemplate.chapter}</span>
                                                                    )}
                                                                </div>
                                                                {storageTemplate.storageId && (
                                                                    <div className="text-xs text-neutral-500 mt-1">Storage ID: {storageTemplate.storageId}</div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-yellow-400 mb-2 p-2 bg-[#1a1a2d] rounded border border-yellow-500/30">
                                                                ⚠️ Không tìm thấy thông tin template (StorageId: {review.storageId})
                                                            </div>
                                                        )}

                                                        {/* Timestamp */}
                                                        <div className="text-xs text-neutral-500">
                                                            {new Date(review.createdAt).toLocaleString('vi-VN')}
                                                            {review.updatedAt && review.updatedAt !== review.createdAt && (
                                                                <span className="ml-2">(đã chỉnh sửa: {new Date(review.updatedAt).toLocaleString('vi-VN')})</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                setReviewDeleting(review.reviewId)
                                                                await reviewService.deleteReview(review.reviewId)
                                                                setReviews(prev => prev.filter(r => r.reviewId !== review.reviewId))
                                                                const userName = user?.fullName || user?.email || `User #${review.userId}`
                                                                showToast(`Đã xóa review từ ${userName} thành công`, 'success')
                                                            } catch (e: any) {
                                                                const msg = e?.response?.data?.message || e?.message || 'Xóa review thất bại.'
                                                                showToast(msg, 'error')
                                                            } finally {
                                                                setReviewDeleting(null)
                                                            }
                                                        }}
                                                        disabled={reviewDeleting === review.reviewId}
                                                        className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded disabled:opacity-50"
                                                        title="Xóa review"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export { DashboardAdmin as default };


