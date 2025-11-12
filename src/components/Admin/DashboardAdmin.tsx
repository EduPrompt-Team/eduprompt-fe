import React, { useEffect, useMemo, useState } from 'react';
import { userService, packageService, aiHistoryService, storageTemplateService } from '@/services';
import { packageCategoryService } from '@/services/packageCategoryService';
import { orderService } from '@/services/orderService';
import { reviewService } from '@/services/reviewService';
import { walletService } from '@/services/walletService';
import { transactionService } from '@/services/transactionService';
import { paymentService } from '@/services/paymentService';
import { postService } from '@/services/postService';
import { promptInstanceService } from '@/services/promptInstanceService';
import { templateArchitectureService } from '@/services/templateArchitectureService';
import { roleService } from '@/services/roleService';
import { paymentMethodService } from '@/services/paymentMethodService';
import { apiKeyService } from '@/services/apiKeyService';
import type { Package } from '@/services/packageService';
import type { Order } from '@/services/orderService';
import type { Review } from '@/services/reviewService';
import type { Wallet } from '@/services/walletService';
import type { Transaction } from '@/services/transactionService';
import type { User } from '@/services/userService';
import type { Post } from '@/services/postService';
import type { AIHistory } from '@/services/AIHistoryService';
import { useToast } from '@/components/ui/toast';
import { 
    Trash2, Star, Wallet as WalletIcon, Plus, Minus, Eye, EyeOff, 
    LayoutDashboard, Users, Package as PackageIcon, FileText, ShoppingCart, CreditCard, 
    TrendingUp, MessageSquare, Settings, Key, Shield, Archive, Sparkles,
    BarChart3, Search, Filter, Download, Edit, MoreVertical
} from 'lucide-react';

type ViewKey = 
    // Dashboard
    | 'dashboard' 
    // Users
    | 'users' | 'createUser'
    // Content
    | 'packages' | 'createPackage' | 'packageCategories' | 'createCategory'
    | 'templates' | 'promptInstances' | 'templateArchitectures' | 'createTemplateArchitecture'
    | 'posts' | 'createPost'
    // Orders & Payments
    | 'orders' | 'transactions' | 'payments' | 'wallets'
    // AI & Analytics
    | 'aiHistories' | 'aiStats'
    // Reviews
    | 'reviews'
    // System
    | 'apiKeys' | 'roles' | 'paymentMethods'
    // Legacy (keep for backward compatibility)
    | 'manage' | 'managePrompt' | 'createPrompt' | 'managePackages' | 'manageReviews' | 'manageWallets';

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
    const [activeView, setActiveView] = useState<ViewKey>('dashboard');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Dashboard Stats
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [totalPackages, setTotalPackages] = useState<number>(0);
    const [totalAIHistory, setTotalAIHistory] = useState<number>(0);
    const [totalTemplates, setTotalTemplates] = useState<number>(0);
    const [totalOrders, setTotalOrders] = useState<number>(0);
    const [totalTransactions, setTotalTransactions] = useState<number>(0);
    const [totalPayments, setTotalPayments] = useState<number>(0);
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
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
    
    // State for wallet management
    const [userWallets, setUserWallets] = useState<Map<number, Wallet>>(new Map());
    const [userTransactions, setUserTransactions] = useState<Map<number, Transaction[]>>(new Map());
    const [loadingWallets, setLoadingWallets] = useState(false);
    const [expandedWallets, setExpandedWallets] = useState<Set<number>>(new Set());
    const [fundsForm, setFundsForm] = useState<{ userId: number; amount: string; type: 'add' | 'deduct' } | null>(null);
    
    // State for new management pages
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [allPayments, setAllPayments] = useState<any[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [allAIHistories, setAllAIHistories] = useState<AIHistory[]>([]);
    const [allPromptInstances, setAllPromptInstances] = useState<any[]>([]);
    const [allTemplateArchitectures, setAllTemplateArchitectures] = useState<any[]>([]);
    const [allRoles, setAllRoles] = useState<any[]>([]);
    const [allPaymentMethods, setAllPaymentMethods] = useState<any[]>([]);
    const [allApiKeys, setAllApiKeys] = useState<any[]>([]);
    
    // Loading states
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [loadingAIHistories, setLoadingAIHistories] = useState(false);
    const [loadingTemplateArchitectures, setLoadingTemplateArchitectures] = useState(false);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [loadingApiKeys, setLoadingApiKeys] = useState(false);
    const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
    
    // Search & Filter states
    const [userSearchTerm, setUserSearchTerm] = useState<string>('');
    const [orderSearchTerm, setOrderSearchTerm] = useState<string>('');
    const [transactionSearchTerm, setTransactionSearchTerm] = useState<string>('');
    const [paymentSearchTerm, setPaymentSearchTerm] = useState<string>('');
    const [postSearchTerm, setPostSearchTerm] = useState<string>('');
    const [aiSearchTerm, setAiSearchTerm] = useState<string>('');
    const [architectureSearchTerm, setArchitectureSearchTerm] = useState<string>('');
    const [roleSearchTerm, setRoleSearchTerm] = useState<string>('');
    const [apiKeySearchTerm, setApiKeySearchTerm] = useState<string>('');
    const [paymentMethodSearchTerm, setPaymentMethodSearchTerm] = useState<string>('');

    const pageSizeOptions = [5, 10, 20, 50] as const;

    const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
    const [userPage, setUserPage] = useState(1);
    const [userPageSize, setUserPageSize] = useState<number>(10);

    const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
    const [orderPage, setOrderPage] = useState(1);
    const [orderPageSize, setOrderPageSize] = useState<number>(10);

    const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all');
    const [transactionStatusFilter, setTransactionStatusFilter] = useState<string>('all');
    const [transactionPage, setTransactionPage] = useState(1);
    const [transactionPageSize, setTransactionPageSize] = useState<number>(10);

    const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
    const [paymentPage, setPaymentPage] = useState(1);
    const [paymentPageSize, setPaymentPageSize] = useState<number>(10);

    const [postStatusFilter, setPostStatusFilter] = useState<string>('all');
    const [postTypeFilter, setPostTypeFilter] = useState<string>('all');
    const [postPage, setPostPage] = useState(1);
    const [postPageSize, setPostPageSize] = useState<number>(10);

    const [aiPage, setAiPage] = useState(1);
    const [aiPageSize, setAiPageSize] = useState<number>(10);

    const [architectureTypeFilter, setArchitectureTypeFilter] = useState<string>('all');
    const [architecturePage, setArchitecturePage] = useState(1);
    const [architecturePageSize, setArchitecturePageSize] = useState<number>(10);

    const [rolePage, setRolePage] = useState(1);
    const [rolePageSize, setRolePageSize] = useState<number>(10);

    const [apiKeyPackageId, setApiKeyPackageId] = useState<string>('');
    const [apiKeyProviderFilter, setApiKeyProviderFilter] = useState<string>('');
    const [apiKeyPage, setApiKeyPage] = useState(1);
    const [apiKeyPageSize, setApiKeyPageSize] = useState<number>(10);

    const [paymentMethodProviderFilter, setPaymentMethodProviderFilter] = useState<string>('all');
    const [paymentMethodStatusFilter, setPaymentMethodStatusFilter] = useState<string>('all');
    const [paymentMethodPage, setPaymentMethodPage] = useState(1);
    const [paymentMethodPageSize, setPaymentMethodPageSize] = useState<number>(10);

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

    // Load wallets when manageWallets view is active
    useEffect(() => {
        if (activeView !== 'manageWallets') return;
        
        let mounted = true;
        (async () => {
            try {
                setLoadingWallets(true);
                const usersList = await userService.getAllUsers().catch(() => []);
                if (!mounted) return;
                
                const walletsMap = new Map<number, Wallet>();
                const transactionsMap = new Map<number, Transaction[]>();
                
                // Load wallet and transactions for each user
                for (const user of usersList) {
                    try {
                        const wallet = await walletService.getWalletByUserId(user.userId).catch(() => null);
                        if (wallet) {
                            walletsMap.set(user.userId, wallet);
                            
                            // Load transactions for this user
                            const transactions = await transactionService.getTransactionsByUserId(user.userId).catch(() => []);
                            transactionsMap.set(user.userId, transactions);
                        }
                    } catch (e) {
                        console.error(`Failed to load wallet for user ${user.userId}:`, e);
                    }
                }
                
                if (!mounted) return;
                setUserWallets(walletsMap);
                setUserTransactions(transactionsMap);
            } catch (e) {
                console.error('Failed to load wallets:', e);
                showToast('Không thể tải danh sách ví tiền', 'error');
            } finally {
                if (mounted) setLoadingWallets(false);
            }
        })();
        
        return () => { mounted = false; };
    }, [activeView]);
    
    // Load reviews when manageReviews view is active
    useEffect(() => {
        if (activeView !== 'manageReviews') return;
        
        let mounted = true;
        (async () => {
            try {
                setLoadingReviews(true);
                // Load templates (from both public and my-storage), and users
                const [publicTemplatesRes, myTemplatesRes, usersRes] = await Promise.all([
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

                // Fetch reviews for each template explicitly (more reliable than service aggregation)
                const reviewArrays = await Promise.all(
                  uniqueTemplates.map((t: any) => {
                    const sid = t.storageId || t.id
                    if (!sid) return Promise.resolve([])
                    return reviewService.getReviewsByStorageId(sid).catch(() => [])
                  })
                )
                const combinedReviews = reviewArrays.flat()
                
                setReviews(combinedReviews);
                setTemplates(uniqueTemplates);
                setUsers(Array.isArray(usersRes) ? usersRes : []);
                console.log('[DashboardAdmin] Loaded reviews:', combinedReviews?.length || 0, 'templates:', uniqueTemplates.length, 'users:', usersRes?.length || 0)
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

    // Load data when switching views
    useEffect(() => {
        if (activeView === 'users' && allUsers.length === 0) {
            (async () => {
                try {
                    setLoadingUsers(true);
                    const users = await userService.getAllUsers();
                    setAllUsers(users);
                } catch (e) {
                    console.error('Failed to load users:', e);
                } finally {
                    setLoadingUsers(false);
                }
            })();
        }
    }, [activeView]);

    useEffect(() => {
        if (activeView === 'orders' && allOrders.length === 0) {
            (async () => {
                try {
                    setLoadingOrders(true);
                    const orders = await orderService.getAllOrders();
                    setAllOrders(orders);
                } catch (e) {
                    console.error('Failed to load orders:', e);
                } finally {
                    setLoadingOrders(false);
                }
            })();
        }
    }, [activeView]);

    useEffect(() => {
        if (activeView === 'transactions' && allTransactions.length === 0) {
            (async () => {
                try {
                    setLoadingTransactions(true);
                    const transactions = await transactionService.getAllTransactions();
                    setAllTransactions(transactions);
                } catch (e) {
                    console.error('Failed to load transactions:', e);
                } finally {
                    setLoadingTransactions(false);
                }
            })();
        }
    }, [activeView]);

    useEffect(() => {
        if (activeView === 'payments' && allPayments.length === 0) {
            (async () => {
                try {
                    setLoadingPayments(true);
                    const response = await paymentService.getAll();
                    const payments = Array.isArray(response.data) ? response.data : response;
                    setAllPayments(payments);
                } catch (e) {
                    console.error('Failed to load payments:', e);
                } finally {
                    setLoadingPayments(false);
                }
            })();
        }
    }, [activeView]);

    useEffect(() => {
        if (activeView === 'posts' && allPosts.length === 0) {
            (async () => {
                try {
                    setLoadingPosts(true);
                    const posts = await postService.getAllPosts();
                    setAllPosts(posts);
                } catch (e) {
                    console.error('Failed to load posts:', e);
                } finally {
                    setLoadingPosts(false);
                }
            })();
        }
    }, [activeView, allPosts.length]);

    useEffect(() => {
        if (activeView === 'aiHistories' && allAIHistories.length === 0) {
            (async () => {
                try {
                    setLoadingAIHistories(true);
                    const histories = await aiHistoryService.getAllHistory();
                    setAllAIHistories(histories);
                } catch (e) {
                    console.error('Failed to load AI histories:', e);
                } finally {
                    setLoadingAIHistories(false);
                }
            })();
        }
    }, [activeView, allAIHistories.length]);

    useEffect(() => {
        if (activeView === 'templateArchitectures' && allTemplateArchitectures.length === 0) {
            (async () => {
                try {
                    setLoadingTemplateArchitectures(true);
                    const architectures = await templateArchitectureService.getAll();
                    setAllTemplateArchitectures(architectures);
                } catch (e) {
                    console.error('Failed to load template architectures:', e);
                } finally {
                    setLoadingTemplateArchitectures(false);
                }
            })();
        }
    }, [activeView, allTemplateArchitectures.length]);

    useEffect(() => {
        if (activeView === 'roles' && allRoles.length === 0) {
            (async () => {
                try {
                    setLoadingRoles(true);
                    const roles = await roleService.getAllRoles();
                    setAllRoles(roles);
                } catch (e) {
                    console.error('Failed to load roles:', e);
                } finally {
                    setLoadingRoles(false);
                }
            })();
        }
    }, [activeView, allRoles.length]);

    useEffect(() => {
        if (activeView === 'paymentMethods' && allPaymentMethods.length === 0) {
            (async () => {
                try {
                    setLoadingPaymentMethods(true);
                    const methods = await paymentMethodService.getAllPaymentMethods();
                    setAllPaymentMethods(methods);
                } catch (e) {
                    console.error('Failed to load payment methods:', e);
                } finally {
                    setLoadingPaymentMethods(false);
                }
            })();
        }
    }, [activeView, allPaymentMethods.length]);

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

    const slicePage = <T,>(items: T[], page: number, pageSize: number) => {
        const safePage = Math.max(page, 1);
        const start = (safePage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    };

    const exportToCsv = (filename: string, rows: any[]) => {
        if (!rows || rows.length === 0) {
            showToast('Không có dữ liệu để xuất', 'info');
            return;
        }

        const headerSet = rows.reduce((set: Set<string>, row: Record<string, any>) => {
            Object.keys(row || {}).forEach((key) => set.add(key));
            return set;
        }, new Set<string>());

        const headers = Array.from(headerSet);

        const safeValue = (value: any) => {
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') {
                try {
                    return JSON.stringify(value).replace(/"/g, '""');
                } catch {
                    return String(value).replace(/"/g, '""');
                }
            }
            return String(value).replace(/"/g, '""');
        };

        const csvContent = [
            headers.join(','),
            ...rows.map((row: Record<string, any>) =>
                headers
                    .map((header) => `"${safeValue(row?.[header])}"`)
                    .join(',')
            )
        ].join('\r\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast(`Đã xuất ${rows.length} dòng dữ liệu`, 'success');
    };

    const renderPagination = (
        currentPage: number,
        totalItems: number,
        pageSize: number,
        onPageChange: (page: number) => void,
        onPageSizeChange: (size: number) => void
    ) => {
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const canPrev = currentPage > 1;
        const canNext = currentPage < totalPages;

        return (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4 text-sm">
                <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Hiển thị</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="bg-[#1a1a2d] border border-[#2a2a44] rounded-lg px-3 py-1 text-white focus:outline-none focus:border-blue-500"
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                    <span className="text-neutral-400">dòng</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={!canPrev}
                        className="px-3 py-1 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg hover:bg-[#1f1f33] disabled:opacity-40"
                    >
                        Trước
                    </button>
                    <span className="text-neutral-400">
                        Trang {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={!canNext}
                        className="px-3 py-1 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg hover:bg-[#1f1f33] disabled:opacity-40"
                    >
                        Sau
                    </button>
                </div>
                <div className="text-neutral-500">Tổng {totalItems} dòng</div>
            </div>
        );
    };

    const orderStatusOptions = useMemo(() => {
        const set = new Set<string>();
        allOrders.forEach((order) => {
            if (order?.status) {
                set.add(order.status);
            }
        });
        return Array.from(set);
    }, [allOrders]);

    const transactionTypeOptions = useMemo(() => {
        const set = new Set<string>();
        allTransactions.forEach((tx) => {
            if (tx?.transactionType) {
                set.add(tx.transactionType);
            }
        });
        return Array.from(set);
    }, [allTransactions]);

    const transactionStatusOptions = useMemo(() => {
        const set = new Set<string>();
        allTransactions.forEach((tx) => {
            if (tx?.status) {
                set.add(tx.status);
            }
        });
        return Array.from(set);
    }, [allTransactions]);

    const paymentStatusOptions = useMemo(() => {
        const set = new Set<string>();
        allPayments.forEach((payment: any) => {
            if (payment?.status) {
                set.add(payment.status);
            }
        });
        return Array.from(set);
    }, [allPayments]);

    const postStatusOptions = useMemo(() => {
        const set = new Set<string>();
        allPosts.forEach((post) => {
            if (post?.status) {
                set.add(post.status);
            }
        });
        return Array.from(set);
    }, [allPosts]);

    const postTypeOptions = useMemo(() => {
        const set = new Set<string>();
        allPosts.forEach((post) => {
            if (post?.postType) {
                set.add(post.postType);
            }
        });
        return Array.from(set);
    }, [allPosts]);

    const architectureTypeOptions = useMemo(() => {
        const set = new Set<string>();
        allTemplateArchitectures.forEach((arch) => {
            if (arch?.architectureType) {
                set.add(arch.architectureType);
            }
        });
        return Array.from(set);
    }, [allTemplateArchitectures]);

    const paymentMethodProviderOptions = useMemo(() => {
        const set = new Set<string>();
        allPaymentMethods.forEach((method: any) => {
            if (method?.provider) {
                set.add(method.provider);
            }
        });
        return Array.from(set);
    }, [allPaymentMethods]);

    const apiKeyProviderOptions = useMemo(() => {
        const set = new Set<string>();
        allApiKeys.forEach((apiKey: any) => {
            if (apiKey?.provider) {
                set.add(apiKey.provider);
            }
        });
        return Array.from(set);
    }, [allApiKeys]);

    const ordersChartData = useMemo(() => {
        const map = new Map<string, number>();
        allOrders.forEach((order) => {
            const label = order?.status || 'Khác';
            map.set(label, (map.get(label) || 0) + 1);
        });
        const data = Array.from(map.entries()).map(([label, count]) => ({ label, count }));
        const max = data.reduce((acc, item) => Math.max(acc, item.count), 0);
        return { data, max };
    }, [allOrders]);

    const transactionsChartData = useMemo(() => {
        const map = new Map<string, number>();
        allTransactions.forEach((tx) => {
            const label = tx?.transactionType || 'Khác';
            map.set(label, (map.get(label) || 0) + 1);
        });
        const data = Array.from(map.entries()).map(([label, count]) => ({ label, count }));
        const max = data.reduce((acc, item) => Math.max(acc, item.count), 0);
        return { data, max };
    }, [allTransactions]);

    const paymentsChartData = useMemo(() => {
        const map = new Map<string, number>();
        allPayments.forEach((payment: any) => {
            const label = payment?.status || 'Khác';
            map.set(label, (map.get(label) || 0) + 1);
        });
        const data = Array.from(map.entries()).map(([label, count]) => ({ label, count }));
        const max = data.reduce((acc, item) => Math.max(acc, item.count), 0);
        return { data, max };
    }, [allPayments]);

    const filteredUsers = useMemo(() => {
        return allUsers.filter((user) => {
            const matchSearch = !userSearchTerm
                || user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
                || user.fullName?.toLowerCase().includes(userSearchTerm.toLowerCase());
            const matchRole = userRoleFilter === 'all'
                || (userRoleFilter === 'admin' && user.roleId === 1)
                || (userRoleFilter === 'user' && user.roleId !== 1);
            return matchSearch && matchRole;
        });
    }, [allUsers, userSearchTerm, userRoleFilter]);

    const filteredOrders = useMemo(() => {
        const keyword = orderSearchTerm.trim().toLowerCase();
        return allOrders.filter((order) => {
            const matchStatus = !orderStatusFilter || orderStatusFilter === 'all'
                ? true
                : (order.status || '').toLowerCase() === orderStatusFilter.toLowerCase();
            const matchSearch = !keyword
                || order.orderNumber?.toLowerCase().includes(keyword)
                || order.orderId?.toString() === orderSearchTerm
                || order.userId?.toString() === orderSearchTerm;
            return matchStatus && matchSearch;
        });
    }, [allOrders, orderSearchTerm, orderStatusFilter]);

    const filteredTransactions = useMemo(() => {
        const keyword = transactionSearchTerm.trim().toLowerCase();
        return allTransactions.filter((tx) => {
            const matchType = transactionTypeFilter === 'all' || tx.transactionType === transactionTypeFilter;
            const matchStatus = transactionStatusFilter === 'all' || tx.status === transactionStatusFilter;
            const matchSearch = !keyword
                || tx.transactionId?.toString() === transactionSearchTerm
                || tx.transactionReference?.toLowerCase().includes(keyword)
                || tx.walletId?.toString() === transactionSearchTerm;
            return matchType && matchStatus && matchSearch;
        });
    }, [allTransactions, transactionSearchTerm, transactionStatusFilter, transactionTypeFilter]);

    const filteredPayments = useMemo(() => {
        const keyword = paymentSearchTerm.trim().toLowerCase();
        return allPayments.filter((payment: any) => {
            const matchStatus = paymentStatusFilter === 'all' || payment.status === paymentStatusFilter;
            const matchSearch = !keyword
                || payment.paymentId?.toString() === paymentSearchTerm
                || payment.orderId?.toString() === paymentSearchTerm
                || payment.provider?.toLowerCase().includes(keyword);
            return matchStatus && matchSearch;
        });
    }, [allPayments, paymentSearchTerm, paymentStatusFilter]);

    const filteredPosts = useMemo(() => {
        return allPosts.filter((post) => {
            const matchSearch = !postSearchTerm
                || post.title?.toLowerCase().includes(postSearchTerm.toLowerCase())
                || post.postId?.toString() === postSearchTerm;
            const matchStatus = postStatusFilter === 'all' || post.status === postStatusFilter;
            const matchType = postTypeFilter === 'all' || post.postType === postTypeFilter;
            return matchSearch && matchStatus && matchType;
        });
    }, [allPosts, postSearchTerm, postStatusFilter, postTypeFilter]);

    const filteredAIHistories = useMemo(() => {
        return allAIHistories.filter((history) => {
            if (!aiSearchTerm) return true;
            const keyword = aiSearchTerm.toLowerCase();
            return (
                history.historyId?.toString() === aiSearchTerm
                || history.userId?.toString() === aiSearchTerm
                || history.promptText?.toLowerCase().includes(keyword)
                || history.responseText?.toLowerCase().includes(keyword)
            );
        });
    }, [allAIHistories, aiSearchTerm]);

    const filteredArchitectures = useMemo(() => {
        return allTemplateArchitectures.filter((arch: any) => {
            const matchSearch = !architectureSearchTerm
                || arch.architectureName?.toLowerCase().includes(architectureSearchTerm.toLowerCase());
            const matchType = architectureTypeFilter === 'all' || arch.architectureType === architectureTypeFilter;
            return matchSearch && matchType;
        });
    }, [allTemplateArchitectures, architectureSearchTerm, architectureTypeFilter]);

    const filteredRoles = useMemo(() => {
        return allRoles.filter((role: any) => {
            if (!roleSearchTerm) return true;
            const keyword = roleSearchTerm.toLowerCase();
            return role.roleName?.toLowerCase().includes(keyword) || role.roleId?.toString() === roleSearchTerm;
        });
    }, [allRoles, roleSearchTerm]);

    const filteredApiKeys = useMemo(() => {
        return allApiKeys.filter((apiKey: any) => {
            const matchProvider = !apiKeyProviderFilter || apiKey.provider === apiKeyProviderFilter;
            const matchSearch = !apiKeySearchTerm
                || apiKey.apiKeyId?.toString() === apiKeySearchTerm
                || apiKey.keyValue?.toLowerCase().includes(apiKeySearchTerm.toLowerCase());
            return matchProvider && matchSearch;
        });
    }, [allApiKeys, apiKeyProviderFilter, apiKeySearchTerm]);

    const filteredPaymentMethods = useMemo(() => {
        return allPaymentMethods.filter((method: any) => {
            const matchProvider = paymentMethodProviderFilter === 'all' || method.provider === paymentMethodProviderFilter;
            const matchStatus = paymentMethodStatusFilter === 'all'
                || (paymentMethodStatusFilter === 'active' && method.isActive)
                || (paymentMethodStatusFilter === 'inactive' && !method.isActive);
            const matchSearch = !paymentMethodSearchTerm
                || method.paymentMethodId?.toString() === paymentMethodSearchTerm
                || method.userId?.toString() === paymentMethodSearchTerm;
            return matchProvider && matchStatus && matchSearch;
        });
    }, [allPaymentMethods, paymentMethodProviderFilter, paymentMethodSearchTerm, paymentMethodStatusFilter]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredUsers.length / userPageSize));
        if (userPage > totalPages) {
            setUserPage(totalPages);
        }
    }, [filteredUsers.length, userPage, userPageSize]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredOrders.length / orderPageSize));
        if (orderPage > totalPages) {
            setOrderPage(totalPages);
        }
    }, [filteredOrders.length, orderPage, orderPageSize]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / transactionPageSize));
        if (transactionPage > totalPages) {
            setTransactionPage(totalPages);
        }
    }, [filteredTransactions.length, transactionPage, transactionPageSize]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredPayments.length / paymentPageSize));
        if (paymentPage > totalPages) {
            setPaymentPage(totalPages);
        }
    }, [filteredPayments.length, paymentPage, paymentPageSize]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postPageSize));
        if (postPage > totalPages) {
            setPostPage(totalPages);
        }
    }, [filteredPosts.length, postPage, postPageSize]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredAIHistories.length / aiPageSize));
        if (aiPage > totalPages) {
            setAiPage(totalPages);
        }
    }, [filteredAIHistories.length, aiPage, aiPageSize]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredArchitectures.length / architecturePageSize));
        if (architecturePage > totalPages) {
            setArchitecturePage(totalPages);
        }
    }, [filteredArchitectures.length, architecturePage, architecturePageSize]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredRoles.length / rolePageSize));
        if (rolePage > totalPages) {
            setRolePage(totalPages);
        }
    }, [filteredRoles.length, rolePage, rolePageSize]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredApiKeys.length / apiKeyPageSize));
        if (apiKeyPage > totalPages) {
            setApiKeyPage(totalPages);
        }
    }, [filteredApiKeys.length, apiKeyPage, apiKeyPageSize]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredPaymentMethods.length / paymentMethodPageSize));
        if (paymentMethodPage > totalPages) {
            setPaymentMethodPage(totalPages);
        }
    }, [filteredPaymentMethods.length, paymentMethodPage, paymentMethodPageSize]);

    return (
        <div className="min-h-screen bg-[#131327] text-white flex">
            {/* Sidebar */}
            <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-[#17172b] border-r border-[#2a2a44] transition-all duration-300 flex flex-col`}>
                <div className="p-4 flex items-center justify-between border-b border-[#2a2a44]">
                    {!sidebarCollapsed && <div className="text-lg font-bold text-white">EduPrompt</div>}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 hover:bg-[#2a2a44] rounded-lg transition-colors"
                        title={sidebarCollapsed ? 'Mở rộng' : 'Thu gọn'}
                    >
                        <div className={`w-5 h-5 border-t-2 border-b-2 border-white ${sidebarCollapsed ? 'border-l-2 border-r-0' : 'border-l-0 border-r-2'}`}></div>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {/* Dashboard */}
                    <div className="mb-4">
                        {!sidebarCollapsed && <div className="text-xs font-semibold text-neutral-500 uppercase mb-2 px-2">Dashboard</div>}
                        <SidebarButton 
                            active={activeView === 'dashboard' || activeView === 'manage'} 
                            onClick={() => setActiveView('dashboard')}
                        >
                            <div className="flex items-center gap-3">
                                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>Tổng quan</span>}
                            </div>
                        </SidebarButton>
                    </div>

                    {/* Users */}
                    <div className="mb-4">
                        {!sidebarCollapsed && <div className="text-xs font-semibold text-neutral-500 uppercase mb-2 px-2">Người dùng</div>}
                        <SidebarButton 
                            active={activeView === 'users'} 
                            onClick={() => setActiveView('users')}
                        >
                            <div className="flex items-center gap-3">
                                <Users className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>Quản lý Users</span>}
                            </div>
                        </SidebarButton>
                        <SidebarButton 
                            active={activeView === 'createUser'} 
                            onClick={() => setActiveView('createUser')}
                        >
                            <div className="flex items-center gap-3">
                                <Plus className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>Tạo User</span>}
                            </div>
                        </SidebarButton>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                        {!sidebarCollapsed && <div className="text-xs font-semibold text-neutral-500 uppercase mb-2 px-2">Nội dung</div>}
                        <SidebarButton 
                            active={activeView === 'packages' || activeView === 'managePackages'} 
                            onClick={() => setActiveView('packages')}
                        >
                            <div className="flex items-center gap-3">
                                <PackageIcon className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>Packages</span>}
                            </div>
                        </SidebarButton>
                        <SidebarButton 
                            active={activeView === 'createPackage'} 
                            onClick={() => setActiveView('createPackage')}
                        >
                            <div className="flex items-center gap-3">
                                <Plus className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>Tạo Package</span>}
                            </div>
                        </SidebarButton>
                        <SidebarButton 
                            active={activeView === 'packageCategories' || activeView === 'createCategory'} 
                            onClick={() => setActiveView('packageCategories')}
                        >
                            <div className="flex items-center gap-3">
                                <Archive className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>Categories</span>}
                            </div>
                        </SidebarButton>
                        <SidebarButton 
                            active={activeView === 'templates' || activeView === 'managePrompt'} 
                            onClick={() => setActiveView('templates')}
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>Templates</span>}
                            </div>
                        </SidebarButton>
                        <SidebarButton 
                            active={activeView === 'templateArchitectures'} 
                            onClick={() => setActiveView('templateArchitectures')}
                        >
                            <div className="flex items-center gap-3">
                                <Settings className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>Template Architectures</span>}
                            </div>
                        </SidebarButton>
                        <SidebarButton 
                            active={activeView === 'createPrompt' || activeView === 'createTemplateArchitecture'} 
                            onClick={() => setActiveView('createPrompt')}
                        >
                            <div className="flex items-center gap-3">
                                <Plus className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>Tạo Template</span>}
                            </div>
                        </SidebarButton>
                        <SidebarButton 
                            active={activeView === 'posts'} 
                            onClick={() => setActiveView('posts')}
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>Posts</span>}
                            </div>
                        </SidebarButton>
                    </div>

                    {/* Orders & Payments */}
                    <div className="mb-4">
                        {!sidebarCollapsed && <div className="text-xs font-semibold text-neutral-500 uppercase mb-2 px-2">Đơn hàng & Thanh toán</div>}
                        <SidebarButton 
                            active={activeView === 'orders'} 
                            onClick={() => setActiveView('orders')}
                        >
                            <div className="flex items-center gap-3">
                                <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>Orders</span>}
                            </div>
                        </SidebarButton>
                        <SidebarButton 
                            active={activeView === 'transactions'} 
                            onClick={() => setActiveView('transactions')}
                        >
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>Transactions</span>}
                            </div>
                        </SidebarButton>
                        <SidebarButton 
                            active={activeView === 'payments'} 
                            onClick={() => setActiveView('payments')}
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>Payments</span>}
                            </div>
                        </SidebarButton>
                        <SidebarButton 
                            active={activeView === 'wallets' || activeView === 'manageWallets'} 
                            onClick={() => setActiveView('wallets')}
                        >
                            <div className="flex items-center gap-3">
                                <WalletIcon className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>Wallets</span>}
                            </div>
                        </SidebarButton>
                    </div>

                    {/* AI & Analytics */}
                    <div className="mb-4">
                        {!sidebarCollapsed && <div className="text-xs font-semibold text-neutral-500 uppercase mb-2 px-2">AI & Phân tích</div>}
                        <SidebarButton 
                            active={activeView === 'aiHistories'} 
                            onClick={() => setActiveView('aiHistories')}
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>AI Histories</span>}
                            </div>
                        </SidebarButton>
                        <SidebarButton 
                            active={activeView === 'aiStats'} 
                            onClick={() => setActiveView('aiStats')}
                        >
                            <div className="flex items-center gap-3">
                                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>AI Stats</span>}
                            </div>
                        </SidebarButton>
                    </div>

                    {/* Reviews */}
                    <div className="mb-4">
                        {!sidebarCollapsed && <div className="text-xs font-semibold text-neutral-500 uppercase mb-2 px-2">Đánh giá</div>}
                        <SidebarButton 
                            active={activeView === 'reviews' || activeView === 'manageReviews'} 
                            onClick={() => setActiveView('reviews')}
                        >
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>Reviews</span>}
                            </div>
                        </SidebarButton>
                    </div>

                    {/* System Settings */}
                    <div className="mb-4">
                        {!sidebarCollapsed && <div className="text-xs font-semibold text-neutral-500 uppercase mb-2 px-2">Hệ thống</div>}
                        <SidebarButton 
                            active={activeView === 'apiKeys'} 
                            onClick={() => setActiveView('apiKeys')}
                        >
                            <div className="flex items-center gap-3">
                                <Key className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>API Keys</span>}
                            </div>
                        </SidebarButton>
                        <SidebarButton 
                            active={activeView === 'roles'} 
                            onClick={() => setActiveView('roles')}
                        >
                            <div className="flex items-center gap-3">
                                <Shield className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>Roles</span>}
                            </div>
                        </SidebarButton>
                        <SidebarButton 
                            active={activeView === 'paymentMethods'} 
                            onClick={() => setActiveView('paymentMethods')}
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-4 h-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span>Payment Methods</span>}
                            </div>
                        </SidebarButton>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 p-6 overflow-y-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Dashboard Admin
                    </h1>
                    <p className="text-neutral-400 mt-1">Tổng quan hệ thống và thao tác quản trị</p>
                </div>

                {/* Dashboard Overview */}
                {(activeView === 'dashboard' || activeView === 'manage') && (
                    <>
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                <p className="text-neutral-400 mt-4">Đang tải dữ liệu...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400">{error}</div>
                        ) : (
                            <>
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-neutral-400 text-sm font-medium">Tổng người dùng</div>
                                            <Users className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div className="text-3xl font-bold text-white">{totalUsers}</div>
                                        <div className="text-xs text-neutral-500 mt-2">Active users</div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-neutral-400 text-sm font-medium">Tổng Packages</div>
                                            <PackageIcon className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div className="text-3xl font-bold text-white">{totalPackages}</div>
                                        <div className="text-xs text-neutral-500 mt-2">Available packages</div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-neutral-400 text-sm font-medium">Tổng Orders</div>
                                            <ShoppingCart className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div className="text-3xl font-bold text-white">{totalOrders}</div>
                                        <div className="text-xs text-neutral-500 mt-2">All orders</div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-neutral-400 text-sm font-medium">Doanh thu</div>
                                            <TrendingUp className="w-5 h-5 text-yellow-400" />
                                        </div>
                                        <div className="text-3xl font-bold text-white">{totalRevenue.toLocaleString('vi-VN')}</div>
                                        <div className="text-xs text-neutral-500 mt-2">VND</div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-neutral-400 text-sm font-medium">Transactions</div>
                                            <CreditCard className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div className="text-3xl font-bold text-white">{totalTransactions}</div>
                                        <div className="text-xs text-neutral-500 mt-2">All transactions</div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-neutral-400 text-sm font-medium">Payments</div>
                                            <CreditCard className="w-5 h-5 text-pink-400" />
                                        </div>
                                        <div className="text-3xl font-bold text-white">{totalPayments}</div>
                                        <div className="text-xs text-neutral-500 mt-2">All payments</div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-neutral-400 text-sm font-medium">AI Histories</div>
                                            <Sparkles className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div className="text-3xl font-bold text-white">{totalAIHistory}</div>
                                        <div className="text-xs text-neutral-500 mt-2">AI interactions</div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-5 hover:scale-105 transition-transform">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-neutral-400 text-sm font-medium">Templates</div>
                                            <FileText className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <div className="text-3xl font-bold text-white">{totalTemplates}</div>
                                        <div className="text-xs text-neutral-500 mt-2">Available templates</div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6 mb-6">
                                    <h2 className="text-xl font-semibold mb-4">Thao tác nhanh</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <button
                                            onClick={() => setActiveView('users')}
                                            className="p-4 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg hover:border-blue-500/50 hover:bg-[#1f1f33] transition-colors text-left"
                                        >
                                            <Users className="w-5 h-5 text-blue-400 mb-2" />
                                            <div className="text-sm font-medium">Quản lý Users</div>
                                        </button>
                                        <button
                                            onClick={() => setActiveView('orders')}
                                            className="p-4 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg hover:border-green-500/50 hover:bg-[#1f1f33] transition-colors text-left"
                                        >
                                            <ShoppingCart className="w-5 h-5 text-green-400 mb-2" />
                                            <div className="text-sm font-medium">Xem Orders</div>
                                        </button>
                                        <button
                                            onClick={() => setActiveView('packages')}
                                            className="p-4 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg hover:border-purple-500/50 hover:bg-[#1f1f33] transition-colors text-left"
                                        >
                                            <PackageIcon className="w-5 h-5 text-purple-400 mb-2" />
                                            <div className="text-sm font-medium">Quản lý Packages</div>
                                        </button>
                                        <button
                                            onClick={() => setActiveView('wallets')}
                                            className="p-4 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg hover:border-yellow-500/50 hover:bg-[#1f1f33] transition-colors text-left"
                                        >
                                            <WalletIcon className="w-5 h-5 text-yellow-400 mb-2" />
                                            <div className="text-sm font-medium">Quản lý Wallets</div>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold">Orders theo trạng thái</h3>
                                                <p className="text-neutral-500 text-sm">Phân phối đơn hàng</p>
                                            </div>
                                            <ShoppingCart className="w-5 h-5 text-purple-300" />
                                        </div>
                                        <div className="flex items-end gap-3 h-40">
                                            {ordersChartData.data.length === 0 ? (
                                                <div className="text-neutral-500 text-sm">Chưa có dữ liệu</div>
                                            ) : (
                                                ordersChartData.data.map(({ label, count }) => (
                                                    <div key={label} className="flex-1 flex flex-col justify-end items-center gap-2">
                                                        <div
                                                            className="w-full rounded-t bg-gradient-to-t from-purple-700/30 to-purple-400/60"
                                                            style={{ height: `${ordersChartData.max ? (count / ordersChartData.max) * 100 : 0}%` }}
                                                        ></div>
                                                        <div className="text-xs text-neutral-400 text-center truncate w-full" title={label}>{label}</div>
                                                        <div className="text-sm font-semibold text-white">{count}</div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold">Transactions theo loại</h3>
                                                <p className="text-neutral-500 text-sm">Dòng tiền</p>
                                            </div>
                                            <TrendingUp className="w-5 h-5 text-cyan-300" />
                                        </div>
                                        <div className="flex items-end gap-3 h-40">
                                            {transactionsChartData.data.length === 0 ? (
                                                <div className="text-neutral-500 text-sm">Chưa có dữ liệu</div>
                                            ) : (
                                                transactionsChartData.data.map(({ label, count }) => (
                                                    <div key={label} className="flex-1 flex flex-col justify-end items-center gap-2">
                                                        <div
                                                            className="w-full rounded-t bg-gradient-to-t from-cyan-700/30 to-cyan-400/60"
                                                            style={{ height: `${transactionsChartData.max ? (count / transactionsChartData.max) * 100 : 0}%` }}
                                                        ></div>
                                                        <div className="text-xs text-neutral-400 text-center truncate w-full" title={label}>{label}</div>
                                                        <div className="text-sm font-semibold text-white">{count}</div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold">Payments theo trạng thái</h3>
                                                <p className="text-neutral-500 text-sm">Thanh toán hệ thống</p>
                                            </div>
                                            <CreditCard className="w-5 h-5 text-amber-300" />
                                        </div>
                                        <div className="flex items-end gap-3 h-40">
                                            {paymentsChartData.data.length === 0 ? (
                                                <div className="text-neutral-500 text-sm">Chưa có dữ liệu</div>
                                            ) : (
                                                paymentsChartData.data.map(({ label, count }) => (
                                                    <div key={label} className="flex-1 flex flex-col justify-end items-center gap-2">
                                                        <div
                                                            className="w-full rounded-t bg-gradient-to-t from-amber-700/30 to-amber-400/60"
                                                            style={{ height: `${paymentsChartData.max ? (count / paymentsChartData.max) * 100 : 0}%` }}
                                                        ></div>
                                                        <div className="text-xs text-neutral-400 text-center truncate w-full" title={label}>{label}</div>
                                                        <div className="text-sm font-semibold text-white">{count}</div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
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
                                                        day: '2-digit',
                                                        timeZone: 'Asia/Ho_Chi_Minh'
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
                                                                            {new Date(order.orderDate).toLocaleDateString('vi-VN', {
                                                                              year: 'numeric',
                                                                              month: 'short',
                                                                              day: 'numeric',
                                                                              timeZone: 'Asia/Ho_Chi_Minh'
                                                                            })}
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
                                            // Reload: templates and users, then fetch reviews per template
                                            const [publicTemplatesRes, myTemplatesRes, usersRes] = await Promise.all([
                                              storageTemplateService.getPublicTemplates({}).catch(() => []),
                                              storageTemplateService.getMyStorage().catch(() => []),
                                              userService.getAllUsers().catch(() => []),
                                            ])
                                            const publicTemplates = Array.isArray(publicTemplatesRes) ? publicTemplatesRes : []
                                            const myTemplates = Array.isArray(myTemplatesRes) ? myTemplatesRes : []
                                            const allTemplatesList = [...publicTemplates, ...myTemplates]
                                            const uniqueTemplates = allTemplatesList.reduce((acc: any[], template: any) => {
                                              const storageId = template.storageId || template.id
                                              if (!acc.find((t: any) => (t.storageId || t.id) === storageId)) acc.push(template)
                                              return acc
                                            }, [])

                                            const reviewArrays = await Promise.all(
                                              uniqueTemplates.map((t: any) => {
                                                const sid = t.storageId || t.id
                                                if (!sid) return Promise.resolve([])
                                                return reviewService.getReviewsByStorageId(sid).catch(() => [])
                                              })
                                            )
                                            const combinedReviews = reviewArrays.flat()

                                            setReviews(combinedReviews)
                                            setTemplates(uniqueTemplates)
                                            setUsers(Array.isArray(usersRes) ? usersRes : [])
                                            showToast(`Đã làm mới: ${combinedReviews.length} reviews, ${uniqueTemplates.length} templates, ${usersRes?.length || 0} users`, 'success')
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

                {/* Users Management */}
                {activeView === 'users' && (() => {
                    const totalRows = filteredUsers.length;
                    const currentPage = Math.min(userPage, Math.max(1, Math.ceil(totalRows / userPageSize) || 1));
                    const paginatedUsers = slicePage(filteredUsers, currentPage, userPageSize);

                    return (
                        <div className="space-y-6">
                            <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-semibold flex items-center gap-2">
                                            <Users className="w-5 h-5" />
                                            Quản lý Users
                                        </h2>
                                        <button
                                            onClick={() => exportToCsv('users', filteredUsers)}
                                            className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg hover:border-blue-500/50"
                                        >
                                            <Download className="w-4 h-4" />
                                            Xuất CSV
                                        </button>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm user..."
                                                value={userSearchTerm}
                                                onChange={(e) => {
                                                    setUserSearchTerm(e.target.value);
                                                    setUserPage(1);
                                                }}
                                                className="pl-10 pr-4 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <select
                                            value={userRoleFilter}
                                            onChange={(e) => {
                                                setUserRoleFilter(e.target.value as 'all' | 'admin' | 'user');
                                                setUserPage(1);
                                            }}
                                            className="px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="all">Tất cả roles</option>
                                            <option value="admin">Admin</option>
                                            <option value="user">User</option>
                                        </select>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    setLoadingUsers(true);
                                                    const users = await userService.getAllUsers();
                                                    setAllUsers(users);
                                                } catch (e) {
                                                    showToast('Lỗi khi tải danh sách users', 'error');
                                                } finally {
                                                    setLoadingUsers(false);
                                                }
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        >
                                            Làm mới
                                        </button>
                                    </div>
                                </div>

                                {loadingUsers ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto mt-4">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-[#2a2a44]">
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">ID</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Email</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Tên</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Role</th>
                                                    <th className="text-right py-3 px-4 text-neutral-400 font-medium">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedUsers.map((user) => (
                                                    <tr key={user.userId} className="border-b border-[#2a2a44]/50 hover:bg-[#1a1a2d]">
                                                        <td className="py-3 px-4">{user.userId}</td>
                                                        <td className="py-3 px-4">{user.email}</td>
                                                        <td className="py-3 px-4">{user.fullName || '-'}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded text-xs ${user.roleId === 1 ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                                                {user.roleId === 1 ? 'Admin' : 'User'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => showToast('Tính năng đang phát triển', 'info')}
                                                                    className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 rounded text-sm transition-colors"
                                                                >
                                                                    Chi tiết
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {totalRows === 0 && (
                                            <div className="text-center py-8 text-neutral-400">Không có users nào</div>
                                        )}
                                    </div>
                                )}

                                {renderPagination(
                                    currentPage,
                                    totalRows,
                                    userPageSize,
                                    (page) => setUserPage(page),
                                    (size) => {
                                        setUserPageSize(size);
                                        setUserPage(1);
                                    }
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Orders Management */}
                {activeView === 'orders' && (() => {
                    const totalRows = filteredOrders.length;
                    const currentPage = Math.min(orderPage, Math.max(1, Math.ceil(totalRows / orderPageSize) || 1));
                    const paginatedOrders = slicePage(filteredOrders, currentPage, orderPageSize);

                    return (
                        <div className="space-y-6">
                            <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-semibold flex items-center gap-2">
                                            <ShoppingCart className="w-5 h-5" />
                                            Quản lý Orders
                                        </h2>
                                        <button
                                            onClick={() => exportToCsv('orders', filteredOrders)}
                                            className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg hover:border-blue-500/50"
                                        >
                                            <Download className="w-4 h-4" />
                                            Xuất CSV
                                        </button>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                            <input
                                                type="text"
                                                placeholder="Tìm theo order #, user ID..."
                                                value={orderSearchTerm}
                                                onChange={(e) => {
                                                    setOrderSearchTerm(e.target.value);
                                                    setOrderPage(1);
                                                }}
                                                className="pl-10 pr-4 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <select
                                            value={orderStatusFilter}
                                            onChange={(e) => {
                                                setOrderStatusFilter(e.target.value);
                                                setOrderPage(1);
                                            }}
                                            className="px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="all">Tất cả trạng thái</option>
                                            {orderStatusOptions.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    setLoadingOrders(true);
                                                    const orders = await orderService.getAllOrders();
                                                    setAllOrders(orders);
                                                } catch (e) {
                                                    showToast('Lỗi khi tải danh sách orders', 'error');
                                                } finally {
                                                    setLoadingOrders(false);
                                                }
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        >
                                            Làm mới
                                        </button>
                                    </div>
                                </div>

                                {loadingOrders ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto mt-4">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-[#2a2a44]">
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Order ID</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Order Number</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">User ID</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Tổng tiền</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Status</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Ngày tạo</th>
                                                    <th className="text-right py-3 px-4 text-neutral-400 font-medium">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedOrders.map((order) => (
                                                    <tr key={order.orderId} className="border-b border-[#2a2a44]/50 hover:bg-[#1a1a2d]">
                                                        <td className="py-3 px-4">{order.orderId}</td>
                                                        <td className="py-3 px-4">{order.orderNumber}</td>
                                                        <td className="py-3 px-4">{order.userId}</td>
                                                        <td className="py-3 px-4">{order.totalAmount?.toLocaleString('vi-VN')} VND</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                order.status === 'Paid' || order.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                                                                order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-red-500/20 text-red-400'
                                                            }`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {new Date(order.orderDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <button
                                                                onClick={() => showToast('Tính năng đang phát triển', 'info')}
                                                                className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 rounded text-sm transition-colors"
                                                            >
                                                                Chi tiết
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {totalRows === 0 && (
                                            <div className="text-center py-8 text-neutral-400">Không có orders nào</div>
                                        )}
                                    </div>
                                )}

                                {renderPagination(
                                    currentPage,
                                    totalRows,
                                    orderPageSize,
                                    (page) => setOrderPage(page),
                                    (size) => {
                                        setOrderPageSize(size);
                                        setOrderPage(1);
                                    }
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Transactions Management */}
                {activeView === 'transactions' && (() => {
                    const totalRows = filteredTransactions.length;
                    const currentPage = Math.min(transactionPage, Math.max(1, Math.ceil(totalRows / transactionPageSize) || 1));
                    const paginatedTransactions = slicePage(filteredTransactions, currentPage, transactionPageSize);

                    return (
                        <div className="space-y-6">
                            <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-semibold flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5" />
                                            Quản lý Transactions
                                        </h2>
                                        <button
                                            onClick={() => exportToCsv('transactions', filteredTransactions)}
                                            className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg hover:border-blue-500/50"
                                        >
                                            <Download className="w-4 h-4" />
                                            Xuất CSV
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-3 md:flex-row">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                            <input
                                                type="text"
                                                placeholder="Tìm theo mã giao dịch..."
                                                value={transactionSearchTerm}
                                                onChange={(e) => {
                                                    setTransactionSearchTerm(e.target.value);
                                                    setTransactionPage(1);
                                                }}
                                                className="pl-10 pr-4 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <select
                                            value={transactionTypeFilter}
                                            onChange={(e) => {
                                                setTransactionTypeFilter(e.target.value);
                                                setTransactionPage(1);
                                            }}
                                            className="px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="all">Tất cả loại</option>
                                            {transactionTypeOptions.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={transactionStatusFilter}
                                            onChange={(e) => {
                                                setTransactionStatusFilter(e.target.value);
                                                setTransactionPage(1);
                                            }}
                                            className="px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="all">Tất cả trạng thái</option>
                                            {transactionStatusOptions.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    setLoadingTransactions(true);
                                                    const transactions = await transactionService.getAllTransactions();
                                                    setAllTransactions(transactions);
                                                } catch (e) {
                                                    showToast('Lỗi khi tải danh sách transactions', 'error');
                                                } finally {
                                                    setLoadingTransactions(false);
                                                }
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        >
                                            Làm mới
                                        </button>
                                    </div>
                                </div>

                                {loadingTransactions ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto mt-4">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-[#2a2a44]">
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Transaction ID</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Wallet ID</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Loại</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Số tiền</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Status</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Ngày tạo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedTransactions.map((tx) => (
                                                    <tr key={tx.transactionId} className="border-b border-[#2a2a44]/50 hover:bg-[#1a1a2d]">
                                                        <td className="py-3 px-4">{tx.transactionId}</td>
                                                        <td className="py-3 px-4">{tx.walletId || '-'}</td>
                                                        <td className="py-3 px-4">
                                                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                                                                {tx.transactionType}
                                                            </span>
                                                        </td>
                                                        <td className={`py-3 px-4 font-semibold ${tx.transactionType === 'DEBIT' ? 'text-red-400' : 'text-green-400'}`}>
                                                            {tx.transactionType === 'DEBIT' ? '-' : '+'}
                                                            {tx.amount?.toLocaleString('vi-VN')} VND
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                tx.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                                                                tx.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-red-500/20 text-red-400'
                                                            }`}>
                                                                {tx.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {new Date(tx.transactionDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {totalRows === 0 && (
                                            <div className="text-center py-8 text-neutral-400">Không có transactions nào</div>
                                        )}
                                    </div>
                                )}

                                {renderPagination(
                                    currentPage,
                                    totalRows,
                                    transactionPageSize,
                                    (page) => setTransactionPage(page),
                                    (size) => {
                                        setTransactionPageSize(size);
                                        setTransactionPage(1);
                                    }
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Payments Management */}
                {activeView === 'payments' && (() => {
                    const totalRows = filteredPayments.length;
                    const currentPage = Math.min(paymentPage, Math.max(1, Math.ceil(totalRows / paymentPageSize) || 1));
                    const paginatedPayments = slicePage(filteredPayments, currentPage, paymentPageSize);

                    return (
                        <div className="space-y-6">
                            <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-semibold flex items-center gap-2">
                                            <CreditCard className="w-5 h-5" />
                                            Quản lý Payments
                                        </h2>
                                        <button
                                            onClick={() => exportToCsv('payments', filteredPayments)}
                                            className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg hover:border-blue-500/50"
                                        >
                                            <Download className="w-4 h-4" />
                                            Xuất CSV
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-3 md:flex-row">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                            <input
                                                type="text"
                                                placeholder="Tìm theo payment, order..."
                                                value={paymentSearchTerm}
                                                onChange={(e) => {
                                                    setPaymentSearchTerm(e.target.value);
                                                    setPaymentPage(1);
                                                }}
                                                className="pl-10 pr-4 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <select
                                            value={paymentStatusFilter}
                                            onChange={(e) => {
                                                setPaymentStatusFilter(e.target.value);
                                                setPaymentPage(1);
                                            }}
                                            className="px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="all">Tất cả trạng thái</option>
                                            {paymentStatusOptions.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    setLoadingPayments(true);
                                                    const response = await paymentService.getAll();
                                                    const payments = Array.isArray(response.data) ? response.data : response;
                                                    setAllPayments(payments);
                                                } catch (e) {
                                                    showToast('Lỗi khi tải danh sách payments', 'error');
                                                } finally {
                                                    setLoadingPayments(false);
                                                }
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        >
                                            Làm mới
                                        </button>
                                    </div>
                                </div>

                                {loadingPayments ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto mt-4">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-[#2a2a44]">
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Payment ID</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Order ID</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Amount</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Provider</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Status</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Ngày tạo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedPayments.map((payment: any) => (
                                                    <tr key={payment.paymentId} className="border-b border-[#2a2a44]/50 hover:bg-[#1a1a2d]">
                                                        <td className="py-3 px-4">{payment.paymentId}</td>
                                                        <td className="py-3 px-4">{payment.orderId || '-'}</td>
                                                        <td className="py-3 px-4">{payment.amount?.toLocaleString('vi-VN')} VND</td>
                                                        <td className="py-3 px-4">{payment.provider || 'VNPay'}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                payment.status === 'Paid' ? 'bg-green-500/20 text-green-400' :
                                                                payment.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-red-500/20 text-red-400'
                                                            }`}>
                                                                {payment.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {payment.createdDate ? new Date(payment.createdDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {totalRows === 0 && (
                                            <div className="text-center py-8 text-neutral-400">Không có payments nào</div>
                                        )}
                                    </div>
                                )}

                                {renderPagination(
                                    currentPage,
                                    totalRows,
                                    paymentPageSize,
                                    (page) => setPaymentPage(page),
                                    (size) => {
                                        setPaymentPageSize(size);
                                        setPaymentPage(1);
                                    }
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Wallets Management - Keep existing */}
                {(activeView === 'wallets' || activeView === 'manageWallets') && (
                    <div className="space-y-6">
                        <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <WalletIcon className="w-5 h-5" />
                                    Quản lý ví tiền
                                </h2>
                                <button
                                    onClick={async () => {
                                        try {
                                            setLoadingWallets(true);
                                            const usersList = await userService.getAllUsers().catch(() => []);
                                            
                                            const walletsMap = new Map<number, Wallet>();
                                            const transactionsMap = new Map<number, Transaction[]>();
                                            
                                            for (const user of usersList) {
                                                try {
                                                    const wallet = await walletService.getWalletByUserId(user.userId).catch(() => null);
                                                    if (wallet) {
                                                        walletsMap.set(user.userId, wallet);
                                                        const transactions = await transactionService.getTransactionsByUserId(user.userId).catch(() => []);
                                                        transactionsMap.set(user.userId, transactions);
                                                    }
                                                } catch (e) {
                                                    console.error(`Failed to load wallet for user ${user.userId}:`, e);
                                                }
                                            }
                                            
                                            setUserWallets(walletsMap);
                                            setUserTransactions(transactionsMap);
                                            showToast('Đã làm mới danh sách ví tiền', 'success');
                                        } catch (e) {
                                            showToast('Không thể làm mới danh sách ví tiền', 'error');
                                        } finally {
                                            setLoadingWallets(false);
                                        }
                                    }}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm"
                                    disabled={loadingWallets}
                                >
                                    🔄 Làm mới
                                </button>
                            </div>

                            {loadingWallets ? (
                                <div className="text-center py-8 text-neutral-400">Đang tải thông tin ví tiền...</div>
                            ) : userWallets.size === 0 ? (
                                <div className="text-center py-8 text-neutral-400">Chưa có ví tiền nào</div>
                            ) : (
                                <div className="space-y-4 max-h-[700px] overflow-y-auto">
                                    {Array.from(userWallets.entries()).map(([userId, wallet]) => {
                                        const user = users.find(u => u.userId === userId);
                                        const transactions = userTransactions.get(userId) || [];
                                        const isExpanded = expandedWallets.has(userId);
                                        
                                        return (
                                            <div
                                                key={userId}
                                                className="p-4 bg-[#23233a] border border-[#2a2a44] rounded-lg"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        {/* User Info */}
                                                        <div className="flex items-center space-x-3 mb-3">
                                                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                                                                <WalletIcon className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-white">
                                                                    {user?.fullName || user?.email || `User #${userId}`}
                                                                </div>
                                                                <div className="text-xs text-neutral-400">
                                                                    {user?.email && user?.email !== user?.fullName && user.email}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Wallet Info */}
                                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                                            <div>
                                                                <div className="text-xs text-neutral-400 mb-1">Số dư</div>
                                                                <div className="text-lg font-bold text-green-400">
                                                                    {wallet.balance.toLocaleString('vi-VN')} {wallet.currency || 'VND'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-neutral-400 mb-1">Trạng thái</div>
                                                                <div className={`text-sm font-semibold ${
                                                                    wallet.status === 'Active' ? 'text-green-400' : 
                                                                    wallet.status === 'Suspended' ? 'text-yellow-400' : 
                                                                    'text-red-400'
                                                                }`}>
                                                                    {wallet.status === 'Active' ? 'Hoạt động' : 
                                                                     wallet.status === 'Suspended' ? 'Tạm khóa' : 
                                                                     'Vô hiệu'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-neutral-400 mb-1">Ngày tạo</div>
                                                                <div className="text-sm text-neutral-300">
                                                                    {new Date(wallet.createdDate).toLocaleDateString('vi-VN', { 
                                                                        timeZone: 'Asia/Ho_Chi_Minh',
                                                                        year: 'numeric',
                                                                        month: '2-digit',
                                                                        day: '2-digit'
                                                                    })}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-neutral-400 mb-1">Số giao dịch</div>
                                                                <div className="text-sm text-neutral-300">{transactions.length}</div>
                                                            </div>
                                                        </div>

                                                        {/* Transactions */}
                                                        {isExpanded && (
                                                            <div className="mt-4 pt-4 border-t border-[#2a2a44]">
                                                                <div className="text-sm font-semibold mb-3">Lịch sử giao dịch ({transactions.length})</div>
                                                                {transactions.length === 0 ? (
                                                                    <div className="text-sm text-neutral-400">Chưa có giao dịch nào</div>
                                                                ) : (
                                                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                                                        {transactions.map((tx) => (
                                                                            <div
                                                                                key={tx.transactionId}
                                                                                className="p-3 bg-[#1a1a2d] rounded-lg border border-[#2a2a44]"
                                                                            >
                                                                                <div className="flex items-center justify-between">
                                                                                    <div className="flex-1">
                                                                                        <div className="flex items-center gap-2 mb-1">
                                                                                            <span className={`text-xs px-2 py-1 rounded ${
                                                                                                tx.transactionType === 'TopUp' || tx.transactionType === 'Deposit' ? 'bg-green-500/20 text-green-400' :
                                                                                                tx.transactionType === 'Payment' ? 'bg-red-500/20 text-red-400' :
                                                                                                'bg-blue-500/20 text-blue-400'
                                                                                            }`}>
                                                                                                {tx.transactionType === 'TopUp' ? 'Nạp tiền' :
                                                                                                 tx.transactionType === 'Deposit' ? 'Nhận tiền' :
                                                                                                 tx.transactionType === 'Payment' ? 'Thanh toán' :
                                                                                                 tx.transactionType === 'ExternalPayment' ? 'Thanh toán ngoài' :
                                                                                                 tx.transactionType}
                                                                                            </span>
                                                                                            <span className={`text-xs px-2 py-1 rounded ${
                                                                                                tx.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                                                                                                tx.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                                                'bg-red-500/20 text-red-400'
                                                                                            }`}>
                                                                                                {tx.status === 'Completed' ? 'Hoàn thành' :
                                                                                                 tx.status === 'Pending' ? 'Đang xử lý' :
                                                                                                 tx.status === 'Failed' ? 'Thất bại' :
                                                                                                 tx.status}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="text-sm text-neutral-300">
                                                                                            {tx.transactionReference || `Giao dịch #${tx.transactionId}`}
                                                                                        </div>
                                                                                        <div className="text-xs text-neutral-500 mt-1">
                                                                                            {new Date(tx.transactionDate).toLocaleString('vi-VN', { 
                                                                                                timeZone: 'Asia/Ho_Chi_Minh'
                                                                                            })}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className={`text-lg font-bold ${
                                                                                        tx.transactionType === 'TopUp' || tx.transactionType === 'Deposit' ? 'text-green-400' :
                                                                                        'text-red-400'
                                                                                    }`}>
                                                                                        {tx.transactionType === 'TopUp' || tx.transactionType === 'Deposit' ? '+' : '-'}
                                                                                        {tx.amount.toLocaleString('vi-VN')} {wallet.currency || 'VND'}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-col gap-2 ml-4">
                                                        <button
                                                            onClick={() => {
                                                                const newExpanded = new Set(expandedWallets);
                                                                if (isExpanded) {
                                                                    newExpanded.delete(userId);
                                                                } else {
                                                                    newExpanded.add(userId);
                                                                }
                                                                setExpandedWallets(newExpanded);
                                                            }}
                                                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded"
                                                            title={isExpanded ? 'Ẩn giao dịch' : 'Xem giao dịch'}
                                                        >
                                                            {isExpanded ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                        <button
                                                            onClick={() => setFundsForm({ userId, amount: '', type: 'add' })}
                                                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded"
                                                            title="Nạp tiền"
                                                        >
                                                            <Plus className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setFundsForm({ userId, amount: '', type: 'deduct' })}
                                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
                                                            title="Trừ tiền"
                                                        >
                                                            <Minus className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Funds Form Modal */}
                        {fundsForm && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6 w-full max-w-md">
                                    <h3 className="text-xl font-semibold mb-4">
                                        {fundsForm.type === 'add' ? 'Nạp tiền vào ví' : 'Trừ tiền từ ví'}
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-neutral-400 mb-2">Số tiền</label>
                                            <input
                                                type="number"
                                                value={fundsForm.amount}
                                                onChange={(e) => setFundsForm({ ...fundsForm, amount: e.target.value })}
                                                className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white"
                                                placeholder="Nhập số tiền"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={async () => {
                                                    if (!fundsForm.amount || parseFloat(fundsForm.amount) <= 0) {
                                                        showToast('Vui lòng nhập số tiền hợp lệ', 'error');
                                                        return;
                                                    }
                                                    try {
                                                        if (fundsForm.type === 'add') {
                                                            await walletService.addFunds({
                                                                userId: fundsForm.userId,
                                                                amount: parseFloat(fundsForm.amount)
                                                            });
                                                            showToast('Nạp tiền thành công', 'success');
                                                        } else {
                                                            await walletService.deductFunds({
                                                                userId: fundsForm.userId,
                                                                amount: parseFloat(fundsForm.amount)
                                                            });
                                                            showToast('Trừ tiền thành công', 'success');
                                                        }
                                                        
                                                        // Reload wallet data
                                                        const wallet = await walletService.getWalletByUserId(fundsForm.userId).catch(() => null);
                                                        if (wallet) {
                                                            setUserWallets(prev => {
                                                                const newMap = new Map(prev);
                                                                newMap.set(fundsForm.userId, wallet);
                                                                return newMap;
                                                            });
                                                            
                                                            const transactions = await transactionService.getTransactionsByUserId(fundsForm.userId).catch(() => []);
                                                            setUserTransactions(prev => {
                                                                const newMap = new Map(prev);
                                                                newMap.set(fundsForm.userId, transactions);
                                                                return newMap;
                                                            });
                                                        }
                                                        
                                                        setFundsForm(null);
                                                    } catch (e: any) {
                                                        const msg = e?.response?.data?.message || e?.message || 'Thao tác thất bại';
                                                        showToast(msg, 'error');
                                                    }
                                                }}
                                                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                                            >
                                                Xác nhận
                                            </button>
                                            <button
                                                onClick={() => setFundsForm(null)}
                                                className="flex-1 px-4 py-2 rounded-lg bg-[#2a2a44] hover:bg-[#3a3a54] text-white"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Posts Management */}
                {activeView === 'posts' && (() => {
                    const totalRows = filteredPosts.length;
                    const currentPage = Math.min(postPage, Math.max(1, Math.ceil(totalRows / postPageSize) || 1));
                    const paginatedPosts = slicePage(filteredPosts, currentPage, postPageSize);

                    return (
                        <div className="space-y-6">
                            <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-semibold flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Quản lý Posts
                                        </h2>
                                        <button
                                            onClick={() => exportToCsv('posts', filteredPosts)}
                                            className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg hover:border-blue-500/50"
                                        >
                                            <Download className="w-4 h-4" />
                                            Xuất CSV
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-3 md:flex-row">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                            <input
                                                type="text"
                                                placeholder="Tìm theo tiêu đề, ID..."
                                                value={postSearchTerm}
                                                onChange={(e) => {
                                                    setPostSearchTerm(e.target.value);
                                                    setPostPage(1);
                                                }}
                                                className="pl-10 pr-4 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <select
                                            value={postStatusFilter}
                                            onChange={(e) => {
                                                setPostStatusFilter(e.target.value);
                                                setPostPage(1);
                                            }}
                                            className="px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="all">Tất cả trạng thái</option>
                                            {postStatusOptions.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={postTypeFilter}
                                            onChange={(e) => {
                                                setPostTypeFilter(e.target.value);
                                                setPostPage(1);
                                            }}
                                            className="px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="all">Tất cả loại</option>
                                            {postTypeOptions.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    setLoadingPosts(true);
                                                    const posts = await postService.getAllPosts();
                                                    setAllPosts(posts);
                                                } catch (e) {
                                                    showToast('Lỗi khi tải danh sách posts', 'error');
                                                } finally {
                                                    setLoadingPosts(false);
                                                }
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        >
                                            Làm mới
                                        </button>
                                    </div>
                                </div>

                                {loadingPosts ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto mt-4">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-[#2a2a44]">
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Post ID</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Tiêu đề</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Loại</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Trạng thái</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Giá</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Ngày tạo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedPosts.map((post) => (
                                                    <tr key={post.postId} className="border-b border-[#2a2a44]/50 hover:bg-[#1a1a2d]">
                                                        <td className="py-3 px-4">{post.postId}</td>
                                                        <td className="py-3 px-4">{post.title}</td>
                                                        <td className="py-3 px-4">{post.postType || '-'}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded text-xs ${post.status === 'Published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                                {post.status || 'Unknown'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">{post.price ? `${post.price.toLocaleString('vi-VN')} VND` : '-'}</td>
                                                        <td className="py-3 px-4">{post.createdDate ? new Date(post.createdDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {totalRows === 0 && (
                                            <div className="text-center py-8 text-neutral-400">Không có posts nào</div>
                                        )}
                                    </div>
                                )}

                                {renderPagination(
                                    currentPage,
                                    totalRows,
                                    postPageSize,
                                    (page) => setPostPage(page),
                                    (size) => {
                                        setPostPageSize(size);
                                        setPostPage(1);
                                    }
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* AI Histories Management */}
                {activeView === 'aiHistories' && (() => {
                    const totalRows = filteredAIHistories.length;
                    const currentPage = Math.min(aiPage, Math.max(1, Math.ceil(totalRows / aiPageSize) || 1));
                    const paginatedHistories = slicePage(filteredAIHistories, currentPage, aiPageSize);

                    return (
                        <div className="space-y-6">
                            <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-semibold flex items-center gap-2">
                                            <Sparkles className="w-5 h-5" />
                                            Lịch sử AI
                                        </h2>
                                        <button
                                            onClick={() => exportToCsv('ai-histories', filteredAIHistories)}
                                            className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg hover:border-blue-500/50"
                                        >
                                            <Download className="w-4 h-4" />
                                            Xuất CSV
                                        </button>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                            <input
                                                type="text"
                                                placeholder="Tìm theo user, prompt..."
                                                value={aiSearchTerm}
                                                onChange={(e) => {
                                                    setAiSearchTerm(e.target.value);
                                                    setAiPage(1);
                                                }}
                                                className="pl-10 pr-4 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    setLoadingAIHistories(true);
                                                    const histories = await aiHistoryService.getAllHistory();
                                                    setAllAIHistories(histories);
                                                } catch (e) {
                                                    showToast('Lỗi khi tải lịch sử AI', 'error');
                                                } finally {
                                                    setLoadingAIHistories(false);
                                                }
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        >
                                            Làm mới
                                        </button>
                                    </div>
                                </div>

                                {loadingAIHistories ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto mt-4">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-[#2a2a44]">
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">History ID</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">User</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Instance</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Prompt</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Response</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Ngày tạo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedHistories.map((history) => (
                                                    <tr key={history.historyId} className="border-b border-[#2a2a44]/50 hover:bg-[#1a1a2d]">
                                                        <td className="py-3 px-4">{history.historyId}</td>
                                                        <td className="py-3 px-4">{history.userId}</td>
                                                        <td className="py-3 px-4">{history.instanceId}</td>
                                                        <td className="py-3 px-4 max-w-xs truncate" title={history.promptText}>{history.promptText || '-'}</td>
                                                        <td className="py-3 px-4 max-w-xs truncate" title={history.responseText}>{history.responseText || '-'}</td>
                                                        <td className="py-3 px-4">{history.createdAt ? new Date(history.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {totalRows === 0 && (
                                            <div className="text-center py-8 text-neutral-400">Không có lịch sử AI</div>
                                        )}
                                    </div>
                                )}

                                {renderPagination(
                                    currentPage,
                                    totalRows,
                                    aiPageSize,
                                    (page) => setAiPage(page),
                                    (size) => {
                                        setAiPageSize(size);
                                        setAiPage(1);
                                    }
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Template Architectures Management */}
                {activeView === 'templateArchitectures' && (() => {
                    const totalRows = filteredArchitectures.length;
                    const currentPage = Math.min(architecturePage, Math.max(1, Math.ceil(totalRows / architecturePageSize) || 1));
                    const paginatedArchitectures = slicePage(filteredArchitectures, currentPage, architecturePageSize);

                    return (
                        <div className="space-y-6">
                            <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-semibold flex items-center gap-2">
                                            <Settings className="w-5 h-5" />
                                            Template Architectures
                                        </h2>
                                        <button
                                            onClick={() => exportToCsv('template-architectures', filteredArchitectures)}
                                            className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg hover:border-blue-500/50"
                                        >
                                            <Download className="w-4 h-4" />
                                            Xuất CSV
                                        </button>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                            <input
                                                type="text"
                                                placeholder="Tìm theo tên kiến trúc"
                                                value={architectureSearchTerm}
                                                onChange={(e) => {
                                                    setArchitectureSearchTerm(e.target.value);
                                                    setArchitecturePage(1);
                                                }}
                                                className="pl-10 pr-4 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <select
                                            value={architectureTypeFilter}
                                            onChange={(e) => {
                                                setArchitectureTypeFilter(e.target.value);
                                                setArchitecturePage(1);
                                            }}
                                            className="px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="all">Tất cả loại</option>
                                            {architectureTypeOptions.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    setLoadingTemplateArchitectures(true);
                                                    const architectures = await templateArchitectureService.getAll();
                                                    setAllTemplateArchitectures(architectures);
                                                } catch (e) {
                                                    showToast('Lỗi khi tải template architectures', 'error');
                                                } finally {
                                                    setLoadingTemplateArchitectures(false);
                                                }
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        >
                                            Làm mới
                                        </button>
                                    </div>
                                </div>

                                {loadingTemplateArchitectures ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto mt-4">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-[#2a2a44]">
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">ID</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Tên</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Loại</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Storage ID</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Ngày tạo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedArchitectures.map((arch: any) => (
                                                    <tr key={arch.architectureId} className="border-b border-[#2a2a44]/50 hover:bg-[#1a1a2d]">
                                                        <td className="py-3 px-4">{arch.architectureId}</td>
                                                        <td className="py-3 px-4">{arch.architectureName || '-'}</td>
                                                        <td className="py-3 px-4">{arch.architectureType || '-'}</td>
                                                        <td className="py-3 px-4">{arch.storageId || '-'}</td>
                                                        <td className="py-3 px-4">{arch.createdAt ? new Date(arch.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {totalRows === 0 && (
                                            <div className="text-center py-8 text-neutral-400">Không có template architecture nào</div>
                                        )}
                                    </div>
                                )}

                                {renderPagination(
                                    currentPage,
                                    totalRows,
                                    architecturePageSize,
                                    (page) => setArchitecturePage(page),
                                    (size) => {
                                        setArchitecturePageSize(size);
                                        setArchitecturePage(1);
                                    }
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Roles Management */}
                {activeView === 'roles' && (() => {
                    const totalRows = filteredRoles.length;
                    const currentPage = Math.min(rolePage, Math.max(1, Math.ceil(totalRows / rolePageSize) || 1));
                    const paginatedRoles = slicePage(filteredRoles, currentPage, rolePageSize);

                    return (
                        <div className="space-y-6">
                            <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-semibold flex items-center gap-2">
                                            <Shield className="w-5 h-5" />
                                            Quản lý Roles
                                        </h2>
                                        <button
                                            onClick={() => exportToCsv('roles', filteredRoles)}
                                            className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg hover:border-blue-500/50"
                                        >
                                            <Download className="w-4 h-4" />
                                            Xuất CSV
                                        </button>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                            <input
                                                type="text"
                                                placeholder="Tìm theo tên role"
                                                value={roleSearchTerm}
                                                onChange={(e) => {
                                                    setRoleSearchTerm(e.target.value);
                                                    setRolePage(1);
                                                }}
                                                className="pl-10 pr-4 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    setLoadingRoles(true);
                                                    const roles = await roleService.getAllRoles();
                                                    setAllRoles(roles);
                                                } catch (e) {
                                                    showToast('Lỗi khi tải roles', 'error');
                                                } finally {
                                                    setLoadingRoles(false);
                                                }
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        >
                                            Làm mới
                                        </button>
                                    </div>
                                </div>

                                {loadingRoles ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto mt-4">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-[#2a2a44]">
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Role ID</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Tên Role</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Mô tả</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedRoles.map((role: any) => (
                                                    <tr key={role.roleId} className="border-b border-[#2a2a44]/50 hover:bg-[#1a1a2d]">
                                                        <td className="py-3 px-4">{role.roleId}</td>
                                                        <td className="py-3 px-4">{role.roleName}</td>
                                                        <td className="py-3 px-4">{role.description || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {totalRows === 0 && (
                                            <div className="text-center py-8 text-neutral-400">Không có role nào</div>
                                        )}
                                    </div>
                                )}

                                {renderPagination(
                                    currentPage,
                                    totalRows,
                                    rolePageSize,
                                    (page) => setRolePage(page),
                                    (size) => {
                                        setRolePageSize(size);
                                        setRolePage(1);
                                    }
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* API Keys Management */}
                {activeView === 'apiKeys' && (() => {
                    const totalRows = filteredApiKeys.length;
                    const currentPage = Math.min(apiKeyPage, Math.max(1, Math.ceil(totalRows / apiKeyPageSize) || 1));
                    const paginatedApiKeys = slicePage(filteredApiKeys, currentPage, apiKeyPageSize);

                    return (
                        <div className="space-y-6">
                            <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-semibold flex items-center gap-2">
                                            <Key className="w-5 h-5" />
                                            API Keys
                                        </h2>
                                        <button
                                            onClick={() => exportToCsv('api-keys', filteredApiKeys)}
                                            className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg hover:border-blue-500/50"
                                        >
                                            <Download className="w-4 h-4" />
                                            Xuất CSV
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-3 md:flex-row">
                                        <input
                                            type="number"
                                            min="1"
                                            value={apiKeyPackageId}
                                            onChange={(e) => setApiKeyPackageId(e.target.value)}
                                            placeholder="Package ID"
                                            className="px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        />
                                        <select
                                            value={apiKeyProviderFilter}
                                            onChange={(e) => {
                                                setApiKeyProviderFilter(e.target.value);
                                                setApiKeyPage(1);
                                            }}
                                            className="px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">Tất cả provider</option>
                                            {apiKeyProviderOptions.map((provider) => (
                                                <option key={provider} value={provider}>
                                                    {provider}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                            <input
                                                type="text"
                                                placeholder="Tìm theo khóa"
                                                value={apiKeySearchTerm}
                                                onChange={(e) => {
                                                    setApiKeySearchTerm(e.target.value);
                                                    setApiKeyPage(1);
                                                }}
                                                className="pl-10 pr-4 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={async () => {
                                                    if (!apiKeyPackageId) {
                                                        showToast('Nhập Package ID để tra cứu', 'info');
                                                        return;
                                                    }
                                                    try {
                                                        setLoadingApiKeys(true);
                                                        const keys = await apiKeyService.getByPackage(Number(apiKeyPackageId));
                                                        setAllApiKeys(keys);
                                                        setApiKeyPage(1);
                                                    } catch (e) {
                                                        showToast('Không lấy được API keys cho package này', 'error');
                                                    } finally {
                                                        setLoadingApiKeys(false);
                                                    }
                                                }}
                                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                            >
                                                Tra cứu Package
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (!apiKeyProviderFilter) {
                                                        showToast('Chọn provider để tra cứu', 'info');
                                                        return;
                                                    }
                                                    try {
                                                        setLoadingApiKeys(true);
                                                        const key = await apiKeyService.getActiveByProvider(apiKeyProviderFilter);
                                                        setAllApiKeys(key ? [key] : []);
                                                        setApiKeyPage(1);
                                                    } catch (e) {
                                                        showToast('Không lấy được API key cho provider này', 'error');
                                                    } finally {
                                                        setLoadingApiKeys(false);
                                                    }
                                                }}
                                                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                                            >
                                                Tra cứu Provider
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {loadingApiKeys ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto mt-4">
                                        <table className="w-full min-w-[720px]">
                                            <thead>
                                                <tr className="border-b border-[#2a2a44]">
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">API Key ID</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Package ID</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Provider</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Key</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Active</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Ngày tạo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedApiKeys.map((apiKey: any) => (
                                                    <tr key={apiKey.apiKeyId} className="border-b border-[#2a2a44]/50 hover:bg-[#1a1a2d]">
                                                        <td className="py-3 px-4">{apiKey.apiKeyId}</td>
                                                        <td className="py-3 px-4">{apiKey.packageId}</td>
                                                        <td className="py-3 px-4">{apiKey.provider}</td>
                                                        <td className="py-3 px-4 max-w-xs truncate" title={apiKey.keyValue || ''}>{apiKey.keyValue || '-'}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded text-xs ${apiKey.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                {apiKey.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">{apiKey.createdAt ? new Date(apiKey.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {totalRows === 0 && (
                                            <div className="text-center py-8 text-neutral-400">Chưa có dữ liệu API key</div>
                                        )}
                                    </div>
                                )}

                                {renderPagination(
                                    currentPage,
                                    totalRows,
                                    apiKeyPageSize,
                                    (page) => setApiKeyPage(page),
                                    (size) => {
                                        setApiKeyPageSize(size);
                                        setApiKeyPage(1);
                                    }
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Payment Methods Management */}
                {activeView === 'paymentMethods' && (() => {
                    const totalRows = filteredPaymentMethods.length;
                    const currentPage = Math.min(paymentMethodPage, Math.max(1, Math.ceil(totalRows / paymentMethodPageSize) || 1));
                    const paginatedPaymentMethods = slicePage(filteredPaymentMethods, currentPage, paymentMethodPageSize);

                    return (
                        <div className="space-y-6">
                            <div className="bg-[#15152a] border border-[#2a2a44] rounded-xl p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-semibold flex items-center gap-2">
                                            <CreditCard className="w-5 h-5" />
                                            Phương thức thanh toán
                                        </h2>
                                        <button
                                            onClick={() => exportToCsv('payment-methods', filteredPaymentMethods)}
                                            className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg hover:border-blue-500/50"
                                        >
                                            <Download className="w-4 h-4" />
                                            Xuất CSV
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-3 md:flex-row">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                            <input
                                                type="text"
                                                placeholder="Tìm theo ID người dùng"
                                                value={paymentMethodSearchTerm}
                                                onChange={(e) => {
                                                    setPaymentMethodSearchTerm(e.target.value);
                                                    setPaymentMethodPage(1);
                                                }}
                                                className="pl-10 pr-4 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <select
                                            value={paymentMethodProviderFilter}
                                            onChange={(e) => {
                                                setPaymentMethodProviderFilter(e.target.value);
                                                setPaymentMethodPage(1);
                                            }}
                                            className="px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="all">Tất cả provider</option>
                                            {paymentMethodProviderOptions.map((provider) => (
                                                <option key={provider} value={provider}>
                                                    {provider}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={paymentMethodStatusFilter}
                                            onChange={(e) => {
                                                setPaymentMethodStatusFilter(e.target.value);
                                                setPaymentMethodPage(1);
                                            }}
                                            className="px-3 py-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="all">Tất cả trạng thái</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    setLoadingPaymentMethods(true);
                                                    const methods = await paymentMethodService.getAllPaymentMethods();
                                                    setAllPaymentMethods(methods);
                                                } catch (e) {
                                                    showToast('Lỗi khi tải payment methods', 'error');
                                                } finally {
                                                    setLoadingPaymentMethods(false);
                                                }
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        >
                                            Làm mới
                                        </button>
                                    </div>
                                </div>

                                {loadingPaymentMethods ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto mt-4">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-[#2a2a44]">
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">ID</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">User ID</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Provider</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Tên phương thức</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Trạng thái</th>
                                                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Mặc định</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedPaymentMethods.map((method: any) => (
                                                    <tr key={method.paymentMethodId} className="border-b border-[#2a2a44]/50 hover:bg-[#1a1a2d]">
                                                        <td className="py-3 px-4">{method.paymentMethodId}</td>
                                                        <td className="py-3 px-4">{method.userId}</td>
                                                        <td className="py-3 px-4">{method.provider}</td>
                                                        <td className="py-3 px-4">{method.methodName}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded text-xs ${method.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                {method.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {method.isDefault ? (
                                                                <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300">Default</span>
                                                            ) : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {totalRows === 0 && (
                                            <div className="text-center py-8 text-neutral-400">Không có phương thức thanh toán</div>
                                        )}
                                    </div>
                                )}

                                {renderPagination(
                                    currentPage,
                                    totalRows,
                                    paymentMethodPageSize,
                                    (page) => setPaymentMethodPage(page),
                                    (size) => {
                                        setPaymentMethodPageSize(size);
                                        setPaymentMethodPage(1);
                                    }
                                )}
                            </div>
                        </div>
                    );
                })()}
            </main>
        </div>
    );
};

export { DashboardAdmin as default };


